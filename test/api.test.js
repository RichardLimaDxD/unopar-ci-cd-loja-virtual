'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { version } = require('../package.json');

describe('API da Loja Virtual - testes de integração', () => {
  it('GET /api/health responde com status ok e a versão', async () => {
    const resposta = await request(app).get('/api/health');
    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, { status: 'ok', versao: version });
  });

  it('GET /api/produtos lista todos os produtos do catálogo', async () => {
    const resposta = await request(app).get('/api/produtos');
    assert.equal(resposta.status, 200);
    assert.equal(resposta.body.length, 6);
  });

  it('GET /api/produtos?categoria=acessorios filtra por categoria', async () => {
    const resposta = await request(app).get('/api/produtos?categoria=acessorios');
    assert.equal(resposta.status, 200);
    assert.ok(resposta.body.length > 0);
    assert.ok(resposta.body.every((p) => p.categoria === 'acessorios'));
  });

  it('GET /api/produtos/:id retorna 404 para produto inexistente', async () => {
    const resposta = await request(app).get('/api/produtos/999');
    assert.equal(resposta.status, 404);
    assert.equal(resposta.body.erro, 'Produto não encontrado');
  });

  it('POST /api/carrinho/total calcula os totais com cupom', async () => {
    const resposta = await request(app)
      .post('/api/carrinho/total')
      .send({ itens: [{ id: 2, quantidade: 2 }, { id: 6, quantidade: 1 }], cupom: 'BEMVINDO' });
    assert.equal(resposta.status, 200);
    assert.deepEqual(resposta.body, { subtotal: 159.7, desconto: 20, frete: 19.9, total: 159.6 });
  });

  it('POST /api/carrinho/total retorna 400 para produto desconhecido', async () => {
    const resposta = await request(app)
      .post('/api/carrinho/total')
      .send({ itens: [{ id: 999, quantidade: 1 }] });
    assert.equal(resposta.status, 400);
  });

  it('POST /api/carrinho/total retorna 400 para estoque insuficiente', async () => {
    const resposta = await request(app)
      .post('/api/carrinho/total')
      .send({ itens: [{ id: 6, quantidade: 3 }] });
    assert.equal(resposta.status, 400);
    assert.match(resposta.body.erro, /Estoque insuficiente/);
  });

  it('POST /api/carrinho/total retorna 400 para cupom inválido', async () => {
    const resposta = await request(app)
      .post('/api/carrinho/total')
      .send({ itens: [{ id: 1, quantidade: 1 }], cupom: 'INVALIDO' });
    assert.equal(resposta.status, 400);
    assert.match(resposta.body.erro, /Cupom inválido/);
  });
});
