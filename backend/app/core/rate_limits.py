"""
Rate Limiting Configuration for Y-Ultimate Management Platform

This module defines reusable rate limiters for different endpoint categories.
Import these into your routers to apply consistent rate limiting.

Usage Example in router:
    from app.core.rate_limits import auth_limiter, frequent_action_limiter
    from fastapi import Depends
    
    @router.post("/login", dependencies=[Depends(auth_limiter)])
    async def login(...):
        ...
"""

from fastapi_limiter.depends import RateLimiter


# ============================================================================
# 🔒 RATE LIMITER DEFINITIONS
# ============================================================================

# Auth & Login endpoints - Strict limit to prevent brute force
# 5 requests per minute
auth_limiter = RateLimiter(times=5, seconds=60)

# Public/Anonymous endpoints - Light limit for general access
# Examples: /health, /leaderboard, /analytics/overview, /media/gallery
# 30 requests per minute
public_limiter = RateLimiter(times=30, seconds=60)

# Frequent user actions - Moderate limit for authenticated users
# Examples: /matches/{id}/score, /spirit/, /tournaments/{id}/teams/
# 20 requests per minute
frequent_action_limiter = RateLimiter(times=20, seconds=60)

# Heavy/Resource-intensive queries - Strict limit
# Examples: /export, /analytics/tournaments/{id}, large data exports
# 3 requests per minute
heavy_query_limiter = RateLimiter(times=3, seconds=60)

# Media upload - Moderate limit to prevent abuse
# 10 requests per minute
media_upload_limiter = RateLimiter(times=10, seconds=60)


# ============================================================================
# 📋 RATE LIMITING GUIDE
# ============================================================================
"""
HOW TO APPLY RATE LIMITS TO YOUR ENDPOINTS:

1. Import the appropriate limiter in your router file:
   from app.core.rate_limits import auth_limiter, frequent_action_limiter

2. Add as a dependency to your endpoint:
   @router.post("/login", dependencies=[Depends(auth_limiter)])

3. Rate limit categories by endpoint type:

   ┌─────────────────────────────────────────────────────────────────┐
   │ CATEGORY              │ LIMITER                 │ RATE           │
   ├───────────────────────┼─────────────────────────┼────────────────┤
   │ Auth/Login            │ auth_limiter            │ 5 req/min      │
   │ Public/Anonymous      │ public_limiter          │ 30 req/min     │
   │ Frequent Actions      │ frequent_action_limiter │ 20 req/min     │
   │ Heavy Queries         │ heavy_query_limiter     │ 3 req/min      │
   │ Media Uploads         │ media_upload_limiter    │ 10 req/min     │
   │ Admin-only/Internal   │ NO LIMITER              │ Unlimited      │
   │ WebSockets            │ NO LIMITER              │ Unlimited      │
   └─────────────────────────────────────────────────────────────────┘

4. Example implementations:

   AUTH ROUTER (app/routers/auth.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import auth_limiter
   from fastapi import Depends
   
   @router.post("/login", dependencies=[Depends(auth_limiter)])
   async def login(form_data: OAuth2PasswordRequestForm = Depends()):
       # Login logic...
   
   @router.post("/register", dependencies=[Depends(auth_limiter)])
   async def register(user: UserCreate, db: Session = Depends(get_db)):
       # Registration logic...


   HEALTH ROUTER (app/routers/health.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import public_limiter
   from fastapi import Depends
   
   @router.get("/", dependencies=[Depends(public_limiter)])
   async def health_check():
       return {"status": "healthy"}


   MATCH ROUTER (app/routers/match.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import frequent_action_limiter
   from fastapi import Depends
   
   @router.patch("/{match_id}/score", 
                 response_model=MatchOut,
                 dependencies=[Depends(frequent_action_limiter)])
   async def update_score(match_id: int, score_data: MatchScoreUpdate):
       # Live scoring logic...


   EXPORT ROUTER (app/routers/export.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import heavy_query_limiter
   from fastapi import Depends
   
   @router.get("/{tournament_id}/export",
               response_class=StreamingResponse,
               dependencies=[Depends(heavy_query_limiter)])
   async def export_tournament(tournament_id: int):
       # Heavy export logic...


   ANALYTICS ROUTER (app/routers/analytics.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import public_limiter, heavy_query_limiter
   from fastapi import Depends
   
   # Light analytics - public access
   @router.get("/overview", dependencies=[Depends(public_limiter)])
   async def get_overview():
       return {"stats": "..."}
   
   # Detailed analytics - heavy query
   @router.get("/tournaments/{tournament_id}",
               dependencies=[Depends(heavy_query_limiter)])
   async def get_tournament_analytics(tournament_id: int):
       # Complex aggregation logic...


   SPIRIT SCORE ROUTER (app/routers/spirit_score.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import frequent_action_limiter
   from fastapi import Depends
   
   @router.post("/", 
                response_model=SpiritScoreOut,
                dependencies=[Depends(frequent_action_limiter)])
   async def submit_spirit_score(payload: SpiritScoreCreate):
       # Spirit scoring logic...


   LEADERBOARD ROUTER (app/routers/leaderboard.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import public_limiter
   from fastapi import Depends
   
   @router.get("/{tournament_id}/leaderboard",
               dependencies=[Depends(public_limiter)])
   async def get_leaderboard(tournament_id: int):
       # Leaderboard logic...


   MEDIA ROUTER (app/routers/media.py):
   ────────────────────────────────────────────────────────────────
   from app.core.rate_limits import media_upload_limiter, public_limiter
   from fastapi import Depends
   
   # Upload - moderate limit
   @router.post("/tournaments/{tournament_id}/upload",
                dependencies=[Depends(media_upload_limiter)])
   async def upload_media(tournament_id: int, file: UploadFile):
       # Upload logic...
   
   # Gallery view - public access
   @router.get("/tournaments/{tournament_id}/gallery",
               dependencies=[Depends(public_limiter)])
   async def get_gallery(tournament_id: int):
       # Gallery logic...


   WEBSOCKET ROUTER (app/routers/ws.py):
   ────────────────────────────────────────────────────────────────
   # NO RATE LIMITING for WebSocket endpoints
   # Real-time communication should not be rate limited
   
   @router.websocket("/matches/{match_id}")
   async def websocket_match_updates(websocket: WebSocket, match_id: int):
       # WebSocket logic...


5. ADMIN-ONLY ENDPOINTS:
   If an endpoint already requires admin authentication (via require_admin 
   or require_roles("admin")), you may skip rate limiting as these are 
   inherently protected by authentication.

6. TESTING RATE LIMITS:
   - Hit an endpoint repeatedly within the time window
   - After exceeding the limit, you'll get: HTTP 429 Too Many Requests
   - Response body: {"detail": "Rate limit exceeded"}

7. MONITORING:
   Check the logs for rate limit hits:
   - Loguru will log every request with status code
   - 429 status codes indicate rate limit violations
   - Use: grep "429" logs/app.log

8. CUSTOMIZING LIMITS:
   To create custom limits for specific endpoints:
   
   custom_limiter = RateLimiter(times=10, seconds=30)  # 10 req per 30 seconds
   
   @router.get("/custom", dependencies=[Depends(custom_limiter)])
   async def custom_endpoint():
       ...
"""
