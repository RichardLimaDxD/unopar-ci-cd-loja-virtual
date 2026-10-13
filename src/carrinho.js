'use strict';

/**
 * Regras de negócio do carrinho de compras.
 * Funções puras (sem efeitos colaterais), fáceis de testar unitariamente.
 */

const FRETE_GRATIS_A_PARTIR_DE = 200;
const VALOR_FRETE = 19.9;

const CUPONS = {
  UNOPAR10: { tipo: 'percentual', valor: 10 },
  BEMVINDO: { tipo: 'fixo', valor: 20 }
};

/** Arredonda um valor monetário para 2 casas decimais. */
function arredondar(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Soma preço x quantidade de cada item.
 * @param {Array<{preco:number, quantidade:number}>} itens
 */
function calcularSubtotal(itens) {
  if (!Array.isArray(itens)) {
    throw new Error('Itens do carrinho inválidos');
  }
  const soma = itens.reduce((total, item) => {
    if (typeof item.preco !== 'number' || item.preco < 0) {
      throw new Error('Preço inválido');
    }
    if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      throw new Error('Quantidade inválida');
    }
    return total + item.preco * item.quantidade;
  }, 0);
  return arredondar(soma);
}

/**
 * Aplica um cupom de desconto ao subtotal.
 * Retorna { desconto, subtotalComDesconto }. Cupom inválido lança erro.
 * @param {number} subtotal
 * @param {string} [cupom]
 */
function aplicarCupom(subtotal, cupom) {
  if (!cupom) {
    return { desconto: 0, subtotalComDesconto: arredondar(subtotal) };
  }
  const regra = CUPONS[String(cupom).trim().toUpperCase()];
  if (!regra) {
    throw new Error(`Cupom inválido: ${cupom}`);
  }
  let desconto = regra.tipo === 'percentual' ? (subtotal * regra.valor) / 100 : regra.valor;
  desconto = Math.min(desconto, subtotal);
  return {
    desconto: arredondar(desconto),
    subtotalComDesconto: arredondar(subtotal - desconto)
  };
}

/**
 * Frete grátis a partir de R$ 200,00; abaixo disso, R$ 19,90.
 * Carrinho vazio não paga frete.
 * @param {number} subtotal
 */
function calcularFrete(subtotal) {
  if (subtotal <= 0) {
    return 0;
  }
  if (subtotal > FRETE_GRATIS_A_PARTIR_DE) {
    return 0;
  }
  return VALOR_FRETE;
}

/**
 * Calcula todos os totais do carrinho.
 * O frete é calculado sobre o subtotal já com desconto.
 * @returns {{subtotal:number, desconto:number, frete:number, total:number}}
 */
function calcularTotal(itens, cupom) {
  const subtotal = calcularSubtotal(itens);
  const { desconto, subtotalComDesconto } = aplicarCupom(subtotal, cupom);
  const frete = calcularFrete(subtotalComDesconto);
  return {
    subtotal,
    desconto,
    frete,
    total: arredondar(subtotalComDesconto + frete)
  };
}

module.exports = {
  CUPONS,
  FRETE_GRATIS_A_PARTIR_DE,
  VALOR_FRETE,
  arredondar,
  calcularSubtotal,
  aplicarCupom,
  calcularFrete,
  calcularTotal
};
