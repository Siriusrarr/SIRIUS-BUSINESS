import { z } from 'zod';

const amount = z.number().min(0).max(1e12);
const price = z.number().nonnegative().max(1e21);
export const inputs = z.object({
  mode: z.enum(['bis','newton','both']), fixed: amount, cost: amount, goal: amount,
  base: z.number().positive().max(1e9), k: z.number().min(1e-12).max(1e9),
  a: price.optional(), b: price.optional(), initial: price.optional(),
  tolerance: z.number().positive().max(1e9), max: z.number().int().min(1).max(10000)
});

export function solve(d, method) {
  const rows = [];
  const demand = p => d.base - d.k*p;
  const gap = p => (p-d.cost)*demand(p)-d.fixed-d.goal;
  const valid = p => Number.isFinite(p) && p>=0 && demand(p)>=0;
  const finish = (p, status) => ({ price:p, demand:demand(p), profit:gap(p)+d.goal, residual:gap(p), status, rows });
  const fail = message => ({ status:'error', message, rows });
  if (method === 'bis') {
    let {a,b} = d;
    if (!valid(a) || !valid(b) || a>=b) return fail('Usa dos precios en orden creciente con demanda positiva o cero.');
    if (!gap(a)) return finish(a,'ok');
    if (!gap(b)) return finish(b,'ok');
    if (Math.sign(gap(a))===Math.sign(gap(b))) return fail('Elige dos precios donde la ganancia quede por debajo y por encima de tu meta.');
    while ((b-a)/2>d.tolerance && rows.length<d.max) {
      const mid = a+(b-a)/2;
      if (mid===a || mid===b) return fail('Aumenta la tolerancia para continuar.');
      const value = gap(mid);
      rows.push([a,b,mid,value]);
      if (!value) return finish(mid,'ok');
      if (Math.sign(value)===Math.sign(gap(a))) a=mid;
      else b=mid;
    }
    return finish(a+(b-a)/2,(b-a)/2<=d.tolerance?'ok':'limit');
  }
  let p=d.initial;
  if (!valid(p)) return fail('El precio inicial debe dejar una demanda mayor o igual a cero.');
  if (!gap(p)) return finish(p,'ok');
  while (rows.length<d.max) {
    const slope=d.base+d.k*d.cost-2*d.k*p;
    if (Math.abs(slope)<1e-10) return fail('La pendiente es casi cero. Cambia el precio inicial.');
    const next=p-gap(p)/slope;
    if (!valid(next)) return fail('El ajuste salió del rango de precios posibles. Prueba otro precio inicial.');
    const delta=Math.abs(next-p), value=gap(next);
    rows.push([p,next,value,delta]);
    if (!delta && value) return fail('El precio dejó de cambiar. Revisa la precisión.');
    if (!value || delta<=d.tolerance) return finish(next,'ok');
    p=next;
  }
  return finish(p,'limit');
}
