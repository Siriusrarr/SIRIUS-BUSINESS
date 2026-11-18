import { useEffect, useState } from 'react';
import { businessApi } from '../services/businessApi.js';

const example={fixed:200000,cost:3000,goal:300000,base:300,k:0.02,a:5000,b:6000,initial:6000,tolerance:0.01,max:1000};
const labels={fixed:'Gastos fijos del mes ($)',cost:'Costo de producir una dona ($)',goal:'Ganancia que quieres obtener al mes ($)',base:'Unidades que venderías a precio cero',k:'Cuántas unidades dejarías de vender por cada peso de aumento',a:'Precio menor ($)',b:'Precio mayor ($)',initial:'Precio inicial ($)',tolerance:'Precisión en pesos',max:'Máximo de pasos'};
const modes={bis:'Bisección',newton:'Newton-Raphson',both:'Comparar ambos'};
const fmt=n=>n.toLocaleString('es-CO',{maximumFractionDigits:6});

function Results({study}) {
  const good=study.results.filter(r=>r.output.status==='ok');
  return <section className="sb-panel"><h2>Resultado del escenario</h2>
    <details><summary>Valores utilizados</summary>{Object.entries(study.inputs).filter(([key])=>labels[key]).map(([key,v])=><p key={key}>{labels[key]} · {fmt(v)}</p>)}</details>
    {good.length===2 && <p>Diferencia entre precios: $ {fmt(Math.abs(good[0].output.price-good[1].output.price))}. Cada método puede llegar a una solución distinta según su punto de partida.</p>}
    {study.results.map(({method,output})=><article key={method}><h3>{modes[method]}</h3>
      {output.status==='error'?<p>{output.message}</p>:<><p>{output.status==='ok'?'Precio encontrado':'Se alcanzó el máximo de pasos. Última aproximación'} · <strong>$ {fmt(output.price)}</strong></p>
      <p>Demanda estimada: {fmt(output.demand)} unidades/mes. Ganancia estimada: $ {fmt(output.profit)}. Diferencia con la meta: $ {fmt(output.residual)}.</p></>}
      <details><summary>Procedimiento · {output.rows.length} pasos</summary><div style={{overflowX:'auto'}}><table><thead><tr>{['Paso',...(method==='bis'?['Menor','Mayor','Punto medio','Ganancia − meta']:['Anterior','Nuevo precio','Ganancia − meta','Cambio'])].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{output.rows.map((row,i)=><tr key={i}><td>{i+1}</td>{row.map((v,j)=><td key={j}>{fmt(v)}</td>)}</tr>)}</tbody></table></div></details></article>)}
  </section>;
}
export default function PriceStudy() {
  const [mode,choose]=useState('bis'),[step,advance]=useState(1),[data,setData]=useState(example);
  const [study,show]=useState(null),[history,setHistory]=useState([]),[error,warn]=useState(''),[busy,lock]=useState(false);
  useEffect(()=>{businessApi.priceHistory().then(setHistory).catch(e=>warn(e.message));},[]);
  const starts=mode==='bis'?['a','b']:mode==='newton'?['initial']:['a','b','initial'];
  const business=['fixed','cost','goal','base','k'];
  const fields=step===1?business:[...starts,'tolerance','max'];
  async function submit(e){
    e.preventDefault();warn('');
    if(step===1){advance(2);return;}
    lock(true);
    try{
      const values=Object.fromEntries([...business,...fields].map(k=>[k,Number(data[k])]));
      const saved=await businessApi.calculatePrice({...values,mode});
      show(saved);setHistory(old=>[saved,...old.filter(r=>r.id!==saved.id)].slice(0,30));
    }catch(e){warn(e.message);}finally{lock(false);}
  }
  async function open(id){lock(true);warn('');try{show(await businessApi.priceDetail(id));}catch(e){warn(e.message);}finally{lock(false);}}
  return <div className="sb-content"><section className="sb-panel" data-guide="price-method"><h2>¿A qué precio vender tus mini donas?</h2><p>Explora qué precio cubriría tus gastos y alcanzaría tu meta mensual según la demanda estimada.</p>
  <label className="sb-field">Método<select disabled={busy} value={mode} onChange={e=>{choose(e.target.value);advance(1);show(null);warn('');}}>{Object.entries(modes).map(([v,text])=><option value={v} key={v}>{text}</option>)}</select></label></section>
  <section className="sb-panel" data-guide="price-form">{study?<><Results study={study}/><button disabled={busy} className="sb-secondary" onClick={()=>{show(null);advance(1);}}>Volver al inicio del cálculo</button></>:<form onSubmit={submit} className="sb-data-form"><h2>{step===1?'1. Datos del negocio':'2. Punto de partida'}</h2><p>{step===1?'Puedes empezar con el ejemplo. Una sensibilidad de 0,02 significa que subir $100 reduce la demanda mensual en dos donas.':'En Bisección, elige precios a lados opuestos de la meta. En Newton, empieza con un precio aproximado. Una precisión menor pide un ajuste más fino.'}</p>
  {fields.map(key=><label key={key}>{labels[key]}<input type="number" required disabled={busy} step={key==='max'?'1':'any'} min={key==='max'?1:0} value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}
  {step===2&&<button type="button" disabled={busy} className="sb-secondary" onClick={()=>advance(1)}>Atrás</button>}<button disabled={busy} className="sb-primary">{step===1?'Continuar':busy?'Guardando…':'Calcular y guardar'}</button></form>}</section>
  {error&&<p role="alert" className="sb-error">{error}</p>}<section className="sb-panel" data-guide="price-history"><h2>Cálculos recientes del negocio</h2>{history.length===0&&<p>Aquí aparecerán los escenarios guardados.</p>}{history.map(h=><button disabled={busy} key={h.id} className="sb-secondary" onClick={()=>open(h.id)}>{modes[h.inputs.mode]} · {new Date(h.createdAt).toLocaleString('es-CO')}</button>)}</section></div>;
}
