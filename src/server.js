'use strict';

const app = require('./app');

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Loja Virtual UNOPAR rodando em http://localhost:${PORTA}`);
});
