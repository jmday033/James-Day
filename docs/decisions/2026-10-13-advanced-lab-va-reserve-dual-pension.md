# Advanced lab adds a VA (FERS) pension that can combine with the Reserve pension

The advanced lab's leave path can now value a VA staff-physician job with a FERS military service buyback, alone or together with the existing Reserve pension. The prompt was reader feedback from a family physician at 10.5 years (service academy, five active years, HPSP) who proposed buying back academy time, vesting FERS in five VA years, and drilling in the Selected Reserve for a second pension. Stay or go? is unchanged.

Mechanism, verified against statute:

- 5 U.S.C. § 8411(c)(2)(B) does not bar FERS credit for military service when retired pay is awarded under chapter 1223 of title 10 (Reserve retirement). The same active-duty years can count for both pensions. The 3% deposit is still required under § 8411(c)(1). Regular active-duty retired pay does bar the credit, so the option applies only to the leave path.
- Service academy time is creditable for FERS with a deposit, but not for Navy retirement (10 U.S.C. § 971). HPSP and ROTC student time is not active duty and cannot be bought back.
- HPSP credit for the Reserve pension (10 U.S.C. § 2126(b)) is real but conditional: designated specialty, up to four years at 50 points each, credited one year at a time after each later Selected Reserve year with at least 50 points. The lab now says so next to the Reserve qualifying-years input and leaves the entry to the user after a record review.
- Federal employees receive 15 days of paid military leave each fiscal year (5 U.S.C. § 6323).

FERS assumptions (`fersLeavePathValue` in `calc-engine.js`):

- Five years of civilian service vest the annuity; bought-back military years do not count toward the five.
- Start age: at separation if 62 or older, MRA (57) with 30 creditable years, 60 with 20, otherwise deferred to 62. Multiplier 1.1% only when leaving at 62 or later with 20 years, otherwise 1.0%.
- A deferred annuity is fixed in dollars at separation, so an inflation input (default 2.5%) erodes it until payments begin. After that, the FERS diet COLA trails CPI by about 0.5% a year, as in Stay or go?.
- Costs on the leave path: the deposit (paid in the first VA year), the 4.4% FERS-FRAE employee contribution on VA pay, and an optional after-tax pay shortfall versus the civilian job. All are discounted at the cash rate; the pension uses the pension rate.
- VA High-3 defaults to the civilian salary capped at the specialty's 2026 VA Tier 1 maximum (reused from `stay-or-go.js`). The active-duty deposit defaults to 3% of 2026 basic pay at the grade held, which overstates earlier years; users can override it. The academy deposit is user-entered.
- The pension uses the page's federal tax assumption; basis recovery from the deposit and FRAE is ignored, which slightly understates after-tax value.

Not modeled: the reduced MRA+10 annuity, the FERS supplement, retiree FEHB, survivor annuities, the missing COLA before 62, and a salary path that changes from VA to private pay (approximated by the pay-shortfall input).

Example (lab defaults, $300,000 civilian salary, 10 active years, Reserve pension on, 5 VA years from age 40, 4 academy years with a $1,300 deposit): FERS 19 creditable years, $57,000 a year at 45, about $37,500 a year in today's dollars at 62. Pension present value $230,900, less $29,300 deposits and $57,100 FRAE: net about $144,500 added to the leave path.

Issues found but not changed (scope rule):

- Stay or go?'s VA path values the deferred FERS annuity without inflation erosion between leaving the VA and age 62, which overstates it for short VA tenures.
- Its decision record says the deposit is not allowed for years on which Navy retired pay is drawn; that is true for regular retired pay but not for Reserve retired pay under chapter 1223.
