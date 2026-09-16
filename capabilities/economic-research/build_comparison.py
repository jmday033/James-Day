"""Reproduce the Navy primary-care cash comparisons in constant 2026 dollars."""
from __future__ import annotations

import csv
from decimal import Decimal as D
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

MONTHS = D("12")
BAS = D("328.48")
BAH = D("5082")
IP = D("43000")
BCP = D("8000")
BASE = {2027: D("9420"), 2028: D("9420"), 2029: D("9888.30"), 2030: D("9888.30")}
FLAT_RB = D("100000")
SPECIALTIES = {
    "Pediatrics": {"marit": D("303974"), "current_rb": D("35000")},
    "Internal medicine": {"marit": D("459057"), "current_rb": D("48000")},
    "Family medicine": {"marit": D("373038"), "current_rb": D("48000")},
}
DOXIMITY = {"Pediatrics": D("273665"), "Internal medicine": D("339274"), "Family medicine": D("325040")}

def money(value: D) -> str:
    return f"-${abs(value):,.2f}" if value < 0 else f"${value:,.2f}"

def navy_base(year: int) -> D:
    return MONTHS * (BASE[year] + BAH + BAS) + IP + BCP

assert navy_base(2027) == D("228965.76")
assert navy_base(2029) == D("234585.36")

rows = []
policies = ("Current RB", "$100,000 total RB", "50% gap closure RB")
for name, inp in SPECIALTIES.items():
    year_one_current = navy_base(2027) + inp["current_rb"]
    positive_gap = max(D(0), inp["marit"] - year_one_current)
    half_rb = inp["current_rb"] + D("0.5") * positive_gap
    for year in BASE:
        current = navy_base(year) + inp["current_rb"]
        flat = navy_base(year) + FLAT_RB
        half = navy_base(year) + half_rb
        rows.append({
            "specialty": name, "year": year, "published_marit_city_benchmark": inp["marit"],
            "current_total_rb": inp["current_rb"], "half_gap_total_rb": half_rb,
            "navy_current_cash": current, "navy_flat_cash": flat,
            "navy_half_gap_cash": half, "annual_gap_current": inp["marit"] - current,
            "annual_gap_flat": inp["marit"] - flat,
            "annual_gap_half": inp["marit"] - half,
        })

checks = {
    "Pediatrics": (D("148793.76"), D("-111206.24"), D("68777.28")),
    "Internal medicine": (D("717125.76"), D("509125.76"), D("352943.28")),
    "Family medicine": (D("373049.76"), D("165049.76"), D("180905.28")),
}
for name, expected in checks.items():
    rs = [r for r in rows if r["specialty"] == name]
    actual = tuple(sum(r[key] for r in rs) for key in ("annual_gap_current", "annual_gap_flat", "annual_gap_half"))
    assert actual == expected, (name, actual, expected)
    assert len(rs) == 4
assert len(rows) == 12
assert navy_base(2027) - (MONTHS * (BASE[2027] + D("4440") + BAS) + IP + BCP) == D("7704")

csv_path = OUT / "physician-retention-12-row-comparison.csv"
with csv_path.open("w", newline="", encoding="utf-8") as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
    writer.writeheader()
    for row in rows:
        writer.writerow({key: str(value) for key, value in row.items()})

colors = {"Current RB": "#16587a", "$100,000 total RB": "#c98227", "50% gap closure RB": "#249d91"}
W, H = 1360, 760
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
       '<rect width="100%" height="100%" fill="white"/>',
       '<style>text{font-family:Arial,Helvetica,sans-serif;fill:#17334b}.title{font-size:25px;font-weight:700}.panel{font-size:18px;font-weight:700}.small{font-size:13px;fill:#526878}.tick{font-size:12px;fill:#526878}</style>',
       '<text class="title" x="70" y="48">Modeled cumulative cash compensation gap, 2027–2030</text>',
       '<text class="small" x="70" y="76">Civilian benchmark minus Navy cash · 2026 dollars · O-4, ZIP 92134, with dependents</text>']
img = Image.new("RGB", (W, H), "white")
draw = ImageDraw.Draw(img)
font_dir = Path("C:/Windows/Fonts")
def font(size, bold=False):
    p=font_dir / ("arialbd.ttf" if bold else "arial.ttf")
    return ImageFont.truetype(str(p), size) if p.exists() else ImageFont.load_default()
