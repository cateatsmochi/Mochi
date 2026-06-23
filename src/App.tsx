import { useState } from 'react';
import { puzzles, type Puzzle } from './types';
import PuzzleCard from './components/PuzzleCard';
import GameInterface from './components/GameInterface';
import JigsawPuzzle from './components/puzzle-types/JigsawPuzzle';
import SeekPuzzle from './components/puzzle-types/SeekPuzzle';
import DiversityPuzzle from './components/puzzle-types/DiversityPuzzle';
import EcologyPuzzle from './components/puzzle-types/EcologyPuzzle';
import MapPuzzle from './components/puzzle-types/MapPuzzle';
import GridPuzzle from './components/puzzle-types/GridPuzzle';
import { playWaterPlop, playSuccessChime, playWaveSplash } from './utils/audio';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'victory'>('welcome');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [isCurrentSolved, setIsCurrentSolved] = useState(false);
  const [solvedIndices, setSolvedIndices] = useState<number[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Starts the interactive game
  const startGame = () => {
    playWaveSplash();
    setGameState('playing');
  };

  // Safe solved updater that keeps a record list of successfully completed indices
  const handleSetIsCurrentSolved = (val: boolean) => {
    setIsCurrentSolved(val);
    if (val && !solvedIndices.includes(currentPuzzleIndex)) {
      setSolvedIndices(prev => [...prev, currentPuzzleIndex]);
    }
  };

  // Handles moving to next level
  const handleNext = () => {
    // Add completed specimen to inventory
    const specimenName = currentPuzzle.speciesName.split(' ')[0];
    if (!inventory.includes(specimenName)) {
      setInventory(prev => [...prev, specimenName]);
    }

    if (currentPuzzleIndex < puzzles.length - 1) {
      const nextIdx = currentPuzzleIndex + 1;
      setCurrentPuzzleIndex(nextIdx);
      setIsCurrentSolved(solvedIndices.includes(nextIdx));
    } else {
      playSuccessChime();
      setGameState('victory');
    }
  };

  const handlePrevPage = () => {
    playWaterPlop();
    if (currentPuzzleIndex > 0) {
      const prevIdx = currentPuzzleIndex - 1;
      setCurrentPuzzleIndex(prevIdx);
      setIsCurrentSolved(solvedIndices.includes(prevIdx));
    } else {
      // Go back to welcome page
      setGameState('welcome');
    }
  };

  const handleNextPage = () => {
    // Temporarily disabled requirement during development phase
    handleNext();
  };

  // Restarts game completely
  const resetGame = () => {
    playWaterPlop();
    setCurrentPuzzleIndex(0);
    setIsCurrentSolved(false);
    setSolvedIndices([]);
    setInventory([]);
    setGameState('welcome');
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-display pb-12 flex flex-col items-center relative overflow-x-hidden">
      
      {/* Compact Header Block - hidden on welcome page, redesigned for elegance on other pages */}
      {gameState !== 'welcome' && (
        <div className="w-full bg-brand-dark py-3.5 border-b border-white/5 relative z-20 shadow-xxs">
          <div className="max-w-xl mx-auto px-4 md:px-6 flex justify-between items-center gap-4">
            {/* Elegant branding signature */}
            <div className="flex items-center gap-2.5">
              <img 
                src="/images/mainicon.png" 
                alt="Logo" 
                className="w-7 h-7 object-contain select-none transition-transform hover:rotate-6 duration-300" 
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white tracking-wider uppercase font-display leading-tight">
                  沪鱼万象
                </span>
                <span className="text-[9px] text-blue-200 font-extrabold uppercase font-display tracking-widest mt-0.5">
                  上海鱼类调查
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-xl px-4 md:px-6 relative z-10 mt-1">
        
        {/* 1. WELCOME SCREEN CARD */}
        {gameState === 'welcome' && (
          <div className="mt-8 text-center animate-fade-in relative flex flex-col items-center justify-center gap-10">
            <img 
              src="/images/title.png" 
              alt="寻找深藏在水波下的城市记忆" 
              className="w-full max-w-sm object-contain select-none"
              referrerPolicy="no-referrer"
            />
            
            <button
              onClick={startGame}
              className="w-full max-w-sm py-4 bg-transparent text-neutral-900 hover:text-neutral-700 font-extrabold text-[15px] tracking-widest transition-all active:scale-[0.98] cursor-pointer border-0 outline-none flex items-center justify-center gap-1.5"
            >
              开始我的上海鱼类调查 ❯
            </button>
          </div>
        )}

        {/* 2. ACTIVE GAME CONTAINER */}
        {gameState === 'playing' && (
          <div className="mt-2.5 space-y-2.5 animate-fade-in relative">
            
            {/* Elegant Header Navigation Bar containing previous/next indicators */}
            <div className="relative flex items-center justify-between w-full px-2 py-0.5 select-none">
              {/* Previous page arrow */}
              <button
                onClick={handlePrevPage}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-paper hover:bg-brand-teal hover:text-white text-brand-teal border-2 border-brand-teal/20 transition-all shadow-sm active:scale-90 cursor-pointer"
                title="返回上一页"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Centered progress badge */}
              <div className="text-[10px] font-mono font-black text-brand-dark/60 bg-brand-teal/5 px-3 py-0.5 rounded-full border border-brand-teal/10">
                {currentPuzzleIndex + 1} / {puzzles.length}
              </div>

              {/* Next page arrow */}
              <button
                onClick={handleNextPage}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-paper hover:bg-brand-teal hover:text-white text-brand-teal disabled:text-brand-teal/20 disabled:bg-brand-teal/5 disabled:border-brand-teal/10 disabled:hover:scale-100 transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed cursor-pointer"
                title="进入下一页"
                id="next-page-btn"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Survey Progress / Chapters Tracker Section */}
            <div className="bg-brand-paper border-2 border-brand-teal/20 rounded-xl p-1.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm select-none">📋</span>
                <div className="leading-tight">
                  <div className="text-[10px] text-brand-teal font-sans font-black">
                    {currentPuzzle.title.split('：')[0]}
                  </div>
                  <p className="text-[8px] text-brand-dark/60 font-semibold leading-none mt-0.5">
                    已完成：{solvedIndices.length} / 6
                  </p>
                </div>
              </div>

              {/* Chapter Progress Badges */}
              <div className="flex gap-1 py-0.5 justify-end">
                {['江湖之境', '生存之战', '寻鱼之旅'].map((chapterName, index) => {
                  const completed = index === 0
                    ? (solvedIndices.includes(0) && solvedIndices.includes(1) && solvedIndices.includes(2))
                    : index === 1
                      ? solvedIndices.includes(3)
                      : (solvedIndices.includes(4) && solvedIndices.includes(5));
                  return (
                    <span
                      key={index}
                      className={`text-[8px] px-1.5 py-0.5 rounded border whitespace-nowrap font-bold transition-all ${
                        completed
                          ? 'bg-brand-teal text-white border-brand-teal shadow-2xs'
                          : 'bg-brand-cream/30 text-brand-dark/40 border-brand-teal/10'
                      }`}
                    >
                      {chapterName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* General Puzzle Description and Taxonomy Card */}
            <PuzzleCard puzzle={currentPuzzle} isCurrentSolved={isCurrentSolved} />

            {/* Custom Interactive game boards injected specifically per puzzle ID */}
            <div className="bg-brand-paper p-2.5 rounded-2xl border border-brand-teal/15 shadow-sm">
              {currentPuzzle.id === 1 && (
                <JigsawPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
              {currentPuzzle.id === 2 && (
                <SeekPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
              {currentPuzzle.id === 3 && (
                <DiversityPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
              {currentPuzzle.id === 4 && (
                <EcologyPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
              {currentPuzzle.id === 5 && (
                <MapPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
              {currentPuzzle.id === 6 && (
                <GridPuzzle 
                  onSolved={() => handleSetIsCurrentSolved(true)} 
                  isSolved={isCurrentSolved} 
                />
              )}
            </div>

            {/* Decrypting controller inputs panel */}
            <GameInterface
              puzzle={currentPuzzle}
              onCorrect={handleNext}
              isCurrentSolved={isCurrentSolved}
              setIsCurrentSolved={handleSetIsCurrentSolved}
            />
          </div>
        )}

        {/* 3. VICTORY AND IMPACT SUMMARY */}
        {gameState === 'victory' && (
          <div className="mt-4 bg-brand-paper rounded-3xl border border-brand-teal/15 p-6 md:p-8 shadow-sm text-center space-y-6 animate-fade-in relative overflow-hidden">
            
            {/* Seal of honor visual */}
            <div className="relative z-10 w-20 h-20 bg-brand-dark text-white rounded-full mx-auto flex items-center justify-center text-4xl shadow-md border-4 border-brand-cream animate-bounce">
              🐳
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] tracking-widest bg-brand-teal/10 text-brand-teal border-2 border-brand-teal/20 px-3 py-1.5 rounded-full font-mono font-bold">
                生态探索任务圆满达成！
              </span>
              <h2 className="text-3xl font-bold text-brand-dark tracking-tight">水域复苏守护者</h2>
              <p className="text-xs text-brand-dark/70 italic font-mono">授给致力于保护河道多样化的绿色倡导先锋</p>
            </div>

            {/* Scientific progress stats card */}
            <div className="bg-brand-cream p-5 rounded-3xl border-2 border-brand-teal/25 text-left space-y-4 shadow-sm select-text relative z-10">
              <span className="text-[9px] uppercase tracking-wider text-brand-green font-mono font-bold">
                您的解谜与修复贡献 / RECLAMATION REWARDS
              </span>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="border-r border-brand-teal/20 py-1">
                  <div className="text-2xl font-black text-brand-dark">1,200 尾</div>
                  <div className="text-[9px] text-brand-dark/70">保护区鱼苗顺利放归</div>
                </div>
                <div className="py-1">
                  <div className="text-2xl font-black text-brand-dark">100%</div>
                  <div className="text-[9px] text-brand-dark/70">弄堂溪流生境复原率</div>
                </div>
              </div>

              <p className="text-xs text-brand-dark/80 leading-relaxed border-t border-brand-teal/15 pt-3.5">
                感谢你成功复原了松江鲈河道图，抚平了弄堂溪流中的各种废弃水泥底面与外来垃圾，并在康平路105号生境站建立安全走廊！你的每一个点击都在提醒我们：<b>河流不是冷冰冰的行洪通道，而是生命繁衍的生息廊道。</b>
              </p>
            </div>

            <div className="space-y-3 relative z-10">
              <button
                onClick={resetGame}
                className="w-full py-4 bg-brand-teal hover:bg-brand-dark text-white rounded-2xl font-bold text-xs tracking-widest transition-all shadow-md active:translate-y-0.5"
              >
                重温百川解谜之旅 ↺
              </button>
              
              <p className="text-[10px] text-brand-dark/50 font-mono italic">
                上海市水生生态网络保护小组 · 启迪明天 (2026)
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
