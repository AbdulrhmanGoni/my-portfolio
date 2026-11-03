import { contentPane, reducedMotion } from "./dom";

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function scrollToTop() {
  contentPane?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

export function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function wireHashLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      if (id === "content-pane") {
        contentPane?.focus();
        return;
      }
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    });
  });

  const initial = window.location.hash.replace("#", "");
  if (initial) {
    requestAnimationFrame(() => scrollToId(initial));
  }
}
