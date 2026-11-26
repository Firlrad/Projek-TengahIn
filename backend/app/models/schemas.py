from typing import Dict, List, Optional, Union
from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float = Field(..., description="Latitude koordinat")
    lng: float = Field(..., description="Longitude koordinat")


class Participant(BaseModel):
    id: str
    name: str
    location: Coordinates
    address: Optional[str] = None


class MeetingPointRequest(BaseModel):
    participants: List[Participant] = Field(..., min_length=2)
    transport_mode: Optional[str] = "driving"  # driving, cycling, walking
    category: Optional[str] = "cafe"           # cafe, coworking, library, restaurant
    radius: Optional[int] = 800                # radius pencarian dalam meter
    preferences: Optional[Union[List[str], Dict[str, bool]]] = None


class OptimalPointResponse(BaseModel):
    name: str
    lat: float
    lng: float
    fairness_score: float = Field(..., description="Skor keadilan 0-100")
    time_disparity_minutes: float = Field(..., description="Selisih waktu tempuh terjauh & terdekat (menit)")


class RouteDetail(BaseModel):
    participant_id: str
    participant_name: str
    duration_minutes: float
    duration_text: str
    distance_km: float
    distance_text: str
    polyline: List[List[float]] = Field(..., description="Daftar koordinat [lat, lng] untuk digambar di Leaflet")


class PlaceRecommendation(BaseModel):
    name: str
    lat: float
    lng: float
    distance_meters: float
    score: float
    category: Optional[str] = "cafe"
    address: Optional[str] = None
    has_wifi: bool = False
    has_power_sockets: bool = False
    is_budget_friendly: bool = False
    is_24_hours: bool = False


class MeetingPointResponse(BaseModel):
    optimal_point: OptimalPointResponse
    participant_routes: List[RouteDetail]
    recommendations: List[PlaceRecommendation]