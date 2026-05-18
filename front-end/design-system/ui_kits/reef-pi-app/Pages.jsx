// Pages.jsx — smaller pages: Lighting, Temperature, ATO, pH, Timers, Dosers, Configuration
function Lighting() {
  const [ch, setCh] = React.useState({ white: 60, blue: 80, royal: 95, uv: 30 });
  return (
    <>
      <h2 className="h3">Reef · AI Prime HD</h2>
      <ul className="list-group">
        {Object.entries(ch).map(([k, v]) => (
          <li className="list-group-item" key={k}>
            <div className="d-flex align-items-center gap-3">
              <div style={{width: 120, textTransform:'capitalize'}}>{k}</div>
              <input type="range" min="0" max="100" value={v} className="flex-1"
                     onChange={e => setCh({...ch, [k]: +e.target.value})} />
              <div className="text-muted" style={{width: 50, textAlign:'right'}}>{v}%</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Temperature() {
  const pts = [77.8,78.0,78.2,78.4,78.3,78.5,78.4,78.6,78.5,78.4,78.3];
  return (
    <>
      <h2 className="h3">Display Tank</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="grid-cell" style={{minHeight: 180}}>
            <div className="hdr">Current</div>
            <div style={{fontSize: 40, fontWeight: 500}}>78.4<span className="text-muted" style={{fontSize:16, marginLeft:6}}>°F</span></div>
            <div className="text-muted small">Threshold 76–80 · Heater on &lt; 77</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="grid-cell" style={{minHeight: 180}}>
            <div className="hdr">Last 12h</div>
            <Sparkline points={pts} />
          </div>
        </div>
      </div>
      <ul className="list-group mt-3">
        <li className="list-group-item d-flex align-items-center gap-3">
          <div className="flex-1"><b>Heater Threshold</b><div className="text-muted small">Minimum temperature before heater turns on</div></div>
          <input className="form-control" style={{width: 100}} defaultValue="77" />
        </li>
        <li className="list-group-item d-flex align-items-center gap-3">
          <div className="flex-1"><b>Check Frequency</b><div className="text-muted small">How often to poll the sensor (seconds)</div></div>
          <input className="form-control" style={{width: 100}} defaultValue="30" />
        </li>
      </ul>
    </>
  );
}

function Ato() {
  return (
    <>
      <h2 className="h3">ATO · Sump</h2>
      <ul className="list-group">
        <li className="list-group-item d-flex align-items-center gap-3">
          <ToggleSwitch on={true} onChange={()=>{}} />
          <div className="flex-1"><b>Enable</b><div className="text-muted small">Top-off pump activates when sensor reads low</div></div>
        </li>
        <li className="list-group-item d-flex align-items-center gap-3">
          <div className="flex-1"><b>Maximum Runtime (s)</b><div className="text-muted small">Safety cutoff</div></div>
          <input className="form-control" style={{width: 100}} defaultValue="60" />
        </li>
        <li className="list-group-item d-flex align-items-center gap-3">
          <div className="flex-1"><b>Cooldown (s)</b></div>
          <input className="form-control" style={{width: 100}} defaultValue="900" />
        </li>
      </ul>
    </>
  );
}

function Ph() {
  const pts = [8.12,8.14,8.13,8.15,8.17,8.18,8.16,8.17,8.18,8.19,8.17];
  return (
    <>
      <h2 className="h3">pH · Display Tank</h2>
      <div className="grid-cell" style={{minHeight: 200}}>
        <div className="hdr">Last 24h</div>
        <Sparkline points={pts} />
        <div className="text-muted small">8.17 now · min 8.12 · max 8.19</div>
      </div>
    </>
  );
}

function Timers() {
  return (
    <>
      <h2 className="h3">Timers</h2>
      <ul className="list-group">
        {[
          { name: 'Auto Feeder', cron: '0 8,12,18 * * *', equipment: 'Feeder' },
          { name: 'Skimmer cycle', cron: '0 */6 * * *', equipment: 'Skimmer' }
        ].map((t,i) => (
          <li key={i} className="list-group-item d-flex align-items-center gap-3">
            <ToggleSwitch on={true} onChange={()=>{}} />
            <div className="flex-1">
              <b>{t.name}</b>
              <div className="text-muted small" style={{fontFamily:'ui-monospace, Menlo, monospace'}}>{t.cron} · {t.equipment}</div>
            </div>
            <button className="btn btn-sm btn-outline-dark">Edit</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Doser() {
  return (
    <>
      <h2 className="h3">Dosers</h2>
      <ul className="list-group">
        {[
          { name: 'Alk', ml: 10, freq: '06:00' },
          { name: 'Calcium', ml: 8, freq: '06:15' },
          { name: 'Magnesium', ml: 4, freq: '06:30' }
        ].map((d,i)=>(
          <li key={i} className="list-group-item d-flex align-items-center gap-3">
            <div className="flex-1"><b>{d.name}</b><div className="text-muted small">Daily · {d.freq}</div></div>
            <div className="text-muted small">{d.ml} mL</div>
            <button className="btn btn-sm btn-outline-success">Dose now</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Configuration() {
  const tabs = ['About','Connectors','Settings','Telemetry','Users'];
  const [active, setActive] = React.useState('About');
  return (
    <>
      <h2 className="h3">Configuration</h2>
      <div className="conf-nav">
        {tabs.map(t => (
          <a key={t} href="#" className={'nav-link' + (t === active ? ' active' : '')}
             onClick={e => { e.preventDefault(); setActive(t); }}>{t}</a>
        ))}
      </div>
      {active === 'About' && (
        <ul className="list-group">
          <li className="list-group-item"><b>reef-pi</b><div className="text-muted small">running v5.2.0, on Raspberry Pi 4 Model B</div></li>
          <li className="list-group-item"><b>Uptime</b><div className="text-muted small">since 4 days</div></li>
          <li className="list-group-item"><b>Disk</b><div className="text-muted small">12.4 GB free of 32 GB</div></li>
        </ul>
      )}
      {active === 'Settings' && (
        <ul className="list-group">
          <li className="list-group-item d-flex align-items-center gap-3"><div className="flex-1"><b>Display name</b></div><input className="form-control" style={{width:220}} defaultValue="Reef Tank 1" /></li>
          <li className="list-group-item d-flex align-items-center gap-3"><div className="flex-1"><b>Temperature unit</b></div><select className="form-control" style={{width:140}}><option>Fahrenheit</option><option>Celsius</option></select></li>
          <li className="list-group-item d-flex align-items-center gap-3"><ToggleSwitch on={false} onChange={()=>{}} /><div className="flex-1"><b>Display time in 24h format</b></div></li>
        </ul>
      )}
      {active === 'Connectors' && (
        <ul className="list-group">
          {['GPIO','Jacks','Outlets','Inlets','ADCs'].map(n => (
            <li key={n} className="list-group-item"><b>{n}</b><div className="text-muted small">configured</div></li>
          ))}
        </ul>
      )}
      {active === 'Telemetry' && (
        <ul className="list-group">
          <li className="list-group-item"><b>Adafruit IO</b><div className="text-muted small">not configured</div></li>
          <li className="list-group-item"><b>Prometheus</b><div className="text-muted small">not configured</div></li>
        </ul>
      )}
      {active === 'Users' && (
        <ul className="list-group">
          <li className="list-group-item d-flex align-items-center gap-3"><div className="flex-1"><b>reefer</b><div className="text-muted small">admin</div></div><button className="btn btn-sm btn-outline-dark">Change password</button></li>
        </ul>
      )}
    </>
  );
}

Object.assign(window, { Lighting, Temperature, Ato, Ph, Timers, Doser, Configuration });
