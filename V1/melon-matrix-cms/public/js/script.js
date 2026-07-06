// ===================== Mobile nav toggle =====================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  // The "Solution" trigger is handled separately below — on mobile it expands
  // its submenu inline instead of navigating away and closing the whole nav.
  navLinks.querySelectorAll("a:not(.nav-drop-trigger)").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

// ===================== "Solution" nav dropdown =====================
(function () {
  const item = document.querySelector(".nav-item.has-dropdown");
  if (!item) return;
  const trigger = item.querySelector(".nav-drop-trigger");
  if (!trigger) return;

  const isMobile = () => window.matchMedia("(max-width: 1024px)").matches;

  // Mobile: tapping "Solution" expands the submenu inline (accordion) instead
  // of navigating. Desktop: the dropdown opens on hover, so let the link work.
  trigger.addEventListener("click", (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    item.classList.toggle("open");
  });

  // Tapping a submenu link closes the whole mobile nav.
  item.querySelectorAll(".nav-drop-link").forEach((a) =>
    a.addEventListener("click", () => navLinks && navLinks.classList.remove("open"))
  );
})();

// ===================== FAQ accordion =====================
document.querySelectorAll(".faq-item").forEach((item) => {
  const q = item.querySelector(".faq-q");
  const a = item.querySelector(".faq-a");
  // initialise open item
  if (item.classList.contains("open")) a.style.maxHeight = a.scrollHeight + "px";

  q.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((other) => {
      other.classList.remove("open");
      other.querySelector(".faq-a").style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add("open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});

// ===================== Growth engine steps (accordion) =====================
(function () {
  const steps = Array.from(document.querySelectorAll(".engine-steps .step"));
  if (!steps.length) return;

  function openStep(target) {
    steps.forEach((s) => {
      const desc = s.querySelector(".step-desc");
      if (s === target) {
        s.classList.add("active");
        desc.style.maxHeight = desc.scrollHeight + "px";
      } else {
        s.classList.remove("active");
        desc.style.maxHeight = null;
      }
    });
  }

  steps.forEach((s) => {
    s.querySelector(".step-body").addEventListener("click", () => openStep(s));
  });

  // open the default (Discover) on load — keep one open at all times
  openStep(steps.find((s) => s.classList.contains("active")) || steps[0]);
})();

// ===================== Trusted logo rows (cells sized to show N per view) =====================
(function () {
  const rows = document.querySelectorAll(".trusted-logos .logo-row");
  if (!rows.length) return;

  const logosPerView = 4;

  function sizeCells() {
    rows.forEach((row) => {
      const styles = window.getComputedStyle(row);
      const padding =
        parseFloat(styles.paddingLeft || 0) + parseFloat(styles.paddingRight || 0);
      const viewportWidth = Math.max(0, row.clientWidth - padding);
      const cell = viewportWidth / logosPerView;

      row.querySelectorAll(".t-logo").forEach((img) => {
        img.style.width = cell + "px";
      });
    });
  }

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(sizeCells, 150);
  });
  window.addEventListener("load", sizeCells);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(sizeCells);
    rows.forEach((row) => observer.observe(row));
  }
  sizeCells();
})();

// ===================== Pricing category tabs =====================
(function () {
  const tabs = Array.from(document.querySelectorAll(".pricing-tabs li"));
  const sets = Array.from(document.querySelectorAll(".plan-set"));
  if (!tabs.length || !sets.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const cat = tab.dataset.cat;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      sets.forEach((s) => s.classList.toggle("active", s.dataset.cat === cat));
    });
  });
})();

