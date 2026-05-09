"""WebSocket router."""
from fastapi import APIRouter

from app.api.websockets.handlers import exam_timer, tutor_chat, notifications

ws_router = APIRouter()

ws_router.add_api_websocket_route("/exam/{attempt_id}/timer", exam_timer.exam_timer_ws)
ws_router.add_api_websocket_route("/tutor/{session_id}", tutor_chat.tutor_chat_ws)
ws_router.add_api_websocket_route("/notifications", notifications.notifications_ws)
