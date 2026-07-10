# InvitQR — Plano de Execução e Desenvolvimento

**Projeto:** InvitQR (Gestão de Convites Digitais com QR Code)  
**Stack:** React + TypeScript · Node.js · PostgreSQL  
**Data de Início:** 3 de Julho de 2026

---

## 📋 Sumário Executivo

InvitQR é uma plataforma web para digitalizar e gerir convites para eventos (casamentos, baptizados, festas corporativas) com controlo de entrada em tempo real através de QR codes únicos, encriptados e de uso único por convidado.

**Objetivos principais:**
- ✅ Eliminar convites físicos e controlo manual
- ✅ Prevenir fraudes e acessos indevidos com QR codes encriptados
- ✅ Dashboard em tempo real com estatísticas de chegadas
- ✅ Modo offline para leitura de QR codes (leitor de segurança)
- ✅ Envio automático por WhatsApp/Email

---

## 🎯 Fases de Desenvolvimento

### **FASE 1: Estrutura Base e Setup do Projeto** (1-2 semanas)

**Objetivo:** Criar a estrutura do projeto, configurar dependências e ambiente de desenvolvimento.

#### 1.1 Setup Backend
- [ ] Criar repositório git
- [ ] Inicializar projeto Node.js + Express + TypeScript
- [x] Instalar dependências principais:
`chmod +x node_modules/.bin/tsx`
`npm install tsx@latest --save-dev`
`npm run dev`
  - `express`, `cors`, `dotenv`
  - `prisma`, `@prisma/client`
  - `jsonwebtoken`, `bcrypt`
  - `qrcode`, `crypto`
  - `nodemailer`, `twilio`
  - `socket.io`
  - `typescript`, `ts-node`, `tsx` (como devDependencies)
- [x] Configurar arquivo `.env` (variáveis de ambiente)
- [x] Criar estrutura de pastas (`/src/routes`, `/src/middleware`, `/src/services`, `/src/prisma`)
- [x] Configurar TypeScript (`tsconfig.json`)

#### 1.2 Setup Frontend
- [ ] Criar projeto React com Vite + TypeScript
- [x] Instalar dependências principais:  
 ` chmod +x node_modules/.bin/vite  `
  `npm install qrcode.react@latest  `
  `npm run dev`
  - `react-router-dom`
  - `react-query`
  - `tailwindcss`, `postcss`, `autoprefixer`
  - `html5-qrcode` (leitura de QR)
  - `qrcode.react` (renderizar QR)
  - `axios` (requisições HTTP)
- [x] Configurar estrutura de pastas (`/src/pages`, `/src/components`, `/src/services`, `/src/types`)

#### 1.3 Setup Database
- [ ] Criar instância PostgreSQL (Railway ou Supabase)
- [x] Criar arquivo `schema.prisma` com tabelas base
- [ ] Executar migrações iniciais (próximo passo)
- [ ] Seed de dados de teste

#### 1.4 Setup Infraestrutura
- [ ] Configurar Git (.gitignore, commits iniciais)
- [ ] Estruturar documentação (README.md)
- [ ] Configurar variáveis de ambiente para dev/prod

**Entregáveis:**
- ✅ Repositório pronto com estrutura de pastas
- ✅ Backend rodando em `http://localhost:3000`
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ PostgreSQL conectado e migrações ok

---

### **FASE 2: Autenticação e Gestão de Anfitriões** (1-2 semanas)

**Objetivo:** Sistema de login/registo para os anfitriões com JWT.

#### 2.1 Backend — Autenticação
- [ ] Criar tabela `users` no Prisma
- [ ] Implementar rota POST `/auth/register`
  - Validar email, password (mín. 8 caracteres)
  - Hash da password com bcrypt
  - Retornar JWT token
- [ ] Implementar rota POST `/auth/login`
  - Validar credenciais
  - Gerar JWT token
