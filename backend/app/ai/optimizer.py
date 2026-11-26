import math
import numpy as np
from typing import List, Tuple, Callable, Awaitable, Dict, Any

# Konstanta konversi meter ke derajat koordinat (aproksimasi di sekitar ekuator/Indonesia)
METERS_PER_DEGREE_LAT = 111_320.0


def calculate_centroid(coordinates: List[Tuple[float, float]]) -> Tuple[float, float]:
    """
    Menghitung titik tengah geometris (Centroid) dari daftar koordinat (lat, lng)
    sebagai titik awal (seed) untuk algoritma Hill Climbing.
    """
    if not coordinates:
        raise ValueError("Daftar koordinat peserta tidak boleh kosong.")

    coords_array = np.array(coordinates, dtype=float)
    mean_lat = float(np.mean(coords_array[:, 0]))
    mean_lng = float(np.mean(coords_array[:, 1]))
    return (mean_lat, mean_lng)


def calculate_fairness_cost(travel_times_seconds: List[float], alpha: float = 0.5) -> Dict[str, float]:
    """
    Menghitung fungsi objektif Minimax Fairness.
    Semakin kecil nilai cost, semakin adil titik temu tersebut.
    
    Rumus: Cost = Disparity + alpha * Standard_Deviation
    """
    if not travel_times_seconds:
        return {"cost": float("inf"), "disparity": 0.0, "std_dev": 0.0}

    times = np.array(travel_times_seconds, dtype=float)
    disparity = float(np.max(times) - np.min(times))
    std_dev = float(np.std(times))
    cost = disparity + (alpha * std_dev)

    return {
        "cost": cost,
        "disparity": disparity,
        "std_dev": std_dev,
        "max_time": float(np.max(times)),
        "min_time": float(np.min(times)),
        "avg_time": float(np.mean(times)),
    }


def generate_neighbors(lat: float, lng: float, step_meters: float) -> List[Tuple[float, float]]:
    """
    Menghasilkan 8 titik kandidat tetangga di 8 arah mata angin
    (Utara, Timur Laut, Timur, Tenggara, Selatan, Barat Daya, Barat, Barat Laut).
    """
    d_lat = step_meters / METERS_PER_DEGREE_LAT
    d_lng = step_meters / (METERS_PER_DEGREE_LAT * math.cos(math.radians(lat)))

    directions = [
        (1, 0),    # Utara
        (1, 1),    # Timur Laut
        (0, 1),    # Timur
        (-1, 1),   # Tenggara
        (-1, 0),   # Selatan
        (-1, -1),  # Barat Daya
        (0, -1),   # Barat
        (1, -1),   # Barat Laut
    ]

    neighbors = []
    for dy, dx in directions:
        # Normalisasi langkah diagonal agar jaraknya tetap konsisten ~step_meters
        scale = 1.0 / math.sqrt(2) if (dy != 0 and dx != 0) else 1.0
        new_lat = lat + (dy * d_lat * scale)
        new_lng = lng + (dx * d_lng * scale)
        neighbors.append((new_lat, new_lng))

    return neighbors


