import asyncio
from app.core.redis import redis_client
from loguru import logger

GLOBAL_ANALYTICS_KEY = "analytics:global"
TOURNAMENT_ANALYTICS_KEY = "analytics:tournament:{}"


async def invalidate_global_analytics():
    """Clear the global analytics cache."""
    try:
        deleted = await redis_client.delete(GLOBAL_ANALYTICS_KEY)
        if deleted:
            logger.info("Cache invalidated: global analytics")
    except Exception as e:
        logger.warning(f"Failed to invalidate global analytics cache: {e}")


async def invalidate_tournament_analytics(tournament_id: int):
    """Clear analytics cache for a specific tournament."""
    try:
        key = TOURNAMENT_ANALYTICS_KEY.format(tournament_id)
        deleted = await redis_client.delete(key)
        if deleted:
            logger.info(f"Cache invalidated: tournament {tournament_id} analytics")
    except Exception as e:
        logger.warning(f"Failed to invalidate tournament {tournament_id} analytics cache: {e}")
