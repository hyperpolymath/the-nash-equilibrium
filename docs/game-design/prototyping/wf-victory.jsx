/* global React */

// ============================================================
// 6) VICTORY / ENDGAME TRACKER
// ============================================================
function VictoryTracker() {
  return (
    <div className="page" data-page="victory">
      <p className="page-intro">
        <b>Endgame surface —</b> the table needs to surface, at all times, (a) which cooperative
        endings are still reachable, (b) each player's pathway progress, and (c) how close we are
        to Planetary Collapse. Without this visibility the Nash-equilibrium tension goes flat.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Four cooperative gates"
          desc="A row of four 'gates' across the top of the table. Each gate has its conditions printed; tokens move into a gate as conditions are met."
          notes={<ul>
            <li>+ players see the cooperative endings as concrete goals</li>
            <li>+ a gate dimming = that ending now unreachable (e.g. someone is in social collapse)</li>
            <li>− takes table real estate</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {['Post-Scarcity','Harmonic Degrowth','Digital Commons','Managed Decline'].map((n,i) => (
              <g key={n}>
                <rect x={20+i*92} y="30" width="84" height="180" className="ink" rx="6" />
                <text x={28+i*92} y="50" className="title" style={{fontSize:13}}>{n.split(' ')[0]}</text>
                <text x={28+i*92} y="64" className="title" style={{fontSize:13}}>{n.split(' ')[1] || ''}</text>
                {/* condition bars */}
                {[0,1,2].map(j => (
                  <g key={j}>
                    <rect x={28+i*92} y={80+j*36} width="68" height="10" className="ink ink-thin" rx="2" />
                    <rect x={28+i*92} y={80+j*36} width={(i*8+j*12+12)} height="10" className={i===3 ? 'swatch-amber' : 'swatch-moss'} />
                    <text x={28+i*92} y={104+j*36} className="tiny">cond {j+1}</text>
                  </g>
                ))}
                {i===2 && <line x1={20+i*92} y1="30" x2={104+i*92} y2="210" className="rose ink-thick" />}
              </g>
            ))}
            <text x="20" y="240" className="label">COOP GATES · ✕ = NOW UNREACHABLE</text>
            <text x="20" y="260" className="tiny">if all 4 close → forced Loss screen</text>
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Player pathway tracks"
          desc="Each player has their own pathway track on their board. A clear &quot;you are here / you need this&quot; ladder."
          notes={<ul>
            <li>+ each player always knows what they're chasing</li>
            <li>+ supports the &quot;coop ending unlocks individual win&quot; rule cleanly</li>
            <li>− pathway visible only on own board → less group tension</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {['Capitalist','Socialist','Green','Techno-Utopian'].map((n,i) => (
              <g key={n}>
                <text x="20" y={26+i*64} className="title" style={{fontSize:14}}>{n}</text>
                <line x1="20" y1={42+i*64} x2="380" y2={42+i*64} className="ink" />
                {[0,1,2,3,4,5].map(j => (
                  <g key={j}>
                    <circle cx={40+j*64} cy={42+i*64} r="10" className={j <= i+1 ? (i%2===0 ? 'swatch-moss' : 'swatch-amber') : 'fill-paper'} />
                    <circle cx={40+j*64} cy={42+i*64} r="10" className="ink" />
                  </g>
                ))}
                <text x="20" y={62+i*64} className="tiny">milestone → unlock → finale</text>
              </g>
            ))}
            <text x="20" y="276" className="label">FOUR PATHWAYS · LADDER</text>
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Doom clock + hope clock"
          desc="Two opposing dials. Left: minutes to Planetary Collapse (advances on each Black). Right: hours to a viable cooperative ending. They tick toward each other."
          notes={<ul>
            <li>+ makes the existential stakes loud</li>
            <li>+ great photo moments</li>
            <li>− abstract; needs a clear rule for what advances each</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <g transform="translate(110 140)">
              <circle r="80" className="ink ink-thick" />
              <circle r="80" className="swatch-rose" />
              <circle r="80" className="ink" />
              <line x1="0" y1="0" x2="0" y2="-64" className="ink ink-thick" transform="rotate(150)" />
              <text x="-30" y="100" className="label">DOOM</text>
              <text x="-22" y="116" className="tiny">11:50</text>
            </g>
            <g transform="translate(290 140)">
              <circle r="80" className="ink ink-thick" />
              <circle r="80" className="swatch-moss" />
              <circle r="80" className="ink" />
              <line x1="0" y1="0" x2="0" y2="-64" className="ink ink-thick" transform="rotate(-30)" />
              <text x="-30" y="100" className="label">HOPE</text>
              <text x="-22" y="116" className="tiny">10:30</text>
            </g>
            <text x="160" y="270" className="label">RACE THE CLOCKS</text>
          </svg>
        </Variant>

        <Variant tag="OPTION D" title="Single status panel"
          desc="One unified panel: pathway slots per player, gate icons, doom counter, ledger summary. Compact and information-dense."
          notes={<ul>
            <li>+ best for low-table-space play</li>
            <li>+ digital companion app port is trivial</li>
            <li>− less ceremonial</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="10" y="10" width="380" height="260" className="ink ink-thick" rx="6" />
            <text x="20" y="32" className="title">STATUS</text>
            {/* gates */}
            <text x="20" y="56" className="label">COOP GATES</text>
            {['PSU','HD','DC','MD'].map((g,i) => (
              <g key={g}>
                <rect x={20+i*40} y="64" width="32" height="32" className={i===2 ? 'swatch-rose' : 'swatch-moss'} />
                <rect x={20+i*40} y="64" width="32" height="32" className="ink" />
                <text x={26+i*40} y="86" className="tiny">{g}</text>
              </g>
            ))}
            {/* doom */}
            <text x="200" y="56" className="label">DOOM</text>
            <rect x="200" y="64" width="180" height="14" className="ink" />
            <rect x="200" y="64" width="120" height="14" className="swatch-rose" />
            <text x="320" y="92" className="tiny">3/4 black</text>
            {/* players */}
            <text x="20" y="120" className="label">PATHWAYS</text>
            {['Indust','Soc','Green','Techno'].map((n,i) => (
              <g key={n}>
                <text x="20" y={140+i*30} className="tiny">{n}</text>
                <rect x="80" y={130+i*30} width="280" height="14" className="ink" />
                <rect x="80" y={130+i*30} width={60+i*40} height="14" className="swatch-amber" />
              </g>
            ))}
            <text x="20" y="262" className="tiny">live readout · drives projector / app</text>
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Forecast cone"
          desc="At each era boundary, the table casts forward: given current trajectories, which endings are still mathematically possible? Live-updated cone of futures."
          notes={<ul>
            <li>+ teaches scenario planning; thematically perfect</li>
            <li>+ creates 'tipping point' moments when the cone narrows</li>
            <li>− most rules-complex; probably needs a digital aid</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <line x1="40" y1="240" x2="360" y2="240" className="ink ink-thick" />
            {[0,1,2,3,4].map(i => (
              <text key={i} x={40+i*80-10} y="258" className="tiny">era {i+1}</text>
            ))}
            {/* cone */}
            <path d="M40 140 L360 30 L360 250 Z" className="ink ink-dash fill-paper" />
            <path d="M40 140 L360 30 L360 250 Z" className="swatch-amber" style={{opacity:0.4}} />
            {/* trajectories */}
            <path d="M40 140 Q160 120 360 60" className="moss" />
            <path d="M40 140 Q160 160 360 200" className="terra" />
            <path d="M40 140 Q160 180 360 240" className="rose" />
            {/* labels */}
            <text x="320" y="50" className="tiny">PSU/HD</text>
            <text x="320" y="180" className="tiny">DC</text>
            <text x="320" y="232" className="tiny">collapse</text>
            <text x="20" y="22" className="title">FORECAST CONE</text>
          </svg>
        </Variant>
      </div>
    </div>
  );
}

window.VictoryTracker = VictoryTracker;
