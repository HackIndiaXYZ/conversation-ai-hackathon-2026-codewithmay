import React from 'react';

// Hospital ward environment — for Nurse
const HospitalBg = () => (
  <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8f0f7"/>
        <stop offset="100%" stopColor="#c8daea"/>
      </linearGradient>
      <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b8cce0"/>
        <stop offset="100%" stopColor="#8eadc8"/>
      </linearGradient>
    </defs>
    {/* Wall */}
    <rect width="800" height="600" fill="url(#wallGrad)"/>
    {/* Floor */}
    <rect y="450" width="800" height="150" fill="url(#floorGrad)"/>
    {/* Floor tiles */}
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x={i*100} y="450" width="100" height="75" fill="none" stroke="#a0bcd4" strokeWidth="1"/>
    ))}
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x={i*100} y="525" width="100" height="75" fill="none" stroke="#a0bcd4" strokeWidth="1"/>
    ))}
    {/* Window left */}
    <rect x="40" y="80" width="160" height="200" rx="4" fill="#b8deff" stroke="#7aadd4" strokeWidth="3"/>
    <rect x="40" y="80" width="160" height="10" fill="#7aadd4"/>
    <line x1="120" y1="80" x2="120" y2="280" stroke="#7aadd4" strokeWidth="2"/>
    <line x1="40" y1="180" x2="200" y2="180" stroke="#7aadd4" strokeWidth="2"/>
    {/* Window light rays */}
    <rect x="40" y="80" width="160" height="200" fill="rgba(255,255,255,0.2)" rx="4"/>
    {/* Wall stripe */}
    <rect y="260" width="800" height="20" fill="#a8c4d8" opacity="0.6"/>
    {/* Hospital bed right */}
    <rect x="580" y="320" width="200" height="80" rx="8" fill="#e8f0f7" stroke="#c0d4e8" strokeWidth="2"/>
    <rect x="580" y="310" width="200" height="20" rx="4" fill="#d0e4f4" stroke="#b0c8e0" strokeWidth="2"/>
    <rect x="570" y="320" width="15" height="80" rx="4" fill="#8aaccc"/>
    <rect x="785" y="320" width="15" height="80" rx="4" fill="#8aaccc"/>
    <rect x="580" y="380" width="200" height="8" fill="#c0d4e8"/>
    {/* Pillow */}
    <rect x="595" y="315" width="170" height="35" rx="6" fill="white" stroke="#ddd" strokeWidth="1"/>
    {/* IV stand */}
    <line x1="560" y1="200" x2="560" y2="400" stroke="#9ab4cc" strokeWidth="4"/>
    <line x1="540" y1="200" x2="580" y2="200" stroke="#9ab4cc" strokeWidth="4"/>
    <ellipse cx="560" cy="195" rx="20" ry="28" fill="#d4eaff" stroke="#9ab4cc" strokeWidth="2"/>
    {/* Monitor */}
    <rect x="630" y="210" width="120" height="90" rx="6" fill="#1a2a3a" stroke="#4a7090" strokeWidth="2"/>
    <rect x="638" y="218" width="104" height="74" rx="3" fill="#0a1a2a"/>
    {/* ECG line */}
    <polyline points="645,255 660,255 668,235 676,275 684,255 700,255 708,240 716,270 724,255 742,255" fill="none" stroke="#00ff88" strokeWidth="2"/>
    <rect x="680" y="295" width="40" height="8" rx="2" fill="#4a7090"/>
    {/* Ceiling light */}
    <rect x="350" y="0" width="100" height="15" rx="3" fill="#d4eaff" stroke="#aac8e0" strokeWidth="1"/>
    <rect x="355" y="15" width="90" height="8" rx="2" fill="#fffbe6" opacity="0.9"/>
    {/* Red cross on wall */}
    <rect x="360" y="100" width="80" height="25" rx="3" fill="#e53e3e"/>
    <rect x="375" y="88" width="50" height="50" rx="3" fill="#e53e3e"/>
    <rect x="380" y="93" width="40" height="40" fill="white" rx="2"/>
    <rect x="394" y="100" width="12" height="26" fill="#e53e3e"/>
    <rect x="387" y="107" width="26" height="12" fill="#e53e3e"/>
    {/* Nurse station desk */}
    <rect x="0" y="390" width="120" height="60" rx="4" fill="#c8daea" stroke="#9ab4cc" strokeWidth="2"/>
    <rect x="5" y="370" width="110" height="25" rx="3" fill="#1a2a3a"/>
    <rect x="10" y="374" width="100" height="17" rx="2" fill="#0a1a2a"/>
    <text x="60" y="386" fontSize="8" fill="#00ff88" textAnchor="middle" fontFamily="monospace">PATIENT MONITOR</text>
    {/* Ambient glow at bottom */}
    <rect y="440" width="800" height="20" fill="rgba(200,220,240,0.4)"/>
  </svg>
);

