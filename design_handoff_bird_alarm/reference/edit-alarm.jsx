// Edit/Create alarm screen, wrapping <TimePicker/>

function EditAlarmScreen({ palette: p, alarm, onCancel, onSave, onDelete }) {
  const [hour, setHour] = React.useState(alarm.hour);
  const [minute, setMinute] = React.useState(alarm.minute);
  const [ampm, setAmpm] = React.useState(alarm.ampm);
  const [label, setLabel] = React.useState(alarm.label);
  const [repeat, setRepeat] = React.useState([...alarm.repeat]);
  const [icon, setIcon] = React.useState(alarm.icon || 'sun');
  const [sound, setSound] = React.useState(alarm.sound || 'Rainforest');

  const days = ['S','M','T','W','T','F','S'];
  const sounds = ['Skylark', 'Robin', 'Goldfinch', 'Nightingale', 'Wren', 'Mourning Dove'];
  const iconOptions = [
    { id: 'songbird', label: 'Songbird' },
    { id: 'feather', label: 'Feather' },
    { id: 'owl', label: 'Owl' },
    { id: 'dove', label: 'Dove' },
  ];

  const toggleDay = (i) => {
    setRepeat(repeat.includes(i) ? repeat.filter(d => d !== i) : [...repeat, i].sort());
  };

  return (
    <div style={{
      minHeight: '100%', background: p.bgGradient, color: p.text,
      padding: '54px 18px 30px', display: 'flex', flexDirection: 'column', gap: 4,
    }} className="hide-scroll">
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 4px' }}>
        <button onClick={onCancel} style={headerBtn(p.sub)}>Cancel</button>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: p.sub, textTransform: 'uppercase' }}>
          {alarm.isNew ? 'New Alarm' : 'Edit Alarm'}
        </div>
        <button onClick={() => onSave({ ...alarm, hour, minute, ampm, label, repeat, icon, sound })}
          style={{ ...headerBtn(p.accent), fontWeight: 700 }}>Save</button>
      </div>

      {/* picker */}
      <TimePicker palette={p}
        initialHour={hour} initialMinute={minute} initialAmpm={ampm}
        onChange={({ hour, minute, ampm }) => { setHour(hour); setMinute(minute); setAmpm(ampm); }} />

      {/* config rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4, padding: '0 4px' }}>
        {/* label */}
        <Row palette={p} title="Label">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Wake up"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: p.text, fontSize: 15, textAlign: 'right', fontFamily: 'inherit',
            }} />
        </Row>

        {/* repeat */}
        <Row palette={p} title="Repeat" stack>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {days.map((d, i) => {
              const active = repeat.includes(i);
              return (
                <button key={i} onClick={() => toggleDay(i)} style={{
                  flex: 1, height: 34, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: active ? p.accent : p.surfaceSoft,
                  color: active ? '#fff' : p.sub,
                  fontWeight: 700, fontSize: 12,
                  boxShadow: active ? `0 2px 8px ${p.accent}55` : 'none',
                  transition: 'all 160ms',
                }}>{d}</button>
              );
            })}
          </div>
        </Row>

        {/* icon */}
        <Row palette={p} title="Mood" stack>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {iconOptions.map(opt => {
              const active = icon === opt.id;
              return (
                <button key={opt.id} onClick={() => setIcon(opt.id)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: active ? p.accentSoft : p.surfaceSoft,
                  color: active ? p.text : p.sub,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  boxShadow: active ? `inset 0 0 0 1.5px ${p.accent}` : 'none',
                }}>
                  <Icon name={opt.id} color={active ? p.accent : p.sub} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Row>

        {/* sound */}
        <Row palette={p} title="Sound" stack>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {sounds.map(s => {
              const active = sound === s;
              return (
                <button key={s} onClick={() => setSound(s)} style={{
                  padding: '7px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: active ? p.text : p.surfaceSoft,
                  color: active ? p.surface : p.sub,
                  fontSize: 12, fontWeight: 600,
                }}>{s}</button>
              );
            })}
          </div>
        </Row>

        {!alarm.isNew && (
          <button onClick={onDelete} style={{
            marginTop: 6, padding: '12px 16px', borderRadius: 14, border: 'none',
            background: 'transparent', color: '#C8463C', fontWeight: 600, cursor: 'pointer',
            fontSize: 14,
          }}>Delete alarm</button>
        )}
      </div>
    </div>
  );
}

function Row({ palette: p, title, children, stack }) {
  return (
    <div style={{
      background: p.surface, borderRadius: 18, padding: '14px 16px',
      border: `1px solid ${p.border}`,
      display: 'flex', flexDirection: stack ? 'column' : 'row', alignItems: stack ? 'stretch' : 'center',
      gap: stack ? 0 : 12, justifyContent: 'space-between',
    }}>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: 1.8, color: p.sub, textTransform: 'uppercase', fontWeight: 600,
      }}>{title}</div>
      {children}
    </div>
  );
}

const headerBtn = (color) => ({
  background: 'transparent', border: 'none', color, fontSize: 15,
  cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit',
});

window.EditAlarmScreen = EditAlarmScreen;
