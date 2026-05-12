/* ============ 5 · BENTO OS ============ */
const bentoStyles = {
  card: {
    width: 900, height: 520, boxSizing: 'border-box', background: '#FAFAF7', color: '#1B1B1F',
    fontFamily: '"Geist", "Inter", system-ui, sans-serif',
    padding: 22, position: 'relative', overflow: 'hidden',
  },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brand: { fontWeight: 600, fontSize: 15, letterSpacing: '-.01em' },
  brandDot: { display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#1F8A5B', marginRight: 8, verticalAlign: 1 },
  metaRow: { fontSize: 12, color: '#6B6B73', display: 'flex', gap: 12, alignItems: 'center' },
  pill: { padding: '4px 10px', borderRadius: 999, background: '#fff', border: '1px solid #E6E6DF', boxShadow: '0 1px 0 rgba(0,0,0,.02)', fontSize: 11, color: '#1B1B1F', display: 'flex', alignItems: 'center', gap: 6 },
  ok: { display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: '#1F8A5B' },
  bento: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 10, height: 'calc(100% - 50px)' },
  tile: {
    background: '#FFFFFF', border: '1px solid #EDEDE6', borderRadius: 14,
    padding: 14, boxShadow: '0 1px 0 rgba(20,20,40,.02), 0 1px 3px rgba(20,20,40,.03)',
    display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
  },
  tileLabel: { fontSize: 11, color: '#6B6B73', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 },
  bigNum: { fontSize: 44, fontWeight: 500, marginTop: 6, lineHeight: 1, letterSpacing: '-.025em', fontFamily: '"Geist Mono", ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' },
  unit: { fontSize: 18, color: '#6B6B73', marginLeft: 2 },
  midNum: { fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: '-.02em', fontFamily: '"Geist Mono", ui-monospace, monospace' },
  smNum: { fontSize: 18, fontWeight: 500, fontFamily: '"Geist Mono", ui-monospace, monospace' },
  sub: { fontSize: 11, color: '#6B6B73', marginTop: 6 },
  trendUp: { color: '#1F8A5B', fontSize: 11 },
  trendDn: { color: '#FF6B5B', fontSize: 11 },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggle: (on) => ({
    width: 28, height: 16, borderRadius: 999, background: on ? '#1F8A5B' : '#D8D8D2',
    position: 'relative', flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    width: 12, height: 12, borderRadius: 999, background: '#fff',
    position: 'absolute', top: 2, left: on ? 14 : 2,
    boxShadow: '0 1px 2px rgba(0,0,0,.2)',
  }),
  feedBtn: {
    background: '#1B1B1F', color: '#fff', border: 'none', padding: '10px 12px',
    borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
  },
};
function BentoOS() {
  const Equip = ({ name, on }) => (
    <div style={bentoStyles.toggleRow}>
      <span style={{ fontSize: 12 }}>{name}</span>
      <div style={bentoStyles.toggle(on)}><div style={bentoStyles.toggleThumb(on)}/></div>
    </div>
  );
  return (
    <div style={bentoStyles.card}>
      <div style={bentoStyles.topbar}>
        <div style={bentoStyles.brand}><span style={bentoStyles.brandDot}/>reef-pi · Display tank</div>
        <div style={bentoStyles.metaRow}>
          <div style={bentoStyles.pill}><span style={bentoStyles.ok}/>All nominal</div>
          <span>up 4d</span>
          <span>9:42 PM</span>
        </div>
      </div>
      <div style={bentoStyles.bento}>
        {/* Hero temp 2x2 */}
        <div style={{ ...bentoStyles.tile, gridColumn: 'span 2', gridRow: 'span 2' }}>
          <div style={bentoStyles.tileLabel}>Temperature</div>
          <div style={bentoStyles.bigNum}>78.4<span style={bentoStyles.unit}>°F</span></div>
          <div style={bentoStyles.sub}><span style={bentoStyles.trendDn}>▾ 0.2°</span> &nbsp;vs 1h ago · target 76 — 80°F</div>
          <svg width="100%" height="100%" viewBox="0 0 320 120" preserveAspectRatio="none" style={{ marginTop: 10, flex: 1 }}>
            <defs>
              <linearGradient id="bento-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F8A5B" stopOpacity=".25"/>
                <stop offset="100%" stopColor="#1F8A5B" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect x="0" y="40" width="320" height="48" fill="#1F8A5B" opacity=".06"/>
            <path d="M0,68 L26,64 L52,72 L78,76 L104,68 L130,74 L156,66 L182,60 L208,68 L234,64 L260,70 L286,62 L320,66 L320,120 L0,120 Z" fill="url(#bento-fill)"/>
            <polyline fill="none" stroke="#1F8A5B" strokeWidth="2"
              points="0,68 26,64 52,72 78,76 104,68 130,74 156,66 182,60 208,68 234,64 260,70 286,62 320,66"/>
            <circle cx="320" cy="66" r="3.5" fill="#1F8A5B"/>
          </svg>
        </div>
        {/* pH */}
        <div style={bentoStyles.tile}>
          <div style={bentoStyles.tileLabel}>pH</div>
          <div style={bentoStyles.midNum}>8.21</div>
          <div style={bentoStyles.sub}>target 8.1 — 8.4</div>
        </div>
        {/* Salinity */}
        <div style={bentoStyles.tile}>
          <div style={bentoStyles.tileLabel}>Salinity</div>
          <div style={bentoStyles.midNum}>1.026</div>
          <div style={bentoStyles.sub}>nominal</div>
        </div>
        {/* ATO with bar */}
        <div style={bentoStyles.tile}>
          <div style={bentoStyles.tileLabel}>ATO reservoir</div>
          <div style={bentoStyles.midNum}>62<span style={{fontSize:14, color:'#6B6B73'}}>%</span></div>
          <div style={{ height: 6, borderRadius: 999, background: '#EDEDE6', marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: '#2E5BFF' }}/>
          </div>
          <div style={bentoStyles.sub}>refill in ~3 days</div>
        </div>
        {/* Feed cta */}
        <div style={{ ...bentoStyles.tile, padding: 0, background: 'transparent', border: 'none', boxShadow: 'none', justifyContent: 'flex-end' }}>
          <button style={bentoStyles.feedBtn}>
            <span>Feed</span>
            <span style={{ opacity: .55 }}>2:00</span>
          </button>
        </div>
        {/* Equipment 4-wide */}
        <div style={{ ...bentoStyles.tile, gridColumn: 'span 4' }}>
          <div style={bentoStyles.tileLabel}>Equipment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginTop: 12, alignItems: 'center' }}>
            <Equip name="Heater" on={true}/>
            <Equip name="Skimmer" on={true}/>
            <Equip name="Return pump" on={true}/>
            <Equip name="Powerhead" on={true}/>
            <Equip name="UV" on={false}/>
          </div>
        </div>
      </div>
    </div>
  );
}
window.BentoOS = BentoOS;
