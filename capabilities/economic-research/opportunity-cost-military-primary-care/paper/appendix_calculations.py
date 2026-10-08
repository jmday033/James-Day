"""Reproduce Appendices B-E of the research paper (analysis/research-paper.pdf, revision 16).

    python appendix_calculations.py            # print every figure and check it against the paper
    python appendix_calculations.py --markdown appendix-calculations.md

Standard library only. Inputs are the paper's Appendix A-D assumptions, restated below with their
sources as the paper gives them. Each computed figure is compared with the value printed in the
paper (to the cent where the paper shows cents, otherwise to the dollar); the script exits non-zero
if any figure differs. It is a verification of the paper's arithmetic, not a new analysis: it adds no
assumptions beyond what the appendices state.
"""
import argparse
import sys
from decimal import ROUND_HALF_UP, Decimal as D

# ---------------------------------------------------------------- Appendix A inputs
# O-4 monthly basic pay, 2026 (DFAS 2026a), by completed years; held constant in 2026 dollars.
MONTHLY_BASIC = {10: D("9420.00"), 12: D("9888.30"), 14: D("10214.40"), 16: D("10401.60"), 18: D("10509.90")}
BAH = D("5082") * 12                # ZIP 92134 with dependents (DTMO)
BAS = D("328.48") * 12              # DFAS 2026b
SPECIAL_PAYS = D("99000")           # incentive pay + board certification pay + $48,000 retention bonus
CIVILIAN_PAY = D("459057")          # Marit Health (2026) San Diego internal medicine average
YEARS = 10                          # comparison years: completed service 10 through 19
CASH_RATE = D("0.05")               # real discount rate for compensation gaps
PENSION_RATE = D("0.03")            # illustrative real discount rate for pension and retiree health
PENSION_TAX = D("0.32")             # flat illustrative federal pension tax
PENSION_YEARS = 30                  # first payment one year after retirement
BRS_MULTIPLIER = D("0.02")
BRS_CONTRIBUTION = D("0.05")        # BRS service contribution, % of basic pay
MATCH_RATE, MATCH_CAP = D("0.046"), D("360000")   # Vanguard (2025); IRS (2025b) compensation limit
HEALTH_PREMIUM = D("6850")          # civilian family premium share (KFF 2025)
DISABILITY_RATE = D("0.03")         # private disability insurance proxy
RETIREE_HEALTH = D("6085")          # $6,850 avoided premium less $765 TRICARE fee, age 47 to 65
RETIREE_HEALTH_YEARS = 18
CONTINUATION_PAY_MONTHS = D("2.5")  # paid in comparison year 2
LATER_PAY_PENALTY = D("0.05")
WORK_YEARS_AFTER_RETIREMENT = 18    # age 47 to 65

# ---------------------------------------------------------------- Appendix C tax rules
FED_STD = D("32200")
FED = [(D("0"), D("0.10")), (D("24800"), D("0.12")), (D("100800"), D("0.22")), (D("211400"), D("0.24")),
       (D("403550"), D("0.32")), (D("512450"), D("0.35")), (D("768700"), D("0.37"))]
CA_STD = D("11080")
CA = [(D("0"), D("0.01")), (D("22158"), D("0.02")), (D("52528"), D("0.04")), (D("82904"), D("0.06")),
      (D("115084"), D("0.08")), (D("145448"), D("0.093"))]
CA_NEXT = D("742958")               # not reached in any reported case (asserted below)
SS_RATE, SS_BASE = D("0.062"), D("184500")
MEDICARE, ADDL_MEDICARE, ADDL_THRESHOLD = D("0.0145"), D("0.009"), D("250000")
CA_SDI = D("0.013")                 # civilian California wages only


def bracket_tax(taxable, brackets):
    taxable = max(taxable, D("0"))
    tax = D("0")
    for i, (lower, rate) in enumerate(brackets):
        upper = brackets[i + 1][0] if i + 1 < len(brackets) else None
        if taxable > lower:
            top = taxable if upper is None else min(taxable, upper)
            tax += (top - lower) * rate
    return tax


def federal_tax(wages):
    return bracket_tax(wages - FED_STD, FED)


def california_tax(wages):
    assert wages - CA_STD < CA_NEXT
    return bracket_tax(wages - CA_STD, CA)


def payroll_tax(wages, sdi=False):
    tax = SS_RATE * min(wages, SS_BASE) + MEDICARE * wages + ADDL_MEDICARE * max(wages - ADDL_THRESHOLD, 0)
    return tax + (CA_SDI * wages if sdi else 0)


