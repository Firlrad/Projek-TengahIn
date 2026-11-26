import math
from typing import Any, Dict, List
import httpx

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"

CATEGORY_OSM_TAGS = {
    "cafe": '["amenity"="cafe"]',
    "restaurant": '["amenity"="restaurant"]',
    "library": '["amenity"="library"]',
    "coworking": '["amenity"="coworking_space"]',
}


def _haversine_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return round(2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


def _parse_address(tags: Dict[str, Any]) -> str:
    parts = [
        tags.get("addr:street"),
        tags.get("addr:housenumber"),
        tags.get("addr:suburb") or tags.get("addr:city"),
    ]
    address = ", ".join(p for p in parts if p)
    return address if address else "Alamat sekitar titik temu"


class PlaceService:
    def __init__(self, timeout: float = 10.0):
        self.timeout = timeout

    async def _search_nominatim_fallback(
        self,
        lat: float,
        lng: float,
        radius: int,
        category: str,
    ) -> List[Dict[str, Any]]:
        """Cadangan pencarian POI asli OpenStreetMap via Nominatim jika Overpass 502/kosong."""
        # Konversi radius meter ke derajat koordinat (minimal 1.5 km agar hasil selalu ada)
        effective_radius = max(radius, 1500)
        delta = effective_radius / 111000.0
        viewbox = f"{lng - delta},{lat + delta},{lng + delta},{lat - delta}"

        params = {
            "q": category,
            "format": "json",
            "limit": 10,
            "viewbox": viewbox,
            "bounded": 1,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    NOMINATIM_SEARCH_URL,
                    params=params,
                    headers={"User-Agent": "TengahIn-Backend/1.0"},
                )
                response.raise_for_status()
                results = response.json()
        except Exception as e:
            print(f"[PlaceService] Nominatim fallback error: {e}")
            return []

        places: List[Dict[str, Any]] = []
        seen_names = set()

        for item in results:
            display_name = item.get("display_name", "")
            name = item.get("name") or display_name.split(",")[0].strip()
            if not name or name in seen_names:
                continue

            p_lat = float(item["lat"])
            p_lng = float(item["lon"])
            seen_names.add(name)

            name_lower = name.lower()
            is_budget = any(k in name_lower for k in ("warkop", "kopi", "warung", "angkringan"))

            places.append(
                {
                    "name": name,
                    "lat": p_lat,
                    "lng": p_lng,
                    "distance_meters": _haversine_distance_meters(lat, lng, p_lat, p_lng),
                    "category": category,
                    "address": display_name,
                    "has_wifi": True,  # Default estimasi untuk kafe/coworking
                    "has_power_sockets": True,
                    "is_budget_friendly": is_budget,
                    "is_24_hours": False,
                }
            )

        places.sort(key=lambda x: x["distance_meters"])
        return places

    async def search_nearby_places(
        self,
        lat: float,
        lng: float,
        radius: int = 800,
        category: str = "cafe",
    ) -> List[Dict[str, Any]]:
        """
        Mencari POI di sekitar (lat, lng) menggunakan Overpass API.
        Jika Overpass gagal/kosong, otomatis beralih ke Nominatim API.
        """
        osm_filter = CATEGORY_OSM_TAGS.get(category.lower(), '["amenity"="cafe"]')

        overpass_query = f"""
        [out:json][timeout:10];
        (
          node{osm_filter}(around:{radius},{lat},{lng});
          way{osm_filter}(around:{radius},{lat},{lng});
        );
        out center 20;
        """

        data = None
        for url in OVERPASS_URLS:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        url,
                        data={"data": overpass_query},
                        headers={"User-Agent": "TengahIn-Backend/1.0"},
                    )
                    response.raise_for_status()
                    data = response.json()
                    break
            except Exception as e:
                print(f"[PlaceService] Gagal di {url}: {e}")

        places: List[Dict[str, Any]] = []
        seen_names = set()

        if data:
            for element in data.get("elements", []):
                tags = element.get("tags", {})
                name = tags.get("name")
                if not name or name in seen_names:
                    continue

                p_lat = element.get("lat") or element.get("center", {}).get("lat")
                p_lng = element.get("lon") or element.get("center", {}).get("lon")
                if p_lat is None or p_lng is None:
                    continue

                seen_names.add(name)
                distance_m = _haversine_distance_meters(lat, lng, p_lat, p_lng)

                internet = str(tags.get("internet_access", "")).lower()
                has_wifi = internet in ("wlan", "wifi", "yes", "free")
                has_power_sockets = any(
                    k.startswith("socket") or k == "power_supply" for k in tags.keys()
                )
                opening_hours = str(tags.get("opening_hours", "")).lower()
                is_24_hours = "24/7" in opening_hours or "24 jam" in opening_hours
                name_lower = name.lower()
                is_budget_friendly = (
                    tags.get("price") in ("$", "low", "cheap")
                    or any(k in name_lower for k in ("warkop", "kopi", "warung", "angkringan"))
                )

                places.append(
                    {
                        "name": name,
                        "lat": float(p_lat),
                        "lng": float(p_lng),
                        "distance_meters": distance_m,
                        "category": category,
                        "address": _parse_address(tags),
                        "has_wifi": has_wifi,
                        "has_power_sockets": has_power_sockets,
                        "is_budget_friendly": is_budget_friendly,
                        "is_24_hours": is_24_hours,
                    }
                )

        # Jika Overpass gagal atau hasil kosong, gunakan Nominatim sebagai cadangan
        if not places:
            print("[PlaceService] Overpass kosong/gagal, beralih ke Nominatim fallback...")
            places = await self._search_nominatim_fallback(lat, lng, radius, category)

        places.sort(key=lambda x: x["distance_meters"])
        return places