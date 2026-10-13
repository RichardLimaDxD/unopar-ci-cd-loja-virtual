'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calcularSubtotal,
  aplicarCupom,
  calcularFrete,
  calcularTotal
} = require('../src/carrinho');

describe('Carrinho - testes unitários', () => {
  it('calcula o subtotal somando preço x quantidade', () => {
    const itens = [
      { preco: 59.9, quantidade: 2 },
      { preco: 39.9, quantidade: 1 }
    ];
    assert.equal(calcularSubtotal(itens), 159.7);
  });

  it('retorna subtotal zero para carrinho vazio', () => {
    assert.equal(calcularSubtotal([]), 0);
  });

  it('rejeita item com quantidade inválida', () => {
    assert.throws(() => calcularSubtotal([{ preco: 10, quantidade: 0 }]), /Quantidade inválida/);
  });

  it('aplica o cupom UNOPAR10 com 10% de desconto', () => {
    assert.deepEqual(aplicarCupom(150, 'UNOPAR10'), { desconto: 15, subtotalComDesconto: 135 });
  });

  it('aplica o cupom BEMVINDO com R$ 20,00 de desconto fixo', () => {
    assert.deepEqual(aplicarCupom(100, 'bemvindo'), { desconto: 20, subtotalComDesconto: 80 });
  });

  it('lança erro para cupom inválido', () => {
    assert.throws(() => aplicarCupom(100, 'CUPOMFALSO'), /Cupom inválido/);
  });

  it('cobra frete de R$ 19,90 para compras abaixo de R$ 200,00', () => {
    assert.equal(calcularFrete(199.99), 19.9);
  });

  it('concede frete grátis para compras a partir de R$ 200,00', () => {
    assert.equal(calcularFrete(200), 0);
  });

  it('calcula o total com desconto, frete e arredondamento em 2 casas', () => {
    const itens = [{ preco: 129, quantidade: 2 }];
    assert.deepEqual(calcularTotal(itens, 'UNOPAR10'), {
      subtotal: 258,
      desconto: 25.8,
      frete: 0,
      total: 232.2
    });
    assert.deepEqual(calcularTotal([{ preco: 59.9, quantidade: 1 }, { preco: 39.9, quantidade: 1 }]), {
      subtotal: 99.8,
      desconto: 0,
      frete: 19.9,
      total: 119.7
    });
  });
});
