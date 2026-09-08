<!-- PR TARGET: https://github.com/jmday033/James-Day | Stage 1.2 -->
# Stage 1.2 review — spec, build, audit

**Spec:** [`capabilities/marginal-analysis/spec.md`](https://github.com/jmday033/James-Day/blob/main/capabilities/marginal-analysis/spec.md)

> Graded early, at the instructor's request. Stage 1.2 is not due yet and no submission was required — you are the only student in the cohort with a complete spec, workbook, and capability README, so this is formative feedback ahead of the deadline. Nothing about it is final: if you revise before the due date, the stage is re-graded and the score can only go up.

| Criterion | Where it stands |
|---|---|
| Spec completeness — inputs, structure, calculation flow | All 24 inputs named with units and a source. The labor function, the permanent-then-temporary costing convention, and the blended-rate allocation are all stated in named-range notation, and the sheet structure is specified down to the tab names. The thing that lifts this above "complete" is the paragraph telling the builder that the published $34.72, $17.36, and 0.833 are rounded descriptions rather than calculation inputs, and to derive all three from salary and paid hours instead. That instruction is the reason your workbook reconciles to the cent. One small thing keeps it off everything this criterion asks for: FARMER_TOTAL_HOURS = 1,440 is sourced to "Case scenario," but the case gives 40 hours a week over a 36-week season with half of it in the field — 1,440 is your derivation, not a stated figure, and the input table is the one place where derived and given should be visibly different. |
| Spec validation rules | You wrote these before the build and they are complete: the q = 1 hand check for all three crops, the published check figures as acceptance criteria, the standalone crossings, the two Solver starting points, and the structural rules — every calculated cell a formula, no error cells, every constraint with a visible status. The explicit tolerance table (hours to 0.01, dollars to $1, quantities exact) is what turns "approximately" into something that can actually pass or fail. |
| Workbook satisfies the contract | I opened the workbook and checked it myself rather than relying on your Checks sheet, then solved the case independently to compare against. 47 workbook-level defined names, all absolute, none relative. 165,295 formulas and zero error cells across six sheets. Every constraint check reads PASS. Both Solver starting points are recorded and agree. And every figure reproduces exactly: labor 5,277.22 hours, 3.1647 temporary workers, labor cost $104,118.34, profit $42,761.66, tomato marginal cost $8,248.59 at bed 10 and $9,390.72 at bed 11, crossings at 10 / 10 / 6, q = 1 labor of 99.00 / 30.75 / 45.56 hours. My own brute-force search over the whole feasible integer space returns 10 / 20 / 30 at $42,761.66. Your workbook is right to the cent. |
| Audit note | You ran five checks, each naming what it would have caught, plus four documented defects with their fixes. The checking you did is the strongest part of a strong submission — see below. |

### What makes this the strongest submission in the cohort

Three things, and all of them are about how you checked your work rather than about the answer itself.

- You caught a workbook that was right for the wrong reason. Your first build "displayed the published 10/20/30 result in the Solver decision cells but did not independently derive it." That is the single most dangerous failure mode in modeling, and it is nearly invisible — the numbers match, the checks pass, and nothing is actually being computed. You found it and replaced it with a formula-driven exhaustive search over all 13,671 permitted combinations, then reconciled the Solver cells to it. Most people would never have looked.

- You rejected your own first explanation. When labor cost came out low, the carrot-price adjustment theory would have made the numbers tie out, and you threw it away because it "only compensated for understated labor cost." Recognizing a compensating error — two wrongs that produce a right answer — is a genuinely hard thing to do, and writing down that you rejected it is harder still.

- You traced the precision defect to its root twice. The first build treated the displayed wage rates as exact. The second fixed the wages and still treated carrot labor of 0.833 as exact. You went back a third time and derived all three at full precision. That is why your profit is $42,761.66 rather than something a dollar or two off — and it is worth knowing that your figure is the more precise one. The published $42,762 is the rounded statement of the same number.

### What I'd sharpen

Nothing that costs you points beyond the one noted above. Three things worth your thinking about:

- Separate given inputs from derived ones in the input table. FARMER_TOTAL_HOURS, FARMER_RATE, TEMP_RATE, and CARROT_HOURS are all derived, and the table currently sources the first of them to the case. A "Source" column that says "derived: FARMER_SALARY / FARMER_TOTAL_HOURS" rather than "Case scenario" lets the spec check itself — a reader can see at a glance which numbers came from the case and which came from you. Given that a rounded-input defect is exactly what bit you twice, this is the change most likely to prevent a repeat.

- Consider the cost of the exhaustive-search panel. It is the right call and I would keep it — it is what makes the optimum independently derived rather than asserted. But 13,671 formula rows is why the workbook is 2.8 MB, and it will recalculate slowly on a modest machine. Worth a line in the spec noting the trade-off you accepted, because "why is this file so large" is a question a reviewer will ask before they ask anything else.

- Your Stage 3 comparison rules are the right idea in the right place. Fixing the interpretation before you see the comparison — deciding that within two beds counts as close and three or more counts as materially far — is what stops Stage 3 from grading itself generously. One caution: those rules are now part of the frozen record too. Do not loosen the two-bed band later if 10 turns out to be inconvenient. As written, your own rule says the model contradicted your hypothesis, and saying so plainly will be worth more in Stage 3 than any amount of hedging.

### Where this leaves you for Stage 3

Your brief predicted 14 / 20 / 30 and the model returned 10 / 20 / 30, with four beds idle. You already have the shape of the Stage 3 argument: carrots and mesclun ran to their caps as you predicted, so the diminishing-returns reasoning was sound for those two; tomatoes stopped four beds short of your estimate because the 10% compounding pushed marginal cost through the $8,800 price sooner than you judged. The land constraint you implicitly assumed would bind is slack, which you have already noted.

The tomato marginal-cost dip around bed six is in your schedule and you correctly left it unexplained here. That explanation is a Stage 3 deliverable and it is the best question in this case, so it is worth sitting with before you write it: marginal cost is not required to rise monotonically, and something specific about this cost structure makes it fall right there.

### Why this came by email and not as a pull request

Everyone else in this cohort got their Stage 1.1 review as a pull request on their own repository — the feedback attached to the actual file, commentable line by line, with a thread to reply in. I cannot open one on your repo because I do not have push access, so this is the next best channel.

This is the stage where it starts to cost you something. A spec and a workbook are exactly the kind of deliverable where the useful comment is anchored to a specific line — "this input is derived, not given" belongs next to that row, not in a paragraph three screens away. You are the furthest ahead in the cohort and the one who would get the most out of line-level review.

To turn it on: on github.com, open your repository, then Settings, then Collaborators, then Add people, then enter adamwstauffer and confirm. Tell me once you have and I will switch you over for Stage 3 — the review for this stage is already written as a pull request and can be posted the same day.

### A note on the point value, new as of today

This stage is now worth real marks rather than the 8 in the stage brief, and Stage 1.3 — the analysis, the memo, and the prompt log — is now worth 15 as well. That is because Cases 2 and 3 have been dropped for this cohort, so Case 1 is the case.

What that means in practice: this stage and the next one are together worth 30 of the 35 points on the case. Stage 0 and Stage 1.1 are 2.5 each. The weight has moved onto the build and the analysis, which is where the work actually is.

Nothing about the grading changes — the scoring is unchanged and is converted at the end. The stage brief and the case page still show the old numbers; they have not been updated yet.

---

### How to work this review

Treat this PR the way an analyst treats feedback from a senior reviewer — a review is a proposal to engage with, not a checklist to rubber-stamp.

1. **Read it yourself first.** Form your own view before you change anything. Disagreeing *with a documented reason* is a legitimate, senior response.
2. **Stress-test it with an LLM.** Paste this review and your spec into your assistant and ask it to (a) explain anything you are unsure of, and (b) argue the *other side*.
3. **Then correct the spec, not the workbook.** When a check fails, you fix the specification and regenerate, so the document keeps describing what was actually built.
4. **Close the loop.** Reply in this thread with what you changed and what you pushed back on, then commit and push.

*Your score and the per-criterion breakdown are in your Lamaku comment, not here — this repository is public.*

— Adam
