# reef-pi web app — UI kit

A click-through recreation of the reef-pi controller UI. Faithful to:

- `front-end/assets/sass/*.scss` — colors, spacing, navbar gradient, focus ring
- `front-end/src/main_panel.jsx` — route shell, navbar, Summary footer
- `front-end/src/sign_in.jsx` — auth form
- `front-end/src/equipment/*` — list-group pattern, toggle, edit/delete
- `front-end/src/dashboard/main.jsx` — tile grid with black-bordered cells

## How to use

Open `index.html`. The prototype starts at the sign-in page.
- **any username + password** signs you in (hint: try `reefer` / anything).
- Once inside you can click the top tabs, toggle equipment, open the `Delete` confirm, and toggle dev-mode to reveal the footer warning via Tweaks.

## Components

- `Shell.jsx` — navbar + route + fixed Summary bar
- `Navbar.jsx` — gradient top bar with brand + tabs + mobile toggler
- `SignIn.jsx` — sign-in form with Oops alert
- `Dashboard.jsx` — 3-col grid of bordered tiles
- `TempTile.jsx`, `PhTile.jsx`, `AtoTile.jsx`, `EquipmentPanel.jsx`, `HealthTile.jsx`
- `Equipment.jsx` — list-group of equipment with inline edit + delete confirm
- `Lighting.jsx`, `Temperature.jsx`, `Ato.jsx`, `Configuration.jsx` — lighter pages
- `Summary.jsx` — the fixed-bottom meta strip
- `Confirm.jsx` — destructive confirm modal matching reef-pi's strings
- `ToggleSwitch.jsx` — the on/off knob used throughout

## Fidelity notes

- Bootstrap 4.6 classnames are preserved (`list-group-item`, `navbar-expand-lg`, `btn btn-success`).
- Toggle switches visually match react-toggle-switch v3.
- recharts is mocked with inline SVG (no charting library needed for the kit).
- Copy strings are lifted directly from `en.csv`.
