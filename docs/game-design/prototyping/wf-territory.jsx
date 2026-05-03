/* global React */

// ============================================================
// 4) TERRITORY / MAP SYSTEMS
// ============================================================
function TerritorySystems() {
  return (
    <div className="page" data-page="territory">
      <p className="page-intro">
        <b>Territory mechanics —</b> the brief left this open. Below are five distinct systems, each
        with different implications for conflict, cooperation, and how ideologies project influence.
        I'd lean toward <i>C (Influence layers)</i> or <i>E (Biome stewardship)</i> as best fits for the win conditions.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Hex control (classic)"
          desc="World divided into ~40 hexes. Place a meeple to claim. Adjacency triggers conflict resolution."
          notes={<ul>
            <li>+ familiar, deep tactical layer</li>
            <li>− implies military framing — wrong tone for an ideology game</li>
            <li>− Green pathway hard to model (control is opposite of conservation)</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {Array.from({length:7}, (_,r) => Array.from({length:9}, (_,c) => {
              const x = 30 + c*40 + (r%2)*20;
              const y = 30 + r*32;
              if (x > 370 || y > 250) return null;
              const owner = (r*9+c)%5;
              const cls = owner===0 ? 'swatch-rose' : owner===1 ? 'swatch-sky' : owner===2 ? 'swatch-moss' : owner===3 ? 'swatch-amber' : '';
              return (
                <g key={`${r}-${c}`}>
                  <polygon points={`${x},${y-14} ${x+12},${y-7} ${x+12},${y+7} ${x},${y+14} ${x-12},${y+7} ${x-12},${y-7}`}
                    className={cls} />
                  <polygon points={`${x},${y-14} ${x+12},${y-7} ${x+12},${y+7} ${x},${y+14} ${x-12},${y+7} ${x-12},${y-7}`}
                    className="ink ink-thin" />
                </g>
              );
            }))}
            <text x="20" y="270" className="label">HEX CLAIMS · MEEPLE PER TILE</text>
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Region & province"
          desc="Map split into ~12 named regions (e.g. 'Boreal North', 'Pacific Rim'). Each region has 3-4 slot tracks for infrastructure, labour, ecology."
          notes={<ul>
            <li>+ regions can have unique resources and boundary couplings</li>
            <li>+ multiple players can co-occupy a region with different infrastructure</li>
            <li>− less granular than hexes</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {[
              {x:30,y:30,w:120,h:80,n:'Boreal'},
              {x:160,y:30,w:100,h:60,n:'Eurasia'},
              {x:270,y:30,w:100,h:90,n:'Steppe'},
              {x:30,y:120,w:80,h:90,n:'Andes'},
              {x:120,y:100,w:90,h:70,n:'Tropics'},
              {x:220,y:100,w:60,h:80,n:'Sahel'},
              {x:290,y:130,w:80,h:80,n:'Pac.Rim'},
              {x:30,y:220,w:140,h:42,n:'Antarctic'},
              {x:180,y:190,w:90,h:60,n:'Oceania'},
            ].map((r,i) => (
              <g key={i}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} className="ink" rx="6" />
                <text x={r.x+6} y={r.y+14} className="tiny">{r.n}</text>
                {[0,1,2].map(j => (
                  <circle key={j} cx={r.x+12+j*14} cy={r.y+r.h-10} r="4" className="ink ink-thin" />
                ))}
              </g>
            ))}
            <text x="20" y="276" className="label">REGIONS · INFRASTRUCTURE SLOTS</text>
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Influence layers (recommended)"
          desc="Map is shared and undivided. Each player has translucent influence tokens; multiple ideologies layer on the same territory. 'Control' is comparative, not exclusive."
          notes={<ul>
            <li>+ models real-world ideological overlap (a region can be both industrial AND green)</li>
            <li>+ supports all four pathways without contradiction</li>
            <li>+ treaties become &quot;you reduce your stack here, I reduce mine there&quot;</li>
            <li>− needs comparative scoring at end-game</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {/* world silhouette */}
            <path d="M30 80 Q60 40 110 60 T200 70 T300 50 T370 90 L370 180 Q330 220 270 200 T160 220 T70 200 Z" className="ink" />
            {/* influence stacks */}
            {[{cx:100,cy:120},{cx:170,cy:100},{cx:240,cy:140},{cx:300,cy:110},{cx:140,cy:170},{cx:260,cy:180}].map((p,i) => (
              <g key={i}>
                <circle cx={p.cx} cy={p.cy} r="20" className="swatch-rose" />
                <circle cx={p.cx+4} cy={p.cy-3} r="20" className="swatch-sky" />
                <circle cx={p.cx-3} cy={p.cy+3} r="20" className="swatch-moss" />
                <circle cx={p.cx+1} cy={p.cy+5} r="20" className="swatch-amber" />
              </g>
            ))}
            <g transform="translate(20 240)">
              <text x="0" y="0" className="label">LEGEND</text>
              <circle cx="60" cy="-4" r="6" className="swatch-rose" /><text x="70" y="0" className="tiny">indust</text>
              <circle cx="120" cy="-4" r="6" className="swatch-sky" /><text x="130" y="0" className="tiny">soc</text>
              <circle cx="170" cy="-4" r="6" className="swatch-moss" /><text x="180" y="0" className="tiny">green</text>
              <circle cx="230" cy="-4" r="6" className="swatch-amber" /><text x="240" y="0" className="tiny">techno</text>
            </g>
          </svg>
        </Variant>

        <Variant tag="OPTION D" title="Network of cities"
          desc="No territory at all — instead, a graph of ~20 cities/sites connected by trade routes. Players invest in nodes & edges."
          notes={<ul>
            <li>+ fits the &quot;active trade routes to all players&quot; capitalist condition perfectly</li>
            <li>+ supply chains become tangible</li>
            <li>− loses the visual 'planet' weight your sketch suggests</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {(() => {
              const nodes = Array.from({length:14}, (_,i) => {
                const a = (i/14)*Math.PI*2;
                return { i, x: 200 + Math.cos(a)*(80+(i%3)*30), y: 140 + Math.sin(a)*(60+(i%3)*20) };
              });
              return (
                <>
                  {nodes.map((n,i) => nodes.slice(i+1).filter((_,j) => (i+j)%3===0).map((m,j) => (
                    <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} className="ink ink-thin ink-dash" />
                  )))}
                  {nodes.map(n => (
                    <g key={n.i}>
                      <circle cx={n.x} cy={n.y} r="8" className="ink fill-paper" />
                      <text x={n.x-3} y={n.y+3} className="tiny">{n.i+1}</text>
                    </g>
                  ))}
                </>
              );
            })()}
            <text x="20" y="270" className="label">CITY NETWORK · TRADE EDGES</text>
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Biome stewardship (recommended)"
          desc="Map is 9 biomes — each TIED to one of the 9 planetary boundaries. Stress a biome and you push its boundary. Heal a biome and you ease the dial."
          notes={<ul>
            <li>+ tightest coupling between map actions & boundaries dashboard</li>
            <li>+ Green pathway becomes spatial (restore the biomes you live in)</li>
            <li>+ supports a stewardship/guardian role per biome</li>
            <li>− requires biome-to-boundary mapping that's narratively defensible</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {[
              {x:30,y:24,w:100,h:62,n:'Boreal',b:'Climate'},
              {x:140,y:24,w:120,h:62,n:'Reefs',b:'Ocean acid'},
              {x:270,y:24,w:100,h:62,n:'Tundra',b:'Aerosols'},
              {x:30,y:96,w:100,h:62,n:'Tropics',b:'Biosphere'},
              {x:140,y:96,w:120,h:62,n:'Rivers',b:'Freshwater'},
              {x:270,y:96,w:100,h:62,n:'Cropland',b:'Biogeochem'},
              {x:30,y:168,w:100,h:62,n:'Drylands',b:'Land-use'},
              {x:140,y:168,w:120,h:62,n:'Cities',b:'Novel ent.'},
              {x:270,y:168,w:100,h:62,n:'Strato',b:'Ozone'},
            ].map((r,i) => (
              <g key={i}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} className="ink" rx="6" />
                <rect x={r.x} y={r.y} width={r.w} height={r.h}
                  className={i%3===0 ? 'swatch-moss' : i%3===1 ? 'swatch-sky' : 'swatch-amber'} />
                <rect x={r.x} y={r.y} width={r.w} height={r.h} className="ink" rx="6" />
                <text x={r.x+6} y={r.y+16} className="title" style={{fontSize:13}}>{r.n}</text>
                <text x={r.x+6} y={r.y+30} className="label">→ {r.b}</text>
              </g>
            ))}
            <text x="20" y="252" className="label">9 BIOMES ↔ 9 BOUNDARIES · 1:1 COUPLING</text>
          </svg>
        </Variant>

        <Variant tag="OPTION F" title="Latitude bands"
          desc="World as 5 latitude strips (poles, temperate × 2, tropics, equator). Strips heat up sequentially as climate dial rises. Forced migration emerges naturally."
          notes={<ul>
            <li>+ models climate gradient elegantly</li>
            <li>+ migration as a Socialist/Green action</li>
            <li>− coarse; less spatial agency</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {['North polar','N temperate','Tropics','S temperate','South polar'].map((n,i) => (
              <g key={n}>
                <rect x="20" y={20+i*48} width="360" height="42"
                  className={i===2 ? 'swatch-rose' : i===1||i===3 ? 'swatch-amber' : 'swatch-moss'} />
                <rect x="20" y={20+i*48} width="360" height="42" className="ink" rx="3" />
                <text x="30" y={44+i*48} className="title" style={{fontSize:14}}>{n}</text>
                {/* migration arrows */}
                {i<4 && <path d={`M${360-20*(i+1)} ${62+i*48} q 0 12 -10 14`} className="terra" />}
              </g>
            ))}
            <text x="20" y="276" className="label">LATITUDE BANDS · CLIMATE-GRADIENT MAP</text>
          </svg>
        </Variant>
      </div>
    </div>
  );
}

window.TerritorySystems = TerritorySystems;
