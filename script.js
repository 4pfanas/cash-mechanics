/* ================= helpers ================= */
const clamp01 = v => Math.max(0, Math.min(1, v));
const money = v => (v<0?'-':'') + '$' + Math.round(Math.abs(v)).toLocaleString('en-US');
const num = v => Math.round(v).toLocaleString('en-US');
const pctFmt = (v,d=1) => v.toFixed(d)+'%';
const daysFmt = v => v.toFixed(1)+' days';
const monthsFmt = v => v.toFixed(1)+' mo';
const ratioFmt = v => v.toFixed(2)+'&times;';

function svgWrap(inner, vb='0 0 480 150'){
  return `<svg viewBox="${vb}" class="diagram-svg" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
}

/* horizontal bar split into weighted, labeled segments (fractions of 1) */
function barSplit(parts, opts={}){
  const W=430, H=40, x0=15, y0=66;
  let x=x0, rects='', labels='';
  parts.forEach(p=>{
    const pw = Math.max(0,p.value)*W;
    const fillVar = p.tone==='neg' ? 'var(--neg)' : p.tone==='muted' ? 'var(--line-strong)' : 'var(--accent)';
    const op = p.tone==='muted' ? 0.55 : 1;
    rects += `<rect x="${x.toFixed(1)}" y="${y0}" width="${pw.toFixed(1)}" height="${H}" style="fill:${fillVar};opacity:${op}"/>`;
    if(pw>44){
      labels += `<text x="${(x+pw/2).toFixed(1)}" y="${y0+H/2+4}" text-anchor="middle" class="dsvg-label" style="fill:var(--surface);font-weight:600">${p.label}</text>`;
    }
    x+=pw;
  });
  const ticks=[0,0.5,1].map(f=>`<line x1="${(x0+f*W).toFixed(1)}" y1="${y0+H+6}" x2="${(x0+f*W).toFixed(1)}" y2="${y0+H+12}" class="dsvg-tick"/><text x="${(x0+f*W).toFixed(1)}" y="${y0+H+24}" text-anchor="middle" class="dsvg-muted">${['0%','50%','100%'][[0,0.5,1].indexOf(f)]}</text>`).join('');
  const frame = `<rect x="${x0}" y="${y0}" width="${W}" height="${H}" class="dsvg-frame"/>`;
  const big = opts.big ? `<text x="${x0}" y="30" class="dsvg-strong" font-size="20">${opts.big}</text>` : '';
  const sub = opts.sub ? `<text x="${x0}" y="46" class="dsvg-muted">${opts.sub}</text>` : '';
  return svgWrap(`${big}${sub}${frame}${rects}${labels}${ticks}`);
}

/* funnel/flow: n small source nodes merging into one output node */
function flowDiagram(sources, outLabel, resultBig){
  const y0=70, gap=34, x0=15;
  let nodes='', arrows='';
  sources.forEach((s,i)=>{
    const y = 24 + i*gap;
    nodes += `<rect x="${x0}" y="${y}" width="44" height="14" rx="2" style="fill:var(--accent)" opacity="0.75"/><text x="${x0}" y="${y+27}" class="dsvg-label">${s}</text>`;
    arrows += `<line x1="${x0+50}" y1="${y+7}" x2="230" y2="${y0+10}" class="dsvg-axis"/>`;
  });
  const funnel = `<polygon points="230,${y0-24} 230,${y0+44} 300,${y0+30} 300,${y0-10}" style="fill:var(--surface-2);stroke:var(--line-strong)"/>`;
  const out = `<circle cx="360" cy="${y0+10}" r="20" style="fill:none;stroke:var(--ink-soft);stroke-width:1.4"/><text x="360" y="${y0+50}" text-anchor="middle" class="dsvg-muted">${outLabel}</text>`;
  const arrowOut = `<line x1="300" y1="${y0+10}" x2="340" y2="${y0+10}" class="dsvg-axis"/>`;
  const result = resultBig ? `<text x="410" y="${y0+15}" class="dsvg-strong">${resultBig}</text>` : '';
  return svgWrap(`${nodes}${arrows}${funnel}${arrowOut}${out}${result}`, '0 0 470 150');
}

/* renewal strip: ticks with an X marking the churn point */
function renewalStrip(count, resultBig, resultSub){
  const x0=15, y=70, w=390, n=Math.max(2,Math.min(10,Math.round(count)));
  const bw = w/n - 4;
  let ticks='';
  for(let i=0;i<n;i++){
    const x = x0 + i*(w/n);
    ticks += `<rect x="${x.toFixed(1)}" y="${y}" width="${bw.toFixed(1)}" height="26" style="fill:var(--accent)" opacity="${0.35+0.65*(i/n)}"/>`;
  }
  const xmark = `<text x="${(x0+w+8).toFixed(1)}" y="${y+20}" class="dsvg-strong" fill="var(--neg)">&#10005;</text>`;
  const axis = `<line x1="${x0}" y1="${y+34}" x2="${x0+w+20}" y2="${y+34}" class="dsvg-axis"/>`;
  const lbl = `<text x="${x0}" y="${y-8}" class="dsvg-muted">MONTH 1</text><text x="${x0+w}" y="${y-8}" text-anchor="end" class="dsvg-muted">THEY LEAVE</text>`;
  const big = resultBig ? `<text x="${x0}" y="26" class="dsvg-strong" font-size="20">${resultBig}</text>` : '';
  const sub = resultSub ? `<text x="${x0}" y="42" class="dsvg-muted">${resultSub}</text>` : '';
  return svgWrap(`${big}${sub}${lbl}${ticks}${axis}${xmark}`);
}

/* multiply: small bar -> &times;N -> big bar */
function multiplyDiagram(smallLabel, bigLabel, mult, resultBig){
  const x0=15, y=70, smallW=40, bigW=Math.min(300, 40*Math.sqrt(mult));
  return svgWrap(`
    <text x="${x0}" y="26" class="dsvg-strong" font-size="20">${resultBig}</text>
    <rect x="${x0}" y="${y}" width="${smallW}" height="24" style="fill:var(--line-strong)"/>
    <text x="${x0+smallW/2}" y="${y+40}" text-anchor="middle" class="dsvg-label">${smallLabel}</text>
    <rect x="${x0+smallW+18}" y="${y+2}" width="34" height="20" style="fill:none;stroke:var(--line-strong)"/>
    <text x="${x0+smallW+35}" y="${y+16}" text-anchor="middle" class="dsvg-muted">&times;${mult}</text>
    <line x1="${x0+smallW+56}" y1="${y+12}" x2="${x0+smallW+74}" y2="${y+12}" class="dsvg-axis"/>
    <rect x="${x0+smallW+80}" y="${y-10}" width="${bigW}" height="34" style="fill:var(--accent)"/>
    <text x="${x0+smallW+80+bigW/2}" y="${y+40}" text-anchor="middle" class="dsvg-label">${bigLabel}</text>
  `,'0 0 460 150');
}

