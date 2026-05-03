/* global React */
const { useState, useMemo, Fragment } = React;

// ============================================================
// Reusable sketch primitives
// ============================================================
function SkBox({ children, w, h, x, y, dashed, fill, label, style }) {
  const cls = ['sk-box', dashed && 'dashed', fill && `fill-${fill}`].filter(Boolean).join(' ');
  return (
    <div className={cls} style={{ width: w, height: h, position: x !== undefined ? 'absolute' : undefined, left: x, top: y, ...style }}>
      {label && <div className="sk-label">{label}</div>}
      {children}
    </div>
  );
}

function Variant({ tag, title, desc, children, notes }) {
  return (
    <div className="variant">
      <span className="variant-tag">{tag}</span>
      <h3 className="variant-title">{title}</h3>
      <p className="variant-desc">{desc}</p>
      <div className="variant-canvas">{children}</div>
      {notes && <div className="variant-notes">{notes}</div>}
    </div>
  );
}

// Wobbly hand-drawn rectangle (offset path simulates shake)
function WobbleRect({ x, y, w, h, cls = 'ink', rx = 4 }) {
  const w1 = w + (Math.random() * 1 - 0.5);
  return (
    <rect x={x} y={y} width={w} height={h} rx={rx} ry={rx + 1} className={cls} />
  );
}

// Hand-drawn-feel text block inside SVG
function SvgLabel({ x, y, children, cls }) {
  return <text x={x} y={y} className={cls}>{children}</text>;
}