// Pharmacy / medical store — for Pharmacist
const PharmacyBg = () => (
  <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="pharmWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f0f4f0"/>
        <stop offset="100%" stopColor="#d4e8d4"/>
      </linearGradient>
      <linearGradient id="pharmFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c8d8c8"/>
        <stop offset="100%" stopColor="#a0b8a0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#pharmWall)"/>
    <rect y="450" width="800" height="150" fill="url(#pharmFloor)"/>
    {/* Floor tiles */}
    {[0,1,2,3].map(r => [0,1,2,3,4,5,6,7].map(c => (
      <rect key={`${r}${c}`} x={c*100} y={450+r*75} width="100" height="75" fill={((r+c)%2===0)?'rgba(255,255,255,0.15)':'transparent'} stroke="#b0c8b0" strokeWidth="1"/>
    )))}
    {/* Medicine shelves left */}
    {[80,160,240,320].map((y, i) => (
      <g key={i}>
        <rect x="0" y={y} width="180" height="8" fill="#8B6914" rx="2"/>
        {/* Bottles on shelf */}
        {[15,40,65,90,115,140].map((x, j) => (
          <g key={j}>
            <rect x={x} y={y-35} width="18" height="32" rx="3"
              fill={['#ff8080','#80c0ff','#80ff80','#ffcc80','#cc80ff','#80ffcc'][j]}
              stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
            <rect x={x+2} y={y-38} width="14" height="6" rx="2" fill="rgba(255,255,255,0.8)"/>
          </g>
        ))}
      </g>
    ))}
    <rect x="0" y="60" width="185" height="320" fill="rgba(180,200,180,0.1)" stroke="#8B6914" strokeWidth="3" rx="4"/>
    {/* Medicine shelves right */}
    {[80,160,240,320].map((y, i) => (
      <g key={i}>
        <rect x="620" y={y} width="180" height="8" fill="#8B6914" rx="2"/>
        {[635,660,685,710,735,760].map((x, j) => (
          <g key={j}>
            <rect x={x} y={y-35} width="18" height="32" rx="3"
              fill={['#80ffcc','#cc80ff','#ffcc80','#80ff80','#80c0ff','#ff8080'][j]}
              stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
            <rect x={x+2} y={y-38} width="14" height="6" rx="2" fill="rgba(255,255,255,0.8)"/>
          </g>
        ))}
      </g>
    ))}
    <rect x="615" y="60" width="185" height="320" fill="rgba(180,200,180,0.1)" stroke="#8B6914" strokeWidth="3" rx="4"/>
    {/* Counter */}
    <rect x="0" y="390" width="800" height="65" fill="#6B8F6B" rx="0"/>
    <rect x="0" y="385" width="800" height="15" fill="#8aaf8a" rx="2"/>
    <rect x="0" y="450" width="800" height="8" fill="#4a6e4a"/>
    {/* Counter items */}
    <rect x="250" y="360" width="80" height="30" rx="4" fill="#1a2a1a"/>
    <rect x="258" y="365" width="64" height="20" rx="2" fill="#0a1a0a"/>
    <text x="290" y="379" fontSize="7" fill="#00ff66" textAnchor="middle" fontFamily="monospace">RX SYSTEM</text>
    <rect x="380" y="355" width="40" height="40" rx="4" fill="#c0dcc0" stroke="#8aaf8a" strokeWidth="2"/>
    {[385,395,405].map((x,i) => [360,370,380].map((y,j) => (
      <rect key={`${i}${j}`} x={x} y={y} width="8" height="8" rx="1" fill="#4a8a4a"/>
    )))}
    {/* Green cross sign */}
    <rect x="340" y="20" width="120" height="40" rx="6" fill="#22a055"/>
    <rect x="352" y="10" width="96" height="60" rx="6" fill="#22a055"/>
    <rect x="358" y="16" width="84" height="48" rx="4" fill="#28c066"/>
    <rect x="390" y="24" width="20" height="32" fill="white" rx="2"/>
    <rect x="378" y="36" width="44" height="8" fill="white" rx="2"/>
    {/* Ceiling fluorescent */}
    {[150,350,550].map((x,i) => (
      <g key={i}>
        <rect x={x} y="0" width="100" height="12" rx="2" fill="#d4f0d4" stroke="#aadaaa" strokeWidth="1"/>
        <rect x={x+5} y="12" width="90" height="6" rx="1" fill="#fffbe6" opacity="0.95"/>
      </g>
    ))}
    {/* Prescription bottles on counter */}
    {[80,140,600,660,710].map((x,i) => (
      <g key={i}>
        <rect x={x} y="360" width="24" height="30" rx="4"
          fill={['#ff9999','#99ccff','#99ffcc','#ffcc99','#cc99ff'][i]}
          stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
        <rect x={x+3} y="355" width="18" height="8" rx="3" fill="rgba(255,255,255,0.9)"/>
        <rect x={x+2} y="370" width="20" height="8" rx="1" fill="white" opacity="0.7"/>
      </g>
    ))}
  </svg>
);

