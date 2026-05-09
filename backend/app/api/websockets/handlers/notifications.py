"""Notifications WebSocket handler."""
import asyncio
import json
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect

from app.cache.redis_client import RedisCache


class ConnectionManager:
    """Manage WebSocket connections."""
    
    def __init__(self):
        self.connections: dict = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.connections:
            del self.connections[user_id]
    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.connections:
            await self.connections[user_id].send_json(message)


manager = ConnectionManager()


async def notifications_ws(websocket: WebSocket):
    """WebSocket for real-time notifications."""
    # Authenticate and get user_id from token
    # For now, simplified
    user_id = None
    
    try:
        # Wait for authentication message
        auth_data = await websocket.receive_text()
        auth_json = json.loads(auth_data)
        
        # Validate token
        from app.core.security import decode_token
        token = auth_json.get("token", "")
        payload = decode_token(token)
        
        if payload:
            user_id = payload.get("sub")
            await manager.connect(user_id, websocket)
            
            await websocket.send_json({
                "type": "connected",
                "message": "Notifications channel established"
            })
        else:
            await websocket.send_json({
                "type": "error",
                "message": "Authentication failed"
            })
            await websocket.close()
            return
        
        # Keep connection alive and listen for Redis pub/sub
        redis = RedisCache()
        
        while True:
            try:
                # Check for messages with timeout
                message = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                
                # Handle ping/pong
                data = json.loads(message)
                if data.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
    
    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(user_id)
    except Exception as e:
        if user_id:
            manager.disconnect(user_id)
        try:
            await websocket.close()
        except:
            pass
