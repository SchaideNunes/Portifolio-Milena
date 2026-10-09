/* ==========================================================================
   MILENA REIS ARQUITETURA — PÁGINA DE PROJETOS (projetos.html)

   Lê dados/projetos.json e monta filtros, grade e modal de detalhe.
   Para adicionar ou retirar um projeto basta editar o JSON: nada aqui muda.
   O endereço projetos.html#id-do-projeto abre direto o detalhe (compartilhável).

   Depende de js/script.js (window.MilenaSite: sobreposições e WhatsApp).
   ========================================================================== */
(function () {
  "use strict";

  const ARQUIVO_DE_DADOS = "dados/projetos.json";
  const FILTRO_TODOS = "Todos";
  const { abrirSobreposicao, fecharSobreposicao, abrirWhatsApp } = window.MilenaSite;

  const grade = document.getElementById("grade-projetos");
  const filtrosEl = document.getElementById("projetos-filtros");
  const contagemEl = document.getElementById("projetos-contagem");
  const avisoEl = document.getElementById("projetos-aviso");
  const modal = document.getElementById("modal-projeto");
  if (!grade || !modal) return;

  let projetos = [];
  let filtroAtual = FILTRO_TODOS;

  // Cria um elemento já com classe e texto (textContent: o JSON nunca vira HTML)
  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function mostrarAviso(texto) {
    avisoEl.textContent = texto;
    avisoEl.hidden = false;
  }

  /* --- Grade --- */
  const observadorDeEntrada = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observadorDeEntrada.unobserve(entrada.target);
      });
    },
    { threshold: 0.1 },
  );

  function criarCartao(projeto, indice) {
    const capa = projeto.imagens[0];
    const cartao = criar("a", "cartao-projeto");
    cartao.href = `#${projeto.id}`;
    cartao.style.transitionDelay = `${(indice % 3) * 80}ms`; // leve cascata por linha

    const img = document.createElement("img");
    img.src = encodeURI(capa.src);
    img.alt = capa.alt || projeto.titulo;
    img.loading = "lazy";
    img.decoding = "async";

    const info = criar("div", "cartao-projeto-info");
    const textos = criar("div");
    textos.append(
      criar("p", "carta-categoria", [projeto.categoria, projeto.local].filter(Boolean).join(" · ")),
      criar("h2", "carta-titulo", projeto.titulo),
    );
    if (projeto.ano) textos.append(criar("p", "carta-ano", projeto.ano));
    const icone = criar("span", "galeria-icone-expandir", "+");
    icone.setAttribute("aria-hidden", "true");
    info.append(textos, icone);

    cartao.append(img, info);
    return cartao;
  }

  function renderizarGrade() {
    const visiveis = projetos.filter((p) => filtroAtual === FILTRO_TODOS || p.categoria === filtroAtual);

    observadorDeEntrada.disconnect();
    grade.replaceChildren(...visiveis.map(criarCartao));
    grade.querySelectorAll(".cartao-projeto").forEach((cartao) => observadorDeEntrada.observe(cartao));

    contagemEl.textContent = `${visiveis.length} ${visiveis.length === 1 ? "projeto" : "projetos"}`;
  }

  /* --- Filtros (as categorias saem do próprio JSON) --- */
  function renderizarFiltros() {
    const categorias = [FILTRO_TODOS, ...new Set(projetos.map((p) => p.categoria).filter(Boolean))];
    if (categorias.length <= 2) return; // uma categoria só: filtro não faz sentido

    categorias.forEach((categoria) => {
      const botao = criar("button", "filtro-projeto", categoria);
      botao.type = "button";
      botao.setAttribute("aria-pressed", String(categoria === filtroAtual));
      botao.addEventListener("click", () => {
        filtroAtual = categoria;
        filtrosEl.querySelectorAll(".filtro-projeto").forEach((b) => {
          b.setAttribute("aria-pressed", String(b === botao));
        });
        renderizarGrade();
      });
      filtrosEl.append(botao);
    });
  }

  /* --- Modal de detalhe --- */
  const imgModal = document.getElementById("modal-projeto-imagem");
  const navegacao = document.getElementById("modal-projeto-navegacao");
  const contador = document.getElementById("modal-projeto-contador");
  const fichaEl = document.getElementById("modal-projeto-ficha");
  let projetoAberto = null;
  let fotoAtual = 0;

  function mostrarFoto(indice) {
    const fotos = projetoAberto.imagens;
    fotoAtual = (indice + fotos.length) % fotos.length; // dá a volta nas pontas
    imgModal.src = encodeURI(fotos[fotoAtual].src);
    imgModal.alt = fotos[fotoAtual].alt || projetoAberto.titulo;
    contador.textContent = `${fotoAtual + 1} / ${fotos.length}`;
  }

  function abrirProjeto(projeto) {
    projetoAberto = projeto;
    document.getElementById("modal-projeto-categoria").textContent = projeto.categoria || "Projeto";
    document.getElementById("modal-projeto-titulo").textContent = projeto.titulo;
    document.getElementById("modal-projeto-descricao").textContent = projeto.descricao || "";

    // Ficha técnica: só os campos que o projeto tiver
    const campos = [["Local", projeto.local], ["Ano", projeto.ano], ["Área", projeto.area]].filter(([, valor]) => valor);
    fichaEl.replaceChildren(...campos.map(([rotulo, valor]) => {
      const item = criar("div");
      item.append(criar("dt", "", rotulo), criar("dd", "", valor));
      return item;
    }));
    fichaEl.hidden = campos.length === 0;

    navegacao.hidden = projeto.imagens.length < 2;
    mostrarFoto(0);
    abrirSobreposicao(modal, { focarEm: modal.querySelector(".modal-fechar"), aoFechar: fecharProjeto });
  }

  function fecharProjeto() {
    fecharSobreposicao(modal);
    projetoAberto = null;
    // Tira o #id da URL sem criar entrada no histórico nem rolar a página
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }

  // A URL manda: clicar num cartão muda o hash, e o hash abre o projeto
  function sincronizarComHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const projeto = projetos.find((p) => p.id === id);
    if (projeto) abrirProjeto(projeto);
    else if (projetoAberto) fecharProjeto(); // ex.: botão "voltar" do navegador
  }

  modal.querySelector(".modal-fechar").addEventListener("click", fecharProjeto);
  modal.querySelector(".modal-overlay").addEventListener("click", fecharProjeto);
  document.getElementById("modal-projeto-anterior").addEventListener("click", () => mostrarFoto(fotoAtual - 1));
  document.getElementById("modal-projeto-proxima").addEventListener("click", () => mostrarFoto(fotoAtual + 1));
  document.addEventListener("keydown", (e) => {
    if (!projetoAberto || projetoAberto.imagens.length < 2) return;
    if (e.key === "ArrowLeft") mostrarFoto(fotoAtual - 1);
    if (e.key === "ArrowRight") mostrarFoto(fotoAtual + 1);
  });
  document.getElementById("modal-projeto-cta").addEventListener("click", () => {
    abrirWhatsApp(`Olá Milena! Vi o projeto *${projetoAberto.titulo}* no seu site e quero um projeto assim. Podemos conversar?`);
  });
  window.addEventListener("hashchange", sincronizarComHash);

  /* --- Carga dos dados --- */
  fetch(ARQUIVO_DE_DADOS)
    .then((resposta) => {
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return resposta.json();
    })
    .then((dados) => {
      // Projeto sem id, título ou foto é ignorado em vez de quebrar a página
      projetos = (dados.projetos || []).filter((p) => p.id && p.titulo && Array.isArray(p.imagens) && p.imagens.length > 0);
      if (projetos.length === 0) {
        mostrarAviso("Em breve, novos projetos por aqui.");
        return;
      }
      renderizarFiltros();
      renderizarGrade();
      sincronizarComHash();
    })
    .catch((erro) => {
      console.error("Não foi possível carregar os projetos:", erro);
      mostrarAviso("Não foi possível carregar os projetos agora. Tente recarregar a página.");
    });
})();
