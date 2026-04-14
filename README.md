<p align="center">
  <img src=".github/preview.png" width="200" alt="HelpDesk" />
</p>

<p align="center">
 <img src="https://img.shields.io/static/v1?label=PRs&message=welcome&color=5165E1&labelColor=000000" alt="PRs welcome!" />

  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=5165E1&labelColor=000000">
</p>

# HelpDesk API

Back-end de um aplicativo de gerenciamento de chamados com painel de Administrador, Técnico e Cliente (também conhecido como HelpDesk) desenvolvido em Typescript, Zod e bcrypt.

## Tecnologias

- NodeJs
- Express
- Prisma ORM
- PostgreSQL
- ZOD
- Jest
- bcrypt
  
## Executando

Clonando o repositório

```sh
$ git clone https://github.com/jessebenevenuto/fullstack-challenge-api-helpdesk.git
$ cd caminho-do-projeto/fullstack-challenge-api-helpdesk
```

Instalando as dependências

```sh
npm install
```

Configurando o ambiente

```sh
DATABASE_URL="postgres://postgres:postgres@localhost:5432/helpdesk?schema=public"
JWT_SECRET="sua_chave_secreta"
PORT=3333
ADMIN_PASSWORD="sua_senha_de_admin"
```

Este projeto depende do Docker para configurar o banco de dados. Com o Docker instalado, clone o projeto, instale as dependências, configure os contêineres Docker e execute a aplicação.

> Você também precisa executar migrações para criar tabelas no banco de dados e executar o seed para preencher o banco de dados com dados fictícios.

```sh
$ docker compose up -d
$ npx prisma migrate deploy
$ npx prisma db seed
```

Rodando o projeto

```sh
$ npm run dev
```

Rodando os teste

```sh
npm run test:dev
```

## 📝 Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](.github/LICENSE.md) para mais detalhes.

---

Feito com 💜 by Rocketseat :wave: [Participe da nossa comunidade!](https://discordapp.com/invite/gCRAFhc)

<!--START_SECTION:footer-->

<br />
<br />

<p align="center">
  <a href="https://discord.gg/rocketseat" target="_blank">
    <img align="center" src="https://storage.googleapis.com/golden-wind/comunidade/rodape.svg" alt="banner"/>
  </a>
