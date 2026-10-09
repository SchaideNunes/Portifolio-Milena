/* ==========================================================================
   MILENA REIS ARQUITETURA — INTERAÇÕES

   Carregado em todas as páginas; cada função sai cedo se o elemento não existir.

   1. Configuração          6. Vídeo 3D (scroll-scrub)
   2. Sobreposições         7. Galeria + modal
   3. Preloader             8. Wizard de orçamento
   4. Menu e navegação      9. Formulário de contato
   5. Animações de scroll  10. Inicialização
   ========================================================================== */
(function () {
  "use strict";

  /* --- 1. CONFIGURAÇÃO --- */
  const CONFIG = {
    // Número que recebe o wizard de orçamento e o formulário de contato (DDI + DDD + número)
    whatsapp: "5571986773387",
  };

  const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function abrirWhatsApp(texto) {
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener");
  }

  /* --- 2. SOBREPOSIÇÕES (menu mobile, modais e wizard) ---
     Todas compartilham a trava de scroll: a página só volta a rolar quando
     nenhuma estiver aberta. Fechadas, ficam com `inert` para não receberem
     foco pelo teclado. A pilha guarda a ordem de abertura: Esc fecha a do topo. */
  const abertas = []; // { el, aoFechar, focoAnterior }

  function atualizarTravaDeScroll() {
    const travar = abertas.length > 0;
    document.body.classList.toggle("no-scroll", travar);
    document.documentElement.classList.toggle("no-scroll", travar);
  }

  // `aoFechar` é a função de fechar daquela sobreposição (usada pelo Esc)
  function abrirSobreposicao(el, { focarEm, aoFechar } = {}) {
    if (!el || el.classList.contains("ativo")) return;
    abertas.push({ el, aoFechar, focoAnterior: document.activeElement });
    el.inert = false;
    el.classList.add("ativo");
    atualizarTravaDeScroll();
    if (focarEm) focarEm.focus({ preventScroll: true });
  }

  function fecharSobreposicao(el) {
    const indice = abertas.findIndex((item) => item.el === el);
    if (indice === -1) return;
    const [{ focoAnterior }] = abertas.splice(indice, 1);
    el.classList.remove("ativo");
    el.inert = true;
    atualizarTravaDeScroll();
    if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus({ preventScroll: true });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || abertas.length === 0) return;
    const topo = abertas[abertas.length - 1];
    if (topo.aoFechar) topo.aoFechar();
    else fecharSobreposicao(topo.el);
  });

  // Usado pelas outras páginas (ex.: js/projetos.js)
  window.MilenaSite = { abrirSobreposicao, fecharSobreposicao, abrirWhatsApp, menosMovimento };

  /* --- 3. PRELOADER (planta baixa desenhada com GSAP) --- */
  function animarPreloader() {
    const tela = document.getElementById("tela-carregamento");
    if (!tela) return;

    // Sem GSAP (CDN fora do ar) ou com movimento reduzido: vai direto para o site
    if (typeof gsap === "undefined" || menosMovimento) {
      tela.remove();
      return;
    }

    // Cada traço começa "apagado": o dashoffset igual ao comprimento esconde a linha
    const todasLinhas = [
      ".planta-parede-externa", ".planta-parede-interna", ".planta-linha-porta",
      ".planta-arco-porta", ".planta-janela-a", ".planta-janela-b",
      ".planta-degrau", ".planta-borda-escada", ".planta-cota-linha",
      ".planta-cota-tick", ".planta-norte-circulo", ".planta-norte-linha",
      ".planta-escala-linha", ".planta-escala-tick",
    ];
    document.querySelectorAll(todasLinhas.join(", ")).forEach((el) => {
      const comprimento = el.getTotalLength ? el.getTotalLength() : 200;
      el.style.strokeDasharray = comprimento;
      el.style.strokeDashoffset = comprimento;
    });

    // Contador de porcentagem
    const contadorEl = document.getElementById("contador-numero");
    const contador = { valor: 0 };
    gsap.to(contador, {
      valor: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onStart: () => gsap.to(".preloader-contador", { opacity: 1, duration: 0.4 }),
      onUpdate: () => {
        if (contadorEl) contadorEl.textContent = Math.round(contador.valor);
      },
    });

    function sairDoPreloader() {
      gsap.to(tela, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => tela.remove(),
      });
    }

    // Ordem do desenho: paredes, portas, janelas, escada, cotas, norte e por fim a logo
    const tl = gsap.timeline({ onComplete: sairDoPreloader });
    tl.timeScale(2.5);
    tl.to(".planta-parede-externa", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" })
      .to(".planta-parede-interna", { strokeDashoffset: 0, duration: 0.7, ease: "power2.out", stagger: 0.15 }, "-=0.3")
      .to(".planta-linha-porta", { strokeDashoffset: 0, duration: 0.3, stagger: 0.1, ease: "power1.out" }, "-=0.2")
      .to(".planta-arco-porta", { strokeDashoffset: 0, duration: 0.45, stagger: 0.12, ease: "power1.inOut" }, "-=0.2")
      .to(".planta-janela-a, .planta-janela-b", { strokeDashoffset: 0, duration: 0.35, ease: "power1.out", stagger: 0.06 }, "-=0.1")
      .to(".planta-borda-escada", { strokeDashoffset: 0, duration: 0.3, ease: "power1.out" }, "-=0.1")
      .to(".planta-degrau", { strokeDashoffset: 0, duration: 0.12, ease: "none", stagger: 0.06 }, "-=0.2")
      .to(".planta-cota-linha, .planta-cota-tick, .planta-escala-linha, .planta-escala-tick", { strokeDashoffset: 0, duration: 0.4, ease: "power1.out", stagger: 0.04 }, "-=0.1")
      .to(".planta-norte-circulo, .planta-norte-linha", { strokeDashoffset: 0, duration: 0.4, ease: "power1.out", stagger: 0.08 }, "-=0.3")
      .to(".planta-norte-texto, .planta-escala-texto", { opacity: 0.7, duration: 0.4, stagger: 0.1 }, "-=0.1")
      .fromTo(".preloader-logo-img", { opacity: 0, filter: "blur(12px)", y: 10 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9, ease: "power2.out" }, "-=0.1")
      .to({}, { duration: 0.6 });
  }

  /* --- 4. MENU E NAVEGAÇÃO --- */
  function menuAoRolar() {
    const menuTopo = document.getElementById("menu-topo");
    if (!menuTopo) return;
    const atualizar = () => menuTopo.classList.toggle("rolou", window.scrollY > 60);
    window.addEventListener("scroll", atualizar, { passive: true });
    atualizar();
  }

  function menuHamburguer() {
    const btn = document.getElementById("btn-hamburguer");
    const overlay = document.getElementById("menu-mobile-overlay");
    if (!btn || !overlay) return;

    function abrirMenu() {
      abrirSobreposicao(overlay, { aoFechar: fecharMenu });
      btn.classList.add("ativo");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fechar menu");
    }

    function fecharMenu() {
      fecharSobreposicao(overlay);
      btn.classList.remove("ativo");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menu");
    }

    btn.addEventListener("click", () => {
      if (overlay.classList.contains("ativo")) fecharMenu();
      else abrirMenu();
    });

    // Fecha ao clicar fora do painel ou em qualquer link
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest("a")) fecharMenu();
    });
  }

  function scrollSuaveDosLinks() {
    document.querySelectorAll('a[href^="#"]:not(.pular-conteudo)').forEach((link) => {
      link.addEventListener("click", (e) => {
        const alvo = link.getAttribute("href");
        const destino = alvo.length > 1 ? document.querySelector(alvo) : null;
        if (!destino) return;
        e.preventDefault();
        destino.scrollIntoView({ behavior: menosMovimento ? "auto" : "smooth", block: "start" });
      });
    });
  }

  // A faixa tem o conteúdo uma vez no HTML; a cópia fecha o loop do translateX(-50%)
  function duplicarFaixaRolante() {
    const conteudo = document.querySelector(".faixa-rolante-conteudo");
    if (!conteudo) return;
    Array.from(conteudo.children).forEach((item) => conteudo.appendChild(item.cloneNode(true)));
  }

  /* --- 5. ANIMAÇÕES DE SCROLL --- */

  // Adiciona .visivel quando o elemento entra na tela (o CSS faz a transição)
  function animarAoEntrarNaTela() {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) entrada.target.classList.add("visivel");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    // Os serviços têm observador próprio (entrada em cascata)
    document
      .querySelectorAll(".animar-subindo:not(.servico-item), .animar-da-esquerda, .animar-da-direita, .entrada-blur")
      .forEach((el) => observador.observe(el));
  }

  // Títulos .texto-merge: as palavras sobem ao entrar e descem ao sair da tela
  function animarTextoPalavras() {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => entrada.target.classList.toggle("visivel", entrada.isIntersecting));
      },
      { threshold: 0.3 },
    );
    document.querySelectorAll(".texto-merge").forEach((el) => observador.observe(el));
  }

  // Cada card de serviço entra 100ms depois do anterior
  function animarServicosEmCascata() {
    const itens = Array.from(document.querySelectorAll(".servico-item"));
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.style.transitionDelay = `${itens.indexOf(entrada.target) * 100}ms`;
          entrada.target.classList.add("visivel");
        });
      },
      { threshold: 0.15 },
    );
    itens.forEach((item) => observador.observe(item));
  }

  // Foto do "Sobre" se desloca levemente em relação à rolagem
  function paralaxeDaFotoSobre() {
    const secao = document.getElementById("secao-sobre");
    const foto = document.querySelector(".sobre-foto-principal");
    if (!secao || !foto || menosMovimento) return;

    window.addEventListener("scroll", () => {
      const deslocamento = -secao.getBoundingClientRect().top * 0.08;
      foto.style.transform = `translateY(${deslocamento}px)`;
    }, { passive: true });
  }

  // Contadores das estatísticas: sobem de 0 até data-valor uma única vez
  function contarNumeros() {
    const bloco = document.querySelector(".sobre-estatisticas");
    if (!bloco) return;

    function animarNumero(el, valorFinal, duracao = 1800) {
      const sufixo = el.getAttribute("data-sufixo") || "";
      if (menosMovimento) {
        el.textContent = valorFinal + sufixo;
        return;
      }
      let inicio = 0;
      const passo = (agora) => {
        if (!inicio) inicio = agora;
        const progresso = Math.min((agora - inicio) / duracao, 1);
        const suavizado = 1 - Math.pow(1 - progresso, 3); // easing cúbico
        el.textContent = (progresso < 1 ? Math.floor(suavizado * valorFinal) : valorFinal) + sufixo;
        if (progresso < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.querySelectorAll(".estatistica-numero").forEach((num) => {
            animarNumero(num, parseInt(num.getAttribute("data-valor") || num.textContent, 10));
          });
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.5 },
    );
    observador.observe(bloco);
  }

  // Profundidade de campo: seções longe do centro da tela ficam levemente desfocadas.
  // Só no desktop (>900px). Atenção: escreve filter/opacity inline em toda <section>
  // (exceto as marcadas com data-sem-desfoque, para seções muito altas).
  function desfoqueEntreSecoes() {
    if (menosMovimento) return;
    const secoes = document.querySelectorAll("section:not([data-sem-desfoque])");
    if (secoes.length === 0) return;

    function aplicarDesfoque() {
      if (window.innerWidth <= 900) {
        secoes.forEach((secao) => {
          secao.style.filter = "none";
          secao.style.opacity = "1";
        });
        return;
      }

      const alturaViewport = window.innerHeight;
      const distanciaMax = alturaViewport * 0.8;
      secoes.forEach((secao) => {
        const posicao = secao.getBoundingClientRect();
        const centroDaSecao = posicao.top + posicao.height / 2;
        const distanciaDoMeio = Math.abs(centroDaSecao - alturaViewport / 2);
        const intensidade = Math.max(0, (distanciaDoMeio / distanciaMax - 0.6) * 8);

        secao.style.filter = `blur(${Math.min(intensidade, 4)}px)`;
        secao.style.opacity = Math.max(0.5, 1 - intensidade * 0.04);
      });
    }

    window.addEventListener("scroll", aplicarDesfoque, { passive: true });
  }

  /* --- 6. VÍDEO 3D (scroll-scrub) ---
     A seção fica fixa (pin) e o progresso da rolagem vira o currentTime do vídeo.
     O vídeo precisa ter keyframes densos (arquivo *_kf) para o seek ser fluido. */
  function animarVideoModuloScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    const secao = document.getElementById("secao-modelo-3d");
    const video = document.getElementById("video-3d");
    if (!secao || !video) return;

    gsap.registerPlugin(ScrollTrigger);

    // iOS Safari só libera o seek depois de um play(): toca e pausa em seguida
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.load();
    const tentativa = video.play();
    if (tentativa !== undefined) {
      tentativa.then(() => video.pause()).catch(() => video.pause());
    }

    function iniciarScrub() {
      const ehMobile = window.innerWidth <= 768;
      let tempoAlvo = 0;

      // Pré-carrega o vídeo 2 telas antes de chegar na seção
      ScrollTrigger.create({
        trigger: secao,
        start: "top 200%",
        once: true,
        onEnter: () => {
          if (video.paused) video.load();
        },
      });

      // O seek acontece num loop próprio e só quando o anterior terminou:
      // evita engasgos do decoder quando a rolagem é rápida
      function atualizarTempoDoVideo() {
        const pronto = !isNaN(video.duration) && video.duration > 0 && !video.seeking;
        if (pronto && Math.abs(video.currentTime - tempoAlvo) > 0.03) {
          video.currentTime = tempoAlvo;
        }
        requestAnimationFrame(atualizarTempoDoVideo);
      }
      requestAnimationFrame(atualizarTempoDoVideo);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: secao,
          start: "top top",
          end: ehMobile ? "+=2400" : "+=3000",
          scrub: ehMobile ? 0.6 : 1.2,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            if (!isNaN(video.duration) && video.duration > 0) {
              tempoAlvo = self.progress * video.duration;
            }
          },
        },
      });

      // Frases: cada uma entra e sai em um trecho da timeline (posições de 0 a ~1)
      const escondida = { opacity: 0, y: 40, filter: "blur(12px)" };
      const frases = [
        { seletor: "#texto-engaja-1", entra: 0.05, sai: 0.25 },
        { seletor: "#texto-engaja-2", entra: 0.40, sai: 0.58 },
        { seletor: "#texto-engaja-3", entra: 0.72, sai: 0.88 },
      ];
      frases.forEach(({ seletor, entra, sai }) => {
        tl.fromTo(seletor, escondida,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.12, ease: "power2.out" }, entra)
          .to(seletor,
            { opacity: 0, y: -40, filter: "blur(12px)", duration: 0.12, ease: "power2.in" }, sai);
      });

      // Botão final: entra e permanece
      tl.fromTo("#cta-engaja",
        { opacity: 0, y: 50, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.15, ease: "power3.out" }, 0.95);
    }

    if (video.readyState >= 1) iniciarScrub(); // 1 = HAVE_METADATA
    else video.addEventListener("loadedmetadata", iniciarScrub, { once: true });
  }

  /* --- 7. GALERIA (carrossel arrastável com auto-scroll) + MODAL --- */
  function iniciarGaleria() {
    const container = document.querySelector(".galeria-marquee-container");
    const trilha = document.getElementById("galeria-trilha");
    const modal = document.getElementById("modal-galeria");
    if (!container || !trilha) return;

    // Loop infinito: duplica as fotos e volta meia trilha quando chega na metade
    Array.from(trilha.children).forEach((foto) => {
      const copia = foto.cloneNode(true);
      copia.setAttribute("aria-hidden", "true");
      copia.tabIndex = -1;
      trilha.appendChild(copia);
    });

    const VELOCIDADE = 0.5; // px por frame
    let arrastando = false;
    let arrastou = false; // diferencia arrasto de clique
    let pausado = false;
    let inicioX = 0;
    let scrollInicial = 0;

    function autoScroll() {
      if (!arrastando && !pausado) {
        container.scrollLeft += VELOCIDADE;
        const metade = trilha.scrollWidth / 2;
        if (container.scrollLeft >= metade) container.scrollLeft -= metade;
      }
      requestAnimationFrame(autoScroll);
    }
    if (!menosMovimento) requestAnimationFrame(autoScroll);

    function iniciarArrasto(pageX) {
      arrastando = true;
      arrastou = false;
      inicioX = pageX - container.offsetLeft;
      scrollInicial = container.scrollLeft;
    }

    function moverArrasto(pageX, fator) {
      const distancia = pageX - container.offsetLeft - inicioX;
      if (Math.abs(distancia) > 5) arrastou = true;
      container.scrollLeft = scrollInicial - distancia * fator;
    }

    const encerrarArrasto = () => { arrastando = false; };

    // Mouse
    container.addEventListener("mousedown", (e) => iniciarArrasto(e.pageX));
    container.addEventListener("mousemove", (e) => {
      if (!arrastando) return;
      e.preventDefault();
      moverArrasto(e.pageX, 2);
    });
    container.addEventListener("mouseup", encerrarArrasto);
    container.addEventListener("mouseleave", encerrarArrasto);

    // Toque
    container.addEventListener("touchstart", (e) => iniciarArrasto(e.touches[0].pageX), { passive: true });
    container.addEventListener("touchmove", (e) => {
      if (arrastando) moverArrasto(e.touches[0].pageX, 1.5);
    }, { passive: true });
    container.addEventListener("touchend", encerrarArrasto);

    // --- Modal: abre com os dados (data-titulo / data-desc) da foto clicada ---
    if (!modal) return;
    const btnFechar = modal.querySelector(".modal-fechar");
    const imgModal = modal.querySelector(".modal-imagem img");
    const tituloModal = modal.querySelector(".modal-titulo");
    const descModal = modal.querySelector(".modal-descricao");

    function abrirModal(foto) {
      const img = foto.querySelector("img");
      imgModal.src = img.currentSrc || img.src;
      imgModal.alt = img.alt;
      tituloModal.textContent = foto.getAttribute("data-titulo");
      descModal.textContent = foto.getAttribute("data-desc");
      pausado = true;
      abrirSobreposicao(modal, { focarEm: btnFechar, aoFechar: fecharModal });
    }

    function fecharModal() {
      pausado = false;
      fecharSobreposicao(modal);
    }

    trilha.addEventListener("click", (e) => {
      const foto = e.target.closest(".galeria-foto");
      if (foto && !arrastou) abrirModal(foto);
    });
    trilha.addEventListener("keydown", (e) => {
      const foto = e.target.closest(".galeria-foto");
      if (!foto || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      abrirModal(foto);
    });
    btnFechar.addEventListener("click", fecharModal);
    modal.querySelector(".modal-overlay").addEventListener("click", fecharModal);

    return fecharModal;
  }

  /* --- 8. WIZARD DE ORÇAMENTO (3 passos -> WhatsApp) --- */
  function iniciarWizard(fecharModalGaleria) {
    const wizard = document.getElementById("wizard-orcamento");
    const form = document.getElementById("form-orcamento");
    if (!wizard || !form) return;

    const TOTAL_PASSOS = 3;
    let passoAtual = 1;

    function irParaPasso(passo) {
      passoAtual = passo;
      wizard.querySelectorAll(".wizard-passo").forEach((el) => el.classList.remove("ativo"));
      const alvo = document.getElementById(`passo-${passo}`);
      if (alvo) alvo.classList.add("ativo");

      // Barra de progresso: acende até o passo atual
      for (let i = 1; i <= TOTAL_PASSOS; i++) {
        const ativo = i <= passo;
        const barra = document.getElementById(`trilha-${i}`);
        const label = document.getElementById(`label-trilha-${i}`);
        if (barra) barra.classList.toggle("ativo", ativo);
        if (label) label.classList.toggle("ativo", ativo);
      }
    }

    function abrirWizard() {
      if (fecharModalGaleria) fecharModalGaleria(); // "Quero um espaço assim" abre o wizard a partir do modal
      form.reset();
      irParaPasso(1);
      abrirSobreposicao(wizard, { focarEm: wizard.querySelector(".wizard-fechar"), aoFechar: fecharWizard });
    }

    function fecharWizard() {
      fecharSobreposicao(wizard);
    }

    function enviarOrcamento() {
      const campoNome = document.getElementById("orcamento-nome");
      const dados = new FormData(form);
      const valor = (campo, padrao) => (dados.get(campo) || "").toString().trim() || padrao;

      campoNome.value = campoNome.value.trim();
      if (!campoNome.reportValidity()) return;

      const linhas = [
        "*Nova Solicitação de Projeto*",
        "",
        `Olá Milena! Me chamo *${campoNome.value}*.`,
        "",
        "*Detalhes:* ",
        `- *Tipo:* ${valor("tipoProjeto", "Arquitetura")}`,
        `- *Local:* ${valor("local", "Não informado")}`,
        `- *Interesse:* ${valor("ambientes", "Não detalhado")}`,
        `- *Email:* ${valor("email", "Não informado")}`,
      ];
      const telefone = valor("telefone", "");
      if (telefone) linhas.push(`- *WhatsApp:* ${telefone}`);
      linhas.push("", "Aguardo seu contato para conversarmos mais sobre!");

      abrirWhatsApp(linhas.join("\n"));
    }

    document.querySelectorAll("[data-abrir-wizard]").forEach((el) => el.addEventListener("click", abrirWizard));
    wizard.querySelectorAll("[data-fechar-wizard]").forEach((el) => el.addEventListener("click", fecharWizard));
    wizard.querySelectorAll("[data-ir-passo]").forEach((el) => {
      el.addEventListener("click", () => irParaPasso(Number(el.getAttribute("data-ir-passo"))));
    });
    // Passo 1: escolher o tipo já avança (click, e não change, para avançar também ao voltar)
    form.querySelectorAll('input[name="tipoProjeto"]').forEach((radio) => {
      radio.addEventListener("click", () => irParaPasso(2));
    });
    // Enter nos campos: avança de passo; no último, envia
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (passoAtual < TOTAL_PASSOS) irParaPasso(passoAtual + 1);
      else enviarOrcamento();
    });

    aplicarMascaraTelefone(document.getElementById("orcamento-telefone"));
  }

  // Formata enquanto digita: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  function aplicarMascaraTelefone(input) {
    if (!input) return;

    input.addEventListener("input", () => {
      let valor = input.value.replace(/\D/g, "").slice(0, 11);

      if (valor.length > 10) valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      else if (valor.length > 6) valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      else if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      else if (valor.length > 0) valor = valor.replace(/^(\d{0,2})/, "($1");

      input.value = valor;
    });
  }

  /* --- 9. FORMULÁRIO DE CONTATO (-> WhatsApp) --- */
  function iniciarFormularioContato() {
    const form = document.getElementById("form-contato");
    if (!form) return;

    // Os campos obrigatórios (nome e mensagem) são validados pelo navegador via `required`
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const dados = new FormData(form);
      const valor = (campo, padrao) => (dados.get(campo) || "").toString().trim() || padrao;

      const texto = [
        "*Nova Mensagem de Contato*",
        "",
        `Olá Milena! Me chamo *${valor("nome", "")}*.`,
        "",
        `*Assunto:* ${valor("assunto", "Arquitetura")}`,
        `*Email:* ${valor("email", "Não informado")}`,
        "",
        "*Mensagem:*",
        valor("mensagem", ""),
        "",
        "Aguardo seu retorno!",
      ].join("\n");

      abrirWhatsApp(texto);
    });
  }

  /* --- 10. INICIALIZAÇÃO --- */
  // Espera a página carregar por completo para o preloader e o pin do vídeo medirem o layout final
  window.addEventListener("load", () => {
    animarPreloader();
    menuAoRolar();
    menuHamburguer();
    scrollSuaveDosLinks();
    duplicarFaixaRolante();

    animarAoEntrarNaTela();
    animarTextoPalavras();
    animarServicosEmCascata();
    paralaxeDaFotoSobre();
    contarNumeros();
    desfoqueEntreSecoes();
    animarVideoModuloScroll();

    const fecharModalGaleria = iniciarGaleria();
    iniciarWizard(fecharModalGaleria);
    iniciarFormularioContato();
  });
})();
