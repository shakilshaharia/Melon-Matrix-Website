// ===================== Melon Matrix Admin JS =====================

// ----- Rich text editor (post form) -----
(function () {
  const editorEl = document.getElementById("editor");
  const hidden = document.getElementById("f-content");
  const form = document.getElementById("postForm");
  if (!editorEl || !hidden || !form) return;

  if (typeof Quill === "undefined") {
    // CDN unavailable — fall back to a plain textarea.
    hidden.hidden = false;
    hidden.style.minHeight = "320px";
    editorEl.closest(".editor-box").style.display = "none";
    return;
  }

  const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image"],
        ["clean"],
      ],
    },
  });

  // Load existing content
  if (hidden.value.trim()) {
    quill.clipboard.dangerouslyPasteHTML(hidden.value);
  }

  // Sync back on submit
  form.addEventListener("submit", () => {
    hidden.value = quill.getSemanticHTML ? quill.getSemanticHTML() : quill.root.innerHTML;
  });
})();

// ----- Slug preview + auto-suggest from title -----
(function () {
  const title = document.getElementById("f-title");
  const slug = document.getElementById("f-slug");
  const preview = document.getElementById("slugPreview");
  if (!title || !slug || !preview) return;

  const slugify = (s) =>
    s.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  let touched = slug.value.trim() !== "";
  slug.addEventListener("input", () => {
    touched = slug.value.trim() !== "";
    preview.textContent = slugify(slug.value) || "your-post-slug";
  });
  title.addEventListener("input", () => {
    if (!touched) {
      slug.value = slugify(title.value);
      preview.textContent = slug.value || "your-post-slug";
    }
  });
})();

// ----- Featured image: picker modal + clear -----
(function () {
  const modal = document.getElementById("mediaModal");
  const openBtn = document.getElementById("openMedia");
  const closeBtn = document.getElementById("closeMedia");
  const urlInput = document.getElementById("featUrl");
  const preview = document.getElementById("featPreview");
  const clearBtn = document.getElementById("clearFeat");
  if (!modal || !openBtn) return;

  function setPreview(url) {
    preview.innerHTML = url ? `<img src="${url}" alt="" />` : "<span>No image selected</span>";
  }

  openBtn.addEventListener("click", () => modal.classList.add("open"));
  closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  modal.querySelectorAll(".js-pick").forEach((card) => {
    card.addEventListener("click", () => {
      urlInput.value = card.dataset.url;
      setPreview(card.dataset.url);
      modal.classList.remove("open");
    });
  });

  clearBtn && clearBtn.addEventListener("click", () => {
    urlInput.value = "";
    setPreview("");
  });
})();

// ----- Media library search (instant client-side filter by name) -----
(function () {
  const input = document.getElementById("mediaSearch");
  const grid = document.getElementById("mediaGrid");
  const noResults = document.getElementById("mediaNoResults");
  if (!input || !grid) return;

  const cards = Array.from(grid.querySelectorAll(".media-card"));

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match = !q || (card.dataset.name || "").includes(q);
      card.hidden = !match;
      if (match) visible++;
    });
    if (noResults) noResults.hidden = visible > 0;
  });
})();

// ----- Copy URL buttons (media library) -----
(function () {
  document.querySelectorAll(".js-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.url);
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old), 1500);
      } catch (err) {
        // Fallback: select the sibling input if clipboard API unavailable
        const input = btn.closest(".mc-body")?.querySelector(".copy-input");
        if (input) { input.select(); document.execCommand("copy"); }
      }
    });
  });
})();
