const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, PageOrientation, Footer, PageNumber, BorderStyle, ShadingType } = require('docx');

const F = 'Times New Roman';
const SZ = 24;
const LINE = 360; // 1.5 spacing
const p = (text, opts = {}) => new Paragraph({
  spacing: { line: LINE, after: 120 },
  alignment: opts.align,
  children: (Array.isArray(text) ? text : [text]).map(t =>
    typeof t === 'string' ? new TextRun({ text: t, font: F, size: SZ }) : t),
});
const it = (t) => new TextRun({ text: t, font: F, size: SZ, italics: true });
const h = (text) => new Paragraph({
  spacing: { line: LINE, before: 120, after: 60 }, keepNext: true,
  children: [new TextRun({ text, font: F, size: SZ, bold: true })],
});
const blank = () => new Paragraph({ children: [] });
const center = (text, opts = {}) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { line: LINE, after: opts.after ?? 240 },
  children: [new TextRun({ text, font: F, size: opts.size ?? SZ, bold: opts.bold })],
});
const ref = (parts) => new Paragraph({
  spacing: { line: LINE, after: 60 }, indent: { left: 720, hanging: 720 },
  children: parts.map(t => typeof t === 'string' ? new TextRun({ text: t, font: F, size: SZ }) : t),
});

const letter = { width: 12240, height: 15840 };
const margin = { top: 1440, bottom: 1440, left: 1440, right: 1440 };
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ children: [PageNumber.CURRENT], font: F, size: SZ })] })] });

// ---------- Title page ----------
const title = [
  blank(), blank(), blank(),
  center('The Financial Opportunity Cost of Continued Navy Service', { bold: true, size: 28, after: 0 }),
  center('for Primary-Care Physicians: A General-Internist Case', { bold: true, size: 28, after: 1200 }),
  center('James M. Day'),
  center('September 19, 2026'),
  center('BUS 620 - Micro and Macro Economics'),
  center('Individual Research Paper - A Global Challenge, Analyzed'),
];

