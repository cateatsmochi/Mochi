import { type Puzzle } from '../types';

interface PuzzleCardProps {
  puzzle: Puzzle;
  isCurrentSolved: boolean;
}

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
  return (
    <div className="border-l-4 border-brand-teal pl-3.5 pr-3 py-3 italic text-xs text-brand-dark/90 leading-relaxed bg-brand-cream/60 rounded-r-xl shadow-xs border-y border-r border-brand-teal/5">
      「 {puzzle.storyContext} 」
    </div>
  );
}