// Nutrition / wellness clinic — for Dietitian
const ClinicBg = () => (
  <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="clinicWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fdf8f0"/>
        <stop offset="100%" stopColor="#f0e8d0"/>
      </linearGradient>
      <linearGradient id="clinicFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ddd0b8"/>
        <stop offset="100%" stopColor="#c8b898"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#clinicWall)"/>
    <rect y="450" width="800" height="150" fill="url(#clinicFloor)"/>
    {/* Wooden floor planks */}
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x={0} y={450+i*20} width="800" height="20" fill="none" stroke="#b8a088" strokeWidth="1" opacity="0.5"/>
    ))}
    {/* Window with plants */}
    <rect x="550" y="60" width="200" height="260" rx="4" fill="#b8e8ff" stroke="#c8b090" strokeWidth="3"/>
    <line x1="650" y1="60" x2="650" y2="320" stroke="#c8b090" strokeWidth="2"/>
    <line x1="550" y1="190" x2="750" y2="190" stroke="#c8b090" strokeWidth="2"/>
    <rect x="550" y="60" width="200" height="260" fill="rgba(255,255,220,0.15)" rx="4"/>
    {/* Sunlight */}
    <rect x="550" y="60" width="200" height="260" fill="url(#sunlight)" rx="4"/>
    {/* Hanging plant */}
    <circle cx="400" cy="30" r="8" fill="#6B4226"/>
    <line x1="400" y1="38" x2="400" y2="60" stroke="#6B4226" strokeWidth="3"/>
    <ellipse cx="400" cy="75" rx="30" ry="20" fill="#4a7a3a"/>
    {[0,1,2,3,4,5].map(i => (
      <ellipse key={i} cx={390+Math.cos(i*60*Math.PI/180)*25} cy={75+Math.sin(i*60*Math.PI/180)*15}
        rx="12" ry="8" fill={['#5a8a4a','#4a7a3a','#6a9a5a','#3a6a2a','#5a8a4a','#4a7a3a'][i]}/>
    ))}
    {/* Bookshelf left */}
    <rect x="0" y="80" width="160" height="320" fill="rgba(210,185,150,0.3)" stroke="#c8a878" strokeWidth="3" rx="4"/>
    {[120,200,280].map((y,i) => (
      <g key={i}>
        <rect x="0" y={y} width="160" height="6" fill="#c8a878"/>
        {[10,35,58,80,102,122,140].map((x,j) => (
          <rect key={j} x={x} y={y-50} width="18" height={40+j*2}
            fill={['#e88060','#60a0e8','#60d080','#e8c060','#c060e8','#60e8c0','#e86080'][j]}
            rx="2" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
        ))}
      </g>
    ))}
    {/* Nutrition posters */}
    <rect x="220" y="80" width="130" height="170" rx="4" fill="white" stroke="#c8b090" strokeWidth="2"/>
    <rect x="228" y="88" width="114" height="154" rx="2" fill="#f0f8f0"/>
    <text x="285" y="115" fontSize="11" fill="#4a7a4a" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">FOOD PYRAMID</text>
    {/* Simple pyramid */}
    <polygon points="285,140 245,220 325,220" fill="#f0c060" stroke="#c8a040" strokeWidth="1"/>
    <polygon points="285,155 255,200 315,200" fill="#a0d060" stroke="#80b040" strokeWidth="1"/>
    <polygon points="285,170 263,190 307,190" fill="#60c080" stroke="#40a060" strokeWidth="1"/>
    <rect x="228" y="225" width="114" height="12" rx="2" fill="#e0e8e0"/>
    {/* Desk with food models */}
    <rect x="0" y="390" width="220" height="65" fill="#c8a878" rx="4" stroke="#a08858" strokeWidth="2"/>
    <rect x="0" y="382" width="220" height="14" fill="#d4b888" rx="2"/>
    {/* Food items on desk */}
    <circle cx="40" cy="378" r="18" fill="#f0c060" stroke="#d4a840" strokeWidth="1.5"/>
    <circle cx="40" cy="378" r="10" fill="#e8a840"/>
    <ellipse cx="90" cy="376" rx="22" ry="14" fill="#60c080" stroke="#40a060" strokeWidth="1.5"/>
    <ellipse cx="90" cy="372" rx="16" ry="8" fill="#80d0a0"/>
    <rect x="120" y="360" width="30" height="20" rx="3" fill="#f08060" stroke="#d06040" strokeWidth="1.5"/>
    <ellipse cx="135" cy="360" rx="15" ry="6" fill="#f0a080"/>
    {/* Scale */}
    <rect x="155" y="365" width="55" height="25" rx="4" fill="#e0e0e0" stroke="#b0b0b0" strokeWidth="1.5"/>
    <circle cx="182" cy="370" r="8" fill="#d0d0d0" stroke="#a0a0a0" strokeWidth="1"/>
    <rect x="160" y="385" width="45" height="5" rx="2" fill="#c0c0c0"/>
    {/* Plant pot right */}
    <rect x="700" y="380" width="60" height="70" rx="4" fill="#c87840"/>
    <rect x="695" y="376" width="70" height="12" rx="3" fill="#d08050"/>
    {[710,725,740,720,730].map((x,i) => (
      <ellipse key={i} cx={x} cy={350+i*8} rx="18" ry="12"
        fill={['#4a8a3a','#5a9a4a','#3a7a2a','#6aaa5a','#4a8a3a'][i]} opacity="0.9"/>
    ))}
    {/* Light warm ceiling */}
    <rect x="300" y="0" width="200" height="18" rx="4" fill="#fffbe6" stroke="#e8d8a0" strokeWidth="1"/>
  </svg>
);

