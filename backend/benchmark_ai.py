import asyncio
import math
from typing import List, Tuple
from app.ai.optimizer import optimize_meeting_point
from app.services.route_service import RouteService


def haversine_meters(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Menghitung jarak garis lurus antar dua koordinat (meter)."""
    R = 6_371_000.0
    lat1, lon1 = math.radians(p1[0]), math.radians(p1[1])
    lat2, lon2 = math.radians(p2[0]), math.radians(p2[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def surabaya_traffic_mock_calculator(
    participants: List[Tuple[float, float]],
    target: Tuple[float, float],
) -> List[float]:
    """
    Simulasi waktu tempuh (detik) dengan variasi kecepatan jalan di Surabaya
    (faktor kemacetan & belokan jalan raya ~1.3x jarak garis lurus).
    Nanti saat integrasi, fungsi ini tinggal diganti dengan OSRM milik Faiz.
    """
    # Variasi kecepatan rata-rata tiap peserta (km/jam): macet (18), sedang (28), lancar (38)
    speeds_kmh = [18.0, 32.0, 25.0, 38.0, 22.0]
    road_detour_factor = 1.3  # Jarak jalan raya rata-rata 1.3x jarak lurus

    durations = []
    for idx, p in enumerate(participants):
        dist_m = haversine_meters(p, target) * road_detour_factor
        speed_mps = (speeds_kmh[idx % len(speeds_kmh)] * 1000.0) / 3600.0
        durations.append(dist_m / speed_mps)
    return durations


# 5 Skenario Pengujian Nyata Surabaya (sesuai PROGRESS.md)
SCENARIOS = [
    {
        "nama": "Skenario 1 (Timur & Gubeng)",
        "peserta": [
            ("ITS Sukolilo", (-7.282356, 112.794925)),
            ("Unair Kampus B", (-7.272028, 112.758667)),
            ("UPN Veteran Rungkut", (-7.333721, 112.788325)),
        ],
    },
    {
        "nama": "Skenario 2 (Barat & Pusat)",
        "peserta": [
            ("Univ. Ciputra", (-7.285611, 112.631528)),
            ("Pakuwon Mall", (-7.289167, 112.675556)),
            ("Tunjungan Plaza", (-7.262222, 112.738889)),
        ],
    },
    {
        "nama": "Skenario 3 (Selatan & Utara)",
        "peserta": [
            ("UINSA Ahmad Yani", (-7.322222, 112.734167)),
            ("Royal Plaza", (-7.308889, 112.734722)),
            ("Jembatan Merah", (-7.236944, 112.737500)),
        ],
    },
    {
        "nama": "Skenario 4 (4 Orang Lintas Wilayah)",
        "peserta": [
            ("ITS Sukolilo", (-7.282356, 112.794925)),
            ("Univ. Ciputra", (-7.285611, 112.631528)),
            ("UINSA Ahmad Yani", (-7.322222, 112.734167)),
            ("Kenjeran", (-7.251944, 112.796389)),
        ],
    },
    {
        "nama": "Skenario 5 (5 Penjuru Surabaya)",
        "peserta": [
            ("ITS Sukolilo", (-7.282356, 112.794925)),
            ("Univ. Ciputra", (-7.285611, 112.631528)),
            ("UINSA Ahmad Yani", (-7.322222, 112.734167)),
            ("Kenjeran", (-7.251944, 112.796389)),
            ("Tunjungan Plaza", (-7.262222, 112.738889)),
        ],
    },
]


async def run_benchmark():
    route_service = RouteService()
    print("\n### Tabel Perbandingan Keadilan Waktu Tempuh (OSRM Riil): Centroid vs Hill Climbing\n")
    print("| Skenario Uji | Disparity Awal / Centroid (Menit) | Disparity Akhir / AI (Menit) | Pengurangan Ketimpangan | Iterasi | Koordinat Optimal (Lat, Lng) |")
    print("| :--- | :---: | :---: | :---: | :---: | :--- |")

    for sc in SCENARIOS:
        coords = [p[1] for p in sc["peserta"]]
        res = await optimize_meeting_point(
            participants_coords=coords,
            route_calculator=route_service.get_durations_to_target,
            max_iterations=15,
        )

        disp_awal = res["initial_metrics"]["disparity"] / 60.0
        disp_akhir = res["fairness_metrics"]["disparity"] / 60.0
        reduksi = ((disp_awal - disp_akhir) / disp_awal * 100.0) if disp_awal > 0 else 0.0
        opt = res["optimal_point"]

        print(
            f"| {sc['nama']} "
            f"| {disp_awal:.2f} mnt "
            f"| {disp_akhir:.2f} mnt "
            f"| **-{reduksi:.1f}%** "
            f"| {res['iterations']} "
            f"| `{opt['lat']:.5f}, {opt['lng']:.5f}` |"
        )

    print("\n*Catatan: Disparity = selisih waktu tempuh antara peserta terjauh dan terdekat.*\n")


if __name__ == "__main__":
    asyncio.run(run_benchmark())