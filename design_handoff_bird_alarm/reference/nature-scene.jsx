// Nature scene "video" that plays when the alarm triggers.
// CSS/SVG-animated sunrise scene with parallax mountains, drifting clouds,
// rising sun, gliding birds, swaying grass.
//
// To plug in a REAL video file, set props.videoSrc and the <video> below
// will replace the animated scene.

function AlarmScene({ palette: p, alarm, videoSrc, onStop, onSnooze, currentTime }) {
  const t = currentTime || new Date();
  const timeStr = `${alarm.hour}:${String(alarm.minute).padStart(2,'0')}`;
  const greet = (() => {
    const h = t.getHours();
    if (h < 5) return 'Pre-dawn chorus';
    if (h < 12) return 'The lark is calling';
    if (h < 17) return 'Afternoon flight';
    if (h < 21) return 'Evening roost';
    return 'Night birds singing';
  })();

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: '#0E1F2E', color: '#fff',
    }}>
      {videoSrc ? (
        <video src={videoSrc} autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <NatureSceneSVG palette={p} />
      )}

      {/* dim vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.45) 100%)',
      }} />

      {/* time + label */}
      <div className="scalein" style={{
        position: 'absolute', top: '16%', left: 0, right: 0,
        textAlign: 'center', zIndex: 4,
        textShadow: '0 2px 18px rgba(0,0,0,0.35)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#FF6B6B', animation: 'glow-pulse 1.6s infinite',
          }} />
          NOW SINGING
        </div>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: 3, opacity: 0.85, textTransform: 'uppercase',
          marginTop: 14,
        }}>{greet}</div>
        <div className="serif" style={{
          fontSize: 110, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.04em',
          marginTop: 6,
        }}>{timeStr}</div>
        <div className="serif" style={{
          fontSize: 22, fontWeight: 400, opacity: 0.95, marginTop: 4,
        }}>{alarm.label}</div>
        <div style={{
          marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
          fontSize: 11, fontWeight: 500, letterSpacing: 0.5,
        }}>
          ♪ {alarm.sound || 'Rainforest'}
        </div>
      </div>

      {/* actions */}
      <div style={{
        position: 'absolute', bottom: 50, left: 22, right: 22, zIndex: 5,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <button onClick={onSnooze} style={{
          padding: '18px', borderRadius: 22, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          color: '#fff', fontSize: 16, fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.3)',
        }}>Snooze · 9 min</button>
        <button onClick={onStop} style={{
          padding: '20px', borderRadius: 22, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${p.warm}, ${p.accent})`,
          color: '#fff', fontSize: 17, fontWeight: 700,
          boxShadow: `0 10px 28px ${p.accent}88`,
        }}>Wake up</button>
      </div>

      {/* subtle scrim at bottom over buttons */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        pointerEvents: 'none', zIndex: 2,
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.35))',
      }} />
    </div>
  );
}

function NatureSceneSVG({ palette: p }) {
  // animated sunrise — sky gradient, sun, mountains, mist, grass, birds
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          #2A3D5C 0%,
          #6B4E7D 18%,
          #C26B7A 38%,
          #E89968 56%,
          #F2C28C 70%,
          #B8C9A8 88%,
          #7FA86E 100%)`,
      }} />

      {/* sun glow */}
      <div style={{
        position: 'absolute', left: '50%', top: '52%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFE7B0 0%, #FFB76B 20%, rgba(255,150,90,0.4) 40%, transparent 65%)',
        animation: 'sun-rise 8s ease-out both',
        mixBlendMode: 'screen', opacity: 0.85,
      }} />
      {/* sun disc */}
      <div style={{
        position: 'absolute', left: '50%', top: '55%',
        transform: 'translate(-50%, -50%)',
        width: 90, height: 90, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFF4D1 0%, #FFD27A 60%, #FFA94D 100%)',
        boxShadow: '0 0 80px #FFD27A, 0 0 140px #FFA94D88',
        animation: 'sun-rise 8s ease-out both',
      }} />

      {/* clouds */}
      <Cloud top="22%" duration={70} delay={0} scale={1} opacity={0.7} />
      <Cloud top="14%" duration={95} delay={-30} scale={0.7} opacity={0.5} />
      <Cloud top="30%" duration={110} delay={-60} scale={1.2} opacity={0.6} />

      {/* birds flock */}
      <div style={{
        position: 'absolute', left: 0, top: '32%',
        animation: 'bird-glide 24s linear infinite',
      }}>
        <Bird /><div style={{ display: 'inline-block', width: 18 }} /><Bird small />
      </div>
      <div style={{
        position: 'absolute', left: '-10%', top: '42%',
        animation: 'bird-glide 32s linear infinite', animationDelay: '-8s',
      }}>
        <Bird small /><div style={{ display: 'inline-block', width: 12 }} /><Bird small /><div style={{ display: 'inline-block', width: 16 }} /><Bird small />
      </div>
      <div style={{
        position: 'absolute', left: '-15%', top: '26%',
        animation: 'bird-glide 42s linear infinite', animationDelay: '-22s',
      }}>
        <Bird small />
      </div>

      {/* drifting feathers */}
      <Feather left="20%" delay={0}  duration={11} color="#FFE7B0" />
      <Feather left="68%" delay={-4} duration={14} color="#FFD6B0" />
      <Feather left="40%" delay={-9} duration={17} color="#FFF1D6" />

      {/* far mountains */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: '28%', left: 0, width: '100%', height: '22%', opacity: 0.75 }}>
        <path d="M0 200 L0 140 L40 110 L80 130 L120 90 L170 120 L220 80 L270 110 L320 95 L380 120 L400 105 L400 200 Z"
          fill="#6B4E7D" />
      </svg>
      {/* near mountains */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: '20%', left: 0, width: '100%', height: '22%' }}>
        <path d="M0 200 L0 150 L30 120 L70 140 L110 100 L160 130 L210 110 L260 135 L310 115 L360 140 L400 130 L400 200 Z"
          fill="#3F4E5C" />
      </svg>

      {/* mist layer */}
      <div style={{
        position: 'absolute', bottom: '18%', left: 0, right: 0, height: 80,
        background: 'linear-gradient(180deg, rgba(255,220,180,0.5), transparent)',
        filter: 'blur(8px)',
      }} />

      {/* hills / foreground */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '24%' }}>
        <defs>
          <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5C8C56"/>
            <stop offset="100%" stopColor="#2D4A2A"/>
          </linearGradient>
        </defs>
        <path d="M0 200 L0 100 Q60 70 130 90 Q220 115 300 80 Q360 60 400 80 L400 200 Z"
          fill="url(#hillGrad)" />
      </svg>

      {/* grass blades */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, zIndex: 3,
        background: 'linear-gradient(180deg, transparent, #1F3318)',
      }} />
      {[5, 15, 28, 42, 58, 72, 86, 95].map((x, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0, left: `${x}%`,
          width: 3, height: 30 + (i % 3) * 8,
          background: 'linear-gradient(180deg, #6BA15C, #2D4A2A)',
          borderRadius: '40% 40% 0 0',
          transformOrigin: 'bottom center',
          animation: `leaf-sway ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}

      {/* shimmer over scene (subtle warmth) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 55%, rgba(255,220,150,0.18), transparent 50%)',
      }} />
    </div>
  );
}

function Cloud({ top, duration, delay, scale = 1, opacity = 0.6 }) {
  return (
    <div style={{
      position: 'absolute', top, left: 0,
      animation: `float-cloud ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      opacity,
      transform: `scale(${scale})`,
    }}>
      <svg width="120" height="42" viewBox="0 0 120 42">
        <ellipse cx="30" cy="28" rx="22" ry="14" fill="#fff" opacity="0.85"/>
        <ellipse cx="55" cy="22" rx="28" ry="18" fill="#fff" opacity="0.9"/>
        <ellipse cx="85" cy="28" rx="20" ry="13" fill="#fff" opacity="0.85"/>
      </svg>
    </div>
  );
}

function Bird({ small }) {
  const s = small ? 12 : 18;
  return (
    <svg width={s * 2} height={s} viewBox="0 0 36 18" style={{ display: 'inline-block' }}>
      <path d="M2 10 Q9 2 18 10 Q27 2 34 10" stroke="#1A2530" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Feather({ left, delay, duration, color }) {
  return (
    <div style={{
      position: 'absolute', left, top: '-10%',
      animation: `feather-fall ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none', opacity: 0.85,
    }}>
      <svg width="22" height="36" viewBox="0 0 22 36" fill="none">
        <path d="M11 2c-5 4-8 10-8 16 0 6 3 12 8 16 5-4 8-10 8-16 0-6-3-12-8-16z" fill={color} opacity="0.85"/>
        <path d="M11 4v28" stroke="#a08160" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

window.AlarmScene = AlarmScene;
