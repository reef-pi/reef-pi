/**
 * reef-pi Design System — preview card theme handler
 *
 * Applies the ?theme= query-string parameter to <html> data-theme on page
 * load, so reviewers can open any card in a specific theme:
 *
 *   colors-states.html?theme=dark
 *   colors-states.html?theme=actinic
 *   colors-states.html?theme=light   (or omit — light is the default)
 *
 * Runs before DOMContentLoaded to avoid a flash of unstyled content.
 */
(function () {
  var theme = new URLSearchParams(location.search).get('theme');
  if (theme && theme !== 'light') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}());