- [ ] Implementar middleware de verificação de JWT
- [ ] Implementar rota GET `/auth/me` (dados do utilizador autenticado)
- [ ] Implementar rota POST `/auth/logout` (invalidar token — opcional)

#### 2.2 Frontend — Autenticação
- [ ] Criar página `/login`
  - Formulário email + password
  - Validação client-side
  - Guardar JWT no localStorage
- [ ] Criar página `/register`
  - Formulário nome + email + password
  - Validar força da password
  - Redirecionar para dashboard após registo
- [ ] Implementar `useAuth` hook
  - Verificar se está autenticado
  - Guardar/recuperar JWT
  - Logout
- [ ] Implementar rota protegida (PrivateRoute component)
  - Redirecionar para login se não autenticado

#### 2.3 Testes
- [ ] Testar registo com email válido/inválido
- [ ] Testar login com credenciais corretas/incorretas
- [ ] Testar JWT expiration
- [ ] Testar refresh de token (se implementado)

**Entregáveis:**
- ✅ Sistema de autenticação funcional
- ✅ Utilizadores podem criar conta e fazer login
- ✅ Proteção de rotas autenticadas

---

### **FASE 3: Criação e Gestão de Eventos** (1-2 semanas)

**Objetivo:** Anfitriões podem criar eventos e configurações básicas.

#### 3.1 Backend — Eventos
- [ ] Criar tabela `events` no Prisma
- [ ] Implementar rota POST `/events` (criar evento)
  - Campos: name, date, location, max_guests
  - Validar data > data atual
  - Guardar user_id do anfitrião
- [ ] Implementar rota GET `/events` (listar eventos do utilizador)
- [ ] Implementar rota GET `/events/:id` (detalhes de um evento)
- [ ] Implementar rota PATCH `/events/:id` (editar evento)
- [ ] Implementar rota DELETE `/events/:id` (eliminar evento)
- [ ] Gerar PIN temporário para o segurança (`scanner_pin` — hash)

#### 3.2 Frontend — Dashboard
- [ ] Criar página `/dashboard`
  - Lista de eventos do utilizador
  - Botão "Criar Novo Evento"
- [ ] Criar página `/events/new`
  - Formulário para criar evento
  - Validação de campos
  - Redirecionar para detalhe do evento após criação
- [ ] Criar página `/events/:id`
  - Detalhes do evento
  - Editar informações
  - Mostrar PIN do segurança (gerado)
  - Abas: Convidados, Mesas, Estatísticas

#### 3.3 Testes
- [ ] Criar evento com dados válidos/inválidos
- [ ] Listar eventos do utilizador
- [ ] Editar e eliminar eventos

**Entregáveis:**
- ✅ Anfitriões podem criar e gerir eventos
- ✅ Dashboard com lista de eventos
- ✅ PIN gerado automaticamente para o segurança

---

### **FASE 4: Gestão de Convidados e QR Codes** (2-3 semanas)

**Objetivo:** Adicionar convidados, gerar QR codes únicos e encriptados.

#### 4.1 Backend — Convidados
- [ ] Criar tabela `guests` no Prisma
- [ ] Implementar rota POST `/events/:id/guests` (adicionar convidado)
  - Campos: name, phone (WhatsApp), email
  - Gerar QR token encriptado (crypto.randomBytes + cipher)
  - Gerar código numérico de backup (6 dígitos)
  - Guardar no DB
- [ ] Implementar rota GET `/events/:id/guests` (listar convidados)
- [ ] Implementar rota GET `/events/:id/guests/:guestId` (detalhes do convidado)
- [ ] Implementar rota PATCH `/events/:id/guests/:guestId` (editar convidado)
- [ ] Implementar rota DELETE `/events/:id/guests/:guestId` (eliminar convidado)
- [ ] Implementar bulk upload de convidados (via CSV)
  - Parse CSV
  - Gerar QR + backup code para cada um
  - Guardar no DB

