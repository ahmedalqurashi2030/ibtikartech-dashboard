(() => {
  // Capture failures from both initial and later-inserted brand images.
  const recoverLogo = (logo) => {
    const images = [...logo.querySelectorAll('img')];
    images.filter(img => img.complete && !img.naturalWidth).forEach(img => img.remove());
    const remaining = [...logo.querySelectorAll('img')];
    if (remaining.length === images.length) return;
    logo.classList.remove('ibt-shell-logo--has-inverse');
    remaining.forEach(img => img.classList.remove('ibt-shell-logo-default', 'ibt-shell-logo-inverse'));
    if (!remaining.length) {
      logo.classList.remove('ibt-shell-logo--asset');
      logo.replaceChildren(...Array.from({ length: 3 }, () => document.createElement('i')));
    }
  };
  document.querySelectorAll('.ibt-shell-logo--asset').forEach(recoverLogo);
  document.addEventListener('error', event => {
    if (!(event.target instanceof HTMLImageElement)) return;
    const logo = event.target.closest('.ibt-shell-logo--asset');
    if (logo) recoverLogo(logo);
  }, true);
  document.querySelectorAll('#year').forEach((item) => { item.textContent = new Date().getFullYear(); });
  const megaToggles = [...document.querySelectorAll('[data-ibt-mega-toggle]')];
  const megaRoots = [...document.querySelectorAll('[data-ibt-mega-root]')];
  const managedThemeButtons = [...document.querySelectorAll('[data-ibt-theme-toggle]:not([data-ibt-theme-managed="page"])')];
  const managedMenuButtons = [...document.querySelectorAll('[data-ibt-menu-toggle]:not([data-ibt-menu-managed="page"])')];
  let lastMegaToggle = null;

  const menuFor = (toggle) => toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;

  function applyMegaState(toggle, open) {
    const menu = menuFor(toggle);
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded',String(open));
    if (open) {
      // Keep the approved opacity/transform animation, but do not let the
      // visibility transition delay keyboard focus into the disclosed panel.
      menu.style.transitionProperty = 'opacity, transform';
      menu.style.visibility = 'visible';
    } else {
      menu.style.removeProperty('transition-property');
      menu.style.removeProperty('visibility');
    }
    menu.classList.toggle('is-open',open);
    menu.setAttribute('aria-hidden',String(!open));
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert','');
    if (open) lastMegaToggle = toggle;
  }

  function closeMega(except = null, restoreFocus = false) {
    megaToggles.forEach((toggle) => {
      if (toggle === except) return;
      const menu = menuFor(toggle);
      const wasOpen = menu?.classList.contains('is-open');
      applyMegaState(toggle,false);
      if (restoreFocus && wasOpen) toggle.focus();
    });
  }

  function setMega(toggle, open) {
    if (!toggle || !menuFor(toggle)) return;
    if (open) closeMega(toggle);
    applyMegaState(toggle,open);
  }

  function focusMegaItem(toggle, edge = 'first') {
    const menu = menuFor(toggle);
    if (!menu?.classList.contains('is-open')) return;
    const items = [...menu.querySelectorAll(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )].filter((item) => !item.hidden && item.getClientRects().length);
    const target = edge === 'last' ? items.at(-1) : items[0];
    if (!target) return;
    const focusIfOpen = () => {
      if (!menu.classList.contains('is-open')) return;
      target.focus({ preventScroll: true });
    };
    focusIfOpen();
    window.setTimeout(() => {
      if (menu.classList.contains('is-open') && !menu.contains(document.activeElement)) focusIfOpen();
    }, 0);
  }

  megaToggles.forEach((toggle) => {
    applyMegaState(toggle,false);
    toggle.addEventListener('click',(event) => {
      event.preventDefault();
      setMega(toggle,toggle.getAttribute('aria-expanded') !== 'true');
    });
    toggle.addEventListener('keydown',(event) => {
      if (!['ArrowDown','ArrowUp','Enter',' '].includes(event.key)) return;
      event.preventDefault();
      setMega(toggle,true);
      focusMegaItem(toggle,event.key === 'ArrowUp' ? 'last' : 'first');
    });
  });

  // The label remains a real destination; the adjacent arrow owns expansion.
  megaRoots.forEach((root) => {
    const link = root.querySelector(':scope > .ibt-shell-nav-link');
    const toggle = root.querySelector('[data-ibt-mega-toggle]');
    const menu = menuFor(toggle);
    if (!link || !toggle || !menu) return;
    // The destination link remains a plain link. The adjacent button alone
    // owns popup semantics through aria-expanded and aria-controls.

    root.addEventListener('focusout',(event) => {
      const next = event.relatedTarget;
      if (next && root.contains(next)) return;
      requestAnimationFrame(() => { if (!root.contains(document.activeElement)) setMega(toggle,false); });
    });
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      root.addEventListener('pointerenter',() => setMega(toggle,true));
      root.addEventListener('pointerleave',() => {
        if (!root.contains(document.activeElement)) setMega(toggle,false);
      });
    }
  });

  document.addEventListener('click',(event) => { if (!event.target.closest('[data-ibt-mega-root]')) closeMega(); });
  document.addEventListener('keydown',(event) => {
    if (event.key === 'Escape' && lastMegaToggle) {
      const open = menuFor(lastMegaToggle)?.classList.contains('is-open');
      closeMega(null,open);
      lastMegaToggle = null;
    }
  });

  managedMenuButtons.forEach((button) => {
    const menu = document.getElementById(button.getAttribute('aria-controls'));
    if (!menu) return;
    let previousOverflow = '';
   const focusables = () => [...menu.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')]
      .filter((item) => !item.hidden && item.getClientRects().length);

    const closeMenu = (restoreFocus = false) => {
      menu.classList.remove('open','is-open');
      menu.setAttribute('aria-hidden','true');
      menu.setAttribute('inert','');
      button.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = previousOverflow;
      if (restoreFocus) button.focus();
    };

    const openMenu = () => {
      closeMega();
      previousOverflow = document.body.style.overflow;
      menu.classList.add('open','is-open');
      menu.setAttribute('aria-hidden','false');
      menu.removeAttribute('inert');
      button.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      const firstItem = menu.querySelector('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])');
      firstItem?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (!menu.contains(document.activeElement)) firstItem?.focus({ preventScroll: true });
      });
    };

    button.addEventListener('click',() => {
      const open = menu.classList.contains('open');
      if (open) closeMenu(true); else openMenu();
    });
    // Explicitly mirror native button keyboard activation. This keeps Enter and
    // Space reliable in assisted/headless input paths without causing duplicate clicks.
    button.addEventListener('keydown',(event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        button.click();
      } else if (event.key === ' ') {
        event.preventDefault();
      }
    });
    button.addEventListener('keyup',(event) => {
      if (event.key !== ' ') return;
      event.preventDefault();
      button.click();
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click',() => closeMenu()));
    menu.querySelectorAll('details').forEach((details) => {
      details.addEventListener('toggle',() => {
        if (!details.open) return;
        menu.querySelectorAll('details[open]').forEach((other) => { if (other !== details) other.open = false; });
      });
    });
    document.addEventListener('keydown',(event) => {
      if (!menu.classList.contains('open')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize',() => { if (innerWidth > 1180 && menu.classList.contains('open')) closeMenu(); },{passive:true});
  });

  const applySavedTheme = () => {
    try {
      const saved = localStorage.getItem('ibtikar-theme');
      if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
    } catch {}
  };
  const syncThemeControls = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    managedThemeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
      const icon = button.querySelector('[data-ibt-theme-icon]');
      if (icon) icon.textContent = dark ? '☀' : '☾';
    });
  };
  applySavedTheme();
  syncThemeControls();
  managedThemeButtons.forEach((button) => {
    button.addEventListener('click',() => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ibtikar-theme',next); } catch {}
      syncThemeControls();
    });
  });
  window.addEventListener('storage',(event) => {
    if (event.key !== 'ibtikar-theme') return;
    applySavedTheme();
    syncThemeControls();
  });

  /* Shared mobile drawer ------------------------------------------------ */
  const sharedMobileMenus = [...document.querySelectorAll('.ibt-shell-mobile-menu')];
  if (sharedMobileMenus.length) {
    const backdrop = document.createElement('div');
    backdrop.className = 'ibt-mobile-backdrop';
    backdrop.setAttribute('aria-hidden','true');
    document.body.appendChild(backdrop);

    const syncDrawer = (menu, toggle) => {
      const open = menu.classList.contains('open') || menu.classList.contains('is-open');
      backdrop.classList.toggle('is-open',open);
      menu.toggleAttribute('inert',!open);
      toggle?.setAttribute('aria-label',open ? 'إغلاق القائمة' : 'فتح القائمة');
    };

    sharedMobileMenus.forEach((menu) => {
      const toggle = document.querySelector(`[aria-controls="${menu.id}"]`);
      menu.querySelectorAll('[data-ibt-menu-close]').forEach((closeButton) => {
        closeButton.addEventListener('click',() => {
          if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
        });
      });
      syncDrawer(menu,toggle);
      new MutationObserver(() => syncDrawer(menu,toggle)).observe(menu,{attributes:true,attributeFilter:['class','aria-hidden']});
      backdrop.addEventListener('click',() => {
        if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
      });
    });
  }

  const initSharedFaq = () => {
    const faqRoots = [...document.querySelectorAll('#faq, .faq-section, .service-faq-grid, [data-faq-accordion]')];
    const rootsToProcess = faqRoots.length ? faqRoots : [document.body];

    rootsToProcess.forEach((faqRoot) => {
      const items = [...faqRoot.querySelectorAll('.accordion-item, .faq-item, .accordion > .faq, .faq-list > .faq')];
      const getButton = (item) => item.querySelector(':scope > button');
      const getAnswer = (item, button) => {
        const controlsId = button?.getAttribute('aria-controls');
        if (controlsId) return document.getElementById(controlsId);
        return item.querySelector('.faq-answer, .accordion-content');
      };

      const setItemState = (item, open) => {
        const button = getButton(item);
        const answer = getAnswer(item, button);
        if (!button) return;

        item.classList.toggle('open', open);
        item.classList.toggle('active', open);
        button.setAttribute('aria-expanded', String(open));

        if (answer) {
          answer.hidden = !open;
          answer.setAttribute('aria-hidden', String(!open));
          if (item.classList.contains('faq-item') || answer.classList.contains('faq-answer')) {
            answer.style.maxHeight = open ? `${answer.scrollHeight}px` : '0px';
          }
        }

        const icon = button.querySelector('i');
        if (icon && /^[+\-−]$/.test(icon.textContent.trim())) {
          icon.textContent = open ? '−' : '+';
        }
      };

      items.forEach((item) => {
        const button = getButton(item);
        if (!button || button.dataset.ibtFaqReady === 'true') return;
        button.dataset.ibtFaqReady = 'true';
        if (!button.type) button.type = 'button';

        const initiallyOpen = item.classList.contains('open')
          || item.classList.contains('active')
          || button.getAttribute('aria-expanded') === 'true';
        setItemState(item, initiallyOpen);

        button.addEventListener('click', () => {
          const willOpen = !(item.classList.contains('open') || item.classList.contains('active'));
          if (willOpen) {
            items.forEach((other) => {
              if (other !== item) setItemState(other, false);
            });
          }
          setItemState(item, willOpen);
        });
      });

      faqRoot.querySelectorAll('details').forEach((details) => {
        if (details.dataset.ibtFaqReady === 'true') return;
        details.dataset.ibtFaqReady = 'true';
        details.addEventListener('toggle', () => {
          if (!details.open) return;
          faqRoot.querySelectorAll('details[open]').forEach((other) => {
            if (other !== details) other.open = false;
          });
        });
      });
    });
  };

  const enhancePageContent = () => {
    initSharedFaq();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',enhancePageContent,{once:true});
  } else {
    enhancePageContent();
  }

  window.IBTIKAR_ANALYTICS?.init?.();
})();
