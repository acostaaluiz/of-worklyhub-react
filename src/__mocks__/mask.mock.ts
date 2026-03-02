export function getMaskConfig() {
  return { phoneMask: '(###) ###-####', dateFormat: 'YYYY-MM-DD', currencyLocale: 'en-US', currencyCode: 'USD', currencyPrecision: 2 };
}
export function stripMask(v: string) { return (v||'').replace(/\D+/g,''); }
export function applyMask(v:string, m:string){ return v; }
export function maskPhone(v?: string|null){ return v||''; }
export function unmaskPhone(v?: string|null){ return (v||'').replace(/\D+/g,''); }
export function parseMoney(v:string){ return Number((v||'').replace(/[^0-9.-]/g,''))||0; }
export function formatMoney(v:number){ return String(v); }
export function formatMoneyFromCents(cents:number){ return formatMoney((cents||0)/100); }
export default {
  getMaskConfig, stripMask, applyMask, maskPhone, unmaskPhone, parseMoney, formatMoney
};
