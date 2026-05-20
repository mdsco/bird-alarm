// App orchestration — screen state, alarms, tweaks panel.

const { useState, useEffect, useMemo } = React;

const DEFAULT_ALARMS = [
  { id: 1, hour: 6, minute: 30, ampm: 'AM', label: 'Dawn chorus', repeat: [1,2,3,4,5], icon: 'songbird', sound: 'Skylark', on: true },
  { id: 2, hour: 7, minute: 15, ampm: 'AM', label: 'Morning flight', repeat: [0,6], icon: 'feather', sound: 'Goldfinch', on: true },
  { id: 3, hour: 9, minute: 0,  ampm: 'PM', label: 'Roost time', repeat: [0,1,2,3,4,5,6], icon: 'owl', sound: 'Mourning Dove', on: false },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sunrise",
  "videoSrc": ""
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.sunrise;

  const [screen, setScreen] = useState('list'); // 'list' | 'edit' | 'trigger'
  const [editing, setEditing] = useState(null);
  const [triggered, setTriggered] = useState(null);
  const [alarms, setAlarms] = useState(DEFAULT_ALARMS);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(i);
  }, []);

  // auto-trigger when an alarm's time matches now
  useEffect(() => {
    const i = setInterval(() => {
      const d = new Date();
      const h12 = ((d.getHours() % 12) || 12);
      const ampm = d.getHours() < 12 ? 'AM' : 'PM';
      const dow = d.getDay();
      const m = d.getMinutes();
      const sec = d.getSeconds();
      if (sec > 5) return;
      const match = alarms.find(a => a.on && a.hour === h12 && a.minute === m && a.ampm === ampm
        && (a.repeat.length === 0 || a.repeat.includes(dow)));
      if (match && screen !== 'trigger') {
        setTriggered(match);
        setScreen('trigger');
      }
    }, 1000);
    return () => clearInterval(i);
  }, [alarms, screen]);

  const startNew = () => {
    setEditing({
      id: Date.now(), hour: 7, minute: 0, ampm: 'AM',
      label: 'Wake up', repeat: [1,2,3,4,5], icon: 'songbird', sound: 'Skylark',
      on: true, isNew: true,
    });
    setScreen('edit');
  };
  const editExisting = (id) => {
    setEditing({ ...alarms.find(a => a.id === id) });
    setScreen('edit');
  };
  const saveAlarm = (a) => {
    const exists = alarms.some(x => x.id === a.id);
    setAlarms(exists ? alarms.map(x => x.id === a.id ? { ...a, isNew: false } : x) : [...alarms, { ...a, isNew: false }]);
    setScreen('list');
  };
  const deleteAlarm = () => {
    setAlarms(alarms.filter(x => x.id !== editing.id));
    setScreen('list');
  };
  const triggerDemo = (id) => {
    const a = alarms.find(x => x.id === id) || alarms[0];
    if (!a) return;
    setTriggered(a);
    setScreen('trigger');
  };
  const stopAlarm = () => {
    setScreen('list');
    setTriggered(null);
  };
  const snoozeAlarm = () => {
    setScreen('list');
    setTriggered(null);
  };

  const dark = screen === 'trigger';
  const status = screen === 'trigger'
    ? `${(now.getHours() % 12) || 12}:${String(now.getMinutes()).padStart(2,'0')}`
    : '9:41';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <IOSDevice dark={dark} width={402} height={874}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {screen === 'list' && (
            <AlarmListScreen palette={palette} alarms={alarms} setAlarms={setAlarms}
              onAdd={startNew} onEdit={editExisting} onTrigger={triggerDemo} now={now} />
          )}
          {screen === 'edit' && editing && (
            <EditAlarmScreen palette={palette} alarm={editing}
              onCancel={() => setScreen('list')}
              onSave={saveAlarm}
              onDelete={deleteAlarm} />
          )}
          {screen === 'trigger' && triggered && (
            <AlarmScene palette={palette} alarm={triggered}
              videoSrc={t.videoSrc || null}
              currentTime={now}
              onStop={stopAlarm} onSnooze={snoozeAlarm} />
          )}
        </div>
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette" />
        <TweakColor label="Theme" value={t.palette}
          options={Object.keys(PALETTES).map(k => [PALETTES[k].accent, PALETTES[k].warm, PALETTES[k].leaf, PALETTES[k].sky])}
          onChange={(v) => {
            // map palette colors back to key
            const found = Object.keys(PALETTES).find(k => {
              const p = PALETTES[k];
              return Array.isArray(v) && v[0] === p.accent;
            });
            if (found) setTweak('palette', found);
          }} />
        <TweakRadio label="Palette name" value={t.palette}
          options={Object.keys(PALETTES).map(k => ({ value: k, label: PALETTES[k].name }))}
          onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Screen" />
        <TweakRadio label="View" value={screen}
          options={[
            { value: 'list', label: 'Alarms' },
            { value: 'edit', label: 'Edit' },
            { value: 'trigger', label: 'Ringing' },
          ]}
          onChange={(v) => {
            if (v === 'edit') {
              if (!editing) editExisting(alarms[0]?.id);
              else setScreen('edit');
            } else if (v === 'trigger') {
              triggerDemo(alarms[0]?.id);
            } else {
              setScreen('list');
            }
          }} />

        <TweakSection label="Nature video" />
        <TweakText label="MP4 URL" value={t.videoSrc}
          placeholder="paste url to use real footage"
          onChange={(v) => setTweak('videoSrc', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
