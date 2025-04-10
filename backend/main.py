import logging
from fastapi import FastAPI, Depends, HTTPException, status, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
import os
from dotenv import load_dotenv
from rabbitmq_config import publish_message
from mongodb_config import create_user, verify_user
from app.models.message import Message
from app.routes import auth, messages
from app.core.auth import create_session, delete_session

load_dotenv()

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

app = FastAPI(title="Sistema de Mensagens Futuras")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/login")
async def login(response: Response, phone: str = Form(...), password: str = Form(...)):
    user = verify_user(phone, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    # Criar uma nova sessão
    session_id = create_session(user)
    
    # Definir o cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Em produção, defina como True
        samesite="lax"
    )
    
    return {
        "message": "Login realizado com sucesso",
        "user": {
            "id": str(user["_id"]),
            "first_name": user["first_name"],
            "phone": user["phone"]
        }
    }

@app.post("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id:
        delete_session(session_id)
    response.delete_cookie("session_id")
    return {"message": "Logout realizado com sucesso"}

@app.post("/register")
async def register(
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...)
):
    try:
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "phone": phone,
            "password": password
        }
        result = create_user(user_data)
        return {"message": "Usuário criado com sucesso", "id": str(result.inserted_id)}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

# Incluir as rotas de mensagens
app.include_router(messages.router, prefix="/api", tags=["messages"])

@app.get("/")
async def root():
    return {"message": "API de Mensagens Futuras"} 