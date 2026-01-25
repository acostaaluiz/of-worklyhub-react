import { useEffect, useState } from "react";

export type UsePageHeightOptions = {
  headerSelector?: string;
  footerSelector?: string;
  extraOffset?: number; // px
};

export function usePageHeight(opts?: UsePageHeightOptions): string {
  const headerSelector = opts?.headerSelector ?? "header";
  const footerSelector = opts?.footerSelector ?? "footer";
  const extra = opts?.extraOffset ?? 0;

  const [height, setHeight] = useState<string>("85vh");

  useEffect(() => {
    function measure() {
      try {
        const header = document.querySelector(headerSelector) as HTMLElement | null;
        const footer = document.querySelector(footerSelector) as HTMLElement | null;
        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        const total = headerH + footerH + extra;
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
