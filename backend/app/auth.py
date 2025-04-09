from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from .database import users_collection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Por enquanto, estamos usando um token fake
    # Em produção, você deve implementar a verificação real do token
    if token != "fake_token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Por enquanto, retornamos um usuário fake
    # Em produção, você deve buscar o usuário real no banco de dados
    return {
        "id": "fake_user_id",
        "phone": "fake_phone"
    } 