/* timeline ruler with bracketed day-spans, can go negative */
function timelineDiagram(segments, totalDays, resultBig){
  const x0=20, w=420, y=76;
  const maxScale = Math.max(60, Math.abs(totalDays)*1.4, ...segments.map(s=>Math.abs(s.days)));
  const scale = (w/2) / maxScale; // zero at center if negatives exist
  const hasNeg = segments.some(s=>s.days<0) || totalDays<0;
  const zeroX = hasNeg ? x0 + w/2 : x0;
  let x = zeroX, bars='';
  segments.forEach(s=>{
    const bw = s.days*scale;
    const rx = bw<0 ? x+bw : x;
    bars += `<rect x="${rx.toFixed(1)}" y="${y}" width="${Math.abs(bw).toFixed(1)}" height="22" style="fill:${s.color||'var(--accent)'}" opacity="0.85"/>`;
    bars += `<text x="${(rx+Math.abs(bw)/2).toFixed(1)}" y="${y-8}" text-anchor="middle" class="dsvg-label">${s.label}</text>`;
    x += bw;
  });
  const axis = `<line x1="${x0}" y1="${y+34}" x2="${x0+w}" y2="${y+34}" class="dsvg-axis"/>`;
  const zero = `<line x1="${zeroX}" y1="${y-2}" x2="${zeroX}" y2="${y+24}" class="dsvg-tick"/>`;
  const big = resultBig ? `<text x="${x0}" y="26" class="dsvg-strong" font-size="20">${resultBig}</text>` : '';
  const net = `<line x1="${zeroX}" y1="${y+40}" x2="${x.toFixed(1)}" y2="${y+40}" class="dsvg-axis" style="stroke:var(--ink-soft);stroke-width:2"/>`;
  return svgWrap(`${big}${axis}${bars}${zero}${net}`);
}

/* cash-conversion-cycle: two rows (days cash is tied up vs days suppliers cover), net marker */
function cccDiagram(dso,dio,dpo,net,resultBig){
  const x0=20, w=420, yTop=44, yBot=86;
  const scale = (w/2) / Math.max(45, dso+dio, dpo, Math.abs(net)*1.3);
  const zeroX = x0 + w/2;
  const dsoW = dso*scale, dioW = dio*scale, dpoW = dpo*scale, netX = zeroX + net*scale;
  return svgWrap(`
    <text x="${x0}" y="20" class="dsvg-strong" font-size="18">${resultBig}</text>
    <text x="${zeroX.toFixed(1)}" y="34" text-anchor="middle" class="dsvg-muted">CASH TIED UP</text>
    <rect x="${zeroX.toFixed(1)}" y="${yTop}" width="${dsoW.toFixed(1)}" height="18" style="fill:var(--accent)"/>
    <text x="${(zeroX+dsoW/2).toFixed(1)}" y="${yTop+13}" text-anchor="middle" class="dsvg-label" style="fill:var(--surface)">DSO</text>
    <rect x="${(zeroX+dsoW).toFixed(1)}" y="${yTop}" width="${dioW.toFixed(1)}" height="18" style="fill:var(--ink-soft)"/>
    <text x="${(zeroX+dsoW+dioW/2).toFixed(1)}" y="${yTop+13}" text-anchor="middle" class="dsvg-label" style="fill:var(--surface)">DIO</text>
    <text x="${zeroX.toFixed(1)}" y="${yBot-6}" text-anchor="middle" class="dsvg-muted">COVERED BY SUPPLIERS</text>
    <rect x="${zeroX.toFixed(1)}" y="${yBot}" width="${dpoW.toFixed(1)}" height="18" style="fill:var(--line-strong)"/>
    <text x="${(zeroX+dpoW/2).toFixed(1)}" y="${yBot+13}" text-anchor="middle" class="dsvg-label">DPO</text>
    <line x1="${zeroX.toFixed(1)}" y1="30" x2="${zeroX.toFixed(1)}" y2="${yBot+18}" class="dsvg-tick"/>
    <line x1="${netX.toFixed(1)}" y1="20" x2="${netX.toFixed(1)}" y2="${yBot+26}" class="dsvg-axis" style="stroke:var(--ink);stroke-width:1.5"/>
    <text x="${netX.toFixed(1)}" y="${yBot+40}" text-anchor="middle" class="dsvg-muted">NET: ${net.toFixed(0)}d</text>
  `);
}

/* two stacked bars compared, with a delta bracket */
function stockCompare(aLabel,aVal,bLabel,bVal,deltaBig,maxVal){
  const x0=110, w=300, h=22, y1=40, y2=76;
  const m = maxVal || Math.max(aVal,bVal,1);
  const aw = clamp01(aVal/m)*w, bw = clamp01(bVal/m)*w;
  return svgWrap(`
    <text x="0" y="${y1+15}" class="dsvg-label">${aLabel}</text>
    <rect x="${x0}" y="${y1}" width="${aw.toFixed(1)}" height="${h}" style="fill:var(--accent)"/>
    <text x="0" y="${y2+15}" class="dsvg-label">${bLabel}</text>
    <rect x="${x0}" y="${y2}" width="${bw.toFixed(1)}" height="${h}" style="fill:var(--line-strong)"/>
    <text x="${x0+w+20}" y="62" class="dsvg-strong">${deltaBig}</text>
  `);
}

