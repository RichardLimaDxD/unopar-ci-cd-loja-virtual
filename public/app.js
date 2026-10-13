'use strict';

// Estado do carrinho no navegador: { [idProduto]: quantidade }
const carrinho = {};
let produtosCarregados = [];
let cupomAplicado = '';

const formatarMoeda = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function mostrarMensagem(texto, tipo = 'danger') {
  const alerta = document.getElementById('mensagem');
  alerta.className = `alert alert-${tipo}`;
  alerta.textContent = texto;
}

function criarCard(produto) {
  const coluna = document.createElement('div');
  coluna.className = 'col-12 col-sm-6 col-lg-4';
  coluna.innerHTML = `
    <div class="card h-100 shadow-sm card-produto">
      <div class="card-img-top imagem-produto">${produto.imagem}</div>
      <div class="card-body d-flex flex-column">
        <span class="badge text-bg-secondary align-self-start mb-2 text-capitalize">${produto.categoria}</span>
        <h5 class="card-title">${produto.nome}</h5>
        <p class="card-text text-muted small flex-grow-1">${produto.descricao}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="fs-5 fw-bold text-primary">${formatarMoeda(produto.preco)}</span>
          <small class="text-muted">${produto.estoque} em estoque</small>
        </div>
        <button class="btn btn-primary mt-3" data-id="${produto.id}">Adicionar ao carrinho</button>
      </div>
    </div>`;
  coluna.querySelector('button').addEventListener('click', () => adicionarAoCarrinho(produto.id));
  return coluna;
}

async function carregarProdutos(categoria = '') {
  try {
    const url = categoria ? `/api/produtos?categoria=${encodeURIComponent(categoria)}` : '/api/produtos';
    const resposta = await fetch(url);
    const produtos = await resposta.json();
    if (!categoria) {
      produtosCarregados = produtos;
    }
    const lista = document.getElementById('lista-produtos');
    lista.innerHTML = '';
    produtos.forEach((p) => lista.appendChild(criarCard(p)));
  } catch {
    mostrarMensagem('Não foi possível carregar os produtos. Tente novamente.');
  }
}

function adicionarAoCarrinho(id) {
  const produto = produtosCarregados.find((p) => p.id === id);
  const atual = carrinho[id] || 0;
  if (produto && atual + 1 > produto.estoque) {
    mostrarMensagem(`Estoque insuficiente para ${produto.nome}.`, 'warning');
    return;
  }
  carrinho[id] = atual + 1;
  atualizarCarrinho();
}

function removerDoCarrinho(id) {
  delete carrinho[id];
  atualizarCarrinho();
}

function renderizarItens() {
  const ids = Object.keys(carrinho).map(Number);
  const corpo = document.getElementById('itens-carrinho');
  corpo.innerHTML = '';
  ids.forEach((id) => {
    const produto = produtosCarregados.find((p) => p.id === id);
    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>${produto.imagem} ${produto.nome}</td>
      <td class="text-center">${carrinho[id]}</td>
      <td class="text-end">${formatarMoeda(produto.preco * carrinho[id])}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-danger" title="Remover">&times;</button></td>`;
    linha.querySelector('button').addEventListener('click', () => removerDoCarrinho(id));
    corpo.appendChild(linha);
  });

  const quantidadeTotal = ids.reduce((soma, id) => soma + carrinho[id], 0);
  document.getElementById('contador-carrinho').textContent = quantidadeTotal;
  document.getElementById('carrinho-vazio').classList.toggle('d-none', ids.length > 0);
  document.getElementById('tabela-carrinho').classList.toggle('d-none', ids.length === 0);
  document.getElementById('finalizar').disabled = ids.length === 0;
  return ids;
}

function exibirTotais({ subtotal = 0, desconto = 0, frete = 0, total = 0 }) {
  document.getElementById('valor-subtotal').textContent = formatarMoeda(subtotal);
  document.getElementById('valor-desconto').textContent = `- ${formatarMoeda(desconto)}`;
  document.getElementById('valor-frete').textContent = frete === 0 && subtotal > 0 ? 'Grátis' : formatarMoeda(frete);
  document.getElementById('valor-total').textContent = formatarMoeda(total);
}

// Os totais são sempre calculados pela API (regra de negócio no servidor)
async function atualizarCarrinho() {
  const ids = renderizarItens();
  const erroCupom = document.getElementById('erro-cupom');
  erroCupom.textContent = '';
  if (ids.length === 0) {
    exibirTotais({});
    return;
  }
  const itens = ids.map((id) => ({ id, quantidade: carrinho[id] }));
  const resposta = await fetch('/api/carrinho/total', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itens, cupom: cupomAplicado || undefined })
  });
  const dados = await resposta.json();
  if (!resposta.ok) {
    erroCupom.textContent = dados.erro;
    if (cupomAplicado) {
      cupomAplicado = '';
      atualizarCarrinho().then(() => {
        erroCupom.textContent = dados.erro;
      });
    }
    return;
  }
  exibirTotais(dados);
}

async function carregarVersao() {
  try {
    const resposta = await fetch('/api/health');
    const { versao } = await resposta.json();
    document.getElementById('versao-api').textContent = `v${versao}`;
  } catch {
    document.getElementById('versao-api').textContent = 'indisponível';
  }
}

document.getElementById('form-cupom').addEventListener('submit', (evento) => {
  evento.preventDefault();
  cupomAplicado = document.getElementById('cupom').value.trim();
  atualizarCarrinho();
});

document.getElementById('filtros').addEventListener('click', (evento) => {
  const botao = evento.target.closest('button');
  if (!botao) return;
  document.querySelectorAll('#filtros button').forEach((b) => b.classList.remove('active'));
  botao.classList.add('active');
  carregarProdutos(botao.dataset.categoria);
});

document.getElementById('finalizar').addEventListener('click', () => {
  mostrarMensagem('Pedido realizado com sucesso! (simulação)', 'success');
  Object.keys(carrinho).forEach((id) => delete carrinho[id]);
  cupomAplicado = '';
  document.getElementById('cupom').value = '';
  atualizarCarrinho();
});

carregarProdutos();
carregarVersao();
