import {compareCareerPaths, decisionSensitivity, solveThreshold, modelVersion} from './decision-engine.js?v=20260920-decisions';

const money = n => Number.isFinite(n) ? n.toLocaleString('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}) : 'Not found in tested range';
const $ = id => document.getElementById(id);
let latest = null;
export function mountDecisionTools({capture, restore}) {
  const section = document.createElement('section');
  section.className = 'card decision-tools'; section.id = 'careerDecisions';
  section.innerHTML = `
    <h2>Compare career decisions</h2>
    <p>Use the pay inputs below for three paths on the same timeline. Positive differences favor staying. All amounts use constant 2026 dollars.</p>
    <details><summary>Career, workload, and tax assumptions</summary>
      <div class="decision-fields">
        <label>Shared comparison period (years)<input id="comparisonYears" type="number" min="1" max="60" step="1" value="25"></label>
        <label>Stop civilian work at age<input id="workUntilAge" type="number" min="18" max="100" value="65"></label>
        <label>Verified minimum additional service (years)<input id="minimumServiceYears" type="number" min="0" max="30" value="0"></label>
        <label>Current annual High-3, if retiring now ($)<input id="high3Now" type="number" min="0" value="0"><small>0 uses an estimate from current grade and pay longevity; enter your actual High-3 if already eligible.</small></label>
        <label>Civilian job type<select id="civilianJobType"><option>Outpatient practice</option><option>Hospitalist</option><option>Locums / PRN</option><option>Other</option></select></label>
        <label>Employment arrangement<select id="employmentType"><option value="w2">W-2 employee</option><option value="1099">1099 — use manual total-tax estimates</option></select></label>
        <label>Navy hours worked per year<input id="navyHours" type="number" min="1" max="8760" value="2400"></label>
        <label>Civilian hours worked per year<input id="civilianHours" type="number" min="1" max="8760" value="2080"></label>
        <label>Salary evidence<select id="salaryEvidence"><option value="published">Published benchmark</option><option value="local">Verified local estimate</option><option value="offer">Actual offer</option><option value="assumption">Personal assumption</option></select></label>
        <label>Salary source / offer date<input id="salarySourceDate" type="date"></label>
        <label>Annual tax calculation<select id="annualTaxMode"><option value="sample">Recalculate 2026 sample schedules each year</option><option value="manual">My first-year taxes + marginal rates on changes</option></select></label>
        <label>Manual tax rate on Navy pay changes (%)<input id="navyGrowthTax" type="number" min="0" max="60" value="30"></label>
      </div>
      <p>Annual hours include clinical work, administration, and call actually worked. Changing hours changes hourly comparisons, not the entered annual salary. For 1099 work, enter net compensation after business expenses and manual total taxes including self-employment tax; do not add an employer retirement match you fund yourself.</p>
      <p>Sample tax schedules omit spouse income, credits, deferrals, and special military residency rules. They remain in 2026 real dollars. Select the applicable Navy tax state or a verified custom rate below. Pension tax uses the separate flat-rate assumption.</p>
    </details>
    <p id="decisionError" role="alert"></p>
    <div id="decisionResults" aria-live="polite"></div>
    <details><summary>What changes the decision?</summary><div id="decisionSensitivity"></div></details>
    <details><summary>Year-by-year career cash flows</summary><div id="careerRows" class="tablewrap"></div></details>
    <details><summary>Save, compare, or export scenarios</summary>
      <p>Saved scenarios stay in this browser. Exports contain assumptions and results, not LES files. Use a generic scenario name.</p>
      <label>Scenario name<input id="scenarioName" maxlength="80" value="My comparison"></label>
      <div class="decision-actions"><button id="saveScenario" type="button">Save here</button><select id="savedScenario" aria-label="Saved scenario"></select><button id="loadScenario" type="button">Load</button><button id="compareScenario" type="button">Compare with current</button><button id="removeScenario" type="button">Remove saved</button><button id="exportScenario" type="button">Download JSON</button><button id="exportCareerCsv" type="button">Download cash-flow CSV</button><label>Import JSON<input id="importScenario" type="file" accept=".json,application/json"></label></div>
      <p id="scenarioStatus" role="status"></p><div id="savedComparison"></div>
    </details>
    <p class="hint">Pension values include the full modeled payment period, including any payments after the shared work-comparison endpoint; those later values are listed separately. Reserve pension inputs apply only to leaving now before 20 active years. Other pre-20 separation paths exclude Reserve service. Reserve drill pay, investment returns, survivor benefits, and post-service health changes are not modeled. Career paths pay tail once in the final civilian work year, if it falls within the shared period. The entered total GI Bill value is spread across each stay path’s service years, conditional on eligibility and completing that path; verify any transfer obligation. The shorter two-path view below retains its annualized tail convention.</p>`;
  document.querySelector('main').prepend(section);
  const key = 'physician-pay-lab-scenarios-v1';
  function saved() { try { const data=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(data)?data:[]; } catch { return []; } }
  function choices() { $('savedScenario').replaceChildren(...saved().map((s,i)=>new Option(s.name,String(i)))); }
  function status(text) { $('scenarioStatus').textContent=text; }
  function snapshot() { if(!latest)throw Error('Complete valid inputs first.'); return {schemaVersion:1,modelVersion,createdAt:new Date().toISOString(),name:$('scenarioName').value.trim()||'Comparison',inputs:capture(),results:latest}; }
  function download(content,name,type) { const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function checkedSnapshot(value) { if(!value||value.schemaVersion!==1||value.modelVersion!==modelVersion||!value.inputs?.fields||typeof value.inputs.fields!=='object')throw Error('Unsupported scenario version or missing inputs.');return value; }
  $('saveScenario').onclick=()=>{try{const all=saved();all.push(snapshot());localStorage.setItem(key,JSON.stringify(all.slice(-20)));choices();status('Saved in this browser.');}catch(e){status(e.message)}};
  $('loadScenario').onclick=()=>{try{const s=checkedSnapshot(saved()[Number($('savedScenario').value)]);restore(s.inputs);status('Loaded '+s.name+'. Results recalculated using this model version.');}catch(e){status(e.message)}};
  $('removeScenario').onclick=()=>{try{const all=saved();all.splice(Number($('savedScenario').value),1);localStorage.setItem(key,JSON.stringify(all));choices();status('Saved copy removed.');}catch(e){status(e.message)}};
  $('compareScenario').onclick=()=>{try{const previous=checkedSnapshot(saved()[Number($('savedScenario').value)]);if(!latest)throw Error('Complete valid current inputs first.');const box=$('savedComparison');box.replaceChildren();const heading=document.createElement('p');heading.textContent='Current minus saved: '+previous.name;box.append(heading);for(let i=0;i<latest.paths.length;i++){const p=document.createElement('p');p.textContent=latest.paths[i].name+': '+money(latest.paths[i].totalPV-previous.results.paths[i].totalPV);box.append(p)}const note=document.createElement('p');note.textContent='Saved results are a dated snapshot. Compare like horizons and assumptions; load the saved scenario to inspect its inputs.';box.append(note);}catch(e){status(e.message)}};
  $('exportScenario').onclick=()=>{try{download(JSON.stringify(snapshot(),null,2),'opportunity-cost-scenario.json','application/json');status('Downloaded assumptions, source links, model version, and results.');}catch(e){status(e.message)}};
  $('exportCareerCsv').onclick=()=>{if(!latest){status('Complete valid inputs first.');return}const rows=[['Model version','Path','Year','Stage','After-tax work cash','Benefits / education','Pension cash','Total take-home','Cash per hour']];for(const path of latest.paths)for(const row of path.rows)rows.push([modelVersion,path.name,row.year,row.stage,row.cash,row.benefits,row.pensionCash,row.takeHome,row.hourlyCash??'']);download(rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n'),'opportunity-cost-career-cash-flows.csv','text/csv');};
  $('importScenario').onchange=async()=>{try{const file=$('importScenario').files[0];if(!file)return;if(file.size>2000000)throw Error('Scenario file exceeds 2 MB.');const s=checkedSnapshot(JSON.parse(await file.text()));restore(s.inputs);status('Imported '+s.name+' and recalculated.');}catch(e){status(e.message)}finally{$('importScenario').value=''}};
  choices();
}

export function readDecisionControls() {
  const number = id => {const value=Number($(id).value);if($(id).value.trim()===''||!Number.isFinite(value)||!$(id).checkValidity())throw Error('Check '+$(id).closest('label').firstChild.textContent.trim()+'.');return value;};
  if($('employmentType').value==='1099'&&$('annualTaxMode').value!=='manual')throw Error('For 1099 work, choose manual annual taxes and enter total income/self-employment taxes below.');
  return {comparisonYears:number('comparisonYears'),workUntilAge:number('workUntilAge'),minimumServiceYears:number('minimumServiceYears'),high3Now:number('high3Now'),navyHours:number('navyHours'),civilianHours:number('civilianHours'),navyGrowthTax:number('navyGrowthTax')/100};
}

export function clearDecisionResults(message='Complete valid inputs to compare paths.') {
  latest=null;$('decisionError').textContent=message;for(const id of ['decisionResults','decisionSensitivity','careerRows','savedComparison'])$(id).replaceChildren();
}
export function renderDecisionResults(input, metadata) {
  try {
    const paths=compareCareerPaths(input), sensitivity=decisionSensitivity(input);
    const salaryThreshold=solveThreshold(salary=>compareCareerPaths({...input,civilianSalary:salary})[1].advantageVsLeave);
    const bonusThreshold=input.rbRemaining>0?solveThreshold(bonus=>compareCareerPaths({...input,currentBonus:bonus})[1].advantageVsLeave,0,500000):null;
    const feasible=paths.filter(p=>p.feasible), best=feasible.reduce((a,b)=>!a||b.totalPV>a.totalPV?b:a,null);
    $('decisionError').textContent='';
    const result=$('decisionResults');result.replaceChildren();
    const intro=document.createElement('p');intro.textContent=best?'Highest modeled financial value among feasible paths: '+best.name+'. This is conditional on your assumptions.':'No path meets the entered minimum service requirement.';result.append(intro);
    const wrap=document.createElement('div');wrap.className='tablewrap';const table=document.createElement('table');
    table.innerHTML='<thead><tr><th>Path</th><th>Work cash + benefits PV</th><th>Full pension PV</th><th>Total modeled value</th><th>Advantage vs leaving now</th></tr></thead>';const body=document.createElement('tbody');
    for(const p of paths){const row=document.createElement('tr');for(const value of [p.name+(p.feasible?'':' — below service requirement'),money(p.workPV),money(p.pensionPV),money(p.totalPV),money(p.advantageVsLeave)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell)}body.append(row)}table.append(body);wrap.append(table);result.append(wrap);
    const thresholds=document.createElement('p');thresholds.textContent='Break-even civilian starting salary: '+money(salaryThreshold)+'. '+(input.rbRemaining>0?'Break-even annual retention bonus over '+input.rbRemaining+' eligible payment years: '+money(bonusThreshold)+'.':'Select a verified bonus term to calculate a bonus threshold.');result.append(thresholds);
    const note=document.createElement('p');note.textContent='Thresholds compare leaving now with the selected service period through '+(2026+input.comparisonYears)+'. Search limits: $0–$2 million salary and $0–$500,000 annual bonus. No crossing means neither bound changes the result; it does not mean $0. '+(!paths[0].feasible?'Leaving now is hypothetical because of the entered service requirement.':'');result.append(note);
    const pensionNote=document.createElement('p');pensionNote.textContent='Pension value attributable to payments beyond '+(2026+input.comparisonYears)+': '+paths.map(p=>p.name+' '+money(p.pensionBeyondHorizonPV)).join('; ')+'.';result.append(pensionNote);
    const hourly=document.createElement('p');hourly.textContent='Year 1 after-tax work cash per hour: Navy '+money(calculateNavyHourly(input))+'; civilian '+money(paths[0].rows[0].hourlyCash)+'. Employer retirement contributions and pension are excluded.';result.append(hourly);
    const sens=$('decisionSensitivity');sens.replaceChildren();const scale=Math.max(1,...sensitivity.flatMap(s=>[Math.abs(s.low),Math.abs(s.high)]));
    for(const s of sensitivity){const group=document.createElement('div');group.className='sensitivity-row';const label=document.createElement('p');label.textContent=s.label+': '+money(s.low)+' / '+money(s.high)+' advantage for staying';group.append(label);for(const [name,value] of [['Low assumption',s.low],['High assumption',s.high]]){const bar=document.createElement('div');bar.className='sensitivity-bar '+(value<0?'civilian':'navy');bar.style.width=(Math.abs(value)/scale*100)+'%';bar.title=name+': '+money(value);bar.setAttribute('aria-label',bar.title);group.append(bar)}sens.append(group)}const hoursNote=document.createElement('p');hoursNote.textContent='Hours sensitivity: 20% more civilian hours reduces cash per hour to '+money(paths[0].rows[0].hourlyCash/1.2)+'; 20% fewer increases it to '+money(paths[0].rows[0].hourlyCash/.8)+'. Annual salary is held fixed. These are assumption tests, not probabilities.';sens.append(hoursNote);
    const rowTable=document.createElement('table');rowTable.innerHTML='<thead><tr><th>Path / year</th><th>Stage</th><th>Work cash after tax/costs</th><th>Benefits / education</th><th>Pension cash</th><th>Total take-home</th></tr></thead>';const rowBody=document.createElement('tbody');for(const p of paths)for(const r of p.rows){const tr=document.createElement('tr');for(const value of [p.name+' / '+r.year,r.stage,money(r.cash),money(r.benefits),money(r.pensionCash),money(r.takeHome)]){const td=document.createElement('td');td.textContent=value;tr.append(td)}rowBody.append(tr)}rowTable.append(rowBody);$('careerRows').replaceChildren(rowTable);
    latest={metadata,paths,sensitivity,salaryThreshold,bonusThreshold};
  } catch(error) {clearDecisionResults(error.message)}
}
function calculateNavyHourly(input) {const p=compareCareerPaths({...input,years:Math.max(1,input.years)});return p[1].rows[0].hourlyCash;}
