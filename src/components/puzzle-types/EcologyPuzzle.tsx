import { useState, useEffect } from 'react';
import { playWaterPlop, playWaveSplash, playSuccessChime } from '../../utils/audio';

interface EcologyPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function EcologyPuzzle({ onSolved, isSolved }: EcologyPuzzleProps) {
  const [removedHazards, setRemovedHazards] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState<string>('点击水中的异常外来鱼和非法网具，保护中华九刺鱼的筑巢生境。');

  const hazards = [
    {
      id: 'tilapia',
      name: '外来入侵：罗非鱼 (Tilapia)',
      description: '放生及逃逸侵入的外来种。生命力极其顽强，抢占生态位，甚至疯狂噬咬我国本土鱼卵。',
      restoredName: '本土螺类 (河蚬与田螺)',
      restoredDesc: '本土初级滤食底栖物，清洁沙底，与九刺鱼共建良性生态环。',
      x: '25%',
      y: '30%',
      icon: '🐠',
      restoredIcon: '🐌'
    },
    {
      id: 'nets',
      name: '非法捕捞：底地笼网 (Trapnet)',
      description: '极具破坏力的“绝户网”。无论大鱼小鱼全部裹挟其中，彻底斩断苏河支流的鱼类繁殖链条。',
      restoredName: '天然卵石与粗砂底质',
      restoredDesc: '纯天然砾石床，为九刺鱼雄鱼用植物叶茎筑巢提供了最佳基地。',
      x: '62%',
      y: '72%',
      icon: '🕸️',
      restoredIcon: '🪨'
    },
    {
      id: 'pollution',
      name: '水体污染：化学废塑料袋 (Trash)',
      description: '随意丢弃的污染物。分解后形成微塑料微粒，严重堵塞幼鱼鳃部并阻断光照水草生长。',
      restoredName: '金鱼藻与苦草斑块',
      restoredDesc: '繁茂的沉水维管束植物，为九刺鱼提供纯天然的隐蔽所与安全育婴房。',
      x: '78%',
      y: '32%',
      icon: '🧴',
      restoredIcon: '🌿'
    }
  ];

  const handleHazardClick = (hazardId: string, name: string, desc: string, restoredName: string) => {
    if (isSolved) return;
    
    if (removedHazards.includes(hazardId)) {
      playWaterPlop();
      setActiveMessage(`✨ 生态已还原：这里已恢复为健康生态要素 [${restoredName}]。`);
      return;
    }

    playWaveSplash();
    const nextRemoved = [...removedHazards, hazardId];
    setRemovedHazards(nextRemoved);
    setActiveMessage(`✅ 成功清除 [${name}]！其危害已被成功化解。已置换恢复。`);

    if (nextRemoved.length === hazards.length) {
      playSuccessChime();
      onSolved();
      setActiveMessage('🎉 危害源已彻底荡平！九刺鱼生境净化成功。看，九刺鱼口中吐出的氧气珠，正好合成了线索信令：【 N9 】！');
    }
  };

