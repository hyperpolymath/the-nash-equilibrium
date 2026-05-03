/* global React */

// ============================================================
// 2) PLAYER BOARDS / IDEOLOGY TRACKS
// ============================================================
function PlayerBoards() {
  return (
    <div className="page" data-page="boards">
      <p className="page-intro">
        <b>Player boards —</b> each ideology needs an asymmetric board that encodes its win condition,
        starting resources, and unique actions. Below are five layouts; the same layout could be
        re-skinned per ideology, or each ideology could get its own.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Resource dials + action slots"
          desc="Classic euro-game layout. Five dials (Capital · Labour · Nature · Knowledge · Stability), three action slots, ideology-specific tech tree on the right."
          notes={<ul>
            <li>+ legible at a glance, easy to balance</li>
            <li>+ dials map directly to your loss conditions (Labour=0, Nature=0)</li>
            <li>− visually similar across ideologies</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="8" y="8" width="384" height="264" className="ink ink-thick" rx="6" />
            <text x="20" y="30" className="title">Industrialist</text>
            <text x="20" y="46" className="label">PATHWAY · CAPITALIST</text>
            {/* 5 dials */}
            {['Capital','Labour','Nature','Knowl.','Stability'].map((n,i) => (
              <g key={n}>
                <circle cx={50+i*72} cy={92} r="20" className="ink" />
                <text x={36+i*72} y={96} className="tiny">{n}</text>
                <text x={45+i*72} y={128} className="label">0–10</text>
              </g>
            ))}
            {/* action slots */}
            <text x="20" y="160" className="label">ACTIONS THIS TURN</text>
            {[0,1,2].map(i => (
              <rect key={i} x={20+i*120} y={170} width="110" height="44" className="ink ink-dash" rx="3" />
            ))}
            {/* tech tree */}
            <text x="20" y="234" className="label">TECH TRACK</text>
            <line x1="20" y1="248" x2="380" y2="248" className="ink" />
            {[0,1,2,3,4,5].map(i => (
              <circle key={i} cx={40+i*64} cy="248" r="6" className="ink fill-paper" />
            ))}
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Ideology spine"
          desc="Vertical track running down the middle: each step is an ideological commitment that unlocks new actions but locks others out. Resources flank it."
          notes={<ul>
            <li>+ encodes path-dependency — once you've built coal plants, going green is expensive</li>
            <li>+ visually distinctive per ideology</li>
            <li>− slightly harder to teach</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="8" y="8" width="384" height="264" className="ink ink-thick" rx="6" />
            <text x="20" y="30" className="title">Socialist</text>
            <text x="20" y="46" className="label">PATHWAY · STABILITY+POVERTY</text>
            {/* spine */}
            <line x1="200" y1="60" x2="200" y2="260" className="terra ink-thick" />
            {[0,1,2,3,4].map(i => (
              <g key={i}>
                <circle cx="200" cy={80+i*40} r="10" className="terra fill-paper" />
                <text x="212" y={84+i*40} className="tiny">commitment {i+1}</text>
              </g>
            ))}
            {/* left resources */}
            <text x="20" y="76" className="label">RESOURCES</text>
            {['Capital','Labour','Nature','Knowl.','Stability'].map((n,i) => (
              <g key={n}>
                <rect x="20" y={84+i*32} width="120" height="24" className="ink" rx="3" />
                <text x="28" y={100+i*32} className="tiny">{n}</text>
                <line x1="80" y1={96+i*32} x2="130" y2={96+i*32} className="ink ink-thin" />
              </g>
            ))}
            {/* right unique actions */}
            <text x="280" y="76" className="label">UNIQUE ACTIONS</text>
            {['Nationalize','Strike','UBI','Treaty'].map((n,i) => (
              <g key={n}>
                <rect x="280" y={84+i*36} width="100" height="28" className="ink ink-dash" rx="3" />
                <text x="288" y={102+i*36} className="tiny">{n}</text>
              </g>
            ))}
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Hand of cards"
          desc="No printed actions. Each ideology has a deck of ~20 action cards; you draw 5, play 2/turn. Resources are tracked on a small slim panel."
          notes={<ul>
            <li>+ wildly different feel per ideology — Industrialist deck = leverage, Green deck = restoration</li>
            <li>+ easy to expand with expansions</li>
            <li>− adds card-shuffle overhead; less spatial</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="8" y="8" width="384" height="264" className="ink ink-thick" rx="6" />
            <text x="20" y="30" className="title">Green</text>
            <text x="20" y="46" className="label">PATHWAY · PLANET-SAFE</text>
            {/* slim resource bar */}
            <rect x="20" y="60" width="360" height="34" className="ink" rx="3" />
            {['Cap','Lab','Nat','Kno','Sta'].map((n,i) => (
              <g key={n}>
                <text x={36+i*72} y="80" className="tiny">{n}</text>
                <line x1={28+i*72} y1="86" x2={68+i*72} y2="86" className="moss" />
              </g>
            ))}
            {/* hand of 5 cards */}
            <text x="20" y="116" className="label">HAND (PLAY 2 OF 5)</text>
            {[0,1,2,3,4].map(i => (
              <g key={i}>
                <rect x={20+i*74} y="124" width="64" height="120" className="ink" rx="4" transform={`rotate(${(i-2)*3} ${52+i*74} 184)`} />
                <text x={28+i*74} y="146" className="tiny" transform={`rotate(${(i-2)*3} ${52+i*74} 184)`}>card {i+1}</text>
              </g>
            ))}
            <text x="20" y="262" className="tiny">deck below table · discard right</text>
          </svg>
        </Variant>

        <Variant tag="OPTION D" title="Twin ledgers"
          desc="Left side: what you've built (capacity). Right side: what you've spent / emitted (footprint). The gap between them IS your impact."
          notes={<ul>
            <li>+ makes externalities visible on your own board</li>
            <li>+ supports a literal &quot;balance the books&quot; end-of-turn check</li>
            <li>− abstract; needs strong onboarding</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="8" y="8" width="384" height="264" className="ink ink-thick" rx="6" />
            <text x="20" y="30" className="title">Techno-Utopian</text>
            <text x="20" y="46" className="label">PATHWAY · BREAKTHROUGH+DYSON</text>
            {/* left: capacity */}
            <rect x="20" y="60" width="170" height="200" className="ink ink-dash" rx="4" />
            <text x="30" y="80" className="label">CAPACITY (BUILT)</text>
            {[0,1,2,3,4,5].map(i => (
              <line key={i} x1="34" y1={100+i*22} x2="180" y2={100+i*22} className="ink ink-thin" />
            ))}
            {/* right: footprint */}
            <rect x="210" y="60" width="170" height="200" className="ink ink-dash" rx="4" />
            <text x="220" y="80" className="label">FOOTPRINT (SPENT)</text>
            {[0,1,2,3,4,5].map(i => (
              <line key={i} x1="224" y1={100+i*22} x2="370" y2={100+i*22} className="rose ink-thin" />
            ))}
            {/* divider with arrows */}
            <line x1="200" y1="70" x2="200" y2="250" className="ink ink-dash" />
            <text x="186" y="265" className="tiny">Δ = impact</text>
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Console + biome"
          desc="Top half = ideological 'console' (HUD, action menu). Bottom half = a small private biome diorama showing your domestic ecology — visually deteriorates as you play."
          notes={<ul>
            <li>+ emotional + memorable; great for storytelling photos</li>
            <li>+ private board state has tactile feedback (forests get sparser)</li>
            <li>− most production-heavy of all options</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="8" y="8" width="384" height="264" className="ink ink-thick" rx="6" />
            {/* top: console */}
            <rect x="20" y="20" width="360" height="100" className="ink" rx="4" />
            <text x="30" y="40" className="title">Industrialist</text>
            <text x="30" y="58" className="label">CONSOLE</text>
            {[0,1,2,3].map(i => (
              <rect key={i} x={30+i*86} y="68" width="78" height="42" className="ink ink-dash" rx="3" />
            ))}
            {/* bottom: biome */}
            <text x="30" y="138" className="label">DOMESTIC BIOME</text>
            <rect x="20" y="146" width="360" height="116" className="ink ink-dash" rx="4" />
            {/* trees */}
            {[0,1,2,3,4].map(i => (
              <g key={i}>
                <line x1={50+i*64} y1="220" x2={50+i*64} y2="240" className="moss" />
                <circle cx={50+i*64} cy="214" r="10" className="moss" />
              </g>
            ))}
            {/* factory */}
            <rect x="290" y="206" width="60" height="36" className="ink" />
            <line x1="298" y1="206" x2="298" y2="186" className="ink" />
            <line x1="306" y1="206" x2="306" y2="180" className="ink" />
            <text x="50" y="258" className="tiny">tokens / minis swap as biome shifts</text>
          </svg>
        </Variant>
      </div>
    </div>
  );
}

window.PlayerBoards = PlayerBoards;
