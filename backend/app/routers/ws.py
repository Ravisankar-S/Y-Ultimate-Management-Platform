import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.redis import subscribe 
from app.core.redis import redis_client

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/matches/{match_id}")
async def websocket_match_updates(websocket: WebSocket, match_id: int):
    """
    Real-time WebSocket endpoint for live match updates.
    Subscribes to Redis channel: live:match:{match_id}
    """
    await websocket.accept()
    channel = f"live:match:{match_id}"

    pubsub = await subscribe(channel)  # ✅ use the helper to create and subscribe
    print(f"✅ WebSocket connected to {channel}")

    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=5.0)
            if message:
                data = message["data"]
                # since you use decode_responses=True, no need for .decode()
                await websocket.send_text(data)
            await asyncio.sleep(0.2)  # avoids blocking the event loop

    except WebSocketDisconnect:
        print(f"❌ WebSocket disconnected from {channel}")
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()

@router.websocket("/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: int):
    """
    Real-time WebSocket endpoint for user notifications.
    Subscribes to Redis channel: notifications:user:{user_id}
    """
    await websocket.accept()
    channel = f"notify:user:{user_id}"

    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)

    print(f"✅ WebSocket connected to {channel}")

    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=5.0)
            if message:
                data = message["data"]
                if isinstance(data, bytes):
                    data = data.decode("utf-8")
                await websocket.send_text(data)
            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        print(f"🔕 WS disconnected from {channel}")
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()