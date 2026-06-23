import { useState, useEffect, useRef, MouseEvent, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, HardHat, Sparkles } from 'lucide-react';

interface DiversityPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

interface Point {
  x: number;
  y: number;
}

export default function DiversityPuzzle({ onSolved, isSolved }: DiversityPuzzleProps) {
  // Real physical exhibit spec: Dishui Lake is 24 species
  const [dishuiCount, setDishuiCount] = useState(0); 

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);
  const [circularityScore, setCircularityScore] = useState<number | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [isDrawnSuccessfully, setIsDrawnSuccessfully] = useState(false);

  // Auto-solve when drawn successfully
  useEffect(() => {
    if (isDrawnSuccessfully) {
      onSolved();
    }
  }, [isDrawnSuccessfully, onSolved]);

  // Handle baseline clear / reset
  const handleReset = () => {
    setIsDrawnSuccessfully(false);
    setCircularityScore(null);
    setDrawPoints([]);
    setDrawError(null);
    setDishuiCount(0);
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBlueprintGuide(ctx, canvas.width, canvas.height);
      }
    }
  };

  // Redraw guide circle template
  const drawBlueprintGuide = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#0891b2'; // slate cyan grid line
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    // Central target guide circular track
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.35, 0, Math.PI * 2);
    ctx.stroke();

    // Central circular island (滴水湖中央标志性圆岛)
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 145, 178, 0.08)';
    ctx.fill();
    ctx.stroke();

    // Crosshairs lines
    ctx.strokeStyle = 'rgba(8, 145, 178, 0.15)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2, h - 10);
    ctx.moveTo(10, h / 2);
    ctx.lineTo(w - 10, h / 2);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dashed lines
  };

  // Initialize Canvas layout and scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = 200 * dpr;
      canvas.height = 200 * dpr;
      canvas.style.width = '200px';
      canvas.style.height = '200px';

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        drawBlueprintGuide(ctx, 200, 200);
      }
    }
  }, []);

  // Update Dishui species dynamically when successful
  useEffect(() => {
    if (isDrawnSuccessfully) {
      setDishuiCount(24);
    } else {
      setDishuiCount(0);
    }
  }, [isDrawnSuccessfully]);

  // Coordinates retrieval
  const getCoordinates = (e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStartDraw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (isDrawnSuccessfully) return;
    e.preventDefault();
    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;

    setIsDrawing(true);
    setDrawPoints([coords]);
    setDrawError(null);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      // Clear paths but keep grid guide template
      ctx.clearRect(0, 0, 200, 200);
      drawBlueprintGuide(ctx, 200, 200);
      
      // Start writing active blueprint line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const handleDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isDrawnSuccessfully) return;
    e.preventDefault();
    const coords = getCoordinates(e.nativeEvent);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }

    setDrawPoints(prev => [...prev, coords]);
  };

  const handleStopDraw = () => {
    if (!isDrawing || isDrawnSuccessfully) return;
    setIsDrawing(false);

    if (drawPoints.length < 15) {
      setDrawError('笔迹太短，请一笔画一个完整的圆！');
      return;
    }

    // --- CIRCULARITY / DETECTING ROUNDNESS ---
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    drawPoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 35 || height < 35) {
      setDrawError('开辟面积太小，请画一个大大的圆形湖！');
      return;
    }

    const len = drawPoints.length;
    let sumX = 0, sumY = 0;
    drawPoints.forEach(p => {
      sumX += p.x;
      sumY += p.y;
    });
    const cx = sumX / len;
    const cy = sumY / len;

    let totalDist = 0;
    const distances = drawPoints.map(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDist += dist;
      return dist;
    });
    const avgRadius = totalDist / len;

    let sumSquaredDiff = 0;
    distances.forEach(d => {
      const diff = d - avgRadius;
      sumSquaredDiff += diff * diff;
    });
    const variance = sumSquaredDiff / len;
    const stdDev = Math.sqrt(variance);

    // Calculate circular roundness
    let roundness = Math.max(0, 1 - (stdDev / avgRadius));
    const aspectCorrection = Math.min(width, height) / Math.max(width, height);
    let finalScore = roundness * 0.7 + aspectCorrection * 0.3;

    // Angular check to prevent single curves passing
    const segments = new Array(8).fill(false);
    drawPoints.forEach(p => {
      const angle = Math.atan2(p.y - cy, p.x - cx);
      const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
      const segmentIndex = Math.floor((normalizedAngle / (Math.PI * 2)) * 8) % 8;
      segments[segmentIndex] = true;
    });
    const completedSegmentsCount = segments.filter(Boolean).length;
    
    if (completedSegmentsCount < 6) {
      finalScore *= (completedSegmentsCount / 8);
    }

    setCircularityScore(finalScore);

    if (finalScore >= 0.70) {
      setIsDrawnSuccessfully(true);
      setDrawError(null);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 200, 200);
        drawBlueprintGuide(ctx, 200, 200);
        
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, avgRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx - avgRadius/3, cy - avgRadius/3, avgRadius/6, avgRadius/12, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else {
      setDrawError(`圆度评估：${Math.round(finalScore * 100)}%。还不够圆哦！请沿着虚线轮廓画一个闭合的正圆。`);
    }
  };

  return (
    <div className="space-y-4 py-1.5 animate-fade-in text-brand-dark max-w-lg mx-auto">
      
      <div className="bg-brand-cream border border-brand-teal/15 rounded-2xl p-4 flex flex-col items-center space-y-4 shadow-sm relative">
        <div className="w-full flex justify-end">
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-brand-teal/5 border border-brand-teal/15 transition active:scale-95 text-brand-dark/70 hover:text-brand-teal"
            title="重设工程"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>

        {/* DRAWING BOX */}
        <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-2 shadow-md w-[216px] h-[216px] touch-none flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDraw}
            onMouseMove={handleDrawing}
            onMouseUp={handleStopDraw}
            onMouseLeave={handleStopDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleDrawing}
            onTouchEnd={handleStopDraw}
            className={`bg-transparent cursor-crosshair block transition-opacity duration-300 ${
              isDrawnSuccessfully ? 'opacity-95' : 'opacity-100'
            }`}
          />

          {/* Clear success center text if drawn OK */}
          {isDrawnSuccessfully && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3 text-center bg-teal-950/30 backdrop-blur-3xs">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900/95 border border-emerald-500/50 p-4 rounded-xl shadow-lg max-w-[180px]"
              >
                <p className="text-xs font-extrabold text-emerald-400 font-sans tracking-wide">
                  恭喜你造出了圆圆的滴水湖
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Gauge Feedback and Error reporting */}
        <div className="w-full text-center min-h-[24px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {drawError ? (
              <motion.span 
                key="err"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-semibold text-rose-500 leading-snug text-balance"
              >
                ⚠️ {drawError}
              </motion.span>
            ) : isDrawnSuccessfully ? (
              <motion.span 
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>恭喜你造出了圆圆的滴水湖</span>
              </motion.span>
            ) : (
              <span className="text-[11px] text-brand-dark/70 font-medium select-none">
                指尖按压圆规区一笔连成，还原规则人造滴水湖 (需大于70%)
              </span>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