// ---------- Body ----------
const body = [
  h('Purpose and Economic Framework'),
  p('The U.S. Navy Medical Corps must understand the alternatives physicians face when deciding whether to remain after their initial obligation. Using a board-certified general internist in San Diego, this paper asks: How much financial compensation does a physician forgo by remaining in the Navy for four more years rather than accepting a feasible civilian position? General internal medicine serves as the primary-care case because it is a core Navy primary-care specialty with a published local civilian benchmark; family medicine and other primary-care fields pay differently, so the results should not be generalized to them without separate estimates. The U.S. Government Accountability Office (GAO, 2020) found that maximum military cash compensation trailed civilian medians in 21 of 27 medical and dental specialties reviewed and recommended better wage, bonus, and replacement-cost data. Those findings motivate this case study but do not prove a current Navy primary-care pay gap.'),
  p('The question also has a macroeconomic dimension. Military physician pay is set administratively through statute and Department of Defense pay tables, while civilian pay adjusts to national and regional supply and demand for physicians. When civilian primary-care wages rise faster than administered military pay, the retention gap widens without any change in Navy policy. Location magnifies this: Marit Health (2026) reports that the San Diego internist average exceeds the California average by about 27% and the national average by about 40%, so the Navy competes for physicians in some of its highest-wage labor markets.'),
  p('Opportunity cost is the value of the best forgone alternative: here, the civilian compensation stream a physician gives up by staying. The analysis reports the net cash cost of staying, defined as the present value of that civilian stream minus Navy cash compensation over the same period. Prior medical-school support is sunk; future pay, obligations, retirement accrual, and working conditions remain relevant (Frank et al., 2022). Mission, leadership, teaching, operational medicine, assignment control, workload, and family stability may also create compensating wage differentials. Therefore, the cash gap is not a complete valuation of either career and does not identify the bonus required for retention.'),

  h('Method'),
  p('The base case is an O-4 general internist just past 10 active-service years, with dependents, assigned to ZIP code 92134. The horizon is 2027-2030 in constant 2026 dollars. Rank remains O-4; basic pay advances from the over-10 to the over-12 rate. The analysis uses a 5% real discount rate and year-end payments. The civilian comparator is Marit Health\'s published San Diego internist all-employer average of $459,057 in total compensation (average base of $445,914 plus average bonus of $13,142), held constant in real terms (Marit Health, 2026). Marit builds its averages from self-reported, NPI-verified submissions after removing outliers and applying de-biasing adjustments. The figure is a mean rather than a median, so a few high earners can pull it upward, and it rests on a small number of local submissions. Its academic and non-academic averages ($250,000 and $471,727) also show wide dispersion by employer type. Because this is a mixed-employer, self-reported benchmark rather than a matched offer, the result remains conditional on its comparability.'),

  h('Compensation Inputs'),
  p('Appendix A, Table 1 itemizes Navy cash pay and the conditional retention bonus. Each annual gap is discounted as (civilian cash − Navy cash)/(1.05)^t, where t = 1, 2, 3, 4. The results therefore compare gross cash only; taxes, health coverage, retirement contributions, and other benefits are addressed under Direction of Bias below.'),

  h('Career-Stage Horizon and Pension'),
  p('The four-year window is not the decision a physician at 10 years of service actually faces. The realistic alternatives are separating now or remaining to the 20-year active-duty retirement threshold, and the base case ends at 14 years, the point at which staying looks least valuable because no pension has vested. The pension also needs its own discount rate. Blended Retirement System (BRS) retired pay is adjusted annually for inflation and backed by the federal government, so its risk resembles an inflation-protected Treasury security more than uncertain civilian earnings (Schofer, 2016). Treasury real yields on September 28, 2026, were 3.14% at 20 years and 3.28% at 30 years (U.S. Department of the Treasury, 2026), so the pension is discounted at 3% real while cash pay remains at 5%. For illustration, assuming a $120,000 High-3 basic-pay base, 30 constant real payments, and a 3% pension rate, a $48,000 BRS pension has a conditional present value of about $700,000 at 10 years, $887,000 at 18 years, and $913,000 at 19 years (Department of Defense, n.d.); at 5%, the same values would be about $453,000, $669,000, and $703,000. A physician who separates at 10 years forfeits that value entirely. These figures cannot simply be subtracted from the four-year cash gap because the horizons differ, but they show that the four-year gap overstates the net cost of staying for anyone who expects to reach 20 years. A complete comparison therefore sets the pension against the full remaining cash gap to 20 years.'),
  p('Figure 1, Panel A makes that comparison at every service year from 10 to 19. At each year, it sets the present value of the pension preserved by staying to 20 against the present value of the civilian cash still to be forgone before 20, holding Navy gross cash at $282,585 and civilian pay at $459,057 in every remaining year. At 10 years, the ten-year remaining cash gap has a present value of about $1,363,000, against a pension worth about $700,000, so staying to 20 carries a net cash cost of about $663,000 (Appendix A, Table 2). Each additional year of service removes one year of forgone civilian pay from the remaining gap and brings the pension one year closer; because the same pension is discounted over fewer years, its present value rises even though the benefit itself does not change. The two lines cross at about 14.7 years, after which staying to 20 dominates on cash terms; by 19 years, the net value of staying is about $745,000. Discounting the pension at 5% instead would move the break-even to about 16.1 years and raise the net cost at 10 years to about $910,000, so the discount-rate choice is the single most influential pension assumption.'),
  p('This pattern is the option value of staying: the pension exerts little pull at mid-career and a strong pull near eligibility. For retention policy, it implies that cash incentives matter most between roughly 10 and 15 years of service, before the pension begins to hold physicians in place, and matter much less afterward. Promotion to O-5 would raise both cash pay and the pension: an O-5 High-3 of about $139,000 (the average of 2026 O-5 basic pay at 16 and 18 years of service) yields a $55,700 BRS pension and, with cash pay unchanged, cuts the net cost of staying at 10 years to about $550,000. Promotion and the tax effects described under Direction of Bias would each shift the break-even point earlier, while the chance of separating before 20 for other reasons would lower the pension\'s expected value and shift it later. Panel A counts gross cash only; mission, deployments, assignment control, and family stability lie outside it and can push an individual decision in either direction.'),

  h('Results'),
  p('Appendix A, Table 1 lists the annual inputs. The base case produces an undiscounted cash gap in constant 2026 dollars of $717,126 and a present-value gap of approximately $636,209. At 3%, the present-value gap is $666,715; at 7%, it is $607,907. Without the assumed $48,000 retention agreement, the four-year present-value gap rises by approximately $170,206. These estimates compare compensation streams; they do not predict separation. Dahle (2021) illustrates substantial within-specialty pay variation; his examples do not establish the distribution of San Diego internist offers. Illustrative annual civilian salaries of $350,000 and $400,000 reduce the four-year present-value gap to about $249,500 and $426,800, respectively (undiscounted: about $280,900 and $480,900). These are sensitivity assumptions, not verified offers. A smaller matched gap makes other benefits more consequential; a larger gap strengthens the case for compensation changes.'),

  h('Direction of Bias'),
  p('Most of the items the model omits make the gross-cash gap larger than an after-tax, total-compensation comparison would show. First, BAH and BAS, $64,926 per year in this case, are excluded from federal income tax (Internal Revenue Service, 2025); at a 22% to 24% marginal rate, the exclusion is worth roughly $14,000 to $16,000 per year. Second, a servicemember keeps a legal residence for state tax purposes when assigned elsewhere (50 U.S.C. § 4001), so a Navy physician domiciled in a state without an income tax owes no California tax, whereas a civilian internist in San Diego would. At the benchmark salary, California tax for a married couple filing jointly is roughly $34,000 per year before credits (California Franchise Tax Board, 2025). Third, holding rank at O-4 through 14 years understates Navy pay, because many physicians are promoted to O-5 in that window. Fourth, TRICARE family coverage during service and after retirement, including TRICARE for Life as a Medicare supplement after age 65, and BRS matching contributions of up to 5% of basic pay are excluded; for a family whose retiree works a civilian job with employer coverage, TRICARE retiree coverage replaces the average worker premium share of $6,850 (KFF, 2025) for a 2026 TRICARE Prime retiree family enrollment fee of $765 (TRICARE, 2026), a value of about $6,100 per year until Medicare eligibility. Fifth, the Navy pays BRS continuation pay once, at the 12th year of service, equal to 2.5 months of basic pay in exchange for four more years of obligated service (Schuett, 2020). For this officer it would add about $23,550 in 2028 and reduce the four-year present-value gap by about $21,400.'),
  p('Some omissions run the other way. Civilian employers often pay malpractice premiums, contribute to retirement plans, and offer signing bonuses, none of which are in the civilian figure. The next section quantifies the net effect of these adjustments.'),
  p('Several further variables fall outside the cash model. A new civilian position may pay less while a patient panel or productivity builds; a first year at 80% of full pay would reduce the four-year present-value gap by about $87,400. Leaving also brings moving, licensure, and credentialing costs. Military disability benefits replace only basic pay, and Servicemembers\' Group Life Insurance ends at separation, so a departing physician must buy own-occupation disability and term life coverage, which costs more with age and after conditions found at a separation physical (Borgia & Unger, 2025). Department of Veterans Affairs disability compensation is tax-free, and a retiree rated at least 50% disabled can receive it concurrently with full retired pay (Defense Finance and Accounting Service, n.d.), so the pension\'s value can differ with an individual\'s rating. The Survivor Benefit Plan trades a premium for an annuity to a surviving spouse. Finally, the model assumes identical civilian earnings after 20 years on both paths; physicians who spend late careers in administrative roles may find clinical re-entry harder, while those who leave earlier gain more years of peak civilian earnings (Morgan, 2013). Practitioner accounts are consistent with this paper\'s estimate: a military physician writing for The White Coat Investor places the typical financial break-even at 15 to 16 years of service (Bork, 2021), close to the gross-cash estimate of 14.7 years in Figure 1, Panel A.'),

  h('After-Tax and Total-Compensation Check'),
  p('To test how far the adjustments above move the result, the ten-year comparison at 10 years of service was rerun in the companion calculator (Day, 2026) on an after-tax, total-compensation basis, keeping the paper\'s O-4 rank, San Diego duty station, $459,057 civilian benchmark, retention bonus in every year, and pension discount rate of 3% real. The rerun applies 2026 federal and California income and payroll taxes to both paths and excludes BAH and BAS from Navy taxable income. It adds BRS matching contributions on the Navy path and, on the civilian path, an average employer retirement contribution of 4.6% of pay (Vanguard data reported by NAPA Net, 2025), the average worker health premium, and own-occupation disability insurance at 3% of salary (The White Coat Investor, n.d.). The pension is taxed at the federal bracket it would fall in while the retiree works as a civilian physician, 32% in this case.'),
  p('Figure 2 and Appendix A, Table 3 report the results. The gross-cash net cost of staying of about $663,000 falls to about $56,000 after taxes and benefits, because the civilian salary advantage is taxed at high marginal rates while much of Navy pay is not. Adding average retiree TRICARE value makes staying roughly break-even, and keeping a legal residence in a state without an income tax makes staying worth about $101,000 more than leaving; continuation pay adds a further $16,000. A 5% civilian pay reduction after 20 years, reflecting the seniority a physician who leaves earlier accumulates, lowers that advantage to about $31,000. Figure 1, Panel B repeats the break-even on the after-tax basis before these final adjustments: the crossing moves from about 14.7 years to about 10.9 years. On an after-tax basis, therefore, the financial case for leaving at 10 years largely disappears for this internist even at a San Diego salary, and the decision turns on tax residence, benefits, and nonfinancial factors. The calculator also shows that the conclusion is specialty-specific: at national average salaries, higher-paid specialties such as cardiology and orthopedic surgery still favor leaving at 10 years.'),

  h('Policy Implications'),
  p('The Navy should test a limited communication pilot alongside, not in place of, bonus advocacy. The case for communication rests on a specific, testable claim: mid-career physicians may underweight the conditional pension, tax-free allowances, and state-tax treatment when comparing offers, because civilian recruiters quote gross salary. If so, accurate total-compensation information is a low-cost intervention. If not, communication will not move retention, and pay or working conditions must carry the burden. Changing authorized bonus rates requires a formal pay-policy and funding process, so a communication effort can start sooner through existing channels. Its value would be correcting misunderstandings about real, accessible opportunities and existing compensation, not substituting advertising for inadequate pay.'),
  p('A proposed design would enroll physicians whose obligations end within 12 months and randomly assign commands to enhanced communication or standard information, balancing specialty and years of service. Measure awareness at baseline and six months, agreement acceptance over 12 months, and actual retention through 24 months, accounting for communication spillover. Because only a limited number of internists reach the end of an obligation in any 12-month window, the pilot should pool specialties or run across several annual cohorts; a single-specialty, single-year trial would likely be underpowered to detect a meaningful retention effect. If awareness improves without a meaningful retention gain at acceptable cost, stop expansion and prioritize compensation or working conditions. Inconclusive results require more evidence, not a claim of success.'),

  h('Additional Options'),
  p('Team-based staffing could shift appropriate work toward nurse practitioners and physician assistants while preserving physician capacity for complex care and readiness. VA evidence supports feasibility in selected populations but not one-for-one Navy substitution (Liu et al., 2020; Morgan et al., 2019). The Navy should also address workload, administrative burden, leadership support, deployment, and work-life concerns associated with burnout and turnover-related outcomes (Vie et al., 2024; Wilk et al., 2023).'),

  h('Limitations'),
  p('The model uses one rank, location, and civilian benchmark, and that benchmark is a self-reported mean drawn from a small local sample. It assumes bonus eligibility; the gross-cash figures exclude taxes, health coverage, and retirement contributions, which the after-tax check adds using averages rather than individual data, and it does not model malpractice costs, moonlighting constraints, or probability-adjusted pension value. Continuation pay, a civilian pay ramp-up, transition costs, and private insurance premiums are inputs in the companion lab but are excluded from the paper\'s base case. It does not estimate Navy attrition, replacement costs, retention elasticity, or readiness losses. The ten-year comparison in Figure 1 holds Navy pay and rank constant, treats reaching 20 years as certain, and depends heavily on the pension discount rate, which is set from market real yields on a single date. The gross-cash comparison also assumes identical civilian pay after 20 years on both paths; the after-tax check shows that a modest post-retirement pay reduction materially lowers the value of staying. Future analysis should add promotion, the probability of reaching retirement eligibility, and specialty-specific post-20 earnings, and should compare matched career paths by specialty and service stage.'),

  h('Conclusion'),
  p('For the modeled O-4 internist, the four-year present-value gross-cash gap is approximately $636,209 at 5%. That figure likely overstates the real cost of staying: it excludes tax advantages and promotion, and it ends before the pension that a physician at 10 years of service preserves by remaining to 20. Measured over the ten years to retirement eligibility, and valuing the inflation-protected pension at a 3% real rate, staying to 20 still carries a net gross-cash cost of about $663,000 at 10 years of service, but that cost shrinks each year and reverses at about 14.7 years as the pension approaches. After taxes and benefits, however, the comparison is close: staying is roughly break-even to about $100,000 ahead, depending on tax residence and post-retirement earnings. The size and even the sign of the opportunity cost therefore depend more on taxes, benefits, and specialty than the gross-cash figures suggest. The Navy should test targeted total-compensation communication alongside bonus advocacy, evaluate bonuses by marginal retention effect, improve working conditions, and collect better career-stage data.'),
];

