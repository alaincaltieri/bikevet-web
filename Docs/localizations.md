# BikeVet Multi-Language Architecture

This document describes the design choices and implementation details for the multi-language (i18n) support on the BikeVet static website.

## Architecture Overview

*   **Client-Side Detection & Redirect**: Because the website is hosted on GitHub Pages, we cannot rely on server-side logic (like reading `Accept-Language` headers) to serve the correct language. Detection and redirection must happen entirely client-side.
*   **Synchronous Script**: The redirection logic (`js/lang-redirect.js`) runs synchronously in the `<head>` of the document. This ensures that the redirect happens *before* the browser paints the page, preventing a "flash" of the wrong language.
*   **Single Source of Truth (`hreflang`)**: We do not maintain a hardcoded mapping of URLs in JavaScript. Instead, the relationships between translated pages are defined using `<link rel="alternate" hreflang="...">` tags in the `<head>`. The redirect script and the language switcher read these tags to determine where to send the user.
*   **User Preference Storage**: When a user explicitly selects a language using the switcher in the header, their choice is saved to `localStorage` under the key `bikevet-lang`. This preference overrides the browser's default language on subsequent visits.
*   **Language-Aware Partials**: The header and footer are injected dynamically by `js/components.js`. The script determines the current interface language and fetches the appropriate partial (e.g., `/header.html` for English, `/it/header.html` for Italian).
*   **Root-Absolute Paths**: All shared assets (CSS, images, JS) and partials use root-absolute paths (e.g., `/css/styles.css`, `/media/icon.png`). This is critical because a page at `/it/support.html` needs to load the exact same CSS file as `/support.html` without breaking.

---

## How to Add a New Language

To add support for a new language (e.g., French, `fr`):

1.  **Update the Redirect Script**: 
    Open `js/lang-redirect.js` and add the new language code to the `SUPPORTED` array:
    ```javascript
    var SUPPORTED = ['en', 'it', 'fr'];
    ```
2.  **Create the Subdirectory**: 
    Create a new folder for the language at the root of the project (e.g., `fr/`).
3.  **Create Localized Partials**: 
    Create `fr/header.html` and `fr/footer.html` with translated navigation links.
4.  **Update All Language Switchers**: 
    Edit the `.lang-switch` navigation inside **every** header partial (`header.html`, `it/header.html`, `fr/header.html`) to include the new language option:
    ```html
    <nav class="lang-switch" aria-label="Language">
      <a href="/it/" data-lang="it" hreflang="it" lang="it" title="Italiano">IT</a>
      <a href="/" data-lang="en" hreflang="en" lang="en" title="English">EN</a>
      <a href="/fr/" data-lang="fr" hreflang="fr" lang="fr" title="Français">FR</a>
    </nav>
    ```
5.  **Translate Content Pages**: 
    Create the translated pages inside the new folder (e.g., `fr/index.html`, `fr/support.html`).
6.  **Update `hreflang` Tags**: 
    In the `<head>` of **every** version of the translated pages, update the alternates list to include the new language. For example, in `index.html`, `it/index.html`, and `fr/index.html`, you must have:
    ```html
    <link rel="alternate" hreflang="en" href="https://bikevet.app/">
    <link rel="alternate" hreflang="it" href="https://bikevet.app/it/">
    <link rel="alternate" hreflang="fr" href="https://bikevet.app/fr/">
    <link rel="alternate" hreflang="x-default" href="https://bikevet.app/">
    ```

---

## How to Add a New Page

### Scenario A: A Page Translated in All Languages
If you are adding a new page like `about.html` that has translations:

1.  Create `about.html` in the root directory (English default).
2.  Create the translated versions in the subdirectories (`it/about.html`).
3.  Add the `hreflang` links to the `<head>` of **all** versions to tie them together:
    ```html
    <link rel="alternate" hreflang="en" href="https://bikevet.app/about.html">
    <link rel="alternate" hreflang="it" href="https://bikevet.app/it/about.html">
    <link rel="alternate" hreflang="x-default" href="https://bikevet.app/about.html">
    ```
4.  Ensure `<script src="/js/lang-redirect.js"></script>` is loaded in the `<head>` immediately after the `hreflang` tags.

### Scenario B: A Page NOT Translated (or only in a subset of languages)
If you are adding a page like `terms.html` that only exists in English:

1.  Create the page in the root directory.
2.  **Do NOT** add `hreflang` tags for languages that don't exist. If it only exists in English, you can omit the `hreflang` tags entirely.
3.  **DO** include the redirect script: `<script src="/js/lang-redirect.js"></script>`. 
    *Why?* The script recognizes that the page lacks alternates and will safely abort the redirect. However, it still provides helper functions to `components.js` so that the header and footer injected into the page match the user's preferred language, keeping the navigation UI coherent.

---

## Implementation Notes & Maintenance

*   **Local Testing Requires a Server**: Because the site relies heavily on root-absolute paths (`/js/...`), opening HTML files directly in your browser (`file:///Users/...`) will not work. You must run a local web server (e.g., `python3 -m http.server`) to test the site.
*   **Dynamic Switcher Links**: The `href` attributes in the hardcoded `.lang-switch` HTML are just fallbacks (pointing to the homepages). When `components.js` runs, it dynamically updates these `href`s to point to the exact translated counterpart of the current page, by reading the `hreflang` tags.
*   **Active Link Highlighting**: `components.js` normalizes paths to figure out which navigation link should get the `.active` class. It strips `.html` extensions and trailing `index` segments to ensure that `/it/`, `/it/index.html`, and `/it/index` are all treated as the same path.
*   **Crawler Exception**: `js/lang-redirect.js` explicitly aborts the redirect if the user agent is a search engine crawler (Googlebot, etc.). Crawlers must be able to index all paths without being forcefully redirected to the default English version.
*   **Localized JavaScript Strings**: To avoid maintaining a translation dictionary inside the JavaScript code, localized strings (like the "Sending..." text on forms) should be passed via `data-` attributes in the HTML. (e.g., `<button data-sending-label="Invio in corso...">`).
