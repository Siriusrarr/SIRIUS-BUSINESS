import {useState} from 'react';

const format=new Intl.NumberFormat('es-CO',{maximumFractionDigits:3});
const names={bis:'Bisección',newton:'Newton-Raphson'};
const colors={bis:'#a69aff',newton:'#54dfcb'};

export default function PriceChart({study}){
  const [open,setOpen]=useState(false);
  const [metric,setMetric]=useState('price');
  const series=study.results.map(({method,output})=>{
    const values=output.rows.map(row=>metric==='price'?row[method==='bis'?2:1]:row[method==='bis'?3:2]);
    return {method,values};
  }).filter(s=>s.values.length);
  const values=series.flatMap(s=>s.values);
  const count=Math.max(1,...series.map(s=>s.values.length));
  const min=Math.min(...values,...(metric==='gap'?[0]:[]));
  const max=Math.max(...values,...(metric==='gap'?[0]:[]));
  const x=i=>78+444*i/Math.max(1,count-1);
  const y=v=>max===min?94:161-132*(v-min)/(max-min);
  return <section className="price-chart" data-guide="price-chart"><button className="sb-secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Ocultar gráfica':'Crear gráfica'}</button>
    {open&&<div>{!series.length?<p>El cálculo terminó antes de registrar pasos. Consulta el resultado arriba.</p>:<>
      <label className="sb-field">Qué quieres ver<select value={metric} onChange={e=>setMetric(e.target.value)}><option value="price">Precio probado en cada paso</option><option value="gap">Ganancia menos meta en cada paso</option></select></label>
      <p>{metric==='price'?'Sigue los precios que probó cada método, en pesos por unidad.':'Por encima de cero se supera la meta mensual. Por debajo, todavía falta ganancia.'}</p>
      <svg viewBox="0 0 550 210" role="img" aria-label={metric==='price'?'Precio en pesos por paso':'Diferencia con la meta en pesos por paso'}>
        {[...new Set([max,min,...(metric==='gap'?[0]:[])])].map(v=><g key={v}><line x1="78" x2="522" y1={y(v)} y2={y(v)} stroke="#52617b"/><text x="70" y={y(v)+4} textAnchor="end">{new Intl.NumberFormat('es-CO',{notation:'compact',maximumFractionDigits:2}).format(v)}</text></g>)}
        {series.map(({method,values})=><g key={method}><polyline points={values.map((v,i)=>x(i)+','+y(v)).join(' ')} fill="none" stroke={colors[method]} strokeWidth="2.5" strokeDasharray={method==='newton'?'6 3':undefined}/><circle cx={x(values.length-1)} cy={y(values.at(-1))} r="4" fill={colors[method]}/></g>)}
        <text x="78" y="187">1</text>{count>1&&<text x="522" y="187" textAnchor="end">{count}</text>}<text x="300" y="202" textAnchor="middle">Paso del método</text>
      </svg>
      {series.map(s=><p key={s.method} style={{color:colors[s.method]}}>{names[s.method]} · {s.method==='bis'?'línea continua':'línea discontinua'} · último paso graficado: $ {format.format(s.values.at(-1))}</p>)}
    </>}</div>}</section>;
}
