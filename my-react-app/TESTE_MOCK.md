# 🧪 Guia de Teste com Dados Mock

## ✅ Dados Mock Implementados!

A aplicação agora pode funcionar **completamente offline** com dados falsos para testes.

## 🔧 Como Ativar/Desativar Mock Data

Edite o arquivo `.env.local`:

```env
# Para usar dados MOCK (teste local)
VITE_USE_MOCK_DATA=true

# Para usar API REAL (produção)
VITE_USE_MOCK_DATA=false
```

## 👥 Credenciais de Teste

Quando o modo mock está ativo, use estas credenciais:

| Username | Password |
|----------|----------|
| `aluno1` | `senha123` |
| `teste`  | `teste` |

## 📊 Dados Mock Disponíveis

### Estatísticas (Dashboard)
```json
{
  "quizzesCompleted": 12,
  "accuracy": 78,
  "materialsAccessed": 25,
  "totalPoints": 1850
}
```

### Tópicos com Perguntas
- **Matemática** (3 perguntas)
- **Física** (2 perguntas)
- **Química** (2 perguntas)
- **Biologia** (2 perguntas)
- **História** (2 perguntas)
- **Geografia** (2 perguntas)

### Exemplos de Perguntas

**Matemática:**
- "Qual é o resultado de 2 + 2?" → Resposta: "4"
- "Qual é a raiz quadrada de 16?" → Resposta: "4"
- "Quanto é 15% de 200?" → Resposta: "30"

**Física:**
- "Qual é a velocidade da luz no vácuo?" → Resposta: "300.000 km/s"
- "Qual é a unidade de força no SI?" → Resposta: "Newton"

**Química:**
- "Qual é a fórmula química da água?" → Resposta: "H2O"
- "Qual é o número atómico do Carbono?" → Resposta: "6"

## 🎯 Fluxo de Teste

### 1. Login
```
http://localhost:5173/login
```
- Digite: `aluno1` / `senha123`
- Verá aviso: "🧪 Modo de Teste Ativo"

### 2. Dashboard
```
http://localhost:5173/dashboard
```
- Badge "🧪 Modo Teste" no header
- Estatísticas mock carregam automaticamente
- 6 tópicos disponíveis

### 3. Quiz
```
http://localhost:5173/quiz/math
```
- Ícone 🧪 ao lado da pontuação
- Responda perguntas
- **Resposta errada**: Vê explicação + CID de material
- **Resposta correta**: Avança para próxima

### 4. Testar Respostas Erradas
Para ver o fluxo completo com explicação e CID:
- Em Matemática: responda "3" para "2 + 2 = ?"
- Verá: Explicação + CID + Link de download IPFS

## 🎨 Indicadores Visuais

Quando em modo mock, você verá:
- ✅ **Login**: Banner amarelo "🧪 Modo de Teste Ativo"
- ✅ **Dashboard**: Badge "🧪 Modo Teste" no header
- ✅ **Quiz**: Ícone 🧪 ao lado da pontuação

## 📁 Arquivos Mock

```
src/api/
├── mockData.js         # Dados falsos (perguntas, stats, users)
└── mockApiClient.js    # Simulador de API com delays realistas
```

## 🔄 Comportamento da API Mock

### Delays Simulados
- Login: 500ms
- Stats: 400ms
- Iniciar Quiz: 600ms
- Submeter Resposta: 500ms

### Gestão de Sessões
- Cada tópico tem sua própria sessão
- Perguntas são mostradas em sequência
- Score é mantido durante a sessão
- Reinicia automaticamente ao completar

## 🧪 Testar Diferentes Cenários

### Cenário 1: Login com Sucesso
```
Username: aluno1
Password: senha123
✅ Redireciona para /dashboard
```

### Cenário 2: Login com Falha
```
Username: invalido
Password: errado
❌ Mensagem: "Credenciais inválidas"
```

### Cenário 3: Quiz Completo
1. Escolha "Matemática"
2. Responda as 3 perguntas
3. Vê resultado final com pontuação

### Cenário 4: Resposta Errada
1. Escolha qualquer tópico
2. Responda errado propositadamente
3. Vê: Explicação do LLM
4. Vê: CID do material sugerido
5. Botão de download IPFS aparece

## 🚀 Comandos

```bash
# Executar com mock data
npm run dev

# Build (funciona com mock ou real)
npm run build

# Preview do build
npm run preview
```

## 🔀 Alternar Entre Mock e Real

### Durante Desenvolvimento
Edite `.env.local` e reinicie o servidor:
```bash
# Ctrl+C para parar
npm run dev
```

### Em Produção
Configure a variável de ambiente antes do build:
```bash
# Build com mock (para demo)
VITE_USE_MOCK_DATA=true npm run build

# Build com API real
VITE_USE_MOCK_DATA=false npm run build
```

## 📝 Notas Importantes

1. **CIDs São Falsos**: Os CIDs nos dados mock são exemplos do IPFS, mas não apontam para conteúdo real
2. **Sessões Não Persistem**: Ao recarregar a página, o progresso do quiz é perdido
3. **Token é Mock**: O token JWT é apenas uma string simulada
4. **Delay Realista**: Delays foram adicionados para simular latência de rede

## 🐛 Troubleshooting

### Mock não está ativo?
1. Verifique `.env.local`: `VITE_USE_MOCK_DATA=true`
2. Reinicie o servidor (`npm run dev`)
3. Limpe o cache do navegador

### Não vê credenciais de teste?
O banner amarelo só aparece se `VITE_USE_MOCK_DATA=true`

### Quiz não carrega perguntas?
Verifique o tópico - todos os 6 tópicos têm perguntas mock

## ✅ Checklist de Teste

- [ ] Login com `aluno1/senha123` funciona
- [ ] Dashboard mostra estatísticas
- [ ] Badge "🧪 Modo Teste" está visível
- [ ] Consegue iniciar quiz de Matemática
- [ ] Resposta correta avança para próxima pergunta
- [ ] Resposta errada mostra explicação + CID
- [ ] Link de download IPFS aparece
- [ ] Quiz completo mostra resultado final
- [ ] Logout funciona e redireciona para login

---

**Modo Mock ATIVO** ✅  
**Pronto para testar sem backend!** 🎉

