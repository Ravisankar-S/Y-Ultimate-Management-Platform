from app.models.user import User, RoleEnum
from app.models.participant import Participant, ParticipantStatus, ParticipantType

# This ensures both models are loaded before relationships are configured
__all__ = [
    "User",
    "RoleEnum", 
    "Participant",
    "ParticipantStatus",
    "ParticipantType"
]