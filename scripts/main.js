document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  // Variables
  const menuIcon = document.getElementById("menu-icon");
  const closeIcon = document.getElementById("close-icon");
  const navBarLinks = document.getElementById("nav-links");
  const overlay = document.querySelector(".overlay");

  menuIcon.addEventListener("click", () => {
    navBarLinks.classList.add("menu-active");
    overlay.classList.add("overlay-active");
    // document.body.style.overflow = "hidden";
  });

  closeIcon.addEventListener("click", () => {
    navBarLinks.classList.remove("menu-active");
    overlay.classList.remove("overlay-active");
    // document.body.style.overflow = "";
  })

  window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (window.scrollY > 50) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });

  // Scroll Reveal Animation
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})