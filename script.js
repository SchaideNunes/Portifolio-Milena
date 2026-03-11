(function () {
  "use strict";

  // 1. PRELOADER — PLANTA BAIXA ANIMADA COM GSAP
  function animarPreloader() {
    const tela = document.getElementById("tela-carregamento");
    if (!tela || typeof gsap === "undefined") {
      // Fallback sem GSAP
      setTimeout(() => {
        tela && tela.remove();
      }, 3000);
      return;
    }

    // Inicializa o dashoffset de cada elemento com seu comprimento real
    function prepararLinha(seletor) {
      document.querySelectorAll(seletor).forEach((el) => {
        const len = el.getTotalLength ? el.getTotalLength() : 200;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
      });
    }

    const todasLinhas = [
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
    todasLinhas.forEach(prepararLinha);

    // Timeline principal
    const tl = gsap.timeline({ onComplete: sairDoPreloader });

    // Contador de porcentagem sobe junto com a animação
    const contadorEl = document.getElementById("contador-numero");
    const objContador = { valor: 0 };
    gsap.to(objContador, {
      valor: 100,
      duration: 3.8,
      ease: "power2.inOut",
      onStart: () => {
        gsap.to(".preloader-contador", { opacity: 1, duration: 0.4 });
      },
      onUpdate: () => {
        if (contadorEl) contadorEl.textContent = Math.round(objContador.valor);
      },
    });

    // 1. Paredes externas — perímetro do edifício
    tl.to(".planta-parede-externa", {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: "power2.inOut",
    })

      // 2. Paredes internas — divisões dos cômodos
      .to(
        ".planta-parede-interna",
        {
          strokeDashoffset: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.15,
        },
        "-=0.3",
      )

      // 3. Portas (linhas + arcos)
      .to(
        ".planta-linha-porta",
        {
          strokeDashoffset: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power1.out",
        },
        "-=0.2",
      )
      .to(
        ".planta-arco-porta",
        {
          strokeDashoffset: 0,
          duration: 0.45,
          stagger: 0.12,
          ease: "power1.inOut",
        },
        "-=0.2",
      )

      // 4. Janelas (dupla linha)
      .to(
        ".planta-janela-a, .planta-janela-b",
        {
          strokeDashoffset: 0,
          duration: 0.35,
          ease: "power1.out",
          stagger: 0.06,
        },
        "-=0.1",
      )

      // 5. Escada (degraus em cascata rápida)
      .to(
        ".planta-borda-escada",
        {
          strokeDashoffset: 0,
          duration: 0.3,
          ease: "power1.out",
        },
        "-=0.1",
      )
      .to(
        ".planta-degrau",
        {
          strokeDashoffset: 0,
          duration: 0.12,
          ease: "none",
          stagger: 0.06,
        },
        "-=0.2",
      )

      // 6. Linhas de cota e indicadores técnicos
      .to(
        ".planta-cota-linha, .planta-cota-tick, .planta-escala-linha, .planta-escala-tick",
        {
          strokeDashoffset: 0,
          duration: 0.4,
          ease: "power1.out",
          stagger: 0.04,
        },
        "-=0.1",
      )
      .to(
        ".planta-norte-circulo, .planta-norte-linha",
        {
          strokeDashoffset: 0,
          duration: 0.4,
          ease: "power1.out",
          stagger: 0.08,
        },
        "-=0.3",
      )

      // 7. Textos (N, escala)
      .to(
        ".planta-norte-texto, .planta-escala-texto",
        {
          opacity: 0.7,
          duration: 0.4,
          stagger: 0.1,
        },
        "-=0.1",
      )

      // 8. Logo aparece com blur saindo
      .fromTo(
        ".preloader-logo-img",
        { opacity: 0, filter: "blur(12px)", y: 10 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.9,
          ease: "power2.out",
        },
        "-=0.1",
      )

      // 9. Pausa para leitura
      .to({}, { duration: 0.6 });

    // Saída da tela
    function sairDoPreloader() {
      gsap.to(tela, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => tela.remove(),
      });
    }
  }

  // 2. CURSOR CAD — mira estilo AutoCAD
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
    const secoesEscuras = ["secao-servicos"];
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

  /* / */
  function menuAoRolar() {
    const menuTopo = document.getElementById("menu-topo");
    window.addEventListener("scroll", () => {
      menuTopo.classList.toggle("rolou", window.scrollY > 60);
    });
  }

  /* / */
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

  /* / */
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

  /* / */
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

  /* / */
  function contarNumeros() {
    function animarUmNumero(elemento, valorFinal, duracao = 1800) {
      let inicioTempo = 0;
      const sufixo = elemento.getAttribute("data-sufixo") || "";
      const passo = (timestamp) => {
        if (!inicioTempo) inicioTempo = timestamp;
        const progresso = Math.min((timestamp - inicioTempo) / duracao, 1);
        const valorSuavizado = 1 - Math.pow(1 - progresso, 3); // easing cúbico
        elemento.textContent = Math.floor(valorSuavizado * valorFinal) + sufixo;
        if (progresso < 1) requestAnimationFrame(passo);
        else elemento.textContent = valorFinal + sufixo;
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
              const valorAlvo = parseInt(num.getAttribute("data-valor") || num.textContent);
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

  /* / */
  function iniciarModalGaleria() {
    const fotos = document.querySelectorAll('.galeria-foto');
    const modal = document.getElementById('modal-galeria');
    if (!modal) return;

    const btnFechar = modal.querySelector('.modal-fechar');
    const overlay = modal.querySelector('.modal-overlay');
    const imgModal = modal.querySelector('.modal-imagem img');
    const titModal = modal.querySelector('.modal-titulo');
    const descModal = modal.querySelector('.modal-descricao');
    const btnContato = document.getElementById('btn-modal-contato');

    function abrirModal(e) {
      const card = e.currentTarget;
      const imgSrc = card.querySelector('img').src;
      const titulo = card.getAttribute('data-titulo');
      const desc = card.getAttribute('data-desc');

      // Popula os dados
      imgModal.src = imgSrc;
      titModal.textContent = titulo;
      descModal.textContent = desc;

      // Exibe modal e previne scroll da página ao fundo
      modal.classList.add('ativo');
      document.body.style.overflow = 'hidden';
    }

    function fecharModal() {
      modal.classList.remove('ativo');
      document.body.style.overflow = '';
    }

    // Adiciona os eventos
    fotos.forEach(foto => foto.addEventListener('click', abrirModal));
    btnFechar.addEventListener('click', fecharModal);
    overlay.addEventListener('click', fecharModal);

    // Fecha modal ao clicar no botão de ir para o contato
    if (btnContato) {
      btnContato.addEventListener('click', fecharModal);
    }
  }

  /* / */
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

  /* / */
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
    }

    window.addEventListener("scroll", aplicarDesfoque, { passive: true });
  }

  /* / */
  function cliqueDasCartas() {
    // Nenhuma ação necessária — efeito gerenciado por CSS
  }

  /* / */
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

  /* / */
  // Espera a janela carregar para iniciar as animações com segurança
  window.onload = function () {
    animarPreloader();
    iniciarCursor();
    menuAoRolar();
    animarAoEntrarNaTela();
    animarTextoPalavras();
    paralaxeAoRolar();
    contarNumeros();
    iniciarModalGaleria();
    scrollSuaveDosLinks();
    desfoqueEntreSecoes();
    cliqueDasCartas();
    animarServicosEmCascata();
  };
})();