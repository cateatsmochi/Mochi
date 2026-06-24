import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { playSuccessChime } from '../../utils/audio';

interface CurtainPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function CurtainPuzzle({ onSolved, isSolved }: CurtainPuzzleProps) {
  const [isOpened, setIsOpened] = useState(isSolved);
  const [dragOffset, setDragOffset] = useState(0); // in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpened) return;
    setIsDragging(true);
    setStartX(e.clientX);
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isOpened) return;
    const diffX = Math.abs(e.clientX - startX);
    // Limit drag to maximum 25px (just a slight peek/wiggle)
    const restrictedOffset = Math.min(25, diffX);
    setDragOffset(restrictedOffset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isOpened) return;
    setIsDragging(false);
    // Smoothly snap back to 0
    setDragOffset(0);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = answerInput.trim();
    if (!clean) return;

    if (clean.includes('人类') || clean === '人' || clean.includes('我们自己') || clean.toLowerCase() === 'human' || clean.toLowerCase() === 'humans') {
      playSuccessChime();
      setIsOpened(true);
      setErrorMsg('');
      onSolved();
    } else {
      setErrorMsg('❌ 答案不正确。请在展厅亲手拉开物理帘子，仔细观察其中展出的公敌生物是……？');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto select-none py-1 z-10 w-full">
      
      {/* Interactive Window/Box (Chamber or Mirror shadow box) */}
      <div className="relative w-full max-w-[280px] h-48 bg-zinc-950 rounded-2xl border-2 border-zinc-800 shadow-xl overflow-hidden flex flex-col items-center justify-center">
        
        {/* Hidden Content: Revealed only when isOpened is true */}
        <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-zinc-900 via-stone-950 to-zinc-950">
          <AnimatePresence>
            {isOpened && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-amber-400 tracking-tight flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    致命的公敌：人类自身
                  </h3>
                  <p className="text-[8.5px] font-mono font-medium text-stone-500 italic">Homo sapiens (Human Impact)</p>
                </div>
                
                <p className="text-[10.5px] text-zinc-300 font-bold px-3 leading-relaxed max-w-[240px]">
                  拉开帘子，倒映出的正是我们自己。人类的过度开发与活动是生态最大的伤痛；但请记住，我们也是唯一有能力挽救与重建平衡的守护者！
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Peeking Background Hint (When curtain is wiggled slightly) */}
          {!isOpened && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0 bg-stone-950">
              <p className="text-[10px] font-bold text-zinc-650">🔒 实景探索中</p>
              <p className="text-[9px] text-zinc-700 max-w-[200px] leading-tight mt-1">
                此处受系统限制，请在展览现场拉开真实的物理帘子寻找答案。
              </p>
            </div>
          )}
        </div>

        {/* Slidable Stage Curtains (Left and Right halves) with realistic red velvet fabric design */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ opacity: isOpened ? 0.35 : 1 }}
          className={`absolute inset-0 z-10 flex overflow-hidden transition-opacity duration-1000 ${isOpened ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
        >
          {/* Left Theater Drape (Velvet folding simulation with shadow gradients) */}
          <div 
            style={{ transform: `translateX(-${isOpened ? 110 : dragOffset}px)` }}
            className={`absolute inset-y-0 left-0 w-1/2 bg-red-950 border-r border-red-500/10 shadow-[8px_0_20px_rgba(0,0,0,0.8)] ease-out z-20 ${isOpened ? 'transition-transform duration-1000' : 'transition-transform duration-150'}`}
          >
            {/* Velvet repeating ripple folds */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 opacity-95" />
            {/* 3D shadows for fabric folds */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.4)_0%,transparent_15%,rgba(255,255,255,0.08)_30%,rgba(0,0,0,0.45)_55%,transparent_70%,rgba(255,255,255,0.08)_85%,rgba(0,0,0,0.5)_100%)]" />
            {/* Vertical textile micro texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:6px_100%] opacity-40" />
          </div>

          {/* Right Theater Drape (Velvet folding simulation with shadow gradients) */}
          <div 
            style={{ transform: `translateX(${isOpened ? 110 : dragOffset}px)` }}
            className={`absolute inset-y-0 right-0 w-1/2 bg-red-950 border-l border-red-500/10 shadow-[-8px_0_20px_rgba(0,0,0,0.8)] ease-out z-20 ${isOpened ? 'transition-transform duration-1000' : 'transition-transform duration-150'}`}
          >
            {/* Velvet repeating ripple folds */}
            <div className="absolute inset-0 bg-gradient-to-l from-red-950 via-rose-900 to-red-950 opacity-95" />
            {/* 3D shadows for fabric folds */}
            <div className="absolute inset-0 bg-[linear-gradient(-90deg,rgba(0,0,0,0.4)_0%,transparent_15%,rgba(255,255,255,0.08)_30%,rgba(0,0,0,0.45)_55%,transparent_70%,rgba(255,255,255,0.08)_85%,rgba(0,0,0,0.5)_100%)]" />
            {/* Vertical textile micro texture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:6px_100%] opacity-40" />
          </div>
        </div>

      </div>

      {/* Verification Input Area */}
      <div className="w-full max-w-[280px]">
        {!isOpened && (
          <form onSubmit={handleVerify} className="space-y-2">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={answerInput}
                onChange={(e) => {
                  setAnswerInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="请输入对他们威胁最大的生物名称"
                className="flex-1 px-3 py-2 bg-white border border-stone-250 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="px-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                验证
              </button>
            </div>
            
            {/* Error Message */}
            {errorMsg && (
              <div className="text-[9.5px] font-bold text-red-500 leading-tight flex items-start gap-1 bg-red-50/50 p-2 rounded-lg border border-red-100">
                <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        )}
      </div>

    </div>
  );
}
