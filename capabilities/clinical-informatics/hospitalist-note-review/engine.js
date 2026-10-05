(function(root){
 'use strict';
 const levels=['Straightforward','Low','Moderate','High'];
 const families={initial:{codes:['99221','99222','99223'],times:[40,55,75]},subsequent:{codes:['99231','99232','99233'],times:[25,35,50]}};
 function dataLevel(x){
  const units=new Set((x.items||[]).map(s=>s.trim().toLowerCase()).filter(Boolean)).size;
  const categories=[units+(x.historian?1:0)>=3,!!x.interpretation,!!x.discussion].filter(Boolean).length;
  return categories>=2?3:categories===1?2:(units>=2||x.historian)?1:0;
 }
 function supported(note,evidence){return typeof evidence==='string'&&evidence.trim().length>=8&&note.includes(evidence.trim());}
 function review(x){
  const note=(x.note||'').trim(),warnings=[],prompts=[];
  if(!note)return {candidate:null,warnings:['Paste a de-identified note first.'],prompts:[]};
  const p=supported(note,x.problemEvidence)?Number(x.problems):0;
  const r=supported(note,x.riskEvidence)?Number(x.risk):0;
  const dataEvidence=supported(note,x.dataEvidence);
  const d=dataEvidence?dataLevel(x):0;
  const mdm=[p,d,r].sort((a,b)=>b-a)[1];
  if(Number(x.problems)>0&&!p)warnings.push('Problem level not credited: quote supporting text exactly from the note (at least 8 characters).');
  if(Number(x.risk)>0&&!r)warnings.push('Management risk not credited: add an exact supporting quote.');
  if(((x.items||[]).some(s=>s.trim())||x.historian||x.interpretation||x.discussion)&&!dataEvidence)warnings.push('Data not credited: add an exact quote documenting the qualifying work.');
  let candidate=null,timeCandidate=null,mdmCandidate=null;
  const minutes=Number(x.minutes),validTime=x.timeConfirmed&&supported(note,x.timeEvidence)&&Number.isFinite(minutes)&&minutes>0&&new RegExp('\\b'+minutes+'\\s*(minutes|min)\\b','i').test(x.timeEvidence);
  if(x.minutes!==''&&x.minutes!=null&&!validTime)warnings.push('Time not credited: confirm qualifying time and quote the documented total.');
  const special=x.special||[];
  if(special.length){warnings.push('Coder review required for: '+special.join(', ')+'. Routine E/M candidate withheld.');}
  else if(x.kind==='discharge'){
   if(validTime)candidate=minutes>30?'99239':'99238';
   else warnings.push('Discharge code withheld until total discharge management time is documented.');
  }else if(x.kind==='critical'){
   warnings.push('Critical care requires acute vital-organ impairment, imminent deterioration, full attention, and nonduplicative qualifying time. ICU location alone does not qualify.');
   if(x.criticalConfirmed&&supported(note,x.criticalEvidence)&&validTime&&x.payer==='medicare'){
    if(minutes>=30)candidate=minutes>=104?'99291 + '+(Math.floor((minutes-74)/30))+' unit(s) of 99292':'99291';
    else warnings.push('Under 30 minutes: 99291 threshold not met. Review an appropriate E/M service.');
   }else warnings.push('Critical care candidate withheld: confirm criteria, exact supporting quote, qualifying time, and Medicare policy. Other payers require separate review.');
  }else if(families[x.kind]){
   const f=families[x.kind];
   // A blank note checklist cannot substantiate even a low-level service.
   if((supported(note,x.problemEvidence)&&Number(x.problems)>=0)&&(supported(note,x.riskEvidence)||dataEvidence))mdmCandidate=f.codes[Math.max(0,mdm-1)];
   if(validTime){for(let i=0;i<3;i++)if(minutes>=f.times[i])timeCandidate=f.codes[i];}
   candidate=[mdmCandidate,timeCandidate].filter(Boolean).sort().pop()||null;
   if(!candidate)warnings.push('Insufficient verified evidence for a routine E/M candidate.');
  }else warnings.push('This encounter type requires coder review.');
  if(!x.signed)warnings.push('Complete and sign the encounter note.');
  if(!x.chargeCaptured)warnings.push('Verify that a charge reached the billing system; signing a note alone does not prove charge capture.');
  if(!x.interfaceVerified)warnings.push('Verify the active encounter/interface; avoid duplicate manual encounter creation.');
  if(!x.enrollmentVerified)warnings.push('Confirm payer enrollment, effective date, and held/denied claim status with billing. A cosign alone does not establish billing eligibility.');
  if(!x.duplicateChecked)warnings.push('Check same-specialty/group charges for the same calendar date before submitting.');
  const patterns=[[/\b(sepsis|respiratory failure|encephalopathy|acute kidney injury|AKI)\b/i,'Document clinical indicators, baseline, acuity, and treatment supporting the diagnosis; resolve conflicting assessments.'],[/\b(CHF|heart failure|CKD|anemia)\b/i,'Clarify clinically established subtype, acuity, stage, or cause where relevant.'],[/\b(possible|suspected|probable|rule out|r\/o)\b/i,'Update diagnostic certainty at discharge. Facility inpatient uncertain-diagnosis rules do not automatically apply to physician professional claims or observation.'],[/\b(reviewed|CT|ECG|EKG|consult)\b/i,'Distinguish report review from independent interpretation and a consult order from an actual external management discussion.'],[/\b(vancomycin|heparin|insulin)\b/i,'Do not assume high risk from a medication name. Specify any intensive toxicity monitoring and why it qualifies.']];
  for(const [re,msg]of patterns)if(re.test(note))prompts.push(msg);
  prompts.push('Link cause and effect only when supported by your clinical judgment. Add clarification only for work actually performed; never add boilerplate solely to raise a code.');
  return {candidate,mdmCandidate,timeCandidate,mdm:levels[mdm],elements:{problems:levels[p],data:levels[d],risk:levels[r]},warnings,prompts};
 }
 if(typeof module!=='undefined')module.exports={review,dataLevel,supported};else root.CodingReview={review,dataLevel,supported};
})(typeof globalThis!=='undefined'?globalThis:this);
