// Navbar.jsx — top gradient navbar with brand + tabs + mobile toggler
const ROUTES = [
  { key: 'dashboard',     label: 'Dashboard' },
  { key: 'equipment',     label: 'Equipment' },
  { key: 'timers',        label: 'Timers' },
  { key: 'lighting',      label: 'Lighting' },
  { key: 'temperature',   label: 'Temperature' },
  { key: 'ato',           label: 'ATO' },
  { key: 'ph',            label: 'pH' },
  { key: 'doser',         label: 'Dosers' },
  { key: 'configuration', label: 'Configuration' }
];

function Navbar({ currentRoute, onNav, tankName = 'Reef Tank 1' }) {
  const [open, setOpen] = React.useState(false);
  const current = ROUTES.find(r => r.key === currentRoute) || ROUTES[0];
  return (
    <nav className="navbar-reefpi" data-testid="smoke-shell-root">
      <span className="navbar-brand" data-testid="smoke-brand">{tankName}</span>
      <span className="navbar-brand" style={{fontSize: 14, opacity: .85, marginRight: 'auto'}}>
        {current.label}
      </span>
      <button
        className="navbar-toggler"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >☰</button>
      <ul className={'navbar-nav' + (open ? ' open' : '')} data-testid="smoke-nav">
        {ROUTES.map(r => (
          <li className="nav-item" key={r.key}>
            <a
              className={'nav-link' + (r.key === currentRoute ? ' active' : '')}
              onClick={e => { e.preventDefault(); onNav(r.key); setOpen(false); }}
              href="#"
            >{r.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

window.Navbar = Navbar;
window.ROUTES = ROUTES;
