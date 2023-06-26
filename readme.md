# Node MVC WebApp

Node MVC WebApp é um aplicativo modelo usando [Node.js](https://nodejs.org/en) e padrão arquitetural [MVC](https://pt.wikipedia.org/wiki/MVC)

## Instalação

Use o node package manager [npm](https://www.npmjs.com/) para instalar as dependências.


```bash
npm install
```

## Depedencias

As instalar antes de iniciar o index.js.
Se caso necessário renovar alguma dependência.

#### Express
```bash
npm install express@4.18.2
```

#### Express-session
```bash
npm install express-session@1.17.3
```

#### Mustache-express
```bash
npm install mustache-express@1.3.2
```

#### Sequelize
```bash
npm install sequelize@6.31.1
```

#### Sqlite3
```bash
npm install sqlite3@5.1.6
```

## Uso

Inicilize a aplicação usando o node.js

```bash
node index.js
```

Teste a funcionalidade de [cadastro](http://localhost:8000/pessoa/cadastrar) e [lista](http://localhost:8000/pessoa/listar) de pessoa
