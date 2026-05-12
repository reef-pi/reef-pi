/* ============ BENTO OS · FULL SYSTEM SCREENS ============
   Schedules, Settings, Sign-in, Empty/Error states.
   All 900×520 desktop. Use existing bento tokens & BentoNav.
*/

const bf = {
  bg: '#FAFAF7', ink: '#1B1B1F', dim: '#6B6B73', card: '#FFFFFF',
  border: '#EDEDE6', soft: '#F2F0EA',
  green: '#1F8A5B', red: '#FF6B5B', amber: '#D58F00', blue: '#2E5BFF',
  font: '"Geist", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};
const bfCard = {
  width: 900, height: 520, boxSizing: 'border-box', background: bf.bg,
  color: bf.ink, fontFamily: bf.font, padding: 22, position: 'relative', overflow: 'hidden',
};
const bfTile = {
  background: bf.card, border: '1px solid ' + bf.border, borderRadius: 14,
  padding: 14, boxShadow: '0 1px 0 rgba(20,20,40,.02), 0 1px 3px rgba(20,20,40,.03)',
};
const bfTopbar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 };
const bfBrand = { fontWeight: 600, fontSize: 15, letterSpacing: '-.01em' };
const bfDot = { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: bf.green, marginRight: 8, verticalAlign: 1 };
const bfPill = { padding: '4px 10px', borderRadius: 999, background: bf.card, border: '1px solid ' + bf.border, fontSize: 11, color: bf.ink, display: 'flex', alignItems: 'center', gap: 6 };
const bfTab = (active) => ({
  padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 999,
  background: active ? bf.ink : 'transparent', color: active ? '#fff' : bf.dim,
  cursor: 'pointer', border: 'none',
});
function BfNav({ active }) {
  const tabs = ['Dashboard','Equipment','Probes','Schedules','Alerts','Settings'];
  return (
    <div style={bfTopbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={bfBrand}><span style={bfDot}/>reef-pi · Display tank</div>
        <div style={{ display: 'flex', gap: 2, background: bf.soft, borderRadius: 999, padding: 3 }}>
          {tabs.map((t) => <button key={t} style={bfTab(t === active)}>{t}</button>)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: bf.dim }}>
        <div style={bfPill}><span style={{ width: 6, height: 6, borderRadius: 999, background: bf.green }}/>All nominal</div>
        <span>9:42 PM</span>
      </div>
    </div>
  );
}

