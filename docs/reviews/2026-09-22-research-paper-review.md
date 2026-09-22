<!-- PR TARGET: https://github.com/jmday033/James-Day | Individual Research Paper -->
# Individual Research Paper — pre-deadline read

**What I read.** `capabilities/economic-research/opportunity-cost-military-primary-care/paper/`
— the revision-3 PDF (all nine pages, extracted), the revision-2 PDF and its metadata, `README.md`,
and your own submission-readiness review · the revision-2 and revision-3 extractions and `README.md`
in `drafts/` · `research-brief.md` · `spec.md` · the capability-root `spec.md` and both
`README.md` files · `analysis/physician-retention-analysis.md` ·
`decisions/physician-retention-economics-memo.md` · `course-economics-crosswalk.md` ·
`prompt-log.md` · the redirect stubs and the `navy-physician-compensation/` tombstone · the full
file tree at `3427235` and the fifteen commit subjects since the last read.

**What I did not open this pass.** The 7,405-word long Markdown draft and the long working PDF
beyond spot checks · `calc-engine.js` · `gmo-residency-model.js` · `physician-pay-lab.html` and
`quick-lab.html` · `tests/` · `build_comparison.py` · the BAH, duty-station and malpractice JSON ·
the pension-sensitivity CSV · `archive/pre-consolidation/` · the eight imported `.claude/skills/`.
If something in those changes an item below, say so and I will look.

---

**Both of the items that blocked the last read are closed.** The paper no longer recommends a
$25,000 bonus — revision 3 recommends a communication pilot with an evaluation design, which is the
hypothesis the brief, spec and memo already argued, so the fork is gone rather than papered over.
And the paper now runs the committed scenario: O-4 past ten years, ZIP 92134, Marit Health at
$459,057, 5 percent, $717,126 undiscounted and $636,209 in present value — the same case the
analysis file runs. The Asch/Mattock/Hosek range left with the bonus recommendation and survives
only in the long draft and the source review, where it is history and belongs. The DACES
placeholder is gone, Dahle carries a 2021 date and URL, GAO's "21 of 27" is now attributed to
GAO-20-165 with the caveat that it does not prove a current gap, Figure 1 is a chart on its own
page, and the body is four pages. The duplicate trees are resolved too: the capability-root labs
are 646- and 678-byte redirect stubs, not copies, and `navy-physician-compensation/` is a tombstone.

**Which file is the paper is now the open question, and it governs the rest.** `paper/README.md`
names the final target as `analysis/research-paper.pdf` at repository root; that path does not
exist, and `analysis/` holds your perfect-competition work. Meanwhile `paper/` holds four PDFs,
`drafts/` holds five files, and `paper/README.md` calls revision 2 the "latest additional draft"
in the header while revision 3 is described further down. `capabilities/economic-research/README.md`
still routes a reader to the long working draft and says it "requires shortening for final
submission" — that sentence is two revisions stale. Name revision 3 as the submission candidate in
one place and make the other pointers agree; every item below is an edit to that one file.

**Two numbers in revision 3 trace to nothing committed.** The civilian-salary sensitivities —
$350,000 and $400,000 reducing the four-year gap to about $249,500 and $426,800 — appear in no
Markdown, CSV, JSON or lab file in the repository. Dahle (2021) supports within-specialty variation,
not those two figures. Put the calculation in `analysis/` or the lab, as you did for the 3 and 7
percent rows, which do reconcile.

**Anonymity is fixed and you found it yourself.** Revision 2 carried `/Author: James M. Day` in
the PDF information dictionary; revision 3's author field is empty and the name appears nowhere in
the file's bytes. Your submission review is where I learned that, along with the Times-Roman
versus embedded Times New Roman substitution, the margin confirmation, the 9- and 10-point table
and bibliography, and the uncited Agarwal — that is a list you wrote, not one I found, and the
uncited reference is already out of revision 3.

Two things I cannot verify and you can: whether the $48,000 four-year agreement matches the
Navy-specific Medical Corps eligibility and rate you told yourself to confirm, and whether the
pilot's presumed low cost holds once budgeted. And `vendor/pdfjs/` is still in the tree, now under
the project directory.

**In order:**

1. Designate revision 3 as the submission candidate; fix `paper/README.md`'s dead
   `analysis/research-paper.pdf` target and the stale capability `README.md` pointer.
2. Source the $350,000 and $400,000 sensitivities to a committed file, or drop them.
3. Finish the formatting items from your own submission review: embedded Times New Roman,
   margins confirmed in the source editor, 12-point double-spaced references.
4. Verify the $48,000 agreement rate and eligibility, and remove `vendor/pdfjs/`.
