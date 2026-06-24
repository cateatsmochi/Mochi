import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { playSuccessChime, playWaterPlop } from '../../utils/audio';

interface CurtainPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function CurtainPuzzle({ onSolved, isSolved }: CurtainPuzzleProps) {
  // We track if the curtain has been fully opened
  const [isOpened, setIsOpened] = useState(isSolved);
  const [curtainOffset, setCurtainOffset] = useState(isSolved ? 100 : 0); // percentage pulled (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleOpenCurtain = () => {
    playSuccessChime();
    setIsOpened(true);
    setCurtainOffset(100);
    onSolved();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpened) return;
    setIsDragging(true);
    setStartX(e.clientX);
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isOpened) return;
    const diffX = e.clientX - startX;
    // We want sliding to the right or left to pull the curtain. 
    // Let's count absolute or positive pull to right
    const containerWidth = 260; // approximate width of the curtain
    const pct = Math.max(0, Math.min(100, (diffX / containerWidth) * 100));
    setCurtainOffset(pct);

    if (pct >= 85) {
      handleOpenCurtain();
    }
  };

  const handlePointerUp = () => {
    if (isOpened) return;
    setIsDragging(false);
    if (curtainOffset < 85) {
      // Snap back to closed
      setCurtainOffset(0);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto select-none py-1.5 z-10">
      
      {/* Real Scene Physical Guidance */}
      <div className="bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-xl text-center space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-800 font-bold">
          <Eye className="w-3.5 h-3.5" /> 实景观察指引
        </span>
        <p className="text-[11px] text-zinc-750 leading-relaxed">
          请移步至<b>生物繁衍“生存之战”展区</b>，在真实的河道墙边，找到被挂起的一块<b>遮光避光实景竹帘</b>，亲手掀开它！
        </p>
      </div>

      {/* Interactive Window/Box (Represents the hidden dark water chamber) */}
      <div className="relative w-full max-w-[280px] h-48 bg-zinc-950 rounded-2xl border-2 border-zinc-800 shadow-xl overflow-hidden flex flex-col items-center justify-center">
        
        {/* Hidden Content: Inside of the water chamber when curtain is open */}
        <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-stone-900 via-stone-950 to-zinc-900">
          <AnimatePresence>
            {isOpened && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                tabIndex={0}
                className="flex flex-col items-center space-y-2 mt-4"
              >
                {/* Threatening invader graphic simulated */}
                <div className="relative w-24 h-16 bg-red-950/40 border border-red-500/20 rounded-full flex items-center justify-center animate-pulse overflow-hidden">
                  <span className="text-4xl">🐟</span>
                  <div className="absolute top-0 right-1 text-[8px] bg-red-600/90 text-white font-black px-1 rounded uppercase tracking-tighter">
                    Danger
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-red-400 tracking-tight">头号大公敌：食蚊鱼</h3>
                  <p className="text-[9px] font-mono font-medium text-stone-400 italic">Gambusia affinis</p>
                </div>
                
                <p className="text-[10px] text-zinc-300 font-bold px-1 leading-normal max-w-[240px]">
                  是的，这就是对上海本土鱼类威胁最大的生物！食蚊鱼极具侵略性，常疯狂啃噬并捕获松江鲈与九刺鱼的幼苗及卵。
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isOpened && (
            <div className="flex flex-col items-center justify-center space-y-1.5 text-zinc-500">
              <span className="text-3xl animate-bounce">🙈</span>
              <p className="text-[10px] font-semibold text-zinc-400">暗室之中潜藏着什么公敌？</p>
              <p className="text-[8px] text-zinc-500 font-mono tracking-wide">PULL REVEAL OR ACTIVATE</p>
            </div>
          )}
        </div>

        {/* Slidable Screen Curtain overlay representing physical screen fabric */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ transform: `translateX(${curtainOffset}%)` }}
          className={`absolute inset-0 bg-stone-900 flex flex-col items-center justify-center transition-transform duration-100 ease-out z-20 overflow-hidden cursor-grab active:cursor-grabbing ${
            isOpened ? 'pointer-events-none' : ''
          }`}
        >
          {/* Wooden/bamboo texture background rendering */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:10px_100%] opacity-40"></div>
          <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-stone-950/60 via-transparent to-stone-950/60"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center px-4 space-y-2">
            <span className="text-2xl drop-shadow-md">🎋</span>
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">避光保护竹帘</span>
              <p className="text-[8px] text-stone-400 font-sans tracking-tight mt-0.5">往右拉开 或 直接点击下方确认</p>
            </div>
            {/* Sliding guide visual */}
            <div className="w-24 h-1.5 bg-stone-950 rounded-full overflow-hidden relative border border-stone-800">
              <motion.div 
                animate={{ x: [0, 60, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-10 h-full bg-linear-to-r from-amber-600 to-amber-500 rounded-full"
              />
            </div>
          </div>

          {/* Golden bottom rod of bamboo curtain */}
          <div className="absolute bottom-0 inset-x-0 h-3 bg-stone-850 border-t border-stone-700/60 shadow-md"></div>
        </div>
      </div>

      {/* Button Confirmation Zone requested by the user */}
      <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t border-slate-150/50">
        {!isOpened ? (
          <button
            type="button"
            onClick={handleOpenCurtain}
            className="w-full max-w-[240px] py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs tracking-wider transition-all shadow-md hover:scale-102 active:scale-98 flex items-center justify-center gap-1.5 shrink-0"
            id="curtain-confirm-btn"
          >
            <span>🚪 我已经打开了 (确认完成)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200/65 py-2 px-4 rounded-xl text-center flex items-center justify-center gap-1.5 max-w-[240px] animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
            <span className="text-[11px] font-black text-emerald-800">
              已拉开物联展示，心腹之患曝光完成！
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
