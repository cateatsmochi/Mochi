import { type Puzzle } from '../types';

interface PuzzleCardProps {
  puzzle: Puzzle;
  isCurrentSolved: boolean;
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
  // Extract only the chapter and main title part before the colon (e.g., "第一章 江湖之境")
  const shortTitle = puzzle.title.split('：')[0];

  return (
    <div className="bg-brand-paper rounded-xl border-2 border-brand-teal/20 p-2.5 shadow-sm space-y-1.5">
      <h2 className="text-xs font-bold text-brand-dark tracking-tight leading-none">
        {shortTitle}
      </h2>

      {/* Narrative and Background - Only keep the circled story context */}
      <div className="border-l-2 border-brand-teal pl-2 italic text-[10px] text-brand-dark/90 leading-tight bg-brand-cream/50 py-1 rounded-r">
        「 {puzzle.storyContext} 」
      </div>
    </div>
  );
}