def annuity(rate, n):
    return (1 - (1 + rate) ** -n) / rate


def pv(flows, rate):
    """Year-end flows, the first discounted one year."""
    return sum(f / (1 + rate) ** t for t, f in enumerate(flows, 1))


# ---------------------------------------------------------------- the model
def basic_pay(year):
    """Annual basic pay in comparison year 1..10 (completed service 10..19)."""
    completed = 9 + year
    return MONTHLY_BASIC[completed - completed % 2] * 12


def navy_gross(year):
    return basic_pay(year) + BAH + BAS + SPECIAL_PAYS


def navy_taxes(year, state=True):
    wages = navy_gross(year) - BAH - BAS
    parts = {"federal": federal_tax(wages), "california": california_tax(wages) if state else D("0"),
             "payroll": payroll_tax(wages)}
    return parts, sum(parts.values())


def navy_value(year, state=True):
    return navy_gross(year) - navy_taxes(year, state)[1] + BRS_CONTRIBUTION * basic_pay(year)


def civilian_value(pay=CIVILIAN_PAY, health=True):
    taxes = federal_tax(pay) + california_tax(pay) + payroll_tax(pay, sdi=True)
    value = pay - taxes + MATCH_RATE * min(pay, MATCH_CAP) - DISABILITY_RATE * pay
    return value - (HEALTH_PREMIUM if health else 0), taxes


def pension():
    high3 = sum(basic_pay(y) for y in (8, 9, 10)) / 3
    return high3, BRS_MULTIPLIER * 20 * high3


def pension_pv(years_to_retirement, rate=PENSION_RATE, tax=D("0")):
    return pension()[1] * (1 - tax) * annuity(rate, PENSION_YEARS) / (1 + rate) ** years_to_retirement


def net_at(k, gaps, tax, rate=PENSION_RATE):
    """Net value of staying when k comparison years are already served (decision at 10 + k service years)."""
    return pension_pv(YEARS - k, rate, tax) - pv(gaps[k:], CASH_RATE)


def break_even(gaps, tax):
    values = [net_at(k, gaps, tax) for k in range(YEARS)]
    for k in range(1, YEARS):
        if values[k - 1] < 0 <= values[k]:
            return 10 + (k - 1) + float(-values[k - 1] / (values[k] - values[k - 1]))
    return None


