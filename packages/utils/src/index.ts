export const debounce = <F extends (...a:any[])=>any>(fn:F, ms=400) => {
  let t:any; return (...args:any[]) => { clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
};
