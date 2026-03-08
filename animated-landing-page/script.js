(() => {
  // ── Sticky Navbar ──

  const navbar = document.getElementById("navbar");

  function handleScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ── Mobile Menu ──

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });

  // ── Typing Effect ──

  const tagline = "Automate tasks, generate content, and collaborate smarter — all in one platform.";
  const target = document.getElementById("typingTarget");
  let charIndex = 0;

  function type() {
    if (charIndex <= tagline.length) {
      target.innerHTML =
        tagline.substring(0, charIndex) + '<span class="cursor"></span>';
      charIndex++;
      setTimeout(type, 35);
    } else {
      setTimeout(() => {
        target.querySelector(".cursor")?.remove();
      }, 2000);
    }
  }

  setTimeout(type, 600);

  // ── Scroll-triggered Animations (Intersection Observer) ──

  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  animatedElements.forEach((el) => observer.observe(el));

  // ── Feature Card Tilt Effect ──

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateZ(0)";
    });
  });

  // ── Parallax on Hero Orbs ──

  const orbs = document.querySelectorAll(".orb");

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) return;

    orbs.forEach((orb, i) => {
      const speed = 0.15 + i * 0.08;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });

  // ── Smooth Scroll for anchor links ──

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
})();
