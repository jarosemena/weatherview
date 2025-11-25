import{j as r,B as z,L as S,C as R,a as F,b as M,P as B,c as E,d as T,p as U,e as V,f as _,i as D}from"./chart-vendor-CWQXQEom.js";import{d as s}from"./index-DQwsNvLn.js";import"./react-vendor-OvXVS5lI.js";import"./query-vendor-DN4O6IkE.js";const $=s.div`
  background: ${({theme:e})=>e.colors.background.main};
  border-radius: ${({theme:e})=>e.borderRadius.lg};
  box-shadow: ${({theme:e})=>e.shadows.md};
  padding: ${({theme:e})=>e.spacing.lg};
  width: 100%;

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    padding: ${({theme:e})=>e.spacing.md};
  }
`,H=s.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme:e})=>e.spacing.lg};
  flex-wrap: wrap;
  gap: ${({theme:e})=>e.spacing.md};

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
  }
`,N=s.h3`
  font-size: ${({theme:e})=>e.typography.fontSize.lg};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0;
`;s.div`
  display: flex;
  gap: ${({theme:e})=>e.spacing.sm};
`;const O=s.div`
  position: relative;
  width: 100%;
  height: 300px;

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    height: 250px;
  }
`,P=s.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({theme:e})=>e.spacing.md};
  margin-top: ${({theme:e})=>e.spacing.md};
  padding-top: ${({theme:e})=>e.spacing.md};
  border-top: 1px solid ${({theme:e})=>e.colors.background.secondary};
`,I=s.div`
  display: flex;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.xs};
`,W=s.div`
  width: 16px;
  height: 16px;
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  background-color: ${({$color:e})=>e};
`,Z=s.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
`,q=s.div`
  text-align: center;
  padding: ${({theme:e})=>e.spacing.xxl};
  color: ${({theme:e})=>e.colors.text.secondary};
  font-size: ${({theme:e})=>e.typography.fontSize.md};
`,G=s.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
  margin-left: ${({theme:e})=>e.spacing.xs};
`;R.register(F,M,B,E,T,U,V,_,D);const o=["#2196F3","#FF9800","#4CAF50","#F44336"];function Y({data:e,type:n,timeRange:h,cities:c=[]}){const l=Array.isArray(e[0])&&Array.isArray(e),f=l?[]:e,C=l?e:[],m=t=>{if(!t||t.length===0)return t;new Date().setHours(0,0,0,0);let i;switch(h){case"1d":i=1;break;case"3d":i=3;break;case"5d":i=5;break;default:return t}return t.length<=i?t:t.slice(0,i)},d=m(f),p=C.map(t=>m(t));if(l&&p.length===0||!l&&d.length===0)return r.jsx($,{children:r.jsx(q,{children:"No data available"})});const y=()=>`${n.charAt(0).toUpperCase()+n.slice(1)} - ${h}`,g=()=>{switch(n){case"temperature":return"°C";case"precipitation":return"%";case"wind":return"m/s";default:return""}},x=t=>{switch(n){case"temperature":return t.map(a=>a.temperature.average);case"precipitation":return t.map(a=>a.precipitation);case"wind":return t.map(a=>a.wind.speed);default:return[]}},w=()=>{if(l&&c.length>0){const t=p[0]?.map(i=>i.date)||[],a=c.map((i,b)=>{const L=p[b]||[],A=x(L),u=o[b%o.length];return{label:i,data:A,borderColor:u,backgroundColor:n==="precipitation"?u:`${u}33`,fill:n!=="precipitation",tension:.4}});return{labels:t,datasets:a}}else{const t=d.map(i=>i.date),a=x(d);return{labels:t,datasets:[{label:n.charAt(0).toUpperCase()+n.slice(1),data:a,borderColor:o[0],backgroundColor:n==="precipitation"?o[0]:`${o[0]}33`,fill:n!=="precipitation",tension:.4}]}}},j={responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{mode:"index",intersect:!1,callbacks:{label:t=>{const a=Math.round(t.parsed.y);return`${t.dataset.label}: ${a}${g()}`}}}},scales:{y:{beginAtZero:n==="precipitation",ticks:{stepSize:1,callback:t=>{const a=Math.round(t);return t===a?`${a}${g()}`:null}}}}},k=w(),v=n==="precipitation"?z:S;return r.jsxs($,{children:[r.jsx(H,{children:r.jsxs(N,{children:[y(),r.jsx(G,{children:g()})]})}),r.jsx(O,{children:r.jsx(v,{data:k,options:j})}),c.length>1&&r.jsx(P,{children:c.map((t,a)=>r.jsxs(I,{children:[r.jsx(W,{$color:o[a%o.length]}),r.jsx(Z,{children:t})]},t))})]})}export{Y as ChartView};