async def optimize_meeting_point(
    participants_coords: List[Tuple[float, float]],
    route_calculator: Callable[[List[Tuple[float, float]], Tuple[float, float]], Awaitable[List[float]]],
    max_iterations: int = 20,
    step_sizes_meters: List[float] = None,
    convergence_threshold_sec: float = 60.0,
    alpha: float = 0.5,
) -> Dict[str, Any]:
    """
    Algoritma Hill Climbing untuk mencari titik temu optimal dengan Minimax Fairness.

    Args:
        participants_coords: List tuple (lat, lng) masing-masing peserta.
        route_calculator: Fungsi async(participants, target_point) -> List[durasi_detik].
        max_iterations: Batas maksimal iterasi Hill Climbing.
        step_sizes_meters: Daftar ukuran langkah pencarian (default: [500.0, 250.0]).
        convergence_threshold_sec: Berhenti jika selisih waktu sudah di bawah ambang ini (< 1 menit).
        alpha: Bobot standar deviasi pada fungsi objektif.
    """
    if step_sizes_meters is None:
        step_sizes_meters = [500.0, 250.0]

    # 1. Mulai dari titik awal Centroid
    current_point = calculate_centroid(participants_coords)
    current_times = await route_calculator(participants_coords, current_point)
    current_metrics = calculate_fairness_cost(current_times, alpha=alpha)

    initial_point = current_point
    initial_metrics = current_metrics.copy()
    iterations_done = 0

    # 2. Iterasi Hill Climbing
    for iteration in range(1, max_iterations + 1):
        iterations_done = iteration

        # Cek apakah sudah cukup adil (disparity < 1 menit)
        if current_metrics["disparity"] < convergence_threshold_sec:
            break

        best_neighbor = None
        best_neighbor_metrics = current_metrics
        best_neighbor_times = current_times

        # Eksplorasi tetangga pada setiap radius step_size
        for step_m in step_sizes_meters:
            neighbors = generate_neighbors(current_point[0], current_point[1], step_m)
            for candidate in neighbors:
                candidate_times = await route_calculator(participants_coords, candidate)
                candidate_metrics = calculate_fairness_cost(candidate_times, alpha=alpha)

                if candidate_metrics["cost"] < best_neighbor_metrics["cost"]:
                    best_neighbor = candidate
                    best_neighbor_metrics = candidate_metrics
                    best_neighbor_times = candidate_times

        # Jika ada tetangga yang lebih baik, pindah ke titik tersebut
        if best_neighbor is not None:
            current_point = best_neighbor
            current_metrics = best_neighbor_metrics
            current_times = best_neighbor_times
        else:
            # Local optimum tercapai (tidak ada tetangga yang lebih baik)
            break

    return {
        "optimal_point": {"lat": current_point[0], "lng": current_point[1]},
        "initial_centroid": {"lat": initial_point[0], "lng": initial_point[1]},
        "fairness_metrics": current_metrics,
        "initial_metrics": initial_metrics,
        "travel_times_seconds": current_times,
        "iterations": iterations_done,
    }


# ==============================================================================
# BLOK PENGUJIAN LOKAL (Bisa dijalankan langsung tanpa menunggu Backend Faiz)
# ==============================================================================
if __name__ == "__main__":
    import asyncio

    def haversine_meters(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
        R = 6_371_000.0
        lat1, lon1 = math.radians(p1[0]), math.radians(p1[1])
        lat2, lon2 = math.radians(p2[0]), math.radians(p2[1])
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    async def mock_route_calculator(participants: List[Tuple[float, float]], target: Tuple[float, float]) -> List[float]:
        """Simulasi waktu tempuh (detik) dengan asumsi kecepatan berbeda tiap rute (efek kemacetan)."""
        # Contoh: peserta ke-1 kena macet (20 km/jam), peserta lain lancar (35 km/jam)
        speeds_mps = [20_000 / 3600, 35_000 / 3600, 30_000 / 3600]
        durations = []
        for idx, p in enumerate(participants):
            dist = haversine_meters(p, target)
            speed = speeds_mps[idx % len(speeds_mps)]
            durations.append(dist / speed)
        return durations

    async def main():
        # Skenario 1 Surabaya: ITS Sukolilo, Unair Kampus B, UPN Veteran Rungkut
        skenario_1 = [
            (-7.282356, 112.794925),  # ITS Sukolilo
            (-7.272028, 112.758667),  # Unair Kampus B
            (-7.333721, 112.788325),  # UPN Veteran Jatim
        ]

        result = await optimize_meeting_point(skenario_1, mock_route_calculator)
        print("=== HASIL UJI HILL CLIMBING (SKENARIO 1 SURABAYA) ===")
        print(f"Centroid Awal   : {result['initial_centroid']}")
        print(f"Disparity Awal  : {result['initial_metrics']['disparity'] / 60:.2f} menit")
        print("-" * 50)
        print(f"Titik Optimal   : {result['optimal_point']}")
        print(f"Disparity Akhir : {result['fairness_metrics']['disparity'] / 60:.2f} menit")
        print(f"Total Iterasi   : {result['iterations']}")

    asyncio.run(main())
