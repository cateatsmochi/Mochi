import { useState, useEffect } from 'react';
import { playWaterPlop, playWaveSplash, playSuccessChime } from '../../utils/audio';

interface MapPuzzleProps {
  onSolved: () => void;
  isSolved: boolean;
}

type NodeKey = 'A' | 'B' | 'C' | 'D' | 'E';

interface MapNode {
  key: NodeKey;
  label: string;
  x: string;
  y: string;
  status: 'safe' | 'polluted' | 'construction';
  obstacleDesc?: string;
}

export default function MapPuzzle({ onSolved, isSolved }: MapPuzzleProps) {
  const [currentNode, setCurrentNode] = useState<NodeKey>('A');
  const [successRevealed, setSuccessRevealed] = useState(false);
  const [log, setLog] = useState<string>('胭脂鱼苗放流追踪车已就位。请点击绿色节点自主设计路线，将放流小队安全导向终点监测口。');
  // Adjacency list for valid steps
  const validTransitions: Record<NodeKey, NodeKey[]> = {
    A: ['B'],
    B: ['A', 'C', 'D'],
    C: ['B'],
    D: ['B', 'E'],
    E: ['D']
  };

  const nodes: Record<NodeKey, MapNode> = {
    A: {
      key: 'A',
      label: '保育中心 (鱼苗培育初始基地)',
      x: '12%',
      y: '72%',
      status: 'safe'
    },
    B: {
      key: 'B',
      label: '康平路 / 152弄深窄河道汇氧站',
      x: '46%',
      y: '68%',
      status: 'safe'
    },
    C: {
      key: 'C',
      label: '弄堂生态涌泉泉眼 (清凉安全湿地)',
      x: '38%',
      y: '22%',
      status: 'safe'
    },
    D: {
      key: 'D',
      label: '宛平路交叉口 (曝晒重污染阻断带)',
      x: '82%',
      y: '26%',
      status: 'construction',
      obstacleDesc: '此处突发工业废水管网溢漏，水温偏高达29℃且含氧极低，胭脂鱼容易产生高温应激死亡！请撤回逆流而上，寻找弄堂自净涌泉（152弄深度湿润泉眼）。'
    },
    E: {
      key: 'E',
      label: '康平路105号 (实景高自净生态释放点)',
      x: '82%',
      y: '78%',
      status: 'safe'
    }
  };

  const handleNodeClick = (nodeKey: NodeKey) => {
    if (isSolved) return;
    
    const target = nodes[nodeKey];
    
    // Check if clicked node is connected to the current node
    if (!validTransitions[currentNode].includes(nodeKey)) {
      playWaterPlop();
      setLog(`⚠️ 无法直接前往。河流与监测支线未打通，请循着高连通廊道行进。`);
      return;
    }

    if (target.status !== 'safe') {
      playWaveSplash();
      setLog(`❌ 抵达 ${target.label} 异常！${target.obstacleDesc}`);
      return;
    }

    // Move to next node
    playWaterPlop();
    setCurrentNode(nodeKey);
    
    if (nodeKey === 'E') {
      setLog('📍 胭脂鱼苗成功护送达105号实景发布点！请点击下方【确认开启自净放流】进行信号信码核验。');
    } else {
      setLog(`📍 已穿行至: ${target.label}。多功能监测芯片反馈：温度、pH和溶氧维持极佳状态。`);
    }
  };

  const verifyArrival = () => {
    if (currentNode !== 'E') {
      setLog('⚠️ 放流运载车尚未抵达【康平路105号口】，科学追踪器信号未就位。');
      return;
    }
    
    playSuccessChime();
    setSuccessRevealed(true);
    onSolved();
    setLog('🎉 太棒了！数百尾胭脂鱼成功放归苏河廊道。路口实景特制鱼夹互动展架的铜牌盒上，绿色追踪灯常亮，显现出芯片信码：【 Y8 】！');
  };

  return (
    <div className="bg-brand-paper rounded-[32px] border-3 border-brand-teal/20 p-5 shadow-sm space-y-4">
      
      {/* 2D Line-art layout */}
      <div className="relative w-full aspect-[4/3] bg-brand-cream/60 rounded-2xl overflow-hidden border-2 border-brand-teal/20 shadow-inner">
        
        {/* Drawn Street Outlines (Elegantly Styled SVGs mapping the screens) */}
        <svg className="absolute inset-0 w-full h-full text-brand-teal/15 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Main roads layout matching original screenshots */}
          <line x1="5" y1="75" x2="95" y2="75" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <text x="25" y="86" fill="currentColor" fontSize="4.2" fontWeight="bold" className="fill-brand-teal/80">康平路 (Kangping Road)</text>

          <line x1="45" y1="75" x2="40" y2="25" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="40" y1="25" x2="88" y2="25" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="82" y1="25" x2="82" y2="74" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          
          <text x="49" y="45" fill="currentColor" fontSize="4.2" transform="rotate(-78 49 45)" fontWeight="bold" className="fill-brand-teal/80">152弄 生态支河</text>
          <text x="88" y="50" fill="currentColor" fontSize="4.2" transform="rotate(90 88 50)" fontWeight="bold" className="fill-brand-teal/80">宛平河道区</text>

          {/* Buildings decorative lines */}
          <rect x="55" y="35" width="20" height="30" fill="#FFFFFF" stroke="currentColor" strokeWidth="1" rx="3" className="opacity-90 stroke-brand-teal/20" />
          <text x="65" y="52" fill="currentColor" fontSize="3.2" textAnchor="middle" className="fill-brand-dark/50">弄堂生境</text>
        </svg>

        {/* Dynamic Roadblock/Construction alerts visually placed */}
        {!isSolved && (
          <div className="absolute top-[26%] left-[82%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] text-white font-bold items-center justify-center">⚠️</span>
            </span>
          </div>
        )}

        {/* Node Points on Map */}
        {Object.values(nodes).map((node) => {
          const isCurrent = currentNode === node.key;
          const isConnected = validTransitions[currentNode].includes(node.key);
          
          // Style state
          let btnClass = "bg-white text-brand-dark border-2 border-brand-teal/35";
          if (isCurrent) {
            btnClass = "bg-brand-teal text-white border-2 border-white ring-4 ring-brand-teal/25 scale-110 z-30 shadow-lg font-black";
          } else if (isConnected && !isSolved) {
            btnClass = "bg-brand-cream/80 text-brand-teal border-2 border-brand-teal cursor-pointer animate-pulse z-20 hover:scale-105 font-bold";
          }

          return (
            <button
              key={node.key}
              onClick={() => handleNodeClick(node.key)}
              style={{ left: node.x, top: node.y }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 focus:outline-none ${btnClass}`}
              title={node.label}
            >
              {isCurrent ? (
                <span className="text-sm">🪣</span>
              ) : (
                node.key
              )}
            </button>
          );
        })}

        {/* Visual prompt pointing directly to 105号 */}
        <div className="absolute top-[82%] left-[68%] pointer-events-none text-brand-teal font-bold animate-pulse text-[11px] flex items-center gap-1">
          <span>▶</span>
          <span className="bg-brand-paper/95 border border-brand-teal/20 px-2 py-0.5 rounded shadow-sm scale-90 text-brand-teal font-black">
            康平路105号驿站 (11/16)
          </span>
        </div>

        {/* Small white checkmark in the bottom right corner when solved, without black overlay/blur so it does not block the screen assets */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
            <svg className="w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Narrative Guide Board */}
      <div className="bg-brand-cream/80 border-2 border-brand-teal/15 rounded-2xl p-4 space-y-3 text-left">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-brand-dark/60 mb-1 font-mono font-bold">
            导航生态巡流日志 / TRACKING DATA
          </div>
          <p className="text-xs text-brand-dark leading-relaxed italic font-medium">「 {log} 」</p>
        </div>

        {/* Arrived and verify Trigger Button */}
        {currentNode === 'E' && (
          <button
            onClick={verifyArrival}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all ${
              successRevealed
                ? 'bg-emerald-600 text-white opacity-80 cursor-default shadow-sm'
                : 'bg-brand-teal hover:bg-brand-dark text-white shadow-md hover:shadow-lg scale-[1.01]'
            }`}
          >
            {successRevealed ? '放流信码已验证 ✓' : '确认一键开启胭脂鱼苗生态放流'}
          </button>
        )}
      </div>
    </div>
  );
}
