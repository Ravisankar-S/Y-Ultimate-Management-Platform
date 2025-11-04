import redis.asyncio as redis
import json
from typing import Any

redis_client = redis.from_url("redis://localhost:6379", decode_responses=True)

async def publish(channel: str, message: dict[str, Any]):
    await redis_client.publish(channel, json.dumps(message))

async def subscribe(channel: str):
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)
    return pubsub