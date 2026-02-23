/* ============================================
   MILENA REIS — Script Principal
   Efeitos: Cursor, Preloader, Parallax, 
   Scroll Reveal, Merge Text, Three.js 3D,
   Gallery Drag, Counters
   ============================================ */

(function () {
  'use strict';

  // =========== PRELOADER ===========
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 900);
    }, 2200);
  });

  // =========== CURSOR PERSONALIZADO ===========
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();

  document.querySelectorAll('a, button, .project-card, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      cursorRing.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      cursorRing.classList.remove('active');
    });
  });

  // =========== NAVBAR SCROLL ===========
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // =========== SCROLL REVEAL ===========
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .blur-in').forEach(el => {
    revealObserver.observe(el);
  });

  // =========== MERGE TEXT EFFECT ===========
  function initMergeText() {
    document.querySelectorAll('.merge-text').forEach(el => {
      // Split text into word spans if not already done
      if (!el.querySelector('.word')) {
        const text = el.textContent;
        el.innerHTML = '';
        text.split(' ').forEach(word => {
          const span = document.createElement('span');
          span.classList.add('word');
          span.innerHTML = word + ' ';
          el.appendChild(span);
        });
      }
    });
  }
  initMergeText();

  const mergeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.merge-text').forEach(el => mergeObserver.observe(el));

  // =========== PARALLAX ON SCROLL ===========
  function handleParallax() {
    const scrollY = window.scrollY;

    // Hero image parallax
    const heroImg = document.querySelector('.hero-image-wrap img');
    if (heroImg) {
      heroImg.style.transform = `scale(1) translateY(${scrollY * 0.25}px)`;
    }

    // About images subtle movement
    const aboutMain = document.querySelector('.about-img-main');
    if (aboutMain) {
      const section = document.getElementById('about');
      const rect = section.getBoundingClientRect();
      const offset = -rect.top * 0.08;
      aboutMain.style.transform = `translateY(${offset}px)`;
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  // =========== COUNTER ANIMATION ===========
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numbers = entry.target.querySelectorAll('.stat-number');
        numbers.forEach(num => {
          const target = parseInt(num.textContent);
          animateCounter(num, target);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.about-stats');
  if (statsSection) counterObserver.observe(statsSection);

  // =========== GALLERY HORIZONTAL DRAG SCROLL ===========
  const galleryStrip = document.getElementById('galleryStrip');
  if (galleryStrip) {
    let isDown = false;
    let startX, scrollLeft;

    galleryStrip.addEventListener('mousedown', e => {
      isDown = true;
      galleryStrip.style.cursor = 'grabbing';
      startX = e.pageX - galleryStrip.offsetLeft;
      scrollLeft = galleryStrip.scrollLeft;
    });

    galleryStrip.addEventListener('mouseleave', () => {
      isDown = false;
      galleryStrip.style.cursor = 'grab';
    });

    galleryStrip.addEventListener('mouseup', () => {
      isDown = false;
      galleryStrip.style.cursor = 'grab';
    });

    galleryStrip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - galleryStrip.offsetLeft;
      const walk = (x - startX) * 1.8;
      galleryStrip.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    let touchStartX = 0;
    let touchScrollLeft = 0;

    galleryStrip.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = galleryStrip.scrollLeft;
    }, { passive: true });

    galleryStrip.addEventListener('touchmove', e => {
      const diff = touchStartX - e.touches[0].pageX;
      galleryStrip.scrollLeft = touchScrollLeft + diff;
    }, { passive: true });

    galleryStrip.style.cursor = 'grab';
    galleryStrip.style.overflowX = 'scroll';
    galleryStrip.style.scrollbarWidth = 'none';
  }

  // =========== THREE.JS 3D MODEL ===========
  (function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0f0a); // dark brown-black

    const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);

    function resizeRenderer() {
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Materials
    const nudeMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4bfaf,
      roughness: 0.4,
      metalness: 0.0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.3,
      transparent: false,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x9a7d6d,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });

    const glowMat = new THREE.MeshPhysicalMaterial({
      color: 0xb89e8c,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.7,
    });

    // ---- GEOMETRIES: architectural-inspired ----

    // Central floating tower form
    const towerGeo = new THREE.BoxGeometry(1.5, 5, 1.5);
    const tower = new THREE.Mesh(towerGeo, nudeMat);
    tower.position.set(0, 0, 0);
    scene.add(tower);

    const towerWire = new THREE.Mesh(towerGeo, wireMat);
    towerWire.scale.set(1.02, 1.02, 1.02);
    scene.add(towerWire);

    // Floating horizontal slabs
    const slabGeo = new THREE.BoxGeometry(4, 0.15, 3);
    const slabPositions = [-2.5, 0, 2.5];
    const slabs = slabPositions.map((y, i) => {
      const slab = new THREE.Mesh(slabGeo, nudeMat.clone());
      slab.material.opacity = 0.85 + i * 0.05;
      slab.position.set(0, y, 0);
      slab.rotation.y = (i * Math.PI) / 6;
      scene.add(slab);
      return slab;
    });

    // Orbiting spheres
    const sphereGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const orbits = [];
    const orbitAngles = [0, Math.PI * 0.66, Math.PI * 1.33];
    orbitAngles.forEach((angle, i) => {
      const sphere = new THREE.Mesh(sphereGeo, glowMat.clone());
      sphere.material.color.setHex(i === 0 ? 0xd4bfaf : i === 1 ? 0xb89e8c : 0x9a7d6d);
      const radius = 4 + i * 1.5;
      sphere.position.set(
        Math.cos(angle) * radius,
        (i - 1) * 1.5,
        Math.sin(angle) * radius
      );
      scene.add(sphere);
      orbits.push({ mesh: sphere, radius, speed: 0.004 + i * 0.002, angle, yPos: (i - 1) * 1.5 });
    });

    // Floating torus
    const torusGeo = new THREE.TorusGeometry(3.5, 0.08, 12, 80);
    const torus = new THREE.Mesh(torusGeo, new THREE.MeshPhysicalMaterial({
      color: 0xb89e8c,
      roughness: 0.3,
      metalness: 0.3,
      transparent: true,
      opacity: 0.5,
    }));
    torus.rotation.x = Math.PI / 2.4;
    scene.add(torus);

    // Ambient + directional lights
    const ambient = new THREE.AmbientLight(0xfdf8f4, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfdf8f4, 1.8);
    dirLight.position.set(6, 10, 8);
    scene.add(dirLight);

    const warmLight = new THREE.PointLight(0xd4bfaf, 2.5, 25);
    warmLight.position.set(-5, 3, 5);
    scene.add(warmLight);

    const accentLight = new THREE.PointLight(0x9a7d6d, 1.8, 20);
    accentLight.position.set(5, -3, -5);
    scene.add(accentLight);

    // Particle field
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x9a7d6d,
      size: 0.06,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse interaction
    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    document.addEventListener('mousemove', e => {
      targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.4;
      targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.6;
    });

    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.008;

      // Smooth mouse follow for scene group rotation
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      tower.rotation.y = time * 0.4;
      towerWire.rotation.y = time * 0.4;

      slabs.forEach((slab, i) => {
        slab.rotation.y = time * 0.15 * (i % 2 === 0 ? 1 : -1);
        slab.position.y = slabPositions[i] + Math.sin(time + i) * 0.12;
      });

      orbits.forEach(o => {
        o.angle += o.speed;
        o.mesh.position.x = Math.cos(o.angle) * o.radius;
        o.mesh.position.z = Math.sin(o.angle) * o.radius;
        o.mesh.position.y = o.yPos + Math.sin(time * 1.5 + o.angle) * 0.5;
      });

      torus.rotation.z = time * 0.12;
      torus.rotation.x = Math.PI / 2.4 + Math.sin(time * 0.4) * 0.1;

      particles.rotation.y = time * 0.03;

      // Apply mouse parallax to camera
      camera.position.x = Math.sin(currentRotY) * 2;
      camera.position.y = Math.sin(currentRotX) * 1.5;
      camera.lookAt(0, 0, 0);

      warmLight.position.x = Math.sin(time * 0.7) * 6;
      warmLight.position.z = Math.cos(time * 0.7) * 6;

      renderer.render(scene, camera);
    }

    animate();
  })();

  // =========== SMOOTH SCROLL FOR NAV LINKS ===========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // =========== SECTION BLUR TRANSITION ON SCROLL ===========
  // Apply blur effect to sections as they enter/exit viewport
  function handleSectionBlur() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - vh / 2);
      const maxDist = vh * 0.8;
      const blurAmount = Math.max(0, (distanceFromCenter / maxDist - 0.6) * 8);
      const opacity = Math.max(0.5, 1 - blurAmount * 0.04);
      section.style.filter = `blur(${Math.min(blurAmount, 4)}px)`;
      section.style.opacity = opacity;
    });

    // Canvas section no blur
    const canvasSec = document.getElementById('canvas-section');
    if (canvasSec) {
      canvasSec.style.filter = 'none';
      canvasSec.style.opacity = '1';
    }
  }

  window.addEventListener('scroll', handleSectionBlur, { passive: true });

  // =========== CARD CLICK — BRING TO FRONT ===========
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      // Animate selected card to center
      const offsets = [
        'translateX(calc(-50% - 320px)) translateY(-65%) rotate(-12deg)',
        'translateX(calc(-50% - 160px)) translateY(-65%) rotate(-6deg)',
        'translateX(-50%) translateY(-67%)',
        'translateX(calc(-50% + 160px)) translateY(-65%) rotate(6deg)',
        'translateX(calc(-50% + 320px)) translateY(-65%) rotate(12deg)',
      ];

      cards.forEach((c, j) => {
        c.style.transition = 'transform 0.7s cubic-bezier(0.76,0,0.24,1), z-index 0s, opacity 0.5s ease, box-shadow 0.5s ease';
        if (j === i) {
          c.style.transform = 'translateX(-50%) translateY(-70%) rotate(0deg) scale(1.05)';
          c.style.zIndex = '20';
          c.style.opacity = '1';
          c.style.boxShadow = '0 40px 100px rgba(42,31,26,0.45)';
        } else {
          const dist = j - i;
          const rotAngle = dist * 6;
          const xOffset = dist * 160;
          c.style.transform = `translateX(calc(-50% + ${xOffset}px)) translateY(-50%) rotate(${rotAngle}deg)`;
          c.style.zIndex = `${5 - Math.abs(dist)}`;
          c.style.opacity = j < i || j > i ? `${0.6 + Math.min(Math.abs(dist) * 0.1, 0.3)}` : '0.7';
        }
      });
    });
  });

  // =========== STAGGER REVEAL FOR SERVICE ITEMS ===========
  const serviceItems = document.querySelectorAll('.service-item');
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = Array.from(serviceItems).indexOf(entry.target) * 100;
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  serviceItems.forEach(item => serviceObserver.observe(item));

  console.log('%cMilena Reis Arquitetura', 'font-family:serif;font-size:20px;color:#9a7d6d;');
  console.log('%cPortfólio Digital', 'font-family:sans-serif;font-size:12px;color:#d4bfaf;');

})();