/* tank fill draining/filling */
function tankDiagram(fracFull, resultBig, resultSub, monthsMarks){
  const x0=20, w=280, h=50, y=48;
  const fw = clamp01(fracFull)*w;
  let marks='';
  (monthsMarks||[]).forEach(m=>{
    const mx = x0 + clamp01(m.frac)*w;
    marks += `<line x1="${mx}" y1="${y-4}" x2="${mx}" y2="${y+h+4}" class="dsvg-tick"/><text x="${mx}" y="${y+h+16}" text-anchor="middle" class="dsvg-muted">${m.label}</text>`;
  });
  return svgWrap(`
    <text x="${x0+w+30}" y="${y+18}" class="dsvg-strong" font-size="20">${resultBig}</text>
    <text x="${x0+w+30}" y="${y+34}" class="dsvg-muted">${resultSub}</text>
    <rect x="${x0}" y="${y}" width="${w}" height="${h}" class="dsvg-frame"/>
    <rect x="${x0}" y="${y}" width="${fw.toFixed(1)}" height="${h}" style="fill:var(--accent)" opacity="0.85"/>
    ${marks}
  `,'0 0 470 150');
}

/* cash vs accrual mini timelines */
function compareDiagram(months, cashRow, accrualRow){
  let cash='', accr='';
  const x0=15, w=430, gap=2, cw = w/months - gap;
  for(let i=0;i<months;i++){
    const x = x0 + i*(w/months);
    const ch = cashRow[i] > 0 ? 22 : 2;
    const ah = accrualRow[i] > 0 ? Math.max(2, 22*(accrualRow[i]/Math.max(...accrualRow))) : 2;
    cash += `<rect x="${x.toFixed(1)}" y="${(40-ch).toFixed(1)}" width="${cw.toFixed(1)}" height="${ch}" style="fill:var(--accent)" opacity="${cashRow[i]>0?1:0.25}"/>`;
    accr += `<rect x="${x.toFixed(1)}" y="${(100-ah).toFixed(1)}" width="${cw.toFixed(1)}" height="${ah}" style="fill:var(--ink-soft)" opacity="0.85"/>`;
  }
  return svgWrap(`
    <text x="${x0}" y="16" class="dsvg-muted">CASH BASIS &mdash; recognized when paid</text>
    ${cash}
    <text x="${x0}" y="60" class="dsvg-muted">ACCRUAL BASIS &mdash; recognized when earned</text>
    ${accr}
    <line x1="${x0}" y1="44" x2="${x0+w}" y2="44" class="dsvg-axis"/>
    <line x1="${x0}" y1="104" x2="${x0+w}" y2="104" class="dsvg-axis"/>
  `,'0 0 460 120');
}

function gaugeMarkup(frac, big, unit){
  frac = clamp01(frac);
  const r=54, c=2*Math.PI*r;
  return `<svg class="gauge" viewBox="0 0 130 130">
    <circle class="g-track" cx="65" cy="65" r="${r}" stroke-dasharray="${c*0.75} ${c}" stroke-dashoffset="${-c*0.125}" transform="rotate(-90 65 65)"/>
    <circle class="g-fill" cx="65" cy="65" r="${r}" stroke-dasharray="${c*0.75*frac} ${c}" stroke-dashoffset="${-c*0.125}" transform="rotate(-90 65 65)"/>
    <text x="65" y="66" text-anchor="middle" class="gauge-num">${big}</text>
    <text x="65" y="82" text-anchor="middle" class="gauge-unit">${unit}</text>
  </svg>`;
}

/* ================= data ================= */
const SECTIONS = [
  {id:'unit', name:'Unit Economics', blurb:'What it actually costs to win, and keep, one customer.'},
  {id:'growth', name:'Growth &amp; Revenue', blurb:'How the top line compounds, and how much of it sticks.'},
  {id:'margins', name:'Margins &amp; Efficiency', blurb:'What survives delivery, and what growth costs in cash.'},
  {id:'cash', name:'Cash Mechanics', blurb:'The plumbing that decides whether growth funds itself.'},
  {id:'basis', name:'Accounting Lens', blurb:'Same dollar, two different stories depending on when you count it.'},
];

