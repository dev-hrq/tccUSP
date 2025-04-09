import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, messages

# Configuração do logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Isso fará os logs aparecerem no terminal
    ]
)

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL do frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os headers
)

# Incluir as rotas
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(messages.router, prefix="/api", tags=["messages"]) 