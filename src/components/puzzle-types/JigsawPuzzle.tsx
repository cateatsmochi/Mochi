import { useState, useEffect } from 'react';
import { playWaterPlop, playSuccessChime } from '../../utils/audio';

interface JigsawPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function JigsawPuzzle({ onSolved, isSolved }: JigsawPuzzleProps) {
  // 3x3 grid tiles
  const correctOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const [tiles, setTiles] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Shuffling tiles on reset but ensuring it is not already solved
    if (isSolved) {
      setTiles([...correctOrder]);
      return;
    }
    let shuffled = [...correctOrder];
    while (JSON.stringify(shuffled) === JSON.stringify(correctOrder)) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    setTiles(shuffled);
  }, [isSolved]);

  useEffect(() => {
    // Multi-format pre-loader to dynamically detect the real user-uploaded image
    const imgPng = new Image();
    imgPng.src = '/images/shanghai_waterway.png';
    imgPng.onload = () => {
      setImageSrc('/images/shanghai_waterway.png');
    };
    imgPng.onerror = () => {
      const imgJpg = new Image();
      imgJpg.src = '/images/shanghai_waterway.jpg';
      imgJpg.onload = () => {
        setImageSrc('/images/shanghai_waterway.jpg');
      };
      imgJpg.onerror = () => {
        const imgRoot = new Image();
        imgRoot.src = '/shanghai-waterway.jpg';
        imgRoot.onload = () => {
          setImageSrc('/shanghai-waterway.jpg');
        };
        imgRoot.onerror = () => {
          setImageSrc(null); // Fallback to our procedural vector map
        };
      };
    };
  }, []);

  const handleTileClick = (index: number) => {
    if (isSolved) return;
    playWaterPlop();

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else {
      // Swap tiles at selectedIdx and index
      const newTiles = [...tiles];
      const temp = newTiles[selectedIdx];
      newTiles[selectedIdx] = newTiles[index];
      newTiles[index] = temp;
      
      setTiles(newTiles);
      setSelectedIdx(null);

      // Check if solved
      if (JSON.stringify(newTiles) === JSON.stringify(correctOrder)) {
        playSuccessChime();
        onSolved();
      }
    }
  };

  const renderTileContent = (tileValue: number) => {
    const row = Math.floor(tileValue / 3);
    const col = tileValue % 3;

    // If real image loaded successfully, use background slice
    if (imageSrc) {
      return (
        <div 
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: '240px 240px',
            backgroundPosition: `-${col * 80}px -${row * 80}px`,
            width: '100%',
            height: '100%',
          }}
          className="w-full h-full bg-black select-none pointer-events-none transition-all duration-300"
        />
      );
    }

    // Handcrafted premium fallback: Glowing procedural SVG vector map of Shanghai water system
    const leftX = col * 80;
    const topY = row * 80;

    return (
      <svg viewBox={`${leftX} ${topY} 80 80`} className="w-full h-full bg-black select-none pointer-events-none">
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="strong-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComponentTransfer in="blur" result="boost">
              <feFuncA type="linear" slope="1.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="boost" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="chongming-clip">
            <path d="M 55,30 C 80,10 110,15 150,40 C 180,55 205,62 210,80 C 180,95 150,85 130,70 C 100,55 70,45 55,30 Z" />
          </clipPath>

          <clipPath id="mainland-clip">
            <path d="M 17,145 C 50,110 85,85 105,82 C 120,100 160,115 180,128 C 185,135 188,142 205,145 C 215,160 215,180 195,200 C 175,208 150,215 130,225 C 100,225 70,220 50,210 C 30,195 17,170 17,145 Z" />
          </clipPath>

          <clipPath id="changxing-clip">
            <path d="M 125,82 C 140,82 165,95 170,110 C 155,115 135,105 125,95 Z" />
          </clipPath>

          <clipPath id="hengsha-clip">
            <path d="M 183,100 C 195,100 205,108 210,120 C 195,123 185,115 183,100 Z" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="240" height="240" fill="#000000" />

        {/* CHONGMING ISLAND */}
        <path d="M 55,30 C 80,10 110,15 150,40 C 180,55 205,62 210,80 C 180,95 150,85 130,70 C 100,55 70,45 55,30 Z" fill="none" stroke="#9F1C1C" strokeWidth="0.8" />
        <g clipPath="url(#chongming-clip)">
          <path d="M 55,30 C 80,10 110,15 150,40 C 180,55 205,62 210,80 C 180,95 150,85 130,70 C 100,55 70,45 55,30 Z" fill="#22D3EE" opacity="0.15" />
          <line x1="50" y1="20" x2="220" y2="70" stroke="#00D2FF" strokeWidth="1" filter="url(#neon-glow)" />
          <line x1="50" y1="30" x2="220" y2="80" stroke="#00D2FF" strokeWidth="0.8" filter="url(#neon-glow)" />
          <g stroke="#00D2FF" strokeWidth="0.4" opacity="0.8" filter="url(#neon-glow)">
            {Array.from({ length: 25 }).map((_, i) => {
              const xStart = 50 + i * 7;
              return <line key={i} x1={xStart} y1="10" x2={xStart - 10} y2="90" />;
            })}
          </g>
        </g>

        {/* CHANGXING */}
        <path d="M 125,82 C 140,82 165,95 170,110 C 155,115 135,105 125,95 Z" fill="none" stroke="#9F1C1C" strokeWidth="0.6" />
        <g clipPath="url(#changxing-clip)">
          <path d="M 125,82 C 140,82 165,95 170,110 C 155,115 135,105 125,95 Z" fill="#22D3EE" opacity="0.15" />
          <g stroke="#00D2FF" strokeWidth="0.4" opacity="0.85">
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={120 + i * 7} y1="75" x2={120 + i * 7 - 4} y2="120" />
            ))}
            <line x1="120" y1="95" x2="180" y2="105" strokeWidth="0.8" />
          </g>
        </g>

        {/* HENGSHA */}
        <path d="M 183,100 C 195,100 205,108 210,120 C 195,123 185,115 183,100 Z" fill="none" stroke="#9F1C1C" strokeWidth="0.6" />
        <g clipPath="url(#hengsha-clip)">
          <path d="M 183,100 C 195,100 205,108 210,120 C 195,123 185,115 183,100 Z" fill="#22D3EE" opacity="0.15" />
          <g stroke="#00D2FF" strokeWidth="0.4" opacity="0.8">
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={i} x1={180 + i * 5} y1="95" x2={180 + i * 5 - 2} y2="130" />
            ))}
          </g>
        </g>

        {/* MAINLAND SHANGHAI */}
        <path d="M 17,145 C 50,110 85,85 105,82 C 120,100 160,115 180,128 C 185,135 188,142 205,145 C 215,160 215,180 195,200 C 175,208 150,215 130,225 C 100,225 70,220 50,210 C 30,195 17,170 17,145 Z" fill="none" stroke="#9F1C1C" strokeWidth="1" />
        <g clipPath="url(#mainland-clip)">
          <path d="M 17,145 C 50,110 85,85 105,82 C 120,100 160,115 180,128 C 185,135 188,142 205,145 C 215,160 215,180 195,200 C 175,208 150,215 130,225 C 100,225 70,220 50,210 C 30,195 17,170 17,145 Z" fill="#00D2FF" opacity="0.06" />
          <g stroke="#1EA5D6" strokeWidth="0.25" opacity="0.5">
            {Array.from({ length: 60 }).map((_, i) => {
              const y = 80 + i * 2.8;
              return <line key={i} x1="10" y1={y} x2="230" y2={y} />;
            })}
          </g>
          <g stroke="#1EA5D6" strokeWidth="0.25" opacity="0.5">
            {Array.from({ length: 60 }).map((_, i) => {
              const x = 10 + i * 3.2;
              return <line key={i} x1={x} y1="80" x2={x} y2="230" />;
            })}
          </g>
          <circle cx="120" cy="155" r="45" stroke="#00D2FF" strokeWidth="0.5" fill="none" opacity="0.4" />
          <circle cx="120" cy="155" r="65" stroke="#00D2FF" strokeWidth="0.5" fill="none" opacity="0.3" strokeDasharray="3 3" />
          <circle cx="120" cy="155" r="25" stroke="#00D2FF" strokeWidth="0.6" fill="none" opacity="0.5" />
          <g stroke="#00D2FF" strokeWidth="0.35" opacity="0.75">
            <line x1="20" y1="130" x2="160" y2="210" />
            <line x1="40" y1="180" x2="140" y2="120" />
            <line x1="80" y1="130" x2="210" y2="190" />
            <line x1="100" y1="210" x2="190" y2="140" />
          </g>
          <ellipse cx="28" cy="165" rx="5" ry="3.5" fill="#00D2FF" opacity="0.8" filter="url(#neon-glow)" />
          <ellipse cx="185" cy="175" rx="4" ry="4" fill="#00D2FF" opacity="0.7" filter="url(#neon-glow)" />
        </g>

        {/* Suzhou Creek */}
        <path d="M 17,165 Q 45,158 85,152 T 120,150" fill="none" stroke="#00E5FF" strokeWidth="1.6" filter="url(#neon-glow)" />
        
        {/* Huangpu River */}
        <path 
          d="M 70,220 Q 90,195 110,182 T 120,150 Q 128,132 118,120 Q 106,110 108,102 Q 110,95 115,82" 
          fill="none" 
          stroke="#00F0FF" 
          strokeWidth="3.2" 
          filter="url(#strong-glow)" 
        />
        <path 
          d="M 70,220 Q 90,195 110,182 T 120,150 Q 128,132 118,120 Q 106,110 108,102 Q 110,95 115,82" 
          fill="none" 
          stroke="#FFFFFF" 
          strokeWidth="1" 
        />

        {!isSolved && (
          <text x="120" y="234" fill="#00D2FF" fontSize="5.5" textAnchor="middle" opacity="0.35" letterSpacing="1.5" className="font-mono">
            SHANGHAI WATERWAY RECLAMATION NETWORK
          </text>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[280px] bg-brand-cream p-2.5 rounded-2xl shadow-md border-2 border-brand-teal/30">
        <div className="grid grid-cols-3 gap-1 bg-brand-teal/15 rounded-xl overflow-hidden shadow-inner relative">
          
          {/* Tiles Mapping */}
          {tiles.map((tileValue, index) => {
            const isSelected = selectedIdx === index;
            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                className={`aspect-square relative cursor-pointer overflow-hidden transition-all duration-200 focus:outline-none ${
                  isSelected ? 'ring-4 ring-brand-teal z-10 scale-[1.02] shadow-lg' : 'hover:opacity-95'
                }`}
              >
                {renderTileContent(tileValue)}
                
                {/* Visual grid piece marker border */}
                <div className="absolute inset-0 border border-white/10 pointer-events-none" />

                {/* Show clean helpful numbering labels faintly unless solved */}
                {!isSolved && (
                  <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[9px] text-[#22D3EE] font-mono border border-brand-teal/30 scale-90">
                    {tileValue + 1}
                  </span>
                )}
              </button>
            );
          })}

          {/* Small white checkmark in the bottom right corner when solved, without black overlay/blur so it does not block the water map configuration */}
          {isSolved && (
            <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
              <svg className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
