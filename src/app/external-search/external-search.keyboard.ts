const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

let installed = false;

function tabbables(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      el.tabIndex >= 0 &&
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== 'hidden'
  );
}

/**
 * NDE's All Filters pane traps Tab: from the last native facet it moves focus to the
 * close button and calls preventDefault, so custom elements added after it are skipped.
 * This capture-phase handler routes Tab through our box before NDE's handler sees it.
 */
export function installTabBridge(): void {
  if (installed) return;
  installed = true;

  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey) return;

      const toggle = document.querySelector<HTMLElement>('.external-search__toggle');
      if (!toggle) return;

      const panel =
        toggle.closest('#filters-panel') ?? toggle.closest('nde-search-filters-side-nav');
      const close = document.querySelector<HTMLElement>('.close-side-nav-filters');
      const target = e.target as HTMLElement | null;
      if (!panel || !target || !(panel.contains(target) || target === close)) return;

      const items = tabbables(panel);
      const last = items[items.length - 1];
      let next: HTMLElement | null = null;

      if (!e.shiftKey) {
        const i = items.indexOf(target);
        if (i !== -1 && items[i + 1] === toggle) {
          next = toggle;            // last native facet -> our toggle
        } else if (target === last && close) {
          next = close;             // end of pane -> wrap to the close button, like NDE
        }
      } else if (target === close) {
        next = last ?? null;        // Shift+Tab from the close button -> our last item
      }

      if (next) {
        e.preventDefault();
        e.stopPropagation();
        next.focus();
      }
    },
    true
  );
}