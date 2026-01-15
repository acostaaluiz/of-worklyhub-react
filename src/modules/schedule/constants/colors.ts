// Shared color maps and helpers for schedule module
export const categoryColorMap: Record<string, string> = {
  work: "#047857",
  personal: "#0369A1",
  schedule: "#6D28D9",
  gaming: "#B45309",
};

export const statusColorMap: Record<string, string> = {
  cancelled: "#DC2626", // red
  completed: "#6B7280", // neutral gray for completed
  confirmed: "#06B6D4", // cyan
  in_progress: "#10B981", // green
  pending: "#F59E0B", // amber
};

export function normalizeStatusCode(code?: string | null): string | undefined {
  if (!code) return undefined;
  // handle camelCase -> snake_case and normalize separators
  const withUnderscore = String(code)
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .toLowerCase();
  return withUnderscore;
}

export function getStatusColor(code?: string | null): string | undefined {
  const k = normalizeStatusCode(code);
  if (!k) return undefined;
  return statusColorMap[k];
}

export function getCategoryColor(code?: string | null): string | undefined {
  if (!code) return undefined;
  return categoryColorMap[String(code)] ?? undefined;
}

// color utilities
export const hexToRgb = (hex?: string | null) => {
  if (!hex) return null;
  const h = String(hex).replace('#', '').trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return { r, g, b };
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

export const luminance = (hex?: string | null) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const srgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

export const contrastRatio = (hexA?: string | null, hexB?: string | null) => {
  const la = luminance(hexA) + 0.05;
  const lb = luminance(hexB) + 0.05;
  if (la > lb) return la / lb;
  return lb / la;
};

export const suitableBorderForContrast = (foreground?: string | null, background?: string | null) => {
  try {
    if (!foreground || !background) return undefined;
    const cr = contrastRatio(foreground, background);
    if (cr >= 3) return undefined;
    return luminance(background) > 0.5 ? '#000000' : '#FFFFFF';
  } catch (err) {
    return undefined;
  }
};

export default {
  categoryColorMap,
  statusColorMap,
  getStatusColor,
  getCategoryColor,
  hexToRgb,
  luminance,
  contrastRatio,
  suitableBorderForContrast,
};
