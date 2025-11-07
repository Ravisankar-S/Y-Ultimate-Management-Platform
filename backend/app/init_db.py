import pkgutil
import importlib
from datetime import date, datetime, time

from sqlalchemy.exc import SQLAlchemyError
from app.db.session import engine, Base, SessionLocal
import app.models
from app.models.user import User, RoleEnum
from app.models.participant import Participant, ParticipantStatus, ParticipantType
from app.models.tournament import Tournament
from app.models.team import Team, TeamStatus
from app.models.team_member import TeamMember
from app.models.match import Match, MatchStatus
from app.models.spirit_score import SpiritScore
from app.models.session import Session as CoachingSession
from app.models.attendance import Attendance
from app.models.home_visit import HomeVisit
from app.models.lsas_assessment import LSASAssessment
from app.core.security import hash_password

print("🔧 Scanning models and creating database tables...")

# Import all models dynamically
for module_info in pkgutil.iter_modules(app.models.__path__):
    importlib.import_module(f"app.models.{module_info.name}")

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
except SQLAlchemyError as e:
    print("❌ Error creating tables:")
    print(e)
    exit(1)

# --- Seed data ---
print("🌱 Seeding demo data...")
db = SessionLocal()
try:
    # Clear existing data (for repeatable testing)
    db.query(SpiritScore).delete()
    db.query(Match).delete()
    db.query(TeamMember).delete()
    db.query(Team).delete()
    db.query(Tournament).delete()
    db.query(Participant).delete()
    db.query(User).delete()
    db.commit()

    # 👤 Users
    admin_user = User(
        username="admin",
        hashed_password=hash_password("admin"),
        role=RoleEnum.admin,
    )
    coach_user = User(
        username="coach1",
        hashed_password=hash_password("coach1"),
        role=RoleEnum.coach,
    )
    db.add_all([admin_user, coach_user])
    db.commit()

    # 👥 Participants
    coach_participant = Participant(
        first_name="John",
        last_name="Doe",
        participant_type=ParticipantType.coach,
        user_id=coach_user.id,
        gender="Male",
        current_status=ParticipantStatus.active,
    )
    db.add(coach_participant)
    db.commit()
    db.refresh(coach_participant)

    # Now that coach_participant has an ID, safely reference it
    player1 = Participant(
        first_name="Alice",
        last_name="Smith",
        participant_type=ParticipantType.player,
        gender="Female",
        school="Riverdale High",
        coach_id=coach_participant.id,
        current_status=ParticipantStatus.active,
    )

    player2 = Participant(
        first_name="Bob",
        last_name="Brown",
        participant_type=ParticipantType.player,
        gender="Male",
        school="Riverdale High",
        coach_id=coach_participant.id,
        current_status=ParticipantStatus.active,
    )

    db.add_all([player1, player2])
    db.commit()


    # 🏆 Tournament
    tournament = Tournament(
        title="Y-Ultimate Frisbee Championship",
        slug="yu-fc-2025",
        description="Regional frisbee tournament for demonstration.",
        start_date=date.today(),
        end_date=date.today(),
        location="Kerala Stadium",
        sponsor="OASIS",
        fields_json='["Field A", "Field B"]',
        banner_url="https://picsum.photos/800/200",
        is_published=True,
        created_by=admin_user.id,
    )
    db.add(tournament)
    db.commit()

    # 🏅 Teams
    team_a = Team(
        name="Sky Hawks",
        tournament_id=tournament.id,
        manager_participant_id=coach_participant.id,
        status=TeamStatus.approved,
    )
    team_b = Team(
        name="Disc Ninjas",
        tournament_id=tournament.id,
        manager_participant_id=coach_participant.id,
        status=TeamStatus.approved,
    )
    db.add_all([team_a, team_b])
    db.commit()

    # 👕 Team Members
    db.add_all([
        TeamMember(team_id=team_a.id, participant_id=player1.id, role="captain", jersey_number="7"),
        TeamMember(team_id=team_b.id, participant_id=player2.id, role="player", jersey_number="10")
    ])
    db.commit()

    # ⚽ Match
    match = Match(
        tournament_id=tournament.id,
        field_id="Field A",
        start_time=datetime.now(),
        end_time=datetime.now(),
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        score_a=10,
        score_b=8,
        status=MatchStatus.completed,
    )
    db.add(match)
    db.commit()

    # 💬 Spirit Scores
    db.add_all([
        SpiritScore(
            match_id=match.id,
            from_team_id=team_a.id,
            to_team_id=team_b.id,
            rules_knowledge=3,
            fouls_body_contact=2,
            fair_mindedness=3,
            positive_attitude=4,
            communication=3,
            total=15,
            submitted_by=player1.id,
        ),
        SpiritScore(
            match_id=match.id,
            from_team_id=team_b.id,
            to_team_id=team_a.id,
            rules_knowledge=2,
            fouls_body_contact=2,
            fair_mindedness=3,
            positive_attitude=3,
            communication=3,
            total=13,
            submitted_by=player2.id,
        ),
    ])
    db.commit()

    # 🧾 Session
    session = CoachingSession(
        program_id=1,
        coach_id=coach_participant.id,
        date=date.today(),
        location="Training Ground",
        start_time=time(9, 0),
        end_time=time(11, 0),
        notes="Morning drill session",
    )
    db.add(session)
    db.commit()

    # ✅ Attendance
    db.add_all([
        Attendance(participant_id=player1.id, session_id=session.id, date=date.today(), present=True, marked_by=coach_user.id),
        Attendance(participant_id=player2.id, session_id=session.id, date=date.today(), present=False, marked_by=coach_user.id),
    ])
    db.commit()

    # 🏡 Home Visit
    home_visit = HomeVisit(
        participant_id=player1.id,
        coach_id=coach_participant.id,
        visit_date=date.today(),
        notes="Met with player’s parents. Positive feedback.",
        photos_json='["https://picsum.photos/300"]'
    )
    db.add(home_visit)
    db.commit()

    # 🧠 LSAS
    lsas = LSASAssessment(
        participant_id=player1.id,
        assessor_id=coach_participant.id,
        date=date.today(),
        scores_json={"teamwork": 3.5, "focus": 4.0, "spirit": 3.8},
        total_score=11.3,
        notes="Good overall performance.",
    )
    db.add(lsas)
    db.commit()

    print("✅ Demo data seeded successfully!")

except SQLAlchemyError as e:
    print("❌ Error seeding demo data:")
    print(e)
    db.rollback()
finally:
    db.close()
