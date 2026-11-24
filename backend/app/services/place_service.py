"""
Place Service: Integrasi ke Overpass API / OSM untuk rekomendasi tempat pertemuan (cafe, coworking space, dll).
"""
import httpx
import os

OVERPASS_API_URL = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")

async def search_nearby_places(lat: float, lng: float, radius: int = 1000, amenity: str = "cafe"):
    # Placeholder service function
    pass
