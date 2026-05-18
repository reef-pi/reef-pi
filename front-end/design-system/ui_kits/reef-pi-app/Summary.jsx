// Summary.jsx — fixed bottom info bar, matches Summary component
function Summary({ devMode, errors = 0, version = 'v5.2.0', device = 'Raspberry Pi 4 Model B' }) {
  return (
    <div className="bottom-bar" data-testid="smoke-summary">
      <span>running <b>{version}</b>, on {device}</span>
      <span className="sep">·</span>
      <span>since 4 days</span>
      <span className="sep">·</span>
      <a href="#" onClick={e => e.preventDefault()}>documentation</a>
      {devMode && (
        <>
          <span className="sep">·</span>
          <span className="text-danger">In DevMode · errors ({errors})</span>
        </>
      )}
    </div>
  );
}
window.Summary = Summary;