// ---------- Figure (landscape) ----------
const figure = [
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Figure 1. Stay-to-20 break-even by years of service, gross cash and after taxes', font: F, size: SZ, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync('figure1.png'), transformation: { width: 830, height: 483 } })] }),
  new Paragraph({ spacing: { before: 120, line: LINE }, children: [new TextRun({ text: 'Each point is the present value, at that year of service, of the pension kept by staying to 20 and of the civilian advantage still to be given up before 20. Panel A uses gross cash and an untaxed pension (Appendix A, Table 2). Panel B applies federal and California taxes and benefits (Appendix A, Table 3, row 2). Illustrative; conditional on reaching 20 years.', font: F, size: SZ })] }),
  new Paragraph({ pageBreakBefore: true, spacing: { after: 120 }, children: [new TextRun({ text: 'Figure 2. From gross cash to after-tax total compensation: net value of staying to 20 at 10 years of service', font: F, size: SZ, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: fs.readFileSync('figure2.png'), transformation: { width: 830, height: 483 } })] }),
  new Paragraph({ spacing: { before: 120, line: LINE }, children: [new TextRun({ text: 'Each bar adds one adjustment to the result before it; values match Appendix A, Table 3. Positive values favor staying. Illustrative averages from the companion calculator (Day, 2026), not an individual estimate.', font: F, size: SZ })] }),
];

