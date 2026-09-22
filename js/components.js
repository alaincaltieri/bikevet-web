document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch("header.html")
      .then(response => response.text())
      .then(data => {
        headerPlaceholder.outerHTML = data;
        
        // Set active class for navigation
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = document.querySelectorAll(".site-nav a");
        navLinks.forEach(link => {
          const linkHref = link.getAttribute("href");
          if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      })
      .catch(error => console.error("Error loading header:", error));
  }

  // Load Footer
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch("footer.html")
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
      submitBtn.innerText = 'Sending...';
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
