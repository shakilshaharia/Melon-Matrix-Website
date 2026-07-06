// ===================== Smooth blog filtering (no page reload) =====================
// Progressive enhancement: the page works with plain links/form submits; this script
// intercepts them and swaps the grid via the /blog/api/posts JSON endpoint instead.
(function () {
  const app = document.getElementById("blogApp");
  if (!app) return;

  const filters = document.getElementById("blogFilters");
  const grid = document.getElementById("blogGrid");
  const pager = document.getElementById("blogPagination");
  const searchForm = document.getElementById("blogSearch");
  const searchInput = document.getElementById("blogSearchInput");
  const note = document.getElementById("blogNote");

  // Current view state
  const state = {
    cat: (document.querySelector("#blogFilters li.active") || {}).dataset
      ? document.querySelector("#blogFilters li.active").dataset.cat
      : "",
    q: searchInput ? searchInput.value.trim() : "",
    page: 1,
  };

  let reqToken = 0;

  function buildUrl() {
    // Pretty URL for the address bar + history (shareable, matches server routes).
    const base = state.cat ? `/blog/category/${state.cat}` : "/blog";
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.page > 1) params.set("page", state.page);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function setActivePill() {
    if (!filters) return;
    filters.querySelectorAll("li").forEach((li) => {
      li.classList.toggle("active", (li.dataset.cat || "") === state.cat);
    });
  }

  async function load({ push = true, scroll = false } = {}) {
    const token = ++reqToken;
    const apiParams = new URLSearchParams();
    if (state.cat) apiParams.set("cat", state.cat);
    if (state.q) apiParams.set("q", state.q);
    if (state.page > 1) apiParams.set("page", state.page);

    grid.classList.add("is-loading");
    try {
      const res = await fetch(`/blog/api/posts?${apiParams.toString()}`, {
        headers: { "X-Requested-With": "fetch" },
      });
      const data = await res.json();
      if (token !== reqToken) return; // a newer request superseded this one
      if (!data.ok) return;

      grid.innerHTML = data.gridHtml;
      pager.innerHTML = data.paginationHtml;
      setActivePill();

      // search results note
      if (note) {
        if (data.q) {
          note.innerHTML = `<span>${data.note}</span> — <a href="#" id="blogClear">clear search</a>`;
          note.hidden = false;
          wireClear();
        } else {
          note.hidden = true;
          note.innerHTML = "";
        }
      }

      const url = buildUrl();
      if (push) history.pushState({ ...state }, "", url);
      else history.replaceState({ ...state }, "", url);

      if (scroll) {
        app.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      // On failure, fall back to a normal navigation so the user still gets results.
      if (token === reqToken) window.location.href = buildUrl();
    } finally {
      if (token === reqToken) grid.classList.remove("is-loading");
    }
  }

  // ----- Category pills -----
  if (filters) {
    filters.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      e.preventDefault();
      const cat = li.dataset.cat || "";
      if (cat === state.cat) return;
      state.cat = cat;
      state.page = 1;
      load({ push: true });
    });
  }

  // ----- Search (debounced live search + submit) -----
  function wireClear() {
    const clear = document.getElementById("blogClear");
    if (!clear) return;
    clear.addEventListener("click", (e) => {
      e.preventDefault();
      state.q = "";
      state.page = 1;
      if (searchInput) searchInput.value = "";
      load({ push: true });
    });
  }

  if (searchForm) {
    let debounce;
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(debounce);
      state.q = searchInput.value.trim();
      state.page = 1;
      load({ push: true });
    });
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const val = searchInput.value.trim();
        if (val === state.q) return;
        state.q = val;
        state.page = 1;
        load({ push: true });
      }, 350);
    });
  }
  wireClear();

  // ----- Pagination (event-delegated, survives grid swaps) -----
  if (pager) {
    pager.addEventListener("click", (e) => {
      const link = e.target.closest("a.page-link");
      if (!link) return;
      e.preventDefault();
      const page = parseInt(link.dataset.page, 10);
      if (!page || page === state.page) return;
      state.page = page;
      load({ push: true, scroll: true });
    });
  }

  // ----- Back / forward buttons -----
  window.addEventListener("popstate", (e) => {
    const s = e.state;
    if (s && (typeof s.cat !== "undefined")) {
      state.cat = s.cat || "";
      state.q = s.q || "";
      state.page = s.page || 1;
    } else {
      // Landed back on the initial /blog URL with no stored state — reset.
      state.cat = "";
      state.q = "";
      state.page = 1;
    }
    if (searchInput) searchInput.value = state.q;
    load({ push: false });
  });

  // Seed the initial history entry so back/forward has something to restore.
  history.replaceState({ ...state }, "", buildUrl());
})();