// ---------- References ----------
const url = (u) => new TextRun({ text: u, font: F, size: SZ });
const refs = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: 'References', font: F, size: SZ, bold: true })] }),
  ref(['Borgia, A. G., & Unger, D. K. (2025, January 30). ', it('Guest post – Critical update: Disability insurance protection for military physicians and dentists'), '. Joel Schofer\'s Career Planning Blog. https://mccareer.org/2025/01/30/guest-post-critical-update-disability-insurance-protection-for-military-physicians-and-dentists/']),
  ref(['Bork, M. (2021, May 12; updated 2026, April 19). ', it('Personal finance for military doctors'), '. The White Coat Investor. https://www.whitecoatinvestor.com/personal-finance-for-military-physicians/']),
  ref(['California Franchise Tax Board. (2025). ', it('2025 California tax rate schedules'), '. https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf']),
  ref(['Dahle, J. (2021, July 24). ', it('How to make more money as a family medicine physician'), '. The White Coat Investor. https://www.whitecoatinvestor.com/double-your-income-primary-care-physician/']),
  ref(['Day, J. M. (2026). ', it('Stay or go? Navy physician pay and pension'), ' [Web calculator, version 1.2]. https://jmday033.github.io/James-Day/capabilities/economic-research/opportunity-cost-military-primary-care/stay-or-go.html']),
  ref(['Defense Finance and Accounting Service. (n.d.). ', it('Concurrent military retired pay and VA disability compensation'), '. https://www.dfas.mil/RetiredMilitary/disability/crdp/']),
  ref(['Defense Finance and Accounting Service. (2026a). ', it('Basic allowance for subsistence'), '. https://www.dfas.mil/militarymembers/payentitlements/Pay-Tables/BAS/']),
  ref(['Defense Finance and Accounting Service. (2026b). ', it('Basic pay: Commissioned officers'), '. https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/']),
  ref(['Defense Finance and Accounting Service. (2026c). ', it('Medical Corps board certification pay, incentive pay and retention bonus, FY 2026'), '. https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/HPO4/']),
  ref(['Defense Travel Management Office. (n.d.). ', it('BAH rate lookup'), '. https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/']),
  ref(['Department of Defense. (n.d.). ', it('Military retirement'), '. https://militarypay.defense.gov/Pay/Retirement/']),
  ref(['Frank, R. H., Bernanke, B. S., Antonovics, K., & Heffetz, O. (2022). ', it('Principles of economics: A streamlined approach'), ' (4th ed.). McGraw Hill.']),
  ref(['Internal Revenue Service. (2025). ', it("Publication 3: Armed Forces' tax guide"), '. https://www.irs.gov/publications/p3']),
  ref(['KFF. (2025). ', it('2025 employer health benefits survey: Summary of findings'), '. https://files.kff.org/attachment/Employer-Health-Benefits-Survey-2025-Annual-Survey-Summary-of-Findings.pdf']),
  ref(['Liu, C.-F., Hebert, P. L., Douglas, J. H., Neely, E. L., Sulc, C. A., Reddy, A., Sales, A. E., & Wong, E. S. (2020). Outcomes of primary care delivery by nurse practitioners: Utilization, cost, and quality of care. ', it('Health Services Research, 55'), '(2), 178-189. https://doi.org/10.1111/1475-6773.13246']),
  ref(['Marit Health. (2026, April 30). ', it('Internist salary in San Diego, CA'), '. https://www.marithealth.com/o/-/internist/salary/san-diego-ca']),
  ref(['Morgan, G. (2013, August 23). ', it('Stay in the military or retire after 20 years?'), ' The White Coat Investor. https://www.whitecoatinvestor.com/stay-or-go-at-20-years-military-physician-series/']),
  ref(['Morgan, P. A., Smith, V. A., Berkowitz, T. S. Z., Edelman, D., Van Houtven, C. H., Woolson, S. L., Hendrix, C. C., Everett, C. M., White, B. S., & Jackson, G. L. (2019). Impact of physicians, nurse practitioners, and physician assistants on utilization and costs for complex patients. ', it('Health Affairs, 38'), '(6), 1028-1036. https://doi.org/10.1377/hlthaff.2019.00014']),
  ref(['NAPA Net. (2025, June). ', it('Modern plan design helps boost savings rates to all-time highs: Vanguard'), '. https://www.napa-net.org/news/2025/6/modern-plan-design-helps-boost-savings-rates-to-all-time-highs-vanguard/']),
  ref(['Schofer, J. (2016, March 20). ', it('How valuable is a military pension?'), ' Joel Schofer\'s Career Planning Blog. https://mccareer.org/2016/03/20/how-valuable-is-a-military-pension/']),
  ref(['Schuett, D. (2020, January 13). ', it('Guest post – How to apply for continuation pay under the Blended Retirement System'), '. Joel Schofer\'s Career Planning Blog. https://mccareer.org/2020/01/13/guest-post-how-to-apply-for-continuation-pay-under-the-blended-retirement-system/']),
  ref(['Servicemembers Civil Relief Act, 50 U.S.C. § 4001 (2018).']),
  ref(['TRICARE. (2026). ', it('TRICARE 2026 costs and fees'), '. https://tricare.mil/-/media/Files/TRICARE/Publications/FactSheets/Costs_Fees.pdf']),
  ref(['U.S. Department of the Treasury. (2026, September 28). ', it('Daily Treasury par real yield curve rates'), '. https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_real_yield_curve&field_tdr_date_value=202609']),
  ref(['U.S. Government Accountability Office. (2020). ', it('Defense health care: DOD should collect and use key information to make decisions about incentives for physicians and dentists'), ' (GAO-20-165). https://www.gao.gov/products/gao-20-165']),
  ref(['Vie, L. L., Whittaker, K. S., Lathrop, A. D., & Hawkins, J. N. (2024). Examining retention sentiments and attrition among active duty Army medical officers. ', it('Military Medicine, 189'), '(Suppl. 3), 39-46. https://doi.org/10.1093/milmed/usae037']),
  ref(['The White Coat Investor. (n.d.). ', it('How to buy disability insurance'), '. https://www.whitecoatinvestor.com/how-to-buy-disability-insurance/']),
  ref(['Wilk, J. E., Clarke-Walper, K., Nugent, K., Hoge, C. W., Sampson, M., & Warner, C. H. (2023). Associations of health care staff burnout with negative health and organizational outcomes in the U.S. military health system. ', it('Social Science & Medicine, 330'), ', 116049. https://doi.org/10.1016/j.socscimed.2023.116049']),
];

