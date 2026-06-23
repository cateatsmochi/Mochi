import { useState, useEffect } from 'react';
import { type Puzzle } from '../types';
import { playWaterPlop, playWaveSplash, playSuccessChime } from '../utils/audio';

interface GameInterfaceProps {
  puzzle: Puzzle;
  onCorrect: () => void;
  isCurrentSolved: boolean;
  setIsCurrentSolved: (val: boolean) => void;
}

export default function GameInterface({
  puzzle,
  onCorrect,
  isCurrentSolved,
  setIsCurrentSolved
}: GameInterfaceProps) {
  // Segmented input state
  const [addressPart1, setAddressPart1] = useState('');
  const [addressPart2, setAddressPart2] = useState('');
  
  // Single input state for others
  const [singleAnswer, setSingleAnswer] = useState('');
  
  // Hint logic
  const [showHint, setShowHint] = useState(false);
  const [hintTier, setHintTier] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  // Reset inputs when puzzle changes
  useEffect(() => {
    setAddressPart1('');
    setAddressPart2('');
    setSingleAnswer('');
    setShowHint(false);
    setHintTier(0);
    setFeedback(null);
  }, [puzzle]);

  const triggerHint = () => {
    playWaterPlop();
    setShowHint(true);
    if (hintTier < puzzle.hints.length) {
      setHintTier(prev => prev + 1);
    }
  };

  const checkAnswer = () => {
    let finalInput = '';

    if (puzzle.type === 'jigsaw') {
      finalInput = `${addressPart1.trim()}路${addressPart2.trim()}号`;
    } else {
      finalInput = singleAnswer.trim();
    }

    const cleanInput = finalInput.toLowerCase().replace(/\s+/g, '');
    const cleanCorrect = puzzle.correctAnswer.toLowerCase().replace(/\s+/g, '');

    if (cleanInput === cleanCorrect) {
      playSuccessChime();
      setIsCurrentSolved(true);
      setFeedback({
        text: `🎉 正确！答案 [ ${puzzle.correctAnswer} ] 匹配成功。已完成这一关卡的生态解谜！`,
        isError: false
      });
    } else {
      playWaveSplash();
      setFeedback({
        text: '❌ 答案不完全吻合。仔细查看画面，或点按【获得提示】寻找生境微光！',
        isError: true
      });
    }
  };

  const handleNextLevel = () => {
    playWaterPlop();
    onCorrect();
  };

  return (
    <div className="bg-brand-paper rounded-2xl border border-brand-teal/15 p-4 shadow-sm space-y-4">
      
      {/* Answers panel custom styled depending on game stages */}
      <div className="space-y-3.5">
        {/* Unified instructions & success headers */}
        <div className="bg-brand-cream/40 p-4 rounded-xl border border-brand-teal/10 text-center">
          {isCurrentSolved ? (
            <div className="animate-fade-in py-1">
              <p className="text-sm font-bold text-emerald-800 leading-relaxed md:px-4">
                {puzzle.id === 1 ? '恭喜！生态河网重建完成' :
                 puzzle.id === 2 ? '恭喜！四大明星申鱼全部寻齐' :
                 puzzle.id === 3 ? '恭喜你造出了圆圆的滴水湖' :
                 puzzle.id === 4 ? '恭喜！水生家园净化完成' :
                 puzzle.id === 5 ? '恭喜！生态放流走廊连通成功' :
                 '恭喜！水流格栅密码核验完成'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-[10px] text-brand-dark/70 uppercase tracking-wider font-mono block font-bold">
                任务指引
              </span>
              <p className="text-xs font-medium text-brand-dark/80 leading-relaxed md:px-4 text-balance">
                {puzzle.id === 1 ? '点击任意两个方块可以使它们互换，还原“上海水系图”' :
                 puzzle.id === 2 ? '依据现场「江湖之境」实景展墙上的特有本土水族分布，在下方题目中答对全部4个问题' :
                 puzzle.id === 3 ? '请在黑色制图板中亲手画一个规则弧度的正圆，进行蓄水开创' :
                 puzzle.id === 4 ? '点击清除水体中的有害异物，净化环境以获取气泡信码' :
                 puzzle.id === 5 ? '移动放流队避开路障，将中华鱼苗安全送达目的地以获取信令密码' :
                 '根据前4个卡槽对应的双对角对称律，推选并选取第5组匹配的常数数字'}
              </p>
            </div>
          )}
        </div>

        {/* Answer input fields, only visible before solving non-jigsaw and non-seek levels */}
        {!isCurrentSolved && puzzle.type !== 'jigsaw' && puzzle.type !== 'seek' && puzzle.type !== 'diversity' && (
          <div className="bg-brand-cream/40 p-4 rounded-xl border border-brand-teal/10 space-y-2.5 animate-fade-in">
            <span className="text-[10px] text-brand-dark/70 uppercase tracking-wider font-mono block text-center font-bold">
              {puzzle.type === 'ecology' ? '输入查获的气泡复苏码' : puzzle.type === 'map' ? '输入捕获的追踪芯片码' : '输入计算得出的格栅密码值'}
            </span>
            
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-brand-dark">答案字串：</span>
              <input
                type="text"
                value={singleAnswer}
                onChange={(e) => setSingleAnswer(e.target.value)}
                placeholder={`${puzzle.correctAnswer} (测试提示)`}
                className="w-36 text-center p-2 border border-brand-teal/15 rounded-lg focus:outline-none focus:border-brand-teal bg-white text-xs font-bold tracking-widest text-brand-dark placeholder:text-brand-dark/30 shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* Feedback alert panel */}
        {feedback && (
          <div className={`p-3 rounded-lg text-xs leading-relaxed border transition-all ${
            feedback.isError 
              ? 'bg-rose-50/80 text-rose-800 border-rose-150' 
              : 'bg-emerald-50/80 text-emerald-800 border-emerald-150'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* Primary submit and hint button controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={triggerHint}
            className="p-2.5 border border-brand-teal/15 rounded-xl text-brand-teal bg-brand-cream/50 hover:bg-brand-teal/10 font-semibold text-xs transition active:scale-[0.98]"
          >
            获得提示 ({hintTier}/{puzzle.hints.length})
          </button>
          
          {isCurrentSolved ? (
            <button
               onClick={handleNextLevel}
               className="p-2.5 bg-brand-teal hover:bg-brand-dark text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition active:translate-y-0.5"
            >
              继续前往下一章 ▶
            </button>
          ) : puzzle.type === 'jigsaw' ? (
            <button
              disabled
              className="p-2.5 bg-brand-dark/5 text-brand-dark/30 border border-brand-teal/10 rounded-xl font-bold text-xs cursor-not-allowed select-none"
            >
              等待地图重建完毕
            </button>
          ) : puzzle.type === 'seek' ? (
            <button
              disabled
              className="p-2.5 bg-brand-dark/5 text-brand-dark/30 border border-brand-teal/10 rounded-xl font-bold text-xs cursor-not-allowed select-none"
            >
              请答对下方所有问题
            </button>
          ) : puzzle.type === 'diversity' ? (
            <button
              disabled
              className="p-2.5 bg-brand-dark/5 text-brand-dark/30 border border-brand-teal/10 rounded-xl font-bold text-xs cursor-not-allowed select-none"
            >
              请在制图板中绘制一个圆
            </button>
          ) : (
            <button
              onClick={checkAnswer}
              className="p-2.5 bg-brand-dark text-white rounded-xl font-bold text-xs hover:bg-brand-dark/95 transition active:scale-[0.98]"
            >
              提交答案验证
            </button>
          )}
        </div>
      </div>

      {/* Elegant collapsible progressive hint board */}
      {showHint && (
        <div className="border border-brand-teal/15 mt-2 bg-brand-cream/45 p-4 rounded-xl">
          <ul className="space-y-2 select-text">
            {puzzle.hints.slice(0, hintTier).map((hint, index) => (
              <li key={index} className="text-xs text-brand-dark leading-relaxed flex gap-2">
                <span className="text-brand-green font-mono">✦</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
