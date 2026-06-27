import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Undo2, Check, RefreshCw, Eraser, Palette, Waves, HelpCircle, Paintbrush, PaintBucket } from 'lucide-react';

interface SwimmingFish {
  id: string;
  image: HTMLImageElement | null;
  isCustom: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  scale: number;
  wiggleSpeed: number;
  wiggleOffset: number;
  color?: string; // for built-in decorative fish
  type?: 'sturgeon' | 'loach' | 'generic'; // styles for built-in fish
  isOutline?: boolean;
  accentColor?: string;
  entranceProgress?: number;
  splashDone?: boolean;
  glowDuration?: number;
  facingRight?: boolean;
  stayDuration?: number;
  currentScaleX?: number;
  currentRotAngle?: number;
  turnCooldown?: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface AquariumGameProps {
  onRestart: () => void;
}

const BRUSH_COLORS = [
  { hex: '#f43f5e', label: '珊瑚红' },
  { hex: '#eab308', label: '向日葵金' },
  { hex: '#10b981', label: '海草绿' },
  { hex: '#06b6d4', label: '荧光青' },
  { hex: '#a855f7', label: '紫罗兰' },
  { hex: '#ffffff', label: '珍珠白' },
];

// Helper to convert a quadratic curve to points for sketchy rendering
function getQuadraticCurvePoints(
  startX: number,
  startY: number,
  cpX: number,
  cpY: number,
  endX: number,
  endY: number,
  segments = 8
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    const x = mt * mt * startX + 2 * mt * t * cpX + t * t * endX;
    const y = mt * mt * startY + 2 * mt * t * cpY + t * t * endY;
    pts.push([x, y]);
  }
  return pts;
}

// Helper to draw a wobbly chalk/crayon line (broken into wobbly steps to prevent perfection)
function drawWobblyLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 3.5
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(3, Math.floor(dist / 4));
  
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const currX = x1 + dx * t;
    const currY = y1 + dy * t;
    
    // Deterministic wobble based on positions
    const freq = (x1 + y1 + i) * 2.3;
    const wX = Math.sin(freq) * 0.7;
    const wY = Math.cos(freq * 0.8) * 0.7;
    
    if (i === steps) {
      ctx.lineTo(x2, y2);
    } else {
      ctx.lineTo(currX + wX, currY + wY);
    }
  }
  ctx.stroke();
  ctx.restore();
}

