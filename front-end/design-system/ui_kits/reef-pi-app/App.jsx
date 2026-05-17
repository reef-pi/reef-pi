// App.jsx — top-level state: auth, route, equipment list, dev-mode
const DEFAULT_OUTLETS = [
  { id: 1, name: 'Outlet 1 (GPIO 17)' },
  { id: 2, name: 'Outlet 2 (GPIO 27)' },
  { id: 3, name: 'Outlet 3 (GPIO 22)' },
  { id: 4, name: 'Outlet 4 (GPIO 23)' }
];
const DEFAULT_EQUIPMENT = [
  { id: 'return',  name: 'Return Pump', outlet: 1, on: true,  stayOffOnBoot: false },
  { id: 'skimmer', name: 'Skimmer',     outlet: 2, on: true,  stayOffOnBoot: true  },
  { id: 'heater',  name: 'Heater',      outlet: 3, on: false, stayOffOnBoot: false, bootDelay: 30 },
  { id: 'ato',     name: 'ATO Pump',    outlet: 4, on: false, stayOffOnBoot: true  }
];

function App({ initialRoute, signedInAtStart, devMode }) {
  const [route, setRoute] = React.useState(initialRoute || 'dashboard');
  const [signedIn, setSignedIn] = React.useState(!!signedInAtStart);
  const [user, setUser] = React.useState(signedInAtStart ? 'reefer' : '');
  const [equipment, setEquipment] = React.useState(DEFAULT_EQUIPMENT);

  // persist route for refresh-during-iteration
  React.useEffect(() => {
    try { localStorage.setItem('reefpi.route', route); } catch (e) {}
  }, [route]);
  React.useEffect(() => {
    try {
      const r = localStorage.getItem('reefpi.route');
      if (r && !initialRoute) setRoute(r);
    } catch (e) {}
  }, []);

  // auth-page body class so the bg shade matches sign-in page
  React.useEffect(() => {
    document.body.classList.toggle('auth-page', !signedIn);
  }, [signedIn]);

  function toggleEq(id) {
    setEquipment(eq => eq.map(e => e.id === id ? { ...e, on: !e.on } : e));
  }
  function deleteEq(id) {
    setEquipment(eq => eq.filter(e => e.id !== id));
  }
  function addEq(name) {
    setEquipment(eq => [...eq, {
      id: 'eq' + Date.now(), name, outlet: DEFAULT_OUTLETS[0].id, on: false
    }]);
  }

  if (!signedIn) {
    return <SignIn onLogin={(u) => { setUser(u); setSignedIn(true); }} />;
  }

  let page;
  switch (route) {
    case 'dashboard':     page = <Dashboard equipment={equipment} onToggleEq={toggleEq} onConfigure={() => setRoute('configuration')} />; break;
    case 'equipment':     page = <EquipmentPage equipment={equipment} outlets={DEFAULT_OUTLETS} onToggle={toggleEq} onDelete={deleteEq} onAdd={addEq} />; break;
    case 'timers':        page = <Timers />; break;
    case 'lighting':      page = <Lighting />; break;
    case 'temperature':   page = <Temperature />; break;
    case 'ato':           page = <Ato />; break;
    case 'ph':            page = <Ph />; break;
    case 'doser':         page = <Doser />; break;
    case 'configuration': page = <Configuration />; break;
    default: page = <Dashboard equipment={equipment} onToggleEq={toggleEq} onConfigure={() => setRoute('configuration')} />;
  }

  return (
    <>
      <Navbar currentRoute={route} onNav={setRoute} tankName="reef-pi" />
      <div className="container-fluid body-panel" data-screen-label={`reef-pi · ${route}`}>
        <div className="col-12">{page}</div>
      </div>
      <Summary devMode={devMode} errors={devMode ? 3 : 0} />
    </>
  );
}

window.App = App;
window.DEFAULT_EQUIPMENT = DEFAULT_EQUIPMENT;
window.DEFAULT_OUTLETS = DEFAULT_OUTLETS;
