(function (root) {
  'use strict';

  // Rules reviewed 2026-10-04. Sources: CMS MLN006764 (May 2026), AMA 2023 E/M guidelines,
  // CMS ACP FAQ, CY2026 PFS work RVUs. Verify against current licensed CPT and payer policy.
  const levels = ['Straightforward', 'Low', 'Moderate', 'High'];
  const families = {
    initial: { codes: ['99221', '99222', '99223'], times: [40, 55, 75], prolonged: 90 },
    subsequent: { codes: ['99231', '99232', '99233'], times: [25, 35, 50], prolonged: 65 }
  };
  // CY2026 published work RVUs (time-based E/M exempt from the 2026 efficiency adjustment). Verify locally.
  const WRVU = {
    '99221': 1.63, '99222': 2.60, '99223': 3.50, '99231': 1.00, '99232': 1.59, '99233': 2.40,
    '99238': 1.50, '99239': 2.15, '99291': 4.50, '99292': 2.25, '99497': 1.50, '99498': 1.40,
    'G0316': 0.61, '99418': 0.61
  };

  function dataLevel(x) {
    const units = new Set((x.items || []).map(s => s.trim().toLowerCase()).filter(Boolean)).size;
    const categories = [units + (x.historian ? 1 : 0) >= 3, !!x.interpretation, !!x.discussion].filter(Boolean).length;
    return categories >= 2 ? 3 : categories === 1 ? 2 : (units >= 2 || x.historian) ? 1 : 0;
  }

  function supported(note, evidence) {
    return typeof evidence === 'string' && evidence.trim().length >= 8 && note.includes(evidence.trim());
  }

  function timeSupported(note, evidence, minutes) {
    return supported(note, evidence) && Number.isFinite(minutes) && minutes > 0 &&
      new RegExp('\\b' + minutes + '\\s*(minutes|mins?)\\b', 'i').test(evidence);
  }

  function parseClock(s) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return null;
    return +m[1] * 60 + +m[2];
  }

  // Calendar-date logic for overnight admissions (CMS: a continuous service through midnight
  // is reported on the date it started, with all of its time; one hospital E/M per group per date).
  function dateOfService(x) {
    const out = { notes: [], warnings: [] };
    const start = parseClock(x.startTime), end = parseClock(x.endTime);
    if (start == null) {
      if (x.sameGroupSameDate) out.warnings.push('Same-group visit on the same calendar date: only one hospital E/M (initial or subsequent) is payable per group per date. Combine the work into one charge.');
      return out;
    }
    const crosses = end != null && end < start;
    if (crosses && x.continuous) out.notes.push('Continuous service through midnight: report on the start date and apply all qualifying time to that date.');
    if (crosses && !x.continuous) out.warnings.push('Non-continuous work on both sides of midnight is two calendar dates. Do not pool the time; route the second-date work to coder review.');
    if (start < 7 * 60 && x.sameGroupSameDate) out.warnings.push('Admission began after midnight and your group also saw the patient later the same date. Only one hospital E/M per group per date: the day team should add to the single initial service, not bill a separate subsequent visit.');
    else if (x.sameGroupSameDate) out.warnings.push('Same-group visit on the same calendar date: only one hospital E/M per group per date. Combine the work into one charge.');
    if (start >= 18 * 60 && !x.sameGroupSameDate && x.kind === 'initial') out.notes.push('Admission began before midnight: a medically necessary day-team visit after midnight is a different calendar date and may be separately reportable as a subsequent visit.');
    return out;
  }

  // Specific prompts for what would move one element to the target level. Ask only about work done.
  const elementAsk = {
    problems: {
      2: 'Problems → Moderate: is an acute illness with systemic symptoms, an acute complicated injury, an undiagnosed new problem with uncertain prognosis, a chronic illness with exacerbation/progression, or 2+ stable chronic illnesses addressed (assessed and managed, not just listed)?',
      3: 'Problems → High: does the assessment document a severe exacerbation or an acute/chronic illness posing a threat to life or bodily function, with the clinical indicators you used (e.g. lactate, MAP, SpO2/FiO2, troponin trend, Hgb drop)?'
    },
    data: {
      2: 'Data → Moderate: list 3 unique tests/external records reviewed or ordered, OR document your own read of an ECG/image/strip not billed separately, OR an interactive management discussion with an external physician (e.g. the ED physician, consultant from another group) — not a one-way handoff.',
      3: 'Data → High: two of: 3 unique tests/records/historian, independent interpretation, external management discussion. Overnight admissions often already include an ECG/CXR you personally read and an ED or consultant discussion — document them if you did them.'
    },
    risk: {
      2: 'Risk → Moderate: is prescription drug management documented (start/stop/adjust/continue with a stated decision), or a diagnosis/treatment limited by social determinants of health?',
      3: 'Risk → High: did you make and document a decision regarding hospitalization or escalation of care, a DNR/de-escalation decision due to poor prognosis, a decision about emergency surgery, or drug therapy requiring intensive monitoring for toxicity (state the monitoring)? Payer/coder acceptance of the admitting decision varies; document your own reasoning.'
    }
  };

  function gapAnalysis(f, el, mdmIdx, minutes, validTime) {
    const gaps = [];
    const current = mdmIdx; // index into codes, -1 if none
    for (let target = Math.max(current + 1, 0); target < f.codes.length && gaps.length < 2; target++) {
      const need = target + 1; // MDM level required for codes[target]
      const at = Object.entries(el).filter(([, v]) => v >= need).length;
      const below = Object.entries(el).filter(([, v]) => v < need).sort((a, b) => b[1] - a[1]);
      const missing = Math.max(0, 2 - at);
      const asks = need < 2 ? ['Document at least one problem addressed with an assessment, plus a management decision or the data you reviewed.']
        : missing ? below.map(([k]) => elementAsk[k][need]) : [];
      const g = { code: f.codes[target], mdmNeeded: levels[need], elementsShort: missing, asks };
      if (validTime && minutes < f.times[target]) g.timeShort = f.times[target] - minutes;
      if (!validTime) g.timeNote = 'Time path: ' + f.times[target] + ' total minutes on the date of service, if actually spent (includes chart review, ED discussion, family, orders, documentation; excludes separately billed procedures and ACP time).';
      gaps.push(g);
    }
    return gaps;
  }

  // Note-text detectors: flag work that may have been performed but not credited. Never credits anything.
  function detectors(note, x, el, kind) {
    const p = [];
    const has = re => re.test(note);
    if (has(/\b(ECG|EKG|CXR|chest x-?ray|CT|telemetry|rhythm strip)\b/i) && !x.interpretation)
      p.push('Test images/tracings mentioned but no independent interpretation credited. If you personally read the ECG/CXR/CT (not separately billed), document your read (e.g. rhythm, intervals, ST changes; infiltrate/effusion).');
    if (has(/\b(discussed|spoke|called|d\/w)\b[^.]{0,60}\b(ED|ER|emergency|Dr\.?|cardiology|surgery|nephrology|GI|consultant|PCP|intensivist)\b/i) && !x.discussion)
      p.push('A discussion with another clinician appears in the note but is not credited. If it was an interactive exchange about management with an external physician/QHP, document who and what was decided.');
    if (has(/\b(daughter|son|wife|husband|spouse|family|caregiver|EMS|paramedic|nursing home|SNF staff|group home)\b/i) && !x.historian)
      p.push('Collateral source mentioned. If history was obtained from them because the patient could not provide it reliably, document the independent historian and why.');
    if (has(/\b(code status|goals[ -]of[ -]care|GOC|DNR|DNI|POLST|MOLST|advance directive|health care proxy|surrogate)\b/i) && !(Number(x.acpMinutes) > 0))
      p.push('Code status/goals-of-care content found. A substantive, voluntary advance care planning discussion of 16+ minutes (time separate from the E/M) may be reportable as 99497. Confirming "full code" alone is not ACP.');
    if (has(/\b(ICU|step-?down|PCU|escalat|transfer to|upgrade)\b/i) && el.risk < 3)
      p.push('Escalation language found. A documented decision regarding escalation of hospital-level care is a high-risk management element.');
    if (kind === 'initial' && el.risk < 3 && has(/\b(admit|admission|observation|inpatient)\b/i))
      p.push('Admission note: if you independently made the decision to hospitalize (vs. accepting an ED disposition already made), document the decision and its basis — it is a high-risk element per AMA, though coder acceptance varies.');
    if (has(/\b(heparin (drip|infusion|gtt)|insulin (drip|infusion|gtt)|vancomycin|aminoglycoside|gentamicin|tobramycin|nitroprusside|amiodarone (drip|load)|K(Cl)? (rider|replacement) protocol)\b/i))
      p.push('Drug requiring possible intensive toxicity monitoring: credit high risk only when you document the monitoring (e.g. aPTT/anti-Xa q6h, hourly glucose, trough/levels) and that it assesses for adverse effects, not just therapeutic level.');
    if (has(/\b(norepinephrine|levophed|vasopressin|pressors?|BiPAP|NIPPV|high-?flow|HFNC|intubat|shock|lactate\s*[>≥]?\s*[4-9])\b/i) && kind !== 'critical' && !x.laterCritical)
      p.push('Critical-illness markers found. If, after the admission E/M, you personally delivered critical care (organ-support decisions with full attention), it may be separately reportable as 99291 with modifier 25 on the E/M. Do not double-count time.');
    if (has(/\b(sepsis|respiratory failure|encephalopathy|acute kidney injury|AKI|hyponatremia|malnutrition|NSTEMI|demand ischemia)\b/i))
      p.push('Severity diagnoses found. Document the clinical indicators, baseline, acuity, and treatment. Specificity supports your problem-level selection (threat to bodily function) and facility CC/MCC, and reduces denials.');
    if (has(/\b(CHF|heart failure|CKD|anemia|COPD|diabetes|cirrhosis)\b/i))
      p.push('Chronic illness found. Specify type/acuity/stage (e.g. acute on chronic HFrEF; CKD stage) and whether it was addressed today with a management decision; listed-only problems do not count.');
    if (has(/\b(possible|suspected|probable|rule out|r\/o)\b/i))
      p.push('Uncertain diagnoses: professional claims code to the highest certainty (symptoms) — facility uncertain-diagnosis rules do not apply to your claim. Update certainty in later notes.');
    return p;
  }

  function review(x) {
    const note = (x.note || '').trim(), warnings = [], prompts = [], notes = [], addOns = [];
    if (!note) return { candidate: null, warnings: ['Paste a de-identified note first.'], prompts: [], addOns: [], gaps: [], notes: [] };
    const medicare = x.payer === 'medicare';

    const p = supported(note, x.problemEvidence) ? Number(x.problems) : 0;
    const r = supported(note, x.riskEvidence) ? Number(x.risk) : 0;
    const dataEvidence = supported(note, x.dataEvidence);
    const d = dataEvidence ? dataLevel(x) : 0;
    const el = { problems: p, data: d, risk: r };
    const mdm = [p, d, r].sort((a, b) => b - a)[1];
    if (Number(x.problems) > 0 && !p) warnings.push('Problem level not credited: quote supporting text exactly from the note (at least 8 characters).');
    if (Number(x.risk) > 0 && !r) warnings.push('Management risk not credited: add an exact supporting quote.');
    if (((x.items || []).some(s => s.trim()) || x.historian || x.interpretation || x.discussion) && !dataEvidence) warnings.push('Data not credited: add an exact quote documenting the qualifying work.');

    let candidate = null, timeCandidate = null, mdmCandidate = null, gaps = [];
    const minutes = Number(x.minutes);
    const validTime = !!x.timeConfirmed && timeSupported(note, x.timeEvidence, minutes);
    if (x.minutes !== '' && x.minutes != null && !validTime) warnings.push('Time not credited: confirm qualifying time and quote the documented total.');

    const dos = dateOfService(x);
    notes.push(...dos.notes); warnings.push(...dos.warnings);

    const special = x.special || [];
    if (special.length) {
      warnings.push('Coder review required for: ' + special.join(', ') + '. Routine E/M candidate withheld.');
    } else if (x.kind === 'discharge') {
      if (validTime) candidate = minutes > 30 ? '99239' : '99238';
      else warnings.push('Discharge code withheld until total discharge management time is documented.');
    } else if (x.kind === 'critical') {
      warnings.push('Critical care requires acute vital-organ impairment, imminent deterioration, full attention, and nonduplicative qualifying time. ICU location alone does not qualify.');
      candidate = criticalCode(note, x, minutes, validTime, warnings);
    } else if (families[x.kind]) {
      const f = families[x.kind];
      // A blank note checklist cannot substantiate even a low-level service.
      if (supported(note, x.problemEvidence) && (supported(note, x.riskEvidence) || dataEvidence)) mdmCandidate = f.codes[Math.max(0, mdm - 1)];
      if (validTime) for (let i = 0; i < 3; i++) if (minutes >= f.times[i]) timeCandidate = f.codes[i];
      candidate = [mdmCandidate, timeCandidate].filter(Boolean).sort().pop() || null;
      if (!candidate) warnings.push('Insufficient verified evidence for a routine E/M candidate.');
      const idx = candidate ? f.codes.indexOf(candidate) : -1;
      gaps = gapAnalysis(f, el, mdmCandidate ? f.codes.indexOf(mdmCandidate) : -1, minutes, validTime).filter(g => f.codes.indexOf(g.code) > idx);

      // Prolonged services: only when the primary is the top code selected by time.
      if (candidate === f.codes[2] && timeCandidate === f.codes[2]) {
        if (minutes >= f.prolonged) {
          const units = 1 + Math.floor((minutes - f.prolonged) / 15);
          addOns.push({ code: medicare ? 'G0316' : '99418', units, status: 'supported', detail: units + ' unit(s): ' + minutes + ' qualifying minutes on the date of service (threshold ' + f.prolonged + ', +15 per unit). ' + (medicare ? 'Medicare uses G0316, not 99418.' : 'Non-Medicare payers vary; some require G0316 or do not pay prolonged services.') });
        } else if (minutes >= f.prolonged - 15) {
          addOns.push({ code: medicare ? 'G0316' : '99418', units: 0, status: 'not met', detail: (f.prolonged - minutes) + ' more qualifying minutes on this date would reach the prolonged threshold (' + f.prolonged + '). Count only time actually spent.' });
        }
      } else if (validTime && minutes >= f.prolonged && candidate === f.codes[2]) {
        notes.push('Prolonged services require the primary code to be selected by time; this candidate is supported by MDM.');
      }

      // E/M before critical care on the same date (CMS: modifier 25, separate, nonduplicative).
      if (x.laterCritical) {
        const ccMin = Number(x.ccMinutes);
        const ccValid = !!x.criticalConfirmed && timeSupported(note, x.ccTimeEvidence, ccMin);
        const cc = ccValid ? criticalCode(note, x, ccMin, true, warnings) : null;
        if (!ccValid) warnings.push('Same-day critical care withheld: confirm criteria and quote the separate critical care time.');
        if (cc) {
          addOns.push({ code: cc, units: 1, status: 'supported', detail: 'Critical care after the E/M. Append modifier 25 to ' + candidate + '. Document that the E/M was medically necessary, occurred before the patient required critical care, and shares no time or elements with it.' });
          if (validTime && (minutes + ccMin) > 0) notes.push('E/M time (' + minutes + ') and critical care time (' + ccMin + ') must not overlap.');
        }
      }
    } else warnings.push('This encounter type requires coder review.');

    // Advance care planning: separately reportable, time not counted toward E/M.
    const acpMin = Number(x.acpMinutes);
    if (x.acpMinutes !== '' && x.acpMinutes != null && acpMin > 0) {
      const acpValid = !!x.acpConfirmed && timeSupported(note, x.acpEvidence, acpMin);
      const ccSameDay = x.kind === 'critical' || x.laterCritical;
      if (!acpValid) warnings.push('ACP not credited: confirm it was voluntary, separate from E/M time, and quote the documented ACP minutes.');
      else if (ccSameDay) warnings.push('ACP on the same date as critical care: coder review required (CPT restricts reporting ACP with critical care).');
      else if (acpMin < 16) warnings.push('ACP under 16 minutes is not separately reportable; its work stays within the E/M.');
      else {
        addOns.push({ code: '99497', units: 1, status: 'supported', detail: acpMin + ' ACP minutes. Document voluntariness, participants, content (goals, prognosis, code status, surrogate), and outcome.' });
        if (acpMin >= 46) addOns.push({ code: '99498', units: 1 + Math.floor((acpMin - 46) / 30), status: 'supported', detail: 'Each additional 30 minutes beyond the first (threshold 46).' });
        if (validTime) notes.push('Confirm the E/M total (' + minutes + ' min) excludes the ' + acpMin + ' ACP minutes.');
      }
    }

    if (!x.signed) warnings.push('Complete and sign the encounter note.');
    if (!x.chargeCaptured) warnings.push('Verify that a charge reached the billing system; signing a note alone does not prove charge capture.');
    if (!x.interfaceVerified) warnings.push('Verify the active encounter/interface; avoid duplicate manual encounter creation.');
    if (!x.enrollmentVerified) warnings.push('Confirm payer enrollment, effective date, and held/denied claim status with billing. A cosign alone does not establish billing eligibility.');
    if (!x.duplicateChecked) warnings.push('Check same-specialty/group charges for the same calendar date before submitting.');

    prompts.push(...detectors(note, x, el, x.kind));
    prompts.push('Link cause and effect only when supported by your clinical judgment. Add clarification only for work actually performed; never add boilerplate solely to raise a code.');

    const allCodes = [];
    if (candidate) candidate.split(' + ').forEach(c => { const m = /^(\d+) unit\(s\) of (\w+)$/.exec(c); if (m) for (let i = 0; i < +m[1]; i++) allCodes.push(m[2]); else allCodes.push(c); });
    addOns.filter(a => a.status === 'supported').forEach(a => a.code.split(' + ').forEach(c => {
      const m = /^(\d+) unit\(s\) of (\w+)$/.exec(c);
      if (m) for (let i = 0; i < +m[1]; i++) allCodes.push(m[2]); else for (let i = 0; i < (a.units || 1); i++) allCodes.push(c);
    }));
    const wrvu = Math.round(allCodes.reduce((s, c) => s + (WRVU[c] || 0), 0) * 100) / 100;

    return { candidate, mdmCandidate, timeCandidate, mdm: levels[mdm], elements: { problems: levels[p], data: levels[d], risk: levels[r] }, warnings, prompts, addOns, gaps, notes, wrvu, codes: allCodes };
  }

  function criticalCode(note, x, minutes, validTime, warnings) {
    if (x.criticalConfirmed && supported(note, x.criticalEvidence) && validTime && x.payer === 'medicare') {
      if (minutes >= 30) return minutes >= 104 ? '99291 + ' + Math.floor((minutes - 74) / 30) + ' unit(s) of 99292' : '99291';
      warnings.push('Under 30 minutes: 99291 threshold not met. Review an appropriate E/M service.');
      return null;
    }
    warnings.push('Critical care candidate withheld: confirm criteria, exact supporting quote, qualifying time, and Medicare policy. Other payers require separate review.');
    return null;
  }

  // Shift ledger: summarize multiple admissions and flag leakage (no charge, blockers, gaps).
  function shiftSummary(entries) {
    const rows = entries || [];
    const s = { encounters: rows.length, withCandidate: 0, withheld: 0, notCaptured: 0, gapsOpen: 0, wrvu: 0, byCode: {} };
    for (const e of rows) {
      if (e.result.candidate) s.withCandidate++; else s.withheld++;
      if (!e.input.chargeCaptured) s.notCaptured++;
      if ((e.result.gaps || []).length) s.gapsOpen++;
      s.wrvu += e.result.wrvu || 0;
      for (const c of e.result.codes || []) s.byCode[c] = (s.byCode[c] || 0) + 1;
    }
    s.wrvu = Math.round(s.wrvu * 100) / 100;
    return s;
  }

  const api = { review, dataLevel, supported, dateOfService, shiftSummary, WRVU };
  if (typeof module !== 'undefined') module.exports = api; else root.CodingReview = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