  return (
    <div className="bg-brand-paper rounded-[32px] border-3 border-brand-teal/20 p-5 shadow-sm space-y-4">
      {/* Dynamic Aquarium Screen */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-brand-cream/80 to-brand-teal/15 rounded-2xl overflow-hidden border-2 border-brand-teal/20 shadow-inner">
        
        {/* Dynamic Water Ripple Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 Q25,35 50,40 T100,40" fill="none" stroke="#3B8EAC" strokeWidth="0.8" className="animate-pulse" />
            <path d="M0,60 Q25,65 50,60 T100,60" fill="none" stroke="#3B8EAC" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Ambient fishes - Swimming freely */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full">
            <g className="animate-bounce" style={{ transform: 'translateX(20px) translateY(80px)', transition: 'all 5s' }}>
              <path d="M10,0 C30,-10 40,0 60,-5 C50,5 30,5 10,0" fill="#4A957E" />
              <path d="M5,0 L12,-4 L12,4 Z" fill="#4A957E" />
              <circle cx="55" cy="-3" r="0.5" fill="white" />
            </g>
          </svg>
        </div>

        {/* Bubbles code - Only shows when fully solved */}
        {isSolved ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/10 pointer-events-none transition-all duration-1000">
            {/* The N9 symbol drawn elegantly with multiple bubbles */}
            <svg viewBox="0 0 200 120" className="w-48 h-28 text-white drop-shadow-[0_2px_8px_rgba(0,130,153,0.4)] animate-pulse">
              <g fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 6" className="animate-pulse">
                {/* Letter N path of bubbles */}
                <path d="M 50 20 L 50 100 M 50 20 L 95 100 M 95 20 L 95 100" />
                {/* Number 9 path of bubbles */}
                <path d="M 125 45 C 125 20, 160 20, 160 45 C 160 70, 125 65, 125 45 M 160 30 L 160 100 C 160 110, 140 105, 130 95" />
              </g>
              <text x="100" y="115" fill="#4A957E" fontSize="9.5" fontWeight="bold" textAnchor="middle" letterSpacing="1.5">
                生态复苏密码：N9
              </text>
            </svg>
          </div>
        ) : null}

        {/* Floating Hazard Elements */}
        {hazards.map((hazard) => {
          const isRemoved = removedHazards.includes(hazard.id);
          
          return (
            <div
              key={hazard.id}
              style={{ left: hazard.x, top: hazard.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
              onClick={() => handleHazardClick(hazard.id, hazard.name, hazard.description, hazard.restoredName)}
            >
              {isRemoved ? (
                // Restored healthy item representation
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="w-10 h-10 bg-emerald-50/95 border border-emerald-300 rounded-full flex items-center justify-center shadow-md text-emerald-800 text-xs text-[15px]">
                    {hazard.restoredIcon}
                  </div>
                  <span className="text-[9px] bg-emerald-100 px-1 rounded border border-emerald-300 mt-1 text-emerald-800 scale-90 whitespace-nowrap font-sans">
                    已净化
                  </span>
                </div>
              ) : (
                // Destructive hazard representation with alert effects
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 bg-rose-50/95 border-2 border-rose-400 rounded-full flex items-center justify-center shadow-lg text-lg animate-bounce duration-1000 text-[18px]">
                    {hazard.icon}
                  </div>
                  <div className="absolute top-12 scale-95 opacity-90 group-hover:opacity-100 transition-opacity bg-brand-dark text-brand-cream text-[9px] py-1 px-2 rounded-md shadow-md pointer-events-none whitespace-nowrap font-medium z-30">
                    {hazard.name}
                  </div>
                  {/* Subtle target radar ring */}
                  <div className="absolute -inset-1.5 border border-rose-300 rounded-full animate-ping opacity-60 pointer-events-none" />
                </div>
              )}
            </div>
          );
        })}

        {/* Ambient native waterweeds at the margins */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-brand-teal/20 to-transparent opacity-60 pointer-events-none" />

        {/* Small white checkmark in the bottom right corner when solved, without black overlay/blur so it does not block the screen assets */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <svg className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Narrative Guide Board */}
      <div className="bg-brand-cream/80 border-2 border-brand-teal/15 rounded-2xl p-4 min-h-[64px] transition-colors text-left">
        <div className="text-[10px] uppercase tracking-widest text-brand-dark/60 mb-1.5 font-mono font-bold">
          保护日志 / CONSERVATION LOGS
        </div>
        <p className="text-xs text-brand-dark leading-relaxed italic font-medium">「 {activeMessage} 」</p>
        
        {/* Progress Bar */}
        {!isSolved && (
          <div className="mt-3.5 flex items-center gap-3">
            <div className="flex-1 bg-brand-teal/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-teal h-full transition-all duration-300"
                style={{ width: `${(removedHazards.length / hazards.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-brand-dark/70 font-semibold">
              已清除威胁: {removedHazards.length} / 3
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
