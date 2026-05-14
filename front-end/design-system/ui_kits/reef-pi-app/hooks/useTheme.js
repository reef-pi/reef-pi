/*
 * Theme persistence + system detection.
 *
 * Choices: 'light' | 'dark' | 'actinic' | 'system'
 * Default: 'system' (follows prefers-color-scheme; actinic only via manual pick
 *          or AcitnicSchedule (#23) setting).
 *
 * Side effects on setTheme():
 *   1. Writes localStorage.reefpi.theme
 *   2. Sets <html data-theme="…"> (or removes attr for 'light')
 *   3. Fires CustomEvent 'reefpi:theme-change' with detail { theme }
 *
 * First-paint: call applyPersistedTheme() in a <script> before </head>
 * to avoid FOUT.
 *
 * Usage:
 *   const { theme, setTheme, resolvedTheme } = useTheme()
 */

import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'reefpi.theme'
const THEMES      = ['light', 'dark', 'actinic', 'system']

function systemPreference () {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve (choice) {
  return choice === 'system' ? systemPreference() : (choice ?? 'light')
}

function applyToDOM (choice) {
  const resolved = resolve(choice)
  const html = document.documentElement
  if (resolved === 'light') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', resolved)
  }
  html.dispatchEvent(new CustomEvent('reefpi:theme-change', { detail: { theme: resolved }, bubbles: true }))
}

export function useTheme () {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'system' } catch { return 'system' }
  })

  // Apply on mount + whenever theme changes
  useEffect(() => { applyToDOM(theme) }, [theme])

  // React to system-preference changes when choice === 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyToDOM('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback(choice => {
    if (!THEMES.includes(choice)) return
    try { localStorage.setItem(STORAGE_KEY, choice) } catch {}
    setThemeState(choice)
  }, [])

  return { theme, setTheme, resolvedTheme: resolve(theme) }
}

/*
 * Call this inline in <head> before CSS loads to avoid flash:
 *
 *   <script>
 *     (function(){
 *       var t = localStorage.getItem('reefpi.theme') || 'system';
 *       var r = t === 'system'
 *         ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
 *         : t;
 *       if (r !== 'light') document.documentElement.setAttribute('data-theme', r);
 *     })();
 *   </script>
 */
export const FIRST_PAINT_SCRIPT = `(function(){var t=localStorage.getItem('reefpi.theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;if(r!=='light')document.documentElement.setAttribute('data-theme',r);})();`
