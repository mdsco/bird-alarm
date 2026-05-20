// Stylish radial sun-dial time picker
// - Drag the sun knob around the ring
// - Tap HH or MM to switch mode
// - Outer ring of tick marks acts like a sundial

const { useState, useEffect, useRef, useCallback } = React;

function TimePicker({ palette: p, initialHour = 6, initialMinute = 30, initialAmpm = 'AM', onChange }) {
  const [mode, setMode] = useState('hour'); // 'hour' | 'minute'
  const [hour, setHour] = useState(initialHour);   // 1..12
  const [minute, setMinute] = useState(initialMinute); // 0..59
  const [ampm, setAmpm] = useState(initialAmpm);
  const ringRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => { onChange && onChange({ hour, minute, ampm }); }, [hour, minute, ampm]);

  const setFromPointer = useCallback((clientX, clientY) => {
    const el = ringRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    // angle 0 = top (12 o'clock), going clockwise
    let theta = Math.atan2(dx, -dy);
    if (theta < 0) theta += Math.PI * 2;
    const turn = theta / (Math.PI * 2); // 0..1
    if (mode === 'hour') {
      let h = Math.round(turn * 12);
      if (h === 0) h = 12;
      setHour(h);
    } else {
      let m = Math.round(turn * 60) % 60;
      setMinute(m);
    }
  }, [mode]);

  const onPointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setFromPointer(e.clientX, e.clientY);
  };
  const onPointerUp = (e) => { dragging.current = false; };

  // sun angle (degrees, 0 = up)
  const sunAngle = mode === 'hour'
    ? ((hour % 12) / 12) * 360
    : (minute / 60) * 360;
  const radius = 122;
  const sunX = Math.sin(sunAngle * Math.PI / 180) * radius;
  const sunY = -Math.cos(sunAngle * Math.PI / 180) * radius;

  const fmt = (n) => String(n).padStart(2, '0');

  // tick marks
  const ticks = [];
  const tickCount = 60;
  for (let i = 0; i < tickCount; i++) {
    const major = i % 5 === 0;
    const a = (i / tickCount) * 360;
    const len = major ? 10 : 4;
    const outer = 152;
    const inner = outer - len;
    const x1 = Math.sin(a * Math.PI / 180) * outer;
    const y1 = -Math.cos(a * Math.PI / 180) * outer;
    const x2 = Math.sin(a * Math.PI / 180) * inner;
    const y2 = -Math.cos(a * Math.PI / 180) * inner;
    ticks.push(
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={major ? p.text : p.sub}
        strokeOpacity={major ? 0.45 : 0.18}
        strokeWidth={major ? 1.6 : 1}
        strokeLinecap="round" />
    );
  }

  // hour numbers
  const hourLabels = [12, 3, 6, 9].map((h, i) => {
    const a = (h % 12) / 12 * 360;
    const r = 170;
    const x = Math.sin(a * Math.PI / 180) * r;
    const y = -Math.cos(a * Math.PI / 180) * r;
    return (
      <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fill={p.sub} fontSize="14" fontFamily="Inter" fontWeight="500"
        opacity={mode === 'hour' ? 0.65 : 0.3}>
        {h}
      </text>
    );
  });

  // minute labels
  const minLabels = [0, 15, 30, 45].map((m) => {
    const a = m / 60 * 360;
    const r = 170;
    const x = Math.sin(a * Math.PI / 180) * r;
    const y = -Math.cos(a * Math.PI / 180) * r;
    return (
      <text key={m} x={x} y={y} textAnchor="middle" dominantBaseline="central"
        fill={p.sub} fontSize="13" fontFamily="JetBrains Mono" fontWeight="500"
        opacity={mode === 'minute' ? 0.65 : 0}>
        :{String(m).padStart(2, '0')}
      </text>
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* time readout */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
        <button onClick={() => setMode('hour')}
          style={{
            ...numBtn, color: p.text,
            background: mode === 'hour' ? p.accentSoft : 'transparent',
            border: mode === 'hour' ? `1.5px solid ${p.accent}` : '1.5px solid transparent',
          }}>
          <span className="serif" style={{ fontSize: 76, fontWeight: 500, lineHeight: 1 }}>{fmt(hour)}</span>
        </button>
        <span className="serif" style={{ fontSize: 64, fontWeight: 400, color: p.sub, lineHeight: 1 }}>:</span>
        <button onClick={() => setMode('minute')}
          style={{
            ...numBtn, color: p.text,
            background: mode === 'minute' ? p.accentSoft : 'transparent',
            border: mode === 'minute' ? `1.5px solid ${p.accent}` : '1.5px solid transparent',
          }}>
          <span className="serif" style={{ fontSize: 76, fontWeight: 500, lineHeight: 1 }}>{fmt(minute)}</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 8 }}>
          {['AM', 'PM'].map(v => (
            <button key={v} onClick={() => setAmpm(v)}
              style={{
                padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: ampm === v ? p.accent : 'transparent',
                color: ampm === v ? '#fff' : p.sub,
                fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
              }}>{v}</button>
          ))}
        </div>
      </div>

      {/* dial */}
      <div
        ref={ringRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: 340, height: 340, position: 'relative',
          touchAction: 'none', userSelect: 'none', cursor: 'grab',
          marginTop: 8,
        }}>
        <svg width={340} height={340} viewBox="-170 -170 340 340"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {/* outer soft glow */}
          <defs>
            <radialGradient id="dialBg" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={p.surface} />
              <stop offset="100%" stopColor={p.surfaceSoft} />
            </radialGradient>
            <radialGradient id="sunGrad" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={p.sunGlow} />
              <stop offset="60%" stopColor={p.sun} />
              <stop offset="100%" stopColor={p.accent} />
            </radialGradient>
          </defs>

          {/* dial body */}
          <circle r={144} fill="url(#dialBg)" stroke={p.border} strokeWidth="1" />
          {/* ticks */}
          {ticks}
          {/* labels */}
          {hourLabels}
          {minLabels}

          {/* arc from 12 to sun position */}
          <ArcPath angle={sunAngle} radius={130} color={p.accent} />

          {/* center pin */}
          <circle r={4} fill={p.sub} opacity="0.4" />
        </svg>

        {/* sun knob (positioned via transform) */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `translate(calc(${sunX}px - 50%), calc(${sunY}px - 50%))`,
          width: 56, height: 56, borderRadius: '50%',
          background: `radial-gradient(circle, ${p.sunGlow} 0%, ${p.sun} 50%, ${p.accent} 100%)`,
          boxShadow: `0 0 32px ${p.sun}aa, 0 0 0 6px ${p.accent}22, 0 4px 14px rgba(0,0,0,0.18)`,
          pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: dragging.current ? 'none' : 'transform 240ms cubic-bezier(.2,.7,.2,1)',
        }}>
          {/* bird-in-flight glyph */}
          <svg width="28" height="14" viewBox="0 0 32 14" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            <path d="M2 11 Q9 2 16 11 Q23 2 30 11" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          {/* halo */}
          <div style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${p.sunGlow}88, transparent 20deg, ${p.sunGlow}88 40deg, transparent 60deg, ${p.sunGlow}88 80deg, transparent 100deg, ${p.sunGlow}88 120deg, transparent 140deg, ${p.sunGlow}88 160deg, transparent 180deg)`,
            opacity: 0.4, filter: 'blur(2px)',
          }} />
        </div>

        {/* center hint */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', color: p.sub, opacity: 0.55,
        }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            guide the lark
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
            ·  {mode === 'hour' ? 'hour' : 'minute'}  ·
          </div>
        </div>
      </div>
    </div>
  );
}

const numBtn = {
  padding: '4px 12px', borderRadius: 12, cursor: 'pointer',
  outline: 'none', transition: 'all 180ms',
};

// SVG arc from top to given angle (degrees, clockwise from up)
function ArcPath({ angle, radius, color }) {
  const a = Math.max(0.0001, Math.min(360 - 0.0001, angle));
  const rad = a * Math.PI / 180;
  const x = Math.sin(rad) * radius;
  const y = -Math.cos(rad) * radius;
  const large = a > 180 ? 1 : 0;
  const d = `M 0 ${-radius} A ${radius} ${radius} 0 ${large} 1 ${x} ${y}`;
  return <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.85" />;
}

window.TimePicker = TimePicker;
