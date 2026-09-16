/**
 * Mirrors next.config.ts's basePath. Raw `window.location`/`<a href>` links
 * built outside next-intl's Link/router (which auto-prefix basePath) need
 * this manually, since GitHub Pages serves the site under /Jobzapp.
 */
export const BASE_PATH = "/Jobzapp";
