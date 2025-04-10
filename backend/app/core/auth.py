from fastapi import HTTPException, status, Request
import uuid

# Armazenamento de sessões em memória (em produção, use Redis ou banco de dados)
sessions = {}

def get_current_user(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado"
        )
    return sessions[session_id]

def create_session(user_data: dict) -> str:
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": str(user_data["_id"]),
        "first_name": user_data["first_name"],
        "phone": user_data["phone"]
    }
    return session_id

def delete_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id] 