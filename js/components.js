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
});