draw.text((70,22), "Modeled cumulative cash compensation gap, 2027–2030", fill="#17334b", font=font(25,True))
draw.text((70,58), "Civilian benchmark minus Navy cash | 2026 dollars | O-4, ZIP 92134, with dependents", fill="#526878", font=font(13))
for j, label in enumerate(policies):
    x=70+j*315
    svg.append(f'<line x1="{x}" y1="112" x2="{x+37}" y2="112" stroke="{colors[label]}" stroke-width="4"/>')
    svg.append(f'<text class="small" x="{x+45}" y="117">{label.replace("&", "&amp;")}</text>')
    draw.line((x,112,x+37,112),fill=colors[label],width=4)
    draw.text((x+45,103),label,fill="#526878",font=font(13))

for idx, (name, inp) in enumerate(SPECIALTIES.items()):
    rs=[r for r in rows if r["specialty"]==name]
    x0=95+idx*425; x1=x0+320; y0=205; y1=565
    series={}
    for label,key in zip(policies,("annual_gap_current","annual_gap_flat","annual_gap_half")):
        running=D(0); values=[]
        for r in rs:
            running+=r[key]; values.append(float(running/D(1000)))
        series[label]=values
    minv=min(0,*[v for vals in series.values() for v in vals]); maxv=max(0,*[v for vals in series.values() for v in vals])
    lo=50*(int(minv//50)-1); hi=50*(int(maxv//50)+2)
    def xy(i,v): return (x0+i*(x1-x0)/3, y1-(v-lo)*(y1-y0)/(hi-lo))
    svg.append(f'<text class="panel" x="{x0-20}" y="168">{name}</text>')
    draw.text((x0-20,150),name,fill="#17334b",font=font(18,True))
    for k in range(5):
        val=lo+(hi-lo)*k/4; yy=xy(0,val)[1]
        svg.append(f'<line x1="{x0}" y1="{yy:.1f}" x2="{x1}" y2="{yy:.1f}" stroke="#dce5eb" stroke-width="1"/>')
        tick_label=f"-${abs(val):,.0f}k" if val<0 else f"${val:,.0f}k"
        svg.append(f'<text class="tick" x="{x0-9}" y="{yy+4:.1f}" text-anchor="end">{tick_label}</text>')
        draw.line((x0,yy,x1,yy),fill="#dce5eb",width=1)
        draw.text((x0-58,yy-7),tick_label,fill="#526878",font=font(12))
    if lo<=0<=hi:
        yy=xy(0,0)[1]
        svg.append(f'<line x1="{x0}" y1="{yy:.1f}" x2="{x1}" y2="{yy:.1f}" stroke="#7c8994" stroke-width="1.5" stroke-dasharray="6 5"/>')
        draw.line((x0,yy,x1,yy),fill="#7c8994",width=2)
    for i,year in enumerate(BASE):
        xx=xy(i,0)[0]
        svg.append(f'<text class="tick" x="{xx:.1f}" y="588" text-anchor="middle">{year}</text>')
        draw.text((xx-16,575),str(year),fill="#526878",font=font(12))
    for label,vals in series.items():
        points=[xy(i,v) for i,v in enumerate(vals)]
        pstr=" ".join(f"{x:.1f},{y:.1f}" for x,y in points)
        svg.append(f'<polyline points="{pstr}" fill="none" stroke="{colors[label]}" stroke-width="3"/>')
        draw.line(points,fill=colors[label],width=3)
        for x,y in points:
            svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="{colors[label]}"/>')
            draw.ellipse((x-4,y-4,x+4,y+4),fill=colors[label])
    svg.append(f'<text class="small" x="{(x0+x1)/2:.1f}" y="620" text-anchor="middle">Contract year</text>')
    draw.text(((x0+x1)/2-42,603),"Contract year",fill="#526878",font=font(13))
svg.append('<text class="small" x="70" y="666">Each panel uses its own dollar scale. Zero is cash parity; values below zero favor modeled Navy cash.</text>')
svg.append('<text class="small" x="70" y="690">Sources: DFAS 2026 O-4 pay; DTMO 2026 BAH; DoD 2026 BAS; Navy FY26 special pays; Marit San Diego city benchmarks.</text>')
svg.append('<text class="small" x="70" y="714">Marit cohorts are self-reported, mixed-employer and not ZIP-specific. This chart does not measure retention or labor-supply elasticity.</text>')
svg.append('</svg>')
draw.text((70,650),"Each panel uses its own dollar scale. Zero is cash parity; values below zero favor modeled Navy cash.",fill="#526878",font=font(13))
draw.text((70,674),"Sources: DFAS 2026 O-4 pay; DTMO 2026 BAH; DoD 2026 BAS; Navy FY26 special pays; Marit San Diego city benchmarks.",fill="#526878",font=font(13))
draw.text((70,698),"Marit cohorts are self-reported, mixed-employer and not ZIP-specific. This chart does not measure retention or labor-supply elasticity.",fill="#526878",font=font(13))
(OUT/"physician-retention-cumulative-gap.svg").write_text("\n".join(svg),encoding="utf-8")
img.save(OUT/"physician-retention-cumulative-gap.png")

lines = [
    "# Physician retention cash comparison — audit table",
    "",
    "Four-year hypothetical agreement, 2027–2030, expressed in constant 2026 dollars. The profile is a board-certified O-4 just past 10 years of service, with dependents, assigned to ZIP 92134, eligible for the listed FY26 special pays. The current and proposed retention bonus is the **total** annual RB, not a payment added on top of another RB. The 50% bonus is fixed at its Year 1 value throughout the four-year scenario.",
    "",
    "| Specialty | Year | Marit San Diego benchmark | Current Navy cash | Navy cash with $100k RB | Navy cash with 50% gap RB | Gap: current | Gap: $100k | Gap: 50% |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
]
for r in rows:
    lines.append("| " + " | ".join([r["specialty"], str(r["year"])] + [money(r[key]) for key in ("published_marit_city_benchmark", "navy_current_cash", "navy_flat_cash", "navy_half_gap_cash", "annual_gap_current", "annual_gap_flat", "annual_gap_half")]) + " |")
lines += [
    "", "## Bonus and four-year checks", "",
    "| Specialty | Current total RB | 50% gap total RB | Extra annual cost of $100k RB | Extra annual cost of 50% RB | Four-year current gap | Four-year $100k gap | Four-year 50% gap |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
]
for name, inp in SPECIALTIES.items():
    rs=[r for r in rows if r["specialty"]==name]
    half=rs[0]["half_gap_total_rb"]
    totals=tuple(sum(r[k] for r in rs) for k in ("annual_gap_current","annual_gap_flat","annual_gap_half"))
    lines.append("| " + " | ".join([name,money(inp["current_rb"]),money(half),money(FLAT_RB-inp["current_rb"]),money(half-inp["current_rb"])] + [money(x) for x in totals]) + " |")
lines += [
    "", "## National sensitivity check (separate comparator)", "",
    "Doximity's 2026 report gives national specialty averages based on 2025 compensation responses. These do not replace a San Diego civilian offer and are not blended with Marit's city benchmarks.",
    "", "| Specialty | Doximity national average | Year 1 current Navy cash | Year 1 gap, current RB | Year 1 gap, $100k RB |",
    "| --- | ---: | ---: | ---: | ---: |",
]
for name, benchmark in DOXIMITY.items():
    r=next(row for row in rows if row["specialty"]==name and row["year"]==2027)
    lines.append("| " + " | ".join([name,money(benchmark),money(r["navy_current_cash"]),money(benchmark-r["navy_current_cash"]),money(benchmark-r["navy_flat_cash"])]) + " |")
lines += [
    "", "## Verification and interpretation", "",
    "- The script checks the Year 1–2 Navy cash baseline of $228,965.76, the Year 3–4 baseline of $234,585.36, all three cumulative-gap triplets in the specification, exactly 12 output rows, and the $7,704 annual BAH difference when dependents are removed.",
    "- The Year 3 step is the 2026 DFAS O-4 over-12 rate. BAH, BAS, specialty pays, bonuses, and Marit benchmarks stay frozen at their cited 2026 amounts. This is a comparison of policies under stated assumptions, not a forecast of future salary or promotion.",
    "- The gap is published Marit city benchmark minus modeled Navy gross cash. A negative result means Navy modeled cash exceeds that benchmark. These are arithmetic gaps, not estimates of whether a physician would remain on active duty.",
    "- Marit's published San Diego figures are self-reported, use small visible local cohorts, and include multiple employer types. The internist public preview includes a military contractor. A civilian-only, similar-hours, similar-experience San Diego offer is needed to validate the market comparator before making a definitive policy-cost claim.",
    "- The sensitivity checks should use Doximity national benchmarks separately, BAH without dependents, and verified civilian-only offers if obtained. The paper should not blend national and city estimates into a single 'civilian salary.'",
    "", "## Economic mechanism and decision limits", "",
    "The physician's civilian alternative is the opportunity cost of staying. A bonus changes the marginal financial return from signing another agreement. Assignment stability and protected clinical practice can also change the nonpay value of staying; a compensating wage differential may be needed when the Navy job entails less geographic or professional flexibility. These are mechanisms, not measured effect sizes.",
    "", "A specialty-targeted bonus uses the different modeled outside options. In the Marit Year 1 scenario, adding half of the positive cash gap to each current RB produces total annual RBs of $55,004.12 for pediatrics, $139,045.62 for internal medicine, and $96,036.12 for family medicine. The incremental four-year bonus cost per eligible physician is $80,016.48, $364,182.48, and $192,144.48, respectively. These are per-physician arithmetic costs, not a total Navy budget; total spending requires counts of eligible physicians and uptake.",
    "", "The flat $100,000 total RB is less targeted: under the published Marit figures it puts pediatrics Navy cash above the benchmark by $24,991.76 in Year 1, while leaving a $130,091.24 internal-medicine gap and a $44,072.24 family-medicine gap. This does not prove overpayment in pediatrics or underpayment in internal medicine, because the benchmarks are not verified civilian offers and benefits and working conditions differ.",
    "", "The core test is labor-supply elasticity to Navy compensation: compare bonus acceptance and later retention among eligible physicians facing different bonus changes, adjusting for specialty, career stage, and concurrent assignment reforms. A four-year agreement mechanically commits an accepter for four years, so acceptance at the unobligated decision point and retention after the next obligation are distinct outcomes. To evaluate marginal value, compare incremental bonus cost per **additional** physician retained with replacement and readiness costs. GAO reports that DOD lacks consistent data on replacement costs, bonus acceptance, and private-sector wages, so this model cannot estimate that ratio today.",
    "", "[GAO's 2025 staffing review](https://www.gao.gov/products/gao-25-106988) reports a roughly 16% decline in assigned military medical personnel across DOD from FY2015 to FY2023 and anticipated shortfalls through at least 2027. This is context for a current staffing decision, not a San Diego Navy primary-care attrition rate. [GAO's incentive review](https://www.gao.gov/products/gao-20-165) found historical military-civilian cash gaps and recommended collecting replacement cost, retention, and civilian-wage data. [Doximity's 2026 report](https://www.doximity.com/reports/physician-compensation-report/2026) identifies internal medicine, family medicine, and pediatrics among the most recruited specialties nationally; this is evidence of national demand, not a local wage offer.",
    "", "## Benefits layer: deliberately unpriced in the base table", "",
    "| Benefit | Incremental question | Missing person-specific inputs |",
    "| --- | --- | --- |",
    "| Pension | Does staying change the probability or amount of active-duty retirement benefits? | Retirement system, exact service years, projected High-3, continuation probability, taxes, discount rate, expected payment years. A four-year commitment from just over 10 years does not reach 20. |",
    "| Healthcare | How much lower are expected household premiums and out-of-pocket costs under TRICARE? | Comparable civilian employer plan, dependent coverage, expected use, active-duty status. |",
    "| GI Bill | Does staying create or preserve dependent-transfer value beyond rights already earned? | Remaining entitlement, approved transfer status, dependents, additional-service obligation, likely use. |",
    "", "## Source register", "",
    "- [DFAS 2026 commissioned-officer basic pay](https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/Basic-Pay/CO/): O-4 over 10 = $9,420/month; over 12 = $9,888.30/month.",
    "- [DTMO BAH rate lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/): 2026, 92134, O-4, with dependents = $5,082/month; without = $4,440/month.",
    "- [DoD BAS](https://militarypay.defense.gov/Pay/Allowances/BAS/): 2026 officer rate = $328.48/month.",
    "- [Navy Medicine FY26 special pays](https://www.med.navy.mil/Special-Pays/): modeled primary-care IP = $43,000/year, BCP = $8,000/year, four-year RB = $35,000 pediatrics and $48,000 internal/family medicine; eligibility must be verified for actual physicians.",
    "- [Doximity 2026 Physician Compensation Report](https://www.doximity.com/reports/physician-compensation-report/2026): national averages of $273,665 pediatrics, $339,274 internal medicine, and $325,040 family medicine, from a 2025 compensation survey. This is a separate geography and method from Marit.",
    "- Marit San Diego published benchmarks: [pediatrics](https://www.marithealth.com/o/-/pediatrician/salary/san-diego-ca) $303,974 (Aug. 28, 2026), [internists](https://www.marithealth.com/o/-/internist/salary/san-diego-ca) $459,057 (Apr. 30, 2026), [family medicine](https://www.marithealth.com/o/-/family-medicine-physician/salary/san-diego-ca) $373,038 (June 5, 2026). These are citywide and not verified civilian-only salary figures.",
    "", "The companion figure is [the cumulative-gap chart](../figures/physician-retention-cumulative-gap.svg).",
]
(OUT / "physician-retention-analysis.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print("PASS: 12 rows, baseline pay, BAH sensitivity, all cumulative-gap checks")
for name, expected in checks.items():
    print(name, *(str(x) for x in expected))

