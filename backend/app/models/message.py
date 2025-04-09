from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class Message(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    sender_id: Optional[str] = None
    recipient_phone: str = Field(..., description="Número de telefone do destinatário")
    message: str = Field(..., description="Conteúdo da mensagem")
    event_date: str = Field(..., description="Data do evento no formato ISO")
    reminder_days: int = Field(..., description="Número de dias para lembrete")
    status: str = Field(default="Processando", description="Status da mensagem")
    created_at: Optional[str] = None

    @field_validator('recipient_phone')
    @classmethod
    def validate_phone(cls, v):
        # Remove todos os caracteres não numéricos
        numbers = ''.join(filter(str.isdigit, v))
        if len(numbers) < 10 or len(numbers) > 11:
            raise ValueError('O número de telefone deve ter entre 10 e 11 dígitos')
        return numbers

    @field_validator('reminder_days')
    @classmethod
    def validate_reminder_days(cls, v):
        if v < 0:
            raise ValueError('O número de dias para lembrete não pode ser negativo')
        return v

    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('A mensagem não pode estar vazia')
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "recipient_phone": "11999999999",
                "message": "Olá, esta é uma mensagem de teste",
                "event_date": "2024-04-10T00:00:00",
                "reminder_days": 1
            }
        }
    } 