#### 4.2 Serviço QR Code
- [ ] Criar `services/qrService.ts`
  - Função `generateQRToken()` — gera token único e encriptado
  - Função `generateBackupCode()` — gera código de 6 dígitos
  - Função `validateQRToken()` — valida se QR é válido e não foi usado
  - Função `encryptData()` — encripta dados do convidado
  - Função `decryptData()` — desencripta dados (para validação)

#### 4.3 Frontend — Gestão de Convidados
- [ ] Criar página `/events/:id/guests`
  - Tabela com lista de convidados
  - Botões: Adicionar, Editar, Eliminar
  - Upload CSV
- [ ] Criar modal/página para adicionar convidado
  - Formulário: name, phone, email
  - Validação
  - Mostrar QR gerado e código de backup
- [ ] Criar página `/events/:id/guests/:guestId`
  - Mostrar QR code em grande
  - Código de backup
  - Informações do convidado
  - Opção de reenviar convite

#### 4.4 Validação de QR Code
- [ ] Backend endpoint GET `/scanner/validate` (vai usar PIN)
  - Validar PIN do segurança
  - Receber QR token ou backup code
  - Verificar se QR é válido
  - Marcar como used
  - Retornar detalhes do convidado e mesa

**Entregáveis:**
- ✅ Convidados podem ser adicionados (individual ou CSV)
- ✅ QR codes únicos e encriptados gerados
- ✅ Código de backup numérico para fallback
- ✅ Serviço de QR code funcional

---

### **FASE 5: Gestão de Mesas** (1 semana)

**Objetivo:** Criar mesas e atribuir convidados.

#### 5.1 Backend — Mesas
- [ ] Criar tabela `tables` no Prisma
- [ ] Implementar rota POST `/events/:id/tables` (criar mesa)
  - Campos: name, capacity
- [ ] Implementar rota GET `/events/:id/tables` (listar mesas)
- [ ] Implementar rota PATCH `/events/:id/tables/:tableId` (editar mesa)
- [ ] Implementar rota DELETE `/events/:id/tables/:tableId` (eliminar mesa)
- [ ] Atualizar tabela `guests` com foreign key `table_id`
- [ ] Implementar rota PATCH `/events/:id/guests/:guestId/assign-table`

#### 5.2 Frontend — Gestão de Mesas
- [ ] Criar aba "Mesas" no detalhe do evento
  - Listar mesas com capacidade
  - Botões: Adicionar, Editar, Eliminar
- [ ] Drag-and-drop de convidados para mesas (opcional)
- [ ] Mostrar ocupação de cada mesa em tempo real

**Entregáveis:**
- ✅ Mesas criadas e geridas
- ✅ Convidados atribuídos a mesas

---

### **FASE 6: Serviços de Comunicação (Email e WhatsApp)** (2-3 semanas)

**Objetivo:** Enviar convites por email e WhatsApp.

#### 6.1 Serviço de Email
- [ ] Criar `services/emailService.ts`
  - Configurar Nodemailer com provedor SMTP (ex: Gmail, SendGrid)
  - Função `sendInviteEmail(guest, event, qrCode, backupCode)`
  - Template HTML do convite
  - Incluir link para página do convite

#### 6.2 Serviço de WhatsApp
- [ ] Criar `services/whatsappService.ts`
  - Integrar Twilio ou WhatsApp Business API
  - Função `sendInviteWhatsApp(phone, inviteLink, backupCode)`
  - Mensagem formatada com link do convite

#### 6.3 Backend — Envio de Convites
- [ ] Implementar rota POST `/events/:id/guests/:guestId/send-invite`
  - Validar email/phone do convidado
  - Enviar email OU WhatsApp (ou ambos)
  - Marcar `invite_sent = true` no DB
- [ ] Implementar rota POST `/events/:id/send-all-invites`
  - Enviar convites a todos os convidados
  - Retornar status (sucesso/erro) para cada convidado

