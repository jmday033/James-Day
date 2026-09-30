# Revision 4 build files

Regenerates `../navy-physician-retention-revision-7.docx` and its figures.

```sh
python3 fig.py      # Figure 1: annual cash and four-year cumulative PV gap (5% real)
python3 fig2.py     # Figure 2: stay-to-20 pension pull (pension 3% real, cash 5% real); unchanged from revision 4; Table 3 values come from ../../stay-or-go.js
node build.js       # Word file (requires the `docx` npm package)
soffice --headless --convert-to pdf navy-physician-retention-revision-7.docx
```

Key inputs: O-4 over-10 with dependents, ZIP 92134; Navy gross cash $276,966 (2027–28) and $282,585 (2029–30) including a conditional $48,000 RB; Marit San Diego internist average $459,057; $48,000 BRS pension ($120,000 High-3), 30 real payments. Figure 2 and Table 2 match `stayToTwentyCurve` in `../../calc-engine.js`, which the tests check.

Revision 7 replaces both figures: `python3 fig_r7.py` writes figure1.png (stay-to-20 break-even, gross vs after tax, using fig7.json from `stayOrGo`) and figure2.png (waterfall matching Table 3). `fig.py` and `fig2.py` are the retired revision 6 figures.
