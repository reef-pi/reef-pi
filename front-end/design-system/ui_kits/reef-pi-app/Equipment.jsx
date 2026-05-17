// Equipment.jsx — list-group of equipment with inline toggle + edit/delete
function EquipmentPage({ equipment, outlets, onToggle, onDelete, onAdd }) {
  const [adding, setAdding] = React.useState(false);
  const [sort, setSort] = React.useState('az');
  const [confirmFor, setConfirmFor] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [newName, setNewName] = React.useState('');

  const sorted = [...equipment].sort((a,b) => {
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'za') return b.name.localeCompare(a.name);
    if (sort === 'on') return (b.on?1:0) - (a.on?1:0);
    return (a.on?1:0) - (b.on?1:0);
  });

  function submitNew(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName(''); setAdding(false);
  }

  return (
    <>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <div className="d-flex align-items-center gap-3" style={{flexWrap:'wrap'}}>
            <label className="col-form-label">Sort</label>
            <select className="form-control form-control-sm" style={{width:160}}
                    value={sort} onChange={e => setSort(e.target.value)}>
              <option value="az">Name (A→Z)</option>
              <option value="za">Name (Z→A)</option>
              <option value="on">On first</option>
              <option value="off">Off first</option>
            </select>
          </div>
        </li>

        {sorted.map(eq => {
          const outlet = outlets.find(o => o.id === eq.outlet);
          return (
            <li className="list-group-item" key={eq.id}>
              <div className="eq-row">
                <ToggleSwitch on={eq.on} onChange={() => onToggle(eq.id)} />
                <div>
                  <div className="eq-name">{eq.name}</div>
                  <div className="eq-meta">
                    {outlet ? outlet.name : 'No outlet'}
                    {eq.stayOffOnBoot ? ' · stay off on boot' : ''}
                    {eq.bootDelay ? ` · boot delay ${eq.bootDelay}s` : ''}
                  </div>
                </div>
                <span className={'badge ' + (eq.on ? 'badge-on' : 'badge-off')}>
                  {eq.on ? 'ON' : 'OFF'}
                </span>
                <div className="eq-actions">
                  <button className="btn btn-sm btn-outline-dark"
                          onClick={() => setEditingId(editingId === eq.id ? null : eq.id)}>
                    {editingId === eq.id ? 'Cancel' : 'Edit'}
                  </button>
                  <button className="btn btn-sm" style={{border:'1px solid #dc3545', color:'#dc3545', background:'#fff'}}
                          onClick={() => setConfirmFor(eq)}>Delete</button>
                </div>
              </div>
              {editingId === eq.id && (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap: 10, marginTop: 12}}>
                  <input className="form-control" defaultValue={eq.name} />
                  <select className="form-control">
                    {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <button className="btn btn-outline-success btn-sm"
                          onClick={() => setEditingId(null)}>Save</button>
                </div>
              )}
            </li>
          );
        })}

        <li className="list-group-item">
          <button
            className="btn btn-outline-success"
            onClick={() => setAdding(a => !a)}
            data-testid="smoke-equipment-add-toggle"
            style={{fontSize: 18, minWidth: 44}}
          >{adding ? '−' : '+'}</button>
          {adding && (
            <form onSubmit={submitNew} style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap: 10, marginTop: 12}}>
              <input className="form-control" placeholder="Name"
                     value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              <select className="form-control">
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <button className="btn btn-success" type="submit">add</button>
            </form>
          )}
        </li>
      </ul>

      <Confirm
        open={!!confirmFor}
        title={confirmFor ? `Delete ${confirmFor.name} ?` : ''}
        description={confirmFor ? `This action will delete equipment ${confirmFor.name}.` : ''}
        onCancel={() => setConfirmFor(null)}
        onConfirm={() => { onDelete(confirmFor.id); setConfirmFor(null); }}
      />
    </>
  );
}
window.EquipmentPage = EquipmentPage;
