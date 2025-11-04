from app.models.user import User, RoleEnum
from app.models.participant import Participant, ParticipantStatus, ParticipantType
from app.db.session import Base
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.match import Match
from app.models.spirit_score import SpiritScore
# This ensures both models are loaded before relationships are configured
__all__ = [
    "User",
    "RoleEnum", 
    "Participant",
    "ParticipantStatus",
    "ParticipantType",
    "Tournament",
    "Team",
    "TeamMember",
    "Match",
    "SpiritScore"
]