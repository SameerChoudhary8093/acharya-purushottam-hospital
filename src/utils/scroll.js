export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

export function scrollToHash(hash, { delay = 60 } = {}) {
  const id = (hash || "").replace(/^#/, "");
  if (!id) return;
  window.setTimeout(() => scrollToId(id), delay);
}
