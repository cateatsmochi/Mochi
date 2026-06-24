import { useState, useEffect, useRef, MouseEvent, TouchEvent, PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, CheckCircle2, HardHat, Sparkles } from 'lucide-react';

interface DiversityPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
  isDrawnSuccessfully?: boolean;
  setIsDrawnSuccessfully?: (val: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

export const DIVERSITY_STATES = [
  { dishuiCount: 10, naturalCount: 32, description: '生态发育期：人工基底未发育，仅发现少数本土物种' },
  { dishuiCount: 15, naturalCount: 38, description: '生态改善期：外源人工加持，鱼类承载率小幅回升' },
  { dishuiCount: 18, naturalCount: 42, description: '过渡调整期：局部底质治理，生境单一性有所缓解' },
  { dishuiCount: 20, naturalCount: 45, description: '中度修复阶段：岸基多孔石滩铺设，激发种群微循环' },
  { dishuiCount: 24, naturalCount: 47, description: '【实测科学考查数据】规则环状人造湖区 / 自然曲折岸线与泥质潮滩河道' }, // CORRECT
  { dishuiCount: 28, naturalCount: 55, description: '理想全自然网路：仿自然漫滩贯通，生物多样性空前丰沛' }
];

export default function DiversityPuzzle({ 
  onSolved, 
  isSolved,
  isDrawnSuccessfully: externalDrawnSuccessfully,
  setIsDrawnSuccessfully: externalSetDrawnSuccessfully
}: DiversityPuzzleProps) {
  // Free state variables instead of fixed index
  const [dishuiCount, setDishuiCount] = useState<number>(15);
  const [naturalCount, setNaturalCount] = useState<number>(38);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);
  const [circularityScore, setCircularityScore] = useState<number | null>(null);
  const [drawError, setDrawError] = useState<string | null>(null);
  
  // Use local state if external is not provided
  const [localDrawnSuccessfully, setLocalDrawnSuccessfully] = useState(false);
  
  const isDrawnSuccessfully = externalSetDrawnSuccessfully !== undefined ? !!externalDrawnSuccessfully : localDrawnSuccessfully;
  const setIsDrawnSuccessfully = (val: boolean) => {
    if (externalSetDrawnSuccessfully !== undefined) {
      externalSetDrawnSuccessfully(val);
    } else {
      setLocalDrawnSuccessfully(val);
    }
  };

  const isComparisonSolved = isDrawnSuccessfully && dishuiCount === 24 && naturalCount === 47;

  // Auto-solve when BOTH drawn successfully and comparison matches exactly
  useEffect(() => {
    if (isComparisonSolved) {
      onSolved();
    }
  }, [isComparisonSolved, onSolved]);

  // Handle baseline clear / reset
  const handleReset = () => {
    setIsDrawnSuccessfully(false);
    setCircularityScore(null);
    setDrawPoints([]);
    setDrawError(null);
    setDishuiCount(15);
    setNaturalCount(38);
    
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

  // Individual plate dragging state
  const [activeDragSide, setActiveDragSide] = useState<'left' | 'right' | null>(null);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartVal, setDragStartVal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlatePointerDown = (e: PointerEvent<HTMLDivElement>, side: 'left' | 'right') => {
    e.stopPropagation();
    setActiveDragSide(side);
    setDragStartY(e.clientY);
    setDragStartVal(side === 'left' ? dishuiCount : naturalCount);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePlatePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!activeDragSide) return;
    const deltaY = e.clientY - dragStartY;
    // Drag down (positive deltaY) increases the count (making it heavier/sinking down)
    // Drag up (negative deltaY) decreases the count (making it lighter/rising up)
    const change = Math.round(deltaY / 4);
    const newVal = Math.max(0, dragStartVal + change);
    if (activeDragSide === 'left') {
      setDishuiCount(newVal);
    } else {
      setNaturalCount(newVal);
    }
  };

  const handlePlatePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!activeDragSide) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setActiveDragSide(null);
  };

  // Redraw guide circle template (now pure black, no guides)
  const drawBlueprintGuide = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Keep it entirely pure black as requested
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

    if (finalScore >= 0.80) {
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
      setDrawError(`圆度评估：${Math.round(finalScore * 100)}%。还不够圆哦！请在画板上画一个正圆。`);
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
        <div 
          className="relative border border-slate-800 rounded-xl overflow-hidden shadow-md w-[216px] h-[216px] touch-none flex items-center justify-center transition-all duration-500"
          style={{
            backgroundColor: isDrawnSuccessfully ? 'transparent' : '#020617',
            backgroundImage: isDrawnSuccessfully ? 'url(/images/dishuihu.jpg)' : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
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
              isDrawnSuccessfully ? 'opacity-10' : 'opacity-100'
            }`}
          />

          {/* Clear success center text if drawn OK */}
          {isDrawnSuccessfully && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3 text-center bg-transparent">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-brand-paper/20 border border-brand-teal/20 p-3.5 rounded-xl max-w-[180px] backdrop-blur-xs shadow-xs"
              >
                <p className="text-xs font-black text-brand-dark font-sans tracking-wide">
                  滴水湖圆形湖面筑造成功
                </p>
                {circularityScore !== null && (
                  <p className="text-[10.5px] font-black text-brand-green mt-1 font-mono">
                    圆度：{Math.round(circularityScore * 100)}%
                  </p>
                )}
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
                className="text-[11px] font-bold text-teal-700 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>滴水湖落成！圆度评估: {circularityScore !== null ? Math.round(circularityScore * 100) : 80}% (已达标，请用下方天平比对)</span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

      </div>

      {/* Comparison and diversity contrast zone shown after drawing successfully */}
      {isDrawnSuccessfully && (() => {
        // Correct tilt angle matches difference (larger count = heavier right side)
        const angleDegrees = Math.max(-25, Math.min(25, (naturalCount - dishuiCount) * 0.7)); // Tilts realistically
        const angleRad = (angleDegrees * Math.PI) / 180;

        // Dynamic coordinate calculation of beam ends to support realistic hanging ropes
        const leftHookX = 150 - 80 * Math.cos(angleRad);
        const leftHookY = 42 - 80 * Math.sin(angleRad);
        
        const rightHookX = 150 + 80 * Math.cos(angleRad);
        const rightHookY = 42 + 80 * Math.sin(angleRad);

        // Dynamic description helper based on user input
        const getCurrentDesc = () => {
          if (dishuiCount === 24 && naturalCount === 47) {
            return '【实测科学考查数据】规则环状人工湖(24种) 与 自然曲折岸线多级泥质潮滩(47种)的真实普查差值。比对成功！';
          }
          if (dishuiCount <= 0 || naturalCount <= 0) {
            return '数值不合理。请用横梁拖滑或在下方输入合理的正整数进行比对。';
          }
          if (dishuiCount > naturalCount) {
            return `非自然生态：人造底质由于空间及硬化限制，留存种数(${dishuiCount}种)很难超越连通性极佳的古运河(${naturalCount}种)。请重置或调整。`;
          }
          return `模拟演替中：当前将人工规则湖滩设置为 ${dishuiCount} 种，自然漫滩设定为 ${naturalCount} 种。请继续调校至实测的科学数据解密。`;
        };

        return (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/95 border border-brand-teal/20 p-4 rounded-xl space-y-4 shadow-sm text-left animate-fade-in"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-brand-teal/10">
              <Sparkles className="w-4 h-4 text-brand-teal shrink-0 animate-pulse" />
              <span className="text-xs font-black tracking-wider text-brand-dark/80 uppercase">
                生态多样性落差天平
              </span>
            </div>

            {/* Interactive Plate overlays */}
            {(() => {
              const leftInputPercentX = (leftHookX / 300) * 100;
              const leftInputPercentY = ((leftHookY + 23) / 115) * 100;

              const rightInputPercentX = (rightHookX / 300) * 100;
              const rightInputPercentY = ((rightHookY + 23) / 115) * 100;

              return (
                <div 
                  ref={containerRef}
                  className="py-1 px-2 select-none flex flex-col items-center bg-slate-50/80 rounded-2xl border border-slate-100 shadow-inner relative overflow-visible w-full max-w-[280px]"
                  style={{ height: '115px' }}
                >
                  <svg width="100%" height="115" viewBox="0 0 300 115" className="absolute inset-0 w-full h-full overflow-visible select-none pointer-events-none z-0">
                    {/* Scale Base Center Shadow */}
                    <ellipse cx="150" cy="98" rx="55" ry="4" fill="rgba(15,23,42,0.06)" />
                    
                    {/* Column Base Stand */}
                    <polygon points="138,98 162,98 150,90" fill="#334155" />
                    {/* Column Pillar */}
                    <line x1="150" y1="90" x2="150" y2="42" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="150" cy="42" r="4.5" fill="#0f172a" />

                    {/* Rotated Beam */}
                    <g style={{ transform: `rotate(${angleDegrees}deg)`, transformOrigin: '150px 42px', transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                      <line x1="70" y1="42" x2="230" y2="42" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="70" cy="42" r="2.5" fill="#0f172a" />
                      <circle cx="230" cy="42" r="2.5" fill="#0f172a" />
                    </g>

                    {/* Left Plate (🔵 Blue, Artificial Dishui Lake) hanging dynamically */}
                    <g style={{ transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                      {/* Cords hanging from Left Hook */}
                      <line x1={leftHookX} y1={leftHookY} x2={leftHookX - 16} y2={leftHookY + 34} stroke="#64748b" strokeWidth="1" />
                      <line x1={leftHookX} y1={leftHookY} x2={leftHookX + 16} y2={leftHookY + 34} stroke="#64748b" strokeWidth="1" />
                      {/* Plate bottom */}
                      <path d={`M ${leftHookX - 16},${leftHookY + 34} Q ${leftHookX},${leftHookY + 44} ${leftHookX + 16},${leftHookY + 34} Z`} fill="rgba(6,182,212,0.12)" stroke="#0891b2" strokeWidth="1.5" />
                      
                      {/* Text label underneath */}
                      <text x={leftHookX} y={leftHookY + 48} textAnchor="middle" className="text-[7.5px] font-bold fill-cyan-900/60 font-sans tracking-wide">
                        滴水湖(人工)
                      </text>
                    </g>

                    {/* Right Plate (🟢 Green, Natural canal) hanging dynamically */}
                    <g style={{ transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                      {/* Cords hanging from Right Hook */}
                      <line x1={rightHookX} y1={rightHookY} x2={rightHookX - 16} y2={rightHookY + 34} stroke="#64748b" strokeWidth="1" />
                      <line x1={rightHookX} y1={rightHookY} x2={rightHookX + 16} y2={rightHookY + 34} stroke="#64748b" strokeWidth="1" />
                      {/* Plate bottom */}
                      <path d={`M ${rightHookX - 16},${rightHookY + 34} Q ${rightHookX},${rightHookY + 44} ${rightHookX + 16},${rightHookY + 34} Z`} fill="rgba(16,185,129,0.12)" stroke="#059669" strokeWidth="1.5" />
                      
                      {/* Text label underneath */}
                      <text x={rightHookX} y={rightHookY + 48} textAnchor="middle" className="text-[7.5px] font-bold fill-emerald-900/60 font-sans tracking-wide">
                        古运河(天然)
                      </text>
                    </g>
                  </svg>

                  {/* Left Plate Interactive Drag Overlay & Display */}
                  <div
                    onPointerDown={(e) => handlePlatePointerDown(e, 'left')}
                    onPointerMove={handlePlatePointerMove}
                    onPointerUp={handlePlatePointerUp}
                    onPointerCancel={handlePlatePointerUp}
                    style={{
                      position: 'absolute',
                      left: `${leftInputPercentX}%`,
                      top: `${leftInputPercentY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="w-14 h-14 flex items-center justify-center cursor-ns-resize z-20 hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="w-10 text-center py-0.5 bg-white/90 border border-cyan-200 shadow-xs rounded text-[11px] font-mono font-black text-cyan-800 select-none">
                      {dishuiCount}
                    </div>
                  </div>

                  {/* Right Plate Interactive Drag Overlay & Display */}
                  <div
                    onPointerDown={(e) => handlePlatePointerDown(e, 'right')}
                    onPointerMove={handlePlatePointerMove}
                    onPointerUp={handlePlatePointerUp}
                    onPointerCancel={handlePlatePointerUp}
                    style={{
                      position: 'absolute',
                      left: `${rightInputPercentX}%`,
                      top: `${rightInputPercentY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="w-14 h-14 flex items-center justify-center cursor-ns-resize z-20 hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="w-10 text-center py-0.5 bg-white/90 border border-emerald-200 shadow-xs rounded text-[11px] font-mono font-black text-emerald-800 select-none">
                      {naturalCount}
                    </div>
                  </div>

                  {/* Touch Helper hint */}
                  <div className="absolute bottom-1 w-full text-[9.5px] text-teal-700/60 font-medium select-none text-center font-sans">
                    {activeDragSide ? `✍️ 正在拖拽${activeDragSide === 'left' ? '滴水湖' : '古运河'}托盘...` : '💡 可在托盘上上下拖拽改变数值，或在下方区域直接输入/增减精确调整'}
                  </div>
                </div>
              );
            })()}

            {/* Direct Digital Interlock Controls (Replacing 1-6 button phases) */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mx-auto pt-1 pb-1">
              {/* Left Input Box */}
              <div className="flex flex-col space-y-1 text-center bg-cyan-50/40 p-1.5 rounded-lg border border-cyan-100/40">
                <span className="text-[9px] font-black text-cyan-800 tracking-tight">滴水湖鱼类(种)</span>
                <div className="flex items-center justify-center space-x-1.5">
                  <button 
                    type="button"
                    onClick={() => setDishuiCount(prev => Math.max(0, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-cyan-200/50 rounded text-[11px] font-mono font-bold hover:bg-cyan-100/30 text-cyan-900 active:scale-90"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    value={dishuiCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) setDishuiCount(Math.max(0, val));
                    }}
                    className="w-10 text-center py-0.5 bg-white border border-cyan-200 rounded text-xs font-mono font-black text-cyan-900 focus:ring-1 focus:ring-cyan-400 focus:outline-hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => setDishuiCount(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-cyan-200/50 rounded text-[11px] font-mono font-bold hover:bg-cyan-100/30 text-cyan-900 active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Right Input Box */}
              <div className="flex flex-col space-y-1 text-center bg-emerald-50/40 p-1.5 rounded-lg border border-emerald-100/40">
                <span className="text-[9px] font-black text-emerald-800 tracking-tight">古连通运河(种)</span>
                <div className="flex items-center justify-center space-x-1.5">
                  <button 
                    type="button"
                    onClick={() => setNaturalCount(prev => Math.max(0, prev - 1))}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-emerald-200/50 rounded text-[11px] font-mono font-bold hover:bg-emerald-100/30 text-emerald-900 active:scale-90"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    value={naturalCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) setNaturalCount(Math.max(0, val));
                    }}
                    className="w-10 text-center py-0.5 bg-white border border-emerald-200 rounded text-xs font-mono font-black text-emerald-900 focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => setNaturalCount(prev => prev + 1)}
                    className="w-5 h-5 flex items-center justify-center bg-white border border-emerald-200/50 rounded text-[11px] font-mono font-bold hover:bg-emerald-100/30 text-emerald-900 active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {isComparisonSolved && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[11px] font-bold text-emerald-800 text-center flex items-center justify-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>恭喜！真实的实测生态比对数据吻合，第3本生境多样性密码已成功突破激活！</span>
              </div>
            )}
          </motion.div>
        );
      })()}

    </div>
  );
}
