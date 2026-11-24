"""
Optimizer Module: Algoritma penentuan titik temu adil (Geometric Median, MiniMax, Weighted Travel Time).
"""
import numpy as np

def calculate_centroid(coordinates: list[tuple[float, float]]) -> tuple[float, float]:
    """Menghitung centroid sederhana (rata-rata lat & lng)."""
    coords = np.array(coordinates)
    centroid = np.mean(coords, axis=0)
    return float(centroid[0]), float(centroid[1])
