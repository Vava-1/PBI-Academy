"""AI Tutor chat WebSocket handler with streaming."""
import asyncio
import json
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.models.ai import AITutorSession
from app.services.ai.llm_client import LLMClient


async def tutor_chat_ws(websocket: WebSocket, session_id: str):
    """WebSocket for streaming AI tutor chat."""
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            user_message = message_data.get("message", "")
            
            # Get session
            from app.db.session import async_session
            async with async_session() as db:
                result = await db.execute(
                    select(AITutorSession)
                    .where(AITutorSession.id == session_id)
                )
                session = result.scalar_one_or_none()
                
                if not session:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Session not found"
                    })
                    continue
                
                # Add user message to history
                messages = session.message_history.get("messages", [])
                messages.append({
                    "role": "user",
                    "content": user_message,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            
            # Send acknowledgment
            await websocket.send_json({
                "type": "CHUNK",
                "content": "",
                "status": "processing"
            })
            
            # Call LLM with streaming simulation
            llm_client = LLMClient()
            
            system_prompt = """You are an expert AI tutor for Pacemaker Business Institute.
Provide helpful, accurate, and encouraging responses."""
            
            try:
                full_response = await llm_client.chat_completion(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        *[{"role": m["role"], "content": m["content"]} for m in messages[-5:]]
                    ],
                    temperature=0.7
                )
                
                # Simulate streaming by sending chunks
                words = full_response.split()
                chunk_size = 3
                
                for i in range(0, len(words), chunk_size):
                    chunk = " ".join(words[i:i+chunk_size])
                    await websocket.send_json({
                        "type": "CHUNK",
                        "content": chunk + " ",
                        "status": "streaming"
                    })
                    await asyncio.sleep(0.05)  # Simulate typing
                
                # Send completion
                await websocket.send_json({
                    "type": "COMPLETE",
                    "content": full_response,
                    "status": "complete"
                })
                
                # Save response to session
                async with async_session() as db:
                    result = await db.execute(
                        select(AITutorSession).where(AITutorSession.id == session_id)
                    )
                    session = result.scalar_one()
                    
                    messages.append({
                        "role": "assistant",
                        "content": full_response,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    session.message_history = {"messages": messages}
                    await db.commit()
                
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Error generating response: {str(e)}"
                })
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        try:
            await websocket.close()
        except:
            pass
