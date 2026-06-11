(() => {
  const body = document.body;
  const loader = document.querySelector(".loader");
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelectorAll(".nav__links a");
  const scrollProgress = document.querySelector(".scroll-progress");
  const searchInput = document.getElementById("netflix-search");
  const searchBox = document.querySelector(".search-box");
  const searchBtn = document.querySelector(".search-btn");
  const bellBtn = document.querySelector(".notifications-btn");
  const bellDropdown = document.querySelector(".notifications-dropdown");
  const profileBtn = document.querySelector(".profile-btn");
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileItems = document.querySelectorAll(".profile-item");
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  const cursorLabel = document.querySelector(".cursor-label");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smart Header Scroll variables
  let lastScrollTop = 0;
  const headerHeight = 72;

  // Initialize Theme / Profile
  const savedProfile = localStorage.getItem("portfolio-profile") || "adult";
  setProfile(savedProfile);

  window.addEventListener("load", () => {
    // Wrap header titles in character reveal spans for visual reveals
    splitTextReveal();

    setTimeout(() => {
      if (loader) loader.classList.add("is-hidden");
    }, 450);

    initAnimations();
    initInteractions();
    initModal();
    initCarousels();
    initHeroSlider();
  });

  // Scroll Tracking & Smart Navigation Header
  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (currentScroll / maxScroll) * 100 : 0;
      if (scrollProgress) scrollProgress.style.width = `${progress}%`;
      
      if (header) {
        header.classList.toggle("scrolled", currentScroll > 20);

        // Smart header show/hide logic
        if (currentScroll > lastScrollTop && currentScroll > headerHeight) {
          header.classList.add("hide");
        } else {
          header.classList.remove("hide");
        }
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    },
    { passive: true }
  );

  // Text Split character wrap function
  function splitTextReveal() {
    const targets = document.querySelectorAll(".billboard__title, .row__title, .section-heading h2");
    targets.forEach((el) => {
      const text = el.textContent.trim();
      el.innerHTML = "";
      
      // Split by words
      const words = text.split(" ");
      words.forEach((word, wordIdx) => {
        const wordSpan = document.createElement("span");
        wordSpan.style.display = "inline-block";
        wordSpan.style.whiteSpace = "nowrap";

        // Split word by characters
        const chars = word.split("");
        chars.forEach((char) => {
          const charWrap = document.createElement("span");
          charWrap.classList.add("char-reveal");
          
          const innerChar = document.createElement("span");
          innerChar.textContent = char;
          
          charWrap.appendChild(innerChar);
          wordSpan.appendChild(charWrap);
        });

        el.appendChild(wordSpan);

        // Add space between words
        if (wordIdx < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });
    });
  }

  // Custom Cursor Positioning & Context Labels
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    window.addEventListener("mousemove", (event) => {
      if (cursorDot) {
        cursorDot.style.left = `${event.clientX}px`;
        cursorDot.style.top = `${event.clientY}px`;
      }
      if (cursorRing) {
        cursorRing.animate(
          {
            left: `${event.clientX}px`,
            top: `${event.clientY}px`
          },
          { duration: 500, fill: "forwards", easing: "ease-out" }
        );
      }
    });

    // Handle cursor ring labels based on hover target
    const handleHover = (selector, labelText) => {
      document.querySelectorAll(selector).forEach((item) => {
        item.addEventListener("mouseenter", () => {
          cursorRing?.classList.add("is-hovering");
          if (cursorLabel) cursorLabel.textContent = labelText;
        });
        item.addEventListener("mouseleave", () => {
          cursorRing?.classList.remove("is-hovering");
          if (cursorLabel) cursorLabel.textContent = "";
        });
      });
    };

    handleHover(".project-card, .solution-card", "VIEW");
    handleHover(".row__nav", "SLIDE");
    handleHover(".play-btn, .btn--play", "PLAY");
    handleHover(".floating-label input, .floating-label textarea", "WRITE");
    handleHover(".netflix-modal__close, .netflix-modal__overlay", "CLOSE");
    handleHover(".nav__links a, .brand, .btn--secondary", "GO");
  }

  // Profile Switching Logic
  function setProfile(profile) {
    localStorage.setItem("portfolio-profile", profile);
    
    profileItems.forEach((btn) => {
      const isTarget = btn.getAttribute("data-profile") === profile;
      btn.classList.toggle("active", isTarget);
      if (isTarget) {
        const avatarSrc = btn.querySelector("img").getAttribute("src");
        if (profileBtn) {
          profileBtn.querySelector("img").setAttribute("src", avatarSrc);
        }
      }
    });

    if (profile === "kids") {
      body.classList.add("kids-mode");
    } else {
      body.classList.remove("kids-mode");
    }
  }

  // Navigation Links highlighting on scroll
  const sections = [...document.querySelectorAll("main section[id]")];
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { threshold: 0.2 }
  );
  sections.forEach((section) => navObserver.observe(section));

  function initInteractions() {
    // Nav Toggle for Mobile
    navToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
      });
    });

    // Close menus on click outside
    document.addEventListener("click", (e) => {
      bellDropdown?.classList.remove("is-open");
      profileDropdown?.classList.remove("is-open");
      if (searchBox && !searchInput.value) {
        searchBox.classList.remove("is-active");
      }
      if (nav && nav.classList.contains("is-open") && !nav.contains(e.target)) {
        nav.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
      }
    });

    // Search bar activation
    searchBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      searchBox.classList.toggle("is-active");
      if (searchBox.classList.contains("is-active")) {
        searchInput.focus();
      }
    });

    searchBox?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Search Filtering mechanism
    searchInput?.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      const cards = document.querySelectorAll(".netflix-card");

      cards.forEach((card) => {
        const tags = (card.getAttribute("data-tags") || "").toLowerCase();
        const content = card.textContent.toLowerCase();
        const isMatch = !query || tags.includes(query) || content.includes(query);

        card.classList.toggle("filtered-out", !isMatch);
      });
    });

    // Notifications Dropdown
    bellBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown?.classList.remove("is-open");
      bellDropdown?.classList.toggle("is-open");
    });

    // Profile Dropdown
    profileBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      bellDropdown?.classList.remove("is-open");
      profileDropdown?.classList.toggle("is-open");
    });

    profileItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetProfile = btn.getAttribute("data-profile");
        
        // Dynamic Netflix Curtain Swipe Transition
        if (window.gsap) {
          const tl = gsap.timeline();
          tl.to(".netflix-wipe", {
            scaleY: 1,
            transformOrigin: "top",
            duration: 0.45,
            ease: "power3.inOut"
          })
          .call(() => {
            setProfile(targetProfile);
            profileDropdown?.classList.remove("is-open");
          })
          .to(".netflix-wipe", {
            scaleY: 0,
            transformOrigin: "bottom",
            duration: 0.45,
            ease: "power3.inOut"
          });
        } else {
          setProfile(targetProfile);
          profileDropdown?.classList.remove("is-open");
        }
      });
    });

    // Card Hover Parallax tilt effect
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (reduceMotion || window.innerWidth < 768) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 10;
        const rotateX = ((y / rect.height) - 0.5) * -10;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    // Membership / Contact Form Submission
    const form = document.querySelector(".contact-form");
    const formStatus = document.querySelector(".form-status");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const values = [...data.values()].map((val) => String(val).trim());

      if (values.some((val) => !val)) {
        if (formStatus) {
          formStatus.textContent = "Please complete every field before streaming.";
          formStatus.style.color = "var(--primary)";
        }
        return;
      }

      const email = String(data.get("email"));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (formStatus) {
          formStatus.textContent = "Please enter a valid email address.";
          formStatus.style.color = "var(--primary)";
        }
        return;
      }

      if (formStatus) {
        formStatus.textContent = "Transmitting message to the stream...";
        formStatus.style.color = "var(--text-muted)";
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      const obj = {};
      data.forEach((value, key) => {
        obj[key] = value;
      });

      const queryString = new URLSearchParams(obj).toString();
      const url = `https://script.google.com/macros/s/AKfycbw3VOarJyIOeyLRFE8qfznNKS9BoZEV3fOysyhdIe_BBZ8A5ekOjHhM59wTc7MFOTSlgQ/exec?${queryString}`;

      fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(obj)
      })
      .then(() => {
        if (submitButton) submitButton.disabled = false;
        form.reset();
        if (formStatus) {
          formStatus.textContent = "Message transmitted successfully! Raj will contact you shortly.";
          formStatus.style.color = "#46d369";
        }
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        if (submitButton) submitButton.disabled = false;
        if (formStatus) {
          formStatus.textContent = "Transmission failed. Please try again or use the social links.";
          formStatus.style.color = "var(--primary)";
        }
      });
    });
  }

  // Hero Background Slide Cycle
  function initHeroSlider() {
    const slides = document.querySelectorAll(".billboard__slide");
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    const slideInterval = 5000;
    
    function nextSlide() {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }
    
    setInterval(nextSlide, slideInterval);
  }

  // Row Carousel click-scroll mechanisms
  function initCarousels() {
    const rowWrappers = document.querySelectorAll(".row__wrapper");

    rowWrappers.forEach((wrapper) => {
      const grid = wrapper.querySelector(".row__grid");
      const leftBtn = wrapper.querySelector(".row__nav--left");
      const rightBtn = wrapper.querySelector(".row__nav--right");

      if (!grid || !leftBtn || !rightBtn) return;

      leftBtn.addEventListener("click", () => {
        const scrollAmount = grid.clientWidth * 0.75;
        grid.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });

      rightBtn.addEventListener("click", () => {
        const scrollAmount = grid.clientWidth * 0.75;
        grid.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    });
  }

  // Netflix Details Modal logic
  function initModal() {
    const modal = document.getElementById("project-modal");
    const modalOverlay = modal?.querySelector(".netflix-modal__overlay");
    const modalClose = modal?.querySelector(".netflix-modal__close");
    const projectCards = document.querySelectorAll(".project-card");

    if (!modal || !modalClose) return;

    // Open Modal and populate data
    function openModal(card) {
      const title = card.querySelector("h3")?.textContent || "";
      const desc = card.querySelector(".card-desc")?.textContent || "";
      const backdrop = card.querySelector(".netflix-card__media img")?.getAttribute("src") || "";
      const match = card.querySelector(".card-meta__match")?.textContent || "98% Match";
      const year = card.querySelector(".card-meta__spec")?.textContent || "2026";
      const demoUrl = card.getAttribute("data-demo") || "#";
      const repoUrl = card.getAttribute("data-repo") || "#";
      const featuresHtml = card.querySelector(".card-features")?.innerHTML || "";
      const tagsHtml = card.querySelector(".card-tags")?.innerHTML || "";

      // Populate elements
      modal.querySelector(".netflix-modal__backdrop").setAttribute("src", backdrop);
      modal.querySelector(".netflix-modal__title").textContent = title;
      modal.querySelector(".netflix-modal__desc").textContent = desc;
      modal.querySelector(".meta-match").textContent = match;
      modal.querySelector(".meta-year").textContent = year;
      modal.querySelector(".modal-play-btn").setAttribute("href", demoUrl);
      modal.querySelector(".modal-repo-btn").setAttribute("href", repoUrl);
      modal.querySelector(".modal-features").innerHTML = featuresHtml;
      modal.querySelector(".modal-tech").innerHTML = tagsHtml;

      // Wrap modal title in chars for reveal animation
      const modalTitleEl = modal.querySelector(".netflix-modal__title");
      const modalTitleText = modalTitleEl.textContent;
      modalTitleEl.innerHTML = "";
      modalTitleText.split("").forEach((char) => {
        const span = document.createElement("span");
        span.classList.add("char-reveal");
        const inner = document.createElement("span");
        inner.textContent = char;
        span.appendChild(inner);
        modalTitleEl.appendChild(span);
      });

      // Toggle display
      modal.classList.add("is-open");
      body.classList.add("modal-open");

      // Animate modal entry details
      if (window.gsap) {
        gsap.fromTo(modal.querySelectorAll(".char-reveal span"), 
          { translateY: "100%" }, 
          { translateY: "0%", duration: 0.5, stagger: 0.02, ease: "power2.out" }
        );
        gsap.fromTo(modal.querySelector(".netflix-modal__body"), 
          { opacity: 0, y: 15 }, 
          { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" }
        );
      }
    }

    // Close modal
    function closeModal() {
      if (window.gsap) {
        gsap.to(modal.querySelector(".netflix-modal__wrapper"), {
          scale: 0.95,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            modal.classList.remove("is-open");
            body.classList.remove("modal-open");
            // reset scale for next open
            gsap.set(modal.querySelector(".netflix-modal__wrapper"), { clearProps: "all" });
          }
        });
      } else {
        modal.classList.remove("is-open");
        body.classList.remove("modal-open");
      }
    }

    projectCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const playBtn = e.target.closest(".play-btn");
        if (playBtn) {
          const demoUrl = card.getAttribute("data-demo");
          if (demoUrl && demoUrl !== "#") {
            window.open(demoUrl, "_blank");
            e.stopPropagation();
            return;
          }
        }
        
        openModal(card);
      });
    });

    modalClose.addEventListener("click", closeModal);
    modalOverlay?.addEventListener("click", closeModal);
  }

  function initAnimations() {
    // Reduced motion fallback
    if (reduceMotion) {
      document.querySelectorAll(".reveal").forEach((item) => {
        item.style.opacity = 1;
        item.style.transform = "none";
      });
      document.querySelectorAll(".netflix-progress__bar").forEach((bar) => {
        const card = bar.closest(".skill-card");
        bar.style.width = `${card?.dataset.level || 80}%`;
      });
      document.querySelectorAll("[data-count]").forEach((item) => {
        item.textContent = item.dataset.count;
      });
      return;
    }

    // Check if GSAP libraries are loaded
    if (!window.gsap || !window.ScrollTrigger) {
      document.querySelectorAll(".reveal").forEach((item) => {
        item.style.opacity = 1;
        item.style.transform = "none";
      });
      document.querySelectorAll(".netflix-progress__bar").forEach((bar) => {
        const card = bar.closest(".skill-card");
        bar.style.width = `${card?.dataset.level || 80}%`;
      });
      document.querySelectorAll("[data-count]").forEach((item) => {
        item.textContent = item.dataset.count;
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initial Billboard Parallax
    gsap.to(".billboard__backdrop", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".billboard",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Character text reveals
    document.querySelectorAll(".billboard__title, .row__title, .section-heading h2").forEach((heading) => {
      gsap.to(heading.querySelectorAll(".char-reveal span"), {
        translateY: "0%",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.02,
        scrollTrigger: {
          trigger: heading,
          start: "top 88%",
          once: true
        }
      });
    });

    // Reveal elements on scroll row-by-row with subtle 3D rotate
    document.querySelectorAll(".section").forEach((section) => {
      gsap.fromTo(
        section.querySelectorAll(".reveal"),
        { opacity: 0, y: 30, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true
          }
        }
      );
    });

    // Counter anims
    document.querySelectorAll("[data-count]").forEach((item) => {
      const target = Number(item.dataset.count);
      gsap.to(
        { value: 0 },
        {
          value: target,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 92%",
            once: true
          },
          onUpdate() {
            item.textContent = Math.round(this.targets()[0].value);
          }
        }
      );
    });

    // Skill meters loading
    document.querySelectorAll(".skill-card").forEach((card) => {
      const level = card.dataset.level || 80;
      const bar = card.querySelector(".netflix-progress__bar");
      
      gsap.to(bar, {
        width: `${level}%`,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          once: true
        }
      });
    });
  }
})();
