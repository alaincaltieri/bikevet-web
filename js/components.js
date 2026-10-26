document.addEventListener("DOMContentLoaded", () => {
  // ---- Language context (helpers provided by js/lang-redirect.js) ----
  const i18n = window.BikeVetI18n;
  const pageLang = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  // Translated pages use their own language; untranslated pages (terms, privacy)
  // follow the visitor's preferred language so navigation stays coherent.
  const uiLang = i18n && !i18n.isTranslatedPage() ? i18n.getPreferredLang() : pageLang;
  const partialsBase = uiLang === "it" ? "/it/" : "/";
  const langHome = { en: "/", it: "/it/" };

  // Normalizes paths so "/", "/index.html", "/it", "/it/index", "/support.html"
  // and "/support" compare correctly.
  const normalizePath = path => {
    let p = path.replace(/\.html$/, "").replace(/\/index$/, "/");
    if (/^\/it$/.test(p)) p = "/it/";
    return p || "/";
  };

  // Load Header
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch(partialsBase + "header.html")
      .then(response => response.text())
      .then(data => {
        headerPlaceholder.outerHTML = data;

        // Set active class for navigation (desktop & mobile)
        const currentPath = normalizePath(window.location.pathname);
        const navLinks = document.querySelectorAll(".site-nav a, .mobile-nav a");
        navLinks.forEach(link => {
          const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);
          link.classList.toggle("active", linkPath === currentPath);
        });

        // Mobile menu toggle
        const menuBtn = document.querySelector(".mobile-menu-toggle");
        const mobileNav = document.getElementById("mobile-nav");
        if (menuBtn && mobileNav) {
          menuBtn.addEventListener("click", () => {
            const isExpanded = menuBtn.getAttribute("aria-expanded") === "true";
            menuBtn.setAttribute("aria-expanded", !isExpanded);
            mobileNav.classList.toggle("is-open", !isExpanded);
          });
          mobileNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
              menuBtn.setAttribute("aria-expanded", "false");
              mobileNav.classList.remove("is-open");
            });
          });
        }

        // Language switcher: point each language to this page's translation
        // (from hreflang alternates), falling back to that language's home.
        document.querySelectorAll(".lang-switch a[data-lang]").forEach(link => {
          const lang = link.dataset.lang;
          const target = (i18n && i18n.getAlternatePath(lang)) || langHome[lang];
          if (target) link.setAttribute("href", target);

          if (lang === uiLang) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }

          // Persist the explicit choice so auto-redirect respects it from now on.
          link.addEventListener("click", () => {
            if (i18n) i18n.setStoredLang(lang);
          });
        });
      })
      .catch(error => console.error("Error loading header:", error));
  }

  // Load Footer
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch(partialsBase + "footer.html")
      .then(response => response.text())
      .then(data => {
        footerPlaceholder.outerHTML = data;
      })
      .catch(error => console.error("Error loading footer:", error));
  }
  // Waitlist Forms AJAX Submission
  const waitlistForms = document.querySelectorAll('.waitlist-form');
  waitlistForms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = submitBtn.dataset.sendingLabel || 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      
      fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        
        if (response.ok) {
          form.style.display = 'none';
          const successMsg = form.parentElement.querySelector('.waitlist-form__success');
          if (successMsg) successMsg.style.display = 'block';
        } else {
          const errorMsg = form.parentElement.querySelector('.waitlist-form__error');
          if (errorMsg) errorMsg.style.display = 'block';
        }
      })
      .catch(error => {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        const errorMsg = form.parentElement.querySelector('.waitlist-form__error');
        if (errorMsg) errorMsg.style.display = 'block';
        console.error('Form submission error:', error);
      });
    });
  });
});
