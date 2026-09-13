# Vistor.ia Web

Interface web da plataforma Vistor.ia, desenvolvida em Angular para criação,
envio e acompanhamento de vistorias digitais.

## Funcionalidades

- Cadastro e autenticação de usuários.
- Dashboard com indicadores operacionais.
- Criação de modelos e exigências fotográficas.
- Criação e envio de solicitações de vistoria.
- Acompanhamento de status e prazos.
- Preenchimento público sem cadastro.
- Upload e substituição de evidências.
- Validação das fotos obrigatórias antes da conclusão.
- Interface responsiva para computador e celular.

## Requisitos

- Node.js 24
- npm 11 ou superior
- Vistor.ia API executando em `http://localhost:5080`

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

Durante o desenvolvimento, o Angular encaminha as chamadas iniciadas por
`/api` para `http://localhost:5080`, conforme o arquivo `proxy.conf.json`.

## Build de produção

```bash
npm run build
```

Os arquivos compilados serão gerados em `dist/vistoria-web/browser`.

Em produção, configure o servidor web para:

1. redirecionar rotas desconhecidas para `index.html`;
2. encaminhar `/api` para a URL publicada da Vistor.ia API.

## Estrutura

```text
src/app/core       Autenticação, modelos, guards e acesso à API
src/app/features   Páginas e fluxos funcionais
src/app/layout     Estrutura da área autenticada
src/app/shared     Recursos compartilhados
```