#### 6.4 Frontend — Botões de Envio
- [ ] Adicionar botão "Enviar Convite" no detalhe do convidado
- [ ] Adicionar botão "Enviar Todos os Convites" na aba de convidados
- [ ] Mostrar feedback (loading, sucesso, erro)

**Entregáveis:**
- ✅ Envio de email funcional
- ✅ Envio de WhatsApp funcional
- ✅ Convites formatados com QR e backup code

---

### **FASE 7: Página do Convite (Convidado)** (1-2 semanas)

**Objetivo:** Página acessível pelo link do convite com informações do evento e RSVP.

#### 7.1 Backend — Convite Público
- [ ] Implementar rota GET `/invite/:qrToken` (acesso público — SEM autenticação)
  - Desencriptar QR token
  - Recuperar dados do convidado e evento
  - Retornar informações
  - Retornar 404 se QR inválido/expirado

#### 7.2 Frontend — Página do Convite
- [ ] Criar página `/invite/:qrToken`
  - Mostrar:
    - Nome do evento
    - Data e hora
    - Local
    - Mesa atribuída
    - QR code do convidado
    - Código de backup
  - Botões RSVP: "Vou confirmar" / "Não vou"
  - Design responsivo (mobile-first)

#### 7.3 Backend — RSVP
- [ ] Implementar rota PATCH `/invite/:qrToken/rsvp`
  - Receber status: confirmed / declined
  - Atualizar `rsvp_status` do convidado
  - Enviar notificação ao anfitrião (WebSocket)

**Entregáveis:**
- ✅ Página do convite acessível e responsiva
- ✅ RSVP funcional
- ✅ QR e código de backup visíveis

---

### **FASE 8: Leitor de QR Code (Segurança)** (2-3 semanas)

**Objetivo:** App simples para o segurança validar QR codes na entrada.

#### 8.1 Backend — Scanner
- [ ] Implementar rota POST `/scanner/check-in`
  - Validar PIN do segurança
  - Receber QR token OU backup code
  - Validar se QR/code é válido e ainda não foi usado
  - Marcar como `checked_in = true`, guardar `checked_in_at`
  - Retornar:
    - Verde (✓): Nome do convidado, mesa, permitir entrada
    - Vermelho (✗): QR já usado ou inválido
    - Amarelo (⚠): Código manual inserido

#### 8.2 Frontend — Scanner App
- [ ] Criar página `/scanner` (requer PIN)
- [ ] Implementar login por PIN (rota simples, sem JWT — apenas PIN)
- [ ] Integrar `html5-qrcode`:
  - Aceder à câmara do telemóvel
  - Ler QR code
  - Enviar para backend de validação
- [ ] UI de validação:
  - Verde: ✓ Nome + Mesa — fazer som + vibração
  - Vermelho: ✗ "QR já usado" — som de erro
  - Amarelo: Campo de input para código manual de 6 dígitos
- [ ] Modo offline:
  - Descarregar lista de convidados no início
  - Funcionar sem internet
  - Sincronizar entradas quando houver ligação (Fase 2)

#### 8.3 Segurança
- [ ] PIN é gerado para cada evento
- [ ] PIN expira após o evento (ou horas configuradas)
- [ ] QR tokens são validados no backend mesmo offline (comparação hash local)

**Entregáveis:**
- ✅ Scanner de QR funcional
- ✅ Validação com feedback visual
- ✅ Código de backup manual
- ✅ Modo offline (básico)

---

### **FASE 9: Dashboard de Estatísticas (Tempo Real)** (2-3 semanas)

**Objetivo:** Painel em tempo real com chegadas, ausências e estatísticas.

#### 9.1 Backend — Real Time (WebSocket)
- [ ] Integrar Socket.io no Express
- [ ] Criar evento para cada check-in
  - Emitir dados para cliente do anfitrião conectado
  - Incluir: nome, hora, mesa, foto (se houver)
