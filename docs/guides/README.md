# reef-pi build guides

Working copies of the seven reef-pi build guides published on
[Adafruit Learn](https://learn.adafruit.com/). **Readers use the Adafruit pages.** These Markdown files
exist so that people and coding agents (Codex, Claude Code) can read, diff and update the guides next
to the code; changes are copied back to Adafruit by hand. Tracking issue: #3250.

| # | Guide | Adafruit Learn | Folder | Status |
|---|---|---|---|---|
| 1 | Setup and Demonstration | [reef-pi-installation-and-configuration](https://learn.adafruit.com/reef-pi-installation-and-configuration) | [`01-setup-and-demonstration`](01-setup-and-demonstration/README.md) | refreshed for 7.0 |
| 2 | Power Controller | [reef-pi-power-controller](https://learn.adafruit.com/reef-pi-power-controller) | [`02-power-controller`](02-power-controller/README.md) | refreshed for 7.0 |
| 3 | Temperature Controller | [reef-pi-guide-3-temperature-controller](https://learn.adafruit.com/reef-pi-guide-3-temperature-controller) | [`03-temperature-controller`](03-temperature-controller/README.md) | refreshed for 7.0 |
| 4 | Water Level Controller | [reef-pi-water-level-controller](https://learn.adafruit.com/reef-pi-water-level-controller) | [`04-water-level-controller`](04-water-level-controller/README.md) | refreshed for 7.0 |
| 5 | Light Controller | [reef-pi-lighting-controller](https://learn.adafruit.com/reef-pi-lighting-controller) | [`05-light-controller`](05-light-controller/README.md) | refreshed for 7.0 |
| 6 | pH Monitoring | [reef-pi-guide-7-ph-monitoring](https://learn.adafruit.com/reef-pi-guide-7-ph-monitoring) | [`06-ph-monitoring`](06-ph-monitoring/README.md) | refreshed for 7.0 |
| 7 | Dosing Controller | [reef-pi-guide-5-dosing-controller](https://learn.adafruit.com/reef-pi-guide-5-dosing-controller) | [`07-dosing-controller`](07-dosing-controller/README.md) | refreshed for 7.0 |

Folders follow the guide number in each title. Note that two Adafruit URLs carry a different
number (the dosing guide is Guide 7, the pH guide is Guide 6).

## What each guide contains

- A header with the Adafruit URL and the date it was last synced with Adafruit.
- **Changes for 7.0**: the copy-back checklist, per Adafruit page: which images to replace, add or
  remove, which paragraphs changed, and anything that needs the maintainer's check.
- One `##` section per Adafruit page, in Adafruit order, with the published text.
- Hardware photos and diagrams linked from Adafruit's CDN (not stored here).
- reef-pi screenshots in `images/`, shown as a Desktop | Mobile pair for each step.

## Regenerating the screenshots

```
make guide-screenshots            # every guide, desktop and mobile
make guide-screenshots GUIDE=3    # one guide
```

This builds reef-pi (`make go`, `make ui`, `make api-doc`), starts the dev server through Playwright
and runs the `guide-screenshots-desktop` (1440x900) and `guide-screenshots-mobile` (390x844) projects
(`front-end/e2e/guides/guide-0N.spec.js`). Each spec resets the dev server state, seeds what earlier
guides would have set up, and walks through the guide's own steps in the UI. The dev-only footer is
hidden while capturing. Running it again only changes image bytes, never file names.

File names: `images/<adafruit-page-slug>-<nn>-<what>-<desktop|mobile>.png`. `<nn>` is the image's
position on that Adafruit page; an extra screen gets a letter (`03a`), and the number of a removed
screenshot is left unused.

## Copying a guide back to Adafruit

1. Regenerate the guide's screenshots on the release you are documenting.
2. Open the guide's **Changes for 7.0** list.
3. For each listed image, combine the `-desktop` and `-mobile` files side by side and upload the result
   in place of that image on the Adafruit page; delete removed images.
4. Update each listed paragraph from the Markdown.
5. Set "Last synced with Adafruit" in the guide's header and commit.
