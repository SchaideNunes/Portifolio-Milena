(function () {
  "use strict";

  // 1. PRELOADER — PLANTA BAIXA ANIMADA COM GSAP
  function animarPreloader() {
    const tela = document.getElementById("tela-carregamento");
    const video3d = document.getElementById("video-3d");

    if (!tela || typeof gsap === "undefined") {
      setTimeout(() => { tela && tela.remove(); }, 3000);
      return;
    }

    // Inicializa o dashoffset de cada elemento
    function prepararLinha(seletor) {
      document.querySelectorAll(seletor).forEach((el) => {
        const len = el.getTotalLength ? el.getTotalLength() : 200;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
      });
    }

    const todasLinhas = [
      ".planta-parede-externa", ".planta-parede-interna", ".planta-linha-porta",
      ".planta-arco-porta", ".planta-janela-a", ".planta-janela-b",
      ".planta-degrau", ".planta-borda-escada", ".planta-cota-linha",
      ".planta-cota-tick", ".planta-norte-circulo", ".planta-norte-linha",
      ".planta-escala-linha", ".planta-escala-tick",
    ];
    todasLinhas.forEach(prepararLinha);

    // Variáveis de controle de carga
    let animacaoCompleta = false;
    let videoCarregado = false;

    // Se não houver vídeo, considera carregado
    if (!video3d) {
      videoCarregado = true;
    } else {
      // Inicia o carregamento do vídeo imediatamente
      video3d.load();
      // O evento 'canplaythrough' indica que o vídeo pode ser reproduzido sem interrupções
      video3d.addEventListener("canplaythrough", () => {
        videoCarregado = true;
        verificarFinalizacao();
      }, { once: true });

      // Fallback: se o vídeo demorar mais de 6 segundos, libera o site de qualquer forma
      setTimeout(() => {
        videoCarregado = true;
        verificarFinalizacao();
      }, 6000);
    }

    // Timeline principal da animação
    const tl = gsap.timeline({ onComplete: () => {
      animacaoCompleta = true;
      verificarFinalizacao();
    }});
    tl.timeScale(2.5);

    // Contador de porcentagem
    const contadorEl = document.getElementById("contador-numero");
    const objContador = { valor: 0 };
    gsap.to(objContador, {
      valor: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onStart: () => {
        gsap.to(".preloader-contador", { opacity: 1, duration: 0.4 });
      },
      onUpdate: () => {
        if (contadorEl) contadorEl.textContent = Math.round(objContador.valor);
      },
    });

    function verificarFinalizacao() {
      // Só sai do preloader quando a animação acabar E o vídeo estiver pronto (ou der timeout)
      if (animacaoCompleta && videoCarregado) {
        sairDoPreloader();
      }
    }

    // 1. Paredes externas
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

    // Saída da tela
    function sairDoPreloader() {
      gsap.to(tela, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          tela.remove();
          dispararAnimacaoHero();
        },
      });
    }
  }


  /* / */
  function menuAoRolar() {
    const menuTopo = document.getElementById("menu-topo");
    window.addEventListener("scroll", () => {
      menuTopo.classList.toggle("rolou", window.scrollY > 60);
    });
  }

  /* / */
  function menuHamburguer() {
    const btn = document.getElementById("btn-hamburguer");
    const overlay = document.getElementById("menu-mobile-overlay");
    if (!btn || !overlay) return;

    function fecharMenu() {
      btn.classList.remove("ativo");
      overlay.classList.remove("ativo");
      
      const wizardOrcamento = document.getElementById("wizard-orcamento");
      const modalGaleria = document.getElementById("modal-galeria");
      
      const wizardAtivo = wizardOrcamento && wizardOrcamento.classList.contains("ativo");
      const modalAtivo = modalGaleria && modalGaleria.classList.contains("ativo");

      if (!wizardAtivo && !modalAtivo) {
        document.body.classList.remove("no-scroll");
        document.documentElement.classList.remove("no-scroll");
      }
    }

    btn.addEventListener("click", () => {
      btn.classList.toggle("ativo");
      overlay.classList.toggle("ativo");
      
      if (overlay.classList.contains("ativo")) {
        document.body.classList.add("no-scroll");
        document.documentElement.classList.add("no-scroll");
      } else {
        const wizardOrcamento = document.getElementById("wizard-orcamento");
        const modalGaleria = document.getElementById("modal-galeria");
        
        const wizardAtivo = wizardOrcamento && wizardOrcamento.classList.contains("ativo");
        const modalAtivo = modalGaleria && modalGaleria.classList.contains("ativo");

        if (!wizardAtivo && !modalAtivo) {
          document.body.classList.remove("no-scroll");
          document.documentElement.classList.remove("no-scroll");
        }
      }
    });

    // Fecha ao clicar no backdrop (fora dos links)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) fecharMenu();
    });

    // Fecha ao clicar em qualquer link
    overlay.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => fecharMenu());
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
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');

      // Pausa o carrossel da galeria
      if (window.pausarCarrosselGaleria) window.pausarCarrosselGaleria();
    }

    function fecharModal() {
      modal.classList.remove('ativo');
      
      const overlayMenu = document.getElementById("menu-mobile-overlay");
      const wizardOrcamento = document.getElementById("wizard-orcamento");
      
      const menuAtivo = overlayMenu && overlayMenu.classList.contains("ativo");
      const wizardAtivo = wizardOrcamento && wizardOrcamento.classList.contains("ativo");

      if (!menuAtivo && !wizardAtivo) {
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
      }

      // Retoma o carrossel da galeria
      if (window.retomarCarrosselGaleria) window.retomarCarrosselGaleria();
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
      if (window.innerWidth <= 900) {
        document.querySelectorAll("section").forEach((secao) => {
          secao.style.filter = "none";
          secao.style.opacity = "1";
        });
        return;
      }

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
  function animarVideoModuloScroll() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const moduloSecao = document.getElementById("secao-modelo-3d");
    const videoModulo = document.getElementById("video-3d");

    if (!moduloSecao || !videoModulo) return;

    // Força o mobile (especialmente iOS) a baixar e renderizar o primeiro frame
    videoModulo.muted = true;
    videoModulo.setAttribute("playsinline", "");
    videoModulo.load(); // Carrega ativamente a metadata

    // Hack para Safari iOS liberar reprodução interativa
    const playPromise = videoModulo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        videoModulo.pause(); // Pausa o autoplay logo depois de tocar um décimo de segundo
      }).catch(() => {
        videoModulo.pause();
      });
    }

    let videoObj = { progress: 0 };

    function initVideoScrub() {
      const isMobile = window.innerWidth <= 768;
      const scrollEnd = isMobile ? "+=2400" : "+=3000";
      const scrubValue = isMobile ? 0.6 : 1.2;

      const tlScrub = gsap.timeline({
        scrollTrigger: {
          trigger: moduloSecao,
          start: "top top",
          end: scrollEnd,
          scrub: scrubValue,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            if (!isNaN(videoModulo.duration) && videoModulo.duration > 0) {
              const targetTime = self.progress * videoModulo.duration;

              if (isMobile) {
                // Throttle: no mobile só atualizamos se a diferença for maior que 0.04s
                // Isso evita que o hardware do celular trave tentando processar cada pixel de scroll
                if (Math.abs(videoModulo.currentTime - targetTime) > 0.04) {
                  videoModulo.currentTime = targetTime;
                }
              } else {
                videoModulo.currentTime = targetTime;
              }
            }
          }
        }
      });

      // Tween principal do vídeo
      tlScrub.to(videoObj, { progress: 1, ease: "none", duration: 1 }, 0);

      // --- TEXTOS COM ANIMAÇÃO ULTRA SUAVE ---

      // 1ª Frase
      tlScrub.fromTo("#texto-engaja-1",
        { opacity: 0, y: 40, filter: "blur(12px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.12, ease: "power2.out" }, 0.05)
        .to("#texto-engaja-1",
          { opacity: 0, y: -40, filter: "blur(12px)", duration: 0.12, ease: "power2.in" }, 0.25);

      // 2ª Frase
      tlScrub.fromTo("#texto-engaja-2",
        { opacity: 0, y: 40, filter: "blur(12px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.12, ease: "power2.out" }, 0.40)
        .to("#texto-engaja-2",
          { opacity: 0, y: -40, filter: "blur(12px)", duration: 0.12, ease: "power2.in" }, 0.58);

      // 3ª Frase
      tlScrub.fromTo("#texto-engaja-3",
        { opacity: 0, y: 40, filter: "blur(12px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.12, ease: "power2.out" }, 0.72)
        .to("#texto-engaja-3",
          { opacity: 0, y: -40, filter: "blur(12px)", duration: 0.12, ease: "power2.in" }, 0.88);

      // Botão Call To Action - Entra mas não sai
      tlScrub.fromTo("#cta-engaja",
        { opacity: 0, y: 50, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.15, ease: "power3.out" }, 0.95);
    }

    if (videoModulo.readyState >= 1) { // 1 = HAVE_METADATA
      initVideoScrub();
    } else {
      videoModulo.addEventListener("loadedmetadata", initVideoScrub, { once: true });
    }
  }

  /* --- LÓGICA DE ARRASTO DA GALERIA --- */
  function iniciarGaleriaArrastavel() {
    const container = document.querySelector('.galeria-marquee-container');
    const trilha = document.querySelector('.galeria-trilha');

    if (!container || !trilha) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let requestId;
    let scrollSpeed = 0.5; // Velocidade do auto scroll
    let isPaused = false;

    // Funções globais para pausar/retomar o auto-scroll (usadas pelo modal)
    window.pausarCarrosselGaleria = function () {
      isPaused = true;
    };
    window.retomarCarrosselGaleria = function () {
      isPaused = false;
    };

    function autoScroll() {
      if (!isDown && !isPaused) {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= (trilha.scrollWidth / 2)) {
          container.scrollLeft = 0;
        }
      }
      requestId = requestAnimationFrame(autoScroll);
    }

    requestId = requestAnimationFrame(autoScroll);

    // Desktop Events
    container.addEventListener('mouseleave', () => {
      isDown = false;
    });

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('mouseup', () => isDown = false);

    // Mobile (Touch) Events
    container.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDown = false;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  /* --- LÓGICA DO WIZARD ORÇAMENTO --- */
  window.abrirWizardOrcamento = function () {
    const w = document.getElementById('wizard-orcamento');
    if (w) {
      w.classList.add('ativo');
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    }
    irParaPasso(1);

    const r = document.querySelector('input[name="tipoProjeto"]:checked');
    if (r) r.checked = false;

    if (document.getElementById('orcamento-local')) document.getElementById('orcamento-local').value = '';
    if (document.getElementById('orcamento-ambientes')) document.getElementById('orcamento-ambientes').value = '';
    if (document.getElementById('orcamento-nome')) document.getElementById('orcamento-nome').value = '';
    if (document.getElementById('orcamento-email')) document.getElementById('orcamento-email').value = '';
    if (document.getElementById('orcamento-telefone')) document.getElementById('orcamento-telefone').value = '';
  }

  window.fecharWizardOrcamento = function () {
    const w = document.getElementById('wizard-orcamento');
    if (w) {
      w.classList.remove('ativo');
      
      const overlayMenu = document.getElementById("menu-mobile-overlay");
      const modalGaleria = document.getElementById("modal-galeria");
      
      const menuAtivo = overlayMenu && overlayMenu.classList.contains("ativo");
      const modalAtivo = modalGaleria && modalGaleria.classList.contains("ativo");

      if (!menuAtivo && !modalAtivo) {
        document.body.classList.remove('no-scroll');
        document.documentElement.classList.remove('no-scroll');
      }
    }
  }

  window.irParaPasso = function (passo) {
    document.querySelectorAll('.wizard-passo').forEach(el => el.classList.remove('ativo'));
    const p = document.getElementById('passo-' + passo);
    if (p) p.classList.add('ativo');

    for (let i = 1; i <= 3; i++) {
      const barra = document.getElementById('trilha-' + i);
      const label = document.getElementById('label-trilha-' + i);
      if (!barra || !label) continue;
      if (i <= passo) {
        barra.classList.add('ativo');
        label.classList.add('ativo');
      } else {
        barra.classList.remove('ativo');
        label.classList.remove('ativo');
      }
    }
  }

  window.enviarOrcamentoWpp = function () {
    const inputTipo = document.querySelector('input[name="tipoProjeto"]:checked');
    const tipoProjeto = inputTipo ? inputTipo.value : 'Arquitetura';

    const local = document.getElementById('orcamento-local').value || 'Não informado';
    const ambientes = document.getElementById('orcamento-ambientes').value || 'Não detalhado';
    const nome = document.getElementById('orcamento-nome').value || '';
    const email = document.getElementById('orcamento-email').value || 'Não informado';

    if (!nome || nome.trim() === '') {
      alert("Por favor, preencha o seu nome no passo Contato!");
      return;
    }

    const textoApp = `*Nova Solicitação de Projeto*\n\nOlá Milena! Me chamo *${nome}*.\n\n*Detalhes:* \n- *Tipo:* ${tipoProjeto}\n- *Local:* ${local}\n- *Interesse:* ${ambientes}\n- *Email:* ${email}\n\nAguardo seu contato para conversarmos mais sobre!`;
    const mensagemCodificada = encodeURIComponent(textoApp);

    // O número final onde cai a msg
    const telWhats = "5571986773387";

    window.open(`https://wa.me/${telWhats}?text=${mensagemCodificada}`, '_blank');
  }

  window.enviarFormularioContato = function () {
    const nome = document.getElementById('campo-nome').value || '';
    const email = document.getElementById('campo-email').value || 'Não informado';
    const assunto = document.getElementById('campo-assunto').value || 'Arquitetura';
    const mensagem = document.getElementById('campo-mensagem').value || '';

    if (!nome || nome.trim() === '') {
      alert("Por favor, preencha o seu nome!");
      return;
    }

    if (!mensagem || mensagem.trim() === '') {
      alert("Por favor, escreva uma mensagem!");
      return;
    }

    const textoApp = `*Nova Mensagem de Contato*\n\nOlá Milena! Me chamo *${nome}*.\n\n*Assunto:* ${assunto}\n*Email:* ${email}\n\n*Mensagem:*\n${mensagem}\n\nAguardo seu retorno!`;
    const mensagemCodificada = encodeURIComponent(textoApp);

    const telWhats = "5571999990000";
    window.open(`https://wa.me/${telWhats}?text=${mensagemCodificada}`, '_blank');
  }

  /* --- ANIMAÇÃO LETRAS DO HERO --- */
  function animarTituloHero() {
    const titulo = document.querySelector('.hero-titulo-gigante');
    if (!titulo) return;

    // As letras já estão visíveis via CSS, apenas garantimos o estado final
    titulo.classList.add('animado');
  }

  // Função chamada pelo preloader quando termina
  function dispararAnimacaoHero() {
    const titulo = document.querySelector('.hero-titulo-gigante');
    if (!titulo) return;

    // Ativa o shimmer em loop imediatamente
    titulo.classList.add('shimmer-ativo');
    titulo.classList.add('animado');
  }

  /* --- MÁSCARA DE TELEFONE --- */
  function aplicarMascaraTelefone(id) {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito

      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        // Formato (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        // Formato (XX) XXXX-XXXX
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        // Formato (XX) XXXX
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      } else if (value.length > 0) {
        // Formato (XX
        value = value.replace(/^(\d{0,2})/, "($1");
      }

      e.target.value = value;
    });
  }

  /* / */
  // Espera a janela carregar para iniciar as animações com segurança
  window.onload = function () {
    animarPreloader();
    menuAoRolar();
    menuHamburguer();
    animarAoEntrarNaTela();
    animarTextoPalavras();
    paralaxeAoRolar();
    contarNumeros();
    iniciarModalGaleria();
    scrollSuaveDosLinks();
    desfoqueEntreSecoes();
    cliqueDasCartas();
    animarServicosEmCascata();
    animarVideoModuloScroll();
    iniciarGaleriaArrastavel();
    animarTituloHero();

    // Aplica a máscara no campo de telefone do Wizard
    aplicarMascaraTelefone('orcamento-telefone');
  };
})();