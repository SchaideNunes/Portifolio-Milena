/* ==========================================================================
   MILENA REIS ARQUITETURA — PAINEL DE PROJETOS (admin.html)

   Fluxo: login -> lista -> editor. As mudanças ficam só no navegador até
   "Publicar no site", que envia as fotos novas e grava tudo em um único
   commit no GitHub (funções em /api); a Vercel republica em ~1 minuto.

   1. Estado e utilitários    4. Editor de projeto
   2. API e login             5. Fotos (conversão no navegador)
   3. Lista de projetos       6. Publicação
   ========================================================================== */
(function () {
  "use strict";

  /* --- 1. ESTADO E UTILITÁRIOS --- */
  const CHAVE_TOKEN = "painelToken";
  const LARGURA_MAXIMA = 1920;        // px: fotos maiores são reduzidas
  const TAMANHO_MAXIMO = 2.5 * 1024 * 1024; // bytes por foto, depois de convertida
  const MAXIMO_DE_FOTOS = 20;

  let token = sessionStorage.getItem(CHAVE_TOKEN);
  let projetos = [];       // cópia de trabalho (o que aparece na tela)
  let publicados = "[]";   // JSON do que está no site, para saber se há mudanças
  let versao = null;       // sha do projetos.json carregado (evita sobrescrever mudanças alheias)
  let emEdicao = null;     // { original: projeto | null, imagens: [...] }

  // Fotos adicionadas nesta sessão: src -> { arquivo: Blob, url: objectURL, blob: sha no GitHub }
  const fotosNovas = new Map();

  const $ = (id) => document.getElementById(id);
  const telas = { login: $("tela-login"), lista: $("tela-lista"), editor: $("tela-editor") };

  function criar(tag, classe, texto) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function mostrarTela(nome) {
    Object.entries(telas).forEach(([chave, el]) => { el.hidden = chave !== nome; });
    window.scrollTo(0, 0);
    atualizarBarraDePublicacao();
  }

  let temporizadorDoAviso;
  function avisar(texto, { erro = false, fixo = false } = {}) {
    const aviso = $("admin-aviso");
    aviso.textContent = texto;
    aviso.classList.toggle("erro", erro);
    aviso.hidden = false;
    clearTimeout(temporizadorDoAviso);
    if (!fixo) temporizadorDoAviso = setTimeout(() => { aviso.hidden = true; }, erro ? 8000 : 5000);
  }

  function mostrarErro(el, texto) {
    el.textContent = texto || "";
    el.hidden = !texto;
  }

  // "Casa do Lago 2" -> "casa-do-lago-2"
  function slug(texto) {
    return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "projeto";
  }

  // Foto ainda não publicada usa a prévia local; as demais vêm do próprio site
  const urlDaFoto = (src) => (fotosNovas.has(src) ? fotosNovas.get(src).url : encodeURI(src));

  const haMudancas = () => JSON.stringify(projetos) !== publicados;

  /* --- 2. API E LOGIN --- */
  async function api(caminho, { method = "GET", body } = {}) {
    let resposta;
    try {
      resposta = await fetch(caminho, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error("Sem conexão. Confira a internet e tente de novo.");
    }

    const dados = await resposta.json().catch(() => null);
    if (resposta.status === 401 && token) {
      sair();
      throw new Error("Sua sessão expirou. Entre novamente.");
    }
    if (!resposta.ok || !dados) {
      // 404 sem JSON = as funções /api não existem (ex.: servidor local estático)
      throw new Error((dados && dados.erro) || "O painel só funciona no site publicado na Vercel.");
    }
    return dados;
  }

  function sair() {
    token = null;
    sessionStorage.removeItem(CHAVE_TOKEN);
    $("login-senha").value = "";
    mostrarTela("login");
  }

  async function carregarProjetos() {
    const dados = await api("/api/projetos");
    projetos = dados.projetos;
    publicados = JSON.stringify(projetos);
    versao = dados.versao;
    renderizarLista();
    mostrarTela("lista");
  }

  $("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const botao = e.target.querySelector("button");
    mostrarErro($("login-erro"), "");
    botao.disabled = true;
    try {
      token = (await api("/api/login", { method: "POST", body: { senha: $("login-senha").value } })).token;
      sessionStorage.setItem(CHAVE_TOKEN, token);
      await carregarProjetos();
    } catch (erro) {
      mostrarErro($("login-erro"), erro.message);
    } finally {
      botao.disabled = false;
    }
  });

  $("btn-sair").addEventListener("click", () => {
    if (haMudancas() && !confirm("Há alterações não publicadas. Sair mesmo assim?")) return;
    sair();
  });

  /* --- 3. LISTA DE PROJETOS --- */
  function botaoIcone(simbolo, rotulo, aoClicar, desativado = false) {
    const botao = criar("button", "admin-icone", simbolo);
    botao.type = "button";
    botao.setAttribute("aria-label", rotulo);
    botao.disabled = desativado;
    botao.addEventListener("click", aoClicar);
    return botao;
  }

  function mover(lista, indice, passo) {
    const destino = indice + passo;
    if (destino < 0 || destino >= lista.length) return;
    [lista[indice], lista[destino]] = [lista[destino], lista[indice]];
  }

  function renderizarLista() {
    const lista = $("lista-projetos");
    $("lista-contagem").textContent = `${projetos.length} ${projetos.length === 1 ? "projeto" : "projetos"}`;

    if (projetos.length === 0) {
      lista.replaceChildren(criar("li", "admin-vazio", "Nenhum projeto ainda. Clique em “+ Novo projeto” para começar."));
      atualizarBarraDePublicacao();
      return;
    }

    lista.replaceChildren(...projetos.map((projeto, indice) => {
      const item = criar("li", "admin-item");

      const capa = criar("img", "admin-item-capa");
      capa.src = urlDaFoto(projeto.imagens[0].src);
      capa.alt = "";
      capa.loading = "lazy";

      const textos = criar("div");
      textos.append(
        criar("h2", "admin-item-titulo", projeto.titulo),
        criar("p", "admin-item-detalhe", [projeto.categoria, projeto.local, projeto.ano].filter(Boolean).join(" · ")),
      );

      const acoes = criar("div", "admin-item-acoes");
      const editar = criar("button", "admin-link", "Editar");
      editar.type = "button";
      editar.addEventListener("click", () => abrirEditor(projeto));
      const excluir = criar("button", "admin-link admin-link-perigo", "Excluir");
      excluir.type = "button";
      excluir.addEventListener("click", () => {
        if (!confirm(`Excluir o projeto “${projeto.titulo}”?`)) return;
        projetos.splice(indice, 1);
        renderizarLista();
      });
      acoes.append(
        botaoIcone("↑", `Subir ${projeto.titulo}`, () => { mover(projetos, indice, -1); renderizarLista(); }, indice === 0),
        botaoIcone("↓", `Descer ${projeto.titulo}`, () => { mover(projetos, indice, 1); renderizarLista(); }, indice === projetos.length - 1),
        editar,
        excluir,
      );

      item.append(capa, textos, acoes);
      return item;
    }));
    atualizarBarraDePublicacao();
  }

  $("btn-novo").addEventListener("click", () => abrirEditor(null));

  /* --- 4. EDITOR DE PROJETO --- */
  const campos = {
    titulo: $("campo-titulo"), categoria: $("campo-categoria"), local: $("campo-local"),
    ano: $("campo-ano"), area: $("campo-area"), descricao: $("campo-descricao"),
  };

  function abrirEditor(projeto) {
    // As fotos são editadas numa cópia: "Cancelar" não mexe no projeto
    emEdicao = { original: projeto, imagens: projeto ? projeto.imagens.map((i) => ({ ...i })) : [] };
    $("editor-titulo").textContent = projeto ? "Editar projeto" : "Novo projeto";
    Object.entries(campos).forEach(([nome, campo]) => {
      campo.value = projeto && projeto[nome] !== undefined ? projeto[nome] : "";
    });

    const categorias = [...new Set(projetos.map((p) => p.categoria).filter(Boolean))];
    $("lista-categorias").replaceChildren(...categorias.map((categoria) => {
      const opcao = criar("option");
      opcao.value = categoria;
      return opcao;
    }));

    mostrarErro($("editor-erro"), "");
    renderizarFotos();
    mostrarTela("editor");
  }

  function fecharEditor() {
    emEdicao = null;
    renderizarLista();
    mostrarTela("lista");
  }

  function renderizarFotos() {
    const { imagens } = emEdicao;
    $("editor-fotos").replaceChildren(...imagens.map((imagem, indice) => {
      const foto = criar("div", "admin-foto");

      const img = criar("img");
      img.src = urlDaFoto(imagem.src);
      img.alt = "";
      foto.append(img);
      if (indice === 0) foto.append(criar("span", "admin-foto-capa", "Capa"));

      const acoes = criar("div", "admin-foto-acoes");
      acoes.append(
        botaoIcone("←", "Mover foto para antes", () => { mover(imagens, indice, -1); renderizarFotos(); }, indice === 0),
        botaoIcone("→", "Mover foto para depois", () => { mover(imagens, indice, 1); renderizarFotos(); }, indice === imagens.length - 1),
        botaoIcone("✕", "Remover foto", () => { imagens.splice(indice, 1); renderizarFotos(); }),
      );

      const descricao = criar("input");
      descricao.type = "text";
      descricao.maxLength = 200;
      descricao.placeholder = "O que aparece na foto (opcional)";
      descricao.setAttribute("aria-label", "Descrição da foto");
      descricao.value = imagem.alt || "";
      descricao.addEventListener("input", () => { imagem.alt = descricao.value; });

      foto.append(acoes, descricao);
      return foto;
    }));
  }

  $("form-projeto").addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = campos.titulo.value.trim();
    const categoria = campos.categoria.value.trim();
    const ano = campos.ano.value.trim();

    if (!titulo) return mostrarErro($("editor-erro"), "Dê um título ao projeto.");
    if (!categoria) return mostrarErro($("editor-erro"), "Informe a categoria (ex.: Residencial).");
    if (ano && !/^(19|20)\d{2}$/.test(ano)) return mostrarErro($("editor-erro"), "O ano precisa ter 4 dígitos (ex.: 2026).");
    if (emEdicao.imagens.length === 0) return mostrarErro($("editor-erro"), "Adicione pelo menos uma foto.");

    const { original } = emEdicao;
    // O id vira o endereço do projeto (projetos.html#id): nasce do título e não muda mais
    let id = original ? original.id : slug(titulo);
    if (!original) {
      const base = id;
      for (let n = 2; projetos.some((p) => p.id === id); n++) id = `${base}-${n}`;
    }

    const projeto = {
      id,
      titulo,
      categoria,
      local: campos.local.value.trim() || undefined,
      ano: ano ? Number(ano) : undefined,
      area: campos.area.value.trim() || undefined,
      descricao: campos.descricao.value.trim() || undefined,
      imagens: emEdicao.imagens.map((i) => ({ src: i.src, alt: (i.alt || "").trim() || titulo })),
    };

    if (original) projetos[projetos.indexOf(original)] = projeto;
    else projetos.unshift(projeto); // projeto novo entra no topo da página
    return fecharEditor();
  });

  $("btn-cancelar").addEventListener("click", fecharEditor);
  $("btn-voltar").addEventListener("click", fecharEditor);

  /* --- 5. FOTOS (reduzidas e convertidas no navegador antes de enviar) --- */
  async function converterFoto(arquivo) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
    } catch (e) {
      throw new Error(`Não foi possível ler “${arquivo.name}”. Use fotos JPG ou PNG.`);
    }

    const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // Safari antigo não gera WebP (devolve PNG): nesse caso cai para JPEG
    for (const tipo of ["image/webp", "image/jpeg"]) {
      for (const qualidade of [0.82, 0.7, 0.55]) {
        const blob = await new Promise((resolver) => canvas.toBlob(resolver, tipo, qualidade));
        if (blob && blob.type === tipo && blob.size <= TAMANHO_MAXIMO) return blob;
      }
    }
    throw new Error(`A foto “${arquivo.name}” é grande demais mesmo depois de reduzida.`);
  }

  $("campo-fotos").addEventListener("change", async (e) => {
    const arquivos = [...e.target.files];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    const rotulo = $("enviar-rotulo");
    mostrarErro($("editor-erro"), "");

    for (const [indice, arquivo] of arquivos.entries()) {
      if (emEdicao.imagens.length >= MAXIMO_DE_FOTOS) {
        mostrarErro($("editor-erro"), `Cada projeto aceita até ${MAXIMO_DE_FOTOS} fotos.`);
        break;
      }
      rotulo.textContent = `Preparando foto ${indice + 1} de ${arquivos.length}…`;
      try {
        const blob = await converterFoto(arquivo);
        const extensao = blob.type === "image/webp" ? "webp" : "jpg";
        // Nome único: o título pode mudar depois e duas fotos podem ter o mesmo nome de arquivo
        const sufixo = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const src = `assets/projetos/${slug(campos.titulo.value || "projeto")}-${sufixo}.${extensao}`;
        fotosNovas.set(src, { arquivo: blob, url: URL.createObjectURL(blob), blob: null });
        emEdicao.imagens.push({ src, alt: "" });
        renderizarFotos();
      } catch (erro) {
        mostrarErro($("editor-erro"), erro.message);
      }
    }
    rotulo.textContent = "+ Adicionar fotos";
  });

  function emBase64(blob) {
    return new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(leitor.result.split(",")[1]); // tira o "data:...;base64,"
      leitor.onerror = () => rejeitar(new Error("Não foi possível ler a foto."));
      leitor.readAsDataURL(blob);
    });
  }

  /* --- 6. PUBLICAÇÃO --- */
  function atualizarBarraDePublicacao() {
    // No editor a barra some: primeiro salva o projeto, depois publica
    $("barra-publicar").hidden = !haMudancas() || telas.lista.hidden;
  }

  async function publicar() {
    const botoes = [$("btn-publicar"), $("btn-descartar")];
    const texto = $("publicar-texto");
    const textoOriginal = texto.textContent;
    botoes.forEach((b) => { b.disabled = true; });

    try {
      // Só sobem as fotos novas que algum projeto ainda usa (e que não subiram numa tentativa anterior)
      const emUso = new Set(projetos.flatMap((p) => p.imagens.map((i) => i.src)));
      const pendentes = [...fotosNovas].filter(([src, foto]) => emUso.has(src) && !foto.publicada);
      for (const [indice, [, foto]] of pendentes.entries()) {
        texto.textContent = `Enviando foto ${indice + 1} de ${pendentes.length}…`;
        if (!foto.blob) {
          foto.blob = (await api("/api/imagem", { method: "POST", body: { conteudo: await emBase64(foto.arquivo) } })).blob;
        }
      }

      texto.textContent = "Publicando…";
      const resposta = await api("/api/projetos", {
        method: "POST",
        body: { projetos, versao, novasImagens: pendentes.map(([src, foto]) => ({ src, blob: foto.blob })) },
      });

      versao = resposta.versao;
      publicados = JSON.stringify(projetos);
      pendentes.forEach(([, foto]) => { foto.publicada = true; });
      avisar("Publicado! O site é atualizado em cerca de 1 minuto.");
    } catch (erro) {
      avisar(erro.message, { erro: true });
    } finally {
      texto.textContent = textoOriginal;
      botoes.forEach((b) => { b.disabled = false; });
      atualizarBarraDePublicacao();
    }
  }

  $("btn-publicar").addEventListener("click", publicar);
  $("btn-descartar").addEventListener("click", () => {
    if (!confirm("Descartar todas as alterações não publicadas?")) return;
    projetos = JSON.parse(publicados);
    renderizarLista();
  });

  // Fechar a aba com mudanças pendentes pede confirmação
  window.addEventListener("beforeunload", (e) => {
    if (haMudancas()) e.preventDefault();
  });

  /* --- Início: com sessão aberta vai direto para a lista --- */
  if (token) {
    carregarProjetos().catch((erro) => {
      if (token) { // sessão ainda válida: o problema é outro (rede, configuração)
        mostrarTela("login");
        mostrarErro($("login-erro"), erro.message);
      }
    });
  } else {
    mostrarTela("login");
  }
})();
