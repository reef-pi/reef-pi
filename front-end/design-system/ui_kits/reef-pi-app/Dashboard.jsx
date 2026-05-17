// Dashboard.jsx — 3x2 grid of tiles with black-bordered cells
function TempTile() {
  return (
    <div className="grid-cell">
      <div className="hdr">Temperature (current)</div>
      <div><span style={{fontSize: 30, fontWeight: 500}}>78.4</span><span className="text-muted" style={{marginLeft: 4}}>°F</span></div>
      <div className="text-muted small" style={{marginTop: 'auto'}}>Display Tank · 76–80</div>
    </div>
  );
}
function PhTile() {
  const pts = [8.1,8.12,8.08,8.15,8.18,8.14,8.1,8.16,8.19,8.2,8.17];
  return (
    <div className="grid-cell">
      <div className="hdr">pH (historical)</div>
      <Sparkline points={pts} stroke="#27a822" />
      <div className="text-muted small">8.17 now · 7d window</div>
    </div>
  );
}
function AtoTile() {
  return (
    <div className="grid-cell">
      <div className="hdr">ATO usage (sec)</div>
      <BarChart values={[30,40,50,32,42,60,36,48]} />
      <div className="text-muted small">48s today · last top-off 11m ago</div>
    </div>
  );
}
function HealthTile() {
  const cpu = [22,24,28,26,30,27,29,25,31,33,28];
  const mem = [45,46,45,47,48,49,48,50,51,52,51];
  return (
    <div className="grid-cell">
      <div className="hdr">CPU / Memory (current)</div>
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{width:'100%', flex:1, minHeight: 0}}>
        <polyline fill="none" stroke="#00c851" strokeWidth="2"
          points={cpu.map((v,i) => `${i*20},${60-v/2-5}`).join(' ')} />
        <polyline fill="none" stroke="#ffbb33" strokeWidth="2"
          points={mem.map((v,i) => `${i*20},${60-v/2-5}`).join(' ')} />
        <polyline fill="none" stroke="#ff4444" strokeWidth="2" points="0,52 200,50" />
      </svg>
      <div className="text-muted small">CPU 28% · Mem 51% · 47°C</div>
    </div>
  );
}
function LightTile() {
  return (
    <div className="grid-cell">
      <div className="hdr">Lights · Reef</div>
      <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{width:'100%', flex:1, minHeight: 0}}>
        <path d="M0,55 C40,55 50,10 100,10 C150,10 160,55 200,55" fill="none" stroke="#27a822" strokeWidth="2" />
        <line x1="120" x2="120" y1="5" y2="55" stroke="#4e5f4e" strokeDasharray="3 3" />
      </svg>
      <div className="text-muted small">now 14:22 · peak 18:00</div>
    </div>
  );
}
function EquipmentSwitchTile({ equipment, onToggle }) {
  return (
    <div className="grid-cell">
      <div className="hdr">Equipment (Switch Panel)</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop: 4}}>
        {equipment.map(e => (
          <ToggleSwitch key={e.id} on={e.on} onChange={() => onToggle(e.id)} label={e.name} />
        ))}
      </div>
    </div>
  );
}

function Dashboard({ equipment, onToggleEq, onConfigure }) {
  return (
    <>
      <div className="row">
        <div className="col-md-4"><TempTile /></div>
        <div className="col-md-4"><PhTile /></div>
        <div className="col-md-4"><AtoTile /></div>
      </div>
      <div className="row mt-3">
        <div className="col-md-4"><HealthTile /></div>
        <div className="col-md-4"><LightTile /></div>
        <div className="col-md-4"><EquipmentSwitchTile equipment={equipment} onToggle={onToggleEq} /></div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <button className="btn btn-outline-dark btn-sm" onClick={onConfigure}>Configure</button>
        </div>
      </div>
    </>
  );
}
window.Dashboard = Dashboard;
