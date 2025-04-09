from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
from ..models.message import Message
from ..database import get_database
from ..auth import get_current_user
from bson import ObjectId
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/messages", response_model=Message)
async def create_message(message: Message, current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Recebendo mensagem: {message.model_dump()}")
        logger.info(f"Usuário atual: {current_user}")
        
        db = get_database()
        message_dict = message.model_dump()
        message_dict["sender_id"] = current_user["id"]
        message_dict["created_at"] = datetime.utcnow().isoformat()
        
        # Garantir que event_date seja uma string ISO
        if isinstance(message_dict["event_date"], datetime):
            message_dict["event_date"] = message_dict["event_date"].isoformat()
        
        logger.info(f"Mensagem processada: {message_dict}")
        
        result = await db.messages.insert_one(message_dict)
        message_dict["_id"] = str(result.inserted_id)
        
        logger.info(f"Mensagem salva com sucesso: {message_dict}")
        return Message(**message_dict)
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/messages", response_model=List[Message])
async def get_messages(current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Buscando mensagens para usuário: {current_user['id']}")
        db = get_database()
        messages = await db.messages.find({"sender_id": current_user["id"]}).to_list(length=100)
        
        # Converter os campos datetime para string ISO
        for msg in messages:
            if isinstance(msg.get("event_date"), datetime):
                msg["event_date"] = msg["event_date"].isoformat()
            if isinstance(msg.get("created_at"), datetime):
                msg["created_at"] = msg["created_at"].isoformat()
        
        logger.info(f"Retornando {len(messages)} mensagens")
        return [Message(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erro ao buscar mensagens: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 