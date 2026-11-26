from typing import List, Dict, Any, Optional


def _calculate_distance_score(distance_meters: float, max_radius: float = 800.0) -> float:
    """
    Menghitung skor jarak (0 - 100).
    Semakin dekat dengan titik temu optimal (0 meter), skor mendekati 100.
    Jika jarak >= max_radius, skor bernilai 0.
    """
    if distance_meters <= 0:
        return 100.0
    if distance_meters >= max_radius:
        return 0.0
    return round((1.0 - (distance_meters / max_radius)) * 100.0, 2)


def _calculate_boolean_feature_score(has_feature: Optional[bool], is_preferred: bool) -> float:
    """
    Menghitung skor fitur fasilitas (colokan, wifi, ramah kantong, buka 24 jam).
    - Jika fitur tersedia (True): 100
    - Jika data tidak diketahui dari OSM (None): 40 (skor netral agar tidak langsung tereliminasi)
    - Jika dipastikan tidak ada (False): 0
    """
    if has_feature is True:
        return 100.0
    if has_feature is None:
        return 40.0 if is_preferred else 50.0
    return 0.0


def rank_places(
    places: List[Dict[str, Any]],
    preferences: Optional[Dict[str, bool]] = None,
    max_radius: float = 800.0,
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Merangking daftar tempat (cafe/coworking/library) menggunakan Weighted Scoring.

    Args:
        places: Daftar dictionary tempat dari Overpass API. Contoh struktur:
            {
                "name": "Kopi Kenangan Kertajaya",
                "lat": -7.278,
                "lng": 112.765,
                "distance_meters": 150,
                "has_wifi": True,
                "has_power_sockets": True,
                "is_budget_friendly": True,
                "is_24_hours": False
            }
        preferences: Filter preferensi dari frontend Amas. Contoh:
            {
                "wifi": True,
                "power_sockets": True,
                "budget_friendly": True,
                "open_24h": False
            }
        max_radius: Radius pencarian maksimal dalam meter (default 800m).
        top_n: Jumlah rekomendasi teratas yang dikembalikan (default 5).

    Returns:
        List tempat yang sudah diurutkan dari skor tertinggi beserta field 'ai_score'.
    """
    if not places:
        return []

    prefs = preferences or {}
    pref_wifi = prefs.get("wifi", False)
    pref_sockets = prefs.get("power_sockets", False)
    pref_budget = prefs.get("budget_friendly", False)
    pref_24h = prefs.get("open_24h", False)

    # Bobot dasar (Base Weights) — total bobot akan dinormalisasi otomatis ke 1.0
    # Jika pengguna mencentang preferensi tertentu, bobot kriteria tersebut dinaikkan
    raw_weights = {
        "distance": 0.40,
        "power_sockets": 0.25 if pref_sockets else 0.15,
        "wifi": 0.25 if pref_wifi else 0.15,
        "budget": 0.20 if pref_budget else 0.15,
        "open_24h": 0.20 if pref_24h else 0.05,
    }

    total_weight = sum(raw_weights.values())
    weights = {k: v / total_weight for k, v in raw_weights.items()}

    scored_places = []
    for place in places:
        dist = float(place.get("distance_meters", max_radius))

        s_distance = _calculate_distance_score(dist, max_radius=max_radius)
        s_sockets = _calculate_boolean_feature_score(place.get("has_power_sockets"), pref_sockets)
        s_wifi = _calculate_boolean_feature_score(place.get("has_wifi"), pref_wifi)
        s_budget = _calculate_boolean_feature_score(place.get("is_budget_friendly"), pref_budget)
        s_24h = _calculate_boolean_feature_score(place.get("is_24_hours"), pref_24h)

        final_score = (
            weights["distance"] * s_distance
            + weights["power_sockets"] * s_sockets
            + weights["wifi"] * s_wifi
            + weights["budget"] * s_budget
            + weights["open_24h"] * s_24h
        )

        # Salin data tempat dan tambahkan hasil skor AI
        enriched_place = place.copy()
        enriched_place["ai_score"] = round(final_score, 2)
        enriched_place["score_breakdown"] = {
            "distance": s_distance,
            "power_sockets": s_sockets,
            "wifi": s_wifi,
            "budget": s_budget,
            "open_24h": s_24h,
        }
        scored_places.append(enriched_place)

    # Urutkan dari ai_score tertinggi; jika seri, pilih yang jaraknya paling dekat
    scored_places.sort(key=lambda x: (-x["ai_score"], x.get("distance_meters", max_radius)))

    return scored_places[:top_n]


# ==============================================================================
# BLOK PENGUJIAN LOKAL (Testing mandiri tanpa menunggu Overpass API Faiz)
# ==============================================================================
if __name__ == "__main__":
    mock_places = [
        {
            "name": "Warkop Dekat Tapi Tanpa WiFi",
            "distance_meters": 80,
            "has_wifi": False,
            "has_power_sockets": False,
            "is_budget_friendly": True,
            "is_24_hours": True,
        },
        {
            "name": "Kafe Nugas Kertajaya (Lengkap)",
            "distance_meters": 220,
            "has_wifi": True,
            "has_power_sockets": True,
            "is_budget_friendly": True,
            "is_24_hours": False,
        },
        {
            "name": "Coworking Space Premium",
            "distance_meters": 300,
            "has_wifi": True,
            "has_power_sockets": True,
            "is_budget_friendly": False,
            "is_24_hours": False,
        },
        {
            "name": "Kopi Pojok (Data OSM Minim)",
            "distance_meters": 150,
            "has_wifi": None,
            "has_power_sockets": None,
            "is_budget_friendly": None,
            "is_24_hours": None,
        },
    ]

    # Simulasi: Mahasiswa mencentang filter WiFi kencang, Colokan banyak, dan Ramah kantong
    user_prefs = {
        "wifi": True,
        "power_sockets": True,
        "budget_friendly": True,
        "open_24h": False,
    }

    ranked = rank_places(mock_places, preferences=user_prefs, top_n=3)

    print("=== HASIL PERINGKAT TEMPAT (WEIGHTED SCORING) ===")
    for idx, p in enumerate(ranked, start=1):
        print(f"{idx}. {p['name']} — Skor AI: {p['ai_score']}/100 (Jarak: {p['distance_meters']}m)")