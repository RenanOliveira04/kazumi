# Kazumi - Educação Inclusiva

## Sobre o Projeto

Kazumi é uma plataforma educacional acessível desenvolvida para facilitar a comunicação entre famílias de estudantes com necessidades especiais e escolas.

## Desenvolvimento Local

Para rodar o projeto localmente:

```sh
npm install
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`

## Build para Produção

```sh
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

## Tecnologias Utilizadas

- React + TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router
- TanStack Query
- Axios

## Recursos de Acessibilidade

- Integração com VLibras para tradução automática para Libras
- Design responsivo e acessível
- Suporte a leitores de tela
- Alto contraste e navegação por teclado

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── contexts/      # Contextos React (Auth, etc)
├── services/      # Serviços de API
└── lib/          # Utilitários e configurações
```

## API Backend

O backend da aplicação está localizado no diretório `app/` na raiz do projeto.

## Licença

Propriedade da equipe Kazumi.
