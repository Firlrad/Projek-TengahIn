import math
from typing import Any, Dict, List, Tuple
import httpx

OSRM_BASE_URL = "https://router.project-osrm.org"

# Pemetaan mode transportasi agar sesuai dengan profil OSRM
MODE_MAPPING = {
    "driving": "driving",
    "cycling": "cycling",
    "walking": "walking",
}


def _haversine_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Fallback jarak garis lurus (meter) jika server OSRM timeout/limit."""
    R = 6371000  # Radius bumi dalam meter
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _estimate_fallback_duration(distance_meters: float, mode: str = "driving") -> float:
    """Estimasi durasi (detik) berbasis kecepatan rata-rata jika OSRM gagal."""
    speeds_mps = {
        "driving": 8.33,  # ~30 km/jam (rata-rata dalam kota)
        "cycling": 4.16,  # ~15 km/jam
        "walking": 1.38,  # ~5 km/jam
    }
    speed = speeds_mps.get(mode, 8.33)
    # Faktor 1.3 untuk estimasi belokan jalan raya
    return (distance_meters * 1.3) / speed


class RouteService:
    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    async def get_route(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        mode: str = "driving",
    ) -> Dict[str, Any]:
        """
        Mengambil rute jalan raya riil dari OSRM.
        Mengembalikan: distance (meter), duration (detik), dan polyline [[lat, lng], ...].
        """
        profile = MODE_MAPPING.get(mode, "driving")
        # Perhatian: OSRM menggunakan format {lng},{lat} (longitude dulu!)
        url = (
            f"{OSRM_BASE_URL}/route/v1/{profile}/"
            f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
            "?overview=full&geometries=geojson"
        )

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                # GeoJSON mengembalikan [lng, lat], sedangkan Leaflet butuh [lat, lng]
                raw_coords = route["geometry"]["coordinates"]
                polyline = [[coord[1], coord[0]] for coord in raw_coords]

                return {
                    "distance": route["distance"],
                    "duration": route["duration"],
                    "polyline": polyline,
                }
        except Exception as e:
            print(f"[RouteService] OSRM get_route error, pakai fallback: {e}")

        # Fallback jika OSRM gagal dihubungi
        dist = _haversine_distance_meters(origin_lat, origin_lng, dest_lat, dest_lng)
        dur = _estimate_fallback_duration(dist, profile)
        return {
            "distance": dist,
            "duration": dur,
            "polyline": [[origin_lat, origin_lng], [dest_lat, dest_lng]],
        }

    async def get_table_matrix(
        self,
        coordinates_list: List[Tuple[float, float]],
        mode: str = "driving",
    ) -> List[List[float]]:
        """
        Mengambil matriks durasi perjalanan (detik) antar seluruh koordinat sekaligus.
        coordinates_list: [(lat, lng), ...]
        """
        profile = MODE_MAPPING.get(mode, "driving")
        coords_str = ";".join([f"{lng},{lat}" for lat, lng in coordinates_list])
        url = f"{OSRM_BASE_URL}/table/v1/{profile}/{coords_str}?annotations=duration"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

            if data.get("code") == "Ok" and data.get("durations"):
                return data["durations"]
        except Exception as e:
            print(f"[RouteService] OSRM get_table_matrix error, pakai fallback: {e}")

        # Fallback matriks durasi menggunakan Haversine
        n = len(coordinates_list)
        matrix = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = _haversine_distance_meters(
                        coordinates_list[i][0],
                        coordinates_list[i][1],
                        coordinates_list[j][0],
                        coordinates_list[j][1],
                    )
                    matrix[i][j] = _estimate_fallback_duration(dist, profile)
        return matrix

    async def get_durations_to_target(
        self,
        participants_coords: List[Tuple[float, float]],
        target_coord: Tuple[float, float],
        mode: str = "driving",
    ) -> List[float]:
        """
        Helper cepat (1x request OSRM Table) untuk menghitung durasi (detik)
        dari semua peserta ke 1 titik kandidat target.
        Cocok digunakan sebagai `route_calculator` pada Hill Climbing Firly.
        """
        profile = MODE_MAPPING.get(mode, "driving")
        all_coords = list(participants_coords) + [target_coord]
        coords_str = ";".join([f"{lng},{lat}" for lat, lng in all_coords])

        sources = ";".join(str(i) for i in range(len(participants_coords)))
        destination = str(len(participants_coords))

        url = (
            f"{OSRM_BASE_URL}/table/v1/{profile}/{coords_str}"
            f"?sources={sources}&destinations={destination}&annotations=duration"
        )

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

            if data.get("code") == "Ok" and data.get("durations"):
                # Format durations: [[dur_0], [dur_1], ...]
                return [
                    float(row[0]) if row[0] is not None else 9999.0
                    for row in data["durations"]
                ]
        except Exception as e:
            print(f"[RouteService] OSRM get_durations_to_target error, pakai fallback: {e}")

        # Fallback jika OSRM limit saat iterasi Hill Climbing
        durations = []
        for lat, lng in participants_coords:
            dist = _haversine_distance_meters(lat, lng, target_coord[0], target_coord[1])
            durations.append(_estimate_fallback_duration(dist, profile))
        return durations