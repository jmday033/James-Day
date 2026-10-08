# Research question amended to match the submitted paper

**Decision (October 8, 2026):** the research brief and specification now record the question the submitted paper answers: an O-4 general internist leaving at 10 active-service years versus staying to 20, with compensation gaps discounted at 5% real, pension and retiree-health value at 3% real, and a flat illustrative 32% pension tax. The original four-year, three-specialty question is kept below each amendment, so the history shows the change.

**Why:** the instructor's October 2 review (PR #6) found the brief and spec still asked the September question. A four-year comparison stops before pension eligibility, so it omits the pension, the main financial reason to stay. Amending the brief and spec keeps the paper's stronger result; rewriting the paper back to four years would discard it.

**Evidence added:** `paper/appendix_calculations.py` reproduces all 56 checked figures in Appendices B–E from the stated assumptions. `paper/lab_reconciliation.mjs` shows that the lab returns the paper's −$58,419 under the paper's assumptions. The lab's −$8,042 base case comes from two of its defaults: pension paid for remaining life expectancy, not 30 years (+$47,996), and a $2,500 cost of leaving (+$2,381).

**Also corrected:** Frank et al., 4th edition, is 2019, not 2022. This is fixed in the paper PDF (two places, same character widths, no layout change) and in the brief, spec, memo, crosswalk and analysis. Dated drafts and earlier builds keep their original text as history. The revision 3 draft snapshot was re-extracted after its original extraction failed on a text-encoding error.

**Open, for the author:** whether the revision 17 insert goes in (item 4 of the review). If it does, rerun its figures under the paper's assumptions before rebuilding the PDF. Because the PDF changed, upload the updated `analysis/research-paper.pdf` to Lamaku.