- [ ] Criar eventos para atualizações:
  - RSVP recebido
  - Convidado faltou (passadas 30 min da hora do evento?)

#### 9.2 Backend — Estatísticas
- [ ] Implementar rota GET `/events/:id/stats`
  - Total convidados
  - Confirmações (RSVP)
  - Já chegaram
  - Faltaram
  - Ausência de confirmação
  - Gráfico de chegadas por hora
- [ ] Implementar rota GET `/events/:id/checkins` (histórico de check-ins)

#### 9.3 Frontend — Dashboard
- [ ] Criar componente de estatísticas
  - Cards: Total, Confirmados, Chegados, Faltaram
  - Gráfico de chegadas em tempo real (recharts ou chart.js)
  - Lista de últimas chegadas
- [ ] Conectar WebSocket para atualizações em tempo real
- [ ] Mostrar ícone online/offline na câmara do segurança

#### 9.4 Alertas
- [ ] Notificação quando 80% chegaram
- [ ] Aviso se convidado confirmado não chegou

**Entregáveis:**
- ✅ Dashboard com estatísticas em tempo real
- ✅ Gráficos de chegadas
- ✅ Histórico de check-ins
- ✅ WebSocket para atualizações instantâneas

---

### **FASE 10: Relatório Final e Exportação** (1 semana)

**Objetivo:** Exportar dados pós-evento.

#### 10.1 Backend — Exportação
- [ ] Implementar rota GET `/events/:id/report`
  - Gerar relatório CSV com:
    - Nome do convidado
    - Mesa
    - RSVP (confirmado/recusado/pendente)
    - Chegou (sim/não)
    - Hora de chegada
    - Duração no evento (saída opcional)
- [ ] Implementar rota GET `/events/:id/report/pdf` (opcional)
  - Gerar PDF formatado

#### 10.2 Frontend — Relatório
- [ ] Criar página `/events/:id/report`
  - Mostrar tabela de presenças
  - Botão "Descarregar CSV"
  - Botão "Descarregar PDF" (opcional)
- [ ] Mostrar resumo final:
  - % de presenças
  - % de confirmações
  - Média de chegadas

**Entregáveis:**
- ✅ Relatório CSV exportável
- ✅ Resumo de presenças

---

### **FASE 11: Testes e QA** (2 semanas)

**Objetivo:** Testar toda a plataforma antes de deploy.

#### 11.1 Testes Unitários
- [ ] Backend: Serviços (QR, email, WhatsApp)
- [ ] Frontend: Componentes e hooks

#### 11.2 Testes de Integração
- [ ] Fluxo completo: criar evento → adicionar convidados → enviar convites → RSVP → check-in
- [ ] Modo offline do scanner

#### 11.3 Testes de Segurança
- [ ] QR tokens não podem ser reutilizados
- [ ] PIN do segurança é seguro
- [ ] Dados do convidado não expostos em URLs
- [ ] JWT expiração testada

#### 11.4 Testes de Performance
- [ ] Dashboard com 1000+ convidados
- [ ] WebSocket com múltiplos clientes simultâneos

#### 11.5 Testes em Dispositivos Reais
- [ ] Câmara QR em diferentes telemóveis
- [ ] Offline no scanner
- [ ] Responsive em tablets e mobile

**Entregáveis:**
- ✅ Testes unitários passam
- ✅ Testes de integração passam
- ✅ Sem vulnerabilidades críticas

---

### **FASE 12: Deploy e Publicação** (1 semana)

**Objetivo:** Deploy em produção.

#### 12.1 Backend
- [ ] Deploy no Railway ou Supabase
  - Configurar variáveis de ambiente (prod)
  - Migrações do Prisma
  - SSL/HTTPS
- [ ] Configurar domínio customizado (ex: api.invitqr.pt)
- [ ] Setup de logs e monitoring