def compute():
    r = {}
    civ_value, civ_taxes = civilian_value()
    gross_gaps = [CIVILIAN_PAY - navy_gross(y) for y in range(1, YEARS + 1)]
    adj_gaps = [civ_value - navy_value(y) for y in range(1, YEARS + 1)]
    r["table_b1"] = [(y, navy_gross(y), navy_taxes(y)[1], navy_value(y), adj_gaps[y - 1]) for y in range(1, YEARS + 1)]
    r["civilian_value"], r["civilian_taxes"] = civ_value, civ_taxes
    r["pv_adjusted_gaps"] = pv(adj_gaps, CASH_RATE)
    r["pv_gross_gaps"] = pv(gross_gaps, CASH_RATE)
    r["pv_gross_gaps_4yr"] = pv(gross_gaps[:4], CASH_RATE)
    parts, total = navy_taxes(1)
    r["year1_navy_taxes"], r["year1_navy_total_tax"] = parts, total
    r["year1_civilian_taxes"] = {"federal": federal_tax(CIVILIAN_PAY), "california": california_tax(CIVILIAN_PAY),
                                 "payroll": payroll_tax(CIVILIAN_PAY, sdi=True)}
    r["high3"], r["annual_pension"] = pension()
    r["pension_pv_gross"] = pension_pv(YEARS)
    r["pension_pv_taxed"] = pension_pv(YEARS, tax=PENSION_TAX)
    r["net_gross"] = r["pension_pv_gross"] - r["pv_gross_gaps"]
    r["net_adjusted"] = r["pension_pv_taxed"] - r["pv_adjusted_gaps"]
    r["break_even_gross"] = break_even(gross_gaps, D("0"))
    r["break_even_adjusted"] = break_even(adj_gaps, PENSION_TAX)
    # Table D1 sequence
    r["retiree_health_pv"] = RETIREE_HEALTH * annuity(PENSION_RATE, RETIREE_HEALTH_YEARS) / (1 + PENSION_RATE) ** YEARS
    r["d1_retiree_health"] = r["net_adjusted"] + r["retiree_health_pv"]
    r["navy_state_tax_pv"] = pv([navy_taxes(y)[0]["california"] for y in range(1, YEARS + 1)], CASH_RATE)
    r["d1_no_state_tax"] = r["d1_retiree_health"] + r["navy_state_tax_pv"]
    cp = CONTINUATION_PAY_MONTHS * MONTHLY_BASIC[10]
    wages2 = navy_gross(2) - BAH - BAS
    cp_net = cp - (federal_tax(wages2 + cp) - federal_tax(wages2)) - (payroll_tax(wages2 + cp) - payroll_tax(wages2))
    r["continuation_pay"], r["continuation_pay_pv"] = cp, cp_net / (1 + CASH_RATE) ** 2
    r["d1_continuation"] = r["d1_no_state_tax"] + r["continuation_pay_pv"]
    lower = CIVILIAN_PAY * (1 - LATER_PAY_PENALTY)
    diff = civilian_value(CIVILIAN_PAY, health=False)[0] - civilian_value(lower, health=False)[0]
    r["later_pay_lower"] = lower
    r["later_pay_penalty_pv"] = diff * annuity(CASH_RATE, WORK_YEARS_AFTER_RETIREMENT) / (1 + CASH_RATE) ** YEARS
    r["d1_later_pay"] = r["d1_continuation"] - r["later_pay_penalty_pv"]
    # Appendix E: one change at a time from the adjusted base
    r["e_pension_5pct"] = pension_pv(YEARS, CASH_RATE, PENSION_TAX) - r["pv_adjusted_gaps"]
    for salary in (D("400000"), D("350000")):
        v = civilian_value(salary)[0]
        r[f"e_salary_{salary}"] = r["pension_pv_taxed"] - pv([v - navy_value(y) for y in range(1, YEARS + 1)], CASH_RATE)
    r["e_pension_tax_413"] = pension_pv(YEARS, tax=D("0.413")) - r["pv_adjusted_gaps"]
    return r


# ---------------------------------------------------------------- figures printed in the paper
def cents(x):
    return D(x).quantize(D("0.01"), ROUND_HALF_UP)


def dollars(x):
    return D(x).quantize(D("1"), ROUND_HALF_UP)


