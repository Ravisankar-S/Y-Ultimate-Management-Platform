from pydantic import BaseModel
from typing import Optional

class LeaderboardTeamOut(BaseModel):
    team_id: int
    team_name: str
    matches_played: int
    wins: int
    losses: int
    draws: int
    points: int
    goals_for: int
    goals_against: int
    goal_diff: int
    spirit_avg: Optional[float] = 0.0

    class Config:
        orm_mode = True