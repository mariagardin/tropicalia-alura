document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     WIDGET DE ACESSIBILIDADE (hover, clique, teclado + fonte)
  ========================================================== */
  const container = document.getElementById('acessibilidade');
  const botao = document.getElementById('botao-acessibilidade');
  const lista = document.getElementById('opcoes-acessibilidade');
  const btnMais = document.getElementById('aumentar-fonte');
  const btnMenos = document.getElementById('diminuir-fonte');

  let hideTimeout = null;

  function openMenu() {
    lista.classList.add('is-open');
    botao.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    lista.classList.remove('is-open');
    botao.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    lista.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  // Hover (desktop)
  container.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    openMenu();
  });
  container.addEventListener('mouseleave', () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(closeMenu, 200);
  });

  // Clique (touch & fallback)
  botao.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Teclado (focus/blur)
  container.addEventListener('focusin', () => {
    clearTimeout(hideTimeout);
    openMenu();
  });
  container.addEventListener('focusout', (e) => {
    if (!container.contains(e.relatedTarget)) {
      hideTimeout = setTimeout(closeMenu, 150);
    }
  });

  // Controle de fonte
  let tamanhoAtualFonte = 1; // rem
  const max = 2.0, min = 0.7, step = 0.1;

  function aplicarFonte() {
    document.body.style.fontSize = `${tamanhoAtualFonte}rem`;
  }

  btnMais.addEventListener('click', () => {
    if (tamanhoAtualFonte < max) {
      tamanhoAtualFonte = +(tamanhoAtualFonte + step).toFixed(2);
      aplicarFonte();
    }
  });

  btnMenos.addEventListener('click', () => {
    if (tamanhoAtualFonte > min) {
      tamanhoAtualFonte = +(tamanhoAtualFonte - step).toFixed(2);
      aplicarFonte();
    }
  });

  // Estado inicial do widget
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-haspopup', 'true');
  botao.setAttribute('aria-controls', 'opcoes-acessibilidade');

  /* =========================================================
     SCROLL SPY (marca Início / Galeria / Contato automaticamente)
  ========================================================== */
  // Mapeia links do menu (href="#id") e seções correspondentes
  const navLinks = Array.from(document.querySelectorAll('nav .nav-link[href^="#"]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  // Função para limpar/definir .active
  function setActive(idAtivo) {
    navLinks.forEach(link => {
      const hash = link.getAttribute('href');
      if (hash === `#${idAtivo}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Observer: ativa quando ~40% da seção está visível
  const observer = new IntersectionObserver((entries) => {
    // Prioriza a que está mais visível
    let alvo = null;
    let maiorIntersec = 0;

    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > maiorIntersec) {
        maiorIntersec = entry.intersectionRatio;
        alvo = entry.target;
      }
    });

    if (alvo && alvo.id) setActive(alvo.id);
  }, {
    root: null,
    threshold: [0.25, 0.4, 0.6, 0.75],
    // rootMargin puxa um pouco a “zona” pro centro da tela:
    rootMargin: '-20% 0px -40% 0px'
  });

  sections.forEach(sec => observer.observe(sec));

  // Marca corretamente ao carregar (caso já abra no meio da página)
  // Procura a seção mais próxima do topo visível
  function initActiveByScroll() {
    let melhor = null;
    let menorDist = Infinity;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const dist = Math.abs(rect.top - window.innerHeight * 0.3); // 30% da viewport
      if (dist < menorDist) {
        menorDist = dist;
        melhor = sec;
      }
    });
    if (melhor && melhor.id) setActive(melhor.id);
  }
  initActiveByScroll();

  // Clique suave nos links (opcional; melhora a UX)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const alvoId = link.getAttribute('href');
      if (alvoId.startsWith('#')) {
        const alvo = document.querySelector(alvoId);
        if (alvo) {
          e.preventDefault();
          alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Define .active imediatamente ao clicar (feedback)
          setActive(alvo.id);
        }
      }
    });
  });

  // Fallback: se IntersectionObserver não existir (navegadores muito antigos)
  if (typeof IntersectionObserver === 'undefined') {
    window.addEventListener('scroll', () => {
      let current = sections[0];
      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top >= 0 && top < window.innerHeight * 0.5) current = sec;
      });
      if (current && current.id) setActive(current.id);
    });
  }
});
