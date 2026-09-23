<!-- PR TARGET: https://github.com/jmday033/James-Day | Individual Research Paper -->
# Research paper review — pre-deadline read

**What I read.** `docs/papers/navy-primary-care-physician-retention-draft.md` ·
`docs/briefs/research-brief.md` · `capabilities/economic-research/spec.md` ·
`capabilities/economic-research/README.md` · `capabilities/economic-research/course-economics-crosswalk.md` ·
`docs/decisions/physician-retention-economics-memo.md` · `analysis/physician-retention-analysis.md`
(table, checks and source register) · the repository file tree.

**What I did not open this pass.** `prompt-log.md` · `physician-pay-lab.html` · `quick-lab.html` ·
`calc-engine.js` · `gmo-residency-model.js` · `tests/` · `build_comparison.py` · the CSV and BAH/duty-station
JSON. If something in those changes an item below, say so and I will look.

---

**The paper is the only artifact arguing the bonus.** Your brief, spec, memo, analysis and capability
README all argue the information hypothesis at current pay rates — your memo's recommendation is to
quantify the opportunity cost and test whether accurate communication about real Navy opportunities
changes acceptance and retention. Your spec is explicit that the model "does not recommend, enter, or
calculate a new retention-bonus rate." The paper recommends a $25,000 annual bonus increase.

Analysis and Recommendation are the two heaviest criteria, and both ask whether the recommendation
follows from the analysis in front of it. Two honest exits: amend the brief and spec so the bonus
question is the stated question — the history records the amendment, which is what history is for —
or write the paper your memo already argues. The second is closer than it looks; the memo is that
paper's spine. It is also the sharper claim: a message cannot close a $68,000 gap, but here is who it
moves and why. One caution if you take it — "run a study and measure it" is a research agenda, not a
recommendation. The rubric wants something a decision-maker can do.

**Your paper and your model are two different models.** The paper runs a fixed scenario — an O-5 at
$239,000, internal medicine at $307,000, a $68,000 gap at 4 percent. Your committed analysis runs an
O-4 past ten years at ZIP 92134 on Marit Health San Diego benchmarks at 5 percent, where pediatrics is
$303,974 against the paper's $265,000. Your capability README already names this, along with the
citation checks and the placeholder reference — so this is a list you wrote, not one I found. Both
scenarios are defensible; the repository can only support one. Pick it, put it in the spec, and make
the paper's numbers the spec's numbers.

**Sources.** The 0.8–1.5 elasticity from Asch, Mattock and Hosek turns $25,000 into "8–16 percent," so
the recommendation rests on it — give it a page number and keep your caveat that it was not estimated
on this population. If you take the information exit, the range and the claim go out together.
`[Army DACES study]` is still a bracketed placeholder. Frank et al. is cited as 2022 in the paper, the
memo and the crosswalk; the edition this course assigns is the fourth, 2019 — check the copyright page,
and check your page numbers with it, in all three places. Dahle is `n.d.` when your brief carries the
dated URLs.

**Is $25,000 available under existing special-pay authority, or would it need a statutory change?** If
it needs Congress, the paper has to say so — and that constraint is itself an argument for the
information hypothesis, which is executable now. A recommendation nobody can act on is a weaker one.

**Two mechanical items.** The draft runs about 1,560 words against roughly a thousand for four
double-spaced pages, and the figure is not in yet — cut the section rather than the sentences, starting
with "Economic Analysis Continued," where the first section ran long and the heading papers over it.
The page limit sits under timeliness and adherence to constraints, a quarter of the paper's grade on
its own. Your Figure 1 is a table, which leaves Graph/Chart/Diagram unmet at ten percent;
`physician-retention-cumulative-gap.svg` is sitting unused and plots what the argument turns on.

**Repo.** Brief, analysis, memo, spec, CSV and figure each exist twice — canonically and under
`capabilities/economic-research/navy-physician-compensation/` — so delete a set before they diverge.
`vendor/pdfjs/` does not belong in a portfolio repo. The paper sits at `docs/papers/` as one undated
file where the workflow asks for dated snapshots in `drafts/`; your commit history memorializes the arc,
so this is a path fix, but `drafts/` is where a reader will look. Your byline is on the first body page,
and review is anonymous — it belongs on the title page only.

**In order — item 1 decides how much of 2–6 you need:**

1. Decide which hypothesis the paper tests; amend the brief and spec to match.
2. Reconcile the scenarios; the paper's numbers become the spec's numbers.
3. Page the elasticity, or drop it with the bonus recommendation.
4. Fix the three references (DACES placeholder, Frank edition, Dahle date).
5. Swap the Figure 1 table for the SVG you already built.
6. Cut to length — the section, not the sentences.
