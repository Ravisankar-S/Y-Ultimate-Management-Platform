# Y-Ultimate-Management-Platform
A unified, offline-first platform for Tournament and Coaching Programme management, built for the T4GC x OASIS Hackathon. 

## Judge Walkthrough

The steps below let a hackathon judge clone the project, provision the database tier, run the FastAPI backend, open the Swagger UI, and exercise the core tournament workflow in about two minutes. Follow the order shown so every dependency is ready before you hit the API.

### 1. Prerequisites

1. Install **Git**, **Docker Desktop**, and **Python 3.11+** on your machine.
2. Ensure Docker Desktop is running and that the `docker compose` CLI is available in your shell.
3. (Windows) Open a new **Command Prompt** window for the commands that follow.

### 2. Clone the repository

```cmd
git clone https://github.com/Ravisankar-S/Y-Ultimate-Management-Platform.git
cd Y-Ultimate-Management-Platform
```

### 3. Start the data services (PostgreSQL, pgAdmin, Redis)

```cmd
docker compose up -d db pgadmin redis
docker compose ps
```

Wait until `yultimate-db`, `yultimate-pgadmin`, and `yultimate-redis` show a `healthy` status.

### 4. Configure PostgreSQL through pgAdmin (runs in Docker)

1. Browse to `http://localhost:5050`.
2. Sign in with `admin@admin.com` / `admin`.
3. Create a new server registration:
	 - **General ▸ Name:** `YUltimate Local`
	 - **Connection ▸ Host name/address:** `db`
	 - **Port:** `5432`
	 - **Maintenance database:** `yultimate`
	 - **Username:** `postgres`
	 - **Password:** `postgres` (check “Save Password”).
4. After connecting, leave pgAdmin open for quick schema inspection if needed.

### 5. Create the backend virtual environment and dependencies

```cmd
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 6. Provide environment variables

Copy the template and fill in real values:

```cmd
copy .env.example .env
```

Open `backend/.env` and set:

- `DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/yultimate`
- `JWT_SECRET=` (generate a strong secret via `python -c "import secrets; print(secrets.token_urlsafe(32))"` and paste the output)
- `ACCESS_TOKEN_EXPIRE_MINUTES=1440`

Keep this terminal activated for all backend commands. If you close it later, reactivate with `cd backend` followed by `.\.venv\Scripts\activate`.

### 7. IMPORTANT – run the initialization scripts before starting the server

These scripts build your schema and create the demo admin account. **Do not skip this step.** Run them from the `backend` directory with your virtual environment activated.

```cmd
python -m app.init_db
python -m app.db.seed_admin
```

Expected output: table creation confirmations and `Admin user created successfully! Username: admin | Password: admin`. If you rerun, the scripts simply report the resources already exist.

### 8. Launch the FastAPI backend with Uvicorn

Open a second terminal (keep the first one for future scripts), then:

```cmd
cd Y-Ultimate-Management-Platform\backend
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

You should see Uvicorn logs indicating the server is live on `http://127.0.0.1:8000`.

### 9. Reach the Swagger UI

Open `http://127.0.0.1:8000/docs` in your browser. This interface exposes every REST endpoint and uses the OAuth2 password flow—click **Authorize** (top-right) and sign in with `admin` / `admin` (seeded above) to unlock protected routes.

### 10. Two-minute Swagger demo script

1. **Authorize Swagger using OAuth2 password flow**
	 - Click the green **Authorize** button at the top-right of Swagger (UI matches the attached screenshot).
	 - Enter `admin` for **username** and `admin` for **password** (leave `client_id` and `client_secret` blank) and press **Authorize**, then **Close**. This step only succeeds after you run `python -m app.db.seed_admin`.

2. **(Optional) Validate the login endpoint**
	 - Expand `POST /auth/login`, choose “Try it out”, then set the same credentials.
	 - Execute to confirm the credentials work and inspect the returned `access_token`. Swagger continues to use your username/password authorization, so copying the token is optional unless you plan to test with external clients.

3. **Create a tournament** (`POST /tournaments/`)
	 - Body example:
		 ```json
		 {
			 "title": "OASIS Cup 2025",
			 "slug": "oasis-cup-2025",
			 "description": "Showcase tournament for demo",
			 "start_date": "2025-12-01T09:00:00Z",
			 "end_date": "2025-12-01T18:00:00Z",
			 "location": "Community Stadium",
			 "sponsor": "T4GC",
			 "fields_json": {"main_field": "A"},
			 "banner_url": null,
			 "is_published": true
		 }
		 ```
	 - Execute and note the returned `id` (e.g., `1`).

4. **Add two participants** (`POST /participants/` twice)
	 - Example body:
		 ```json
		 {
			 "first_name": "Jordan",
			 "last_name": "Sky",
			 "gender": "non-binary",
			 "dob": "2001-07-12",
			 "participant_type": "player"
		 }
		 ```
	 - Record the generated participant IDs (e.g., `1` and `2`).

5. **Register teams in the tournament** (`POST /tournaments/{id}/teams/`)
	 - Use the tournament ID from step 3.
	 - Body example for Team A:
		 ```json
		 {
			 "name": "Lightning",
			 "tournament_id": 1,
			 "manager_participant_id": 1
		 }
		 ```
	 - Repeat for Team B (`Thunder`, `manager_participant_id`: `2`). Capture the created team IDs.

6. **Schedule a match** (`POST /matches/`)
	 - Example payload:
		 ```json
		 {
			 "tournament_id": 1,
			 "team_a_id": 1,
			 "team_b_id": 2,
			 "field_id": "Field-1",
			 "start_time": "2025-12-01T10:00:00Z"
		 }
		 ```
	 - Note the returned match `id` (e.g., `1`).

7. **Open a WebSocket listener** before changing the score
	 - In a browser tab (DevTools console) run:
		 ```javascript
		 const socket = new WebSocket('ws://127.0.0.1:8000/ws/matches/1');
		 socket.onmessage = (event) => console.log('Live update:', event.data);
		 ```
	 - Replace the `1` in the URL with the match ID from step 6 if it differs, and keep the console visible to watch live Redis broadcasts.

8. **Patch the match score** (`PATCH /matches/{id}/score`)
	 - Use the match ID from step 6.
	 - Example body:
		 ```json
		 {
			 "score_a": 3,
			 "score_b": 1,
			 "status": "ongoing"
		 }
		 ```
	 - Execute and observe the WebSocket console showing the live update.

9. **Submit a spirit score** (`POST /spirit/`)
	 - Example payload:
		 ```json
		 {
			 "match_id": 1,
			 "from_team_id": 1,
			 "to_team_id": 2,
			 "rules_knowledge": 3,
			 "fouls_body_contact": 2,
			 "fair_mindedness": 3,
			 "positive_attitude": 4,
			 "communication": 3,
			 "comments": "Great spirit all around",
			 "submitted_by": 1
		 }
		 ```
	 - The WebSocket console now shows a `spirit_update` payload demonstrating synchronous broadcasting.

### 11. Shut down and clean up

When finished, stop Uvicorn with `Ctrl+C`, then deactivate the virtual environment (`deactivate`). Finally, bring the containers down:

```cmd
docker compose down
```

Your Postgres volume persists between runs. To start again, repeat steps 3, 5 (activation only), 8, and 9. Remember to rerun `python -m app.init_db` and `python -m app.db.seed_admin` if you ever rebuild from an empty database.

Due to a teammate health setback we finished this sprint as a one-dev pit crew; as a newcomer I wasn’t able to land the frontend in time, so we’re showcasing the backend infrastructure as-is.
