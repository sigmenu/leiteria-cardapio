# Cardápio Digital — Sistema Multi-Tenant para Restaurantes

Sistema completo de cardápio digital que permite múltiplos restaurantes criarem e gerenciarem seus próprios cardápios digitais com painel administrativo.

## 🚀 Funcionalidades

- **Multi-tenant**: Cada restaurante tem seu próprio cardápio independente
- **Painel Admin Completo**: Gestão de categorias, subcategorias e itens
- **Multi-idiomas**: Suporte para PT, EN e ES
- **Opcionais/Extras**: Items com variações de preço selecionáveis
- **Upload de Imagens**: Para logo, banner e produtos
- **Horários de Funcionamento**: Por categoria com indicador de aberto/fechado
- **Design Responsivo**: Otimizado para mobile e desktop
- **Busca Inteligente**: Sistema de filtros e pesquisa
- **QR Code**: Fácil compartilhamento do cardápio

## 🛠 Tecnologias

- **Backend:** Node.js + Express + SQLite
- **Frontend:** React + Vite + Tailwind CSS  
- **Autenticação:** JWT
- **Upload:** Multer

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação Local

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/cardapio-digital.git
cd cardapio-digital
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar o .env com suas configurações
npm start
```
O backend rodará em `http://localhost:3001`

### 3. Frontend
```bash
cd ../frontend
npm install
npm run dev
```
O frontend rodará em `http://localhost:5173`

### 4. Acessar o Sistema

#### Criar primeiro restaurante:
1. Acesse `http://localhost:5173/admin/register`
2. Preencha os dados do restaurante
3. Faça login em `http://localhost:5173/admin`

#### URLs disponíveis:
- **Admin:** `http://localhost:5173/admin`
- **Cardápio Público:** `http://localhost:5173/menu/SLUG_DO_RESTAURANTE`

## 🌐 Deploy na Hostinger

### Opção 1: Deploy via GitHub (Recomendado)

1. **Faça fork deste repositório** ou suba o código para seu GitHub
2. **No hPanel da Hostinger:**
   - Vá em "Node.js Apps"
   - Clique em "Create Application"
   - Conecte seu repositório GitHub
   - Configure as variáveis de ambiente:
     ```
     PORT=3001
     JWT_SECRET=gerar_string_aleatoria_segura
     NODE_ENV=production
     ```
3. **Build Settings:**
   - Build command: `cd frontend && npm install && npm run build`
   - Start command: `cd backend && npm install && node server.js`
4. **Deploy** - O deploy será automático a cada push

### Opção 2: Deploy Manual via ZIP

1. **Prepare o projeto:**
```bash
# No frontend
cd frontend
npm install
npm run build

# Voltar para raiz
cd ..
```

2. **Crie o ZIP:**
   - Compacte todo o projeto (sem node_modules)
   - Inclua: backend/, frontend/dist/, package.json, README.md

3. **Na Hostinger:**
   - Faça upload do ZIP no File Manager
   - Configure Node.js App apontando para backend/server.js
   - Configure as variáveis de ambiente no painel
   - O sistema instalará dependências automaticamente

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` no backend com:

```env
# Server
PORT=3001
NODE_ENV=production

# JWT (trocar por string aleatória longa)
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# CORS (em produção, deixar vazio ou colocar domínio)
FRONTEND_URL=

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

## 📁 Estrutura do Projeto

```
cardapio-digital/
├── backend/
│   ├── config/         # Configuração do banco
│   ├── controllers/    # Lógica de negócio
│   ├── middleware/     # Auth e upload
│   ├── routes/         # Rotas da API
│   ├── uploads/        # Imagens enviadas
│   └── server.js       # Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/ # Componentes React
│   │   ├── contexts/   # Context API
│   │   ├── pages/      
│   │   │   ├── admin/  # Painel admin
│   │   │   └── public/ # Cardápio público
│   │   └── services/   # API client
│   └── dist/          # Build de produção
└── README.md
```

## 🎯 Funcionalidades Principais

### Painel Administrativo
- ✅ Dashboard com métricas
- ✅ Gestão de categorias com horários
- ✅ Subcategorias organizadas
- ✅ Itens com múltiplas variações de preço
- ✅ Sistema de opcionais (mostra "Escolha uma Opção")
- ✅ Upload de imagens para produtos
- ✅ Configurações do restaurante (logo, banner, cores)
- ✅ Campos multi-idiomas (PT/EN/ES)

### Cardápio Público
- ✅ Design profissional e responsivo
- ✅ Indicador de aberto/fechado por horário
- ✅ Modal com detalhes e zoom de imagem
- ✅ Seletor de idiomas
- ✅ Botão "Escolha uma Opção" para itens com variações
- ✅ Performance otimizada

## 🔄 Scripts Úteis

### Backend
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento com nodemon
```

### Frontend
```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run preview    # Testar build localmente
```

## 🐛 Troubleshooting

### Erro de porta em uso
```bash
# Encontrar processo usando a porta
lsof -i :3001
# Matar o processo
kill -9 PID
```

### Banco de dados não criado
- O SQLite cria o banco automaticamente ao iniciar
- Certifique-se que a pasta backend/ tem permissão de escrita

### Imagens não aparecem
- Verifique permissões da pasta `backend/uploads/`
- Em produção, configure o servidor para servir arquivos estáticos

## 📝 Notas Importantes

- **JWT_SECRET**: SEMPRE troque por uma chave segura em produção
- **Uploads**: A pasta uploads/ precisa de permissão de escrita
- **SQLite**: Ideal para projetos pequenos/médios. Para escala maior, migre para PostgreSQL
- **HTTPS**: Em produção, sempre use HTTPS (a Hostinger configura automaticamente)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie sua branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT - Veja o arquivo LICENSE para detalhes

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar a gestão de cardápios digitais

---

**Precisa de ajuda?** Abra uma issue no GitHub ou entre em contato!