// Draw a hand-drawn path outline
function drawHandDrawnOutlinePath(ctx: CanvasRenderingContext2D, points: [number, number][], color: string, width = 3.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  points.forEach(([x, y], i) => {
    const wobbleX = Math.sin(i * 1.5) * 0.8;
    const wobbleY = Math.cos(i * 1.2) * 0.8;
    
    if (i === 0) {
      ctx.moveTo(x + wobbleX, y + wobbleY);
    } else {
      ctx.lineTo(x + wobbleX, y + wobbleY);
    }
  });
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Draw a hand-drawn filled shape (with slightly wobbly edges)
function drawHandDrawnFilledShape(ctx: CanvasRenderingContext2D, points: [number, number][], color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  points.forEach(([x, y], i) => {
    const wobbleX = Math.sin(i * 1.3) * 0.9;
    const wobbleY = Math.cos(i * 1.6) * 0.9;
    
    if (i === 0) {
      ctx.moveTo(x + wobbleX, y + wobbleY);
    } else {
      ctx.lineTo(x + wobbleX, y + wobbleY);
    }
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// egg-shaped outline body generator (image 1 style)
function getDoodleOutlinePoints(baseW: number, baseH: number): [number, number][] {
  const pts: [number, number][] = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Create an egg/oval shape (narrower at the tail end on the right, rounder at the snout on the left)
    const taper = 0.52 + 0.48 * ((cos + 1) / 2); // wider at left, narrower at right
    
    const x = cos * baseW * 0.33 - baseW * 0.08;
    const y = sin * baseH * 0.55 * taper;
    pts.push([x, y]);
  }
  return pts;
}

// combined body-and-tail filled shape generator (image 2 style)
function getDoodleFilledPoints(baseW: number, baseH: number, tailOffset: number): [number, number][] {
  const pts: [number, number][] = [];
  const steps = 16;
  
  // Upper boundary of body (from back to front)
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI * 2 - (i / steps) * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const taper = 0.52 + 0.48 * ((cos + 1) / 2);
    const x = cos * baseW * 0.33 - baseW * 0.08;
    const y = sin * baseH * 0.55 * taper;
    pts.push([x, y]);
  }
  
  // Lower boundary of body (from front to back)
  for (let i = 1; i <= steps; i++) {
    const angle = Math.PI - (i / steps) * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const taper = 0.52 + 0.48 * ((cos + 1) / 2);
    const x = cos * baseW * 0.33 - baseW * 0.08;
    const y = sin * baseH * 0.55 * taper;
    pts.push([x, y]);
  }
  
  // Triangle tail points
  pts.push([baseW * 0.43, baseH * 0.42 + tailOffset]);
  pts.push([baseW * 0.36, tailOffset * 0.5]);
  pts.push([baseW * 0.43, -baseH * 0.42 + tailOffset]);
  
  return pts;
}

export default function AquariumGame({ onRestart }: AquariumGameProps) {
  // Container & Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Paint canvas refs
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingRef = useRef(false);
  const [paintColor, setPaintColor] = useState('#f43f5e');
  const [brushSize, setBrushSize] = useState(6);
  const [activeTool, setActiveTool] = useState<'brush' | 'bucket' | 'eraser'>('brush');
  const isEraser = activeTool === 'eraser';
  const [historyStack, setHistoryStack] = useState<ImageData[]>([]);
  
  // Game states
  const [fishList, setFishList] = useState<SwimmingFish[]>([]);
  const [showDrawPanel, setShowDrawPanel] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [releasedCount, setReleasedCount] = useState(0);

  // Clear historyStack and reset active tool when drawing panel is shown/hidden
  useEffect(() => {
    setHistoryStack([]);
    setActiveTool('brush');
  }, [showDrawPanel]);

  // Keep a mutable ref of fish list for the high-frequency animation loop
  const fishListRef = useRef<SwimmingFish[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const seaweedAngleRef = useRef(0);

  // Initialize decorative default fish
  useEffect(() => {
    const initialFish: SwimmingFish[] = [];
    
    // 3 hand-drawn doodle presets matching user reference drawings:
    const presets = [
      { color: '#ffffff', isOutline: true }, // White outline (Exactly Image 1!)
      { color: '#10b981', accentColor: '#fb923c', isOutline: false }, // Green with orange accents (Exactly Image 2!)
      { color: '#fbbf24', isOutline: true }, // Gold/yellow outline (Image 1 style)
    ];
    
    for (let i = 0; i < 3; i++) {
      const preset = presets[i];
      // Randomize swimming direction more (with vertical slant)
      const randomVx = (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.7);
      const randomVy = (Math.random() - 0.5) * 0.9; // larger vertical range for slant movement
      
      initialFish.push({
        id: `builtin-${i}`,
        image: null,
        isCustom: false,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        vx: randomVx,
        vy: randomVy,
        width: 44,
        height: 20,
        scale: 0.9 + Math.random() * 0.4,
        wiggleSpeed: 0.03 + Math.random() * 0.02, // very gentle wiggle speed
        wiggleOffset: Math.random() * Math.PI * 2,
        color: preset.color,
        isOutline: preset.isOutline,
        accentColor: preset.accentColor,
        type: 'generic',
        entranceProgress: 1.0, // Initial fish don't play entry animation
        splashDone: true,
        facingRight: randomVx > 0,
        currentScaleX: randomVx > 0 ? -1 : 1, // correct default
      });
    }
    
    fishListRef.current = initialFish;
    setFishList(initialFish);

    // Initialize decorative bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 8; i++) {
      bubbles.push({
        x: Math.random() * 600,
        y: Math.random() * 400 + 100,
        r: 1 + Math.random() * 3.5,
        speed: 0.12 + Math.random() * 0.18,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
    bubblesRef.current = bubbles;
  }, []);

  // Set up full size responsive canvas via ResizeObserver
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      // Ensure high pixel ratio display sharpness
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    updateCanvasSize();
    const observer = new ResizeObserver(() => {
      updateCanvasSize();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Main Canvas Rendering & Physics Update Loop
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Clear with beautiful aquatic gradient background
      ctx.clearRect(0, 0, width, height);
      
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020617'); // slate-950
      grad.addColorStop(0.4, '#071e3d'); // deep ocean
      grad.addColorStop(1, '#0b3c5d'); // deep aquatic teal
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 1. Swaying Seaweed (Water plant background)
      seaweedAngleRef.current += 0.02;
      ctx.save();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.4;
      
      const weedSpacing = 45;
      const totalWeeds = Math.ceil(width / weedSpacing) + 2;
      for (let i = -1; i < totalWeeds; i++) {
        const xBase = i * weedSpacing;
        const weedHeight = 80 + Math.sin(i * 0.5) * 30 + (i % 2 === 0 ? 40 : 0);
        ctx.beginPath();
        ctx.moveTo(xBase, height);
        
        // Quad curve for swaying effect
        const controlX = xBase + Math.sin(seaweedAngleRef.current + i * 0.3) * 15;
        const controlY = height - weedHeight / 2;
        const endX = xBase + Math.sin(seaweedAngleRef.current + i * 0.3) * 30;
        const endY = height - weedHeight;
        
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Decorative Bubbles
      ctx.save();
      bubblesRef.current.forEach((bubble) => {
        bubble.y -= bubble.speed;
        // Float side to side slightly
        bubble.x += Math.sin(bubble.y * 0.05 + bubble.r) * 0.15;
        
        // Reset bubble at bottom if it escapes top
        if (bubble.y < -10) {
          bubble.y = height + 10;
          bubble.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + bubble.opacity + ')';
        ctx.fill();
        
        // Highlight on the bubble
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });
      ctx.restore();

      // 3. User interaction ripples
      ctx.save();
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 1.8;
        ripple.opacity -= 0.015;
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, ripple.opacity)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        return ripple.opacity > 0;
      });
      ctx.restore();

      // 4. Update and Draw Fish (Preloaded + Hand-drawn Custom Fish)
      const currentFishList = [...fishListRef.current];
      
      currentFishList.forEach((fish) => {
        // Increment entrance animation progress if applicable
        if (fish.entranceProgress !== undefined && fish.entranceProgress < 1) {
          fish.entranceProgress += 0.02; // Complete in 50 frames (~0.8s)
          if (fish.entranceProgress >= 1) {
            fish.entranceProgress = 1;
          }
          
          // Generate an entry splash on the first frame
          if (!fish.splashDone) {
            fish.splashDone = true;
            ripplesRef.current.push({
              x: fish.x,
              y: fish.y,
              radius: 5,
              maxRadius: 80,
              opacity: 1.0,
            });
            ripplesRef.current.push({
              x: fish.x,
              y: fish.y,
              radius: 15,
              maxRadius: 60,
              opacity: 0.8,
            });
            ripplesRef.current.push({
              x: fish.x,
              y: fish.y,
              radius: 25,
              maxRadius: 45,
              opacity: 0.6,
            });

            // Spawn bubbles rising from entry point
            for (let b = 0; b < 6; b++) {
              bubblesRef.current.push({
                x: fish.x + (Math.random() - 0.5) * 50,
                y: fish.y + (Math.random() - 0.5) * 30,
                r: 1.5 + Math.random() * 2.5,
                speed: 0.3 + Math.random() * 0.5,
                opacity: 0.2 + Math.random() * 0.4,
              });
            }
          }
        }

        // Decrement custom fish glowDuration if it exists
        if (fish.glowDuration !== undefined && fish.glowDuration > 0) {
          fish.glowDuration -= 1;
        }

        // Check if the fish is in staying/suspending state
        const isStaying = fish.stayDuration !== undefined && fish.stayDuration > 0;
        if (isStaying) {
          fish.stayDuration! -= 1;
          
          // Increment wiggleOffset for gentle visual wave bobbing
          fish.wiggleOffset += fish.wiggleSpeed;
        } else {
          // If in turning cooldown, enforce straight horizontal swimming
          if (fish.turnCooldown !== undefined && fish.turnCooldown > 0) {
            fish.turnCooldown -= 1;
            
            // Lock vx to the direction of facingRight, smoothly transitioning to a stable speed
            const speedMagnitude = fish.isCustom ? 1.3 : 1.0;
            const targetVx = fish.facingRight ? speedMagnitude : -speedMagnitude;
            fish.vx += (targetVx - fish.vx) * 0.15;
            
            // Smoothly align vy to 0 for a straight horizontal path
            fish.vy += (0 - fish.vy) * 0.08;
            
            fish.x += fish.vx;
            fish.y += fish.vy;
            
            fish.wiggleOffset += fish.wiggleSpeed;
          } else {
            // Apply normal swimming movement physics
            fish.x += fish.vx;
            fish.y += fish.vy;
            
            // Increment wiggleOffset for gentle visual wave bobbing
            fish.wiggleOffset += fish.wiggleSpeed;

            // Introduce a tiny organic steering drift to make their paths beautifully wavy, curved, and diagonal
            if (Math.random() < 0.035) {
              fish.vy += (Math.random() - 0.5) * 0.25; // vertical steering shift
              fish.vx += (Math.random() - 0.5) * 0.15; // horizontal speed adjustment
            }

            // Interactive behavior: check distance to ripples (get scared!)
            ripplesRef.current.forEach((ripple) => {
              const dx = fish.x - ripple.x;
              const dy = fish.y - ripple.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < ripple.radius + 60 && dist > ripple.radius - 30) {
                // Push away from ripple center
                const angle = Math.atan2(dy, dx);
                fish.vx += Math.cos(angle) * 0.15;
                fish.vy += Math.sin(angle) * 0.15;
              }
            });

            // Limit maximum velocities to prevent hyper speed
            const speed = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
            const maxSpeed = fish.isCustom ? 2.5 : 1.8;
            if (speed > maxSpeed) {
              fish.vx = (fish.vx / speed) * maxSpeed;
              fish.vy = (fish.vy / speed) * maxSpeed;
            }

            // Apply friction drag to stabilize over time
            fish.vx *= 0.99;
            fish.vy *= 0.99;

            // Keep fish moving forward minimum speed
            if (Math.abs(fish.vx) < 0.3) {
              fish.vx += (fish.vx >= 0 ? 1 : -1) * 0.05;
            }
          }

          // Boundary reflection/wrap logic with added messy random redirect angles
          const bufferX = 60;
          const bufferY = 40;
          if (fish.x < -bufferX) {
            fish.x = -bufferX;
            fish.vx = Math.abs(fish.vx);
            fish.vy = (Math.random() - 0.5) * 1.0; // Random diagonal redirect on left wall bounce
            fish.facingRight = true;
            fish.turnCooldown = 150; // Swim straight forward upon bouncing
          } else if (fish.x > width + bufferX) {
            fish.x = width + bufferX;
            fish.vx = -Math.abs(fish.vx);
            fish.vy = (Math.random() - 0.5) * 1.0; // Random diagonal redirect on right wall bounce
            fish.facingRight = false;
            fish.turnCooldown = 150; // Swim straight forward upon bouncing
          }

          if (fish.y < bufferY) {
            fish.y = bufferY;
            fish.vy = Math.abs(fish.vy);
            fish.vx += (Math.random() - 0.5) * 0.3; // Slight horizontal kick on top bounce
          } else if (fish.y > height - bufferY) {
            fish.y = height - bufferY;
            fish.vy = -Math.abs(fish.vy);
            fish.vx += (Math.random() - 0.5) * 0.3; // Slight horizontal kick on bottom bounce
          }
        }

        // Evaluate facing direction with hysteresis to prevent twitching/jittering on near-zero speeds or ripple fear push
        if (fish.facingRight === undefined) {
          fish.facingRight = fish.vx > 0;
          fish.turnCooldown = 0;
        } else {
          // Only evaluate new facing direction if not staying and turnCooldown <= 0
          if (!isStaying && (fish.turnCooldown === undefined || fish.turnCooldown <= 0)) {
            if (fish.facingRight && fish.vx < -0.15) {
              fish.facingRight = false;
              // Commit to swimming left: set a robust negative velocity and trigger straight swim cooldown
              fish.vx = -1.2 - Math.random() * 0.4;
              fish.turnCooldown = 150; // swim straight for 150 frames (~2.5 seconds)
            } else if (!fish.facingRight && fish.vx > 0.15) {
              fish.facingRight = true;
              // Commit to swimming right: set a robust positive velocity and trigger straight swim cooldown
              fish.vx = 1.2 + Math.random() * 0.4;
              fish.turnCooldown = 150; // swim straight for 150 frames (~2.5 seconds)
            }
          }
        }
        const flip = fish.facingRight;

        // Smoothly interpolate currentScaleX towards targetScaleX (flip ? -1 : 1) for a silky smooth turn!
        const targetScaleX = flip ? -1 : 1;
        if (fish.currentScaleX === undefined) {
          fish.currentScaleX = targetScaleX;
        } else {
          fish.currentScaleX += (targetScaleX - fish.currentScaleX) * 0.08;
        }

        // Render the fish!
        // Visual-only organic vertical bobbing offset (prevents accumulating physics error or boundary-stuck jitter!)
        const bobbingAmp = isStaying ? 1.5 : 4.0;
        const bobbingOffset = Math.sin(fish.wiggleOffset) * bobbingAmp;
        const renderY = ((fish.entranceProgress !== undefined && fish.entranceProgress < 1)
          ? fish.y - (1 - fish.entranceProgress) * 45
          : fish.y) + bobbingOffset;

        ctx.save();
        ctx.translate(fish.x, renderY);
        ctx.scale(fish.currentScaleX ?? (flip ? -1 : 1), 1);
        
        // Adjust scale and opacity dynamically during entrance
        if (fish.entranceProgress !== undefined && fish.entranceProgress < 1) {
          const t = fish.entranceProgress;
          // Elastic soft bounce curve: starts at 0, overshoots slightly, settles back to 1.0
          const elasticScale = Math.sin(t * Math.PI * 0.5) * 1.12;
          ctx.scale(elasticScale, elasticScale);
          ctx.globalAlpha = Math.min(1.0, t * 1.5);
          
          // Draw a beautiful expanding underwater bubble ring around the newly dropped fish
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - t)})`;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(0, 0, 50 * t, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        if (fish.isCustom && fish.image) {
          // --- RENDER CUSTOM HAND-DRAWN FISH ---
          // Dynamic scale-down animation during the first 5 seconds (glowDuration starts at 300 frames)
          let scaleFactor = 1.0;
          if (fish.glowDuration !== undefined && fish.glowDuration > 0) {
            const progress = fish.glowDuration / 300; // Fades from 1.0 down to 0
            // Smooth exponential ease-out curve for shrinking from 2.5x to 1.0x
            const easeProgress = Math.pow(progress, 1.6);
            scaleFactor = 1.0 + easeProgress * 1.5; // Starts at 2.5x and shrinks down to 1.0x
          }

          const drawW = fish.width * fish.scale * scaleFactor;
          const drawH = fish.height * fish.scale * scaleFactor;
          
          // Organic tail wiggle skew: keeps the nose (at local left x) stable while waving the tail (on the right) up and down
          const tailWiggle = Math.sin(fish.wiggleOffset) * 0.012; // extremely light, gentle, elegant wiggle factor
          ctx.transform(1, tailWiggle, 0, 1, 0, (drawW / 2) * tailWiggle);

          // Render with glowing effects while glowDuration is active
          if (fish.glowDuration !== undefined && fish.glowDuration > 0) {
            const progress = fish.glowDuration / 300;
            const pulse = 1.0 + Math.sin(fish.glowDuration * 0.15) * 0.08;
            
            // Layer 1: Bright golden-white central core glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowBlur = 28 * progress * pulse;
            ctx.drawImage(fish.image, -drawW / 2, -drawH / 2, drawW, drawH);

            // Layer 2: Radiant cyan outer light aura overlay
            ctx.save();
            ctx.shadowColor = 'rgba(34, 211, 238, 0.85)';
            ctx.shadowBlur = 18 * progress;
            ctx.globalAlpha = 0.55 * progress;
            ctx.drawImage(fish.image, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
          } else {
            // Normal subtle ambient trailing glow after 5 seconds
            ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
            ctx.shadowBlur = 12;
            ctx.drawImage(fish.image, -drawW / 2, -drawH / 2, drawW, drawH);
          }
        } else {
          // --- RENDER DUSTY CHALK-STYLE PRESET DOODLE FISH (Matches user reference drawings perfectly!) ---
          const fishColor = fish.color || '#38bdf8';
          const sizeScale = fish.scale;
          const baseW = (fish.width + 12) * sizeScale;
          const baseH = (fish.height + 6) * sizeScale;
          const tailOffset = Math.sin(fish.wiggleOffset) * 1.5; // very gentle, silky tail wiggle amplitude

          // NO GLOW SHADOW here for initial preset hand-drawn fish as requested!

          if (fish.isOutline) {
            // --- Style 1: Outline Doodle (Image 1 style) ---
            const pts = getDoodleOutlinePoints(baseW, baseH);
            // 1. Draw the wobbly egg-shaped outer body outline
            drawHandDrawnOutlinePath(ctx, pts, fishColor, 3.2);

            // 2. Draw the vertical divide line (head/gill division)
            drawWobblyLine(ctx, -baseW * 0.12, -baseH * 0.38, -baseW * 0.12, baseH * 0.38, fishColor, 3.2);

            // 3. Draw the wobbly triangular tail (connecting to rear of body)
            drawWobblyLine(ctx, baseW * 0.22, 0, baseW * 0.42, -baseH * 0.42 + tailOffset, fishColor, 3.2);
            drawWobblyLine(ctx, baseW * 0.42, -baseH * 0.42 + tailOffset, baseW * 0.42, baseH * 0.42 + tailOffset, fishColor, 3.2);
            drawWobblyLine(ctx, baseW * 0.42, baseH * 0.42 + tailOffset, baseW * 0.22, 0, fishColor, 3.2);

            // 4. Draw the eye (solid circle)
            ctx.save();
            ctx.fillStyle = fishColor;
            ctx.beginPath();
            ctx.arc(-baseW * 0.26, -baseH * 0.02, 3 * sizeScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            // --- Style 2: Filled Accent Doodle (Image 2 style) ---
            const accentColor = fish.accentColor || '#fb923c';
            const pts = getDoodleFilledPoints(baseW, baseH, tailOffset);
            
            // 1. Draw solid wobbly body + tail shape
            drawHandDrawnFilledShape(ctx, pts, fishColor);

            // 2. Draw wobbly vertical head divide line of contrast color
            drawWobblyLine(ctx, -baseW * 0.1, -baseH * 0.38, -baseW * 0.1, baseH * 0.38, accentColor, 4.0);

            // 3. Draw contrast-colored solid circle eye
            ctx.save();
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(-baseW * 0.24, -baseH * 0.02, 4.2 * sizeScale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 4. Draw contrast-colored vertical stripes on the back body
            drawWobblyLine(ctx, baseW * 0.04, -baseH * 0.25, baseW * 0.04, baseH * 0.25, accentColor, 3.8);
            drawWobblyLine(ctx, baseW * 0.16, -baseH * 0.18, baseW * 0.16, baseH * 0.18, accentColor, 3.8);
          }
        }
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Handle clicking on aquarium to spawn dynamic water ripples that scare fish
  const handleAquariumClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add ripple
    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 80,
      opacity: 0.8,
    });

    // Make custom water droplet sounds
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 + Math.random() * 200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      // Audio context might be blocked or unsupported
    }
  };

  // Drawing Pad Handlers
  const floodFill = (startX: number, startY: number, fillHex: string) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Save state before filling for undo
    const imgDataForUndo = ctx.getImageData(0, 0, width, height);
    setHistoryStack((prev) => {
      const next = [...prev, imgDataForUndo];
      if (next.length > 30) {
        next.shift();
      }
      return next;
    });

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Convert hex to RGBA
    const cleanHex = fillHex.replace('#', '');
    const targetR = parseInt(cleanHex.substring(0, 2), 16);
    const targetG = parseInt(cleanHex.substring(2, 4), 16);
    const targetB = parseInt(cleanHex.substring(4, 6), 16);
    const targetA = 255;

    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];
    const startA = data[startIdx + 3];

    // Check match with a tolerance (to handle canvas anti-aliasing nicely)
    const colorMatch = (r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number) => {
      return Math.abs(r1 - r2) < 20 && Math.abs(g1 - g2) < 20 && Math.abs(b1 - b2) < 20 && Math.abs(a1 - a2) < 20;
    };

    // If start color is already close to target color, don't do anything
    if (colorMatch(startR, startG, startB, startA, targetR, targetG, targetB, targetA)) {
      return;
    }

    const queue: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    visited[startY * width + startX] = 1;

    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];

      const idx = (cy * width + cx) * 4;
      data[idx] = targetR;
      data[idx + 1] = targetG;
      data[idx + 2] = targetB;
      data[idx + 3] = targetA;

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const npos = ny * width + nx;
          if (!visited[npos]) {
            const nidx = npos * 4;
            const nr = data[nidx];
            const ng = data[nidx + 1];
            const nb = data[nidx + 2];
            const na = data[nidx + 3];

            if (colorMatch(nr, ng, nb, na, startR, startG, startB, startA)) {
              visited[npos] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getEventCoords(e, canvas);

    if (activeTool === 'bucket') {
      const startX = Math.max(0, Math.min(canvas.width - 1, Math.round(coords.x)));
      const startY = Math.max(0, Math.min(canvas.height - 1, Math.round(coords.y)));
      floodFill(startX, startY, paintColor);
      return;
    }

    // Save current state into history stack before making changes (for brush/eraser)
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack((prev) => {
      const next = [...prev, imgData];
      if (next.length > 30) {
        next.shift();
      }
      return next;
    });

    isPaintingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set brush settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = paintColor;
      ctx.lineWidth = brushSize;
    }

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isPaintingRef.current = false;
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const undoLastDraw = () => {
    if (historyStack.length === 0) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const previousState = historyStack[historyStack.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
  };

  const clearDrawing = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state before clearing so they can undo it
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistoryStack((prev) => {
      const next = [...prev, imgData];
      if (next.length > 30) {
        next.shift();
      }
      return next;
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Release Custom Fish!
  const releaseCustomFish = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;

    // Check if canvas is entirely empty to prevent releasing invisible fish
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawn = buffer.data.some((channel) => channel !== 0);
    
    if (!hasDrawn) {
      alert('请在画布上手绘小鱼的轮廓和色彩再放生哦！');
      return;
    }

    const dataUrl = canvas.toDataURL();
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      // Instantiation parameters
      const randomDirection = Math.random() > 0.5 ? 1 : -1;
      const newFish: SwimmingFish = {
        id: `custom-${Date.now()}`,
        image: img,
        isCustom: true,
        x: Math.random() * 200 + 150, // Spawns more centrally
        y: Math.random() * 150 + 100,
        vx: randomDirection * (1.0 + Math.random() * 0.8), // can swim left or right with varied speed
        vy: (Math.random() - 0.5) * 1.0, // more prominent diagonal slant
        width: 65,
        height: 65,
        scale: 0.9 + Math.random() * 0.3,
        wiggleSpeed: 0.03 + Math.random() * 0.02, // very gentle wiggle speed
        wiggleOffset: Math.random() * Math.PI * 2,
        entranceProgress: 0,
        splashDone: false,
        glowDuration: 300,
        facingRight: randomDirection > 0,
        stayDuration: 180, // stay in place for 3 seconds (180 frames)
        currentScaleX: randomDirection > 0 ? -1 : 1, // initialize correctly
      };

      // Push into reference lists
      fishListRef.current = [...fishListRef.current, newFish];
      setFishList((prev) => [...prev, newFish]);
      setReleasedCount((prev) => prev + 1);
      setShowDrawPanel(false);
      clearDrawing();

      // Trigger splash sound effect
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (err) {
        // Ignored
      }
    };
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col animate-fade-in select-none">
      
      {/* 1. Header Navigation Bar */}
      <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-slate-900/90 to-slate-950/0 z-20 flex items-center justify-between px-5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-brand-teal/20 text-[#22D3EE] rounded-lg border border-brand-teal/30">
            <Waves className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xs font-black text-white leading-tight">沪鱼万象 · 虚拟数字生态水域</h3>
            <p className="text-[9.5px] text-zinc-400 font-mono">Shanghai Virtual Aquatic Sandbox</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {releasedCount > 0 && (
            <span className="text-[10px] bg-brand-green/20 text-[#10B981] border border-brand-green/30 font-bold px-2.5 py-1 rounded-full animate-bounce">
              已放生 {releasedCount} 尾
            </span>
          )}
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-zinc-300 rounded-lg border border-slate-700/50 transition"
            title="规则指引"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Full-Screen Interactive Aquarium Canvas Container */}
      <div 
        ref={containerRef} 
        className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden"
      >
        <canvas 
          ref={canvasRef} 
          onClick={handleAquariumClick}
          className="absolute inset-0 w-full h-full block" 
        />

        {/* 3. Swaying Bottom Seaweed Decor & Floating Dashboard UI */}
        <div className="absolute bottom-5 inset-x-0 px-5 flex flex-col items-center justify-center gap-3 z-20 pointer-events-none">
          
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
               onClick={() => setShowDrawPanel(true)}
               className="flex items-center gap-1.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full font-black text-xs tracking-wider shadow-lg shadow-teal-500/20 active:translate-y-0.5 transition-all"
             >
               <Sparkles className="w-4 h-4" />
               手绘小鱼并放生
             </button>

             <button
               onClick={onRestart}
               className="px-4 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-zinc-300 rounded-full font-bold text-xs tracking-wider border border-slate-700 shadow-md active:translate-y-0.5 transition-all"
             >
               <RefreshCw className="w-3.5 h-3.5" />
             </button>
           </div>

           <p className="text-[9.5px] text-zinc-400/80 font-medium tracking-wide bg-slate-950/40 px-3 py-1 rounded-full backdrop-blur-sm">
             点击水面可以制造水波涟漪，鱼儿会灵巧地避开波纹哦
           </p>
        </div>
      </div>

      {/* 4. Interactive Floating Hand-drawing Paint Panel Overlay */}
      {showDrawPanel && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-scale-up">
            
            {/* Paint Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-black text-white">手绘您的申河新住民</h4>
                <p className="text-[10px] text-zinc-400">发挥创意，绘制你的专属小鱼并将其放归大自然</p>
              </div>
              <button
                onClick={() => {
                  setShowDrawPanel(false);
                  clearDrawing();
                }}
                className="text-xs text-zinc-400 hover:text-white bg-slate-800 px-3 py-1 rounded-lg transition"
              >
                取消
              </button>
            </div>

            {/* Drawing Canvas Area */}
            <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Fish Silhouette Background Helper */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] select-none pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-cyan-400">
                  <path d="M 10,50 Q 30,20 65,30 Q 80,15 90,20 Q 85,35 90,45 Q 85,50 90,55 Q 85,65 90,80 Q 80,85 65,70 Q 30,80 10,50 Z" />
                  <path d="M 40,30 Q 50,15 60,25" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M 45,70 Q 55,85 65,75" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <canvas
                ref={paintCanvasRef}
                width={280}
                height={280}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="relative z-10 w-full h-full cursor-pencil touch-none"
              />
            </div>

            {/* Paint Brush controls */}
            <div className="space-y-3">
              {/* Brush colors */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <Palette className="w-3 h-3" /> 选择色彩
                </span>
                <div className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    {BRUSH_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => {
                          setPaintColor(color.hex);
                          if (activeTool === 'eraser') {
                            setActiveTool('brush');
                          }
                        }}
                        className="relative w-6 h-6 rounded-full border transition-all duration-150 transform hover:scale-110 active:scale-95"
                        style={{ 
                          backgroundColor: color.hex,
                          borderColor: paintColor === color.hex && activeTool !== 'eraser' ? '#22D3EE' : 'rgba(255,255,255,0.15)',
                          boxShadow: paintColor === color.hex && activeTool !== 'eraser' ? '0 0 6px #22D3EE' : 'none'
                        }}
                        title={color.label}
                      >
                        {paintColor === color.hex && activeTool !== 'eraser' && (
                          <Check className="w-2.5 h-2.5 text-slate-900 mx-auto font-black" style={{ color: color.hex === '#ffffff' ? '#000000' : '#ffffff' }} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="h-5 w-px bg-slate-800 self-center mx-0.5" />

                  <div className="flex items-center gap-1">
                    {/* Brush */}
                    <button
                      onClick={() => setActiveTool('brush')}
                      className={`p-1.5 rounded-lg border transition ${
                        activeTool === 'brush' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                          : 'bg-slate-800 text-zinc-400 border-slate-700 hover:text-white'
                      }`}
                      title="画笔"
                    >
                      <Paintbrush className="w-3.5 h-3.5" />
                    </button>

                    {/* Paint Bucket */}
                    <button
                      onClick={() => setActiveTool('bucket')}
                      className={`p-1.5 rounded-lg border transition ${
                        activeTool === 'bucket' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                          : 'bg-slate-800 text-zinc-400 border-slate-700 hover:text-white'
                      }`}
                      title="油漆桶"
                    >
                      <PaintBucket className="w-3.5 h-3.5" />
                    </button>

                    {/* Eraser */}
                    <button
                      onClick={() => setActiveTool('eraser')}
                      className={`p-1.5 rounded-lg border transition ${
                        activeTool === 'eraser' 
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                          : 'bg-slate-800 text-zinc-400 border-slate-700 hover:text-white'
                      }`}
                      title="橡皮擦"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Brush size slider */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-zinc-400">画笔粗细</span>
                  <input
                    type="range"
                    min="3"
                    max="18"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-950 rounded-lg appearance-none h-1.5"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={undoLastDraw}
                    disabled={historyStack.length === 0}
                    className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition flex items-center gap-1 ${
                      historyStack.length === 0
                        ? 'bg-slate-950 text-zinc-600 border border-slate-900 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Undo2 className="w-3 h-3" />
                    返回上一步
                  </button>
                  <button
                    onClick={clearDrawing}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg border border-slate-700 transition"
                  >
                    清空
                  </button>
                </div>
              </div>
            </div>

            {/* Launch action buttons */}
            <button
              onClick={releaseCustomFish}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 rounded-2xl font-black text-xs tracking-wider shadow-lg shadow-emerald-500/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
            >
              放生进入虚拟水域
            </button>

          </div>
        </div>
      )}

      {/* 5. Informational educational guide overlays */}
      {showGuide && (
        <div className="absolute top-16 left-5 right-5 bg-slate-900/95 backdrop-blur border border-slate-800 p-4 rounded-2xl shadow-xl z-20 animate-fade-in pointer-events-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h5 className="text-xs font-black text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> 上海水域大复苏沙盒
              </h5>
              <p className="text-[10.5px] text-zinc-300 leading-relaxed">
                恭喜您解开全部关卡！在终极复苏沙盒中，您可以通过手绘小鱼，为清澈的上海水域注入新鲜的生机。
              </p>
              <ul className="text-[9.5px] text-zinc-400 list-disc list-inside space-y-0.5 pt-1.5">
                <li>点击<b>【手绘小鱼并放生】</b>，在画板上进行手绘涂鸦。</li>
                <li>完成绘制后，点击<b>【放生】</b>，您手绘的小鱼就会进入满屏的水域中欢快畅游。</li>
                <li>轻击水域水面，还可以看到鱼儿受水面波澜惊吓四散游动的趣味物理互动！</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowGuide(false)}
              className="text-[10px] text-zinc-500 hover:text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800"
            >
              关闭
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
