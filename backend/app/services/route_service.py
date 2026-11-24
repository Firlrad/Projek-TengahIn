"""
Route Service: Integrasi ke OSRM / Routing engine untuk perhitungan jarak dan waktu tempuh.
"""
import httpx
import os

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")

async def get_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float):
    # Placeholder service function
    pass
