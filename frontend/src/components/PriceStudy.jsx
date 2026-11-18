import { useEffect, useLayoutEffect, useState } from 'react';
import { businessApi } from '../services/businessApi.js';

import PriceChart from './PriceChart.jsx';
import './price-study.css';

const tips={
 fixed:'Suma el arriendo, los servicios y otros gastos que pagas aunque vendas cero donas. Por ejemplo, escribe 200000 para representar $200.000 al mes.',
 cost:'Suma ingredientes, empaque y otros costos de preparar una sola dona. Si producirla cuesta $3.000, escribe 3000.',
 goal:'Escribe cuánto quieres que te quede al final del mes después de cubrir todos los costos. Para una meta de $300.000, escribe 300000.',
 base:'Estima cuántas donas al mes te pedirían si fueran gratis. Es el punto de partida del modelo. Puedes usar 300 para probar.',
 k:'Estima cuántas ventas pierdes al subir el precio. Si subir $100 reduce las ventas mensuales en 2 donas, divide 2 entre 100 e ingresa 0,02.',
 a:'Escribe el menor de los dos precios que probarás. En el ejemplo, con $5.000 por dona la ganancia queda por debajo de la meta.',
 b:'Escribe el mayor de los dos precios. En el ejemplo, $6.000 deja la ganancia por encima de la meta. El método va cerrando ese intervalo.',
 initial:'Escribe un primer precio razonable, por ejemplo 6000. Newton lo irá corrigiendo usando la diferencia entre la ganancia y tu meta.',
 tolerance:'Indica qué tan pequeño debe ser el ajuste en pesos. Con 0,01, Bisección se detiene cuando medio intervalo mide como máximo un centavo. Newton compara los dos últimos precios.',
 max:'Pon un límite entero, entre 1 y 10000. Con 1000 el método puede intentar hasta mil pasos y terminar antes si alcanza la precisión.'
};
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
export default function PriceStudy({onGuideChange,onGuide}) {
  const [mode,choose]=useState('bis'),[step,advance]=useState(1),[data,setData]=useState(example);
  const [study,show]=useState(null),[history,setHistory]=useState([]),[error,warn]=useState(''),[busy,lock]=useState(false);
  const [selecting,setSelecting]=useState(false);
  const [pair,setPair]=useState({bis:'',newton:''});
  const [comparison,setComparison]=useState(null);
  const methods=['bis','newton'];
  const candidates=method=>history.filter(h=>h.inputs.mode===method || h.inputs.mode==='both');
  const ready=methods.every(method=>candidates(method).length>0);
  const describe=h=>modes[h.inputs.mode]+' · '+new Date(h.createdAt).toLocaleString('es-CO')+' · Meta $ '+fmt(h.inputs.goal)+' · '+h.id.slice(0,6);
  useEffect(()=>{businessApi.priceHistory().then(setHistory).catch(e=>warn(e.message));},[]);
  const starts=mode==='bis'?['a','b']:mode==='newton'?['initial']:['a','b','initial'];
  const business=['fixed','cost','goal','base','k'];
  const fields=step===1?business:[...starts,'tolerance','max'];
  useLayoutEffect(()=>{
    const guide=(key,title,body)=>({target:'[data-guide="price-'+key+'"]',title,body});
    const steps=[guide('method','Elige un método','Bisección prueba precios entre dos límites. Newton corrige un precio inicial. Guarda un cálculo de cada método para compararlos después.')];
    if(study){
      steps.push(guide('form','Lee el resultado','Revisa el precio y la diferencia con tu meta. En Procedimiento puedes ver cada intento.'),
        guide('chart','Explora las gráficas','Pulsa Crear gráfica y elige qué comparar. En el historial puedes volver a generar la gráfica de un escenario guardado.'));
    }else{
      steps.push(...fields.map(key=>guide(key,labels[key],tips[key])),
        guide('next',step===1?'Avanza al punto de partida':'Guarda tu escenario',step===1?'Pulsa Continuar cuando termines. En el siguiente paso puedes abrir la guía para revisar los precios de partida.':'Pulsa Calcular y guardar. Encontrarás el resultado y los pasos en el historial de tu negocio.'));
    }
    steps.push(guide('history','Recupera un cálculo','Selecciona la fecha y el método para consultar el escenario con sus cifras originales.'));
    steps.push(guide('compare','Comparar ambos','Guarda al menos un cálculo de cada método. Pulsa Comparar ambos para abrir los selectores del historial.'));
    if(selecting && ready) {
      steps.push(...methods.map(m=>guide('pick-'+m,'Elige el registro de '+modes[m],'Busca el escenario por fecha y meta de ganancia. Puedes elegir cálculos de días distintos.')));
      steps.push(guide('show-comparison','Ver la comparación','Revisa el precio, los pasos y si ambos escenarios usan las mismas condiciones.'));
    }
    if(history.length) steps.push(guide('remove','Eliminar un cálculo','Pulsa Eliminar junto al registro que quieres quitar y confirma su fecha y método.'));
    steps.push(guide('clear','Limpiar el historial','Esta opción elimina todos los escenarios de análisis del negocio. El sistema pide confirmación.'));
    onGuideChange(steps);
  },[mode,step,study,onGuideChange,selecting,ready,history.length]);
  async function submit(e){
    e.preventDefault();warn('');
    if(step===1){advance(2);return;}
    lock(true);
    try{
      const values=Object.fromEntries([...business,...fields].map(k=>[k,Number(data[k])]));
      const saved=await businessApi.calculatePrice({...values,mode});
      show(saved);setHistory(old=>[saved,...old.filter(r=>r.id!==saved.id)]);
    }catch(e){warn(e.message);}finally{lock(false);}
  }
  async function compare(){
    lock(true);warn('');setComparison(null);
    try {
      const records=await Promise.all(methods.map(m=>businessApi.priceDetail(pair[m])));
      setComparison(records.map((h,i)=>({...h,results:h.results.filter(r=>r.method===methods[i])})));
    } catch(e){warn(e.message);} finally{lock(false);}
  }
  async function remove(record){
    const prompt=record?'¿Eliminar '+describe(record)+'?':'¿Eliminar TODOS los cálculos de análisis de este negocio?';
    if(!window.confirm(prompt+' Esta acción es permanente.')) return;
    lock(true);warn('');
    try {
      await businessApi.removePrice(record?.id);
      setHistory(old=>record?old.filter(h=>h.id!==record.id):[]);
      if(!record || study?.id===record.id) show(null);
      setPair({bis:'',newton:''});setSelecting(false);setComparison(null);
    } catch(e){warn(e.message);} finally{lock(false);}
  }
  async function open(id){lock(true);warn('');try{show(await businessApi.priceDetail(id));}catch(e){warn(e.message);}finally{lock(false);}}
  return <div className="sb-content price-lab"><section className="sb-panel price-intro" data-guide="price-method"><h2>¿A qué precio vender tus mini donas?</h2><p>Explora qué precio cubriría tus gastos y alcanzaría tu meta mensual según la demanda estimada.</p>
  <label className="sb-field">Método<select disabled={busy} value={mode} onChange={e=>{choose(e.target.value);advance(1);show(null);warn('');}}>{methods.map(v=>[v,modes[v]]).map(([v,text])=><option value={v} key={v}>{text}</option>)}</select></label></section>
  <section className="sb-panel" data-guide="price-form">{study?<><Results study={study}/><PriceChart key={study.id} study={study}/><button disabled={busy} className="sb-secondary" onClick={()=>{show(null);advance(1);}}>Volver al inicio del cálculo</button></>:<form key={step} onSubmit={submit} className="price-fields"><h2>{step===1?'1. Datos del negocio':'2. Punto de partida'}</h2><p>{step===1?'Puedes empezar con el ejemplo. Una sensibilidad de 0,02 significa que subir $100 reduce la demanda mensual en dos donas.':'En Bisección, elige precios a lados opuestos de la meta. En Newton, empieza con un precio aproximado. Una precisión menor pide un ajuste más fino.'}</p>
  <button className="sb-secondary price-guide" type="button" onClick={onGuide}>? Guíame por estos campos</button>{fields.map(key=><label className="sb-field" data-guide={`price-${key}`} key={key}>{labels[key]}<input type="number" required disabled={busy} step={key==='max'?'1':'any'} min={key==='max'?1:0} value={data[key]} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}
  {step===2&&<button type="button" disabled={busy} className="sb-secondary" onClick={()=>advance(1)}>Atrás</button>}<button data-guide="price-next" disabled={busy} className="sb-primary">{step===1?'Continuar':busy?'Guardando…':'Calcular y guardar'}</button></form>}</section>
  {error&&<p role="alert" className="sb-error">{error}</p>}<section className="sb-panel" data-guide="price-history"><h2>Historial del negocio</h2>
    <button type="button" className="sb-secondary" onClick={onGuide}>Guía de esta sección</button>
    <button data-guide="price-compare" className="sb-primary" disabled={busy||!ready} onClick={()=>setSelecting(true)}>Comparar ambos</button>
    {!ready&&<p>Guarda al menos un cálculo de Bisección y uno de Newton-Raphson para comparar.</p>}
    {selecting&&ready&&<section><h3>Elegir cálculos guardados</h3>{methods.map(m=><label key={m} className="sb-field" data-guide={'price-pick-'+m}>{modes[m]}
      <select value={pair[m]} disabled={busy} onChange={e=>{setPair({...pair,[m]:e.target.value});setComparison(null);}}>
        <option value="">Selecciona un cálculo</option>{candidates(m).map(h=><option key={h.id} value={h.id}>{describe(h)}</option>)}
      </select></label>)}
      <button data-guide="price-show-comparison" className="sb-primary" disabled={busy||!pair.bis||!pair.newton} onClick={compare}>Ver comparación</button>
      {comparison&&<div><h3>Comparación de los registros elegidos</h3>
      <p>{[...business,'tolerance','max'].every(k=>comparison[0].inputs[k]===comparison[1].inputs[k])?'Ambos usan los mismos datos del negocio y criterios de parada.':'Los escenarios tienen datos o criterios distintos. Tenlo en cuenta al comparar precios y pasos.'}</p>
      <div className="sb-grid-two">{comparison.map((h,i)=><div key={methods[i]}><strong>{modes[methods[i]]} · {new Date(h.createdAt).toLocaleString('es-CO')}</strong><Results study={h}/></div>)}</div>
      <PriceChart key={comparison.map(h=>h.id).join('-')} study={{results:comparison.flatMap(h=>h.results)}}/></div>}
    </section>}
    {!history.length&&<p>Aquí aparecerán los escenarios guardados.</p>}
    {history.map((h,i)=><div key={h.id} className="sb-list-row"><button disabled={busy} className="sb-secondary price-record" onClick={()=>open(h.id)}>{describe(h)}</button>
      <button disabled={busy} data-guide={i===0?'price-remove':undefined} className="sb-danger" aria-label={'Eliminar '+describe(h)} onClick={()=>remove(h)}>Eliminar</button></div>)}
    <button data-guide="price-clear" disabled={busy||!history.length} className="sb-secondary" onClick={()=>remove(null)}>Limpiar todo el historial</button>
  </section></div>;
}