// ---------- Appendix table ----------
const b = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const borders = { top: b, bottom: b, left: b, right: b };
const W = [4680, 2340, 2340];
const cell = (t, i, shade, bold) => new TableCell({ width: { size: W[i], type: WidthType.DXA }, borders,
  shading: shade ? { type: ShadingType.CLEAR, fill: 'E8EEF4', color: 'auto' } : undefined,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: [new Paragraph({ children: [new TextRun({ text: t, font: F, size: SZ, bold })] })] });
const rows = [
  ['Navy component', '2027–2028', '2029–2030'],
  ['Basic pay', '$113,040', '$118,660'],
  ['BAH with dependents', '$60,984', '$60,984'],
  ['BAS', '$3,942', '$3,942'],
  ['Incentive pay', '$43,000', '$43,000'],
  ['Board-certification pay', '$8,000', '$8,000'],
  ['Assumed four-year retention bonus', '$48,000', '$48,000'],
  ['Total Navy gross cash', '$276,966', '$282,585'],
];
const table = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W,
  rows: rows.map((r, ri) => new TableRow({ children: r.map((t, i) => cell(t, i, ri === 0, ri === 0 || ri === rows.length - 1)) })) });
const W2 = [1560, 1800, 2160, 1920, 1920];
const cell2 = (t, i, shade, bold) => new TableCell({ width: { size: W2[i], type: WidthType.DXA }, borders,
  shading: shade ? { type: ShadingType.CLEAR, fill: 'E8EEF4', color: 'auto' } : undefined,
  margins: { top: 30, bottom: 30, left: 100, right: 100 },
  children: [new Paragraph({ children: [new TextRun({ text: t, font: F, size: 22, bold })] })] });
