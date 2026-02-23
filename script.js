/* ============================================
   MILENA REIS — Script Principal
   
   ÍNDICE DAS FUNÇÕES:
   1. removerTelaCarregamento()  → some o preloader
   2. iniciarCursor()            → cursor personalizado
   3. menuAoRolar()              → navbar fica sólida ao rolar
   4. animarAoEntrarNaTela()     → scroll reveal geral
   5. animarTextoPalavras()      → efeito merge de palavras
   6. paralaxeAoRolar()          → imagens com parallax
   7. contarNumeros()            → animação dos números (87, 12...)
   8. galeriaArrastavel()        → drag scroll na galeria
   9. iniciar3D()                → modelo Three.js
   10. scrollSuaveDosLinks()     → âncoras com scroll animado
   11. desfoqueEntreSecoes()     → blur nas seções ao rolar
   12. cliqueDasCartas()         → clique centraliza carta
   13. animarServicosEmCascata() → serviços aparecem um a um
============================================ */

(function () {
  'use strict';

  /* ==========================================
     1. TELA DE CARREGAMENTO
     Some após 2.2s do load da página
  ========================================== */
  function removerTelaCarregamento() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const telaCarregamento = document.getElementById('tela-carregamento');
        telaCarregamento.classList.add('oculto');
        setTimeout(() => telaCarregamento.remove(), 900);
      }, 2200);
    });
  }

  /* ==========================================
     2. CURSOR PERSONALIZADO
     .cursor-ponto → segue o mouse direto
     .cursor-anel  → segue com delay suave (lerp)
  ========================================== */
  function iniciarCursor() {
    const cursoPonto = document.getElementById('cursor-ponto');
    const cursorAnel = document.getElementById('cursor-anel');

    let posMouseX = 0, posMouseY = 0;  // posição atual do mouse
    let posAnelX  = 0, posAnelY  = 0; // posição atual do anel (lag)

    // Atualiza a posição do ponto imediatamente
    document.addEventListener('mousemove', (e) => {
      posMouseX = e.clientX;
      posMouseY = e.clientY;
      cursoPonto.style.left = posMouseX + 'px';
      cursoPonto.style.top  = posMouseY + 'px';
    });

    // Anel segue o mouse com interpolação (efeito lag suave)
    function animarAnel() {
      posAnelX += (posMouseX - posAnelX) * 0.12;
      posAnelY += (posMouseY - posAnelY) * 0.12;
      cursorAnel.style.left = posAnelX + 'px';
      cursorAnel.style.top  = posAnelY + 'px';
      requestAnimationFrame(animarAnel);
    }
    animarAnel();

    // Cursor cresce ao passar sobre elementos clicáveis
    document.querySelectorAll('a, button, .carta-projeto, .galeria-foto').forEach(elemento => {
      elemento.addEventListener('mouseenter', () => {
        cursoPonto.classList.add('ativo');
        cursorAnel.classList.add('ativo');
      });
      elemento.addEventListener('mouseleave', () => {
        cursoPonto.classList.remove('ativo');
        cursorAnel.classList.remove('ativo');
      });
    });
  }

  /* ==========================================
     3. MENU AO ROLAR
     Adiciona fundo ao menu quando rola > 60px
  ========================================== */
  function menuAoRolar() {
    const menuTopo = document.getElementById('menu-topo');
    window.addEventListener('scroll', () => {
      menuTopo.classList.toggle('rolou', window.scrollY > 60);
    });
  }

  /* ==========================================
     4. ANIMAÇÕES AO ENTRAR NA TELA
     Observa os elementos com classes de animação
     e adiciona .visivel quando aparecem na tela
  ========================================== */
  function animarAoEntrarNaTela() {
    const observadorEntrada = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    // Seleciona todos os elementos com animação de scroll
    document.querySelectorAll(
      '.animar-subindo, .animar-da-esquerda, .animar-da-direita, .entrada-blur'
    ).forEach(elemento => observadorEntrada.observe(elemento));
  }

  /* ==========================================
     5. EFEITO MERGE — PALAVRAS UMA A UMA
     Palavras com .palavra sobem em cascata
  ========================================== */
  function animarTextoPalavras() {
    // Já tem .palavra no HTML, só precisa observar
    const observadorMerge = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        entrada.target.classList.toggle('visivel', entrada.isIntersecting);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.texto-merge').forEach(texto => {
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
      const fotoHero = document.querySelector('.hero-foto-wrap img');
      if (fotoHero) {
        fotoHero.style.transform = `scale(1) translateY(${rolagem * 0.25}px)`;
      }

      // Foto da seção sobre tem movimento sutil
      const fotoSobre = document.querySelector('.sobre-foto-principal');
      if (fotoSobre) {
        const secaoSobre = document.getElementById('secao-sobre');
        const posicaoRelativa = secaoSobre.getBoundingClientRect().top;
        const deslocamento = -posicaoRelativa * 0.08;
        fotoSobre.style.transform = `translateY(${deslocamento}px)`;
      }
    }

    window.addEventListener('scroll', calcularParalaxe, { passive: true });
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

    const observadorEstatisticas = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          const numeros = entrada.target.querySelectorAll('.estatistica-numero');
          numeros.forEach(num => {
            const valorAlvo = parseInt(num.textContent);
            animarUmNumero(num, valorAlvo);
          });
          observadorEstatisticas.unobserve(entrada.target); // dispara só uma vez
        }
      });
    }, { threshold: 0.5 });

    const blocoEstatisticas = document.querySelector('.sobre-estatisticas');
    if (blocoEstatisticas) observadorEstatisticas.observe(blocoEstatisticas);
  }

  /* ==========================================
     8. GALERIA ARRASTÁVEL
     Arraste com mouse ou toque para rolar
  ========================================== */
  function galeriaArrastavel() {
    const galeriaTrilha = document.getElementById('galeria-trilha');
    if (!galeriaTrilha) return;

    let estaArrastando    = false;
    let posInicioArrasto  = 0;
    let scrollInicioArrasto = 0;

    // Mouse
    galeriaTrilha.addEventListener('mousedown', (e) => {
      estaArrastando = true;
      galeriaTrilha.style.cursor = 'grabbing';
      posInicioArrasto    = e.pageX - galeriaTrilha.offsetLeft;
      scrollInicioArrasto = galeriaTrilha.scrollLeft;
    });

    galeriaTrilha.addEventListener('mouseleave', () => {
      estaArrastando = false;
      galeriaTrilha.style.cursor = 'grab';
    });

    galeriaTrilha.addEventListener('mouseup', () => {
      estaArrastando = false;
      galeriaTrilha.style.cursor = 'grab';
    });

    galeriaTrilha.addEventListener('mousemove', (e) => {
      if (!estaArrastando) return;
      e.preventDefault();
      const posAtual       = e.pageX - galeriaTrilha.offsetLeft;
      const distanciaArrastada = (posAtual - posInicioArrasto) * 1.8;
      galeriaTrilha.scrollLeft = scrollInicioArrasto - distanciaArrastada;
    });

    // Toque (mobile)
    let toqueInicioX    = 0;
    let scrollInicioToque = 0;

    galeriaTrilha.addEventListener('touchstart', (e) => {
      toqueInicioX      = e.touches[0].pageX;
      scrollInicioToque = galeriaTrilha.scrollLeft;
    }, { passive: true });

    galeriaTrilha.addEventListener('touchmove', (e) => {
      const diferenca = toqueInicioX - e.touches[0].pageX;
      galeriaTrilha.scrollLeft = scrollInicioToque + diferenca;
    }, { passive: true });

    galeriaTrilha.style.cursor     = 'grab';
    galeriaTrilha.style.overflowX  = 'scroll';
    galeriaTrilha.style.scrollbarWidth = 'none';
  }

  /* ==========================================
     9. MODELO 3D — THREE.JS
     Objetos arquitetônicos flutuantes com
     reação ao movimento do mouse
  ========================================== */
  function iniciar3D() {
    const canvas3D = document.getElementById('canvas-3d');
    if (!canvas3D || typeof THREE === 'undefined') return;

    // Setup básico
    const renderizador = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true, alpha: true });
    const cena         = new THREE.Scene();
    const camera       = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);

    cena.background = new THREE.Color(0x1a0f0a);
    camera.position.set(0, 0, 12);

    function ajustarTamanho() {
      const largura  = canvas3D.parentElement.offsetWidth;
      const altura   = canvas3D.parentElement.offsetHeight;
      renderizador.setSize(largura, altura, false);
      renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = largura / altura;
      camera.updateProjectionMatrix();
    }
    ajustarTamanho();
    window.addEventListener('resize', ajustarTamanho);

    // --- Materiais ---
    const materialNude = new THREE.MeshPhysicalMaterial({
      color: 0xd4bfaf, roughness: 0.4, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.3,
    });
    const materialArame = new THREE.MeshBasicMaterial({
      color: 0x9a7d6d, wireframe: true, transparent: true, opacity: 0.18,
    });
    const materialBrilho = new THREE.MeshPhysicalMaterial({
      color: 0xb89e8c, roughness: 0.2, metalness: 0.5, transparent: true, opacity: 0.7,
    });

    // --- Torre central (caixa vertical) ---
    const geometriaTorre = new THREE.BoxGeometry(1.5, 5, 1.5);
    const torreSolida    = new THREE.Mesh(geometriaTorre, materialNude);
    const torreArame     = new THREE.Mesh(geometriaTorre, materialArame);
    torreArame.scale.set(1.02, 1.02, 1.02);
    cena.add(torreSolida, torreArame);

    // --- Lajes flutuantes (caixas horizontais) ---
    const geometriaLaje = new THREE.BoxGeometry(4, 0.15, 3);
    const alturasDasLajes = [-2.5, 0, 2.5];
    const lajesArray = alturasDasLajes.map((alturaY, i) => {
      const laje = new THREE.Mesh(geometriaLaje, materialNude.clone());
      laje.position.set(0, alturaY, 0);
      laje.rotation.y = (i * Math.PI) / 6;
      cena.add(laje);
      return laje;
    });

    // --- Esferas em órbita ---
    const geometriaEsfera = new THREE.SphereGeometry(0.4, 32, 32);
    const angulosDeOrbita = [0, Math.PI * 0.66, Math.PI * 1.33];
    const dadosOrbita = angulosDeOrbita.map((angulo, i) => {
      const esfera = new THREE.Mesh(geometriaEsfera, materialBrilho.clone());
      esfera.material.color.setHex(i === 0 ? 0xd4bfaf : i === 1 ? 0xb89e8c : 0x9a7d6d);
      const raio = 4 + i * 1.5;
      esfera.position.set(Math.cos(angulo) * raio, (i - 1) * 1.5, Math.sin(angulo) * raio);
      cena.add(esfera);
      return { malha: esfera, raio, velocidade: 0.004 + i * 0.002, angulo, alturaBase: (i - 1) * 1.5 };
    });

    // --- Torus flutuante ---
    const geometriaTorus = new THREE.TorusGeometry(3.5, 0.08, 12, 80);
    const torus = new THREE.Mesh(geometriaTorus, new THREE.MeshPhysicalMaterial({
      color: 0xb89e8c, roughness: 0.3, metalness: 0.3, transparent: true, opacity: 0.5,
    }));
    torus.rotation.x = Math.PI / 2.4;
    cena.add(torus);

    // --- Iluminação ---
    cena.add(new THREE.AmbientLight(0xfdf8f4, 0.8));
    const luzDirecional = new THREE.DirectionalLight(0xfdf8f4, 1.8);
    luzDirecional.position.set(6, 10, 8);
    cena.add(luzDirecional);
    const luzQuente   = new THREE.PointLight(0xd4bfaf, 2.5, 25);
    const luzDetalhe  = new THREE.PointLight(0x9a7d6d, 1.8, 20);
    luzQuente.position.set(-5, 3, 5);
    luzDetalhe.position.set(5, -3, -5);
    cena.add(luzQuente, luzDetalhe);

    // --- Campo de partículas (poeira no ar) ---
    const quantidadeParticulas = 500;
    const posParticulas = new Float32Array(quantidadeParticulas * 3);
    for (let i = 0; i < quantidadeParticulas * 3; i++) {
      posParticulas[i] = (Math.random() - 0.5) * 40;
    }
    const geoParticulas = new THREE.BufferGeometry();
    geoParticulas.setAttribute('position', new THREE.BufferAttribute(posParticulas, 3));
    const particulas = new THREE.Points(geoParticulas, new THREE.PointsMaterial({
      color: 0x9a7d6d, size: 0.06, transparent: true, opacity: 0.55,
    }));
    cena.add(particulas);

    // --- Reação ao mouse ---
    let alvoRotacaoX = 0, alvoRotacaoY = 0;
    let rotacaoAtualX = 0, rotacaoAtualY = 0;

    document.addEventListener('mousemove', (e) => {
      alvoRotacaoX = (e.clientY / window.innerHeight - 0.5) * 0.4;
      alvoRotacaoY = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    });

    // --- Loop de animação ---
    let tempoDecorrido = 0;

    function animar3D() {
      requestAnimationFrame(animar3D);
      tempoDecorrido += 0.008;

      // Interpolação suave do movimento do mouse
      rotacaoAtualX += (alvoRotacaoX - rotacaoAtualX) * 0.04;
      rotacaoAtualY += (alvoRotacaoY - rotacaoAtualY) * 0.04;

      // Torre gira
      torreSolida.rotation.y = tempoDecorrido * 0.4;
      torreArame.rotation.y  = tempoDecorrido * 0.4;

      // Lajes giram e flutuam
      lajesArray.forEach((laje, i) => {
        laje.rotation.y   = tempoDecorrido * 0.15 * (i % 2 === 0 ? 1 : -1);
        laje.position.y   = alturasDasLajes[i] + Math.sin(tempoDecorrido + i) * 0.12;
      });

      // Esferas orbitam
      dadosOrbita.forEach(orbita => {
        orbita.angulo      += orbita.velocidade;
        orbita.malha.position.x = Math.cos(orbita.angulo) * orbita.raio;
        orbita.malha.position.z = Math.sin(orbita.angulo) * orbita.raio;
        orbita.malha.position.y = orbita.alturaBase + Math.sin(tempoDecorrido * 1.5 + orbita.angulo) * 0.5;
      });

      // Torus gira
      torus.rotation.z = tempoDecorrido * 0.12;
      torus.rotation.x = Math.PI / 2.4 + Math.sin(tempoDecorrido * 0.4) * 0.1;

      // Partículas giram devagar
      particulas.rotation.y = tempoDecorrido * 0.03;

      // Câmera segue o mouse suavemente
      camera.position.x = Math.sin(rotacaoAtualY) * 2;
      camera.position.y = Math.sin(rotacaoAtualX) * 1.5;
      camera.lookAt(0, 0, 0);

      // Luz quente circula a cena
      luzQuente.position.x = Math.sin(tempoDecorrido * 0.7) * 6;
      luzQuente.position.z = Math.cos(tempoDecorrido * 0.7) * 6;

      renderizador.render(cena, camera);
    }

    animar3D();
  }

  /* ==========================================
     10. SCROLL SUAVE DOS LINKS DO MENU
     Clique nas âncoras rola suavemente
  ========================================== */
  function scrollSuaveDosLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const destino = document.querySelector(this.getAttribute('href'));
        if (destino) {
          e.preventDefault();
          destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      const todasSecoes = document.querySelectorAll('section');
      todasSecoes.forEach(secao => {
        const posicao         = secao.getBoundingClientRect();
        const alturaViewport  = window.innerHeight;
        const centroDaSecao   = posicao.top + posicao.height / 2;
        const distanciaDoMeio = Math.abs(centroDaSecao - alturaViewport / 2);
        const distanciaMax    = alturaViewport * 0.8;
        const intensidadeBlur = Math.max(0, (distanciaDoMeio / distanciaMax - 0.6) * 8);
        const opacidade       = Math.max(0.5, 1 - intensidadeBlur * 0.04);

        secao.style.filter  = `blur(${Math.min(intensidadeBlur, 4)}px)`;
        secao.style.opacity = opacidade;
      });

      // A seção 3D nunca fica desfocada (senão o canvas trava)
      const secao3D = document.getElementById('secao-modelo-3d');
      if (secao3D) {
        secao3D.style.filter  = 'none';
        secao3D.style.opacity = '1';
      }
    }

    window.addEventListener('scroll', aplicarDesfoque, { passive: true });
  }

  /* ==========================================
     12. CLIQUE NAS CARTAS DE PROJETO
     A carta clicada vai para o centro e as 
     outras se reorganizam ao redor
  ========================================== */
  function cliqueDasCartas() {
    const todasAsCartas = document.querySelectorAll('.carta-projeto');

    todasAsCartas.forEach((cartaClicada, indiceDaClicada) => {
      cartaClicada.addEventListener('click', () => {
        todasAsCartas.forEach((carta, indiceDaCarta) => {
          carta.style.transition = 'transform 0.7s cubic-bezier(0.76,0,0.24,1), opacity 0.5s ease, box-shadow 0.5s ease';

          if (indiceDaCarta === indiceDaClicada) {
            // Carta clicada: vai para o centro e fica maior
            carta.style.transform  = 'translateX(-50%) translateY(-70%) rotate(0deg) scale(1.05)';
            carta.style.zIndex     = '20';
            carta.style.opacity    = '1';
            carta.style.boxShadow  = '0 40px 100px rgba(42,31,26,0.45)';
          } else {
            // Outras cartas: se afastam proporcionalmente
            const distancia   = indiceDaCarta - indiceDaClicada;
            const rotacao     = distancia * 6;
            const deslocamento = distancia * 160;
            carta.style.transform = `translateX(calc(-50% + ${deslocamento}px)) translateY(-50%) rotate(${rotacao}deg)`;
            carta.style.zIndex    = `${5 - Math.abs(distancia)}`;
            carta.style.opacity   = `${0.6 + Math.min(Math.abs(distancia) * 0.1, 0.3)}`;
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
    const itensServico = document.querySelectorAll('.servico-item');
    const listaServicos = Array.from(itensServico);

    const observadorServicos = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          const posicaoNaLista = listaServicos.indexOf(entrada.target);
          const atrasoMs       = posicaoNaLista * 100; // cada item 100ms depois
          entrada.target.style.transitionDelay = `${atrasoMs}ms`;
          entrada.target.classList.add('visivel');
        }
      });
    }, { threshold: 0.15 });

    itensServico.forEach(item => observadorServicos.observe(item));
  }

  /* ==========================================
     INICIALIZAR TUDO
  ========================================== */
  removerTelaCarregamento();
  iniciarCursor();
  menuAoRolar();
  animarAoEntrarNaTela();
  animarTextoPalavras();
  paralaxeAoRolar();
  contarNumeros();
  galeriaArrastavel();
  iniciar3D();
  scrollSuaveDosLinks();
  desfoqueEntreSecoes();
  cliqueDasCartas();
  animarServicosEmCascata();

})();