/* ---------- 1. SCHEDULES & AUTOMATIONS ---------- */
function BentoOSSchedules() {
  // 24-hour timeline rows
  const rows = [
    { name: 'Lights · main',     color: '#F4B942', spans: [{ s: 6.5, e: 21,   label: 'Sunrise → Daylight → Sunset' }] },
    { name: 'Lights · actinic',  color: '#7C8CFF', spans: [{ s: 5.5, e: 6.5,  label: 'Pre-dawn' }, { s: 21, e: 22, label: 'Dusk' }] },
    { name: 'UV',                color: '#8A6FFF', spans: [{ s: 23, e: 27,    label: 'Daily 23:00 → 03:00' }] },
    { name: 'Powerhead pulse',   color: '#2E5BFF', spans: Array.from({ length: 24 }, (_, h) => ({ s: h, e: h + 0.4, label: '' })) },
    { name: 'Feeding',           color: bf.amber,  spans: [{ s: 8,  e: 8.06, label: '' }, { s: 14, e: 14.06, label: '2:00 pump pause' }, { s: 19, e: 19.06, label: '' }] },
    { name: 'Heater · auto',     color: bf.red,    spans: [{ s: 1, e: 3.5, label: '' }, { s: 9, e: 9.6, label: '' }, { s: 13, e: 13.4, label: '' }, { s: 22, e: 23.2, label: '' }] },
  ];
  const dayW = 440; // timeline width
  const pct = (h) => (Math.min(h, 24) / 24) * dayW;
  return (
    <div style={bfCard}>
      <BfNav active="Schedules"/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 10, height: 'calc(100% - 60px)' }}>
        <div style={{ ...bfTile, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Daily timeline</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>Tuesday · May 12</div>
            </div>
            <div style={{ display: 'flex', gap: 2, padding: 3, background: bf.soft, borderRadius: 999 }}>
              {['Day','Week','Month'].map((r,i) => (
                <button key={r} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: i === 0 ? bf.card : 'transparent', color: i === 0 ? bf.ink : bf.dim,
                  border: 'none', cursor: 'pointer', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                }}>{r}</button>
              ))}
            </div>
          </div>
          {/* Hour axis */}
          <div style={{ display: 'grid', gridTemplateColumns: `100px ${dayW}px`, gap: 12, alignItems: 'center', marginBottom: 6 }}>
            <div/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: bf.mono, fontSize: 10, color: bf.dim }}>
              {[0,3,6,9,12,15,18,21,24].map(h => <span key={h}>{String(h).padStart(2,'0')}</span>)}
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Now line at 9:42 PM = 21.7 */}
            <div style={{
              position: 'absolute', left: 100 + 12 + pct(21.7), top: 0, bottom: 0,
              width: 1, background: bf.red, zIndex: 5,
            }}>
              <div style={{ position: 'absolute', top: -2, left: -22, fontSize: 10, color: bf.red, fontFamily: bf.mono, background: bf.bg, padding: '0 4px' }}>now</div>
            </div>
            {rows.map((r) => (
              <div key={r.name} style={{ display: 'grid', gridTemplateColumns: `100px ${dayW}px`, gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{r.name}</div>
                <div style={{ position: 'relative', height: 22, background: bf.soft, borderRadius: 6 }}>
                  {r.spans.map((sp, i) => (
                    <div key={i} title={sp.label} style={{
                      position: 'absolute', left: pct(sp.s), width: pct(Math.min(sp.e, 24)) - pct(sp.s),
                      top: 0, bottom: 0, background: r.color, borderRadius: 4, opacity: .85,
                      overflow: 'hidden', whiteSpace: 'nowrap', fontSize: 10, color: '#fff',
                      padding: '0 6px', display: 'flex', alignItems: 'center', fontWeight: 500,
                    }}>{sp.label && pct(Math.min(sp.e, 24)) - pct(sp.s) > 70 ? sp.label : ''}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={bfTile}>
            <div style={{ fontSize: 11, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Next change</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6, letterSpacing: '-.01em' }}>UV · on</div>
            <div style={{ fontSize: 12, color: bf.dim, marginTop: 2 }}>in 1h 18m · 11:00 PM</div>
            <button style={{ marginTop: 12, width: '100%', padding: 8, borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Skip tonight</button>
          </div>
          <div style={bfTile}>
            <div style={{ fontSize: 11, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500, marginBottom: 8 }}>Automations · 5</div>
            {[
              ['Heater bound',     'temp.A → heater.01', true],
              ['ATO float',        'level.A → ato.01',   true],
              ['Lights schedule',  'sunrise/sunset',     true],
              ['Pulse powerhead',  '10s on · 10s off',   true],
              ['Vacation mode',    'paused',             false],
            ].map(([n, sub, on]) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + bf.border }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontSize: 11, color: bf.dim, marginTop: 1, fontFamily: bf.mono }}>{sub}</div>
                </div>
                <div style={{ width: 28, height: 16, borderRadius: 999, background: on ? bf.green : '#D8D8D2', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: '#fff', position: 'absolute', top: 2, left: on ? 14 : 2, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}/>
                </div>
              </div>
            ))}
            <button style={{ marginTop: 10, width: '100%', padding: 8, borderRadius: 8, border: '1px dashed ' + bf.border, background: 'transparent', fontSize: 12, fontWeight: 500, color: bf.dim, cursor: 'pointer' }}>+ New automation</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSSchedules = BentoOSSchedules;

/* ---------- 2. SETTINGS ---------- */
function BentoOSSettings() {
  const sections = [
    { id: 'general',    icon: '⚙', label: 'General' },
    { id: 'probes',     icon: '◔', label: 'Probes & sensors' },
    { id: 'equip',      icon: '◧', label: 'Equipment' },
    { id: 'network',    icon: '◌', label: 'Network' },
    { id: 'users',      icon: '◉', label: 'Users & access' },
    { id: 'notif',      icon: '◐', label: 'Notifications' },
    { id: 'backup',     icon: '◫', label: 'Backup & export' },
    { id: 'about',      icon: 'i',  label: 'About reef-pi' },
  ];
  return (
    <div style={bfCard}>
      <BfNav active="Settings"/>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10, height: 'calc(100% - 60px)' }}>
        <div style={{ ...bfTile, padding: 8, overflow: 'auto' }}>
          {sections.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
              borderRadius: 8, cursor: 'pointer',
              background: i === 3 ? bf.soft : 'transparent',
              fontSize: 13, fontWeight: i === 3 ? 600 : 500,
              color: i === 3 ? bf.ink : bf.dim,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6, background: i === 3 ? bf.ink : bf.soft,
                color: i === 3 ? '#fff' : bf.dim, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: bf.mono, fontSize: 12,
              }}>{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>
        <div style={{ ...bfTile, padding: 22, overflow: 'auto' }}>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>Network</div>
          <div style={{ fontSize: 12, color: bf.dim, marginTop: 2 }}>How reef-pi connects and serves the UI.</div>
          {/* Connection */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid ' + bf.border }}>
            <div style={{ fontSize: 11, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Connection</div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, marginTop: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 13 }}>Mode</div>
              <div style={{ display: 'flex', gap: 2, background: bf.soft, borderRadius: 8, padding: 2, width: 'fit-content' }}>
                {['Wi-Fi','Ethernet'].map((m,i) => (
                  <button key={m} style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    background: i === 0 ? bf.card : 'transparent', color: i === 0 ? bf.ink : bf.dim,
                    border: 'none', cursor: 'pointer', boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                  }}>{m}</button>
                ))}
              </div>
              <div style={{ fontSize: 13 }}>Network</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid ' + bf.border, borderRadius: 8, fontSize: 13, background: bf.card }}>
                <span>SaltyHome-5G</span>
                <span style={{ color: bf.dim, fontFamily: bf.mono, fontSize: 11 }}>−42 dBm · WPA2</span>
              </div>
              <div style={{ fontSize: 13 }}>Hostname</div>
              <input style={{ padding: '8px 12px', border: '1px solid ' + bf.border, borderRadius: 8, fontSize: 13, fontFamily: bf.mono, background: bf.card, color: bf.ink }} defaultValue="reef-pi.local"/>
              <div style={{ fontSize: 13 }}>HTTPS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: bf.dim }}>Self-signed certificate · 89 days remain</span>
                <div style={{ width: 32, height: 18, borderRadius: 999, background: bf.green, position: 'relative' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', position: 'absolute', top: 2, left: 16, boxShadow: '0 1px 2px rgba(0,0,0,.2)' }}/>
                </div>
              </div>
            </div>
          </div>
          {/* Status */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid ' + bf.border }}>
            <div style={{ fontSize: 11, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
              {[['IP','192.168.1.40'],['MAC','dc:a6:32:81:4f:11'],['Uptime','4d 6h 12m'],['Latency','12 ms']].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: bf.dim, textTransform: 'uppercase', letterSpacing: '.06em' }}>{l}</div>
                  <div style={{ fontFamily: bf.mono, fontSize: 13, fontWeight: 500, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: bf.ink, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSSettings = BentoOSSettings;

/* ---------- 3. SIGN-IN / FIRST-RUN ---------- */
function BentoOSSignIn() {
  return (
    <div style={{ ...bfCard, padding: 0, background: bf.bg }}>
      {/* Subtle background wave */}
      <svg style={{ position: 'absolute', inset: 0 }} width="900" height="520" viewBox="0 0 900 520" preserveAspectRatio="none">
        <defs>
          <linearGradient id="signin-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bf.green} stopOpacity=".09"/>
            <stop offset="100%" stopColor={bf.green} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M0,360 Q225,300 450,340 T900,320 L900,520 L0,520 Z" fill="url(#signin-fade)"/>
        <path d="M0,400 Q225,360 450,380 T900,370 L900,520 L0,520 Z" fill={bf.green} opacity=".05"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Left: brand panel */}
        <div style={{ padding: '44px 48px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.01em' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: bf.green, marginRight: 10, verticalAlign: 1 }}/>
            reef-pi
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-.025em', lineHeight: 1.15 }}>
              A calm,<br/>quietly observant<br/>reef controller.
            </div>
            <div style={{ fontSize: 13, color: bf.dim, marginTop: 14, maxWidth: 320, lineHeight: 1.5 }}>
              Open source. Runs on a Raspberry Pi. Manages your tank's temperature, pH, ATO, lighting, and equipment.
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 22, fontSize: 11, color: bf.dim, fontFamily: bf.mono, letterSpacing: '.06em' }}>
              <span>v5.2.0</span><span>•</span><span>reef-pi.local</span><span>•</span><span>192.168.1.40</span>
            </div>
          </div>
        </div>
        {/* Right: sign-in card */}
        <div style={{ padding: '44px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...bfTile, padding: 28, width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.01em' }}>Welcome back</div>
            <div style={{ fontSize: 13, color: bf.dim, marginTop: 4 }}>Sign in to manage your tank.</div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: bf.dim, marginBottom: 6, fontWeight: 500 }}>Username</div>
                <input defaultValue="jules" style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid ' + bf.border, borderRadius: 8, fontSize: 13, background: bf.card, fontFamily: bf.font, color: bf.ink }}/>
              </div>
              <div>
                <div style={{ fontSize: 11, color: bf.dim, marginBottom: 6, fontWeight: 500 }}>Password</div>
                <input type="password" defaultValue="••••••••••" style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid ' + bf.ink, borderRadius: 8, fontSize: 13, background: bf.card, fontFamily: bf.font, color: bf.ink, outline: 'none' }}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <label style={{ fontSize: 12, color: bf.dim, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: bf.ink, display: 'inline-block', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 1, left: 4, width: 4, height: 8, border: '2px solid #fff', borderTop: 'none', borderLeft: 'none', transform: 'rotate(45deg)' }}/>
                  </span>
                  Stay signed in
                </label>
              </div>
              <button style={{ marginTop: 6, padding: '11px', borderRadius: 8, border: 'none', background: bf.ink, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Sign in</button>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + bf.border, fontSize: 11, color: bf.dim, display: 'flex', justifyContent: 'space-between' }}>
              <span><span style={{ width: 6, height: 6, borderRadius: 999, background: bf.green, display: 'inline-block', marginRight: 6 }}/>Connected</span>
              <span>reef-pi.local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSSignIn = BentoOSSignIn;

/* ---------- 4. EMPTY / ERROR STATES (compound artboard with 4 panels) ---------- */
function BentoOSEmptyStates() {
  const panel = {
    ...bfTile, padding: 22,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  };
  const icon = (children, bg) => (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontFamily: bf.mono, fontWeight: 600 }}>{children}</div>
  );
  return (
    <div style={bfCard}>
      <div style={bfTopbar}>
        <div style={bfBrand}><span style={bfDot}/>reef-pi · Empty & error states</div>
        <div style={{ fontSize: 12, color: bf.dim }}>System library</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, height: 'calc(100% - 60px)' }}>
        {/* First-run / no probes */}
        <div style={panel}>
          <div>
            {icon('◔', bf.green)}
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: '-.01em' }}>Add your first probe</div>
            <div style={{ fontSize: 12, color: bf.dim, marginTop: 4, lineHeight: 1.5 }}>
              reef-pi can read temperature, pH, salinity, and ORP. Connect a probe and we'll auto-detect it.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Learn more</button>
            <button style={{ flex: 1.4, padding: 9, borderRadius: 8, border: 'none', background: bf.ink, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Scan for probes</button>
          </div>
        </div>
        {/* Lost connection */}
        <div style={{ ...panel, background: '#FFF8F5', borderColor: '#FFE2DA' }}>
          <div>
            {icon('!', bf.red)}
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: '-.01em' }}>Lost contact with controller</div>
            <div style={{ fontSize: 12, color: bf.dim, marginTop: 4, lineHeight: 1.5 }}>
              Last seen 1m 18s ago. Showing cached readings — equipment may not be in the displayed state.
            </div>
            <div style={{ marginTop: 10, fontSize: 11, fontFamily: bf.mono, color: bf.dim }}>
              reef-pi.local · 192.168.1.40<br/>
              <span style={{ color: bf.red }}>● retrying in 12s · attempt 3</span>
            </div>
          </div>
          <button style={{ padding: 9, borderRadius: 8, border: 'none', background: bf.ink, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Retry now</button>
        </div>
        {/* Empty alerts (good news) */}
        <div style={panel}>
          <div>
            {icon('✓', bf.green)}
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: '-.01em' }}>No alerts in the last 30 days</div>
            <div style={{ fontSize: 12, color: bf.dim, marginTop: 4, lineHeight: 1.5 }}>
              Everything has stayed inside your thresholds. We'll show new alerts here as they happen.
            </div>
          </div>
          <button style={{ padding: 9, borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' }}>Review thresholds →</button>
        </div>
        {/* Probe unplugged / sensor error */}
        <div style={{ ...panel, background: '#FFFCF1', borderColor: '#F3E7B7' }}>
          <div>
            {icon('⚠', bf.amber)}
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12, letterSpacing: '-.01em' }}>pH probe is reporting noise</div>
            <div style={{ fontSize: 12, color: bf.dim, marginTop: 4, lineHeight: 1.5 }}>
              Probe B has drifted 0.4 in 6 hours — likely needs cleaning or recalibration. Heater bound paused as a precaution.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Snooze</button>
            <button style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid ' + bf.border, background: bf.card, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Calibrate</button>
            <button style={{ flex: 1, padding: 9, borderRadius: 8, border: 'none', background: bf.ink, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Acknowledge</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOSEmptyStates = BentoOSEmptyStates;