const rows2 = [['Years of service','Pension PV (3%)','Remaining cash gap PV (5%)','Net value of staying','Net if pension at 5%'],['10','$700,059','$1,362,667','−$662,608','−$909,675'],['11','$721,061','$1,254,329','−$533,268','−$778,687'],['12','$742,693','$1,140,574','−$397,881','−$641,149'],['13','$764,974','$1,021,131','−$256,157','−$496,735'],['14','$787,923','$895,716','−$107,793','−$345,100'],['15','$811,561','$764,030','$47,531','−$185,884'],['16','$835,907','$625,760','$210,148','−$18,706'],['17','$860,985','$480,576','$380,409','$156,830'],['18','$886,814','$328,133','$558,681','$341,144'],['19','$913,419','$168,068','$745,350','$534,672']];
const table2 = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W2,
  rows: rows2.map((r, ri) => new TableRow({ children: r.map((t, i) => cell2(t, i, ri === 0, ri === 0)) })) });
const W3 = [6360, 3000];
const cell3 = (t, i, shade, bold) => new TableCell({ width: { size: W3[i], type: WidthType.DXA }, borders,
  shading: shade ? { type: ShadingType.CLEAR, fill: 'E8EEF4', color: 'auto' } : undefined,
  margins: { top: 40, bottom: 40, left: 100, right: 100 },
  children: [new Paragraph({ alignment: i === 1 ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: t, font: F, size: 22, bold })] })] });