// Therapy / psychology office — for Psychologist
const TherapyBg = () => (
  <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="therapyWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2d3a4a"/>
        <stop offset="100%" stopColor="#1a2535"/>
      </linearGradient>
      <linearGradient id="therapyFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3a2a1a"/>
        <stop offset="100%" stopColor="#2a1a0a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#therapyWall)"/>
    <rect y="440" width="800" height="160" fill="url(#therapyFloor)"/>
    {/* Dark wood floor */}
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x={0} y={440+i*20} width="800" height="20" fill="none" stroke="#4a3a2a" strokeWidth="1.5" opacity="0.7"/>
    ))}
    {/* Large window with blinds */}
    <rect x="480" y="50" width="260" height="300" rx="4" fill="#1a2a3a" stroke="#4a5a6a" strokeWidth="3"/>
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
      <rect key={i} x="480" y={50+i*22} width="260" height="12" fill="#2a3a4a" opacity="0.8" stroke="#3a4a5a" strokeWidth="0.5"/>
    ))}
    {/* City night view through blinds */}
    {[500,530,560,590,620,650,680,700].map((x,i) => (
      <rect key={i} x={x} y={200-i*15} width={18+i*3} height={150+i*15}
        fill={`rgba(${60+i*10},${70+i*8},${100+i*5},0.6)`} rx="1"/>
    ))}
    {/* Window lights */}
    {[505,522,540,558,575,592,610].map((x,i) => (
      <rect key={i} x={x} y={220+i*5} width="8" height="6" fill={`rgba(255,220,150,${0.3+i*0.1})`} rx="1"/>
    ))}
    {/* Warm lamp left */}
    <line x1="80" y1="0" x2="80" y2="120" stroke="#6a4a2a" strokeWidth="4"/>
    <ellipse cx="80" cy="120" rx="50" ry="15" fill="#8a6a3a" stroke="#6a4a2a" strokeWidth="2"/>
    <ellipse cx="80" cy="115" rx="42" ry="10" fill="#ffcc66" opacity="0.8"/>
    {/* Lamp glow */}
    <radialGradient id="lampGlow" cx="50%" cy="100%" r="50%">
      <stop offset="0%" stopColor="rgba(255,200,100,0.3)"/>
      <stop offset="100%" stopColor="rgba(255,200,100,0)"/>
    </radialGradient>
    <ellipse cx="80" cy="120" rx="120" ry="80" fill="url(#lampGlow)"/>
    {/* Couch */}
    <rect x="520" y="340" width="260" height="100" rx="12" fill="#4a3020" stroke="#3a2010" strokeWidth="2"/>
    <rect x="520" y="330" width="260" height="30" rx="8" fill="#5a3828" stroke="#3a2010" strokeWidth="2"/>
    {/* Couch cushions */}
    <rect x="528" y="336" width="118" height="28" rx="6" fill="#6a4838"/>
    <rect x="654" y="336" width="118" height="28" rx="6" fill="#6a4838"/>
    {/* Couch legs */}
    {[525,765].map((x,i) => <rect key={i} x={x} y="430" width="15" height="20" rx="3" fill="#3a2010"/>)}
    {/* Bookshelf right */}
    <rect x="0" y="60" width="140" height="380" fill="rgba(60,40,20,0.4)" stroke="#6a4a2a" strokeWidth="3" rx="4"/>
    {[140,220,300,380].map((y,i) => (
      <g key={i}>
        <rect x="0" y={y} width="140" height="6" fill="#6a4a2a"/>
        {[8,30,50,72,95,115].map((x,j) => (
          <rect key={j} x={x} y={y-55} width="16"
            height={45+j*2} rx="2"
            fill={['#8B4513','#556B2F','#4682B4','#8B008B','#B8860B','#2F4F4F'][j]}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        ))}
      </g>
    ))}
    {/* Desk */}
    <rect x="0" y="380" width="200" height="60" rx="4" fill="#4a3020" stroke="#3a2010" strokeWidth="2"/>
    <rect x="0" y="372" width="200" height="15" fill="#5a3828" rx="2"/>
    {/* Desk items */}
    <rect x="20" y="348" width="70" height="28" rx="3" fill="#1a2a1a"/>
    <rect x="25" y="352" width="60" height="20" rx="2" fill="#0a1a0a"/>
    <text x="55" y="366" fontSize="7" fill="#4a8a4a" textAnchor="middle" fontFamily="monospace">NOTES</text>
    {/* Notebook */}
    <rect x="110" y="355" width="75" height="22" rx="2" fill="#f0e8d0" stroke="#c0a878" strokeWidth="1"/>
    <line x1="130" y1="358" x2="130" y2="374" stroke="#d0b888" strokeWidth="1"/>
    {/* Small plant */}
    <rect x="160" y="350" width="25" height="30" rx="3" fill="#6B4226"/>
    <rect x="155" y="346" width="35" height="8" rx="2" fill="#8B5A2B"/>
    {[165,175,185,170,180].map((x,i) => (
      <ellipse key={i} cx={x} cy={330+i*4} rx="14" ry="9"
        fill={['#2a5a2a','#3a6a3a','#1a4a1a','#4a7a4a','#2a5a2a'][i]}/>
    ))}
    {/* Framed degree/art on wall */}
    <rect x="200" y="80" width="140" height="180" rx="4" fill="#1a1a2a" stroke="#4a4a6a" strokeWidth="3"/>
    <rect x="208" y="88" width="124" height="164" rx="2" fill="#0a0a1a"/>
    {/* Abstract art */}
    <circle cx="270" cy="170" r="50" fill="none" stroke="#4a6a8a" strokeWidth="2" opacity="0.6"/>
    <circle cx="270" cy="170" r="35" fill="none" stroke="#6a4a8a" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="270" cy="170" r="20" fill="rgba(100,80,140,0.3)"/>
    <line x1="230" y1="130" x2="310" y2="210" stroke="#8a6aaa" strokeWidth="1" opacity="0.5"/>
    <line x1="310" y1="130" x2="230" y2="210" stroke="#6a8aaa" strokeWidth="1" opacity="0.5"/>
    {/* Ambient floor glow */}
    <rect y="430" width="800" height="20" fill="rgba(255,180,80,0.05)"/>
  </svg>
);

const BACKGROUNDS = {
  hospital: HospitalBg,
  pharmacy: PharmacyBg,
  clinic:   ClinicBg,
  therapy:  TherapyBg,
};

const AvatarBackground = ({ type = 'hospital' }) => {
  const Bg = BACKGROUNDS[type] || HospitalBg;
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Bg />
    </div>
  );
};

export default AvatarBackground;

// Note: vignette + halo are rendered by AvatarSection in App.jsx
// AvatarBackground itself is unchanged — just the SVG scene layers
