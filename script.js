/* ============================================
   MILENA REIS — Script Principal
   
   ÍNDICE DAS FUNÇÕES:
   1. animarPreloader()          → GSAP: planta baixa se desenha + logo aparece
   2. iniciarCursor()            → cursor mira CAD (+)
   3. menuAoRolar()              → navbar fica sólida ao rolar
   4. animarAoEntrarNaTela()     → scroll reveal geral
   5. animarTextoPalavras()      → efeito merge de palavras
   6. paralaxeAoRolar()          → imagens com parallax
   7. contarNumeros()            → animação dos números (87, 12...)
   8. galeriaArrastavel()        → drag scroll na galeria
   9. iniciar3D()                → modelo Three.js (maquete)
   10. scrollSuaveDosLinks()     → âncoras com scroll animado
   11. desfoqueEntreSecoes()     → blur nas seções ao rolar
   12. cliqueDasCartas()         → clique centraliza carta
   13. animarServicosEmCascata() → serviços aparecem um a um
============================================ */

(function () {
  "use strict";

  // 1. PRELOADER — PLANTA BAIXA ANIMADA COM GSAP
  // A planta se desenha como se uma mão a estivesse traçando,
  // depois a logo aparece e a tela some suavemente.
  function animarPreloader(aoTerminar) {
    const tela = document.getElementById("tela-carregamento");
    if (!tela) {
      if (aoTerminar) aoTerminar();
      return;
    }

    document.body.style.overflow = "hidden";

    function iniciarAnimacao() {
      if (typeof gsap === "undefined") {
        tela.remove();
        document.body.style.overflow = "";
        if (aoTerminar) aoTerminar();
        return;
      }

      // Todos os traços começam invisíveis (dashoffset = comprimento)
      const DASH = 2000;
      const todosOsTracados = [
        ".planta-parede-externa",
        ".planta-parede-interna",
        ".planta-linha-porta",
        ".planta-arco-porta",
        ".planta-janela-a",
        ".planta-janela-b",
        ".planta-degrau",
        ".planta-borda-escada",
        ".planta-cota-linha",
        ".planta-cota-tick",
        ".planta-norte-circulo",
        ".planta-norte-linha",
        ".planta-escala-linha",
        ".planta-escala-tick",
      ];
      gsap.set(todosOsTracados.join(","), {
        strokeDasharray: DASH,
        strokeDashoffset: DASH,
      });

      // SVG e logo começam invisíveis — fade de entrada suave
      gsap.set(".preloader-planta", { opacity: 0, scale: 0.97 });
      gsap.set(".preloader-logo-img", {
        opacity: 0,
        y: 16,
        filter: "blur(8px)",
      });
      gsap.set(".preloader-contador", { opacity: 0 });

      // Contador sobe de 0 a 100 durante toda a animação
      const contadorEl = document.getElementById("contador-numero");
      const objContador = { valor: 0 };

      // Timeline principal com defaults suaves
      const durTotal = 5.2; // duração total esperada da animação
      const tl = gsap.timeline({
        defaults: { ease: "sine.inOut" },
        onComplete: sairDoPreloader,
      });

      // — Fase 0: a planta surge do fade com escala suave
      tl.to(".preloader-planta", {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "power2.out",
      })

        // — Fase 1: paredes externas se desenham (o perímetro aparece devagar)
        .to(
          ".planta-parede-externa",
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power3.inOut",
          },
          "-=0.4",
        )

        // — Fase 2: divisões internas fluem logo depois
        .to(
          ".planta-parede-interna",
          {
            strokeDashoffset: 0,
            duration: 1.0,
            ease: "power2.inOut",
            stagger: 0.2,
          },
          "-=0.6",
        )

        // — Fase 3: portas — linha + arco em sequência fluida
        .to(
          ".planta-linha-porta",
          {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: "sine.out",
            stagger: 0.15,
          },
          "-=0.5",
        )
        .to(
          ".planta-arco-porta",
          {
            strokeDashoffset: 0,
            duration: 0.6,
            ease: "sine.inOut",
            stagger: 0.18,
          },
          "-=0.35",
        )

        // — Fase 4: janelas (dupla linha, quase simultâneas)
        .to(
          ".planta-janela-a, .planta-janela-b",
          {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: "sine.out",
            stagger: 0.05,
          },
          "-=0.4",
        )

        // — Fase 5: escada — bordas primeiro, depois degraus em cascata suave
        .to(
          ".planta-borda-escada",
          {
            strokeDashoffset: 0,
            duration: 0.45,
            ease: "sine.out",
          },
          "-=0.3",
        )
        .to(
          ".planta-degrau",
          {
            strokeDashoffset: 0,
            duration: 0.18,
            ease: "none",
            stagger: 0.07,
          },
          "-=0.3",
        )

        // — Fase 6: cotas e indicadores técnicos surgem juntos, devagar
        .to(
          ".planta-cota-linha, .planta-cota-tick, .planta-escala-linha, .planta-escala-tick",
          {
            strokeDashoffset: 0,
            duration: 0.55,
            ease: "sine.inOut",
            stagger: 0.04,
          },
          "-=0.2",
        )
        .to(
          ".planta-norte-circulo, .planta-norte-linha",
          {
            strokeDashoffset: 0,
            duration: 0.55,
            ease: "sine.inOut",
            stagger: 0.1,
          },
          "-=0.45",
        )

        // — Fase 7: textos N e escala pulsam em opacidade
        .to(
          ".planta-norte-texto, .planta-escala-texto",
          {
            opacity: 0.7,
            duration: 0.7,
            ease: "power1.inOut",
            stagger: 0.15,
          },
          "-=0.3",
        )

        // — Fase 8: contador aparece suavemente
        .to(
          ".preloader-contador",
          {
            opacity: 1,
            duration: 0.6,
            ease: "power1.out",
          },
          "<",
        )

        // — Fase 9: pausa para contemplar a planta completa
        .to({}, { duration: 0.5 })

        // — Fase 10: logo surge com desfoque saindo — momento elegante
        .to(".preloader-logo-img", {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power2.out",
        })

        // — Fase 11: breve pausa antes de sair
        .to({}, { duration: 0.7 });

      // Contador sincronizado com a timeline (começa junto com a planta)
      gsap.to(objContador, {
        valor: 100,
        duration: durTotal,
        ease: "power1.inOut",
        delay: 0.6, // começa junto com o fade da planta
        onUpdate: () => {
          if (contadorEl)
            contadorEl.textContent = Math.round(objContador.valor);
        },
      });

      // Saída cinematográfica: a planta dissolve primeiro, depois a tela inteira some
      function sairDoPreloader() {
        const tlSaida = gsap.timeline({
          onComplete: () => {
            tela.remove();
            document.body.style.overflow = "";
            if (aoTerminar) aoTerminar();
          },
        });

        tlSaida
          // Planta e logo dissolvem levemente
          .to(".preloader-planta, .preloader-logo-img", {
            opacity: 0,
            y: -12,
            duration: 0.7,
            ease: "power2.in",
            stagger: 0.1,
          })
          // Tela inteira some com fade suave
          .to(
            tela,
            {
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
            },
            "-=0.3",
          );
      }
    }

    if (document.readyState === "complete") {
      requestAnimationFrame(iniciarAnimacao);
    } else {
      window.addEventListener("load", () =>
        requestAnimationFrame(iniciarAnimacao),
      );
    }
  }

  // 2. CURSOR CAD — mira estilo AutoCAD
  // Segue o mouse direto, sem lag.
  // Abre a mira ao hover em links/botões.
  // Muda de cor em seções escuras.
  function iniciarCursor() {
    const cursorCad = document.getElementById("cursor-cad");
    if (!cursorCad) return;

    // Move a mira para a posição do mouse
    document.addEventListener("mousemove", (e) => {
      cursorCad.style.left = e.clientX + "px";
      cursorCad.style.top = e.clientY + "px";
    });

    // Mira abre ao passar sobre elementos clicáveis
    document
      .querySelectorAll("a, button, .carta-projeto, .galeria-foto")
      .forEach((el) => {
        el.addEventListener("mouseenter", () =>
          cursorCad.classList.add("ativo"),
        );
        el.addEventListener("mouseleave", () =>
          cursorCad.classList.remove("ativo"),
        );
      });

    // Troca cor da mira dependendo da seção (clara/escura)
    const secoesEscuras = ["secao-modelo-3d", "secao-servicos"];
    window.addEventListener("scroll", () => {
      const meioTela = window.innerHeight / 2;
      let emSecaoEscura = false;

      secoesEscuras.forEach((id) => {
        const secao = document.getElementById(id);
        if (!secao) return;
        const rect = secao.getBoundingClientRect();
        if (rect.top < meioTela && rect.bottom > meioTela) emSecaoEscura = true;
      });

      cursorCad.classList.toggle("claro", emSecaoEscura);
    });
  }

  /* ==========================================
     3. MENU AO ROLAR
     Adiciona fundo ao menu quando rola > 60px
  ========================================== */
  function menuAoRolar() {
    const menuTopo = document.getElementById("menu-topo");
    window.addEventListener("scroll", () => {
      menuTopo.classList.toggle("rolou", window.scrollY > 60);
    });
  }

  /* ==========================================
     4. ANIMAÇÕES AO ENTRAR NA TELA
     Observa os elementos com classes de animação
     e adiciona .visivel quando aparecem na tela
  ========================================== */
  function animarAoEntrarNaTela() {
    const observadorEntrada = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    // Seleciona todos os elementos com animação de scroll
    document
      .querySelectorAll(
        ".animar-subindo, .animar-da-esquerda, .animar-da-direita, .entrada-blur",
      )
      .forEach((elemento) => observadorEntrada.observe(elemento));
  }

  /* ==========================================
     5. EFEITO MERGE — PALAVRAS UMA A UMA
     Palavras com .palavra sobem em cascata
  ========================================== */
  function animarTextoPalavras() {
    // Já tem .palavra no HTML, só precisa observar
    const observadorMerge = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          entrada.target.classList.toggle("visivel", entrada.isIntersecting);
        });
      },
      { threshold: 0.3 },
    );

    document.querySelectorAll(".texto-merge").forEach((texto) => {
      observadorMerge.observe(texto);
    });
  }

  /* ==========================================
     6. EFEITO PARALAXE AO ROLAR
     A foto do hero e a foto "sobre" se movem
     em velocidades diferentes ao rolar
  ========================================== */
  function paralaxeAoRolar() {
    function calcularParalaxe() {
      const rolagem = window.scrollY;

      // Foto do hero se move mais devagar que o scroll
      const fotoHero = document.querySelector(".hero-foto-wrap img");
      if (fotoHero) {
        fotoHero.style.transform = `scale(1) translateY(${rolagem * 0.25}px)`;
      }

      // Foto da seção sobre tem movimento sutil
      const fotoSobre = document.querySelector(".sobre-foto-principal");
      if (fotoSobre) {
        const secaoSobre = document.getElementById("secao-sobre");
        const posicaoRelativa = secaoSobre.getBoundingClientRect().top;
        const deslocamento = -posicaoRelativa * 0.08;
        fotoSobre.style.transform = `translateY(${deslocamento}px)`;
      }
    }

    window.addEventListener("scroll", calcularParalaxe, { passive: true });
  }

  /* ==========================================
     7. ANIMAÇÃO DOS NÚMEROS (CONTADORES)
     Os números sobem de 0 até o valor final
     quando a seção de estatísticas aparece
  ========================================== */
  function contarNumeros() {
    function animarUmNumero(elemento, valorFinal, duracao = 1800) {
      let inicioTempo = 0;
      const passo = (timestamp) => {
        if (!inicioTempo) inicioTempo = timestamp;
        const progresso = Math.min((timestamp - inicioTempo) / duracao, 1);
        const valorSuavizado = 1 - Math.pow(1 - progresso, 3); // easing cúbico
        elemento.textContent = Math.floor(valorSuavizado * valorFinal);
        if (progresso < 1) requestAnimationFrame(passo);
        else elemento.textContent = valorFinal;
      };
      requestAnimationFrame(passo);
    }

    const observadorEstatisticas = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            const numeros = entrada.target.querySelectorAll(
              ".estatistica-numero",
            );
            numeros.forEach((num) => {
              const valorAlvo = parseInt(num.textContent);
              animarUmNumero(num, valorAlvo);
            });
            observadorEstatisticas.unobserve(entrada.target); // dispara só uma vez
          }
        });
      },
      { threshold: 0.5 },
    );

    const blocoEstatisticas = document.querySelector(".sobre-estatisticas");
    if (blocoEstatisticas) observadorEstatisticas.observe(blocoEstatisticas);
  }

  // 8. GALERIA COM SCROLL AUTOMÁTICO EM LOOP
  // Os cards rolam para a esquerda sozinhos.
  // Ao passar o mouse → pausa. Ao sair → continua.
  // Ao clicar → abre o modal do projeto.
  // A técnica de loop: duplicamos os filhos no DOM e
  // quando o scroll passa da metade, voltamos ao início
  // (imperceptível para o usuário).
  function galeriaArrastavel() {
    const trilha = document.getElementById("galeria-trilha");
    if (!trilha) return;

    // Duplica os cards para criar o efeito de loop infinito
    const fotosOriginais = Array.from(trilha.querySelectorAll(".galeria-foto"));
    fotosOriginais.forEach((foto) => {
      const clone = foto.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.dataset.clone = "true";
      trilha.appendChild(clone);
    });

    let pausado = false;
    let velocidade = 0.8; // px por frame
    let posicaoAtual = 0;

    // Calcula a largura de um conjunto de cards (metade do total)
    function larguraMetade() {
      return trilha.scrollWidth / 2;
    }

    // Loop de animação principal
    function scrollAutomatico() {
      if (!pausado) {
        posicaoAtual += velocidade;
        // Quando passa da metade (fim dos originais), volta ao início suavemente
        if (posicaoAtual >= larguraMetade()) {
          posicaoAtual = 0;
        }
        trilha.scrollLeft = posicaoAtual;
      }
      requestAnimationFrame(scrollAutomatico);
    }
    scrollAutomatico();

    // Pausa ao hover e retoma ao sair
    trilha.addEventListener("mouseenter", () => {
      pausado = true;
      trilha.classList.add("pausado");
    });
    trilha.addEventListener("mouseleave", () => {
      pausado = false;
      trilha.classList.remove("pausado");
    });

    // Mobile: toque pausa o scroll automático temporariamente
    trilha.addEventListener(
      "touchstart",
      () => {
        pausado = true;
      },
      { passive: true },
    );
    trilha.addEventListener("touchend", () => {
      setTimeout(() => {
        pausado = false;
      }, 1500);
    });
  }

  // 8b. MODAL DE PROJETO
  // Dados de cada projeto da galeria.
  // Quando o usuário clica em uma foto, o modal abre
  // com as informações do projeto correspondente.
  // Os campos no HTML (#modal-imagem, #modal-titulo...) são preenchidos via JS.
  function iniciarModalGaleria() {
    const dadosGaleria = [
      {
        imagem:
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=90",
        categoria: "Design de Interiores · Salvador, BA",
        titulo: "Matéria\ne Luz",
        ano: "2024",
        descricao:
          "Projeto de interiores residencial com foco na interação entre materiais naturais e a luz natural. Cada ambiente foi projetado para receber a luz em diferentes momentos do dia, criando uma experiência sensorial única ao longo das horas.",
        area: "180 m²",
        servico: "Design de Interiores",
        local: "Salvador, BA",
      },
      {
        imagem:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=90",
        categoria: "Arquitetura Residencial · Bahia",
        titulo: "Volumes\nSerenos",
        ano: "2024",
        descricao:
          "Residência unifamiliar projetada para criar sensação de calma e equilíbrio. Os volumes sólidos dialogam com aberturas estratégicas que enquadram a paisagem e trazem a natureza para dentro dos ambientes.",
        area: "320 m²",
        servico: "Projeto Arquitetônico",
        local: "Bahia",
      },
      {
        imagem:
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=90",
        categoria: "Interiores Minimalistas · São Paulo, SP",
        titulo: "Silêncio\nConstruído",
        ano: "2023",
        descricao:
          "Apartamento de alto padrão com linguagem minimalista. A paleta monocromática e os materiais cuidadosamente selecionados constroem um silêncio visual que convida à contemplação e ao descanso.",
        area: "220 m²",
        servico: "Design de Interiores",
        local: "São Paulo, SP",
      },
      {
        imagem:
          "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=90",
        categoria: "Interiores · Salvador, BA",
        titulo: "Textura\nViva",
        ano: "2023",
        descricao:
          "Projeto que celebra o uso de materiais naturais em sua forma mais autêntica — pedras brutas, madeiras não tratadas e fibras naturais compõem um espaço cheio de vida e personalidade.",
        area: "140 m²",
        servico: "Design de Interiores",
        local: "Salvador, BA",
      },
      {
        imagem:
          "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=90",
        categoria: "Arquitetura & Paisagismo · Recife, PE",
        titulo: "Equilíbrio\nOrgânico",
        ano: "2022",
        descricao:
          "Casa projetada em integração total com a vegetação existente no terreno. Jardins internos, telhados verdes e fachadas com trepadeiras criam um diálogo contínuo entre arquitetura e natureza.",
        area: "400 m²",
        servico: "Projeto Arquitetônico + Paisagismo",
        local: "Recife, PE",
      },
      {
        imagem:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=90",
        categoria: "Projetos de Iluminação · Bahia",
        titulo: "Névoa\nde Design",
        ano: "2022",
        descricao:
          "Projeto de iluminação residencial com foco em criar ambiências distintas em cada cômodo. Temperaturas de cor cuidadosamente escolhidas e pontos de luz indireta transformam o espaço ao longo do dia e da noite.",
        area: "260 m²",
        servico: "Projeto de Iluminação",
        local: "Salvador, BA",
      },
    ];

    const modal = document.getElementById("modal-projeto");
    const btnFechar = document.getElementById("modal-fechar");
    const modalImagem = document.getElementById("modal-imagem");
    const modalCateg = document.getElementById("modal-categoria");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalAno = document.getElementById("modal-ano");
    const modalDescr = document.getElementById("modal-descricao");
    const modalArea = document.getElementById("modal-area");
    const modalServico = document.getElementById("modal-servico");
    const modalLocal = document.getElementById("modal-local");
    const modalAnoFicha = document.getElementById("modal-ano-ficha");

    if (!modal) return;

    // Abre o modal com os dados do projeto clicado
    function abrirModal(indice) {
      const projeto = dadosGaleria[indice];
      if (!projeto) return;

      modalImagem.src = projeto.imagem;
      modalImagem.alt = projeto.titulo;
      modalCateg.textContent = projeto.categoria;
      modalTitulo.textContent = projeto.titulo.replace("\n", "\n");
      modalAno.textContent = projeto.ano;
      modalDescr.textContent = projeto.descricao;
      modalArea.textContent = projeto.area;
      modalServico.textContent = projeto.servico;
      modalLocal.textContent = projeto.local;
      modalAnoFicha.textContent = projeto.ano;

      // Quebra de linha no título
      modalTitulo.innerHTML = projeto.titulo.replace("\n", "<br>");

      modal.classList.add("aberto");
      document.body.style.overflow = "hidden";
    }

    // Fecha o modal
    function fecharModal() {
      modal.classList.remove("aberto");
      document.body.style.overflow = "";
    }

    // Evento de clique nas fotos da galeria (originais e clones)
    document.getElementById("galeria-trilha").addEventListener("click", (e) => {
      const foto = e.target.closest(".galeria-foto");
      if (!foto || foto.dataset.clone) return; // ignora clones
      const indice = parseInt(foto.dataset.projeto);
      if (!isNaN(indice)) abrirModal(indice);
    });

    btnFechar.addEventListener("click", fecharModal);

    // ESC fecha o modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fecharModal();
    });

    // Clique fora do conteúdo fecha o modal
    modal.addEventListener("click", (e) => {
      if (e.target === modal) fecharModal();
    });
  }

  /* ==========================================
     9. MODELO 3D — MAQUETE ARQUITETÔNICA
     Cena de uma maquete modernista com:
     - Edifício principal com pilotis e lajes
     - Volumes secundários (corpos do programa)
     - Planta baixa projetada no chão (grid)
     - Painéis de vidro translúcidos
     - Linhas de cota flutuantes (blueprint)
     - Partículas de pó de maquete
     - Câmera orbital suave + reação ao mouse
  ========================================== */
  function iniciar3D() {
    const canvas3D = document.getElementById("canvas-3d");
    if (!canvas3D || typeof THREE === "undefined") return;

    // ---- Setup ----
    const renderizador = new THREE.WebGLRenderer({
      canvas: canvas3D,
      antialias: true,
      alpha: false,
    });
    const cena = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);

    cena.background = new THREE.Color(0x110b08);
    cena.fog = new THREE.FogExp2(0x110b08, 0.035);

    camera.position.set(14, 9, 14);
    camera.lookAt(0, 1, 0);

    function ajustarTamanho() {
      const w = canvas3D.parentElement.offsetWidth;
      const h = canvas3D.parentElement.offsetHeight;
      renderizador.setSize(w, h, false);
      renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    ajustarTamanho();
    window.addEventListener("resize", ajustarTamanho);

    // ---- Grupo principal — tudo gira junto ----
    const grupoPrincipal = new THREE.Group();
    cena.add(grupoPrincipal);

    // ============================================
    // MATERIAIS
    // ============================================
    // Concreto nude — paredes e lajes sólidas
    const matConcreto = new THREE.MeshPhysicalMaterial({
      color: 0xd9cbbf,
      roughness: 0.75,
      metalness: 0.0,
      clearcoat: 0.1,
    });

    // Concreto escuro — base e pilotis
    const matConcretoEscuro = new THREE.MeshPhysicalMaterial({
      color: 0xb0967e,
      roughness: 0.85,
      metalness: 0.0,
    });

    // Vidro translúcido — fachadas envidraçadas
    const matVidro = new THREE.MeshPhysicalMaterial({
      color: 0xc9e0d8,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });

    // Piscina / espelho d'água
    const matAgua = new THREE.MeshPhysicalMaterial({
      color: 0x8aadb5,
      roughness: 0.0,
      metalness: 0.3,
      transparent: true,
      opacity: 0.55,
    });

    // Linha de blueprint (planta baixa / cotas)
    const matBlueprint = new THREE.LineBasicMaterial({
      color: 0x9a7d6d,
      transparent: true,
      opacity: 0.5,
    });

    // Linha de grid do terreno
    const matGrid = new THREE.LineBasicMaterial({
      color: 0x5a3d2b,
      transparent: true,
      opacity: 0.35,
    });

    // ============================================
    // TERRENO / BASE DA MAQUETE
    // ============================================
    const geoBase = new THREE.BoxGeometry(18, 0.18, 14);
    const baseTerreno = new THREE.Mesh(
      geoBase,
      new THREE.MeshPhysicalMaterial({
        color: 0x1e1410,
        roughness: 1.0,
        metalness: 0.0,
      }),
    );
    baseTerreno.position.y = -0.09;
    grupoPrincipal.add(baseTerreno);

    // Grid da planta baixa desenhado sobre o terreno
    function criarGridTerreno() {
      const passoGrid = 1.5;
      const largGrid = 18,
        profGrid = 14;
      const pontos = [];

      for (let x = -largGrid / 2; x <= largGrid / 2; x += passoGrid) {
        pontos.push(new THREE.Vector3(x, 0.01, -profGrid / 2));
        pontos.push(new THREE.Vector3(x, 0.01, profGrid / 2));
      }
      for (let z = -profGrid / 2; z <= profGrid / 2; z += passoGrid) {
        pontos.push(new THREE.Vector3(-largGrid / 2, 0.01, z));
        pontos.push(new THREE.Vector3(largGrid / 2, 0.01, z));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(pontos);
      const grid = new THREE.LineSegments(geo, matGrid);
      grupoPrincipal.add(grid);
    }
    criarGridTerreno();

    // ============================================
    // EDIFÍCIO PRINCIPAL — Corpo modernista
    // Inspirado no brutalismo tropical:
    // laje de cobertura, pilotis, fachada cega + vidro
    // ============================================

    // Laje de cobertura (telhado plano largo)
    const geoLajeCobertura = new THREE.BoxGeometry(8.4, 0.2, 5.4);
    const lajeCobertura = new THREE.Mesh(geoLajeCobertura, matConcreto);
    lajeCobertura.position.set(0, 5.1, 0);
    grupoPrincipal.add(lajeCobertura);

    // Laje intermediária (segundo pavimento)
    const geoLajeIntermedia = new THREE.BoxGeometry(8.4, 0.18, 5.4);
    const lajeIntermedia = new THREE.Mesh(geoLajeIntermedia, matConcreto);
    lajeIntermedia.position.set(0, 2.55, 0);
    grupoPrincipal.add(lajeIntermedia);

    // Laje do piso (sobre os pilotis)
    const geoLajePiso = new THREE.BoxGeometry(8.4, 0.18, 5.4);
    const lajePiso = new THREE.Mesh(geoLajePiso, matConcreto);
    lajePiso.position.set(0, 1.1, 0);
    grupoPrincipal.add(lajePiso);

    // Parede traseira maciça (concreto aparente)
    const geoParedeTraseira = new THREE.BoxGeometry(0.25, 4.0, 5.4);
    const paredeTraseira = new THREE.Mesh(geoParedeTraseira, matConcretoEscuro);
    paredeTraseira.position.set(-4.1, 3.1, 0);
    grupoPrincipal.add(paredeTraseira);

    // Parede lateral sólida
    const geoParedeLateral = new THREE.BoxGeometry(8.4, 4.0, 0.25);
    const paredeLateral = new THREE.Mesh(geoParedeLateral, matConcretoEscuro);
    paredeLateral.position.set(0, 3.1, -2.7);
    grupoPrincipal.add(paredeLateral);

    // Fachada de vidro (frente)
    const geoVidroFrente = new THREE.BoxGeometry(8.4, 4.0, 0.08);
    const vidroFrente = new THREE.Mesh(geoVidroFrente, matVidro);
    vidroFrente.position.set(0, 3.1, 2.7);
    grupoPrincipal.add(vidroFrente);

    // Fachada de vidro lateral direita
    const geoVidroLateral = new THREE.BoxGeometry(0.08, 4.0, 5.4);
    const vidroLateral = new THREE.Mesh(geoVidroLateral, matVidro);
    vidroLateral.position.set(4.1, 3.1, 0);
    grupoPrincipal.add(vidroLateral);

    // Pilotis — 6 colunas circulares
    const geoPiloti = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12);
    const posicoesPilotis = [
      [-3.2, -2.0],
      [-3.2, 0],
      [-3.2, 2.0],
      [3.2, -2.0],
      [3.2, 0],
      [3.2, 2.0],
    ];
    posicoesPilotis.forEach(([px, pz]) => {
      const piloti = new THREE.Mesh(geoPiloti, matConcretoEscuro);
      piloti.position.set(px, 0.55, pz);
      grupoPrincipal.add(piloti);
    });

    // Brises verticais na fachada de vidro
    const geoBrise = new THREE.BoxGeometry(0.08, 3.8, 0.4);
    for (let i = -3.5; i <= 3.5; i += 1.0) {
      const brise = new THREE.Mesh(geoBrise, matConcreto);
      brise.position.set(i, 3.1, 2.7);
      grupoPrincipal.add(brise);
    }

    // ============================================
    // VOLUMES SECUNDÁRIOS (programa arquitetônico)
    // ============================================

    // Bloco lateral baixo — área de serviço / garagem
    const geoBlocoServico = new THREE.BoxGeometry(3.5, 1.2, 4.0);
    const blocoServico = new THREE.Mesh(geoBlocoServico, matConcretoEscuro);
    blocoServico.position.set(-6.2, 0.6, -1.0);
    grupoPrincipal.add(blocoServico);

    // Telhado do bloco secundário
    const geoTelhadoSecundario = new THREE.BoxGeometry(3.7, 0.15, 4.2);
    const telhadoSecundario = new THREE.Mesh(geoTelhadoSecundario, matConcreto);
    telhadoSecundario.position.set(-6.2, 1.27, -1.0);
    grupoPrincipal.add(telhadoSecundario);

    // Bloco de escada / circulação vertical
    const geoCaixaEscada = new THREE.BoxGeometry(1.4, 5.3, 1.4);
    const caixaEscada = new THREE.Mesh(geoCaixaEscada, matConcretoEscuro);
    caixaEscada.position.set(5.5, 2.65, -1.5);
    grupoPrincipal.add(caixaEscada);

    // Pérgola / marquise de entrada
    const geoMarquise = new THREE.BoxGeometry(4.0, 0.12, 1.8);
    const marquise = new THREE.Mesh(geoMarquise, matConcreto);
    marquise.position.set(0, 1.5, 4.2);
    grupoPrincipal.add(marquise);

    // Colunas da marquise
    [
      [-1.6, 4.9],
      [1.6, 4.9],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.5, 10),
        matConcretoEscuro,
      );
      col.position.set(px, 0.75, pz);
      grupoPrincipal.add(col);
    });

    // ============================================
    // ESPELHO D'ÁGUA / PISCINA
    // ============================================
    const geoEspejoAgua = new THREE.BoxGeometry(4.5, 0.08, 2.0);
    const espejoAgua = new THREE.Mesh(geoEspejoAgua, matAgua);
    espejoAgua.position.set(3.5, 0.04, 4.5);
    grupoPrincipal.add(espejoAgua);

    // Borda da piscina
    const geoBordaEspelho = new THREE.BoxGeometry(4.7, 0.1, 2.2);
    const bordaEspelho = new THREE.Mesh(geoBordaEspelho, matConcretoEscuro);
    bordaEspelho.position.set(3.5, 0.0, 4.5);
    grupoPrincipal.add(bordaEspelho);

    // ============================================
    // LINHAS DE COTA / BLUEPRINT FLUTUANTES
    // Linhas finas que indicam dimensões, como
    // em uma prancha arquitetônica
    // ============================================
    function criarLinhaCota(pontoA, pontoB) {
      const geo = new THREE.BufferGeometry().setFromPoints([pontoA, pontoB]);
      return new THREE.Line(geo, matBlueprint);
    }

    // Linha de cota horizontal (largura do edifício)
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-4.2, 5.5, 3.5),
        new THREE.Vector3(4.2, 5.5, 3.5),
      ),
    );
    // Hachuras verticais das extremidades
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-4.2, 5.3, 3.5),
        new THREE.Vector3(-4.2, 5.7, 3.5),
      ),
    );
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(4.2, 5.3, 3.5),
        new THREE.Vector3(4.2, 5.7, 3.5),
      ),
    );

    // Linha de cota vertical (altura total)
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-5.5, 0, 3.0),
        new THREE.Vector3(-5.5, 5.2, 3.0),
      ),
    );
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-5.7, 0, 3.0),
        new THREE.Vector3(-5.3, 0, 3.0),
      ),
    );
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-5.7, 5.2, 3.0),
        new THREE.Vector3(-5.3, 5.2, 3.0),
      ),
    );

    // Linha de nível do piso (marcação de pavimento)
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-5.0, 1.1, -3.5),
        new THREE.Vector3(5.5, 1.1, -3.5),
      ),
    );
    grupoPrincipal.add(
      criarLinhaCota(
        new THREE.Vector3(-5.0, 2.55, -3.5),
        new THREE.Vector3(5.5, 2.55, -3.5),
      ),
    );

    // ============================================
    // VEGETAÇÃO ESTILIZADA — Esferas de árvore
    // ============================================
    const geoArvore = new THREE.SphereGeometry(0.55, 8, 8);
    const matArvore = new THREE.MeshPhysicalMaterial({
      color: 0x4a6741,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
      wireframe: false,
    });
    const geoCaule = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6);
    const matCaule = new THREE.MeshBasicMaterial({ color: 0x3d2a1e });

    const posicoesArvores = [
      [-7.5, 3.5],
      [-7.5, 1.0],
      [6.5, 4.5],
      [6.5, 2.0],
      [1.5, 6.0],
      [-1.5, 6.0],
      [4.0, 6.5],
    ];
    posicoesArvores.forEach(([px, pz]) => {
      const copa = new THREE.Mesh(geoArvore, matArvore.clone());
      copa.position.set(px, 1.2, pz);
      copa.scale.set(1, 1.15, 1);
      grupoPrincipal.add(copa);

      const caule = new THREE.Mesh(geoCaule, matCaule);
      caule.position.set(px, 0.35, pz);
      grupoPrincipal.add(caule);
    });

    // ============================================
    // PARTÍCULAS — pó de maquete no ar
    // ============================================
    const qtdParticulas = 400;
    const posParticulas = new Float32Array(qtdParticulas * 3);
    for (let i = 0; i < qtdParticulas * 3; i++) {
      posParticulas[i] = (Math.random() - 0.5) * 30;
    }
    const geoParticulas = new THREE.BufferGeometry();
    geoParticulas.setAttribute(
      "position",
      new THREE.BufferAttribute(posParticulas, 3),
    );
    const particulas = new THREE.Points(
      geoParticulas,
      new THREE.PointsMaterial({
        color: 0x9a7d6d,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
      }),
    );
    cena.add(particulas);

    // ============================================
    // ILUMINAÇÃO — simula luz natural de atelier
    // ============================================
    // Luz ambiente suave
    cena.add(new THREE.AmbientLight(0xfdf4ec, 0.5));

    // Luz solar principal (diagonal superior)
    const luzSolar = new THREE.DirectionalLight(0xfff5e6, 2.2);
    luzSolar.position.set(10, 18, 8);
    luzSolar.castShadow = false;
    cena.add(luzSolar);

    // Luz de preenchimento (lateral fria)
    const luzFria = new THREE.DirectionalLight(0xdde8f0, 0.6);
    luzFria.position.set(-8, 5, -6);
    cena.add(luzFria);

    // Luz de chão suave (bounce light)
    const luzChao = new THREE.PointLight(0xc4a882, 0.8, 20);
    luzChao.position.set(0, -1, 0);
    cena.add(luzChao);

    // ============================================
    // ÓRBITA DA CÂMERA + REAÇÃO AO MOUSE
    // ============================================
    let anguloOrbitaY = Math.PI / 4; // rotação horizontal ao redor do modelo
    let alturaCameraY = 9; // altura da câmera
    let raioCameraY = 20; // distância do centro

    let mouseInfluenciaX = 0,
      mouseInfluenciaY = 0; // influência suave do mouse
    let mouseAlvoX = 0,
      mouseAlvoY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseAlvoX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      mouseAlvoY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    });

    // ---- Loop de animação ----
    let tempoDecorrido = 0;

    function animar3D() {
      requestAnimationFrame(animar3D);
      tempoDecorrido += 0.004;

      // Órbita automática lenta ao redor do edifício
      anguloOrbitaY += 0.0025;

      // Interpolação suave do mouse
      mouseInfluenciaX += (mouseAlvoX - mouseInfluenciaX) * 0.05;
      mouseInfluenciaY += (mouseAlvoY - mouseInfluenciaY) * 0.05;

      // Posição da câmera orbita ao redor do centro
      camera.position.x =
        Math.cos(anguloOrbitaY + mouseInfluenciaX) * raioCameraY;
      camera.position.z =
        Math.sin(anguloOrbitaY + mouseInfluenciaX) * raioCameraY;
      camera.position.y = alturaCameraY + mouseInfluenciaY * -5;
      camera.lookAt(0, 2, 0);

      // Leve flutuação da maquete toda (como se estivesse em exposição)
      grupoPrincipal.position.y = Math.sin(tempoDecorrido * 0.5) * 0.08;

      // Vidros pulsam levemente em opacidade
      vidroFrente.material.opacity =
        0.15 + Math.sin(tempoDecorrido * 0.8) * 0.04;
      vidroLateral.material.opacity =
        0.15 + Math.cos(tempoDecorrido * 0.8) * 0.04;

      // Espelho d'água ondula
      espejoAgua.material.opacity =
        0.45 + Math.sin(tempoDecorrido * 1.2) * 0.12;

      // Partículas giram devagar
      particulas.rotation.y = tempoDecorrido * 0.015;

      renderizador.render(cena, camera);
    }

    animar3D();
  }

  /* ==========================================
     10. SCROLL SUAVE DOS LINKS DO MENU
     Clique nas âncoras rola suavemente
  ========================================== */
  function scrollSuaveDosLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        const destino = document.querySelector(this.getAttribute("href"));
        if (destino) {
          e.preventDefault();
          destino.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ==========================================
     11. DESFOQUE ENTRE SEÇÕES AO ROLAR
     Seções distantes do centro ficam levemente
     desfocadas para criar profundidade de campo
  ========================================== */
  function desfoqueEntreSecoes() {
    function aplicarDesfoque() {
      const todasSecoes = document.querySelectorAll("section");
      todasSecoes.forEach((secao) => {
        const posicao = secao.getBoundingClientRect();
        const alturaViewport = window.innerHeight;
        const centroDaSecao = posicao.top + posicao.height / 2;
        const distanciaDoMeio = Math.abs(centroDaSecao - alturaViewport / 2);
        const distanciaMax = alturaViewport * 0.8;
        const intensidadeBlur = Math.max(
          0,
          (distanciaDoMeio / distanciaMax - 0.6) * 8,
        );
        const opacidade = Math.max(0.5, 1 - intensidadeBlur * 0.04);

        secao.style.filter = `blur(${Math.min(intensidadeBlur, 4)}px)`;
        secao.style.opacity = opacidade;
      });

      // A seção 3D nunca fica desfocada (senão o canvas trava)
      const secao3D = document.getElementById("secao-modelo-3d");
      if (secao3D) {
        secao3D.style.filter = "none";
        secao3D.style.opacity = "1";
      }
    }

    window.addEventListener("scroll", aplicarDesfoque, { passive: true });
  }

  /* ==========================================
     12. CLIQUE NAS CARTAS DE PROJETO
     A carta clicada vai para o centro e as 
     outras se reorganizam ao redor
  ========================================== */
  function cliqueDasCartas() {
    const todasAsCartas = document.querySelectorAll(".carta-projeto");

    todasAsCartas.forEach((cartaClicada, indiceDaClicada) => {
      cartaClicada.addEventListener("click", () => {
        todasAsCartas.forEach((carta, indiceDaCarta) => {
          carta.style.transition =
            "transform 0.7s cubic-bezier(0.76,0,0.24,1), opacity 0.5s ease, box-shadow 0.5s ease";

          if (indiceDaCarta === indiceDaClicada) {
            // Carta clicada: vai para o centro e fica maior
            carta.style.transform =
              "translateX(-50%) translateY(-70%) rotate(0deg) scale(1.05)";
            carta.style.zIndex = "20";
            carta.style.opacity = "1";
            carta.style.boxShadow = "0 40px 100px rgba(42,31,26,0.45)";
          } else {
            // Outras cartas: se afastam proporcionalmente
            const distancia = indiceDaCarta - indiceDaClicada;
            const rotacao = distancia * 6;
            const deslocamento = distancia * 160;
            carta.style.transform = `translateX(calc(-50% + ${deslocamento}px)) translateY(-50%) rotate(${rotacao}deg)`;
            carta.style.zIndex = `${5 - Math.abs(distancia)}`;
            carta.style.opacity = `${0.6 + Math.min(Math.abs(distancia) * 0.1, 0.3)}`;
          }
        });
      });
    });
  }

  /* ==========================================
     13. SERVIÇOS APARECEM EM CASCATA
     Cada serviço aparece com delay crescente
  ========================================== */
  function animarServicosEmCascata() {
    const itensServico = document.querySelectorAll(".servico-item");
    const listaServicos = Array.from(itensServico);

    const observadorServicos = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            const posicaoNaLista = listaServicos.indexOf(entrada.target);
            const atrasoMs = posicaoNaLista * 100; // cada item 100ms depois
            entrada.target.style.transitionDelay = `${atrasoMs}ms`;
            entrada.target.classList.add("visivel");
          }
        });
      },
      { threshold: 0.15 },
    );

    itensServico.forEach((item) => observadorServicos.observe(item));
  }

  // INICIALIZAR TUDO
  // O preloader roda primeiro e isolado.
  // As funções pesadas (galeria loop, 3D) só iniciam
  // depois que o preloader termina, evitando competição
  // por recursos com a animação GSAP.

  function iniciarTudo() {
    try {
      iniciarCursor();
    } catch (e) {
      console.warn("iniciarCursor:", e);
    }
    try {
      menuAoRolar();
    } catch (e) {
      console.warn("menuAoRolar:", e);
    }
    try {
      animarAoEntrarNaTela();
    } catch (e) {
      console.warn("animarAoEntrarNaTela:", e);
    }
    try {
      animarTextoPalavras();
    } catch (e) {
      console.warn("animarTextoPalavras:", e);
    }
    try {
      paralaxeAoRolar();
    } catch (e) {
      console.warn("paralaxeAoRolar:", e);
    }
    try {
      contarNumeros();
    } catch (e) {
      console.warn("contarNumeros:", e);
    }
    try {
      galeriaArrastavel();
    } catch (e) {
      console.warn("galeriaArrastavel:", e);
    }
    try {
      iniciarModalGaleria();
    } catch (e) {
      console.warn("iniciarModalGaleria:", e);
    }
    try {
      iniciar3D();
    } catch (e) {
      console.warn("iniciar3D:", e);
    }
    try {
      scrollSuaveDosLinks();
    } catch (e) {
      console.warn("scrollSuaveDosLinks:", e);
    }
    try {
      desfoqueEntreSecoes();
    } catch (e) {
      console.warn("desfoqueEntreSecoes:", e);
    }
    try {
      cliqueDasCartas();
    } catch (e) {
      console.warn("cliqueDasCartas:", e);
    }
    try {
      animarServicosEmCascata();
    } catch (e) {
      console.warn("animarServicosEmCascata:", e);
    }
  }

  // Preloader sempre primeiro, e só dispara o resto quando terminar
  try {
    animarPreloader(iniciarTudo);
  } catch (e) {
    console.warn("animarPreloader:", e);
    iniciarTudo();
  }
})();
