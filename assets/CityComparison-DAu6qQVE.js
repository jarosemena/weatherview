import{j as o}from"./chart-vendor-CWQXQEom.js";import{d as r,u as $,a as u,c as y}from"./index-DQwsNvLn.js";import"./react-vendor-OvXVS5lI.js";import"./query-vendor-DN4O6IkE.js";const l=r.div`
  width: 100%;
`,b=r.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme:e})=>e.spacing.lg};
`,j=r.h2`
  font-size: ${({theme:e})=>e.typography.fontSize.xl};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0;
`,w=r.span`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
`,z=r.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({theme:e})=>e.spacing.lg};
  margin-bottom: ${({theme:e})=>e.spacing.lg};

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${({theme:e})=>e.spacing.md};
  }
`,v=r.div`
  background: ${({theme:e})=>e.colors.background.main};
  border-radius: ${({theme:e})=>e.borderRadius.lg};
  box-shadow: ${({theme:e})=>e.shadows.md};
  padding: ${({theme:e})=>e.spacing.lg};
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({theme:e})=>e.shadows.lg};
  }

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    padding: ${({theme:e})=>e.spacing.md};
  }
`,C=r.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme:e})=>e.spacing.md};
`,k=r.h3`
  font-size: ${({theme:e})=>e.typography.fontSize.lg};
  font-weight: ${({theme:e})=>e.typography.fontWeight.semibold};
  color: ${({theme:e})=>e.colors.text.primary};
  margin: 0;
`,S=r.button`
  background: ${({theme:e})=>e.colors.error};
  color: white;
  border: none;
  border-radius: ${({theme:e})=>e.borderRadius.sm};
  padding: ${({theme:e})=>e.spacing.xs} ${({theme:e})=>e.spacing.sm};
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: ${({theme:e})=>e.colors.error}dd;
    transform: scale(1.05);
  }

  &:focus {
    outline: 2px solid ${({theme:e})=>e.colors.error};
    outline-offset: 2px;
  }
`;r.button`
  background: ${({theme:e})=>e.colors.primary};
  color: white;
  border: none;
  border-radius: ${({theme:e})=>e.borderRadius.md};
  padding: ${({theme:e})=>e.spacing.md} ${({theme:e})=>e.spacing.lg};
  font-size: ${({theme:e})=>e.typography.fontSize.md};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  width: 100%;
  max-width: 300px;

  &:hover {
    background: ${({theme:e})=>e.colors.primary}dd;
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid ${({theme:e})=>e.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: ${({theme:e})=>e.breakpoints.tablet}) {
    max-width: 100%;
  }
`;const W=r.div`
  text-align: center;
  padding: ${({theme:e})=>e.spacing.xxl};
  color: ${({theme:e})=>e.colors.text.secondary};
  font-size: ${({theme:e})=>e.typography.fontSize.lg};
`,L=r.div`
  display: flex;
  justify-content: center;
  margin-top: ${({theme:e})=>e.spacing.lg};
`,T=r.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({theme:e})=>e.spacing.xl};
  gap: ${({theme:e})=>e.spacing.sm};
`,R=r.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({theme:e})=>e.colors.background.secondary};
  border-top-color: ${({theme:e})=>e.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`,E=r.p`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
  margin: 0;
`,F=r.div`
  padding: ${({theme:e})=>e.spacing.lg};
  text-align: center;
`,A=r.p`
  color: ${({theme:e})=>e.colors.error};
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  margin: 0;
`,H=r.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({theme:e})=>e.spacing.sm};
`,I=r.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`,M=r.div`
  font-size: ${({theme:e})=>e.typography.fontSize.xxl};
  font-weight: ${({theme:e})=>e.typography.fontWeight.bold};
  color: ${({theme:e})=>e.colors.primary};
`,P=r.div`
  font-size: ${({theme:e})=>e.typography.fontSize.md};
  color: ${({theme:e})=>e.colors.text.secondary};
  text-transform: capitalize;
  margin-bottom: ${({theme:e})=>e.spacing.md};
`,N=r.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({theme:e})=>e.spacing.md};
  margin-top: ${({theme:e})=>e.spacing.md};
  padding-top: ${({theme:e})=>e.spacing.md};
  border-top: 1px solid ${({theme:e})=>e.colors.background.secondary};
`,n=r.div`
  display: flex;
  flex-direction: column;
  gap: ${({theme:e})=>e.spacing.xs};
`,i=r.span`
  font-size: ${({theme:e})=>e.typography.fontSize.xs};
  color: ${({theme:e})=>e.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`,s=r.span`
  font-size: ${({theme:e})=>e.typography.fontSize.md};
  font-weight: ${({theme:e})=>e.typography.fontWeight.medium};
  color: ${({theme:e})=>e.colors.text.primary};
`,U=r.p`
  font-size: ${({theme:e})=>e.typography.fontSize.sm};
  color: ${({theme:e})=>e.colors.text.secondary};
  text-align: center;
  margin: 0;
`;function q({cities:e,onRemoveCity:p,maxCities:a=4}){const g=$(e),{temperatureUnit:d}=u(),h=e.length<a,m=t=>d==="fahrenheit"?y(t):t,c=t=>{const x=m(t),f=d==="fahrenheit"?"°F":"°C";return`${Math.round(x)}${f}`};return e.length===0?o.jsx(l,{children:o.jsxs(W,{children:["No cities selected for comparison.",o.jsx("br",{}),"Add cities to compare their weather data."]})}):o.jsxs(l,{children:[o.jsxs(b,{children:[o.jsx(j,{children:"City Comparison"}),o.jsxs(w,{children:[e.length," of ",a," cities"]})]}),o.jsx(z,{"data-testid":"comparison-grid",children:g.map(t=>o.jsxs(v,{children:[o.jsxs(C,{children:[o.jsx(k,{children:t.city}),o.jsx(S,{onClick:()=>p(t.city),"aria-label":`Remove ${t.city}`,children:"✕"})]}),t.isLoading&&o.jsxs(T,{children:[o.jsx(R,{}),o.jsx(E,{children:"Loading..."})]}),t.error&&o.jsx(F,{children:o.jsx(A,{children:"Failed to load data"})}),!t.isLoading&&!t.error&&t.weather&&o.jsxs(H,{children:[o.jsx(I,{children:t.weather.conditions.icon?o.jsx("img",{src:`https://openweathermap.org/img/wn/${t.weather.conditions.icon}@2x.png`,alt:t.weather.conditions.description}):"☀️"}),o.jsx(M,{children:c(t.weather.temperature.current)}),o.jsx(P,{children:t.weather.conditions.description}),o.jsxs(N,{children:[o.jsxs(n,{children:[o.jsx(i,{children:"Feels Like"}),o.jsx(s,{children:c(t.weather.temperature.feelsLike)})]}),o.jsxs(n,{children:[o.jsx(i,{children:"Humidity"}),o.jsxs(s,{children:[t.weather.humidity,"%"]})]}),o.jsxs(n,{children:[o.jsx(i,{children:"Wind"}),o.jsxs(s,{children:[t.weather.wind.speed," m/s"]})]}),o.jsxs(n,{children:[o.jsx(i,{children:"Pressure"}),o.jsxs(s,{children:[t.weather.pressure," hPa"]})]})]})]})]},t.city))}),h&&o.jsx(L,{children:o.jsx(U,{children:"Search for a city above to add it to the comparison"})})]})}export{q as CityComparison};
