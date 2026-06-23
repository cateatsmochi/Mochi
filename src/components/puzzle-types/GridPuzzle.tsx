import { useState, useEffect } from 'react';
import { playWaterPlop, playSuccessChime } from '../../utils/audio';

interface GridPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

export default function GridPuzzle({ onSolved, isSolved }: GridPuzzleProps) {
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState<string>('根据五个实景鱼卡卡夹对应的咬合对称律，推测出第5组卡夹 [ ? ] 对应的平衡对称因子。');
  const options = [3, 5, 7, 9, 11, 15];

  const handleOptionClick = (num: number) => {
    if (isSolved) return;
    playWaterPlop();
    setSelectedNum(num);

    if (num === 7) {
      playSuccessChime();
      onSolved();
      setActiveMessage();
      setAlertMsg('🎉 密码契合！终极常数：【7】。卡槽完全卡定。实体展池的鱼竿道具灯亮起。物理平衡重构！完成了人人探险家的终极核验。');
    } else {
      setAlertMsg(`❌ 夹片常数 [ ${num} ] 未咬合：平衡秤偏向一方，卡槽阻锁无法打开，请参照两端对称对角差再次推算！`);
    }
  };

  const setActiveMessage = () => {};

  // SVG traditional grille generator (Screen style representation of Screenshot 1)
  const drawGrillePattern = (rows: number, cols: number, color = "#3B8EAC") => {
    const squares = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * 16;
        const y = r * 16;
        squares.push(
          <g key={`${r}-${c}`} transform={`translate(${x}, ${y})`}>
            {/* outer cell */}
            <rect x="1" y="1" width="14" height="14" fill="none" stroke={color} strokeWidth="1" />
            {/* inner diagonal lattice crossings */}
            <line x1="1" y1="1" x2="15" y2="15" stroke={color} strokeWidth="0.5" strokeDasharray="1" opacity="0.6" />
            <line x1="15" y1="1" x2="1" y2="15" stroke={color} strokeWidth="0.5" strokeDasharray="1" opacity="0.6" />
            <circle cx="8" cy="8" r="1.5" fill="none" stroke={color} strokeWidth="0.5" />
          </g>
        );
      }
    }
    const width = cols * 16;
    const height = rows * 16;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto rounded border border-brand-teal/30 p-0.5 bg-brand-cream/40">
        {squares}
      </svg>
    );
  };

  return (
    <div className="bg-brand-paper rounded-[32px] border-3 border-brand-teal/20 p-5 shadow-sm space-y-5">
      <div className="text-center">
        <span className="text-[10px] bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider border border-brand-green/20">
          实景鱼类夹片卡槽连通平衡阵 / CLIP COMBINATORICS
        </span>
      </div>

      {/* Grid displays reproducing Screenshot 1 beautifully */}
      <div className="space-y-3 bg-brand-cream/60 p-4 rounded-2xl border border-brand-teal/15 max-h-[300px] overflow-y-auto relative">
        
        {/* Grille Item 1 */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-teal/10">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-dark/60 font-mono">夹卡一 / 淀山湖草鱼卡</span>
            <span className="text-xs font-bold text-brand-dark">4列×3排 实物重力感应</span>
          </div>
          <div className="flex items-center gap-4">
            {drawGrillePattern(3, 4)}
            <span className="text-lg font-mono font-black text-brand-teal w-6 text-right">3</span>
          </div>
        </div>

        {/* Grille Item 2 */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-teal/10">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-dark/60 font-mono">夹卡二 / 苏州河九刺鱼卡</span>
            <span className="text-xs font-bold text-brand-dark">4列×3排 无线传感咬合</span>
          </div>
          <div className="flex items-center gap-4">
            {drawGrillePattern(3, 4, "#4A957E")}
            <span className="text-lg font-mono font-black text-brand-green w-6 text-right">19</span>
          </div>
        </div>

        {/* Grille Item 3 */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-teal/10">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-dark/60 font-mono">夹卡三 / 滩涂松江鲈卡</span>
            <span className="text-xs font-bold text-brand-dark">5列×3排 密目重力卡槽</span>
          </div>
          <div className="flex items-center gap-4">
            {drawGrillePattern(3, 5)}
            <span className="text-lg font-mono font-black text-brand-teal w-6 text-right">13</span>
          </div>
        </div>

        {/* Grille Item 4 */}
        <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-brand-teal/10">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-dark/60 font-mono">夹卡四 / 黄浦江胭脂鱼卡</span>
            <span className="text-xs font-bold text-brand-dark">5列×3排 宽轨引流夹板</span>
          </div>
          <div className="flex items-center gap-4">
            {drawGrillePattern(3, 5, "#4A957E")}
            <span className="text-lg font-mono font-black text-brand-green w-6 text-right">15</span>
          </div>
        </div>

        {/* Grille Item 5 (The Puzzle) */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border-2 border-dashed border-brand-teal/40 animate-pulse">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-brand-teal font-mono font-bold">夹卡五 / 待配对暗色唇鱼卡【目标】</span>
            <span className="text-xs font-bold text-brand-dark">4列×3排 对称重构格</span>
          </div>
          <div className="flex items-center gap-4">
            {drawGrillePattern(3, 4, "#083E65")}
            <span className="text-xl font-mono font-black text-rose-500 w-6 text-right animate-bounce">?</span>
          </div>
        </div>

        {/* Small white checkmark in the bottom right corner when solved, without black overlay/blur so it does not block the screen assets */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <svg className="w-10 h-10 text-brand-teal drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Answer selection row */}
      <div className="space-y-2.5">
        <label className="block text-[10px] uppercase font-mono tracking-wider text-brand-dark/60 text-center font-black">
          点击选取实物夹槽对应的平衡匹配因子
        </label>
        
        <div className="grid grid-cols-6 gap-2">
          {options.map((num) => {
            const isChosen = selectedNum === num;
            const isCorrectAndSolved = isSolved && num === 7;
            
            let btnClass = "border-brand-teal/20 text-brand-dark bg-white hover:bg-brand-cream/60";
            if (isCorrectAndSolved) {
              btnClass = "bg-brand-teal text-white border-brand-teal";
            } else if (isChosen) {
              btnClass = num === 7 ? "bg-brand-teal text-white border-brand-teal" : "bg-rose-50 text-rose-700 border-rose-300";
            }

            return (
              <button
                key={num}
                onClick={() => handleOptionClick(num)}
                disabled={isSolved}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${btnClass}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs and hint section */}
      <div className="bg-brand-cream/80 border-2 border-brand-teal/15 rounded-2xl p-4 min-h-[60px] text-left">
        <div className="text-[10px] uppercase tracking-widest text-brand-dark/60 mb-1 font-mono font-bold">
          卡槽咬合自检台 / BALANCER INPUT
        </div>
        <p className="text-xs text-brand-dark leading-relaxed italic font-medium">「 {alertMsg} 」</p>
      </div>
    </div>
  );
}
