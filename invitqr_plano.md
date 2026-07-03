# InvitQR — Plano de Construção Completo

**Stack:** React + TypeScript · Node.js · PostgreSQL

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Módulos do Sistema](#2-módulos-do-sistema)
3. [Arquitetura Técnica](#3-arquitetura-técnica)
4. [Modelo de Base de Dados](#4-modelo-de-base-de-dados)
5. [Lógica de Segurança do QR Code](#5-lógica-de-segurança-do-qr-code)
6. [Plano de Desenvolvimento por Fases](#6-plano-de-desenvolvimento-por-fases)
7. [Principais Endpoints da API](#7-principais-endpoints-da-api)
8. [Por Onde Começar](#8-por-onde-começar)

---

## 1. Visão Geral do Produto

InvitQR é uma plataforma web que digitaliza o processo de gestão de convites para eventos (casamentos, baptizados, festas corporativas). Os anfitriões criam convites digitais com QR code único por convidado, gerem mesas, e controlam a entrada em tempo real através de um leitor na porta do evento.

### Problema que resolve

- Convites físicos esgotam-se — os noivos acabam a escrever nomes à mão em folhas.
- Não há controlo de quem chegou vs. quem faltou em tempo real.
- QR codes falsificados ou partilhados permitem entradas indevidas.
- Sem sistema de backup quando o QR não lê corretamente.

### Solução proposta

- QR code único, encriptado e de uso único por convidado.
- Código numérico de backup para quando o QR falha.
- Dashboard dos anfitriões com estatísticas de chegada em tempo real.
- App de leitura para o segurança — simples, rápida, funciona offline.
- Envio automático do convite por WhatsApp ou email.

---

## 2. Módulos do Sistema

### 2.1 Módulo dos Noivos / Anfitriões (Painel de Gestão)

- **Autenticação** — registo e login com email/palavra-passe (JWT)
- **Criação de evento** — nome, data, local, número máximo de convidados
- **Gestão de convidados** — adicionar nome, contacto (WhatsApp/email), mesa atribuída
- **Geração de QR codes** — um QR único encriptado por convidado, com código numérico de backup
- **Envio de convites** — envio por WhatsApp (link) ou email com o QR e código numérico
- **Gestão de mesas** — criar mesas, definir capacidade, atribuir convidados
- **Dashboard em tempo real** — contador de chegadas, lista de quem chegou/faltou
- **Relatório final** — exportar CSV com presenças e ausências

### 2.2 Módulo do Segurança (Leitor de QR)

- **Acesso por PIN** — o anfitrião gera um PIN temporário para o segurança no dia do evento
- **Leitura de QR** — câmara do telemóvel lê o QR code do convidado
- **Validação instantânea** — verde (válido), vermelho (já usado ou inválido), amarelo (código manual)
- **Nome e mesa do convidado** — aparece no ecrã após leitura válida
- **Entrada por código numérico** — campo para digitar o código de backup manualmente
- **Modo offline** — descarrega a lista de convidados no início, sincroniza entradas quando há ligação

### 2.3 Módulo do Convidado (Página do Convite)

- **Página web do convite** — acessível pelo link recebido no WhatsApp/email
- **QR code visível** — para mostrar ao segurança (ecrã ou impresso)
- **Informações do evento** — nome, data, hora, local, mesa atribuída
- **RSVP opcional** — confirmar ou cancelar presença

---

## 3. Arquitetura Técnica

### 3.1 Stack de Tecnologias

**Frontend** (painel dos noivos + leitor do segurança + página do convidado):
- React 18 + TypeScript
- TailwindCSS para estilos
- React Query (TanStack) para gestão de estado e cache
- `html5-qrcode` para leitura de QR na câmara
- `qrcode.react` para renderizar o QR code
- React Router v6 para navegação

**Backend** (API REST):
- Node.js + Express + TypeScript
- Prisma ORM para acesso à base de dados PostgreSQL
- JWT para autenticação dos anfitriões
- `bcrypt` para hash de palavras-passe
- `crypto` (nativo do Node) para gerar e encriptar os tokens dos QR codes
- Nodemailer para envio de email
- Twilio API (ou WhatsApp Business API) para envio por WhatsApp
- Socket.io para atualizações em tempo real no dashboard

**Base de dados:**
- PostgreSQL — base de dados principal
- Redis (opcional, fase 2) — cache de sessões e sincronização offline

**Deploy:**
- Frontend: Vercel
- Backend + DB: Railway (gratuito para começar) ou Supabase
- Ficheiros/imagens: Cloudinary (se adicionares fotos dos convidados)

### 3.2 Estrutura de Pastas do Projeto

```
invitqr/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── dashboard/       # Painel dos noivos
│   │   │   ├── scanner/         # Leitor do segurança
│   │   │   └── invite/          # Página do convidado
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/            # Chamadas à API
│   │   └── types/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── guests.ts
│   │   │   ├── tables.ts
│   │   │   └── scanner.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   │   ├── qrService.ts     # Geração e validação de QR
│   │   │   ├── emailService.ts
│   │   │   └── whatsappService.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.ts
│   └── package.json
└── README.md
```

---

## 4. Modelo de Base de Dados

### Tabela: `users` (Anfitriões)

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| name | VARCHAR | Nome completo do anfitrião |
| email | VARCHAR UNIQUE | Email de login |
| password_hash | VARCHAR | Hash bcrypt da palavra-passe |
| created_at | TIMESTAMP | Data de registo |

### Tabela: `events` (Eventos)

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| user_id | UUID FK | Referência ao anfitrião |
| name | VARCHAR | Nome do evento |
| date | TIMESTAMP | Data e hora do evento |
| location | VARCHAR | Local do evento |
| max_guests | INTEGER | Capacidade total |
| scanner_pin | VARCHAR | PIN do segurança (hash) |
| created_at | TIMESTAMP | Data de criação |

### Tabela: `tables` (Mesas)

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| event_id | UUID FK | Referência ao evento |
| name | VARCHAR | Nome ou número da mesa |
| capacity | INTEGER | Capacidade máxima da mesa |

### Tabela: `guests` (Convidados)

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| event_id | UUID FK | Referência ao evento |
| table_id | UUID FK NULL | Mesa atribuída (opcional) |
| name | VARCHAR | Nome do convidado |
| phone | VARCHAR NULL | Número de WhatsApp |
| email | VARCHAR NULL | Email do convidado |
| qr_token | VARCHAR UNIQUE | Token encriptado do QR code |
| backup_code | VARCHAR UNIQUE | Código numérico de 6 dígitos |
| checked_in | BOOLEAN | Se já entrou no evento |
| checked_in_at | TIMESTAMP NULL | Hora de entrada |
| invite_sent | BOOLEAN | Se o convite já foi enviado |
| rsvp_status | ENUM | pending / confirmed / declined |

### Tabela: `guest_companions` (Acompanhantes — Opção B)

> Permite associar múltiplas pessoas a um único convite titular.

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID PK | Identificador único |
| guest_id | UUID FK | Referência ao convidado titular |
| name | VARCHAR | Nome do acompanhante |
| rsvp_status | ENUM | pending / confirmed / declined |

---

## 5. Lógica de Segurança do QR Code

### 5.1 Geração do QR

Cada QR code contém um token único gerado no backend, nunca o ID direto do convidado:

1. Backend gera um UUID aleatório (`qr_token`) para cada convidado.
2. O token é assinado com HMAC-SHA256 usando uma chave secreta do servidor.
3. O QR code contém a URL: `https://invitqr.app/scan/{qr_token}`
4. O código numérico de backup é gerado separadamente (6 dígitos únicos por evento).

### 5.2 Validação na Entrada

1. O segurança lê o QR — o frontend envia o token para a API.
2. A API verifica: token existe? → convidado pertence ao evento? → já fez check-in?
3. Se tudo válido: marca `checked_in = true`, `checked_in_at = agora`, retorna nome e mesa.
4. Se já usou o QR: retorna erro "já utilizado" com alerta vermelho.
5. O mesmo fluxo aplica-se ao código numérico de backup.

### 5.3 Proteções implementadas

- O token é assinado com HMAC — não é possível adivinhar ou fabricar um token válido.
- Cada token só pode ser validado uma vez — após check-in, fica marcado na base de dados.
- O `scanner_pin` do segurança é temporário e gerado por evento — não dá acesso ao painel dos noivos.

---

## 6. Plano de Desenvolvimento por Fases

| Fase | Módulo | O que construir | Duração est. |
|---|---|---|---|
| Fase 1 | Setup | Inicializar repos, configurar TypeScript, ESLint, Prisma, PostgreSQL local, estrutura de pastas | 1-2 dias |
| Fase 1 | Auth | Registo e login de anfitriões, JWT, middleware de autenticação, hash de passwords com bcrypt | 1-2 dias |
| Fase 2 | Eventos | CRUD de eventos, gestão de mesas, capacidade máxima por mesa | 2-3 dias |
| Fase 2 | Convidados | Adicionar/editar/remover convidados, atribuição de mesa, geração de qr_token e backup_code | 2-3 dias |
| Fase 3 | QR Code | Geração visual do QR (qrcode.react), página do convite para o convidado, lógica HMAC | 2 dias |
| Fase 3 | Scanner | Interface do segurança com câmara (html5-qrcode), validação de QR e código manual, feedback visual | 2-3 dias |
| Fase 4 | Dashboard | Estatísticas em tempo real com Socket.io, contador de chegadas, lista de presentes/ausentes | 2-3 dias |
| Fase 4 | Envios | Envio de convite por email (Nodemailer) e WhatsApp (Twilio), template do convite em HTML | 2-3 dias |
| Fase 5 | Offline | Modo offline do scanner (Service Worker + IndexedDB), sincronização quando volta a ligação | 3 dias |
| Fase 5 | Deploy | Deploy frontend (Vercel), backend + DB (Railway), variáveis de ambiente, testes finais | 1-2 dias |

---

## 7. Principais Endpoints da API

### Autenticação
```
POST /api/auth/register       # Criar conta de anfitrião
POST /api/auth/login          # Login, retorna JWT
```

### Eventos
```
POST   /api/events            # Criar evento
GET    /api/events            # Listar eventos do utilizador
GET    /api/events/:id        # Detalhes de um evento
PUT    /api/events/:id        # Editar evento
DELETE /api/events/:id        # Apagar evento
```

### Convidados
```
POST   /api/events/:id/guests          # Adicionar convidado
GET    /api/events/:id/guests          # Listar convidados do evento
PUT    /api/guests/:id                 # Editar convidado
DELETE /api/guests/:id                 # Remover convidado
POST   /api/guests/:id/send-invite     # Enviar convite por email/WhatsApp
```

### Scanner
```
POST /api/scanner/login               # Login do segurança com PIN
POST /api/scanner/validate            # Validar QR token ou código backup
GET  /api/scanner/guests/:eventId     # Descarregar lista para modo offline
```

### Página do Convidado
```
GET /api/invite/:qr_token             # Dados públicos do convite (nome, mesa, evento)
```

---

## 8. Por Onde Começar

1. Criar o repositório no GitHub (monorepo com `/frontend` e `/backend`).
2. Inicializar o backend: `npm init`, instalar Express + TypeScript + Prisma.
3. Definir o `schema.prisma` com as tabelas deste documento e correr a primeira migração.
4. Implementar as rotas de auth (register + login) com JWT.
5. Testar os endpoints com Insomnia ou Postman antes de tocar no frontend.
6. Só depois inicializar o frontend React e ligar à API.

---

> **Sugestão de nome:** InvitQR — curto, descritivo, fácil de lembrar.
> Domínio sugerido: `invitqr.com` ou `invitqr.app`
> Potencial SaaS: cobrar por evento ou por plano mensal aos anfitriões.
