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
    storyContext: '你手握一张申城水系图。从长江口、杭州湾到淀山湖，纵横交织的水流维系着本土水族与江南水乡的百年变迁。',
    hints: [
      '点击任意两个拼图块能将其直接互换位置。',
      '将拼图格回复 to 正确的排列（可利用拼图右下角的数字 1-9 辅助标记排列对齐）。',
      '拼图完全还原后，系统会自动解开关卡。无需输入地址核验，您可以直达下一章！'
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
    storyContext: '你置身于一面色彩斑斓的申城江湖与河口大展板前，在这里，丰富的微型生态微缩景观还原了上海本土鱼类的栖息地。仔细观察展板，你会发现大自然令人惊叹的共生奇观。',
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
    storyContext: '请移步到『江湖之境』展墙下方，寻找标有【滴水湖生态对比】与【浦南/浦东古老连通运河】的科学考察实测展板。仔细翻看或查阅这两个水生环境目前分别发现了多少种“鱼类”。把找齐的两个神奇数字记录下来，还原到下方的多样性比对盘中。',
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
    storyContext: '我们来到微型模拟鱼缸区，清澈的溪流中却充斥着人类留下的粗野痕迹和凶悍的外来入侵天敌。请将危害拖入对应的治理站，净化水生家园，协助九刺鱼进行繁育。',
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
    storyContext: '在真实的展厅「生存之战」区隐藏着一个“生命暗角”。这个暗角里悬挂着一个遮光的物理帘子，拉开它，遮蔽着的公敌生物究竟是什么？请在下方输入您的发现！',
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
    storyContext: '在真实的展厅中，分布着几个特别的“小小博物馆”，它们将微缩的水生家园精美地呈呈现于公众眼前。找到它们，仔细观察并解开谜题吧。',
    hints: [
      '第一问：请推断这些精美微缩的“小小博物馆”展陈真实的占地面积是多少。',
      '第二问：请移步展厅环顾四周，寻找这几个独立“小小博物馆”在空间中分布的位置，并将其连线看一看是什么形状。'
    ],
    correctAnswer: 'MUSEUM_COMPLETED'
  },
  {
    id: 7,
    type: 'grid',
    title: '3.2 终章结语：申城人人考查队 & 鱼干卡配对',
    subtitle: '多物种命运共同体 - 鱼类夹卡精密配比',
    speciesName: '多物种生态群落 (Native Aquatic Community)',
    scientificName: 'Shanghai Ichthyic Ecosystem',
    conservationStatus: 'Near Threatened',
    description: '打通上海的自然岸线与生态廊道，需要对多栖息地水量进行平衡管理。模拟实体展区的一排“鱼类夹子配对墙”。在这里，市民可通过悬挂鱼类纸质卡片与五个夹槽形成连通平衡。前4个流域配比数值分别为：3 (标准通道)、19 (高密度廊道)、13 (细小循环)、15 (宽体航道)。请按对角差与交点运算，计算出第5个“平衡闸”所需填入的常数！',
    storyContext: '你经历了千重难关，来到了物理大厅尽头的“人人都是鱼类调查员”互动区，前方赫然耸立着一台古质水流格栅控制器，数字矩阵中藏着大闸的闭锁密码。',
    hints: [
      '本关格栅完美对应了线下展区墙面高悬的“申水渔具格栅卡槽”。',
      '其核心是连点对称与常数运算平衡，第5幅画格代表着终极生态通达值。',
      '正确答案是核心平衡数【7】，请直接在下方选键中触发并提交！'
    ],
    correctAnswer: '7'
  }
];