// ===================== Testimonials slider =====================
(function () {
  const track = document.getElementById("testiTrack");
  const dotsWrap = document.getElementById("testiDots");
  const prev = document.getElementById("tPrev");
  const next = document.getElementById("tNext");
  if (!track) return;

  const viewport = track.parentElement;
  const cards = Array.from(track.children);
  let index = 0;

  function perView() {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - perView());
  }

  function stepWidth() {
    const card = cards[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 24) || 24;
    return card.offsetWidth + gap;
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement("button");
      if (i === index) b.classList.add("active");
      b.addEventListener("click", () => {
        index = i;
        update();
      });
      dotsWrap.appendChild(b);
    }
  }

  function update() {
    index = Math.min(Math.max(index, 0), maxIndex());
    const shift = stepWidth() * index;
    track.style.transition = "transform .4s ease";
    track.style.transform = `translateX(-${shift}px)`;
    dotsWrap.querySelectorAll("button").forEach((d, i) =>
      d.classList.toggle("active", i === index)
    );
  }

  prev && prev.addEventListener("click", () => {
    index = index > 0 ? index - 1 : maxIndex();
    update();
  });
  next && next.addEventListener("click", () => {
    index = index < maxIndex() ? index + 1 : 0;
    update();
  });

  // ----- drag / swipe -----
  let dragging = false;
  let startX = 0;
  let baseShift = 0;
  let delta = 0;
  let pointerId = null;

  function onDown(e) {
    // ignore drags that start on the nav buttons
    if (e.target.closest(".testi-nav, .testi-dots")) return;
    dragging = true;
    delta = 0;
    startX = e.clientX;
    baseShift = stepWidth() * index;
    pointerId = e.pointerId;
    track.style.transition = "none";
    viewport.classList.add("dragging");
    if (track.setPointerCapture && pointerId != null) {
      try { track.setPointerCapture(pointerId); } catch (err) {}
    }
  }

  function onMove(e) {
    if (!dragging) return;
    delta = e.clientX - startX;
    track.style.transform = `translateX(-${baseShift - delta}px)`;
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("dragging");
    const threshold = stepWidth() * 0.2;
    if (delta <= -threshold) index += 1;
    else if (delta >= threshold) index -= 1;
    update();
  }

  track.addEventListener("pointerdown", onDown);
  track.addEventListener("pointermove", onMove);
  track.addEventListener("pointerup", onUp);
  track.addEventListener("pointercancel", onUp);
  track.addEventListener("pointerleave", onUp);
  // prevent native image drag interfering with the swipe
  track.addEventListener("dragstart", (e) => e.preventDefault());

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      update();
    }, 150);
  });

  buildDots();
  update();
})();

// ===================== Case study carousel (auto-advancing) =====================
(function () {
  const track = document.getElementById("caseTrack");
  if (!track) return;

  const cards = Array.from(track.children);
  const maxIndex = cards.length - 1;
  const INTERVAL = 4000;
  let index = 0;
  let timer = null;

  function update() {
    index = Math.min(Math.max(index, 0), maxIndex);
    track.style.transition = "transform .45s ease";
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    index = index < maxIndex ? index + 1 : 0;
    update();
  }

  function play() {
    stop();
    timer = setInterval(nextSlide, INTERVAL);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // pause on hover, resume on leave
  track.addEventListener("mouseenter", stop);
  track.addEventListener("mouseleave", play);

  // ----- drag / swipe -----
  let dragging = false;
  let startX = 0;
  let delta = 0;
  let width = 0;
  let pointerId = null;

  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    delta = 0;
    startX = e.clientX;
    width = track.offsetWidth || 1;
    pointerId = e.pointerId;
    stop();
    track.style.transition = "none";
    if (track.setPointerCapture && pointerId != null) {
      try { track.setPointerCapture(pointerId); } catch (err) {}
    }
  });

  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    delta = e.clientX - startX;
    const pct = (index * 100) - (delta / width) * 100;
    track.style.transform = `translateX(-${pct}%)`;
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    const threshold = width * 0.18;
    if (delta <= -threshold) index = index < maxIndex ? index + 1 : 0;
    else if (delta >= threshold) index = index > 0 ? index - 1 : maxIndex;
    update();
    play();
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("pointerleave", endDrag);
  track.addEventListener("dragstart", (e) => e.preventDefault());

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 150);
  });

  update();
  play();
})();
