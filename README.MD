# Daily Diet API — Ignite Node.js (Desafio 02)

> API REST para controle de dieta diária, construída com **Fastify**, **Knex** e **TypeScript**. Desafio do módulo *Criando APIs RESTful com Node.js* da trilha de Node.js da Rocketseat (Ignite).

## Sobre o projeto

Este é o desafio do módulo de **APIs RESTful** da formação de Node.js da Rocketseat. Depois do desafio anterior, feito só com os módulos nativos do Node, aqui a proposta é construir uma API REST de verdade usando as ferramentas do ecossistema: **Fastify** para o servidor e o roteamento, **Knex** como query builder e para as **migrations**, identificação de usuário por **cookie de sessão**, validação com **Zod** e **testes automatizados**.

Um ponto importante do desafio: a partir dele a Rocketseat **não entrega mais as rotas e os campos prontos** — só as regras de negócio. Toda a estruturação (desenho das rotas, modelagem das tabelas, organização do código) ficou por minha conta.

## Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** — servidor HTTP e roteamento
- **Knex** — query builder e migrations
- **SQLite** 
- **Zod** — validação de dados de entrada e das variáveis de ambiente
- **@fastify/cookie** — identificação de sessão
- **Vitest** + **Supertest** — testes de integração
- **ESLint** (neostandard) — padronização de código

## Funcionalidades

- **Criar um usuário** e identificá-lo entre as requisições por meio de um `sessionId` em cookie
- **Registrar uma refeição** vinculada ao usuário, com nome, descrição, data/hora e se está dentro ou fora da dieta
- **Listar**, **visualizar**, **editar** e **apagar** refeições
- **Métricas do usuário**: total de refeições, quantas dentro e fora da dieta, e a melhor sequência de refeições dentro da dieta
- **Controle de acesso**: cada usuário só consegue visualizar, editar e apagar as refeições que ele mesmo criou

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/users` | Cria um usuário e define o cookie de sessão |
| `POST` | `/meals` | Registra uma refeição do usuário |
| `GET` | `/meals` | Lista todas as refeições do usuário |
| `GET` | `/meals/:id` | Retorna uma refeição específica do usuário |
| `PUT` | `/meals/:id` | Edita uma refeição do usuário |
| `DELETE` | `/meals/:id` | Remove uma refeição do usuário |
| `GET` | `/meals/metrics` | Retorna as métricas do usuário |

> Todas as rotas de `/meals` exigem um usuário identificado (cookie de sessão válido).
> Cada refeição é composta por: `id`, `name`, `description`, `eaten_in`, `is_diet` e `user_id`.

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/luanlgarcia/rocketseat-nodejs-02-api-rest.git
cd rocketseat-nodejs-02-api-rest

# 2. Instale as dependências
npm install

# 3. Crie os arquivos de ambiente a partir dos exemplos
cp .env.example .env
cp .env.test.example .env.test

# 4. Rode as migrations
npm run knex migrate:latest

# 5. Suba o servidor (porta 3333 por padrão)
npm run dev
```

## Testes

Os testes são de **integração**: sobem a aplicação, batem nas rotas HTTP reais e usam um banco de teste isolado, que é recriado a cada teste (rollback + migrate) para garantir independência entre eles.

```bash
npm test
```

## Regras da aplicação (desafio)

- [x] Deve ser possível criar um usuário
- [x] Deve ser possível identificar o usuário entre as requisições
- [x] Deve ser possível registrar uma refeição feita (nome, descrição, data e hora, dentro ou não da dieta), relacionada a um usuário
- [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
- [x] Deve ser possível apagar uma refeição
- [x] Deve ser possível listar todas as refeições de um usuário
- [x] Deve ser possível visualizar uma única refeição
- [x] Deve ser possível recuperar as métricas de um usuário
  - [x] Quantidade total de refeições registradas
  - [x] Quantidade total de refeições dentro da dieta
  - [x] Quantidade total de refeições fora da dieta
  - [x] Melhor sequência de refeições dentro da dieta
- [x] O usuário só pode visualizar, editar e apagar as refeições que ele criou
