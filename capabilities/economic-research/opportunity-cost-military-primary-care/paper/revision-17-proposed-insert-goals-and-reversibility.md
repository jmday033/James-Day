---
type: proposed-revision
engagement: opportunity-cost-military-primary-care
capability: economic-research
project: "Opportunity Cost for Military Primary Care"
date: 2026-10-01
status: draft-for-author-review
base: analysis/research-paper.pdf (revision 16)
---

# Proposed revision 17 insert: what the difference buys, and whether the decision can be reversed

**Status:** AI-drafted at the author's request (October 1, 2026). Not yet in the paper. The author should revise the wording into his own voice, confirm it against course authorship rules, and rebuild the PDF. Revision 16 has no editable build source in the repository, so this insert is supplied as text.

**Why an appendix:** the main text is already at the four-page limit. The proposal adds one sentence to the main text and a short Appendix G.

**Number check needed before use:** the exit-window figures below come from the Stay or go? lab (version 1.5) run with the paper's inputs. The lab and the paper use the same BRS pension, $50,274.24 a year (an earlier version of this note misstated the paper's pension as $48,000, which is the annual retention bonus). Given the paper's assumptions, the lab reproduces the paper's adjusted base case exactly, −$58,419 ([`lab_reconciliation.mjs`](lab_reconciliation.mjs)). The historical two-change lab scenario of −$8,042 differs because of two lab defaults: it pays the pension for remaining life expectancy (35 years from age 47) instead of the paper's 30 payments (+$47,996), and it counts a $2,500 cost of leaving (+$2,381). Either rerun the figures below under the paper's assumptions or present them as lab illustrations, as drafted here.

## 1. Main-text sentence

Add at the end of the paragraph in *Policy implications* that begins "The model is sensitive":

> Appendix G suggests two questions for counseling once the figure is known: what the difference would change in the household's plans, and when the decision could still be reversed.

## 2. Appendix G draft

### Appendix G Interpreting the difference: goals and reversibility

A present-value difference answers which path pays more, not whether the amount matters. Counseling can add two questions.

**What would the difference buy?** Translating the figure into household goals, such as years of spending, children's college, debt repayment, or earlier retirement, tests whether it is large enough to decide the question. Thaler (1999) shows that households evaluate money by the account it is assigned to rather than as a single sum; naming the goal makes that assignment explicit. In this case, the fully adjusted difference of about $29,000 (Figure 2) equals roughly three months of spending for a household spending $120,000 a year, a planning assumption. A difference this small should not drive the decision; nonfinancial factors should. The exercise is most useful before committing. Used only afterward to confirm a choice, it invites post-decision rationalization (Festinger, 1957).

Timing also matters. Before 20 years the civilian path provides more cash; after 20 the Navy path pays an inflation-adjusted pension. In the lab with the paper's inputs, the civilian path provides about $444,000 more after-tax cash in present value before 20, while the pension pays about $34,000 a year after tax from age 47. Producing the same gross income from savings would take about $1.26 million at a 4% initial withdrawal rate (Bengen, 1994). A physician who leaves at 10 years would need to save about $100,000 a year, earning 5% after inflation and taxes, to build that sum by 47. Dahle (2012) framed the same question as required annual savings by years remaining, using a legacy O-6 pension priced as an inflation-indexed annuity; Schofer (2016) placed a physician's pension at roughly $1.2 million to $2.5 million across valuation methods. The pension supports early or partial retirement but cannot fund college or a home purchase before 47 unless the household saves from current pay. For reference, average 2025–26 college budgets are $30,990 a year at public in-state and $65,470 at private nonprofit four-year institutions (College Board, 2025).

**Can the decision be reversed?** An irreversible investment requires a higher expected return than a reversible one, because waiting or exiting has value (Dixit & Pindyck, 1994). Continued Navy service is partly reversible, but only at intervals set by obligations. Four-year retention-bonus agreements and continuation pay, which in the Navy obligates four years from the twelfth year and is generally served concurrently with other obligations (MCCareer, 2020), determine when a physician can leave without repayment. Shorter bonus agreements pay less per year but open more exit points; the lower rate is the price of that flexibility.

Table G1. Exit windows for the paper's internist if staying now (lab illustration, renewed four-year bonus, no continuation pay). Values compare staying until the listed year, then leaving, with leaving now, in present value after tax.

| Leave at | Free to leave? | Versus leaving now |
|---|---|---|
| 10 years (now) | Yes | — |
| 14 years | Yes | −$265,000 |
| 18 years | Yes | −$469,000 |
| 20 years (retire) | Yes | −$8,000 (lab base case) |

The cost of changing course rises by about $50,000 to $70,000 for each additional year and then reverses at 20, when the pension is earned. Staying therefore commits the physician more firmly each year. Reversal can also cost less than the table suggests. A physician who completes a Navy fellowship before leaving exits at a subspecialty salary; the lab lets the user enter a later civilian salary and the year it becomes available. A physician who leaves before 20 can also finish in the Selected Reserve. Neither path is valued in the paper's base case.

**Limits.** The goals translation does not allocate savings or model investment returns. Exit windows use four-year bonus terms and generic continuation-pay rules; individual obligations, including graduate medical education payback, must be confirmed with BUMED. The later-salary option holds Navy pay at the current specialty rate during training.

## 3. References to add (APA 7)

- Bengen, W. P. (1994). Determining withdrawal rates using historical data. *Journal of Financial Planning, 7*(4), 171–180.
- College Board. (2025). *Trends in college pricing and student aid 2025*. https://research.collegeboard.org/trends/college-pricing/highlights
- Dahle, J. (2012, July 20; updated 2026, April 9). *Should I stay or should I go? Financial implications of military separation*. The White Coat Investor. https://www.whitecoatinvestor.com/should-i-stay-or-should-i-go-financial-implications-of-military-separation/
- Dixit, A. K., & Pindyck, R. S. (1994). *Investment under uncertainty*. Princeton University Press.
- Festinger, L. (1957). *A theory of cognitive dissonance*. Stanford University Press.
- MCCareer. (2020, January 13). *Guest post: How to apply for continuation pay under the Blended Retirement System*. https://mccareer.org/2020/01/13/guest-post-how-to-apply-for-continuation-pay-under-the-blended-retirement-system/
- Schofer, J. (2016, March 20). *How valuable is a military pension?* MCCareer. https://mccareer.org/2016/03/20/how-valuable-is-a-military-pension/
- Thaler, R. H. (1999). Mental accounting matters. *Journal of Behavioral Decision Making, 12*(3), 183–206.

The 2020 MCCareer guest post predates current continuation-pay messages; confirm the four-year Navy obligation against the current NAVADMIN or BUMED Special Pays before citing it as current.

## 4. Course crosswalk links

- Opportunity cost and decisions at the margin: each exit window is a new marginal decision, and past service is sunk.
- Present value: the goals translation converts a present value back into time-dated household uses.
- Uncertainty and option value: extends the course's present-value rule to decisions that cannot be freely undone.
