# InvitQR — Frontend

Aplicação React + TypeScript para gestão de convites digitais com QR code.

## Funcionalidades

- **Dashboard dos Anfitriões**: Criar eventos, gerir convidados, enviar convites
- **Página do Convite**: Acesso público ao convite digital com QR code
- **Scanner de QR**: App para segurança validar entradas em tempo real
- **Estatísticas em Tempo Real**: Dashboard com chegadas e estatísticas

## Tecnologias

- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (state management)
- React Router (navigation)
- html5-qrcode (QR scanning)
- qrcode.react (QR rendering)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abre http://localhost:5173

## Build

```bash
npm run build
```

## Estrutura de Pastas

```
src/
├── pages/
│   ├── dashboard/      # Painel dos anfitriões
│   ├── scanner/        # Leitor QR para segurança
│   └── invite/         # Página pública do convite
├── components/         # Componentes reutilizáveis
├── hooks/             # Custom React hooks
├── services/          # Chamadas à API
└── types/             # Tipos TypeScript
```

## Enviroment Variables

Cria um ficheiro `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

---

**Documentação Completa**: Ver [PLANO_EXECUCAO.md](../PLANO_EXECUCAO.md)
