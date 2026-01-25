import { useEffect, useState } from "react";

export type UsePageHeightOptions = {
  headerSelector?: string;
  footerSelector?: string;
  extraOffset?: number; // px
  includeContentSpacing?: boolean;
};

export function usePageHeight(opts?: UsePageHeightOptions): string {
  const headerSelector = opts?.headerSelector ?? "header";
  const footerSelector = opts?.footerSelector ?? "footer";
  const extra = opts?.extraOffset ?? 0;
  const includeContentSpacing = opts?.includeContentSpacing ?? false;

  const [height, setHeight] = useState<string>("85vh");

  useEffect(() => {
    function measure() {
      try {
        const header = document.querySelector(headerSelector) as HTMLElement | null;
        const footer = document.querySelector(footerSelector) as HTMLElement | null;
        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        let spacing = 0;

        if (includeContentSpacing) {
          const root = getComputedStyle(document.documentElement);
          const space2 = Number.parseFloat(root.getPropertyValue("--space-2")) || 0;
          const space5 = Number.parseFloat(root.getPropertyValue("--space-5")) || 0;
          const space6 = Number.parseFloat(root.getPropertyValue("--space-6")) || 0;
          const space7 = Number.parseFloat(root.getPropertyValue("--space-7")) || 0;
          const space8 = Number.parseFloat(root.getPropertyValue("--space-8")) || 0;
          const isMobile = window.matchMedia("(max-width: 768px)").matches;

          const paddingTop = isMobile ? space5 : space6;
          const paddingBottom = isMobile ? space7 : space8;
          const frameMarginTop = space2;

          spacing = paddingTop + paddingBottom + frameMarginTop;
        }

        const total = headerH + footerH + extra + spacing;
        setHeight(`calc(100vh - ${total}px)`);
      } catch (e) {
        setHeight("85vh");
      }
    }

    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(() => measure());
    // observe header/footer if present
    const hEl = document.querySelector(headerSelector);
    const fEl = document.querySelector(footerSelector);
    if (hEl) ro.observe(hEl);
    if (fEl) ro.observe(fEl);

    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [headerSelector, footerSelector, extra]);

  return height;
}

export default usePageHeight;
