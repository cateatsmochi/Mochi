import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { playWaterPlop, playSuccessChime } from '../../utils/audio';

interface MapPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function MapPuzzle({ onSolved, isSolved }: MapPuzzleProps) {
  const [step, setStep] = useState<1 | 2>(isSolved ? 2 : 1);
  const [q1Selected, setQ1Selected] = useState<string | null>(isSolved ? '一平方米' : null);
  const [q2Selected, setQ2Selected] = useState<string | null>(isSolved ? '三角形' : null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const q1Options = ['一平方分米', '一平方厘米', '10平方米', '一平方米'];
  const q2Options = ['圆形', '正方形', '三角形', '梯形'];

  const handleQ1Select = (option: string) => {
    if (isSolved) return;
    setQ1Selected(option);
    setErrorMsg(null);
    playWaterPlop();

    if (option === '一平方米') {
      // Transition to step 2 smoothly after a brief delay
      setTimeout(() => {
        setStep(2);
      }, 600);
    } else {
      setErrorMsg('❌ 似乎不太对。请在展厅中找到这些微型的“小小博物馆”，观察它们的底座展牌吧！');
    }
  };

  const handleQ2Select = (option: string) => {
    if (isSolved) return;
    setQ2Selected(option);
    setErrorMsg(null);
    playWaterPlop();

    if (option === '三角形') {
      playSuccessChime();
      onSolved();
    } else {
      setErrorMsg('❌ 形状不对哦。请在展厅走动环顾，将这几个散布在各处的“小小博物馆”位置连成线看一看……');
    }
  };

  const handleReset = () => {
    if (isSolved) return;
    setStep(1);
    setQ1Selected(null);
    setQ2Selected(null);
    setErrorMsg(null);
    playWaterPlop();
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto select-none py-1 z-10 w-full">
      
      {/* 1m x 1m Micro-Museum Isometric Showcase SVG */}
      <div className="relative w-full max-w-[280px] h-48 bg-gradient-to-b from-stone-900 via-zinc-950 to-stone-950 rounded-2xl border-2 border-zinc-800 shadow-xl overflow-hidden flex flex-col items-center justify-center">
        
        {/* Isometric schematic drawing of a 1m x 1m wood-framed museum cabinet with water organisms */}
        <svg viewBox="0 0 200 150" className="w-full h-full opacity-90 select-none pointer-events-none">
          <defs>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* Isometric Base Grid Grid */}
          <g transform="translate(100, 110)">
            {/* Draw 1m x 1m wooden floor tile */}
            <path d="M 0,-40 L 70,-5 L 0,30 L -70,-5 Z" fill="url(#woodGrad)" stroke="#1e1b4b" strokeWidth="1" />
            <path d="M 0,-38 L 66,-5 L 0,27 L -66,-5 Z" fill="#292524" opacity="0.8" />
            
            {/* Grid helper lines inside the floor */}
            <path d="M -33,-16.5 L 33,16.5 M -35,-2.5 L 35,-2.5" stroke="#444" strokeWidth="0.5" strokeDasharray="2 2" />
            
            {/* Ruler arrows showing 1.0m width */}
            <path d="M -78,-5 L 0,34 M 0,34 L 78,-5" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <text x="-45" y="24" fill="#fbbf24" fontSize="7" fontWeight="black" transform="rotate(22 -45 24)">
              {step === 1 && !isSolved ? "? m" : "1.0 m"}
            </text>
            <text x="45" y="24" fill="#fbbf24" fontSize="7" fontWeight="black" transform="rotate(-22 45 24)">
              {step === 1 && !isSolved ? "? m" : "1.0 m"}
            </text>

            {/* Inner Glass Box columns (vertical pillars) */}
            <line x1="-66" y1="-5" x2="-66" y2="-65" stroke="#0891b2" strokeWidth="1.5" opacity="0.6" />
            <line x1="66" y1="-5" x2="66" y2="-65" stroke="#0891b2" strokeWidth="1.5" opacity="0.6" />
            <line x1="0" y1="27" x2="0" y2="-33" stroke="#0891b2" strokeWidth="2" opacity="0.8" />
            <line x1="0" y1="-38" x2="0" y2="-98" stroke="#0891b2" strokeWidth="1" opacity="0.4" />

            {/* Glass panels (Polygons) */}
            <path d="M -66,-65 L 0,-33 L 0,27 L -66,-5 Z" fill="url(#glassGrad)" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5" />
            <path d="M 0,-33 L 66,-65 L 66,-5 L 0,27 Z" fill="url(#glassGrad)" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5" />
            
            {/* Little Waterplants inside */}
            <path d="M -20,5 C -25,-15 -15,-30 -20,-45 M -20,5 C -15,-10 -25,-25 -22,-35" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <path d="M 20,-5 C 15,-20 25,-35 18,-48" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            
            {/* Floating bubbles */}
            <circle cx="-10" cy="-25" r="2" fill="#22d3ee" opacity="0.6" />
            <circle cx="15" cy="-35" r="1.5" fill="#22d3ee" opacity="0.5" />
            <circle cx="5" cy="-55" r="2.5" fill="#22d3ee" opacity="0.4" />

            {/* A miniature swimming orange/pink native fish */}
            <path d="M -5,-15 Q -15,-22 -22,-18" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 15,-25 Q 5,-32 -2,-28" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" />
            
            {/* Top Frame Lid */}
            <path d="M -66,-65 L 0,-93 L 66,-65 L 0,-33 Z" fill="url(#woodGrad)" stroke="#1e1b4b" strokeWidth="1" opacity="0.9" />
            <path d="M -62,-65 L 0,-89 L 62,-65 L 0,-37 Z" fill="#1c1917" />
          </g>

          {/* Elegant Display Overlay Label */}
          <rect x="52" y="10" width="96" height="15" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="100" y="20" fill="#f8fafc" fontSize="6.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
            {step === 1 && !isSolved ? "小小生境空间展示" : "1.0m × 1.0m = 一平米生境"}
          </text>
        </svg>

        {/* Floating progress step pill */}
        {!isSolved && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-[8px] font-mono font-bold text-amber-500">
            {step} / 2 关卡
          </div>
        )}