const rows3 = [
  ['Basis (each row adds to the one above)', 'Net value of staying'],
  ['Gross cash; untaxed pension (Figure 1A, Table 2)', '−$663,000'],
  ['After federal and California taxes, BRS match, employer retirement, health premiums, and disability insurance', '−$56,000'],
  ['+ average retiree TRICARE value until 65', '+$6,000'],
  ['+ Navy legal residence in a state without income tax', '+$101,000'],
  ['+ BRS continuation pay at the 12th year', '+$117,000'],
  ['+ 5% lower civilian pay after retiring at 20, to age 65', '+$31,000'],
];
const table3 = new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: W3,
  rows: rows3.map((r, ri) => new TableRow({ children: r.map((t, i) => cell3(t, i, ri === 0, ri === 0)) })) });
const appendix = [
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Appendix A. Compensation inputs', font: F, size: SZ, bold: true })] }),
  table,
  new Paragraph({ spacing: { before: 80, line: LINE }, children: [new TextRun({ text: 'Table 1. Base-case cash compensation. The retention bonus is conditional on eligibility and an executed agreement. BAH and BAS ($64,926 per year) are excluded from federal income tax. Totals use unrounded inputs (Defense Finance and Accounting Service [DFAS], 2026a, 2026b, 2026c; Defense Travel Management Office, n.d.).', font: F, size: SZ })] }),
  new Paragraph({ spacing: { before: 360, after: 200 }, keepNext: true, children: [new TextRun({ text: 'Table 2. Ten-year comparison: staying to 20 years, by years of service at the decision point', font: F, size: SZ, bold: true })] }),
  table2,
  new Paragraph({ spacing: { before: 80, line: LINE }, children: [new TextRun({ text: 'Pension PV: $48,000 BRS annuity (2% × 20 years × $120,000 High-3), 30 constant real payments beginning after year 20, discounted at 3% real to the decision point. Remaining cash gap PV: ($459,057 − $282,585) per remaining year to 20, year-end payments, discounted at 5% real. Net value = pension PV − remaining cash gap PV; last column: pension at 5%. Gross cash; conditional on reaching 20 years (Department of Defense, n.d.; Marit Health, 2026; U.S. Department of the Treasury, 2026).', font: F, size: SZ })] }),
  new Paragraph({ spacing: { before: 360, after: 200 }, keepNext: true, children: [new TextRun({ text: 'Table 3. After-tax and total-compensation check at 10 years of service', font: F, size: SZ, bold: true })] }),
  table3,
  new Paragraph({ spacing: { before: 80, line: LINE }, children: [new TextRun({ text: 'Present value at 10 years of staying to 20 versus leaving now; positive favors staying. O-4 internist, no promotion, San Diego (ZIP 92134), married filing jointly, $459,057 civilian benchmark, retention bonus each year, pension at 3% real for 30 payments, cash at 5% real. Rows 2–6 use the companion calculator (Day, 2026) with 2026 federal and state taxes and published averages; they are illustrative, not individual estimates. Figures rounded to the nearest $1,000.', font: F, size: SZ })] }),
];

const portrait = { page: { size: letter, margin } };
const doc = new Document({
  styles: { default: { document: { run: { font: F, size: SZ } } } },
  sections: [
    { properties: portrait, children: title },
    { properties: { ...portrait, page: { ...portrait.page, pageNumbers: { start: 1 } } }, footers: { default: footer }, children: body },
    { properties: { page: { size: { ...letter, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } }, footers: { default: footer }, children: figure },
    { properties: portrait, footers: { default: footer }, children: refs },
    { properties: portrait, footers: { default: footer }, children: appendix },
  ],
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync('navy-physician-retention-revision-7.docx', buf));
