import asyncio
from typing import List, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    MeetingPointRequest,
    MeetingPointResponse,
    OptimalPointResponse,
    PlaceRecommendation,
    RouteDetail,
)
from app.services.route_service import RouteService
from app.services.place_service import PlaceService
from app.ai.optimizer import optimize_meeting_point
from app.ai.scoring import rank_places

app = FastAPI(
    title="TengahIn Backend API",
    description="API Pencarian Titik Temu Adil (Fair Meeting Point) berbasis Hill Climbing & Minimax Fairness",
    version="1.0.0",
)

# Izinkan akses dari Frontend React (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # Memudahkan saat deployment nanti
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

route_service = RouteService()
place_service = PlaceService()


def _format_duration(seconds: float) -> str:
    minutes = max(1, round(seconds / 60))
    if minutes < 60:
        return f"{minutes} menit"
    hours, rem = divmod(minutes, 60)
    return f"{hours} jam {rem} menit" if rem else f"{hours} jam"


def _format_distance(meters: float) -> str:
    if meters < 1000:
        return f"{round(meters)} m"
    return f"{meters / 1000:.1f} km"


@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "TengahIn Backend API",
        "version": "1.0.0",
    }


@app.post("/api/find-meeting-point", response_model=MeetingPointResponse)
@app.post("/api/calculate-meeting-point", response_model=MeetingPointResponse)
async def find_meeting_point(request: MeetingPointRequest):
    try:
        participants_coords: List[Tuple[float, float]] = [
            (p.location.lat, p.location.lng) for p in request.participants
        ]
        mode = request.transport_mode or "driving"

        # 1. Siapkan fungsi async route_calculator yang fleksibel (support 1 atau 2 argumen)
        async def route_calculator(*args) -> List[float]:
            if len(args) == 2:
                # Jika Firly mengirim (lat, lng)
                if isinstance(args[0], (int, float)) and isinstance(args[1], (int, float)):
                    coords = participants_coords
                    target = (float(args[0]), float(args[1]))
                # Jika Firly mengirim (participants_coords, target_coord)
                else:
                    coords = args[0]
                    target = args[1]
            else:
                coords = participants_coords
                target = args[0]

            return await route_service.get_durations_to_target(
                participants_coords=coords,
                target_coord=target,
                mode=mode,
            )

        # 2. Jalankan AI Hill Climbing (Minimax Fairness) milik Firly
        opt_result = await optimize_meeting_point(participants_coords, route_calculator)

        # Ekstrak (lat, lng) dari berbagai kemungkinan format return dict/tuple
        if isinstance(opt_result, dict):
            if "lat" in opt_result and "lng" in opt_result:
                opt_lat, opt_lng = float(opt_result["lat"]), float(opt_result["lng"])
            elif "latitude" in opt_result and "longitude" in opt_result:
                opt_lat, opt_lng = float(opt_result["latitude"]), float(opt_result["longitude"])
            else:
                # Cek key umum yang berisi tuple/list (lat, lng) atau dict koordinat
                coord = (
                    opt_result.get("optimal_point")
                    or opt_result.get("optimal_coord")
                    or opt_result.get("best_point")
                    or opt_result.get("coordinates")
                    or opt_result.get("point")
                )
                if isinstance(coord, dict):
                    opt_lat = float(coord.get("lat") or coord.get("latitude"))
                    opt_lng = float(coord.get("lng") or coord.get("lon") or coord.get("longitude"))
                elif isinstance(coord, (list, tuple)) and len(coord) >= 2:
                    opt_lat, opt_lng = float(coord[0]), float(coord[1])
                else:
                    raise ValueError(f"Format dict optimizer tidak dikenali. Keys: {list(opt_result.keys())}")
        else:
            opt_lat, opt_lng = float(opt_result[0]), float(opt_result[1])

        # 3. Ambil rute jalan raya riil untuk tiap peserta secara paralel (concurrent)
        route_tasks = [
            route_service.get_route(
                origin_lat=p.location.lat,
                origin_lng=p.location.lng,
                dest_lat=opt_lat,
                dest_lng=opt_lng,
                mode=mode,
            )
            for p in request.participants
        ]
        raw_routes = await asyncio.gather(*route_tasks)

        participant_routes: List[RouteDetail] = []
        durations_minutes: List[float] = []

        for participant, r in zip(request.participants, raw_routes):
            dur_min = round(r["duration"] / 60, 1)
            dist_km = round(r["distance"] / 1000, 2)
            durations_minutes.append(dur_min)

            participant_routes.append(
                RouteDetail(
                    participant_id=participant.id,
                    participant_name=participant.name,
                    duration_minutes=dur_min,
                    duration_text=_format_duration(r["duration"]),
                    distance_km=dist_km,
                    distance_text=_format_distance(r["distance"]),
                    polyline=r["polyline"],
                )
            )

        # Hitung metrik keadilan dari rute riil
        disparity_min = round(max(durations_minutes) - min(durations_minutes), 1)
        fairness_score = round(max(0.0, min(100.0, 100.0 - (disparity_min * 3.0))), 1)

        # 4. Cari tempat kumpul terdekat via Overpass API
        raw_places = await place_service.search_nearby_places(
            lat=opt_lat,
            lng=opt_lng,
            radius=request.radius or 800,
            category=request.category or "cafe",
        )

        # 5. Rangking tempat menggunakan Weighted Scoring milik Firly (ambil top 5)
        ranked_places = rank_places(raw_places, request.preferences or {})
        top_places = ranked_places[:5]

        recommendations = [
            PlaceRecommendation(
                name=p["name"],
                lat=p["lat"],
                lng=p["lng"],
                distance_meters=p["distance_meters"],
                score=round(float(p.get("score", 0.0)), 1),
                category=p.get("category", request.category or "cafe"),
                address=p.get("address"),
                has_wifi=bool(p.get("has_wifi", False)),
                has_power_sockets=bool(p.get("has_power_sockets", False)),
                is_budget_friendly=bool(p.get("is_budget_friendly", False)),
                is_24_hours=bool(p.get("is_24_hours", False)),
            )
            for p in top_places
        ]

        optimal_name = (
            f"Area sekitar {recommendations[0].name}"
            if recommendations
            else "Titik Temu Optimal"
        )

        return MeetingPointResponse(
            optimal_point=OptimalPointResponse(
                name=optimal_name,
                lat=opt_lat,
                lng=opt_lng,
                fairness_score=fairness_score,
                time_disparity_minutes=disparity_min,
            ),
            participant_routes=participant_routes,
            recommendations=recommendations,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menghitung titik temu: {str(e)}")