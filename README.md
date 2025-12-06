# Hackathon Sistema de Gestão de E-mails

## Ideia Geral do Sistema

O **Sistema de Gestão de E-mails** foi desenvolvido com o objetivo de organizar e gerenciar os e-mails enviados pelos colaboradores de uma empresa de forma eficiente. Antes da implementação do sistema, a gestão desses envios era feita manualmente, dificultando o acompanhamento, registro e análise das mensagens enviadas a clientes.

O sistema resolve esse problema capturando automaticamente os e-mails enviados para um endereço específico do sistema, registrando-os em uma **base de dados centralizada**. Além disso, permite que os colaboradores adicionem informações complementares, como **Estado** e **Município** relacionados ao envio, e oferece ferramentas de **análise e visualização** por meio de dashboards e relatórios. Para maior flexibilidade, também é possível realizar o **cadastro manual de e-mails**.

Com isso, o sistema proporciona:
- **Maior controle** sobre a comunicação corporativa;
- **Otimização de processos internos**;
- **Rastreamento e organização** de mensagens enviadas;
- **Suporte à tomada de decisão** baseada em dados.

---

## Backend

*# Backend - Sistema de Gerenciamento de Emails

Este é o serviço de backend para o Sistema de Gerenciamento de Emails. Ele foi construído em Python usando o framework Flask e se conecta ao Google Firestore como banco de dados.

## ✨ Tecnologias Utilizadas

- **[Python 3](https://www.python.org/)**: A linguagem de programação principal.
- **[Flask](https://flask.palletsprojects.com/)**: Um microframework web para construir a API RESTful.
- **[Flask-CORS](https://flask-cors.readthedocs.io/)**: Uma extensão do Flask para lidar com o Cross-Origin Resource Sharing (CORS), permitindo que o frontend acesse a API.
- **[Firebase Admin SDK for Python](https://firebase.google.com/docs/admin/setup)**: Usado para conectar e interagir de forma segura com o Google Firestore a partir do servidor.
- **[APScheduler](https://apscheduler.readthedocs.io/)**: (Inferido de `utils/scheduler`) Usado para agendar tarefas em segundo plano, como a sincronização periódica de emails.

## 📂 Estrutura do Projeto

O projeto segue uma estrutura modular para organizar a lógica da aplicação:

```plaintext
backend/
├── api/
│   ├── __init__.py
│   ├── dashboard.py    # Blueprint para os endpoints do dashboard
│   ├── emails.py       # Blueprint para os endpoints de emails
│   └── sync.py         # Blueprint para o endpoint de sincronização
│
├── models/
│   ├── __init__.py
│   ├── email.py        # Modelo de dados para a entidade Email
│   └── funcionario.py  # Modelo de dados para a entidade Funcionario
│
├── repositories/
│   ├── __init__.py
│   ├── email_repository.py      # Abstração do acesso a dados de Email no Firestore
│   └── funcionario_repository.py # Abstração do acesso a dados de Funcionario
│
├── services/
│   ├── __init__.py
│   ├── analytics_service.py # Lógica de negócio para o dashboard
│   ├── email_service.py     # Lógica de negócio para emails
│   └── firestore_client.py  # Utilitário para obter o cliente do Firestore
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

---

## Frontend

### Visão Geral

O frontend do Sistema de Gestão de E-mails foi desenvolvido com **React + TypeScript** utilizando **Vite** como ferramenta de build, com foco em desempenho, modularidade e experiência do usuário. O design e a composição visual são baseados em **Tailwind CSS** e em componentes reutilizáveis do **Shadcn/UI**, garantindo uma interface limpa, responsiva e consistente.

A aplicação comunica-se com o backend por meio de requisições HTTP autenticadas, permitindo que colaboradores e administradores realizem consultas, cadastros e análises de maneira ágil e segura.

---

## Instalação e Execução

Abaixo estão os passos necessários para instalar e executar o frontend localmente.

### 1. Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+**
- **npm** ou **yarn**

Verificar versões instaladas:

```sh
node -v
npm -v
2. Clonar o Repositório
sh
Copiar código
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO/frontend
3. Instalar Dependências
sh
Copiar código
npm install
ou

sh
Copiar código
yarn install
4. Variáveis de Ambiente
Crie um arquivo:

bash
Copiar código
.env
E configure:

env
Copiar código
VITE_API_URL=https://sua-api.com
Essa variável aponta para o backend Flask.

5. Rodar o Projeto
sh
Copiar código
npm run dev
A aplicação ficará disponível normalmente em:

arduino
Copiar código
http://localhost:5173
Rotas Protegidas (Protected Routes)
Para garantir que apenas usuários autenticados acessem áreas internas, o frontend utiliza um sistema robusto de rotas protegidas implementado com React Router, Context API e JWT.

Funcionamento Geral
O usuário realiza login.

O backend retorna um JWT válido.

O token é armazenado localmente (localStorage).

Todas as rotas protegidas verificam:

se o token existe,

se ainda está válido,

e se o usuário está autenticado no contexto.

Se qualquer condição falhar:

o usuário é redirecionado para /login.

Estrutura Central
O controle é implementado em um componente ProtectedRoute, por exemplo:

tsx
Copiar código
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
Uso nas Rotas
tsx
Copiar código
<Routes>
  <Route path="/login" element={<Login />} />
  
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/emails"
    element={
      <ProtectedRoute>
        <EmailList />
      </ProtectedRoute>
    }
  />
</Routes>
Benefícios da Implementação
Evita acesso não autorizado a telas internas.

Impede navegação manual via URL.

Garante consistência entre estado global e token.

Redireciona automaticamente após logout.

Previne problemas de segurança e vazamento de dados.

Principais Funcionalidades do Frontend
1. Autenticação
Login com validação em tempo real.

Armazenamento seguro do token.

Redirecionamento automático após autenticação.

2. Dashboard Analítico
Gráficos dinâmicos com Recharts.

Indicadores atualizados em tempo real.

Filtros por período, colaborador e localização.

3. Gestão de E-mails
Tabela com paginação, filtros, busca e ordenação.

Edição de Estado e Município.

Cadastro manual com validações (React Hook Form + Zod).

4. UI/UX
Layout responsivo (mobile-first).

Componentes consistentes com Shadcn/UI.

Feedback visual: skeletons, loading, erros, toasts.

Estrutura de Pastas
bash
Copiar código
src/
├─ components/        # Componentes reutilizáveis
├─ pages/             # Páginas principais do sistema
├─ services/          # Configuração do Axios e serviços de API
├─ contexts/          # Contextos globais (auth, theme, etc.)
├─ hooks/             # Hooks personalizados
├─ routes/            # Arquivos de rotas e Protected Routes
├─ types/             # Tipos utilizados em toda a aplicação
├─ utils/             # Funções auxiliares
└─ assets/            # Logos, ícones e imagens
Tecnologias Utilizadas
Tecnologia	Uso no Projeto
React	Base da interface
TypeScript	Tipagem estática e segurança
Vite	Build leve e rápido
Tailwind CSS	Estilização e layout
Shadcn/UI	Componentes reutilizáveis
React Router	Navegação e rotas protegidas
Axios	Requisições HTTP
Recharts	Gráficos e visualizações
React Hook Form	Formulários performáticos
Zod	Validação forte de esquemas

Considerações Finais
O frontend foi planejado para entregar eficiência, clareza e usabilidade. Com uma arquitetura modular e tecnologias modernas, o sistema mantém-se escalável, fácil de evoluir e alinhado às boas práticas recomendadas pelo mercado.




