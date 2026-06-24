import { useState, useRef, PointerEvent } from 'react';
import { playWaterPlop, playWaveSplash, playSuccessChime } from '../../utils/audio';
import { ShieldAlert, Check, HelpCircle } from 'lucide-react';

interface EcologyPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

interface Threat {
  id: string;
  name: string;
  description: string;
  emoji: string;
  targetId: string;
  restoredName: string;
  restoredDesc: string;
  restoredEmoji: string;
  x: string;
  y: string;
  color: string;
}

interface DropTarget {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  color: string;
  activeGlow: string;
  matchedColor: string;
}

export default function EcologyPuzzle({ onSolved, isSolved }: EcologyPuzzleProps) {
  const [removedHazards, setRemovedHazards] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState<string>('请按住并拖动水中的各种生态威胁物品，拖入下方对应的保护与治理解密站中。');

  // Dragging states
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [draggedOffset, setDraggedOffset] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

  const threats: Threat[] = [
    {
      id: 'trash',
      name: '污染物：废弃塑料垃圾',
      description: '随意丢弃的塑料瓶，分解产生微塑料堵塞鱼鳃。',
      emoji: '🧴',
      targetId: 'trashbin',
      restoredName: '沉水植物：金鱼藻斑块',
      restoredDesc: '清澈水质，提供天然避难所与安全庇护。',
      restoredEmoji: '🌿',
      x: '22%',
      y: '26%',
      color: 'bg-orange-500 border-orange-400 text-white'
    },
    {
      id: 'net',
      name: '危险源：非法底地笼网',
      description: '极具破坏力的绝户网，大小鱼通吃，毁灭生态。',
      emoji: '🕸️',
      targetId: 'police',
      restoredName: '繁育床：卵石与粗砂底质',
      restoredDesc: '纯天然沙砾床，为九刺鱼筑巢育婴提供基地。',
      restoredEmoji: '🪨',
      x: '54%',
      y: '65%',
      color: 'bg-rose-600 border-rose-500 text-white'
    },
    {
      id: 'tilapia',
      name: '入侵种：外来侵略罗非鱼',
      description: '生命力顽强的侵略物种，疯狂吞噬本土九刺鱼卵。',
      emoji: '🐟',
      targetId: 'tank',
      restoredName: '底栖群落：本土田螺与河蚬',
      restoredDesc: '本土滤食性底栖，清理底层有机碎屑净化水体。',
      restoredEmoji: '🐌',
      x: '42%',
      y: '42%',
      color: 'bg-indigo-600 border-indigo-400 text-white'
    },
    {
      id: 'concrete',
      name: '生境退化：水泥硬化河床',
      description: '钢筋水泥硬底阻断了底栖底泥循环及自净能力。',
      emoji: '🧱',
      targetId: 'gravel',
      restoredName: '生态护岸：自然多孔乱石滩',
      restoredDesc: '泥质潮滩及多孔卵石，激发物种根系微循环。',
      restoredEmoji: '🌱',
      x: '78%',
      y: '30%',
      color: 'bg-slate-600 border-slate-500 text-white'
    }
  ];

  const targets: DropTarget[] = [
    {
      id: 'trashbin',
      name: '分类垃圾桶',
      emoji: '🗑️',
      desc: '塑料废弃物集中回收',
      color: 'border-orange-200 bg-orange-50/50 hover:bg-orange-50/80 text-orange-850',
      activeGlow: 'ring-4 ring-orange-400 border-orange-400 bg-orange-100/80 shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      matchedColor: 'border-orange-400 bg-orange-100 text-orange-900 border-solid border-2'
    },
    {
      id: 'police',
      name: '渔政水警',
      emoji: '👮',
      desc: '严厉巡查与没收非法网具',
      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50/80 text-rose-850',
      activeGlow: 'ring-4 ring-rose-400 border-rose-400 bg-rose-100/80 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
      matchedColor: 'border-rose-400 bg-rose-100 text-rose-900 border-solid border-2'
    },
    {
      id: 'tank',
      name: '物种暂存仓',
      emoji: '🧪',
      desc: '隔离并收集外来侵扰物种',
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50/80 text-indigo-850',
      activeGlow: 'ring-4 ring-indigo-400 border-indigo-400 bg-indigo-100/80 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
      matchedColor: 'border-indigo-400 bg-indigo-100 text-indigo-900 border-solid border-2'
    },
    {
      id: 'gravel',
      name: '多孔生态石',
      emoji: '🪨',
      desc: '破裂硬化地，铺设自然泥滩',
      color: 'border-teal-200 bg-teal-50/50 hover:bg-teal-50/80 text-teal-850',
      activeGlow: 'ring-4 ring-teal-400 border-teal-400 bg-teal-100/80 shadow-[0_0_15px_rgba(20,184,166,0.4)]',
      matchedColor: 'border-teal-400 bg-teal-100 text-teal-900 border-solid border-2'
    }
  ];

  // Drag handlers using standard Pointer Events (touch/mouse compatible)
  const handlePointerDown = (e: PointerEvent<HTMLDivElement>, itemId: string) => {
    if (removedHazards.includes(itemId) || isSolved) return;
    
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingId(itemId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    const threat = threats.find(t => t.id === itemId);
    if (threat) {
      setActiveMessage(`正在将 [${threat.name}] 拖往正确的保护解密站中...`);
    }
    playWaterPlop();
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>, itemId: string) => {
    if (draggingId !== itemId) return;
    
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    
    setDraggedOffset(prev => ({
      ...prev,
      [itemId]: { x: dx, y: dy }
    }));

    // Detect which drop target is being hovered over
    let matchedId: string | null = null;
    targets.forEach(t => {
      const elem = document.getElementById(`target-${t.id}`);
      if (elem) {
        const rect = elem.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          matchedId = t.id;
        }
      }
    });
    setHoveredTargetId(matchedId);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>, itemId: string) => {
    if (draggingId !== itemId) return;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingId(null);
    setHoveredTargetId(null);
    
    const threat = threats.find(t => t.id === itemId);
    if (!threat) return;

    // Check if correctly dropped over its mapped target ID
    const correctTargetId = threat.targetId;
    const targetElem = document.getElementById(`target-${correctTargetId}`);
    let isCorrectDrop = false;

    if (targetElem) {
      const rect = targetElem.getBoundingClientRect();
      isCorrectDrop = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    }

    if (isCorrectDrop) {
      playWaveSplash();
      const nextRemoved = [...removedHazards, itemId];
      setRemovedHazards(nextRemoved);
      setActiveMessage(`🎉 成功！将 [${threat.name}] 送至 [${targets.find(t => t.id === correctTargetId)?.name}] 处治理，该区域已成功复苏为 [${threat.restoredName}]！`);
      
      if (nextRemoved.length === threats.length) {
        playSuccessChime();
        onSolved();
        setActiveMessage('🎉 所有的威胁都已化解，九刺鱼生境已恢复完美微循环，生态家园复苏成功！');
      }
    } else {
      playWaterPlop();
      // Check if dropped on the WRONG target to give a specific educational tip
      let wrongTarget: DropTarget | undefined;
      targets.forEach(t => {
        const el = document.getElementById(`target-${t.id}`);
        if (el) {
          const r = el.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            wrongTarget = t;
          }
        }
      });

      if (wrongTarget) {
        setActiveMessage(`❌ 放错站啦！[${threat.name}] 无法由 [${wrongTarget.name}] 直接治理。请匹配其专有保护机制！`);
      } else {
        setActiveMessage(`💡 拖松了！请将 [${threat.name}] 准确拖动并推拽解脱到下方的对应保护治理站中。`);
      }
    }

    // Snap back
    setDraggedOffset(prev => ({
      ...prev,
      [itemId]: { x: 0, y: 0 }
    }));
  };

  return (
    <div className="bg-brand-paper rounded-[32px] border-3 border-brand-teal/20 p-5 shadow-sm space-y-4">
      
      {/* Dynamic Aquarium Screen (The River Sandbox) */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-brand-cream/80 to-brand-teal/15 rounded-2xl overflow-hidden border-2 border-brand-teal/20 shadow-inner">
        
        {/* Dynamic Water Ripple Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,40 Q25,35 50,40 T100,40" fill="none" stroke="#3B8EAC" strokeWidth="0.8" className="animate-pulse" />
            <path d="M0,60 Q25,65 50,60 T100,60" fill="none" stroke="#3B8EAC" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Ambient native fishes - Swimming freely */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <svg className="w-full h-full">
            <g className="animate-bounce" style={{ transform: 'translateX(20px) translateY(80px)', transition: 'all 5s' }}>
              <path d="M10,0 C30,-10 40,0 60,-5 C50,5 30,5 10,0" fill="#4A957E" />
              <path d="M5,0 L12,-4 L12,4 Z" fill="#4A957E" />
              <circle cx="55" cy="-3" r="0.5" fill="white" />
            </g>
          </svg>
        </div>



        {/* Threat & Restored Objects Map */}
        {threats.map((threat) => {
          const isRemoved = removedHazards.includes(threat.id);
          const offset = draggedOffset[threat.id] || { x: 0, y: 0 };
          const isCurrentlyDragging = draggingId === threat.id;

          return (
            <div
              key={threat.id}
              style={{
                left: threat.x,
                top: threat.y,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                zIndex: isCurrentlyDragging ? 100 : 20,
              }}
              onPointerDown={(e) => handlePointerDown(e, threat.id)}
              onPointerMove={(e) => handlePointerMove(e, threat.id)}
              onPointerUp={(e) => handlePointerUp(e, threat.id)}
              onPointerCancel={(e) => handlePointerUp(e, threat.id)}
              className={`absolute cursor-grab select-none active:cursor-grabbing touch-none transition-shadow ${
                isCurrentlyDragging ? 'scale-110 drop-shadow-2xl' : ''
              }`}
            >
              {isRemoved ? (
                // Beautifully restored healthy organic item
                <div className="flex flex-col items-center animate-fade-in pointer-events-none">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center shadow-md text-base">
                    {threat.restoredEmoji}
                  </div>
                  <div className="bg-emerald-100 text-[8.5px] border border-emerald-300 px-1 py-0.5 rounded mt-1 font-bold text-emerald-800 scale-90 whitespace-nowrap">
                    {threat.restoredName.split('：')[0]}
                  </div>
                </div>
              ) : (
                // Unsolved harmful threat element with alert aura
                <div className="flex flex-col items-center text-center">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg border-2 ${threat.color} ${
                    isCurrentlyDragging ? 'ring-4 ring-brand-teal/40' : 'animate-bounce'
                  }`}>
                    {threat.emoji}
                  </div>
                  
                  {/* Item mini-name tags */}
                  <span className="bg-brand-dark/95 text-brand-cream border border-zinc-700/50 text-[8.5px] py-0.5 px-1.5 rounded-md mt-1 shadow-md whitespace-nowrap font-medium pointer-events-none opacity-90">
                    {threat.name.split('：')[1]}
                  </span>

                  {/* Red target indicator ring */}
                  {!isCurrentlyDragging && (
                    <div className="absolute -inset-1 border border-rose-400 rounded-full animate-ping opacity-35 pointer-events-none" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Ambient riverbed bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-brand-teal/15 to-transparent opacity-60 pointer-events-none" />

        {isSolved && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <svg className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Target Conservation & Sorting Terminals (Drop Zones) */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2.5">
          {targets.map((target) => {
            const isMatched = removedHazards.some(id => threats.find(t => t.id === id)?.targetId === target.id);
            const isHovered = hoveredTargetId === target.id;

            // Determine active custom styling
            let cardStyle = target.color;
            if (isMatched) {
              cardStyle = target.matchedColor;
            } else if (isHovered) {
              cardStyle = target.activeGlow;
            }

            return (
              <div
                key={target.id}
                id={`target-${target.id}`}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-dashed transition-all select-none duration-250 ${cardStyle}`}
              >
                {/* Facility icon and check indicator */}
                <div className="relative">
                  <div className="w-9 h-9 bg-white/90 border border-current rounded-lg flex items-center justify-center text-lg shadow-2xs">
                    {target.emoji}
                  </div>
                  {isMatched && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 border border-white text-white rounded-full p-0.5 shadow">
                      <Check className="w-2.5 h-2.5 stroke-[4]" />
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[11px] font-black block tracking-tight truncate">
                    {target.name}
                  </span>
                  <p className="text-[9.5px] leading-snug text-zinc-500 font-sans mt-0.5">
                    {isMatched ? '✅ 治理成功，生境已康复！' : target.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
