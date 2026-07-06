// ===================== Newsletter subscribe (footer + blog CTA) =====================
(function () {
  document.querySelectorAll(".js-subscribe").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      if (!input || !input.value.trim()) return;

      const original = btn.textContent;
      btn.disabled = true;
      try {
        const res = await fetch("/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: input.value.trim() }),
        });
        const out = await res.json();
        btn.textContent = out.ok ? "Subscribed ✓" : "Try again";
        if (out.ok) input.value = "";
      } catch (err) {
        btn.textContent = "Try again";
      } finally {
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 2500);
      }
    });
  });
})();
