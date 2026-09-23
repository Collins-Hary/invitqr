# InvitQR Project Structure
<!-- #### 6.2 Serviço de WhatsApp
- [ ] Criar `services/whatsappService.ts`
  - Integrar Twilio ou WhatsApp Business API
  - Função `sendInviteWhatsApp(phone, inviteLink, backupCode)`
  - Mensagem formatada com link do convite -->
```
invitqr/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── pages/              
│   │   │   ├── dashboard/       # Painel dos anfitriões
│   │   │   ├── scanner/         # Leitor QR (segurança)
│   │   │   └── invite/          # Página pública do convite
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Chamadas à API (axios)
│   │   ├── types/              # Tipos TypeScript
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
│
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/             # Endpoints da API
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── guests.ts
│   │   │   ├── tables.ts
│   │   │   └── scanner.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/           # Lógica de negócio
│   │   │   ├── qrService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── whatsappService.ts
│   │   │   └── authService.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema do banco
│   │   └── app.ts              # Setup principal
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── PLANO_EXECUCAO.md           # Plano detalhado de desenvolvimento
├── invitqr_plano.md            # Especificações do produto
├── .gitignore
└── README.md
```

## Status da Estrutura

✅ **Criado:**
- Estrutura de pastas (frontend e backend)
- `package.json` (frontend e backend)
- `tsconfig.json` (frontend e backend)
- Configurações Vite, TailwindCSS, PostCSS
- Arquivo `schema.prisma` com modelo base
- Tipos TypeScript base
- Ficheiros iniciais (`App.tsx`, `app.ts`)
- READMEs do frontend e backend

## Próximos Passos (FASE 1)

1. Instalar dependências do backend
2. Instalar dependências do frontend
3. Setup da base de dados PostgreSQL
4. Executar migrações Prisma
5. Testar endpoints básicos

Para detalhes, ver [PLANO_EXECUCAO.md](./PLANO_EXECUCAO.md) - **FASE 1: Estrutura Base e Setup do Projeto**
