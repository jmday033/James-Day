# pdf.js (vendored)

Kept on purpose. The advanced lab (`physician-pay-lab.html`) uses these files to read a pay statement (LES) PDF that a reader uploads. The PDF is read in the reader's own browser, and nothing is sent anywhere. The lab runs on GitHub Pages without a build step or third-party CDN, so the library ships with the page. Removing this folder would break that feature. The paper does not depend on it. License: `LICENSE` (Apache 2.0, Mozilla pdf.js).
