from pydantic import BaseModel, Field
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")

class Participant(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Nama peserta")
    location: Coordinates

class MeetingPointRequest(BaseModel):
    participants: List[Participant] = Field(..., min_length=2, description="Daftar peserta (minimal 2 orang)")
    category_preference: Optional[str] = Field("cafe", description="Kategori tempat kumpul: cafe, coworking, dll")
