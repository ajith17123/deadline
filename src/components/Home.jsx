import { useEffect, useMemo, useState } from 'react';
import '../assets/style/Home.css';

const TOTAL_DAYS = 7;
const TOTAL_DURATION_MS = 15 * 1000;
const STEP_MS = TOTAL_DURATION_MS / TOTAL_DAYS; // ~2142ms per day

// Typing cadence (seconds per key cycle) by urgency tier
const getTypingSpeed = (days) => {
  if (days >= 5) return 0.35; // normal
  if (days >= 2) return 0.22; // hurried
  return 0.1; // panicked
};

const getTone = (days) => {
  if (days <= 0) return 'reached';
  if (days <= 1) return 'critical';
  if (days <= 4) return 'warning';
  return 'calm';
};

// Flame tongue x positions along the track (x: 70 -> 610)
const TONGUES = Array.from({ length: 18 }, (_, i) => 78 + i * 30);

export default function Home() {
  const [daysLeft, setDaysLeft] = useState(TOTAL_DAYS);
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Countdown timer; re-created whenever the animation is restarted
  useEffect(() => {
    let remaining = TOTAL_DAYS;
    const intervalId = setInterval(() => {
      remaining -= 1;
      setDaysLeft(remaining);
      if (remaining <= 0) {
        clearInterval(intervalId);
        setIsCompleted(true);
      }
    }, STEP_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [animationKey]);

  const typingSpeedTier = useMemo(() => getTypingSpeed(daysLeft), [daysLeft]);
  const tone = getTone(daysLeft);

  const label = isCompleted
    ? 'Deadline reached!'
    : `Deadline ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;

  const handleRestart = () => {
    setDaysLeft(TOTAL_DAYS);
    setIsCompleted(false);
    setAnimationKey((k) => k + 1); // remounts the scene so CSS animations restart
  };

  return (
    <main className="home">
      <section className="deadline-stage">
        <div
          key={animationKey}
          className={`deadline-scene${isCompleted ? ' is-completed' : ''}`}
          style={{ '--typing-speed': `${typingSpeedTier}s` }}
        >
          <svg
            className="deadline-svg"
            viewBox="0 0 782 180"
            role="img"
            aria-label="The Grim Reaper walks along a burning deadline bar toward a developer typing at a desk"
          >
            <defs>
              <linearGradient id="flameBase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7b523" />
                <stop offset="0.55" stopColor="#e63946" />
                <stop offset="1" stopColor="#b71342" />
              </linearGradient>
              <linearGradient id="cloakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2b3242" />
                <stop offset="1" stopColor="#12151d" />
              </linearGradient>
              <linearGradient id="bladeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e8edf5" />
                <stop offset="1" stopColor="#8a94a8" />
              </linearGradient>
              <radialGradient id="screenLight" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#6fd3ff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#6fd3ff" stopOpacity="0" />
              </radialGradient>
              {/* Track shape: flames are clipped to the bar plus the space above it */}
              <clipPath id="trackClip">
                <rect x="70" y="98" width="540" height="58" />
              </clipPath>
              <clipPath id="trackShape">
                <rect x="70" y="138" width="540" height="16" rx="8" />
              </clipPath>
            </defs>

            {/* ---------- Deadline track ---------- */}
            <g className="track">
              <rect x="70" y="138" width="540" height="16" rx="8" className="track-bed" />
              <g clipPath="url(#trackClip)">
                <g clipPath="url(#trackShape)">
                  <rect x="70" y="138" width="540" height="16" fill="url(#flameBase)" />
                </g>
                {TONGUES.map((x, i) => (
                  <g key={`t-${x}`}>
                    <path
                      className="tongue tongue-red"
                      style={{ animationDelay: `${(i % 6) * 0.13}s` }}
                      d={`M ${x} 142 C ${x - 6} 128 ${x + 3} 118 ${x + 1} 104 C ${x + 12} 118 ${x + 18} 128 ${x + 14} 142 Z`}
                    />
                    <path
                      className="tongue tongue-amber"
                      style={{ animationDelay: `${(i % 5) * 0.11 + 0.05}s` }}
                      d={`M ${x + 2} 142 C ${x - 1} 132 ${x + 4} 126 ${x + 3} 116 C ${x + 10} 126 ${x + 13} 132 ${x + 11} 142 Z`}
                    />
                  </g>
                ))}
                {/* Burnt-away mask: grows left to right as the deadline nears */}
                <rect className="burnt-mask" x="70" y="98" width="540" height="58" />
              </g>
              <rect x="70" y="138" width="540" height="16" rx="8" className="track-outline" />
            </g>

            {/* ---------- Grim Reaper ---------- */}
            <g className="reaper-walk">
              <g className="reaper-bob">
                {/* Scythe pole */}
                <line x1="66" y1="22" x2="66" y2="154" className="scythe-pole" />
                {/* Scythe blade */}
                <path
                  d="M 66 22 Q 98 14 110 44 Q 92 32 66 34 Z"
                  fill="url(#bladeGrad)"
                  stroke="#5b6478"
                  strokeWidth="1"
                />
                <path d="M 66 34 Q 88 34 104 46" fill="none" stroke="#5b6478" strokeWidth="0.8" />

                {/* Blood coating on weapon edge */}
                <path d="M 85 24 Q 98 22 110 44 Q 94 38 78 35 Z" fill="#b71342" opacity="0.9" />

                {/* Animated blood dripping and splitting from weapon */}
                <g className="weapon-blood">
                  <path className="blood-drip drip-1" d="M 109 44 Q 111 48 109 52 Q 107 48 109 44 Z" fill="#e63946" />
                  <path className="blood-drip drip-2" d="M 95 39 Q 97 43 95 47 Q 93 43 95 39 Z" fill="#b71342" />
                  <circle className="blood-drop drop-3" cx="109" cy="48" r="1.6" fill="#e63946" />
                  <circle className="blood-drop drop-4" cx="95" cy="43" r="1.3" fill="#b71342" />
                </g>

                {/* Cloak in right-facing profile */}
                <path
                  d="M 16 154 L 20 84 Q 24 54 44 52 Q 58 56 58 84 L 62 154 L 54 148 L 46 154 L 38 148 L 30 154 L 22 148 Z"
                  fill="url(#cloakGrad)"
                  stroke="#0a0c11"
                  strokeWidth="1.2"
                />
                {/* Robe folds */}
                <path d="M 28 92 L 24 150" stroke="#0a0c11" strokeWidth="1" fill="none" opacity="0.7" />
                <path d="M 38 94 L 36 148" stroke="#0a0c11" strokeWidth="1" fill="none" opacity="0.7" />
                <path d="M 48 92 L 50 150" stroke="#0a0c11" strokeWidth="1" fill="none" opacity="0.7" />

                {/* Hood in right-facing side profile (cowl overhanging to the right) */}
                <path
                  d="M 18 64 C 18 42 30 32 46 32 C 58 32 64 40 60 52 C 56 60 46 64 36 64 C 24 64 18 64 18 64 Z"
                  fill="#1a1e29"
                  stroke="#0a0c11"
                  strokeWidth="1.2"
                />

                {/* Dark face opening on the right side of the hood (pitch black void) */}
                <path
                  d="M 36 40 C 50 38 56 48 50 58 C 44 62 36 62 36 40 Z"
                  fill="#05060a"
                />

                {/* Sleeve and bony hand reaching forward right to hold the scythe */}
                <path d="M 46 82 L 60 90 L 56 96 L 42 88 Z" fill="#232938" stroke="#0a0c11" strokeWidth="1" />
                <circle cx="63" cy="91" r="3.5" fill="#e9e4d6" stroke="#8a8676" strokeWidth="0.8" />
                <path d="M 60 88 L 67 88 M 60 91 L 67 91 M 60 94 L 67 94" stroke="#8a8676" strokeWidth="0.8" />
              </g>
            </g>

            {/* ---------- Developer, chair and desk ---------- */}
            <g className="developer-area">
              {/* Screen glow on the wall/desk */}
              <ellipse className="screen-halo" cx="756" cy="92" rx="46" ry="34" fill="url(#screenLight)" />

              {/* Office chair */}
              <g className="chair">
                <rect x="644" y="82" width="7" height="46" rx="3" fill="#39414f" />
                <rect x="644" y="126" width="48" height="8" rx="4" fill="#39414f" />
                <rect x="665" y="134" width="5" height="16" fill="#2a303b" />
                <path d="M 650 152 L 685 152 M 667 150 L 651 154 M 667 150 L 684 154" stroke="#2a303b" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="650" cy="155" r="2.5" fill="#1c2029" />
                <circle cx="668" cy="155" r="2.5" fill="#1c2029" />
                <circle cx="686" cy="155" r="2.5" fill="#1c2029" />
              </g>

              {/* Legs */}
              <path d="M 662 124 L 700 124 L 702 152" fill="none" stroke="#3b4a6b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 698 152 L 710 152" stroke="#171a22" strokeWidth="5" strokeLinecap="round" />

              {/* Torso */}
              <path d="M 656 126 L 660 90 Q 668 82 678 90 L 680 126 Z" fill="#d26a3f" stroke="#7d3a1f" strokeWidth="1" />

              {/* Head */}
              <g className="dev-head">
                <circle cx="670" cy="70" r="11" fill="#e8b98f" stroke="#a5754f" strokeWidth="1" />
                <path d="M 659 68 Q 660 56 671 56 Q 681 57 681 66 Q 672 62 659 68 Z" fill="#2b2119" />
                <circle cx="677" cy="71" r="1.4" fill="#22160f" />
                <path d="M 675 77 Q 678 79 681 77" fill="none" stroke="#7a3f2b" strokeWidth="1.2" strokeLinecap="round" />
                <path className="sweat" d="M 662 66 Q 659 71 662 73 Q 665 71 662 66 Z" fill="#6fd3ff" />
              </g>

              {/* Desk */}
              <g className="desk">
                <rect x="690" y="118" width="92" height="6" rx="1" fill="#59493a" />
                <rect x="694" y="124" width="5" height="32" fill="#453829" />
                <rect x="774" y="124" width="5" height="32" fill="#453829" />
                <rect x="700" y="124" width="34" height="14" fill="#453829" />
                {/* Keyboard */}
                <rect x="704" y="114" width="30" height="4" rx="1" fill="#1b1f28" stroke="#4a5266" strokeWidth="0.6" />
                {/* Monitor */}
                <rect x="752" y="112" width="8" height="6" fill="#2a303b" />
                <rect x="744" y="108" width="24" height="5" rx="1" fill="#2a303b" />
                <rect x="738" y="70" width="42" height="38" rx="3" fill="#1b1f28" stroke="#4a5266" strokeWidth="1.2" />
                <rect className="screen-face" x="742" y="74" width="34" height="30" rx="1.5" fill="#153a52" />
                <path d="M 746 80 H 762 M 746 85 H 770 M 750 90 H 766 M 746 95 H 758" stroke="#6fd3ff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
              </g>

              {/* Arms (drawn last so hands rest on the keyboard) */}
              <g className="arm arm-left">
                <path d="M 668 96 L 690 108 L 708 114" fill="none" stroke="#d26a3f" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="709" cy="115" r="3.2" fill="#e8b98f" />
              </g>
              <g className="arm arm-right">
                <path d="M 672 98 L 694 110 L 722 114" fill="none" stroke="#b85a33" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="723" cy="115" r="3.2" fill="#e8b98f" />
              </g>
            </g>
          </svg>
        </div>

        <p className={`deadline-label tone-${tone}`} role="status" aria-live="polite">
          {label}
        </p>

        <button type="button" className="restart-button" onClick={handleRestart}>
          <svg className="restart-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M 20 12 A 8 8 0 1 1 17.66 6.34 M 20 4 V 8.5 H 15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Restart
        </button>
      </section>
    </main>
  );
}
