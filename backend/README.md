# InvitQR — Backend

API REST Node.js + Express + TypeScript para gestão de eventos e convites.

## Funcionalidades

- **Autenticação**: Registo e login de anfitriões com JWT
- **Gestão de Eventos**: CRUD de eventos
- **Convidados**: Adicionar, editar, eliminar convidados (individual ou CSV)
- **QR Codes**: Geração de QR tokens encriptados e códigos de backup
- **Validação**: Validação de QR codes e check-in
- **Comunicação**: Envio de convites por email e WhatsApp
- **Real Time**: WebSocket para dashboard em tempo real
- **Relatórios**: Exportação de estatísticas

## Tecnologias

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT (autenticação)
- bcrypt (hash de passwords)
- WebSocket (Socket.io)
- Nodemailer (email)
- Twilio (WhatsApp)

## Instalação

```bash
npm install
```

## Setup Database

```bash
# Gerar Prisma client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Abrir Prisma Studio (GUI)
npm run prisma:studio
```

## Desenvolvimento

```bash
npm run dev
```

Abre http://localhost:3000

## Build & Deploy

```bash
npm run build
npm start
```

## Estrutura de Pastas

```
src/
├── routes/             # Endpoints da API
│   ├── auth.ts        # Autenticação
│   ├── events.ts      # Eventos
│   ├── guests.ts      # Convidados
│   ├── tables.ts      # Mesas
│   └── scanner.ts     # Validação de QR
├── middleware/        # Express middleware (JWT, CORS, etc)
├── services/          # Lógica de negócio
│   ├── qrService.ts           # Geração e validação QR
│   ├── emailService.ts        # Envio de email
│   ├── whatsappService.ts     # Envio WhatsApp
│   └── authService.ts         # Autenticação
├── prisma/
│   └── schema.prisma  # Schema do DB
└── app.ts            # Configuração principal
```

## Environment Variables

Cria um ficheiro `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invitqr"

# JWT
JWT_SECRET="tua_chave_secreta_aqui"
JWT_EXPIRATION="7d"

# Email (Nodemailer)
EMAIL_USER="teu_email@gmail.com"
EMAIL_PASSWORD="tua_senha_app"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="teu_sid"
TWILIO_AUTH_TOKEN="teu_token"
TWILIO_PHONE_NUMBER="+1234567890"

# App
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## API Endpoints (Overview)

### Autenticação
- `POST /api/auth/register` — Registo
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Dados do utilizador

### Eventos
- `GET /api/events` — Listar meus eventos
- `POST /api/events` — Criar evento
- `GET /api/events/:id` — Detalhes do evento
- `PATCH /api/events/:id` — Editar evento
- `DELETE /api/events/:id` — Eliminar evento

### Convidados
- `GET /api/events/:id/guests` — Listar convidados
- `POST /api/events/:id/guests` — Adicionar convidado
- `PATCH /api/events/:id/guests/:guestId` — Editar convidado
- `DELETE /api/events/:id/guests/:guestId` — Eliminar convidado
- `POST /api/events/:id/guests/upload-csv` — Upload em massa

### Scanner (Check-in)
- `POST /api/scanner/check-in` — Validar QR / check-in

### Estatísticas
- `GET /api/events/:id/stats` — Estatísticas do evento
- `GET /api/events/:id/report` — Relatório CSV

---

**Documentação Completa**: Ver [PLANO_EXECUCAO.md](../PLANO_EXECUCAO.md)
