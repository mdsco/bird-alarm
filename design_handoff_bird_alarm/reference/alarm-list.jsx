// Alarm list screen + edit screen wrapper

const { useState: useStateL } = React;

function AlarmListScreen({ palette: p, alarms, setAlarms, onAdd, onEdit, onTrigger, now }) {
  const toggle = (id) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, on: !a.on } : a));
  };
  const remove = (id) => setAlarms(alarms.filter(a => a.id !== id));

  // greeting + next alarm
  const onAlarms = alarms.filter(a => a.on);
  const nextAlarm = computeNextAlarm(onAlarms, now);

  return (
    <div style={{
      minHeight: '100%', background: p.bgGradient, color: p.text,
      padding: '60px 22px 120px', position: 'relative',
    }}>
      {/* tiny sun motif top-right */}
      <div style={{
        position: 'absolute', top: 70, right: -40, width: 160, height: 160, borderRadius: '50%',
        background: `radial-gradient(circle, ${p.sunGlow} 0%, ${p.warm} 40%, transparent 70%)`,
        opacity: 0.55, pointerEvents: 'none',
      }} />

      {/* flying bird silhouettes top */}
      <div style={{ position: 'absolute', top: 110, right: 40, opacity: 0.55, zIndex: 1 }}>
        <FlyingBirdMark color={palette => p.text} stroke={p.text} />
      </div>
      <div style={{ position: 'absolute', top: 138, right: 88, opacity: 0.35, zIndex: 1 }}>
        <FlyingBirdMark stroke={p.text} small />
      </div>
      <div style={{ position: 'absolute', top: 132, right: 18, opacity: 0.3, zIndex: 1 }}>
        <FlyingBirdMark stroke={p.text} small />
      </div>

      <div className="fadein" style={{ position: 'relative', zIndex: 2 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: p.sub, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FeatherMark color={p.accent} />
          {formatDate(now)}
        </div>
        <h1 className="serif" style={{
          fontSize: 42, fontWeight: 400, margin: '6px 0 4px', letterSpacing: '-0.02em',
          textWrap: 'pretty',
        }}>
          {greeting(now)}
        </h1>
        <div style={{ color: p.sub, fontSize: 14, lineHeight: 1.5 }}>
          {nextAlarm
            ? <>Next chime in <span style={{ color: p.text, fontWeight: 600 }}>{nextAlarm.relative}</span> · {nextAlarm.label}</>
            : <>No alarms set. Rest easy.</>}
        </div>
      </div>

      {/* alarms */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {alarms.map((a, i) => (
          <AlarmCard key={a.id} a={a} palette={p} onToggle={() => toggle(a.id)}
            onTap={() => onEdit(a.id)}
            onRing={() => onTrigger(a.id)}
            delay={80 + i * 40}
          />
        ))}
        {alarms.length === 0 && (
          <div style={{
            padding: 28, borderRadius: 24, background: p.surface,
            border: `1px solid ${p.border}`, color: p.sub, textAlign: 'center',
          }}>
            Tap + to set your first alarm
          </div>
        )}
      </div>

      {/* add FAB */}
      <button onClick={onAdd} style={{
        position: 'absolute', bottom: 40, right: 22, width: 64, height: 64, borderRadius: '50%',
        border: 'none', cursor: 'pointer',
        background: `linear-gradient(135deg, ${p.warm}, ${p.accent})`,
        boxShadow: `0 12px 28px ${p.accent}55, 0 2px 4px rgba(0,0,0,0.08)`,
        color: '#fff', fontSize: 32, fontWeight: 300, lineHeight: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3v16M3 11h16" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>

      {/* demo trigger */}
      <button onClick={() => alarms[0] && onTrigger(alarms[0].id)}
        style={{
          position: 'absolute', bottom: 52, left: 22,
          padding: '10px 14px', borderRadius: 999, border: `1px solid ${p.border}`,
          background: p.surface, color: p.sub, fontSize: 11, fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
        ▶ demo ring
      </button>
    </div>
  );
}

function AlarmCard({ a, palette: p, onToggle, onTap, onRing, delay }) {
  const dayLabels = ['S','M','T','W','T','F','S'];
  const repeatStr = a.repeat.length === 0 ? 'One-time'
    : a.repeat.length === 7 ? 'Every day'
    : a.repeat.length === 5 && [1,2,3,4,5].every(d => a.repeat.includes(d)) ? 'Weekdays'
    : a.repeat.length === 2 && a.repeat.includes(0) && a.repeat.includes(6) ? 'Weekends'
    : a.repeat.map(d => dayLabels[d]).join(' ');

  return (
    <div className="fadein"
      style={{
        animationDelay: `${delay}ms`,
        background: p.surface,
        borderRadius: 26, padding: '18px 20px',
        border: `1px solid ${p.border}`,
        boxShadow: a.on ? `0 8px 22px ${p.accent}18, 0 1px 2px rgba(0,0,0,0.04)` : '0 1px 2px rgba(0,0,0,0.03)',
        opacity: a.on ? 1 : 0.7,
        position: 'relative', overflow: 'hidden',
      }}>
      {/* gradient accent bar */}
      {a.on && <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
        background: `linear-gradient(180deg, ${p.warm}, ${p.accent})`,
      }} />}

      <div onClick={onTap} style={{ cursor: 'pointer', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <span className="serif" style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: p.text }}>
            {String(a.hour).padStart(2,'0')}:{String(a.minute).padStart(2,'0')}
          </span>
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: p.sub, marginBottom: 6, letterSpacing: 1 }}>
            {a.ampm}
          </span>
          <div style={{ flex: 1 }} />
          <Toggle on={a.on} onToggle={(e) => { e.stopPropagation(); onToggle(); }} palette={p} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 6,
          color: p.sub, fontSize: 13,
        }}>
          <Icon name={a.icon} color={p.accent} />
          <span style={{ color: p.text, fontWeight: 500 }}>{a.label}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{repeatStr}</span>
        </div>
        {/* day pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {dayLabels.map((d, i) => {
            const active = a.repeat.includes(i);
            return (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: '50%',
                background: active ? p.accent : 'transparent',
                border: active ? 'none' : `1px solid ${p.border}`,
                color: active ? '#fff' : p.sub,
                fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{d}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onToggle, palette: p }) {
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 999, border: 'none',
      background: on ? p.accent : '#D0CABD',
      position: 'relative', cursor: 'pointer', padding: 0,
      transition: 'background 200ms',
      boxShadow: on ? `inset 0 1px 2px rgba(0,0,0,0.15)` : 'inset 0 1px 2px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 22 : 2,
        width: 24, height: 24, borderRadius: '50%', background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'left 200ms cubic-bezier(.2,.7,.2,1)',
      }} />
    </button>
  );
}

function Icon({ name, color }) {
  const s = { width: 16, height: 16, flexShrink: 0 };
  if (name === 'songbird') return (
    <svg style={s} viewBox="0 0 24 24" fill="none">
      {/* perched songbird silhouette */}
      <path d="M5 16c0-3 2-6 6-6 2 0 3 .5 4 1.5l4-2.5-1 4 2 1-3 1c-.5 2.5-3 4.5-6 4.5-3 0-6-1-6-3.5z"
        fill={color}/>
      <circle cx="16.5" cy="10.5" r="0.7" fill="#fff"/>
      <path d="M11 19l-1 3M13 19l0 3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (name === 'feather') return (
    <svg style={s} viewBox="0 0 24 24" fill="none">
      <path d="M19 5c-7 0-12 5-13 11l2 2 6-1c4-1 7-5 7-9V5z" fill={color}/>
      <path d="M19 5L6 18" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
  if (name === 'owl') return (
    <svg style={s} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="13" rx="7" ry="8" fill={color}/>
      <circle cx="9" cy="11" r="2.4" fill="#fff"/>
      <circle cx="15" cy="11" r="2.4" fill="#fff"/>
      <circle cx="9" cy="11" r="1" fill="#1a1a1a"/>
      <circle cx="15" cy="11" r="1" fill="#1a1a1a"/>
      <path d="M12 13l-1 1.5h2L12 13z" fill="#1a1a1a"/>
      <path d="M6 6l3 3M18 6l-3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === 'dove') return (
    <svg style={s} viewBox="0 0 24 24" fill="none">
      {/* dove in flight */}
      <path d="M2 14c2 1 5 1 7-1 1 1.5 3 2 5 2 4 0 7-3 8-7-2 1-4 1-6 0 0-2-2-3-4-3-3 0-5 2-5 5-2 0-4 1-5 4z"
        fill={color}/>
      <circle cx="19" cy="7" r="0.7" fill="#fff"/>
    </svg>
  );
  return null;
}

// helpers
function greeting(d) {
  const h = d.getHours();
  if (h < 5) return 'The night birds rest.';
  if (h < 12) return 'The lark is calling, Maya.';
  if (h < 17) return 'Good afternoon, songbird.';
  if (h < 21) return 'Evening, Maya.';
  return 'Roost time. Sleep well.';
}
function formatDate(d) {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}  ·  ${months[d.getMonth()]} ${d.getDate()}`;
}
function computeNextAlarm(alarms, now) {
  if (alarms.length === 0) return null;
  let best = null;
  for (const a of alarms) {
    let h24 = a.hour % 12 + (a.ampm === 'PM' ? 12 : 0);
    const target = new Date(now);
    target.setHours(h24, a.minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target - now;
    if (!best || ms < best.ms) best = { ms, label: a.label };
  }
  const mins = Math.round(best.ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  let rel;
  if (h === 0) rel = `${m}m`;
  else if (h < 24) rel = `${h}h ${m}m`;
  else rel = `${Math.floor(h/24)}d ${h%24}h`;
  return { relative: rel, label: best.label };
}

window.AlarmListScreen = AlarmListScreen;
window.Icon = Icon;

// small bird-in-flight glyph (used in list background + picker knob)
function FlyingBirdMark({ stroke = '#000', small = false }) {
  const w = small ? 22 : 32;
  const h = small ? 8 : 12;
  return (
    <svg width={w} height={h} viewBox="0 0 32 12" fill="none">
      <path d="M2 9 Q8 1 16 9 Q24 1 30 9" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function FeatherMark({ color }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M19 5c-7 0-12 5-13 11l2 2 6-1c4-1 7-5 7-9V5z" fill={color}/>
    </svg>
  );
}
window.FlyingBirdMark = FlyingBirdMark;
window.FeatherMark = FeatherMark;
