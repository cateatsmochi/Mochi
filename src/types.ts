export type PuzzleType = 'jigsaw' | 'seek' | 'diversity' | 'ecology' | 'curtain' | 'map' | 'grid';

export interface Puzzle {
  id: number;
  type: PuzzleType;
  title: string;
  subtitle: string;
  speciesName: string; // Native fish focus
  scientificName: string;
  conservationStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened';
  description: string;
  storyContext: string;
  hints: string[];
  correctAnswer: string;
}

export const puzzles: Puzzle[] = [
  {
    id: 1,
    type: 'jigsaw',
    title: '1.1 江湖之境：申城申鱼图鉴分水图',
    subtitle: '一切的起点 - 内陆、河口与湖沼',
    speciesName: '松江鲈 (Roughskin Sculpin)',
    scientificName: 'Trachidermus fasciatus',
    conservationStatus: 'Vulnerable',
    description: '松江鲈是著名的洄游鱼类，见证了上海江海交汇的独特生境。本站旨在还原由内陆、主要河道（如：苏州河、黄浦江）、湖沼（如：淀山湖）、滩涂（如：九段沙）等构构成成的「上海鱼类分水大图」。玩家需点击乱序拼图使其轮转互换，重整申鱼生境版图。拼出图后即可直接过关。',
    storyContext: '这是藏宝图吗？',
    hints: [
      '第一块展墙的背后就有这张上海水系图。',
      '拼图右下角现在加上了数字，利用他们辅助对齐。',
      '拼图按数字顺序排列！'
    ],
    correctAnswer: '天平路41号'
  },
  {
    id: 2,
    type: 'seek',
    title: '1.2 江湖之境：寻找明星申鱼',
    subtitle: '申城水族大发现 - 在展板中探寻珍稀鱼类',
    speciesName: '申城明星鱼类 (Shanghai Native Fishes)',
    scientificName: 'Acipenser sinensis et al.',
    conservationStatus: 'Critically Endangered',
    description: '请移步大厅前方的「江湖之境」多栖息地实景展墙，观察展板中展示的上海本土特色水系水族。根据提示中的鱼类外形和展位生态分布特征，在手机上答对全部四个问题，即可直接获取第二章秘匙【SH88】通关！',
    storyContext: '我们是明星沪鱼！',
    hints: [
      '第一问（中华鲟）：身躯庞大威武，覆盖五行坚硬盾鳞。在实景展墙的深水及外海区能找到它雄伟的标本模型。',
      '第二问（弹涂鱼）：眼球高高鼓起，胸鳍像手臂般发达。常出现在展墙右侧模拟潮汐、湿地红树林泥滩处的沙泥上。',
      '第三问（高体鳑鲏）：身子扁扁的呈粉紫彩虹色。它和底部贝类（河蚬）模型挨在一起，利用产卵管将卵寄生在贝壳内。',
      '第四问（长吻鮠）：嘴巴向下、长有4对长须，身体淡粉无鳞。在展箱底层的深水急流及乱石暗影中可以找到这位隐藏的游侠。'
    ],
    correctAnswer: 'SH88'
  },
  {
    id: 3,
    type: 'diversity',
    title: '1.3 江湖之境：水体多样性科学考察',
    subtitle: '人工湖泊与自然运河的生态博弈',
    speciesName: '多样性群落 (Fish Community)',
    scientificName: 'Shanghai Aquatic Biodiversity',
    conservationStatus: 'Near Threatened',
    description: '对比人工水体与历史天然河道的生物承载率。上海不同水体的鱼类多样性差异显著。请移步到『江湖之境』展墙下方，在实景科学考察图表中，分别探寻人造滴水湖与天然古运河的鱼类登记数量，通过滑动生态管阀破解生命差值密钥！',
    storyContext: '一方水土养一方鱼。',
    hints: [
      '第一步：请找到『滴水湖』生态对比版块，仔细看上面写明的调查发现鱼类为多少“种”（小于30的一个偶数）。',
      '第二步：请找到『浦南运河与浦东运河』大河流湿地标板，找到上面记载 of 调查发现鱼类为多少“种”（大于40的一个奇数）。',
      '第三步：当你在计算盘中，分别输入并匹配到正确的 24 与 47 时，系统就会自动完成多样性差值解密！'
    ],
    correctAnswer: '23'
  },
  {
    id: 4,
    type: 'ecology',
    title: '2.1 生存之战：河道侵袭与生态净化',
    subtitle: '直面核心威胁 - 守护最后的筑巢地',
    speciesName: '中华九刺鱼 (Nine-spined Stickleback)',
    scientificName: 'Pungitius sinensis',
    conservationStatus: 'Critically Endangered',
    description: '九刺鱼需要收集繁茂水草来营造爱巢。然而，河底硬化、非法捕捞和罗非鱼等外来物种的疯狂啃咬，导致其濒临灭绝。请拖曳这几项核心生态威胁到下方的保护解密站中以完成生态复苏！',
    storyContext: '上海的鱼可能受到这些伤害。',
    hints: [
      '在模拟湿地池中，仔细看！有废塑料、地笼网、侵略性十足的罗非鱼，以及人工硬化的硬水泥河床。',
      '请将水体内各种核心生态威胁物品拖入下方对应的保护解密站中。',
      '全部 4 项危害净化复苏后，生境恢复完美微循环，即可自动通关解锁下一关！'
    ],
    correctAnswer: 'ECOLOGY_COMPLETED'
  },
  {
    id: 5,
    type: 'curtain',
    title: '2.2 生存之战：掀开帘子探秘心腹之患',
    subtitle: '实景翻帘观鱼之痛 - 寻找上海本土鱼类最大克星',
    speciesName: '生命暗角中的真相',
    scientificName: 'Mysterium',
    conservationStatus: 'Endangered',
    description: '引导观众寻找现场的一块物理实景遮光帘，亲手将其掀开！在这里，阴暗无光的隐秘角落隐藏着上海本土鱼类的头号公敌。动手掀开它，直面隐藏的真相。',
    storyContext: '魔镜魔镜告诉我，谁是世界上最危险的生物？',
    hints: [
      '请移步到现场「生存之战」展区的河道边，寻找挂有醒目文字提示、遮挡着隐秘水生生态或箱体的遮光帘子。',
      '用手轻轻推开或拉起这块物理帘子，仔细确认展出的究竟是什么。',
      '在下方的输入框中，键入你所看到的答案，即可解锁并通关！'
    ],
    correctAnswer: '人类'
  },
  {
    id: 6,
    type: 'map',
    title: '3.1 寻鱼之旅：小小博物馆大探秘',
    subtitle: '学生自主策展的微型生境世界',
    speciesName: '微缩生态空间 (One Square Meter Ecosystem)',
    scientificName: 'Micro-Museum Ecosystems',
    conservationStatus: 'Near Threatened',
    description: '引导观众寻找展厅内由学生自主策划并搭建的“小小博物馆”，并在手机上回答关于它的占地面积和空间分布连线形状的趣味问题！',
    storyContext: '找到自然博物馆中的博物馆',
    hints: [
      '第一问：请推断这些精美微缩的“小小博物馆”展陈真实的占地面积是多少。',
      '第二问：请移步展厅环顾四周，寻找这几个独立“小小博物馆”在空间中分布的位置，并将其连线看一看是什么形状。'
    ],
    correctAnswer: 'MUSEUM_COMPLETED'
  }
];
