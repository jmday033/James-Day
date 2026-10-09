# James "Mitch" Day — feedback, sweep of 2026-10-08

This pull request answers #15 and #17.

## Research paper review — pre-deadline read

This read covers main and #17, and it is my answer to your comment in #15.

**What I read.** On main: every file #16 changed, in full · `physician-pay-lab.html`, its copy and its default inputs · the defaults in `stay-or-go.js`. In #17: every changed file, and the revised 28-page PDF's Recommendation page and Appendix F in full. I ran `appendix_calculations.py`, `lab_reconciliation.mjs` and `pilot_feasibility.py`.

**What I did not open this pass.** The tests, which I did not run · the rest of the Stay or go? page · the hospitalist work. If something in those changes an item below, say so and I will look.

---

**What landed.** The brief and the spec now ask the question the paper answers, and the amendment note gives the reason in one sentence: "A four-year comparison stops before pension eligibility, so it omits the pension, the main financial reason to stay." `appendix_calculations.py` reports "56 of 56 figures match the paper." Frank et al. is 2019, the README lines are fixed, the revision 3 extraction holds the paper's text, and you decided revision 17 out, in writing. #17 keeps the −$8,042 scenario apart from the lab's current defaults, and the Recommendation now asks a question before it spends money: "First establish whether eligible physicians materially misunderstand benefits."

**The lab.** `physician-pay-lab.html` still tells a reader it can "verify figures behind the accompanying paper." Its defaults are not the paper's: a 22% pension tax, a $130,000 High-3, 25 payments, age 40, four years. Your reconciliation shows the lab's current defaults move the paper's −$58,419 to +$94,239. Which tool should a reader of the paper use to verify it, and should that page's copy or its defaults say so? Should the advanced lab keep 22%? The paper still names neither lab; should a reader of the paper know the tool exists?

**Two of the paper's own choices.** Your reconciliation puts most of that gap in two steps: assumed promotion (+$111,379) and pension paid for remaining life expectancy rather than 30 years (+$47,996). The spec says "No promotion is assumed," and the paper pays 30 pension payments. Why does the paper leave promotion out for an internist who stays ten more years, and why 30 payments rather than life expectancy? Is either worth a sentence in the paper?

**Appendix F.** `pilot_feasibility.py` reproduces 240 commands and 4,800 physicians. F10 says that scale "may exceed the available eligible population." How many Navy physicians actually reach the end of an obligation in a year, and is there a source the paper could cite?

**Lamaku.** The Lamaku copy is the one I grade, and it is still the earlier PDF. Merge #17 when you are satisfied with it, then upload `analysis/research-paper.pdf` before the deadline; the latest upload is the one graded. The amendment note ("Open, for the author") and the project README still call revision 17 open.

**In order:**

1. Merge #17, then upload the revised PDF to Lamaku. Ten minutes.
2. Decide which tool a reader of the paper should use to verify it, and make that page's copy or its defaults say so, including whether the advanced lab keeps 22%.
3. Decide whether the paper mentions the lab.
4. Answer in the text whether leaving out promotion and paying 30 pension payments each need a sentence on why.
5. Answer in Appendix F whether the eligible population can support the trial it sizes.
6. Mark revision 17 as decided in the amendment note and the project README.

Closes #15
