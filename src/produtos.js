'use strict';

/**
 * Catálogo de produtos em memória (simula um banco de dados).
 */
const produtos = [
  {
    id: 1,
    nome: 'Notebook Estudante',
    descricao: 'Notebook 14" com 8 GB de RAM e SSD de 256 GB, ideal para os estudos.',
    preco: 2499.9,
    categoria: 'informatica',
    estoque: 5,
    imagem: '💻'
  },
  {
    id: 2,
    nome: 'Mouse sem fio',
    descricao: 'Mouse óptico sem fio com receptor USB e 1600 DPI.',
    preco: 59.9,
    categoria: 'informatica',
    estoque: 30,
    imagem: '🖱️'
  },
  {
    id: 3,
    nome: 'Fone de ouvido Bluetooth',
    descricao: 'Fone com cancelamento de ruído e bateria de 20 horas.',
    preco: 189.9,
    categoria: 'audio',
    estoque: 12,
    imagem: '🎧'
  },
  {
    id: 4,
    nome: 'Livro: Engenharia de Software',
    descricao: 'Livro de referência sobre processos ágeis, DevOps e qualidade.',
    preco: 129.0,
    categoria: 'livros',
    estoque: 8,
    imagem: '📘'
  },
  {
    id: 5,
    nome: 'Mochila para notebook',
    descricao: 'Mochila resistente à água com compartimento acolchoado.',
    preco: 149.5,
    categoria: 'acessorios',
    estoque: 15,
    imagem: '🎒'
  },
  {
    id: 6,
    nome: 'Caneca DevOps',
    descricao: 'Caneca de porcelana 350 ml com a frase "Funciona na minha máquina".',
    preco: 39.9,
    categoria: 'acessorios',
    estoque: 2,
    imagem: '☕'
  }
];

function listarProdutos(categoria) {
  if (!categoria) {
    return produtos;
  }
  return produtos.filter((p) => p.categoria === String(categoria).toLowerCase());
}

function buscarProdutoPorId(id) {
  return produtos.find((p) => p.id === Number(id));
}

module.exports = { produtos, listarProdutos, buscarProdutoPorId };