#### 12.2 Frontend
- [ ] Deploy no Vercel
  - Build otimizado
  - Variáveis de ambiente (prod)
  - Domínio customizado (ex: app.invitqr.pt)
- [ ] Configurar CDN

#### 12.3 Database
- [ ] PostgreSQL em produção com backups automáticos
- [ ] Índices otimizados

#### 12.4 DNS e HTTPS
- [ ] Apontar domínios para Vercel e Railway
- [ ] Certificado SSL/TLS

**Entregáveis:**
- ✅ Plataforma live em produção
- ✅ Domínios configurados
- ✅ HTTPS ativo

---

### **FASE 13: Melhorias Futuras (Fase 2)** 

- [ ] Fotos dos convidados no scanner
- [ ] Saída do evento (check-out)
- [ ] Controlo de acompanhantes
- [ ] Integração com sistemas de pagamento
- [ ] App mobile nativa (React Native)
- [ ] Redis para cache e sincronização offline
- [ ] Análise de dados (BI)
- [ ] Multi-idioma

---

## 📊 Timeline Sugerida

| Fase | Descrição | Duração | Fim Previsto |
|------|-----------|---------|--------------|
| 1 | Setup Projeto | 1-2 sem | 17 Jul |
| 2 | Autenticação | 1-2 sem | 31 Jul |
| 3 | Gestão Eventos | 1-2 sem | 14 Ago |
| 4 | QR Codes | 2-3 sem | 04 Set |
| 5 | Mesas | 1 sem | 11 Set |
| 6 | Email/WhatsApp | 2-3 sem | 02 Out |
| 7 | Página Convite | 1-2 sem | 16 Out |
| 8 | Scanner QR | 2-3 sem | 06 Nov |
| 9 | Dashboard Real Time | 2-3 sem | 27 Nov |
| 10 | Relatórios | 1 sem | 04 Dez |
| 11 | Testes QA | 2 sem | 18 Dez |
| 12 | Deploy Prod | 1 sem | 25 Dez |

**Total: ~18-20 semanas (4-5 meses)**

---

## 🛠️ Stack Recomendada (Resumo)

### Frontend
```json
{
  "react": "^18.0",
  "typescript": "^5.0",
  "react-router-dom": "^6.0",
  "react-query": "^3.0",
  "tailwindcss": "^3.0",
  "html5-qrcode": "^2.3",
  "qrcode.react": "^1.0",
  "axios": "^1.0",
  "vite": "^4.0"
}
```

### Backend
```json
{
  "express": "^4.18",
  "typescript": "^5.0",
  "prisma": "^5.0",
  "@prisma/client": "^5.0",
  "jsonwebtoken": "^9.0",
  "bcrypt": "^5.0",
  "nodemailer": "^6.0",
  "twilio": "^4.0",
  "socket.io": "^4.0"
}
```

### Database
- **PostgreSQL** (Railway, Supabase, ou AWS RDS)
- **Prisma** como ORM

### Deploy
- **Frontend:** Vercel
- **Backend:** Railway ou Render
- **Database:** Supabase ou Railway

---

## 🎯 KPIs de Sucesso

1. ✅ Tempo de leitura QR < 2 segundos
2. ✅ Taxa de sucesso de entrega de convites > 95%
3. ✅ Taxa de acesso à página de convite > 80%
4. ✅ Dashboard carrega em < 1 segundo
5. ✅ Funcionalidade offline do scanner 100%
6. ✅ Zero fraudes de QR (encriptação + validação)

---

## 📝 Próximos Passos

1. **Começar FASE 1:** Setup do projeto
2. **Criar branches git:** `feature/auth`, `feature/events`, etc.
3. **Documentar decisões técnicas** (ADR — Architecture Decision Records)
4. **Fazer daily standups** e acompanhar progresso
5. **Testar com utilizadores reais** em fase de beta

---

**Última atualização:** 3 de Julho de 2026
