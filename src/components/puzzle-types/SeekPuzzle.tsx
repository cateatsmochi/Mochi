import React, { useState, useEffect } from 'react';
import { playWaterPlop, playSuccessChime, playWaveSplash } from '../../utils/audio';

interface SeekPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

interface SeekTask {
  id: string;
  question: string;
  hint: string;
  correctAnswer: string; // The ID of the correct fish
  options: { id: string; name: string; icon: string; label: string }[];
}

export default function SeekPuzzle({ onSolved, isSolved }: SeekPuzzleProps) {
  // Store the user chosen answer for each of the 4 tasks
  const [answers, setAnswers] = useState<Record<string, string>>({
    task1: '',
    task2: '',
    task3: '',
    task4: '',
  });

  const tasks: SeekTask[] = [
    {
      id: 'task1',
      question: '🔍 谁是【体型最大】的“长江鱼王”？',
      hint: '提示：体长可达数米，背部长有五行坚硬的刺状骨板，在深海及长江口洄游。',
      correctAnswer: 'sturgeon',
      options: [
        { id: 'crucian', name: '鲫鱼', icon: '🎏', label: '鲫鱼' },
        { id: 'sturgeon', name: '中华鲟', icon: '🐋', label: '中华鲟' },
        { id: 'grass_carp', name: '草鱼', icon: '🐟', label: '草鱼' },
      ]
    },
    {
      id: 'task2',
      question: '🔍 谁是【能在泥滩上蹦跳】最特别的奇鱼？',
      hint: '提示：拥有一双鼓起的突出眼球，常出现在九段沙等沿海滩涂、浅滩沙地。',
      correctAnswer: 'mudskipper',
      options: [
        { id: 'loach', name: '大鳞泥鳅', icon: '🐛', label: '大鳞泥鳅' },
        { id: 'goby', name: '鰕虎鱼', icon: '🐠', label: '鰕虎鱼' },
        { id: 'mudskipper', name: '大弹涂鱼', icon: '🦎', label: '大弹涂鱼' },
      ]
    },
    {
      id: 'task3',
      question: '🔍 寻找【必须与河蚬等贝壳共生】的彩虹小鱼？',
      hint: '提示：身躯细扁，在阳光下呈现斑斓的青紫色，常出没于贝类砂砾间。',
      correctAnswer: 'bitterling',
      options: [
        { id: 'silver', name: '新银鱼', icon: '🐟', label: '新银鱼' },
        { id: 'bitterling', name: '高体鳑鲏', icon: '🐠', label: '高体鳑鲏' },
        { id: 'anchovy', name: '刀鲚', icon: '🦈', label: '刀鲚' },
      ]
    },
    {
      id: 'task4',
      question: '🔍 寻找无鳞、长着四对长须的“贴地飞行鱼”？',
      hint: '提示：嘴部朝下，在潮湿幽暗的江底乱石缝中，靠敏锐的触觉贴身滑行。',
      correctAnswer: 'catfish',
      options: [
        { id: 'catfish_yellow', name: '黄颡鱼', icon: '🐡', label: '黄颡鱼' },
        { id: 'catfish', name: '长吻鮠', icon: '🐟', label: '长吻鮠' },
        { id: 'snakehead', name: '乌鳢', icon: '🐊', label: '乌鳢' },
      ]
    }
  ];

  // If already solved (from localstorage or parent state), prefill correct answers
  useEffect(() => {
    if (isSolved) {
      setAnswers({
        task1: 'sturgeon',
        task2: 'mudskipper',
        task3: 'bitterling',
        task4: 'catfish',
      });
    }
  }, [isSolved]);

  const handleSelectAnswer = (taskId: string, fishId: string, correctAnswer: string) => {
    if (isSolved) return; // Disallow changes once solved
    
    playWaterPlop();
    const updatedAnswers = { ...answers, [taskId]: fishId };
    setAnswers(updatedAnswers);

    // Check if everything is correct
    const allCorrect = tasks.every(
      (task) => updatedAnswers[task.id] === task.correctAnswer
    );

    if (allCorrect) {
      playSuccessChime();
      playWaveSplash();
      onSolved();
    }
  };

  // Progress metrics calculation
  const correctCount = tasks.filter((t) => answers[t.id] === t.correctAnswer).length;

  return (
    <div className="space-y-4">
      {/* Interactive Questionnaire Tasks */}
      <div className="space-y-3.5 relative">
        {tasks.map((task, index) => {
          const isCorrect = answers[task.id] === task.correctAnswer;
          const userSelection = answers[task.id];
          
          return (
            <div 
              key={task.id} 
              id={`seek-card-${task.id}`}
              className={`p-3.5 rounded-2xl border-2 transition-all duration-300 ${
                isCorrect 
                  ? 'bg-emerald-50/70 border-emerald-500/30' 
                  : userSelection && !isCorrect 
                    ? 'bg-rose-50/70 border-rose-500/20' 
                    : 'bg-white border-brand-teal/10 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5 mb-1.5">
                <div>
                  <h4 className="text-[13px] font-black text-brand-dark leading-snug">
                    {task.question}
                  </h4>
                  <p className="text-[11px] text-brand-dark/60 mt-0.5 font-medium">
                    {task.hint}
                  </p>
                </div>
                {isCorrect && (
                  <span className="bg-emerald-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold uppercase select-none shrink-0">
                    正确 ✓
                  </span>
                )}
                {userSelection && !isCorrect && (
                  <span className="bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold uppercase select-none shrink-0 animate-pulse">
                    需再观察 ✗
                  </span>
                )}
              </div>

              {/* Grid of options of at least 44px height for touch safety, laid out in a single row (3-columns) without icons */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {task.options.map((opt) => {
                  const isSelected = userSelection === opt.id;
                  const buttonHeightClass = "min-h-[44px]";
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSolved}
                      onClick={() => handleSelectAnswer(task.id, opt.id, task.correctAnswer)}
                      className={`px-2 py-2 rounded-xl text-center border flex items-center justify-center transition-all ${buttonHeightClass} ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm font-black'
                            : 'bg-rose-500 border-rose-500 text-white shadow-sm font-black'
                          : 'bg-brand-cream/30 text-brand-dark border-brand-teal/10 hover:bg-brand-cream/80 active:scale-95 font-medium'
                      } ${isSolved ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="text-xs leading-tight select-none truncate">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Small white checkmark in the bottom right corner of Puzzle's bounding box when solved */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <svg className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Success Summary Frame */}
      {isSolved && (
        <div className="bg-emerald-50 border-2 border-emerald-500/20 rounded-2xl p-4 space-y-2 select-text animate-fade-in">
          <p className="text-xs font-black text-emerald-800 leading-snug flex items-center gap-1">
            🌸 恭喜！您已成功解答实体展区的四大明星申鱼：
          </p>
          <div className="text-[11px] text-brand-dark/80 leading-relaxed pl-1.5 space-y-1">
            <p>• <strong>中华鲟 (🐋长江鱼王)</strong> ：身姿挺拔，是长江流域生物链顶端的尊贵脊梁。</p>
            <p>• <strong>弹涂鱼 (🦎泥滩奇兵)</strong> ：能跑会跳，是东滩潮间带生命的灵动代表。</p>
            <p>• <strong>高体鳑鲏 (🐠贝鱼相依)</strong> ：雌鱼引卵寄于河蚬体内，堪称生命演化最美的共生画卷。</p>
            <p>• <strong>长吻鮠 (🐟贴地穿行)</strong> ：口部下位四须穿波，是江底乱石沙底的奇景隐士。</p>
          </div>
        </div>
      )}
    </div>
  );
}
