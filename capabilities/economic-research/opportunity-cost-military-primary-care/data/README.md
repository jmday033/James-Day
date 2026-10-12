# Lab reference data

The two lab views load these files in the browser. The data are public reference tables, not user submissions.

| File | Vintage | Contents | Source and review |
| --- | --- | --- | --- |
| `bah-2026.json` | 2026 | ZIP-to-military-housing-area mapping and monthly O-4/O-5/O-6 rates, with and without dependents | [DoD BAH lookup](https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/) and the previously used [normalized crosswalk](https://www.vahomemath.com/data/bah/2026.json). `XX499` is an unmapped/special ZIP marker and yields no domestic BAH amount. Check a member's LES for rate protection and exceptions. |
| `malpractice-ranges-2026.json` | 2026 | State ranges in pediatrics, internal medicine, and family medicine order | [Published carrier-rate ranges](https://healthcaredealhub.com/medical-liability/). These are starting points, not statistical averages or quotes. |
| `duty-stations.json` | Reviewed for this project | Search names, representative ZIPs, aliases, and source URLs for Navy and Marine Corps locations | Individual official facility/installation links in each record. A selected ZIP still needs confirmation against orders. |

The BAH file has one ZIP mapping per line so changes can be reviewed. On refresh, update the vintage label in both lab views, source notes, and any fixed paper scenario before publishing. Run `node tests/check-calculation-engine.mjs` and `node tests/check-special-pay-and-pension.mjs`; compare the fixed outputs before accepting a new rate year.

The full lab's **Share lab** button sends only the fixed page URL. Stay or go? and the full lab count page views with GoatCounter (jmday033.goatcounter.com), a cookie-free counter. It receives the page address, referring site, and standard network metadata, never form inputs. Counts are visible only to the site owner.

