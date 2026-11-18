import {useState} from 'react';

const names={bis:'Bisección',newton:'Newton-Raphson'};
const colors={bis:'#a99bff',newton:'#57ddce'};
const compact=new Intl.NumberFormat('es-CO',{notation:'compact',maximumFractionDigits:2});
const decimal=new Intl.NumberFormat('es-CO',{maximumFractionDigits:3});

function clean(value){return Math.abs(value)<0.0005?0:value;}
function valueLabel(value){return '$ '+decimal.format(clean(value));}

function MethodGraph({method,values,metric}){
  const normalized=values.map(clean);
  const scale=[...normalized,...(metric==='gap'?[0]:[])];
  const min=Math.min(...scale),max=Math.max(...scale);
  const x=index=>64+456*index/Math.max(1,normalized.length-1);
  const y=value=>max===min?96:158-124*(value-min)/(max-min);
  const ticks=[max,...(metric==='gap'?[0]:[]),min].filter((value,index,array)=>array.indexOf(value)===index);
  return <article className="price-graph-card">
    <header><span className="price-graph-dot" style={{background:colors[method]}}/><div><h3>{names[method]}</h3><p>{normalized.length} {normalized.length===1?'paso':'pasos'} registrados</p></div></header>
    <svg viewBox="0 0 550 205" role="img" aria-label={`${names[method]}: ${metric==='price'?'precio':'diferencia con la meta'} por paso`}>
      {ticks.map(value=><g key={value}><line x1="64" x2="520" y1={y(value)} y2={y(value)} className={value===0?'zero':'grid'}/><text x="56" y={y(value)+4} textAnchor="end">{compact.format(value)}</text></g>)}
      <polyline points={normalized.map((value,index)=>`${x(index)},${y(value)}`).join(' ')} fill="none" stroke={colors[method]} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
      {normalized.map((value,index)=><circle key={index} cx={x(index)} cy={y(value)} r="3.5" fill={colors[method]}><title>Paso {index+1}: {valueLabel(value)}</title></circle>)}
      <text x="64" y="185">1</text><text x="520" y="185" textAnchor="end">{normalized.length}</text><text x="292" y="199" textAnchor="middle">Paso del método</text>
    </svg>
    <footer><span>Último valor</span><strong>{valueLabel(normalized.at(-1))}</strong></footer>
  </article>;
}

export default function PriceChart({study}){
  const [open,setOpen]=useState(false),[metric,setMetric]=useState('price');
  const series=study.results.map(({method,output})=>({method,values:output.rows.map(row=>metric==='price'?row[method==='bis'?2:1]:row[method==='bis'?3:2])})).filter(series=>series.values.length);
  return <section className="price-chart" data-guide="price-chart">
    <div className="price-chart-toolbar"><button type="button" className="sb-secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Ocultar gráficas':series.length>1?'Crear las dos gráficas':'Crear gráfica'}</button></div>
    {open&&<div className="price-chart-content">{!series.length?<p>El cálculo terminó antes de registrar pasos.</p>:<>
      <label className="price-chart-metric">Qué quieres analizar<select value={metric} onChange={event=>setMetric(event.target.value)}><option value="price">Precio probado en cada paso</option><option value="gap">Diferencia entre ganancia y meta</option></select></label>
      <p className="price-chart-help">{metric==='price'?'Cada gráfica usa su propia escala para mostrar claramente cómo cambia el precio.':'Cero significa que se alcanzó la meta. Los valores positivos la superan y los negativos indican cuánto falta.'}</p>
      <div className={`price-chart-grid ${series.length===1?'single':''}`}>{series.map(series=><MethodGraph key={series.method} {...series} metric={metric}/>)}</div>
    </>}</div>}
  </section>;
}

