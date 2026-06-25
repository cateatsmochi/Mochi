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
        
        {/* Display the uploaded 1m.png image representing the micro-museum / 小小生境空间 */}
        <img 
          src="/images/1m.png" 
          alt="小小生境空间" 
          className="w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />

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
