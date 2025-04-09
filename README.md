# Sistema de Mensagens Futuras

Sistema para agendamento e envio de mensagens futuras, com integração entre frontend React, backend FastAPI, MongoDB e RabbitMQ.

## Débitos Técnicos

### Autenticação
- A autenticação atual está usando um token fake para simular o usuário logado
- Em produção, é necessário implementar:
  - Autenticação real com JWT
  - Validação de tokens
  - Refresh tokens
  - Proteção de rotas
  - Gerenciamento de sessões
  - Logout adequado

## Funcionalidades

- Cadastro e autenticação de usuários
- Agendamento de mensagens para envio futuro
- Sistema de lembretes configuráveis
- Interface web responsiva
- Armazenamento seguro de dados
- Processamento assíncrono de mensagens

## Requisitos

- Docker e Docker Compose
- Node.js (v14 ou superior)
- Python 3.12
- Git

## Estrutura do Projeto

```
mensagens-futuras/
├── backend/              # API FastAPI
│   ├── main.py          # Rotas e lógica principal
│   ├── mongodb_config.py # Configuração do MongoDB
│   ├── rabbitmq_config.py # Configuração do RabbitMQ
│   └── requirements.txt  # Dependências Python
├── frontend/            # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   └── App.tsx     # Componente principal
│   └── package.json    # Dependências Node.js
└── docker-compose.yml   # Configuração dos serviços
```

## Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: FastAPI, Python
- **Banco de Dados**: MongoDB
- **Message Broker**: RabbitMQ
- **Containerização**: Docker

## Como Executar

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/mensagens-futuras.git
cd mensagens-futuras
```

2. Inicie os serviços com Docker Compose:
```bash
docker-compose up -d
```

3. Configure o backend:
```bash
cd backend
python -m venv venv;
source venv/bin/activate ; # No Windows: venv\Scripts\activate
pip install -r requirements.txt;
uvicorn main:app --reload;
```

4. Configure o frontend:
```bash
cd frontend
npm install
npm start
```

5. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação da API: http://localhost:8000/docs
- RabbitMQ Management: http://localhost:15672 (usuário: guest, senha: guest)

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com:

```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

## Segurança

- Senhas são armazenadas com hash bcrypt
- Autenticação via token JWT
- CORS configurado para segurança
- Validação de dados com Pydantic

## Próximos Passos

- [ ] Implementar testes automatizados
- [ ] Adicionar sistema de notificações por email
- [ ] Melhorar interface de usuário
- [ ] Adicionar suporte a múltiplos idiomas

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 