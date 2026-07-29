/* =====================================================================
   SON-514 · Motor estadístico
   Sin dependencias. Cada función devuelve además los pasos intermedios,
   para que el tablero pueda mostrar CÓMO se construye el cálculo.
   ===================================================================== */
(function(global){
'use strict';

/* ---------------------------------------------------------------------
   1. FUNCIONES ESPECIALES (para los p-valores)
   Algoritmos clásicos: serie / fracción continua de Lentz.
   --------------------------------------------------------------------- */

// ln Γ(x) — aproximación de Lanczos
function lnGamma(x){
  const g=[76.18009172947146,-86.50532032941677,24.01409824083091,
           -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let y=x, tmp=x+5.5;
  tmp -= (x+0.5)*Math.log(tmp);
  let ser=1.000000000190015;
  for(let j=0;j<6;j++) ser += g[j]/++y;
  return -tmp + Math.log(2.5066282746310005*ser/x);
}

// P(a,x): gamma incompleta regularizada inferior — por serie
function gammaP_serie(a,x){
  let ap=a, sum=1/a, del=sum;
  for(let n=0;n<500;n++){
    ap++; del *= x/ap; sum += del;
    if(Math.abs(del) < Math.abs(sum)*1e-14) break;
  }
  return sum*Math.exp(-x + a*Math.log(x) - lnGamma(a));
}
// Q(a,x): gamma incompleta regularizada superior — fracción continua
function gammaQ_fc(a,x){
  const FPMIN=1e-300;
  let b=x+1-a, c=1/FPMIN, d=1/b, h=d;
  for(let i=1;i<=500;i++){
    const an=-i*(i-a);
    b+=2; d=an*d+b; if(Math.abs(d)<FPMIN) d=FPMIN;
    c=b+an/c;       if(Math.abs(c)<FPMIN) c=FPMIN;
    d=1/d; const del=d*c; h*=del;
    if(Math.abs(del-1)<1e-14) break;
  }
  return Math.exp(-x + a*Math.log(x) - lnGamma(a))*h;
}
function gammaP(a,x){
  if(x<0||a<=0) return NaN;
  if(x===0) return 0;
  return x < a+1 ? gammaP_serie(a,x) : 1-gammaQ_fc(a,x);
}

// I_x(a,b): beta incompleta regularizada — fracción continua
function betacf(a,b,x){
  const FPMIN=1e-300;
  const qab=a+b, qap=a+1, qam=a-1;
  let c=1, d=1-qab*x/qap;
  if(Math.abs(d)<FPMIN) d=FPMIN;
  d=1/d; let h=d;
  for(let m=1;m<=300;m++){
    const m2=2*m;
    let aa=m*(b-m)*x/((qam+m2)*(a+m2));
    d=1+aa*d; if(Math.abs(d)<FPMIN) d=FPMIN;
    c=1+aa/c; if(Math.abs(c)<FPMIN) c=FPMIN;
    d=1/d; h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
    d=1+aa*d; if(Math.abs(d)<FPMIN) d=FPMIN;
    c=1+aa/c; if(Math.abs(c)<FPMIN) c=FPMIN;
    d=1/d; const del=d*c; h*=del;
    if(Math.abs(del-1)<1e-14) break;
  }
  return h;
}
function betaI(a,b,x){
  if(x<=0) return 0;
  if(x>=1) return 1;
  const bt=Math.exp(lnGamma(a+b)-lnGamma(a)-lnGamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x < (a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1-bt*betacf(b,a,1-x)/b;
}

/* p-valores */
const pChi2   = (x,df) => x<=0 ? 1 : 1-gammaP(df/2, x/2);                    // cola superior
const pTdos   = (t,df) => betaI(df/2, 0.5, df/(df+t*t));                     // t bilateral
const pF      = (F,d1,d2)=> F<=0 ? 1 : betaI(d2/2, d1/2, d2/(d2+d1*F));      // F cola superior

/* ---------------------------------------------------------------------
   2. DESCRIPTIVAS
   --------------------------------------------------------------------- */
function cuantiles(ordenados, p){
  // método de interpolación lineal (equivalente al "type 7" de R / PERCENTIL de Excel)
  const n=ordenados.length; if(!n) return NaN;
  if(n===1) return ordenados[0];
  const h=(n-1)*p, lo=Math.floor(h), hi=Math.ceil(h);
  return ordenados[lo] + (h-lo)*(ordenados[hi]-ordenados[lo]);
}

function descriptivasNum(valores){
  const x=valores.filter(v=>v!=null && v!=='' && isFinite(+v)).map(Number);
  const n=x.length;
  if(!n) return null;
  const orden=[...x].sort((a,b)=>a-b);
  const suma=x.reduce((a,b)=>a+b,0);
  const media=suma/n;
  const sc=x.reduce((a,b)=>a+(b-media)**2, 0);           // suma de cuadrados
  const varMuestral = n>1 ? sc/(n-1) : 0;
  const ds=Math.sqrt(varMuestral);
  const q1=cuantiles(orden,.25), mediana=cuantiles(orden,.5), q3=cuantiles(orden,.75);
  // moda
  const f=new Map(); x.forEach(v=>f.set(v,(f.get(v)||0)+1));
  const maxF=Math.max(...f.values());
  const modas=[...f.entries()].filter(([,c])=>c===maxF).map(([v])=>v);
  return {
    n, suma, media, mediana, modas, modaFrec:maxF,
    min:orden[0], max:orden[n-1], rango:orden[n-1]-orden[0],
    q1, q3, ric:q3-q1,
    sumaCuadrados:sc, varianza:varMuestral, ds,
    cv: media!==0 ? ds/Math.abs(media) : NaN,
    ee: n>1 ? ds/Math.sqrt(n) : NaN,
    datos:orden
  };
}

function tablaFrecuencias(valores, ordenCat){
  const v=valores.filter(x=>x!=null && x!=='');
  const n=v.length;
  const m=new Map();
  v.forEach(x=>m.set(String(x),(m.get(String(x))||0)+1));
  let filas=[...m.entries()].map(([cat,fi])=>({cat, fi, hi:fi/n}));
  if(ordenCat && ordenCat.length){
    filas.sort((a,b)=>{
      const ia=ordenCat.indexOf(a.cat), ib=ordenCat.indexOf(b.cat);
      return (ia<0?1e9:ia)-(ib<0?1e9:ib);
    });
  }else{
    filas.sort((a,b)=>b.fi-a.fi);
  }
  let acum=0;
  filas.forEach(f=>{ acum+=f.fi; f.Fi=acum; f.Hi=acum/n; });
  const maxF=Math.max(...filas.map(f=>f.fi));
  return { n, filas, modas:filas.filter(f=>f.fi===maxF).map(f=>f.cat), k:filas.length };
}

/* Mediana de una ordinal: sobre las posiciones de las categorías */
function medianaOrdinal(valores, ordenCat){
  const idx=valores.filter(v=>v!=null&&v!=='')
    .map(v=>ordenCat.indexOf(String(v))).filter(i=>i>=0).sort((a,b)=>a-b);
  if(!idx.length) return null;
  const m=cuantiles(idx,.5);
  return { indice:m, categoria: ordenCat[Math.round(m)] ?? null, n:idx.length };
}

/* ---------------------------------------------------------------------
   3. BIVARIADO
   --------------------------------------------------------------------- */

/* 3a. Cualitativa × Cualitativa → contingencia + chi² + Cramér V */
function contingencia(pares, ordenX, ordenY){
  const datos=pares.filter(p=>p[0]!=null&&p[0]!==''&&p[1]!=null&&p[1]!=='');
  const n=datos.length;
  const cats=(arr,ord)=>{
    const s=[...new Set(arr)];
    if(ord&&ord.length) s.sort((a,b)=>{const i=ord.indexOf(a),j=ord.indexOf(b);return (i<0?1e9:i)-(j<0?1e9:j)});
    else s.sort();
    return s;
  };
  const X=cats(datos.map(d=>String(d[0])), ordenX);
  const Y=cats(datos.map(d=>String(d[1])), ordenY);
  const O=X.map(()=>Y.map(()=>0));
  datos.forEach(d=>{ O[X.indexOf(String(d[0]))][Y.indexOf(String(d[1]))]++; });

  const totF=O.map(f=>f.reduce((a,b)=>a+b,0));
  const totC=Y.map((_,j)=>O.reduce((a,f)=>a+f[j],0));
  const E=O.map((f,i)=>f.map((_,j)=>totF[i]*totC[j]/n));

  let chi2=0; const aportes=[];
  for(let i=0;i<X.length;i++) for(let j=0;j<Y.length;j++){
    if(E[i][j]>0){
      const a=(O[i][j]-E[i][j])**2/E[i][j];
      chi2+=a; aportes.push({i,j,aporte:a});
    }
  }
  const gl=(X.length-1)*(Y.length-1);
  const p=gl>0 ? pChi2(chi2,gl) : NaN;
  const minDim=Math.min(X.length,Y.length);
  const cramer = (n>0 && minDim>1) ? Math.sqrt(chi2/(n*(minDim-1))) : NaN;

  // supuesto: frecuencias esperadas >= 5
  const celdasBajas=E.flat().filter(e=>e<5).length;
  const total=X.length*Y.length;
  return {
    X, Y, O, E, totF, totC, n, chi2, gl, p, cramer,
    aportes: aportes.sort((a,b)=>b.aporte-a.aporte),
    supuesto:{
      celdasBajas, total, pct: total? celdasBajas/total : 0,
      cumple: celdasBajas/Math.max(total,1) <= 0.2 && E.flat().every(e=>e>=1)
    }
  };
}

/* 3b. Cualitativa × Cuantitativa → medias por grupo + t o F */
function porGrupo(pares){
  const m=new Map();
  pares.filter(p=>p[0]!=null&&p[0]!==''&&isFinite(+p[1]))
       .forEach(p=>{ const k=String(p[0]); (m.get(k)||m.set(k,[]).get(k)).push(+p[1]); });
  const grupos=[...m.entries()].map(([cat,vals])=>({cat, ...descriptivasNum(vals)}))
                .filter(g=>g.n>0).sort((a,b)=>b.media-a.media);
  const N=grupos.reduce((a,g)=>a+g.n,0);
  const granMedia=grupos.reduce((a,g)=>a+g.suma,0)/N;

  let prueba=null;
  if(grupos.length===2 && grupos.every(g=>g.n>=2)){
    // t de Welch (no asume varianzas iguales)
    const [a,b]=grupos;
    const se=Math.sqrt(a.varianza/a.n + b.varianza/b.n);
    const t=se>0 ? (a.media-b.media)/se : NaN;
    const num=(a.varianza/a.n + b.varianza/b.n)**2;
    const den=(a.varianza/a.n)**2/(a.n-1) + (b.varianza/b.n)**2/(b.n-1);
    const gl=den>0 ? num/den : NaN;
    // d de Cohen con desviación combinada
    const sp=Math.sqrt(((a.n-1)*a.varianza+(b.n-1)*b.varianza)/(a.n+b.n-2));
    prueba={ tipo:'t de Welch', t, gl, p: isFinite(t)&&isFinite(gl)? pTdos(t,gl):NaN,
             dif:a.media-b.media, ee:se, d: sp>0 ? (a.media-b.media)/sp : NaN };
  }else if(grupos.length>2 && grupos.every(g=>g.n>=2)){
    // ANOVA de un factor
    const sce=grupos.reduce((a,g)=>a+g.n*(g.media-granMedia)**2, 0);   // entre grupos
    const scd=grupos.reduce((a,g)=>a+g.sumaCuadrados, 0);              // dentro
    const gl1=grupos.length-1, gl2=N-grupos.length;
    const cme=sce/gl1, cmd=scd/gl2;
    const F=cmd>0 ? cme/cmd : NaN;
    prueba={ tipo:'ANOVA de un factor', F, gl1, gl2,
             p: isFinite(F)? pF(F,gl1,gl2):NaN,
             sce, scd, sct:sce+scd, cme, cmd,
             eta2:(sce+scd)>0 ? sce/(sce+scd) : NaN };
  }
  return { grupos, N, granMedia, prueba };
}

/* 3c. Cuantitativa × Cuantitativa → Pearson + regresión */
function correlacion(pares){
  const d=pares.filter(p=>isFinite(+p[0])&&isFinite(+p[1])).map(p=>[+p[0],+p[1]]);
  const n=d.length;
  if(n<3) return { n, insuficiente:true };
  const mx=d.reduce((a,p)=>a+p[0],0)/n, my=d.reduce((a,p)=>a+p[1],0)/n;
  let sxy=0,sxx=0,syy=0;
  d.forEach(([x,y])=>{ sxy+=(x-mx)*(y-my); sxx+=(x-mx)**2; syy+=(y-my)**2; });
  const r=(sxx>0&&syy>0) ? sxy/Math.sqrt(sxx*syy) : NaN;
  const gl=n-2;
  const t=isFinite(r)&&Math.abs(r)<1 ? r*Math.sqrt(gl/(1-r*r)) : (isFinite(r)?Infinity:NaN);
  const b1=sxx>0 ? sxy/sxx : NaN, b0=my-b1*mx;
  return { n, r, r2:r*r, gl, t, p: isFinite(t)&&isFinite(gl)? pTdos(t,gl):NaN,
           b0, b1, mediaX:mx, mediaY:my, sxx, syy, sxy, puntos:d };
}

/* ---------------------------------------------------------------------
   4. AYUDAS DE INTERPRETACIÓN (para la capa didáctica)
   --------------------------------------------------------------------- */
const leerP = p => !isFinite(p) ? 'no calculable'
  : p<0.001 ? 'p < 0,001 — diferencia muy difícil de atribuir al azar'
  : p<0.01  ? 'p < 0,01 — diferencia difícil de atribuir al azar'
  : p<0.05  ? 'p < 0,05 — resultado estadísticamente significativo por convención'
  : p<0.10  ? 'p entre 0,05 y 0,10 — indicio débil, no concluyente'
  :           'p ≥ 0,10 — compatible con el azar: no hay evidencia de relación';

const leerCramer = v => !isFinite(v) ? '—'
  : v<0.10 ? 'asociación insignificante' : v<0.20 ? 'asociación débil'
  : v<0.40 ? 'asociación moderada' : v<0.60 ? 'asociación relativamente fuerte'
  : 'asociación fuerte';

const leerR = r => { const a=Math.abs(r); const s=r<0?'negativa':'positiva';
  return !isFinite(r) ? '—'
    : a<0.10 ? 'correlación nula o casi nula'
    : a<0.30 ? `correlación ${s} débil`
    : a<0.50 ? `correlación ${s} moderada`
    : a<0.70 ? `correlación ${s} considerable`
    : `correlación ${s} fuerte`; };

const fmt = (x,d=2) => !isFinite(x) ? '—'
  : Number(x).toLocaleString('es-BO',{minimumFractionDigits:d, maximumFractionDigits:d});
const pct = x => !isFinite(x) ? '—' : (x*100).toLocaleString('es-BO',{maximumFractionDigits:1})+' %';

global.Estad = {
  lnGamma, gammaP, betaI, pChi2, pTdos, pF,
  cuantiles, descriptivasNum, tablaFrecuencias, medianaOrdinal,
  contingencia, porGrupo, correlacion,
  leerP, leerCramer, leerR, fmt, pct
};
})(typeof window!=='undefined' ? window : globalThis);
