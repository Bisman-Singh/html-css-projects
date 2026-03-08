document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(link =>
        link.addEventListener("click", () => navLinks.classList.remove("open"))
    );

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll("section, .project-card, .skill-card, .stat-card").forEach(el => {
        el.classList.add("fade-in");
        observer.observe(el);
    });

    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll(".skill-fill").forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll(".skills").forEach(s => skillObserver.observe(s));

    const statObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll(".stat-number").forEach(num => {
                    animateCount(num, parseInt(num.dataset.target));
                });
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    document.querySelectorAll(".about-stats").forEach(s => statObserver.observe(s));

    function animateCount(el, target) {
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toLocaleString() + (target >= 100 ? "+" : "+");
        }, 20);
    }

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            document.querySelectorAll(".project-card").forEach(card => {
                card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
            });
        });
    });

    document.getElementById("contactForm").addEventListener("submit", e => {
        e.preventDefault();
        const btn = e.target.querySelector("button");
        btn.textContent = "Sent!";
        btn.style.background = "#34d399";
        setTimeout(() => {
            btn.textContent = "Send Message";
            btn.style.background = "";
            e.target.reset();
        }, 2000);
    });
});
