(() => {
  'use strict';

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function toggleMenu(forceState) {
    if (!mobileMenu) return;
    const isExpanded = forceState !== undefined ? forceState : mobileMenu.classList.contains('hidden');
    if (isExpanded) {
      mobileMenu.classList.remove('hidden');
      menuToggle?.setAttribute('aria-expanded', 'true');
      menuToggle?.setAttribute('aria-label', 'Close navigation menu');
      document.body.classList.add('overflow-hidden');
    } else {
      mobileMenu.classList.add('hidden');
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('overflow-hidden');
    }
  }

  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      if (!mobileMenu.contains(e.target) && !menuToggle?.contains(e.target)) {
        toggleMenu(false);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
      toggleMenu(false);
      menuToggle?.focus();
    }
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Quote / Assessment Form Logic
  const form = document.getElementById('quote-form');
  const modal = document.getElementById('quote-modal');
  const summary = document.getElementById('request-summary');
  const whatsappLink = document.getElementById('whatsapp-link');
  const statusEl = document.getElementById('request-status');
  const clearBtn = document.getElementById('clear-request');
  const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
  const storageKey = 'alphasonic-assessment-request-v1';
  let returnFocus = null;
  let saveTimer = null;

  function announce(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function clearFieldError(field) {
    const err = document.getElementById(`${field.id}-error`);
    if (err) err.remove();
    field.removeAttribute('aria-invalid');
  }

  function validateField(field, showMessage = true) {
    field.setCustomValidity('');
    if (field.required && !field.value.trim()) {
      field.setCustomValidity('Please complete this field.');
    }
    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    if (valid || !showMessage) {
      clearFieldError(field);
      return valid;
    }
    let err = document.getElementById(`${field.id}-error`);
    if (!err) {
      err = document.createElement('small');
      err.id = `${field.id}-error`;
      err.className = 'text-red-600 text-xs mt-1 block';
      err.setAttribute('role', 'alert');
      field.closest('label')?.append(err);
    }
    err.textContent = field.validity.patternMismatch && field.id === 'customer-phone'
      ? 'Enter a South African number such as 074 643 7729 or +27 74 643 7729.'
      : field.validationMessage || 'Please check this value.';
    return false;
  }

  function saveDraft() {
    if (!form) return;
    const fields = [...form.querySelectorAll('input, select, textarea')];
    const draft = Object.fromEntries(fields.map(f => [f.name, f.value]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch (_) {}
  }

  function restoreDraft() {
    if (!form) return;
    let draft;
    try {
      draft = JSON.parse(localStorage.getItem(storageKey) || 'null');
    } catch (_) { return; }
    if (!draft || typeof draft !== 'object') return;
    const fields = [...form.querySelectorAll('input, select, textarea')];
    fields.forEach(field => {
      const val = draft[field.name];
      if (typeof val === 'string') {
        field.value = field.maxLength > 0 ? val.slice(0, field.maxLength) : val;
      }
    });
  }

  function getDetails() {
    if (!form) return [];
    const val = name => String(form.elements.namedItem(name)?.value || '').trim();
    const selectedText = name => {
      const sel = form.elements.namedItem(name);
      return sel?.selectedOptions?.[0]?.textContent.trim() || '';
    };
    return [
      ['Name', val('customerName')],
      ['Phone', val('customerPhone')],
      ['Service', selectedText('service')],
      ['Property type', selectedText('propertyType')],
      ['Suburb / area', val('location')],
      ['Site address', val('siteAddress') || 'To be shared with the team'],
      ['Preferred work timing', selectedText('timeline')],
      ['Assessment availability', val('assessmentAvailability') || 'To be arranged'],
      ['Project details', val('details')]
    ];
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    if (returnFocus?.isConnected) returnFocus.focus();
  }

  if (form) {
    const fields = [...form.querySelectorAll('input, select, textarea')];

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstInvalid = null;
      fields.forEach(f => {
        if (!validateField(f) && !firstInvalid) firstInvalid = f;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        announce('Please correct the highlighted fields before reviewing your request.');
        return;
      }

      clearTimeout(saveTimer);
      saveDraft();

      const details = getDetails();
      const message = [
        'Hello Alphasonic International,', '',
        'I would like to request a site assessment and quote for the following project.', '',
        ...details.map(([label, value]) => `${label}: ${value}`), '',
        'Please contact me to confirm the site assessment arrangements.'
      ].join('\n');

      const whatsappNumber = form.dataset.whatsappNumber || '27746437729';
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      if (whatsappLink) whatsappLink.href = waUrl;

      // Submit to backend API endpoint
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (_) {}

      if (summary) {
        summary.replaceChildren();
        details.forEach(([label, value]) => {
          const div = document.createElement('div');
          div.className = 'py-1 flex justify-between border-b border-line text-sm';
          const dt = document.createElement('dt');
          dt.className = 'font-bold text-navy-950';
          dt.textContent = label;
          const dd = document.createElement('dd');
          dd.className = 'text-muted text-right ml-4';
          dd.textContent = value;
          div.append(dt, dd);
          summary.append(div);
        });
      }

      if (modal) {
        returnFocus = document.activeElement;
        modal.hidden = false;
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modal.querySelector('.modal-close')?.focus();
      }
    });

    fields.forEach(field => {
      field.addEventListener('input', () => {
        validateField(field, false);
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraft, 200);
      });
      field.addEventListener('change', () => {
        validateField(field, false);
        saveDraft();
      });
      field.addEventListener('focusout', () => {
        if (field.required || field.value) validateField(field);
      });
    });

    clearBtn?.addEventListener('click', () => {
      clearTimeout(saveTimer);
      try { localStorage.removeItem(storageKey); } catch (_) {}
      form.reset();
      fields.forEach(f => {
        f.setCustomValidity('');
        f.removeAttribute('aria-invalid');
        clearFieldError(f);
      });
      announce('Saved request details cleared.');
      form.elements.namedItem('service')?.focus();
    });

    restoreDraft();
  }

  // Pre-select service from service cards
  document.querySelectorAll('.service-card[data-service]').forEach(card => {
    card.addEventListener('click', () => {
      const serviceSelect = document.getElementById('service');
      const serviceVal = card.dataset.service;
      if (serviceSelect && serviceVal) {
        serviceSelect.value = serviceVal;
        validateField(serviceSelect, false);
        const assessSec = document.getElementById('site-assessment');
        if (assessSec) {
          assessSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          serviceSelect.focus({ preventScroll: true });
        }
        saveDraft();
      }
    });
  });

  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Project Lightbox Viewer
  const lightbox = document.getElementById('project-lightbox');
  const buttons = [...document.querySelectorAll('.project-image-button')];
  const image = document.getElementById('project-lightbox-image');
  const caption = document.getElementById('project-lightbox-caption');
  const closeBtn = document.querySelector('.project-lightbox-close');
  const prevBtn = document.querySelector('.project-lightbox-prev');
  const nextBtn = document.querySelector('.project-lightbox-next');

  if (lightbox && buttons.length && image && caption) {
    let currentIndex = 0;
    let returnTrigger = null;

    const render = () => {
      const btn = buttons[currentIndex];
      const thumb = btn.querySelector('img');
      image.src = btn.dataset.gallerySrc || thumb?.src || '';
      image.alt = thumb?.alt || 'Alphasonic International project photograph';
      caption.textContent = btn.dataset.galleryCaption || thumb?.alt || '';
    };

    const open = (index, trigger) => {
      currentIndex = index;
      returnTrigger = trigger;
      render();
      lightbox.hidden = false;
      lightbox.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      closeBtn?.focus();
    };

    const close = () => {
      lightbox.hidden = true;
      lightbox.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      image.removeAttribute('src');
      if (returnTrigger instanceof HTMLElement) returnTrigger.focus();
    };

    const move = (dir) => {
      currentIndex = (currentIndex + dir + buttons.length) % buttons.length;
      render();
    };

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => open(idx, btn));
    });

    closeBtn?.addEventListener('click', close);
    prevBtn?.addEventListener('click', () => move(-1));
    nextBtn?.addEventListener('click', () => move(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  }
})();
