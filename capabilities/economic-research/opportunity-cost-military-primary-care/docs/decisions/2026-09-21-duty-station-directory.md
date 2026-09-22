# Duty-station search and directory

The user reported no response when searching Marine Corps Base Hawaii and requested Navy and Marine Corps installation coverage.

Reproduced a timing defect: searching before the installation JSON arrived displayed no matches, and the results never refreshed. The fix distinguishes loading, unavailable data and no matches, refreshes results after loading, and lets reference-pay loading proceed independently. Search now matches normalized words in any order and does not silently truncate results at ten.

The directory grows from 33 to 108 entries. It includes every Navy/Marine Corps entry and relevant joint installation identified on [MilitaryINSTALLATIONS](https://installations.militaryonesource.mil/view-all), retaining existing medical facilities. Each imported entry has a directorySource and region. Newly verified domestic ZIPs are sourced to public installation contact records or CNIC contact/housing pages. Existing separately sourced facility ZIPs remain distinct from installation headquarters ZIPs. Naval Base Kitsap spans locations and requires the user's orders ZIP. Overseas entries do not reuse domestic BAH; users enter their verified allowance.

This is broad public-installation coverage, not a claim to enumerate every tenant command, reserve center, ship, annex or detachment. MilitaryINSTALLATIONS itself says it is not exhaustive. Manual duty ZIP entry remains available. Verify every suggested facility ZIP against orders before relying on its BAH lookup.

Validation: headless Edge browser tests pass for Marine Corps Base Hawaii -> 96863 and populated BAH, MCBH alias, reordered search words, more than ten results, no matches, missing ZIP, overseas selection, delayed JSON arrival, and failed JSON with working manual ZIP entry. No browser JavaScript errors in these runs. Test with PLAYWRIGHT_MODULE as needed and run node tests/check-duty-station-search.cjs.
