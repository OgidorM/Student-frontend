# Advisor de Aprendizagem P2P - Frontend

Frontend do projeto Hackathon de Sistema de Aprendizagem P2P com integração IPFS.

## 🚀 Stack Tecnológica

- **Vite** - Build tool e dev server
- **React** - Framework UI
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **IPFS** - Sistema de armazenamento descentralizado

## 📁 Estrutura do Projeto

```
src/
├── api/
│   └── axiosClient.js          # Cliente Axios com interceptors
├── components/
│   ├── IPFSDownload.jsx        # Componente de download IPFS
│   └── ProtectedRoute.jsx      # Componente de rota protegida
├── context/
│   └── AuthContext.jsx         # Context de autenticação
├── pages/
│   ├── Login.jsx               # Página de login
│   ├── Dashboard.jsx           # Dashboard com estatísticas
│   └── Quiz.jsx                # Interface do quiz
└── App.jsx                     # Componente raiz com roteamento
```

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local`:

```env
VITE_API_BASE_URL=http://[IP_LIDER]:80/api
VITE_IPFS_GATEWAY_URL=http://[IP_LIDER]:8080
```

Substitua `[IP_LIDER]` pelo IP do servidor onde está o Nginx API Gateway.

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`

### 4. Build para Produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

## 🔐 Fluxo de Autenticação

1. **Login** (`/login`)
   - POST para `/api/auth/login`
   - Recebe JWT token
   - Token armazenado no localStorage
   - Redirecionamento para Dashboard

2. **Rotas Protegidas**
   - Verificação de token via AuthContext
   - Redirecionamento automático para `/login` se não autenticado

3. **Interceptor Axios**
   - Adiciona `Authorization: Bearer <token>` automaticamente
   - Trata erros 401 (token expirado)

## 📱 Funcionalidades por Página

### Login (`/login`)
- Formulário de autenticação
- Validação de credenciais
- Feedback de erros

### Dashboard (`/dashboard`)
- **Estatísticas do Usuário**: GET `/api/stats`
  - Quizzes completados
  - Taxa de acerto
  - Materiais acessados
  - Pontos totais
- **Lista de Tópicos**: Navegação para quizzes por tópico
  - Matemática, Física, Química, Biologia, História, Geografia

### Quiz (`/quiz/:topic`)
- **Iniciar Quiz**: GET `/api/quiz/start?topic=<topic>`
- **Submeter Resposta**: POST `/api/quiz/submit`
  - Body: `{ questionId, answer, topic }`
- **Feedback**:
  - ✅ Resposta correta: avança para próxima pergunta
  - ❌ Resposta errada: 
    - Mostra explicação do LLM
    - Exibe CID de material recomendado
    - Botão de download IPFS
- **Resultado Final**: Pontuação e percentual de acerto

## 🌐 Comunicação com API

### Cliente Axios (`axiosClient.js`)

```javascript
// Base URL configurada via variável de ambiente
baseURL: import.meta.env.VITE_API_BASE_URL

// Interceptor de Request
- Adiciona JWT token (exceto em /auth/login)

// Interceptor de Response
- Trata erro 401 → logout + redirect para /login
```

### Endpoints Utilizados

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/login` | Login de usuário | Não |
| GET | `/stats` | Estatísticas do usuário | Sim |
| GET | `/quiz/start?topic=X` | Iniciar quiz | Sim |
| POST | `/quiz/submit` | Submeter resposta | Sim |

## 📥 Download IPFS

O componente `IPFSDownload` acessa diretamente o IPFS Gateway:

```javascript
URL: ${VITE_IPFS_GATEWAY_URL}/ipfs/${cid}
```

**Nota**: Ignora o API Gateway para downloads de conteúdo IPFS.

## 🎨 Estilização

- Design responsivo
- Gradientes modernos (roxo/azul)
- Cards com sombras e animações hover
- Feedback visual para respostas corretas/incorretas

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificar código
```

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se de que o Nginx API Gateway está configurado com os headers CORS corretos.

### Token Expirado
O sistema automaticamente redireciona para `/login` quando detecta token inválido.

### IPFS Gateway Inacessível
Verifique se `VITE_IPFS_GATEWAY_URL` está correto e o serviço IPFS está rodando.

## 📝 Formato de Resposta da API

### POST `/auth/login` - Sucesso
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET `/stats` - Sucesso
```json
{
  "quizzesCompleted": 5,
  "accuracy": 85,
  "materialsAccessed": 12,
  "totalPoints": 450
}
```

### GET `/quiz/start` - Sucesso
```json
{
  "id": "q123",
  "question": "Qual é a fórmula da água?",
  "options": ["H2O", "CO2", "O2", "N2"]
}
```

### POST `/quiz/submit` - Resposta Incorreta
```json
{
  "correct": false,
  "explanation": "A água é composta por dois átomos de hidrogénio...",
  "suggestedCid": "QmXxx...abc",
  "quizCompleted": false
}
```

### POST `/quiz/submit` - Resposta Correta
```json
{
  "correct": true,
  "correctAnswer": "H2O",
  "quizCompleted": false
}
```

## 📄 Licença

Projeto desenvolvido para Hackathon - Advisor de Aprendizagem P2P