const METRICS = [
{
  id:'cac', section:'unit', name:'CAC', sub:'Customer Acquisition Cost',
  inputs:[
    {key:'spend', label:'Sales + marketing spend', type:'range', min:10000, max:200000, step:5000, def:50000, fmt:money},
    {key:'newCust', label:'New customers won', type:'range', min:10, max:1000, step:10, def:100, fmt:num},
  ],
  compute:v=>{ const cac=v.spend/v.newCust; return {value:cac, text:money(cac), gaugeFrac:cac/2000}; },
  formula:(v,c)=>`CAC&nbsp;=&nbsp;${money(v.spend)}&nbsp;&divide;&nbsp;${num(v.newCust)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>flowDiagram(['ADS','SALARIES','TOOLS'],'1 customer',c.text),
  notes:{
    touchpoint:'Every dollar spent before the first invoice &mdash; ads, sales salaries, tools, agency fees.',
    watch:'Fully-loaded means everyone in the funnel, not just the ad line. Leaving out salaries flatters this number and breaks every ratio built on top of it.',
    benchmark:'There is no universal &ldquo;good&rdquo; CAC &mdash; judge it against LTV, never in isolation.'
  },
  caption:'Everything you spent to get one stranger to say yes.'
},
{
  id:'ltv', section:'unit', name:'LTV', sub:'Lifetime Value',
  inputs:[
    {key:'arpa', label:'ARPA (revenue / customer / mo)', type:'range', min:20, max:500, step:5, def:100, fmt:money},
    {key:'gm', label:'Gross margin', type:'range', min:30, max:95, step:1, def:75, fmt:v=>pctFmt(v,0)},
    {key:'churn', label:'Monthly churn', type:'range', min:1, max:20, step:0.5, def:5, fmt:v=>pctFmt(v,1)},
  ],
  compute:v=>{ const ltv=v.arpa*(v.gm/100)/(v.churn/100); return {value:ltv, text:money(ltv), gaugeFrac:ltv/5000}; },
  formula:(v,c)=>`LTV&nbsp;=&nbsp;${money(v.arpa)}&nbsp;&times;&nbsp;${pctFmt(v.gm,0)}&nbsp;&divide;&nbsp;${pctFmt(v.churn,1)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>renewalStrip(1/(v.churn/100), c.text, 'every renewal after the first one'),
  notes:{
    touchpoint:'Every renewal after the first one &mdash; the recurring gross profit a customer hands back before they leave.',
    watch:'Built on an assumed churn rate. Halve the churn input and LTV doubles &mdash; the formula is only as honest as that number.',
    benchmark:'LTV : CAC of 3&times; or higher is the standard bar for a venture-fundable model.'
  },
  caption:'Total gross profit one customer hands you before they leave.'
},
{
  id:'payback', section:'unit', name:'CAC Payback', sub:'Months to Break Even',
  inputs:[
    {key:'cac', label:'CAC', type:'range', min:100, max:2000, step:50, def:500, fmt:money},
    {key:'arpa', label:'ARPA / month', type:'range', min:20, max:500, step:5, def:100, fmt:money},
    {key:'gm', label:'Gross margin', type:'range', min:30, max:95, step:1, def:75, fmt:v=>pctFmt(v,0)},
  ],
  compute:v=>{ const m=v.cac/(v.arpa*(v.gm/100)); return {value:m, text:monthsFmt(m), gaugeFrac:m/24}; },
  formula:(v,c)=>`PAYBACK&nbsp;=&nbsp;${money(v.cac)}&nbsp;&divide;&nbsp;(${money(v.arpa)}&nbsp;&times;&nbsp;${pctFmt(v.gm,0)})&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>timelineDiagram([{label:'MONTHS TO REPAY', days:c.value*2.5}], c.value*2.5, c.text),
  notes:{
    touchpoint:'The stretch between signing a customer and recouping what it cost to sign them.',
    watch:'Counted in gross-margin dollars, not revenue &mdash; a customer who hasn&rsquo;t paid back their margin yet is still your liability.',
    benchmark:'Under 12 months is comfortable for SaaS; under 18 is workable if retention is strong.'
  },
  caption:'The runway you burn on one customer before they start paying you back.'
},
{
  id:'magic', section:'unit', name:'Magic Number', sub:'Sales Efficiency',
  inputs:[
    {key:'curArr', label:'ARR this quarter', type:'range', min:1000000, max:10000000, step:100000, def:4400000, fmt:money},
    {key:'priorArr', label:'ARR last quarter', type:'range', min:1000000, max:10000000, step:100000, def:4000000, fmt:money},
    {key:'sm', label:'Prior-quarter S&amp;M spend', type:'range', min:200000, max:3000000, step:50000, def:1200000, fmt:money},
  ],
  compute:v=>{ const mn=((v.curArr-v.priorArr)*4)/v.sm; return {value:mn, text:ratioFmt(mn), gaugeFrac:mn/2}; },
  formula:(v,c)=>`MAGIC&nbsp;=&nbsp;(${money(v.curArr)}&nbsp;-&nbsp;${money(v.priorArr)})&nbsp;&times;&nbsp;4&nbsp;&divide;&nbsp;${money(v.sm)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>multiplyDiagram('NET-NEW ARR','&times;4 ARR RUN-RATE',4,c.text),
  notes:{
    touchpoint:'Compares last quarter&rsquo;s sales and marketing spend to the ARR it produced this quarter.',
    watch:'One noisy quarter &mdash; a delayed close, a lumpy renewal &mdash; swings this hard. Read it as a trend, not a verdict.',
    benchmark:'Above 0.75 is efficient enough to lean into more sales spend. Below 0.5, fix the funnel before funding it.'
  },
  caption:'How much new recurring revenue a dollar of sales spend actually buys.'
},

{
  id:'arr', section:'growth', name:'ARR', sub:'Annual Recurring Revenue',
  inputs:[
    {key:'mrr', label:'Monthly recurring revenue', type:'range', min:5000, max:500000, step:5000, def:50000, fmt:money},
  ],
  compute:v=>{ const arr=v.mrr*12; return {value:arr, text:money(arr), gaugeFrac:arr/2000000}; },
  formula:(v,c)=>`ARR&nbsp;=&nbsp;${money(v.mrr)}&nbsp;&times;&nbsp;12&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>multiplyDiagram('MRR','ARR',12,c.text),
  notes:{
    touchpoint:'Contracted, recurring revenue &mdash; already committed and locked in.',
    watch:'One-off fees, services revenue, and usage spikes never belong in ARR &mdash; they were never recurring.',
    benchmark:'Growth rate matters more than the absolute number: 3&times; at $1M beats flat at $50M.'
  },
  caption:'The revenue that shows up again next year without a new sale.'
},
{
  id:'ndr', section:'growth', name:'Net Dollar Retention', sub:'Existing Customers, One Year On',
  inputs:[
    {key:'start', label:'Starting ARR (this cohort)', type:'range', min:200000, max:5000000, step:50000, def:1000000, fmt:money},
    {key:'expand', label:'Expansion', type:'range', min:0, max:500000, step:10000, def:150000, fmt:money},
    {key:'contract', label:'Contraction (downgrades)', type:'range', min:0, max:300000, step:10000, def:40000, fmt:money},
    {key:'churned', label:'Churned', type:'range', min:0, max:500000, step:10000, def:60000, fmt:money},
  ],
  compute:v=>{ const end=v.start+v.expand-v.contract-v.churned; const ndr=(end/v.start)*100; return {value:ndr, text:pctFmt(ndr,0), gaugeFrac:(ndr-70)/70}; },
  formula:(v,c)=>`NDR&nbsp;=&nbsp;(${money(v.start)}&nbsp;+&nbsp;${money(v.expand)}&nbsp;-&nbsp;${money(v.contract)}&nbsp;-&nbsp;${money(v.churned)})&nbsp;&divide;&nbsp;${money(v.start)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>barSplit([
      {label:'RETAINED', value:(v.start-v.contract-v.churned)/v.start, tone:'muted'},
      {label:'EXPANSION', value:v.expand/v.start, tone:'accent'},
    ], {big:c.text, sub:'of starting ARR, twelve months later'}),
  notes:{
    touchpoint:'Same cohort, twelve months on &mdash; expansions and contractions netted against what they started with.',
    watch:'New logos are excluded on purpose &mdash; this is a pure test of whether the product gets more valuable to people who already bought it.',
    benchmark:'Above 100% means the business grows even if new sales stopped tomorrow. Best-in-class SaaS clears 120%.'
  },
  caption:'What a dollar of existing revenue turns into, twelve months later.'
},
{
  id:'churn', section:'growth', name:'Revenue Churn', sub:'Recurring Revenue Lost',
  inputs:[
    {key:'churned', label:'Churned revenue', type:'range', min:0, max:300000, step:5000, def:60000, fmt:money},
    {key:'start', label:'Starting revenue', type:'range', min:100000, max:5000000, step:50000, def:1000000, fmt:money},
  ],
  compute:v=>{ const c=(v.churned/v.start)*100; return {value:c, text:pctFmt(c,1), gaugeFrac:c/15}; },
  formula:(v,c)=>`CHURN&nbsp;=&nbsp;${money(v.churned)}&nbsp;&divide;&nbsp;${money(v.start)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>barSplit([
      {label:'RETAINED', value:(v.start-v.churned)/v.start, tone:'muted'},
      {label:'CHURNED', value:v.churned/v.start, tone:'neg'},
    ], {big:c.text, sub:'of starting revenue, gone this period'}),
  notes:{
    touchpoint:'Recurring revenue lost to cancellations and downgrades this period, as a share of where you started.',
    watch:'Logo churn and revenue churn tell different stories &mdash; losing your smallest accounts looks fine on revenue churn and terrible on logo churn.',
    benchmark:'Under 1% monthly is strong for SMB SaaS; under 0.5% is expected once you sell to enterprise.'
  },
  caption:'The tax growth pays every single month, whether you notice it or not.'
},
{
  id:'rule40', section:'growth', name:'Rule of 40', sub:'Growth Plus Profit, One Number',
  inputs:[
    {key:'growth', label:'YoY growth rate', type:'range', min:0, max:150, step:1, def:30, fmt:v=>pctFmt(v,0)},
    {key:'margin', label:'Profit margin', type:'range', min:-50, max:60, step:1, def:15, fmt:v=>pctFmt(v,0)},
  ],
  compute:v=>{ const s=v.growth+v.margin; return {value:s, text:s.toFixed(0), gaugeFrac:(s+20)/80}; },
  formula:(v,c)=>`SCORE&nbsp;=&nbsp;${pctFmt(v.growth,0)}&nbsp;+&nbsp;${pctFmt(v.margin,0)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>barSplit([
      {label:'GROWTH', value:Math.max(0,v.growth)/150, tone:'accent'},
      {label:'MARGIN', value:Math.max(0,v.margin)/150, tone:'muted'},
    ], {big:c.text, sub:'growth % + profit margin % (target: 40)'}),
  notes:{
    touchpoint:'Adds your growth rate to your profit margin &mdash; one number that penalizes growth bought with unlimited losses.',
    watch:'A 90%-growth, -60%-margin company clears 40 on paper and is often the more fragile business. Read both halves, not just the sum.',
    benchmark:'40 or above is the traditional bar for a healthy SaaS business at any stage.'
  },
  caption:'Fast and unprofitable can score the same as slow and profitable. Read both halves.'
},

{
  id:'gm', section:'margins', name:'Gross Margin', sub:'What Survives Delivery',
  inputs:[
    {key:'revenue', label:'Revenue', type:'range', min:50000, max:2000000, step:10000, def:1000000, fmt:money},
    {key:'cogs', label:'COGS', type:'range', min:0, max:1000000, step:10000, def:280000, fmt:money},
  ],
  compute:v=>{ const gm=((v.revenue-v.cogs)/v.revenue)*100; return {value:gm, text:pctFmt(gm,0), gaugeFrac:gm/100}; },
  formula:(v,c)=>`GM&nbsp;=&nbsp;(${money(v.revenue)}&nbsp;-&nbsp;${money(v.cogs)})&nbsp;&divide;&nbsp;${money(v.revenue)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>barSplit([
      {label:'COGS', value:v.cogs/v.revenue, tone:'muted'},
      {label:'GROSS MARGIN', value:(v.revenue-v.cogs)/v.revenue, tone:'accent'},
    ], {big:c.text, sub:'left to run the company'}),
  notes:{
    touchpoint:'Hosting, support, payment fees, delivery staff &mdash; the direct cost of serving one more customer.',
    watch:'Support headcount that scales linearly with customers is a COGS problem wearing an OpEx costume &mdash; it will quietly cap this number.',
    benchmark:'Software clears 75&ndash;85%. Services-heavy or hardware-heavy models rarely clear 40%.'
  },
  caption:'What&rsquo;s left after the cost of actually delivering the thing.'
},
{
  id:'cm', section:'margins', name:'Contribution Margin', sub:'What One More Sale Adds',
  inputs:[
    {key:'price', label:'Price per unit', type:'range', min:10, max:500, step:5, def:100, fmt:money},
    {key:'vc', label:'Variable cost per unit', type:'range', min:0, max:500, step:5, def:35, fmt:money},
  ],
  compute:v=>{ const contr=v.price-v.vc; const pct=(contr/v.price)*100; return {value:contr, text:money(contr), pct, gaugeFrac:pct/100}; },
  formula:(v,c)=>`CONTRIBUTION&nbsp;=&nbsp;${money(v.price)}&nbsp;-&nbsp;${money(v.vc)}&nbsp;=&nbsp;<span class="res">${c.text}</span>&nbsp;(${pctFmt(c.pct,0)})`,
  diagram:(v,c)=>barSplit([
      {label:'VARIABLE COST', value:v.vc/v.price, tone:'muted'},
      {label:'CONTRIBUTION', value:(v.price-v.vc)/v.price, tone:'accent'},
    ], {big:c.text, sub:'kept from the next unit sold'}),
  notes:{
    touchpoint:'Price minus the variable cost of producing one more unit &mdash; ignores every fixed cost entirely.',
    watch:'Negative contribution margin means every additional sale makes the company poorer, no matter how large the top line gets.',
    benchmark:'Must be comfortably positive before fixed costs even enter the conversation.'
  },
  caption:'What one more sale actually contributes before fixed costs get their share.'
},
{
  id:'burn', section:'margins', name:'Burn Multiple', sub:'Cash Burned per Dollar of New ARR',
  inputs:[
    {key:'burn', label:'Net cash burned', type:'range', min:50000, max:3000000, step:50000, def:500000, fmt:money},
    {key:'newArr', label:'Net new ARR', type:'range', min:50000, max:3000000, step:50000, def:1000000, fmt:money},
  ],
  compute:v=>{ const b=v.burn/v.newArr; return {value:b, text:ratioFmt(b), gaugeFrac:b/3}; },
  formula:(v,c)=>`BURN&nbsp;MULTIPLE&nbsp;=&nbsp;${money(v.burn)}&nbsp;&divide;&nbsp;${money(v.newArr)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>stockCompare('CASH BURNED', v.burn, 'NET NEW ARR', v.newArr, c.text, Math.max(v.burn,v.newArr)),
  notes:{
    touchpoint:'Net cash burned this period, divided by the net new recurring revenue it bought.',
    watch:'A great burn multiple at $500K ARR and the same number at $50M mean very different things &mdash; always read it against stage.',
    benchmark:'Under 1&times; is excellent, 1&ndash;1.5&times; is good, above 2&times; deserves a hard look at where the cash is going.'
  },
  caption:'How much cash it costs to buy one more dollar of recurring revenue.'
},
{
  id:'runway', section:'margins', name:'Runway', sub:'Months Until the Cash Runs Out',
  inputs:[
    {key:'cash', label:'Cash in the bank', type:'range', min:100000, max:10000000, step:100000, def:3000000, fmt:money},
    {key:'burn', label:'Net monthly burn', type:'range', min:10000, max:1000000, step:10000, def:250000, fmt:money},
  ],
  compute:v=>{ const m=v.cash/v.burn; return {value:m, text:monthsFmt(m), gaugeFrac:m/36}; },
  formula:(v,c)=>`RUNWAY&nbsp;=&nbsp;${money(v.cash)}&nbsp;&divide;&nbsp;${money(v.burn)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>tankDiagram(1, c.text, 'until the account hits zero', [{frac:0.5,label:Math.round(c.value/2)+'mo'},{frac:1,label:'0'}]),
  notes:{
    touchpoint:'Cash in the bank, divided by how fast it&rsquo;s leaving every month.',
    watch:'Burn rarely stays flat &mdash; a hiring plan or a paid campaign can cut this number in half without changing the balance sheet.',
    benchmark:'18+ months keeps you fundraising from strength, not from need.'
  },
  caption:'The countdown every other decision is quietly made against.'
},

{
  id:'ccc', section:'cash', name:'Cash Conversion Cycle', sub:'Days Cash Spends Tied Up',
  inputs:[
    {key:'dso', label:'DSO', type:'range', min:0, max:90, step:1, def:45, fmt:v=>v.toFixed(0)+'d'},
    {key:'dio', label:'DIO', type:'range', min:0, max:90, step:1, def:30, fmt:v=>v.toFixed(0)+'d'},
    {key:'dpo', label:'DPO', type:'range', min:0, max:90, step:1, def:40, fmt:v=>v.toFixed(0)+'d'},
  ],
  compute:v=>{ const ccc=v.dso+v.dio-v.dpo; return {value:ccc, text:daysFmt(ccc), gaugeFrac:(ccc+30)/120}; },
  formula:(v,c)=>`CCC&nbsp;=&nbsp;${v.dso}&nbsp;+&nbsp;${v.dio}&nbsp;-&nbsp;${v.dpo}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>cccDiagram(v.dso, v.dio, v.dpo, c.value, c.text),
  notes:{
    touchpoint:'The full loop: days to sell inventory, plus days to collect from customers, minus days you take to pay suppliers.',
    watch:'A negative CCC isn&rsquo;t a bug &mdash; it means suppliers are financing your growth instead of your bank.',
    benchmark:'Lower is better everywhere. Marketplaces and subscription businesses can push this negative.'
  },
  caption:'How many days your own cash is out of your hands before it comes back.'
},
{
  id:'dso', section:'cash', name:'DSO', sub:'Days Sales Outstanding',
  inputs:[
    {key:'ar', label:'Accounts receivable', type:'range', min:10000, max:1000000, step:10000, def:150000, fmt:money},
    {key:'revenue', label:'Revenue (period)', type:'range', min:100000, max:5000000, step:50000, def:1200000, fmt:money},
    {key:'days', label:'Period', type:'seg', options:[30,90,365], def:365},
  ],
  compute:v=>{ const d=(v.ar/v.revenue)*v.days; return {value:d, text:daysFmt(d), gaugeFrac:d/90}; },
  formula:(v,c)=>`DSO&nbsp;=&nbsp;${money(v.ar)}&nbsp;&divide;&nbsp;${money(v.revenue)}&nbsp;&times;&nbsp;${v.days}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>timelineDiagram([{label:'CASH OWED, UNCOLLECTED', days:c.value, color:'var(--accent)'}], c.value, c.text),
  notes:{
    touchpoint:'How long, on average, invoices sit unpaid after a sale before the cash actually lands.',
    watch:'A rising DSO with flat revenue is usually the first visible sign of a collections problem, months before it hits the P&amp;L.',
    benchmark:'Under 45 days is typical for B2B SaaS on net-30 terms.'
  },
  caption:'The gap between booking the sale and actually holding the cash.'
},
{
  id:'dpo', section:'cash', name:'DPO', sub:'Days Payable Outstanding',
  inputs:[
    {key:'ap', label:'Accounts payable', type:'range', min:10000, max:1000000, step:10000, def:131000, fmt:money},
    {key:'cogs', label:'COGS (period)', type:'range', min:100000, max:5000000, step:50000, def:1200000, fmt:money},
    {key:'days', label:'Period', type:'seg', options:[30,90,365], def:365},
  ],
  compute:v=>{ const d=(v.ap/v.cogs)*v.days; return {value:d, text:daysFmt(d), gaugeFrac:d/90}; },
  formula:(v,c)=>`DPO&nbsp;=&nbsp;${money(v.ap)}&nbsp;&divide;&nbsp;${money(v.cogs)}&nbsp;&times;&nbsp;${v.days}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>timelineDiagram([{label:'SUPPLIER CASH, HELD', days:c.value, color:'var(--accent)'}], c.value, c.text),
  notes:{
    touchpoint:'How long, on average, you sit on supplier invoices before paying them.',
    watch:'Stretching this too far to flatter cash flow damages supplier terms and trust &mdash; it&rsquo;s a lever, not a free lunch.',
    benchmark:'30&ndash;60 days is standard; longer is normal leverage for large, reliable buyers.'
  },
  caption:'Free financing from suppliers, for exactly as many days as you can hold out.'
},
{
  id:'dio', section:'cash', name:'DIO', sub:'Days Inventory Outstanding',
  inputs:[
    {key:'inv', label:'Average inventory', type:'range', min:10000, max:1000000, step:10000, def:100000, fmt:money},
    {key:'cogs', label:'COGS (period)', type:'range', min:100000, max:5000000, step:50000, def:1200000, fmt:money},
    {key:'days', label:'Period', type:'seg', options:[30,90,365], def:365},
  ],
  compute:v=>{ const d=(v.inv/v.cogs)*v.days; return {value:d, text:daysFmt(d), gaugeFrac:d/90}; },
  formula:(v,c)=>`DIO&nbsp;=&nbsp;${money(v.inv)}&nbsp;&divide;&nbsp;${money(v.cogs)}&nbsp;&times;&nbsp;${v.days}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>timelineDiagram([{label:'STOCK, UNSOLD', days:c.value, color:'var(--accent)'}], c.value, c.text),
  notes:{
    touchpoint:'How long, on average, stock sits on the shelf or in the warehouse before it converts to a sale.',
    watch:'Doesn&rsquo;t apply to pure software &mdash; but for anyone holding physical goods, this is usually the biggest lever in the whole cash cycle.',
    benchmark:'Lower is almost always better; the target varies enormously by category.'
  },
  caption:'Cash quietly parked on a shelf, waiting to become a sale.'
},
{
  id:'wc', section:'cash', name:'Working Capital', sub:'Cushion for the Next 12 Months',
  inputs:[
    {key:'assets', label:'Current assets', type:'range', min:100000, max:3000000, step:50000, def:800000, fmt:money},
    {key:'liab', label:'Current liabilities', type:'range', min:100000, max:3000000, step:50000, def:500000, fmt:money},
  ],
  compute:v=>{ const wc=v.assets-v.liab; return {value:wc, text:money(wc), gaugeFrac:(wc+500000)/2000000}; },
  formula:(v,c)=>`WC&nbsp;=&nbsp;${money(v.assets)}&nbsp;-&nbsp;${money(v.liab)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>stockCompare('CURRENT ASSETS', v.assets, 'CURRENT LIABILITIES', v.liab, c.text, Math.max(v.assets,v.liab)),
  notes:{
    touchpoint:'What&rsquo;s left to run the business day-to-day once short-term obligations are covered.',
    watch:'Positive but shrinking working capital, quarter over quarter, is a quieter warning sign than a bad P&amp;L &mdash; and it shows up first.',
    benchmark:'Positive and stable is the baseline expectation outside of the negative-working-capital models below.'
  },
  caption:'The buffer that keeps the lights on between now and the next twelve months.'
},
{
  id:'nwc', section:'cash', name:'Negative Working Capital', sub:'When Owing More Is the Advantage',
  inputs:[
    {key:'assets', label:'Current assets', type:'range', min:100000, max:3000000, step:50000, def:500000, fmt:money},
    {key:'liab', label:'Current liabilities', type:'range', min:100000, max:3000000, step:50000, def:700000, fmt:money},
  ],
  compute:v=>{ const wc=v.assets-v.liab; return {value:wc, text:money(wc), gaugeFrac:(wc+1000000)/1500000}; },
  formula:(v,c)=>`WC&nbsp;=&nbsp;${money(v.assets)}&nbsp;-&nbsp;${money(v.liab)}&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>stockCompare('CURRENT ASSETS', v.assets, 'CURRENT LIABILITIES', v.liab, c.text, Math.max(v.assets,v.liab)),
  notes:{
    touchpoint:'Same formula as working capital &mdash; the business collects from customers before it has to pay suppliers or staff.',
    watch:'Only a strength while the business keeps growing. Growth stalls, and the float that funded you starts working against you.',
    benchmark:'Common and healthy in marketplaces, subscriptions, and prepaid models &mdash; Amazon ran on this for years.'
  },
  caption:'The rare case where owing more than you&rsquo;re owed is the whole point.'
},
{
  id:'float', section:'cash', name:'Deferred Revenue Float', sub:'Cash in Hand, Not Yet Earned',
  inputs:[
    {key:'balance', label:'Deferred revenue balance', type:'range', min:50000, max:3000000, step:50000, def:600000, fmt:money},
    {key:'monthly', label:'Recognized per month', type:'range', min:10000, max:300000, step:10000, def:50000, fmt:money},
  ],
  compute:v=>{ const m=v.balance/v.monthly; return {value:m, text:monthsFmt(m), gaugeFrac:m/24}; },
  formula:(v,c)=>`FLOAT&nbsp;=&nbsp;${money(v.balance)}&nbsp;&divide;&nbsp;${money(v.monthly)}&nbsp;/mo&nbsp;=&nbsp;<span class="res">${c.text}</span>`,
  diagram:(v,c)=>tankDiagram(1, c.text, 'of prepaid cash still unearned', [{frac:1,label:'earned out'}]),
  notes:{
    touchpoint:'Cash already collected &mdash; usually an annual prepay &mdash; sitting on the balance sheet before it&rsquo;s recognized as revenue.',
    watch:'It&rsquo;s a liability, not profit. Spend it as if it&rsquo;s yours before you&rsquo;ve earned it, and a slowdown in bookings turns it into a hole.',
    benchmark:'A growing float relative to revenue is a sign customers trust you enough to pay upfront.'
  },
  caption:'Money in the bank today for a promise you haven&rsquo;t finished keeping yet.'
},

{
  id:'basis', section:'basis', name:'Cash vs Accrual', sub:'Same Dollar, Two Different Stories', noGauge:true,
  inputs:[
    {key:'value', label:'Annual contract value', type:'range', min:1200, max:120000, step:1200, def:12000, fmt:money},
    {key:'term', label:'Contract term', type:'seg', options:[6,12,24], def:12},
  ],
  compute:v=>{ const monthly=v.value/v.term; return {value:monthly, text:money(monthly)+'/mo', monthly}; },
  formula:(v,c)=>`ACCRUAL&nbsp;=&nbsp;${money(v.value)}&nbsp;&divide;&nbsp;${v.term}&nbsp;mo&nbsp;=&nbsp;<span class="res">${c.text}</span>&nbsp;&middot;&nbsp;CASH&nbsp;=&nbsp;<span class="res">${money(v.value)}</span>&nbsp;in month 1`,
  diagram:(v,c)=>{ const n=v.term; const cashRow=Array.from({length:n},(_,i)=>i===0?1:0); const accrualRow=Array.from({length:n},()=>c.monthly); return compareDiagram(n,cashRow,accrualRow); },
  notes:{
    touchpoint:'Cash basis counts money when it moves. Accrual counts it when it&rsquo;s earned or owed &mdash; regardless of when cash changes hands.',
    watch:'A cash-basis P&amp;L can show a fantastic month that&rsquo;s actually one big annual prepay &mdash; and a terrible one right after, for no operational reason.',
    benchmark:'Accrual is required for GAAP reporting and is what investors expect to see past the earliest pre-revenue stage.'
  },
  caption:'The same contract, told two different ways, in the same set of books.'
},
];

/* ================= render engine ================= */
const SEC_COLORS = {unit:'#2f8f79', growth:'#3f5fd6', margins:'#c07a2e', cash:'#6f57c9', basis:'#b14f68'};
const state = {};
METRICS.forEach(m=>{
  state[m.id] = {};
  m.inputs.forEach(inp=>{ state[m.id][inp.key] = inp.def; });
});

function fieldMarkup(cardId, inp){
  const val = state[cardId][inp.key];
  if(inp.type==='seg'){
    return `<div class="field">
      <div class="flabel"><span>${inp.label}</span></div>
      <div class="seg" data-key="${inp.key}">
        ${inp.options.map(o=>`<button data-val="${o}" class="${o===val?'on':''}">${o}d</button>`).join('')}
      </div>
    </div>`;
  }
  return `<div class="field">
    <div class="flabel"><span>${inp.label}</span><b data-readout="${inp.key}">${inp.fmt(val)}</b></div>
    <input type="range" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${val}" data-key="${inp.key}">
  </div>`;
}

function cardMarkup(m, idx, total){
  const dotsOn = idx % 4;
  const dots = Array.from({length:5},(_,i)=>`<i class="${i<=dotsOn%5?'on':''}"></i>`).join('');
  const pills = Array.from({length:4},(_,i)=>`<i class="${i<= (idx%4) ?'on':''}"></i>`).join('');
  return `
  <article class="card sec-${m.section}" id="fig-${m.id}">
    <div class="chead">
      <span class="fig">FIG_${String(idx+1).padStart(3,'0')}</span>
      <div class="dots">${dots}</div>
      <div class="pillrow">
        <span class="catname">${SECTIONS.find(s=>s.id===m.section).name.replace('&amp;','&')}</span>
        <div class="pills">${pills}</div>
      </div>
      <span class="pageno">${String(idx+1).padStart(2,'0')} / ${total}</span>
    </div>
    <div class="ctitle">
      <h3>${m.name}</h3>
      <div class="sub">${m.sub}</div>
    </div>
    <div class="readout">
      <span class="lbl">Live Readout</span>
      <div class="gauge-slot"></div>
    </div>
    <div class="mech"></div>
    <div class="notes">
      <div class="note"><div class="lbl">Touchpoint</div><p>${m.notes.touchpoint}</p></div>
      <div class="note"><div class="lbl">Watch For</div><p>${m.notes.watch}</p></div>
      <div class="note"><div class="lbl">Benchmark</div><p>${m.notes.benchmark}</p></div>
    </div>
    <div class="inputs">${m.inputs.map(inp=>fieldMarkup(m.id, inp)).join('')}</div>
    <div class="formula"><div class="formula-box"></div></div>
    <div class="caption">${m.caption}</div>
  </article>`;
}

function updateCard(m){
  const v = state[m.id];
  const c = m.compute(v);
  const card = document.getElementById('fig-'+m.id);
  if(m.noGauge){
    card.querySelector('.gauge-slot').innerHTML = `<div style="font-family:var(--mono);font-size:11px;color:var(--muted);text-align:left;line-height:1.6">
         <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><i style="width:10px;height:10px;background:var(--accent);display:inline-block"></i>CASH</div>
         <div style="display:flex;align-items:center;gap:8px"><i style="width:10px;height:10px;background:var(--ink-soft);display:inline-block"></i>ACCRUAL</div>
       </div>`;
  } else {
    const parts = c.text.match(/^(-?\$?[\d,]+\.?\d*)(.*)$/) || [null, c.text, ''];
    card.querySelector('.gauge-slot').innerHTML = gaugeMarkup(c.gaugeFrac, parts[1], parts[2].trim());
  }
  card.querySelector('.mech').innerHTML = m.diagram(v,c);
  card.querySelector('.formula-box').innerHTML = m.formula(v,c);
  m.inputs.forEach(inp=>{
    if(inp.type!=='seg'){
      const r = card.querySelector(`[data-readout="${inp.key}"]`);
      if(r) r.textContent = inp.fmt(state[m.id][inp.key]);
    }
  });
}

function wireCard(m){
  const card = document.getElementById('fig-'+m.id);
  card.querySelectorAll('input[type="range"]').forEach(inputEl=>{
    inputEl.addEventListener('input', ()=>{
      state[m.id][inputEl.dataset.key] = parseFloat(inputEl.value);
      updateCard(m);
    });
  });
  card.querySelectorAll('.seg').forEach(segEl=>{
    const key = segEl.dataset.key;
    segEl.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        state[m.id][key] = parseFloat(btn.dataset.val);
        segEl.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b===btn));
        updateCard(m);
      });
    });
  });
}

/* ---- build page ---- */
const sectionsEl = document.getElementById('sections');
const navpills = document.getElementById('navpills');
const heroLegend = document.getElementById('heroLegend');

SECTIONS.forEach((sec,si)=>{
  const items = METRICS.filter(m=>m.section===sec.id);
  const sectionEl = document.createElement('section');
  sectionEl.className = 'section';
  sectionEl.id = sec.id;
  sectionEl.style.setProperty('--accent', SEC_COLORS[sec.id]);
  sectionEl.innerHTML = `
    <div class="wrap">
      <div class="section-head">
        <span class="section-num">&sect;${si+1}</span>
        <h2 class="section-title">${sec.name}</h2>
        <span class="section-blurb">${sec.blurb}</span>
      </div>
      <div class="cards"></div>
    </div>`;
  sectionsEl.appendChild(sectionEl);
  const cardsWrap = sectionEl.querySelector('.cards');
  items.forEach((m)=>{
    const idx = METRICS.indexOf(m);
    cardsWrap.insertAdjacentHTML('beforeend', cardMarkup(m, idx, METRICS.length));
  });

  const pill = document.createElement('a');
  pill.href = '#'+sec.id;
  pill.className = 'navpill';
  pill.style.setProperty('--dot', SEC_COLORS[sec.id]);
  pill.innerHTML = `<i></i>${sec.name.replace('&amp;','&')}`;
  navpills.appendChild(pill);

  const leg = document.createElement('div');
  leg.className = 'legend-item';
  leg.innerHTML = `<span class="legend-swatch" style="--c:${SEC_COLORS[sec.id]}"></span>${sec.name.replace('&amp;','&')}`;
  heroLegend.appendChild(leg);
});

METRICS.forEach(m=>{ updateCard(m); wireCard(m); });