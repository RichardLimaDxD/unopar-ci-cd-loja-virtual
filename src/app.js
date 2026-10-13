'use strict';

const path = require('node:path');
const express = require('express');
const { version } = require('../package.json');
const { listarProdutos, buscarProdutoPorId } = require('./produtos');
const { calcularTotal } = require('./carrinho');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Verificação de saúde usada pelo HEALTHCHECK do Docker e pelo smoke test do pipeline
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', versao: version });
});

app.get('/api/produtos', (req, res) => {
  res.json(listarProdutos(req.query.categoria));
});

app.get('/api/produtos/:id', (req, res) => {
  const produto = buscarProdutoPorId(req.params.id);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }
  return res.json(produto);
});

app.post('/api/carrinho/total', (req, res) => {
  const { itens, cupom } = req.body || {};

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Informe ao menos um item no carrinho' });
  }

  const itensComPreco = [];
  for (const item of itens) {
    const quantidade = Number(item && item.quantidade);
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({ erro: 'Quantidade inválida' });
    }
    const produto = buscarProdutoPorId(item.id);
    if (!produto) {
      return res.status(400).json({ erro: `Produto ${item.id} não encontrado` });
    }
    if (quantidade > produto.estoque) {
      return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}` });
    }
    itensComPreco.push({ preco: produto.preco, quantidade });
  }

  try {
    return res.json(calcularTotal(itensComPreco, cupom));
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

module.exports = app;
