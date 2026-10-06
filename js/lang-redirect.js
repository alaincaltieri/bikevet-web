/**
 * BikeVet – Language detection & auto-redirect.
 *
 * MUST be loaded synchronously in <head>, AFTER the
 * <link rel="alternate" hreflang="…"> tags, so the redirect happens
 * before the page is painted (no flash of the wrong language).
 *
 * Resolution order:
 *   1. Explicit choice saved by the header language switcher (localStorage)
 *   2. First supported language in the browser's preferred languages
 *   3. English (default)
 *
 * Pages without hreflang alternates (e.g. terms, privacy) never redirect.
 * Also exposes `window.BikeVetI18n`, used by components.js for the switcher.
 */
(function () {
  var STORAGE_KEY = 'bikevet-lang';
  var SUPPORTED = ['en', 'it'];
  var DEFAULT_LANG = 'en';

  function normalize(code) {
    return String(code || '').toLowerCase().split('-')[0];
  }

  function isSupported(code) {
    return SUPPORTED.indexOf(code) !== -1;
  }

  function getStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return isSupported(stored) ? stored : null;
    } catch (e) {
      return null; // storage unavailable (e.g. privacy mode)
    }
  }

  function setStoredLang(lang) {
    if (!isSupported(lang)) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* ignore */ }
  }

  function getBrowserLang() {
    var langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
    for (var i = 0; i < langs.length; i++) {
      var code = normalize(langs[i]);
      if (isSupported(code)) return code;
    }
    return DEFAULT_LANG;
  }

  function getPreferredLang() {
    return getStoredLang() || getBrowserLang();
  }

  function getPageLang() {
    return normalize(document.documentElement.lang) || DEFAULT_LANG;
  }

  function isTranslatedPage() {
    return !!document.querySelector('link[rel="alternate"][hreflang]');
  }

  /**
   * Returns the same-origin path of this page in `lang`, or null if the page
   * has no version in that language. Mirrors the current URL style: when
   * browsing with ".html" URLs (e.g. local dev servers), ".html" is appended.
   */
  function getAlternatePath(lang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if (!link) return null;
    var path = new URL(link.href).pathname;
    if (/\.html$/.test(window.location.pathname) && !/(\/|\.html)$/.test(path)) {
      path += '.html';
    }
    return path;
  }

  window.BikeVetI18n = {
    STORAGE_KEY: STORAGE_KEY,
    SUPPORTED: SUPPORTED,
    DEFAULT_LANG: DEFAULT_LANG,
    getPreferredLang: getPreferredLang,
    setStoredLang: setStoredLang,
    getPageLang: getPageLang,
    isTranslatedPage: isTranslatedPage,
    getAlternatePath: getAlternatePath
  };

  // ---- Auto-redirect ----

  // Never redirect crawlers: they must be able to index every language version.
  if (/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)) return;

  var preferred = getPreferredLang();
  if (preferred === getPageLang()) return;

  var target = getAlternatePath(preferred);
  if (!target || target === window.location.pathname) return;

  // replace() keeps the redirect out of history, so "Back" doesn't bounce.
  window.location.replace(target + window.location.search + window.location.hash);
})();
