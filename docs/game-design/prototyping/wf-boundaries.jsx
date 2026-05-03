/* global React */

// ============================================================
// 3) PLANETARY BOUNDARIES DASHBOARD
// ============================================================
function BoundariesDashboard() {
  return (
    <div className="page" data-page="boundaries">
      <p className="page-intro">
        <b>Planetary boundaries dashboard —</b> the conscience of the table. It tracks 9 systems
        (climate, biosphere, biogeochem flows, ocean acid, freshwater, land-use, novel entities,
        ozone, aerosols) and slides Green→Amber→Red→Black. At 4+ Black, everyone loses.
        Five ways to render that pressure visible.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Radial wedges (sketch-faithful)"
          desc="The Stockholm-style wedge dial from your napkin. Each wedge fills outward as stress accumulates."
          notes={<ul>
            <li>+ instantly recognisable to anyone who knows the science</li>
            <li>+ central, communal; everyone sees the same shape</li>
            <li>− hard to read precise numbers from across the table</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <g transform="translate(200 140)">
              {/* outer/black ring */}
              <circle r="100" className="ink ink-dash" />
              <circle r="78" className="rose" />
              <circle r="58" className="terra" />
              <circle r="38" className="moss" />
              <circle r="20" className="ink" />
              {/* 9 spokes */}
              {Array.from({length:9}, (_,i) => {
                const a = (i/9)*Math.PI*2 - Math.PI/2;
                return <line key={i} x1={0} y1={0} x2={Math.cos(a)*100} y2={Math.sin(a)*100} className="ink" />;
              })}
              {/* sample stress fills (3 wedges filled high) */}
              {[0,2,5].map(i => {
                const a1 = (i/9)*Math.PI*2 - Math.PI/2;
                const a2 = ((i+1)/9)*Math.PI*2 - Math.PI/2;
                const r = i===0 ? 92 : i===2 ? 64 : 80;
                const p = `M0,0 L${Math.cos(a1)*r},${Math.sin(a1)*r} A${r},${r} 0 0 1 ${Math.cos(a2)*r},${Math.sin(a2)*r} Z`;
                return <path key={i} d={p} className="swatch-rose" />;
              })}
            </g>
            <text x="170" y="262" className="label">9 SYSTEMS · 4 BANDS</text>
            <text x="20" y="22" className="chip" >GREEN · AMBER · RED · BLACK</text>
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Linear gauges"
          desc="Nine horizontal bars, sliders that creep right. Stack them like a mixing console. Boring but precise."
          notes={<ul>
            <li>+ trivial to read precise values</li>
            <li>+ easy to manufacture (sliders + decals)</li>
            <li>− loses the radial &quot;pressure&quot; metaphor</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {['Climate','Biosphere','Biogeochem','Ocean acid','Freshwater','Land-use','Novel ent.','Ozone','Aerosols'].map((n,i) => (
              <g key={n}>
                <text x="14" y={28+i*26} className="tiny">{n}</text>
                <rect x="100" y={18+i*26} width="270" height="14" className="ink" rx="2" />
                {/* fill */}
                <rect x="100" y={18+i*26} width={(i*30)%270 + 30} height="14" className={
                  ((i*30)%270 + 30) > 200 ? 'swatch-rose' : ((i*30)%270 + 30) > 120 ? 'swatch-amber' : 'swatch-moss'
                } />
                <line x1="220" y1={16+i*26} x2="220" y2={36+i*26} className="terra ink-dash" />
                <line x1="280" y1={16+i*26} x2="280" y2={36+i*26} className="rose ink-dash" />
              </g>
            ))}
            <text x="210" y="266" className="label">SAFE | DANGER | BLACK THRESHOLDS MARKED</text>
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Stacking towers"
          desc="9 physical towers; cubes stack as stress rises. When a tower topples (or hits a marker), that boundary cascades."
          notes={<ul>
            <li>+ highly tactile + photogenic</li>
            <li>+ &quot;cascade&quot; can literally knock neighbouring towers</li>
            <li>− component-heavy, fragile</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <line x1="20" y1="240" x2="380" y2="240" className="ink ink-thick" />
            {Array.from({length:9}, (_,i) => {
              const h = 30 + (i*7)%90;
              const x = 36 + i*38;
              return (
                <g key={i}>
                  {Array.from({length: Math.ceil(h/20)}, (_,j) => (
                    <rect key={j} x={x} y={240-(j+1)*20} width="22" height="18"
                      className={(j*20+18) > 60 ? 'swatch-rose' : (j*20+18) > 40 ? 'swatch-amber' : 'swatch-moss'} />
                  ))}
                  {Array.from({length: Math.ceil(h/20)}, (_,j) => (
                    <rect key={j} x={x} y={240-(j+1)*20} width="22" height="18" className="ink" />
                  ))}
                  <text x={x-2} y="258" className="tiny">{i+1}</text>
                </g>
              );
            })}
            <text x="120" y="22" className="title">Stress towers</text>
            <text x="20" y="38" className="tiny">stack a cube each time a player triggers stress on this system</text>
          </svg>
        </Variant>

        <Invariant />

        <Variant tag="OPTION D" title="Web of cascades"
          desc="9 nodes connected by visible threads. Crossing a threshold pulls strain along the threads — biosphere collapse drags freshwater, ocean acid, etc."
          notes={<ul>
            <li>+ teaches the actual coupled-systems science</li>
            <li>+ dramatic emergent moments when cascades fire</li>
            <li>− needs careful balancing of edge weights</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {Array.from({length:9}, (_,i) => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              const cx = 200 + Math.cos(a)*100;
              const cy = 140 + Math.sin(a)*100;
              return { i, cx, cy };
            }).map(({i,cx,cy}, _, all) => (
              <g key={i}>
                {/* edges to ~3 neighbours */}
                {[1,2,4].map(d => {
                  const j = (i+d)%9;
                  return <line key={d} x1={cx} y1={cy} x2={all[j].cx} y2={all[j].cy} className="ink ink-thin ink-dash" />;
                })}
              </g>
            ))}
            {Array.from({length:9}, (_,i) => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              const cx = 200 + Math.cos(a)*100;
              const cy = 140 + Math.sin(a)*100;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="14" className={i===0||i===4 ? 'swatch-rose' : i===2 ? 'swatch-amber' : 'swatch-moss'} />
                  <circle cx={cx} cy={cy} r="14" className="ink" />
                  <text x={cx-4} y={cy+4} className="tiny">{i+1}</text>
                </g>
              );
            })}
            <text x="170" y="264" className="label">CASCADE NETWORK</text>
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Layered film"
          desc="Stack of translucent acetate sheets — one per boundary. As stress rises a sheet darkens. Look down through the stack to see overall planet health."
          notes={<ul>
            <li>+ stunning emergent visual: planet 'fogs over'</li>
            <li>+ lets each player privately track one boundary by moving their sheet</li>
            <li>− expensive to produce; print-and-play unfriendly</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <g key={i}>
                <rect x={60+i*8} y={40+i*16} width="240" height="160"
                  className={i%3===0 ? 'swatch-rose' : i%3===1 ? 'swatch-amber' : 'swatch-moss'} />
                <rect x={60+i*8} y={40+i*16} width="240" height="160" className="ink ink-thin" rx="2" />
                <text x={64+i*8} y={54+i*16} className="tiny">layer {i+1}</text>
              </g>
            ))}
            <text x="20" y="22" className="title">Translucent stack</text>
          </svg>
        </Variant>
      </div>
    </div>
  );
}
function Invariant() { return null; } // placeholder used to satisfy tooling; ignored

window.BoundariesDashboard = BoundariesDashboard;
