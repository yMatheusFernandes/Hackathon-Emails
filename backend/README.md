# Backend - Sistema de Gerenciamento de Emails

Este é o serviço de backend para o Sistema de Gerenciamento de Emails. Ele foi construído em Python usando o framework Flask e se conecta ao Google Firestore como banco de dados.

## ✨ Tecnologias Utilizadas

- **[Python 3](https://www.python.org/)**: A linguagem de programação principal.
- **[Flask](https://flask.palletsprojects.com/)**: Um microframework web para construir a API RESTful.
- **[Flask-CORS](https://flask-cors.readthedocs.io/)**: Uma extensão do Flask para lidar com o Cross-Origin Resource Sharing (CORS), permitindo que o frontend acesse a API.
- **[Firebase Admin SDK for Python](https://firebase.google.com/docs/admin/setup)**: Usado para conectar e interagir de forma segura com o Google Firestore a partir do servidor.
- **[APScheduler](https://apscheduler.readthedocs.io/)**: (Inferido de `utils/scheduler`) Usado para agendar tarefas em segundo plano, como a sincronização periódica de emails.

## 📂 Estrutura do Projeto

O projeto segue uma estrutura modular para organizar a lógica da aplicação:

```
backend/
├── api/
│   ├── __init__.py
│   ├── dashboard.py    # Blueprint para os endpoints do dashboard
│   ├── emails.py       # Blueprint para os endpoints de emails
│   └── sync.py         # Blueprint para o endpoint de sincronização
│
├── services/
│   └── firestore_client.py # Lógica de conexão com o Firestore
│
├── utils/
│   └── scheduler.py      # Configuração do agendador de tarefas
│
├── app.py                # Ponto de entrada da aplicação Flask (Application Factory)
├── config.py             # Configurações da aplicação (ex: CORS, secrets)
├── requirements.txt      # Lista de dependências Python
└── credentials.json      # Chave de serviço do Firebase (NÃO versionar no Git)
```

## 🚀 Configuração e Execução

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento local.

### 1. Pré-requisitos

- Python 3.8 ou superior
- Uma conta do Google Cloud com um projeto Firebase e o Firestore ativado.

### 2. Instalação

a. **Clone o repositório** e navegue até a pasta do backend:
   ```bash
   git clone <url-do-repositorio>
   cd Hackathon-Emails/backend
   ```

b. **Crie e ative um ambiente virtual**:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

c. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

d. **Configure as credenciais do Firebase**:
   - Vá para o seu projeto no console do Firebase.
   - Navegue até "Configurações do projeto" > "Contas de serviço".
   - Clique em "Gerar nova chave privada" e baixe o arquivo JSON.
   - Renomeie o arquivo para `credentials.json` e coloque-o na raiz da pasta `backend/`.

   > **⚠️ Atenção**: Nunca adicione o arquivo `credentials.json` ao controle de versão (Git). Certifique-se de que ele está listado no seu arquivo `.gitignore`.

### 3. Executando a Aplicação

Com o ambiente virtual ativado e as dependências instaladas, inicie o servidor Flask:

```bash
python app.py
```

O servidor estará rodando em `http://0.0.0.0:5000`.

## Endpoints da API

A API expõe os seguintes endpoints:

- `GET /`
  - **Descrição**: Retorna uma mensagem de boas-vindas e a lista de endpoints disponíveis.
  - **Resposta**:
    ```json
    {
      "message": "Email Management System API",
      "version": "1.0.0",
      "endpoints": { ... }
    }
    ```

- `GET /health`
  - **Descrição**: Endpoint de verificação de saúde para monitoramento. Confirma se a aplicação está rodando e conectada ao Firestore.
  - **Resposta**: `{"status": "healthy", "firestore": "connected"}`

- **Endpoints de Emails**: `GET /api/emails`, `POST /api/emails`, etc. (gerenciados por `api/emails.py`)
- **Endpoint de Dashboard**: `GET /api/dashboard/stats` (gerenciado por `api/dashboard.py`)
- **Endpoint de Sincronização**: `POST /api/sync/trigger` (gerenciado por `api/sync.py`)