        {/* Small check icon if solved */}
        {isSolved && (
          <div className="absolute top-2.5 right-2.5 p-1 bg-brand-green/10 border border-brand-green/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
          </div>
        )}
      </div>

      {/* Dynamic Multi-Step Question UI Panel */}
      <div className="w-full max-w-[280px] bg-white rounded-2xl border border-stone-200 p-3.5 shadow-sm space-y-3">
        
        <AnimatePresence mode="wait">
          {step === 1 && !isSolved ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2.5"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">问题一</span>
                  <span className="text-[10.5px] font-black text-zinc-800">微缩博物馆占地面积</span>
                </div>
                <p className="text-[9.5px] text-zinc-500 font-medium">
                  这个由学生策划的博物馆，其真实的占地面积更接近于以下哪一个？
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {q1Options.map((opt) => {
                  const isSelected = q1Selected === opt;
                  const isCorrect = opt === '一平方米';
                  let btnStyle = "border-stone-200 hover:border-amber-500/50 hover:bg-stone-50 text-zinc-700";
                  if (isSelected) {
                    btnStyle = isCorrect 
                      ? "bg-brand-green/10 border-brand-green/40 text-brand-green font-bold"
                      : "bg-red-50 border-red-300 text-red-800";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleQ1Select(opt)}
                      className={`py-2 px-1 text-[10.5px] font-semibold border rounded-xl transition-all cursor-pointer text-center ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : step === 2 && !isSolved ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2.5"
            >
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">问题二</span>
                    <span className="text-[10.5px] font-black text-zinc-800">空间连线的秘密几何</span>
                  </div>
                  {/* Back to Step 1 */}
                  <button 
                    onClick={handleReset}
                    className="text-[9px] font-bold text-zinc-400 hover:text-amber-600 flex items-center gap-0.5"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    重设
                  </button>
                </div>
                <p className="text-[9.5px] text-zinc-500 font-medium">
                  展厅中这几个“小小博物馆”所在的点位连起来，像什么形状？
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {q2Options.map((opt) => {
                  const isSelected = q2Selected === opt;
                  const isCorrect = opt === '三角形';
                  let btnStyle = "border-stone-200 hover:border-amber-500/50 hover:bg-stone-50 text-zinc-700";
                  if (isSelected) {
                    btnStyle = isCorrect 
                      ? "bg-brand-green/10 border-brand-green/40 text-brand-green font-bold"
                      : "bg-red-50 border-red-300 text-red-800";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleQ2Select(opt)}
                      className={`py-2 px-1 text-[10.5px] font-semibold border rounded-xl transition-all cursor-pointer text-center ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Solved State Display */
            <motion.div
              key="solved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2 space-y-2"
            >
              <div className="w-9 h-9 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-4.5 h-4.5 text-brand-green animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-brand-green">恭喜！大自然探秘完成</h4>
                <p className="text-[10px] text-zinc-650 leading-relaxed font-medium px-1">
                  原来一平方米就可以建一个博物馆，你也来加入，让博物馆越来越多吧！
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper feedback toast inside card */}
        {errorMsg && (
          <div className="text-[9px] font-bold text-red-500 leading-tight bg-red-50/50 p-2 rounded-lg border border-red-100 flex items-start gap-1">
            <span className="shrink-0 mt-0.5">💡</span>
            <span>{errorMsg}</span>
          </div>
        )}

      </div>

    </div>
  );
}