PRINTED = [  # (label, key or lambda, printed value, precision, where)
    ("Civilian adjusted compensation", "civilian_value", "305005.33", cents, "App. B, C"),
    ("Civilian modeled taxes", "civilian_taxes", "149989.96", cents, "App. C"),
    ("PV of adjusted gaps at 5%", "pv_adjusted_gaps", "557014.21", cents, "App. B, D"),
    ("PV of gross gaps, 10 years", "pv_gross_gaps", "1349196.04", cents, "App. B, D; Results"),
    ("PV of gross gaps, first 4 years", "pv_gross_gaps_4yr", "636208.84", cents, "App. B; Results"),
    ("Year-1 Navy federal tax", lambda r: r["year1_navy_taxes"]["federal"], "28989", dollars, "App. C"),
    ("Year-1 Navy California tax", lambda r: r["year1_navy_taxes"]["california"], "11567", dollars, "App. C"),
    ("Year-1 Navy payroll tax", lambda r: r["year1_navy_taxes"]["payroll"], "14514", dollars, "App. C"),
    ("Year-1 Navy total tax", "year1_navy_total_tax", "55068.94", cents, "App. C"),
    ("Year-1 civilian federal tax", lambda r: r["year1_civilian_taxes"]["federal"], "89506", dollars, "App. C"),
    ("Year-1 civilian California tax", lambda r: r["year1_civilian_taxes"]["california"], "34539", dollars, "App. C"),
    ("Year-1 civilian payroll tax", lambda r: r["year1_civilian_taxes"]["payroll"], "25945", dollars, "App. C"),
    ("Year-1 Navy value", lambda r: r["table_b1"][0][3], "227548.82", cents, "App. C"),
    ("Year-1 difference", lambda r: r["table_b1"][0][4], "77456.51", cents, "App. C"),
    ("High-3 basic pay", "high3", "125685.60", cents, "App. D"),
    ("Annual BRS pension", "annual_pension", "50274.24", cents, "App. D"),
    ("Pension PV, untaxed", "pension_pv_gross", "733228.13", cents, "App. D; Results"),
    ("Pension PV, 32% tax", "pension_pv_taxed", "498595.13", cents, "App. D"),
    ("Net value, gross basis", "net_gross", "-615967.91", cents, "App. D, D1; Results"),
    ("Net value, adjusted", "net_adjusted", "-58419.08", cents, "App. D, D1, E; Results"),
    ("Retiree health PV", "retiree_health_pv", "62273.31", cents, "App. D"),
    ("D1: add retiree health", "d1_retiree_health", "3854", dollars, "App. D1"),
    ("Navy state income tax PV", "navy_state_tax_pv", "94602.25", cents, "App. D"),
    ("D1: add no-income-tax domicile", "d1_no_state_tax", "98456", dollars, "App. D1; Results"),
    ("Continuation pay amount", "continuation_pay", "23550", dollars, "App. A"),
    ("Continuation pay PV after tax", "continuation_pay_pv", "16351.50", cents, "App. D"),
    ("D1: add continuation pay", "d1_continuation", "114808", dollars, "App. D1; Results"),
    ("Later civilian pay after penalty", "later_pay_lower", "436104.15", cents, "App. D"),
    ("Later pay penalty PV", "later_pay_penalty_pv", "85736.06", cents, "App. D"),
    ("D1: add 5% later pay penalty", "d1_later_pay", "29072", dollars, "App. D1; Results"),
    ("E: pension discount 5%", "e_pension_5pct", "-234384", dollars, "App. E; Policy"),
    ("E: civilian salary $400,000", "e_salary_400000", "201025", dollars, "App. E"),
    ("E: civilian salary $350,000", "e_salary_350000", "436422", dollars, "App. E"),
    ("E: pension tax 41.3%", "e_pension_tax_413", "-126609", dollars, "App. E; Policy"),
]
B1_PRINTED = [  # year, Navy gross, Navy tax, Navy value, civilian gap (dollars)
    (1, 276966, 55069, 227549, 77457), (3, 282585, 56909, 231609, 73396), (5, 286499, 58191, 234436, 70569),
    (7, 288745, 58927, 236059, 68946), (9, 290045, 59352, 236998, 68007)]


def check(r):
    rows, failures = [], 0
    for label, key, printed, prec, where in PRINTED:
        value = key(r) if callable(key) else r[key]
        ok = prec(value) == D(printed)
        failures += not ok
        rows.append((label, value, D(printed), ok, where))
    for y, *vals in B1_PRINTED:
        for (label, got, want) in zip(("Navy gross", "Navy tax", "Navy value", "Civilian gap"),
                                      r["table_b1"][y - 1][1:], vals):
            ok = dollars(got) == D(want)
            failures += not ok
            rows.append((f"Table B1 year {y}: {label}", got, D(want), ok, "App. B"))
    for label, got, want in (("Break-even, gross (years)", r["break_even_gross"], "14.27"),
                             ("Break-even, adjusted (years)", r["break_even_adjusted"], "10.90")):
        ok = D(str(round(got, 2))) == D(want)
        failures += not ok
        rows.append((label, D(str(round(got, 4))), D(want), ok, "App. D; Results"))
    return rows, failures


def markdown(rows, failures):
    out = ["# Appendix B-E reproduction", "",
           "Generated by `appendix_calculations.py` from the paper's stated assumptions (Appendices A-D). "
           "Each figure is recomputed and compared with the value printed in `analysis/research-paper.pdf` "
           "(revision 16). Cents are compared where the paper prints cents; otherwise whole dollars.", "",
           f"**Result: {len(rows) - failures} of {len(rows)} figures match.**", "",
           "| Figure | Computed | Printed | Match | Where |", "|---|---:|---:|---|---|"]
    for label, got, want, ok, where in rows:
        out.append(f"| {label} | {got:,.2f} | {want:,.2f} | {'yes' if ok else '**NO**'} | {where} |")
    return "\n".join(out) + "\n"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--markdown", help="also write the comparison table to this Markdown file")
    args = parser.parse_args(argv)
    rows, failures = check(compute())
    for label, got, want, ok, _ in rows:
        print(f"{'ok ' if ok else 'BAD'}  {label:42s} computed {got:>16,.2f}   printed {want:>16,.2f}")
    print(f"\n{len(rows) - failures} of {len(rows)} figures match the paper.")
    if args.markdown:
        with open(args.markdown, "w", encoding="utf-8") as fh:
            fh.write(markdown(rows, failures))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