// ============================================================
// 1) FULL TABLE LAYOUTS
// ============================================================
function TableLayouts() {
  return (
    <div className="page active" data-page="table">
      <p className="page-intro">
        <b>Table layouts —</b> how the four player boards, world map, planetary boundaries dashboard,
        and shared treaty/market space arrange around the table. Each layout shifts emphasis: who
        sees what, where conflict converges, and how negotiation literally has to walk across the table.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Compass — symmetric corners"
          desc="Closest to your sketch. Each player owns a corner; map and boundaries sit dead-centre. Egalitarian, easy to learn."
          notes={<>
            <ul>
              <li>+ instantly readable; turn order flows clockwise</li>
              <li>+ all players equidistant from the boundaries dashboard (the moral centre)</li>
              <li>− no spatial asymmetry to mirror ideological asymmetry</li>
              <li>− treaties have nowhere to live spatially</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="20" y="14" width="120" height="60" className="ink" rx="4" />
            <text x="30" y="34" className="title">Industrialist</text>
            <text x="30" y="52" className="label">P1 BOARD</text>
            <rect x="260" y="14" width="120" height="60" className="ink" rx="4" />
            <text x="270" y="34" className="title">Socialist</text>
            <text x="270" y="52" className="label">P2 BOARD</text>
            <rect x="20" y="206" width="120" height="60" className="ink" rx="4" />
            <text x="30" y="226" className="title">Green</text>
            <text x="30" y="244" className="label">P3 BOARD</text>
            <rect x="260" y="206" width="120" height="60" className="ink" rx="4" />
            <text x="270" y="226" className="title">Techno</text>
            <text x="270" y="244" className="label">P4 BOARD</text>
            {/* center: map + boundaries */}
            <rect x="100" y="92" width="200" height="100" className="ink ink-thick" rx="4" />
            <text x="110" y="108" className="label">WORLD MAP</text>
            {/* boundaries radial */}
            <circle cx="200" cy="148" r="28" className="terra" />
            <circle cx="200" cy="148" r="16" className="terra" />
            {[0,1,2,3,4,5,6,7,8].map(i => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              return <line key={i} x1={200} y1={148} x2={200+Math.cos(a)*28} y2={148+Math.sin(a)*28} className="terra" />;
            })}
            <text x="172" y="190" className="tiny">boundaries dial</text>
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Long-edge ledger"
          desc="Players line up along one long edge as a 'parliament'. Map opposite. Treaties happen across the table like a debate floor."
          notes={<>
            <ul>
              <li>+ negotiation feels physical: you face your opponents</li>
              <li>+ leaves a treaty corridor between players & map</li>
              <li>− asymmetric sightlines on the map</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {/* map up top */}
            <rect x="40" y="14" width="320" height="100" className="ink ink-thick" rx="4" />
            <text x="48" y="30" className="label">SHARED MAP + BOUNDARIES DIAL</text>
            <circle cx="200" cy="62" r="22" className="terra" />
            {[0,1,2,3,4,5,6,7,8].map(i => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              return <line key={i} x1={200} y1={62} x2={200+Math.cos(a)*22} y2={62+Math.sin(a)*22} className="terra" />;
            })}
            {/* treaty floor */}
            <rect x="40" y="124" width="320" height="44" className="ink ink-dash" rx="4" />
            <text x="48" y="142" className="label">TREATY FLOOR · MARKET · INFORMAL TALK</text>
            <text x="48" y="160" className="tiny">tokens move here when offered to others</text>
            {/* 4 players in a row */}
            {['Industrialist','Socialist','Green','Techno'].map((n,i) => (
              <g key={n}>
                <rect x={40 + i*80} y="180" width="72" height="84" className="ink" rx="4" />
                <text x={46 + i*80} y="198" className="title">{n.slice(0,4)}</text>
                <text x={46 + i*80} y="214" className="label">P{i+1}</text>
                <line x1={50 + i*80} y1="222" x2={102 + i*80} y2="222" className="ink ink-thin" />
                <line x1={50 + i*80} y1="232" x2="" className="ink ink-thin" />
                <line x1={50 + i*80} y1="232" x2={102 + i*80} y2="232" className="ink ink-thin" />
                <line x1={50 + i*80} y1="242" x2={102 + i*80} y2="242" className="ink ink-thin" />
                <line x1={50 + i*80} y1="252" x2={102 + i*80} y2="252" className="ink ink-thin" />
              </g>
            ))}
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Council-in-the-round"
          desc="Boundaries dial is the literal centre of gravity — large, on its own platform. Map orbits around it. Player boards form a ring."
          notes={<>
            <ul>
              <li>+ planet is dramatically central; can't be ignored</li>
              <li>+ map fragments into 4 regional 'sectors' adjacent to each player</li>
              <li>− needs a lazy-susan or rotating boundaries piece</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <circle cx="200" cy="140" r="50" className="terra ink-thick" />
            {[0,1,2,3,4,5,6,7,8].map(i => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              return <line key={i} x1={200} y1={140} x2={200+Math.cos(a)*50} y2={140+Math.sin(a)*50} className="terra" />;
            })}
            <text x="174" y="208" className="label">BOUNDARIES</text>
            {/* 4 map sectors as wedges */}
            {[0,1,2,3].map(i => {
              const a = (i/4)*Math.PI*2 - Math.PI/2 - Math.PI/4;
              const cx = 200 + Math.cos(a)*95;
              const cy = 140 + Math.sin(a)*95;
              return (
                <g key={i}>
                  <rect x={cx-44} y={cy-22} width="88" height="44" className="ink ink-dash" rx="4" />
                  <text x={cx-30} y={cy-6} className="tiny">sector {i+1}</text>
                  <text x={cx-30} y={cy+10} className="tiny">map slice</text>
                </g>
              );
            })}
            {/* 4 player boards on outer ring */}
            {['Indust','Soc','Green','Tech'].map((n,i) => {
              const a = (i/4)*Math.PI*2 - Math.PI/2;
              const cx = 200 + Math.cos(a)*125;
              const cy = 140 + Math.sin(a)*125;
              return (
                <g key={n}>
                  <rect x={cx-30} y={cy-18} width="60" height="36" className="ink" rx="3" />
                  <text x={cx-24} y={cy+4} className="tiny">{n}</text>
                </g>
              );
            })}
          </svg>
        </Variant>

        <Variant tag="OPTION D" title="Ideology axis"
          desc="Boards arranged on a 2D axis — Growth↔Degrowth × Collective↔Individual. Map below. Players literally sit at their ideology's pole."
          notes={<>
            <ul>
              <li>+ teaches the political theory in the seating</li>
              <li>+ neighbours are natural treaty partners</li>
              <li>− table shape becomes prescriptive; visually busier</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {/* axes */}
            <line x1="200" y1="20" x2="200" y2="180" className="ink ink-dash" />
            <line x1="40" y1="100" x2="360" y2="100" className="ink ink-dash" />
            <text x="180" y="14" className="label">GROWTH</text>
            <text x="174" y="194" className="label">DEGROWTH</text>
            <text x="14" y="104" className="label">INDIV</text>
            <text x="328" y="104" className="label">COLLECT</text>
            {/* boards in quadrants */}
            <rect x="60" y="34" width="100" height="50" className="ink" rx="4" />
            <text x="68" y="54" className="title">Industrial</text>
            <text x="68" y="70" className="tiny">growth · individual</text>
            <rect x="240" y="34" width="100" height="50" className="ink" rx="4" />
            <text x="248" y="54" className="title">Techno</text>
            <text x="248" y="70" className="tiny">growth · collective</text>
            <rect x="60" y="116" width="100" height="50" className="ink" rx="4" />
            <text x="68" y="136" className="title">Green</text>
            <text x="68" y="152" className="tiny">degrowth · indiv*</text>
            <rect x="240" y="116" width="100" height="50" className="ink" rx="4" />
            <text x="248" y="136" className="title">Socialist</text>
            <text x="248" y="152" className="tiny">degrowth · collective</text>
            {/* map below */}
            <rect x="40" y="200" width="320" height="64" className="ink ink-thick" rx="4" />
            <text x="48" y="218" className="label">SHARED MAP + DIAL</text>
            <circle cx="200" cy="240" r="14" className="terra" />
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Concentric pressure"
          desc="Boundaries dial in the middle, then map ring, then market/treaty ring, then players on the outside. Pressure radiates inward."
          notes={<>
            <ul>
              <li>+ makes &quot;externality&quot; literal — your actions push outward effects inward</li>
              <li>+ market sits between player & map: nothing reaches the planet without passing through trade</li>
              <li>− needs a large table</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <circle cx="200" cy="140" r="115" className="ink ink-dash" />
            <circle cx="200" cy="140" r="80" className="ink" />
            <circle cx="200" cy="140" r="42" className="terra ink-thick" />
            <text x="186" y="144" className="label">DIAL</text>
            <text x="172" y="100" className="tiny">map ring</text>
            <text x="160" y="62" className="tiny">treaty / market ring</text>
            {/* players around */}
            {['IND','SOC','GRN','TEC'].map((n,i) => {
              const a = (i/4)*Math.PI*2 - Math.PI/2;
              const cx = 200 + Math.cos(a)*138;
              const cy = 140 + Math.sin(a)*138;
              return (
                <g key={n}>
                  <rect x={cx-22} y={cy-14} width="44" height="28" className="ink" rx="3" />
                  <text x={cx-14} y={cy+4} className="tiny">{n}</text>
                </g>
              );
            })}
          </svg>
        </Variant>

        <Variant tag="OPTION F" title="Asymmetric throne"
          desc="Industrialist gets the head of the table (current incumbent). Others ranged opposite. Boundaries dial sits between them like an oracle."
          notes={<>
            <ul>
              <li>+ encodes &quot;status quo vs. challengers&quot; — reflects the political moment</li>
              <li>+ great for narrative campaigns</li>
              <li>− first-game players may read it as &quot;industrialist is the hero&quot;</li>
            </ul>
          </>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {/* throne */}
            <rect x="150" y="14" width="100" height="52" className="ink ink-thick" rx="4" />
            <text x="158" y="34" className="title">Industrial</text>
            <text x="158" y="52" className="label">INCUMBENT · HEAD</text>
            {/* dial */}
            <circle cx="200" cy="120" r="26" className="terra" />
            {[0,1,2,3,4,5,6,7,8].map(i => {
              const a = (i/9)*Math.PI*2 - Math.PI/2;
              return <line key={i} x1={200} y1={120} x2={200+Math.cos(a)*26} y2={120+Math.sin(a)*26} className="terra" />;
            })}
            <text x="172" y="160" className="label">BOUNDARIES</text>
            {/* map */}
            <rect x="60" y="178" width="280" height="40" className="ink" rx="3" />
            <text x="70" y="200" className="tiny">SHARED MAP (stretches across)</text>
            {/* 3 challengers */}
            {['Socialist','Green','Techno'].map((n,i) => (
              <g key={n}>
                <rect x={50 + i*108} y="232" width="96" height="38" className="ink" rx="3" />
                <text x={58 + i*108} y="252" className="title">{n}</text>
              </g>
            ))}
          </svg>
        </Variant>
      </div>
    </div>
  );
}

window.TableLayouts = TableLayouts;
window.SkBox = SkBox;
window.Variant = Variant;
