/* global React */

// ============================================================
// 5) TREATY / NEGOTIATION
// ============================================================
function Treaties() {
  return (
    <div className="page" data-page="treaties">
      <p className="page-intro">
        <b>Treaties —</b> informal (handshake, non-binding, reversible) and formal (locked, with
        enforcement). The interface needs to make both feel different in weight and ceremony.
      </p>
      <div className="variants">
        <Variant tag="OPTION A" title="Two-tray model"
          desc="A shallow 'handshake' tray (open) and a deep 'covenant' tray (locked) at table centre. Tokens placed into either become the treaty record."
          notes={<ul>
            <li>+ tactile, makes ceremony visible</li>
            <li>+ informal can be revoked any turn; formal needs a unanimous vote</li>
            <li>− component overhead</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <rect x="30" y="40" width="160" height="200" className="ink ink-dash" rx="6" />
            <text x="40" y="60" className="title">Handshake</text>
            <text x="40" y="76" className="label">INFORMAL · REVOCABLE</text>
            {[0,1,2].map(i => <rect key={i} x={42} y={94+i*46} width="136" height="36" className="ink ink-thin" rx="3" />)}
            <rect x="210" y="40" width="160" height="200" className="ink ink-thick" rx="6" />
            <text x="220" y="60" className="title">Covenant</text>
            <text x="220" y="76" className="label">FORMAL · LOCKED</text>
            {[0,1].map(i => <rect key={i} x={222} y={94+i*68} width="136" height="58" className="ink" rx="3" />)}
            <line x1="222" y1="170" x2="358" y2="170" className="rose ink-dash" />
          </svg>
        </Variant>

        <Variant tag="OPTION B" title="Treaty cards"
          desc="Pre-printed treaty templates (Emissions Cap · Tech Share · Migration Pact · Boycott · Joint Venture). Players fill in blanks, sign, place face-up between them."
          notes={<ul>
            <li>+ teaches players the diplomacy vocabulary</li>
            <li>+ visual record of who agreed what</li>
            <li>− could feel scripted; less freeform</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {['Emissions Cap','Tech Share','Migration','Boycott','Joint Venture'].map((n,i) => (
              <g key={n} transform={`translate(${30+i*72} ${60+(i%2)*30}) rotate(${(i-2)*4})`}>
                <rect x="0" y="0" width="68" height="120" className="ink" rx="4" />
                <text x="6" y="16" className="title" style={{fontSize:13}}>{n}</text>
                <line x1="6" y1="32" x2="62" y2="32" className="ink ink-thin" />
                <text x="6" y="46" className="tiny">parties: __ , __</text>
                <text x="6" y="62" className="tiny">terms: ____</text>
                <text x="6" y="78" className="tiny">duration: __</text>
                <text x="6" y="94" className="tiny">penalty: __</text>
                <text x="6" y="112" className="tiny">sign: x____</text>
              </g>
            ))}
            <text x="20" y="244" className="label">PRE-PRINTED TREATY DECK · FILL & SIGN</text>
          </svg>
        </Variant>

        <Variant tag="OPTION C" title="Token offer & accept"
          desc="No ceremony — just a small offer mat between each pair of players. Drop tokens (resources, promises, vetoes) on the mat. Mutual accept = binding for 1 round."
          notes={<ul>
            <li>+ fast, low overhead</li>
            <li>+ encourages constant micro-deals</li>
            <li>− no separate &quot;formal&quot; ceremony — informal only</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <circle cx="200" cy="140" r="50" className="ink ink-dash" />
            <text x="184" y="144" className="label">TABLE</text>
            {/* 4 mats radiating out */}
            {[0,1,2,3].map(i => {
              const a = (i/4)*Math.PI*2 - Math.PI/2;
              const cx = 200 + Math.cos(a)*100;
              const cy = 140 + Math.sin(a)*100;
              return (
                <g key={i}>
                  <rect x={cx-32} y={cy-22} width="64" height="44" className="ink" rx="4" />
                  <text x={cx-26} y={cy-8} className="tiny">offer mat</text>
                  <circle cx={cx-14} cy={cy+8} r="4" className="swatch-amber" />
                  <circle cx={cx} cy={cy+8} r="4" className="swatch-moss" />
                  <circle cx={cx+14} cy={cy+8} r="4" className="swatch-rose" />
                </g>
              );
            })}
            <text x="100" y="270" className="label">PAIRWISE OFFER MATS · DROP &amp; ACCEPT</text>
          </svg>
        </Variant>

        <Variant tag="OPTION D" title="Parliament round"
          desc="Once per era, a formal round: all players gather, propose binding agreements, vote. Outside parliament: only handshake deals."
          notes={<ul>
            <li>+ rhythmic — the table inhales formal, exhales informal</li>
            <li>+ creates dramatic 'COP-summit' moments</li>
            <li>− slows pace; can feel scripted if eras are short</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <line x1="40" y1="50" x2="360" y2="50" className="ink ink-thick" />
            {[0,1,2,3,4,5].map(i => (
              <g key={i}>
                <line x1={60+i*52} y1="40" x2={60+i*52} y2="60" className="ink" />
                <text x={56+i*52} y="36" className="tiny">era {i+1}</text>
                {i%2===1 && <circle cx={60+i*52} cy="50" r="8" className="terra ink-thick fill-paper" />}
              </g>
            ))}
            <text x="20" y="80" className="label">TIMELINE · PARLIAMENT EVERY OTHER ERA</text>
            {/* parliament UI */}
            <rect x="60" y="110" width="280" height="140" className="ink ink-dash" rx="6" />
            <text x="72" y="130" className="title">PARLIAMENT IN SESSION</text>
            <text x="72" y="148" className="label">PROPOSAL · DEBATE · VOTE</text>
            {[0,1,2,3].map(i => (
              <g key={i}>
                <circle cx={88+i*68} cy="190" r="14" className="ink" />
                <text x={80+i*68} y="194" className="tiny">P{i+1}</text>
                <rect x={74+i*68} y="210" width="32" height="20" className="ink ink-thin" rx="2" />
                <text x={84+i*68} y="223" className="tiny">vote</text>
              </g>
            ))}
          </svg>
        </Variant>

        <Variant tag="OPTION E" title="Ledger of agreements"
          desc="A communal scroll/ledger lives next to the boundaries dial. Every agreement (informal or formal) gets written in. Breaking one is public."
          notes={<ul>
            <li>+ makes betrayal narratively heavy</li>
            <li>+ campaigns can carry the ledger across sessions</li>
            <li>− write/erase friction; needs dry-erase or tokens</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            {/* scroll */}
            <rect x="40" y="30" width="320" height="220" className="ink ink-thick" rx="10" />
            <line x1="40" y1="58" x2="360" y2="58" className="ink" />
            <text x="50" y="50" className="title">THE LEDGER</text>
            {[0,1,2,3,4,5].map(i => (
              <g key={i}>
                <line x1="60" y1={84+i*26} x2="340" y2={84+i*26} className="ink ink-thin" />
                <text x="60" y={80+i*26} className="tiny">era {i+1}</text>
                {i<4 && <text x="100" y={80+i*26} className="tiny" style={{fontFamily:'var(--hand2)'}}>P1↔P3 · tech share · 2 eras · ◯ active</text>}
                {i===2 && <text x="280" y={80+i*26} className="tiny" style={{fill:'oklch(0.55 0.18 25)'}}>BROKEN</text>}
              </g>
            ))}
          </svg>
        </Variant>

        <Variant tag="OPTION F" title="Hidden + open channels"
          desc="Each player has private envelopes for whispered side-deals AND public treaty slots. Bluffing is structurally supported."
          notes={<ul>
            <li>+ Nash-equilibrium-ness becomes lived: I might say one thing, sign another</li>
            <li>+ tense, social</li>
            <li>− can feel mean-spirited at family weight; gate behind a difficulty mode</li>
          </ul>}>
          <svg viewBox="0 0 400 280" className="sk-svg">
            <text x="20" y="30" className="label">PUBLIC CHANNEL</text>
            <rect x="20" y="40" width="360" height="80" className="ink" rx="4" />
            {[0,1,2,3].map(i => <rect key={i} x={32+i*88} y={54} width="80" height="50" className="ink ink-dash" rx="3" />)}
            <text x="20" y="148" className="label">HIDDEN CHANNEL</text>
            <rect x="20" y="158" width="360" height="100" className="ink ink-dash" rx="4" />
            {[0,1,2].map(i => (
              <g key={i} transform={`translate(${50+i*110} 178) rotate(${(i-1)*3})`}>
                <rect x="0" y="0" width="80" height="60" className="ink" />
                <line x1="0" y1="0" x2="40" y2="30" className="ink ink-thin" />
                <line x1="80" y1="0" x2="40" y2="30" className="ink ink-thin" />
                <text x="20" y="76" className="tiny">envelope</text>
              </g>
            ))}
          </svg>
        </Variant>
      </div>
    </div>
  );
}

window.Treaties = Treaties;
