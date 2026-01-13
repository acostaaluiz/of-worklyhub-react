export type NavigateFn = (to: string, opts?: { replace?: boolean; state?: unknown }) => void;

let _navigate: NavigateFn | undefined;

export function setNavigator(fn: NavigateFn) {
  _navigate = fn;
}

export function navigateTo(to: string, opts?: { replace?: boolean; state?: unknown }) {
  if (_navigate) {
    _navigate(to, opts);
    return;
  }
  if (opts?.replace) {
    window.location.replace(to);
    return;
  }
  window.location.href = to;
}

export function clearNavigator() {
  _navigate = undefined;
}

export default { setNavigator, navigateTo, clearNavigator };
