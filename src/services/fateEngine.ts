import { Lunar, Solar, IHoliday, SolarMonth, LunarUtil } from 'lunar-javascript';

export interface BaziPillar {
  gan: string;
  zhi: string;
  tenGod: string;
  hiddenStems: { gan: string; tenGod: string }[];
  naYin: string;
  kongWang: string;
  shenSha: string[];
}

export interface BaziData {
  pillars: {
    year: BaziPillar;
    month: BaziPillar;
    day: BaziPillar;
    hour: BaziPillar;
  };
  fiveElements: Record<string, { percentage: number; strength: string }>;
  dayMaster: {
    element: string;
    description: string;
    strength: string;
  };
}

export interface BoneWeightData {
  weight: string;
  fortune: string;
}

export interface ZiweiData {
  solarDate?: string;
  lunarDate?: string;
  hour?: string;
  lifeMaster?: string;
  bodyMaster?: string;
  zodiac?: string;
  palaces: { 
    name: string; 
    zhi: string; 
    index: number;
    stars: string[];
    age: number[];
  }[];
}

export function calculateBoneWeight(date: Date): BoneWeightData {
  return {
    weight: '5两3钱',
    fortune: '此命生来多富贵，衣禄丰足享太平。一生安稳多贵人，晚年荣华福寿全。'
  };
}

function getShenSha(dayGan: string, yearZhi: string, dayZhi: string, zhi: string): string[] {
  const shensha: string[] = [];
  
  // 天乙贵人
  const tianYi: Record<string, string[]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['午', '寅']
  };
  if (tianYi[dayGan]?.includes(zhi)) shensha.push('天乙贵人');

  // 太极贵人
  const taiJi: Record<string, string[]> = {
    '甲': ['子', '午'], '乙': ['子', '午'],
    '丙': ['卯', '酉'], '丁': ['卯', '酉'],
    '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
    '庚': ['寅', '亥'], '辛': ['寅', '亥'],
    '壬': ['巳', '申'], '癸': ['巳', '申']
  };
  if (taiJi[dayGan]?.includes(zhi)) shensha.push('太极贵人');

  // 文昌贵人
  const wenChang: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '戊': '申', '丁': '酉', '己': '酉',
    '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  if (wenChang[dayGan] === zhi) shensha.push('文昌贵人');

  // 禄神
  const luShen: Record<string, string> = {
    '甲': '寅', '乙': '卯', '丙': '巳', '戊': '巳', '丁': '午', '己': '午',
    '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  if (luShen[dayGan] === zhi) shensha.push('禄神');

  // 羊刃
  const yangRen: Record<string, string> = {
    '甲': '卯', '乙': '辰', '丙': '午', '戊': '午', '丁': '未', '己': '未',
    '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑'
  };
  if (yangRen[dayGan] === zhi) shensha.push('羊刃');

  // 驿马
  const yiMa: Record<string, string> = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '巳': '亥', '酉': '亥', '丑': '亥',
    '亥': '巳', '卯': '巳', '未': '巳'
  };
  if (yiMa[yearZhi] === zhi || yiMa[dayZhi] === zhi) shensha.push('驿马');

  // 桃花 (咸池)
  const taoHua: Record<string, string> = {
    '申': '酉', '子': '酉', '辰': '酉',
    '寅': '卯', '午': '卯', '戌': '卯',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子'
  };
  if (taoHua[yearZhi] === zhi || taoHua[dayZhi] === zhi) shensha.push('桃花');

  // 华盖
  const huaGai: Record<string, string> = {
    '申': '辰', '子': '辰', '辰': '辰',
    '寅': '戌', '午': '戌', '戌': '戌',
    '巳': '丑', '酉': '丑', '丑': '丑',
    '亥': '未', '卯': '未', '未': '未'
  };
  if (huaGai[yearZhi] === zhi || huaGai[dayZhi] === zhi) shensha.push('华盖');

  // 将星
  const jiangXing: Record<string, string> = {
    '申': '子', '子': '子', '辰': '子',
    '寅': '午', '午': '午', '戌': '午',
    '巳': '酉', '酉': '酉', '丑': '酉',
    '亥': '卯', '卯': '卯', '未': '卯'
  };
  if (jiangXing[yearZhi] === zhi || jiangXing[dayZhi] === zhi) shensha.push('将星');

  // 劫煞
  const jieSha: Record<string, string> = {
    '申': '巳', '子': '巳', '辰': '巳',
    '寅': '亥', '午': '亥', '戌': '亥',
    '巳': '寅', '酉': '寅', '丑': '寅',
    '亥': '申', '卯': '申', '未': '申'
  };
  if (jieSha[yearZhi] === zhi || jieSha[dayZhi] === zhi) shensha.push('劫煞');

  // 亡神
  const wangShen: Record<string, string> = {
    '申': '亥', '子': '亥', '辰': '亥',
    '寅': '巳', '午': '巳', '戌': '巳',
    '巳': '申', '酉': '申', '丑': '申',
    '亥': '寅', '卯': '寅', '未': '寅'
  };
  if (wangShen[yearZhi] === zhi || wangShen[dayZhi] === zhi) shensha.push('亡神');

  // 金舆
  const jinYu: Record<string, string> = {
    '甲': '辰', '乙': '巳', '丙': '未', '丁': '申', '戊': '未', '己': '申',
    '庚': '戌', '辛': '亥', '壬': '丑', '癸': '寅'
  };
  if (jinYu[dayGan] === zhi) shensha.push('金舆');

  return Array.from(new Set(shensha));
}

function getElement(char: string): string {
  if ('甲乙寅卯'.includes(char)) return '木';
  if ('丙丁巳午'.includes(char)) return '火';
  if ('戊己辰戌丑未'.includes(char)) return '土';
  if ('庚辛申酉'.includes(char)) return '金';
  if ('壬癸亥子'.includes(char)) return '水';
  return '';
}

function calculateFiveElements(eightChar: any): BaziData['fiveElements'] {
  const elements = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  const stems = [
    eightChar.getYearGan(),
    eightChar.getMonthGan(),
    eightChar.getDayGan(),
    eightChar.getTimeGan()
  ];
  
  const branches = [
    eightChar.getYearZhi(),
    eightChar.getMonthZhi(),
    eightChar.getDayZhi(),
    eightChar.getTimeZhi()
  ];

  // 优化后的专业权重计算
  // 天干：各 100 分（共 400 分）
  // 地支藏干：年支 100，月支 450（月令权重 1.5 倍），日支 150，时支 150
  // 总计：1150 分基准
  
  stems.forEach(s => {
    const el = getElement(s);
    if (el) elements[el as keyof typeof elements] += 100;
  });

  // 月令权重 1.5 倍：月支 450 分（本气 60% = 270，中气 30% = 135，余气 10% = 45）
  const branchWeights = [100, 450, 150, 150]; // Year, Month (1.5x), Day, Hour
  
  // 地支藏干权重（本气/中气/余气）
  const zhiHideGan: Record<string, { gan: string; weight: number }[]> = {
    '子': [{ gan: '癸', weight: 100 }],
    '丑': [{ gan: '己', weight: 60 }, { gan: '癸', weight: 30 }, { gan: '辛', weight: 10 }],
    '寅': [{ gan: '甲', weight: 60 }, { gan: '丙', weight: 30 }, { gan: '戊', weight: 10 }],
    '卯': [{ gan: '乙', weight: 100 }],
    '辰': [{ gan: '戊', weight: 60 }, { gan: '乙', weight: 30 }, { gan: '癸', weight: 10 }],
    '巳': [{ gan: '丙', weight: 60 }, { gan: '庚', weight: 30 }, { gan: '戊', weight: 10 }],
    '午': [{ gan: '丁', weight: 70 }, { gan: '己', weight: 30 }],
    '未': [{ gan: '己', weight: 60 }, { gan: '丁', weight: 30 }, { gan: '乙', weight: 10 }],
    '申': [{ gan: '庚', weight: 60 }, { gan: '壬', weight: 30 }, { gan: '戊', weight: 10 }],
    '酉': [{ gan: '辛', weight: 100 }],
    '戌': [{ gan: '戊', weight: 60 }, { gan: '辛', weight: 30 }, { gan: '丁', weight: 10 }],
    '亥': [{ gan: '壬', weight: 70 }, { gan: '甲', weight: 30 }]
  };

  branches.forEach((b, i) => {
    const weight = branchWeights[i];
    const hides = zhiHideGan[b];
    if (hides) {
      hides.forEach(({ gan, weight: percent }) => {
        const el = getElement(gan);
        if (el) elements[el as keyof typeof elements] += (weight * percent) / 100;
      });
    }
  });

  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const result: any = {};
  
  Object.entries(elements).forEach(([el, val]) => {
    const percentage = Math.round((val / total) * 1000) / 10;
    let strength = '中庸';
    if (percentage < 10) strength = '极弱';
    else if (percentage < 18) strength = '较弱';
    else if (percentage > 35) strength = '极强';
    else if (percentage > 25) strength = '较强';
    
    result[el] = { percentage, strength };
  });

  return result;
}

export function calculateBazi(date: Date): BaziData {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2); // Use Sect 2 (Late Zi handling) which is standard for WenZhen
  
  const dayGan = eightChar.getDayGan();
  const yearZhi = eightChar.getYearZhi();
  const dayZhi = eightChar.getDayZhi();

  const createPillar = (
    gan: string, 
    zhi: string, 
    tenGod: string, 
    hideGan: string[], 
    hideTenGod: string[], 
    naYin: string, 
    kongWang: string
  ): BaziPillar => {
    const hiddenStems = hideGan.map((g, i) => ({
      gan: g,
      tenGod: hideTenGod[i] || ''
    }));

    return {
      gan,
      zhi,
      tenGod,
      hiddenStems,
      naYin,
      kongWang,
      shenSha: getShenSha(dayGan, yearZhi, dayZhi, zhi)
    };
  };

  const pillars = {
    year: createPillar(
      eightChar.getYearGan(), 
      eightChar.getYearZhi(), 
      eightChar.getYearShiShenGan(),
      eightChar.getYearHideGan(),
      eightChar.getYearShiShenZhi(),
      eightChar.getYearNaYin(),
      eightChar.getYearXunKong()
    ),
    month: createPillar(
      eightChar.getMonthGan(), 
      eightChar.getMonthZhi(), 
      eightChar.getMonthShiShenGan(),
      eightChar.getMonthHideGan(),
      eightChar.getMonthShiShenZhi(),
      eightChar.getMonthNaYin(),
      eightChar.getMonthXunKong()
    ),
    day: createPillar(
      eightChar.getDayGan(), 
      eightChar.getDayZhi(), 
      '日主',
      eightChar.getDayHideGan(),
      eightChar.getDayShiShenZhi(),
      eightChar.getDayNaYin(),
      eightChar.getDayXunKong()
    ),
    hour: createPillar(
      eightChar.getTimeGan(), 
      eightChar.getTimeZhi(), 
      eightChar.getTimeShiShenGan(),
      eightChar.getTimeHideGan(),
      eightChar.getTimeShiShenZhi(),
      eightChar.getTimeNaYin(),
      eightChar.getTimeXunKong()
    ),
  };

  const dayMasterMap: Record<string, { element: string, description: string }> = {
    '甲': { element: '阳木', description: '如参天大树 - 刚直不阿、志向高远、仁慈正直' },
    '乙': { element: '阴木', description: '如柔韧花草 - 灵活变通、温柔委婉、适应力强' },
    '丙': { element: '阳火', description: '如炽热太阳 - 热情开朗、光明磊落、急躁好胜' },
    '丁': { element: '阴火', description: '如烛火灯光 - 内敛细腻、温文尔雅、富有同情心' },
    '戊': { element: '阳土', description: '如厚重高山 - 稳重诚信、包容力强、固执保守' },
    '己': { element: '阴土', description: '如田园沃土 - 柔顺和谐、多才多艺、疑心较重' },
    '庚': { element: '阳金', description: '如刚硬刀剑 - 刚毅果断、讲究义气、好胜心强' },
    '辛': { element: '阴金', description: '如名贵珠宝 - 秀气灵动、自尊心强、追求完美' },
    '壬': { element: '阳水', description: '如奔腾江河 - 聪明机智、大气磅礴、随性而为' },
    '癸': { element: '阴水', description: '如绵绵细雨 - 阴柔灵动、富有幻想、耐力十足' }
  };

  const fiveElements = calculateFiveElements(eightChar);
  const dmElement = getElement(dayGan);
  
  // Calculate Day Master Strength
  // Support elements: Same element and Producing element
  const supportMap: Record<string, string[]> = {
    '木': ['木', '水'],
    '火': ['火', '木'],
    '土': ['土', '火'],
    '金': ['金', '土'],
    '水': ['水', '金']
  };
  
  const supports = supportMap[dmElement] || [];
  const supportScore = supports.reduce((acc, el) => acc + (fiveElements[el]?.percentage || 0), 0);
  
  let dmStrength = '中庸';
  if (supportScore > 65) dmStrength = '极强';
  else if (supportScore > 52) dmStrength = '偏强';
  else if (supportScore < 35) dmStrength = '极弱';
  else if (supportScore < 48) dmStrength = '偏弱';

  return {
    pillars,
    fiveElements,
    dayMaster: {
      ...(dayMasterMap[dayGan] || { element: '未知', description: '暂无描述' }),
      strength: dmStrength
    }
  };
}

export function getZodiac(date: Date) {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return lunar.getYearShengXiao();
}

export function getWesternZodiac(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const signs = ["摩羯", "水瓶", "双鱼", "白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手"];
  const lastDays = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
  return signs[day > lastDays[month - 1] ? month % 12 : month - 1];
}

export function calculateWesternAstrology(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Basic aspects (placeholder for more complex logic)
  const aspects = [
    { name: '太阳合木星', description: '乐观向上，富有正义感' },
    { name: '月亮三分金星', description: '情感细腻，审美能力强' }
  ];

  return {
    sunSign: getWesternZodiac(date),
    aspects
  };
}

export function calculateZiwei(date: Date, gender: 'male' | 'female' = 'male'): ZiweiData {
  // Ziwei considers 23:00 as the start of the next day
  let ziweiDate = new Date(date);
  if (ziweiDate.getHours() >= 23) {
    ziweiDate.setDate(ziweiDate.getDate() + 1);
  }
  
  const solar = Solar.fromDate(ziweiDate);
  const lunar = solar.getLunar();
  
  // 1. Determine Palace Positions (命宫、身宫)
  const month = lunar.getMonth();
  const hourIndex = lunar.getTimeZhiIndex(); // 1=Zi, 2=Chou...
  
  // Life Palace (命宫): Start from Yin (index 2), count forward by month, then backward by hour
  const lifePalaceZhiIdx = (2 + (month - 1) - (hourIndex - 1) + 12) % 12;
  // Body Palace (身宫): Start from Yin (index 2), count forward by month, then forward by hour
  const bodyPalaceZhiIdx = (2 + (month - 1) + (hourIndex - 1)) % 12;
  
  const palaceNames = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
  const zhiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 2. Determine Palace Stems (起五虎遁)
  const yearGan = lunar.getYearGan();
  const startGanMap: Record<string, number> = {
    '甲': 2, '己': 2, // 丙
    '乙': 4, '庚': 4, // 戊
    '丙': 6, '辛': 6, // 庚
    '丁': 8, '壬': 8, // 壬
    '戊': 0, '癸': 0  // 甲
  };
  const startGanIdx = startGanMap[yearGan];
  const ganNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  // 3. Determine Five Elements Bureau (定五行局)
  const lifePalaceGanIdx = (startGanIdx + (lifePalaceZhiIdx - 2 + 12) % 12) % 10;
  const lifePalaceGan = ganNames[lifePalaceGanIdx];
  const lifePalaceZhi = zhiNames[lifePalaceZhiIdx];
  
  const getBureau = (gan: string, zhi: string) => {
    const nayin = LunarUtil.NAYIN[gan + zhi];
    if (nayin.includes('水')) return { name: '水二局', value: 2 };
    if (nayin.includes('木')) return { name: '木三局', value: 3 };
    if (nayin.includes('金')) return { name: '金四局', value: 4 };
    if (nayin.includes('土')) return { name: '土五局', value: 5 };
    if (nayin.includes('火')) return { name: '火六局', value: 6 };
    return { name: '水二局', value: 2 };
  };
  
  const { name: bureauName, value: bureau } = getBureau(lifePalaceGan, lifePalaceZhi);
  
  // 4. Place Ziwei Star (定紫微星)
  const day = lunar.getDay();
  const ziweiZhiIdx = (function() {
    let x = 0;
    if (day % bureau === 0) {
      x = 0;
    } else {
      x = bureau - (day % bureau);
    }
    const q = (day + x) / bureau;
    if (x % 2 === 0) {
      return (2 + q + x) % 12;
    } else {
      return (2 + q - x + 12) % 12;
    }
  })();
  
  // 5. Place other 13 major stars
  const starsInPalaces: string[][] = Array(12).fill(0).map(() => []);
  
  // Ziwei group
  starsInPalaces[ziweiZhiIdx].push('紫微');
  starsInPalaces[(ziweiZhiIdx - 1 + 12) % 12].push('天机');
  starsInPalaces[(ziweiZhiIdx - 3 + 12) % 12].push('太阳');
  starsInPalaces[(ziweiZhiIdx - 4 + 12) % 12].push('武曲');
  starsInPalaces[(ziweiZhiIdx - 5 + 12) % 12].push('天同');
  starsInPalaces[(ziweiZhiIdx - 8 + 12) % 12].push('廉贞');
  
  // Tianfu group (mirrored from Ziwei across Yin-Shen axis)
  const tianfuZhiIdx = (4 - ziweiZhiIdx + 12) % 12;
  starsInPalaces[tianfuZhiIdx].push('天府');
  starsInPalaces[(tianfuZhiIdx + 1) % 12].push('太阴');
  starsInPalaces[(tianfuZhiIdx + 2) % 12].push('贪狼');
  starsInPalaces[(tianfuZhiIdx + 3) % 12].push('巨门');
  starsInPalaces[(tianfuZhiIdx + 4) % 12].push('天相');
  starsInPalaces[(tianfuZhiIdx + 5) % 12].push('天梁');
  starsInPalaces[(tianfuZhiIdx + 6) % 12].push('七杀');
  starsInPalaces[(tianfuZhiIdx + 10) % 12].push('破军');
  
  // 6. Six Lucky Stars
  // WenChang & WenQu (based on time)
  const wenQuIdx = (4 + lunar.getTimeZhiIndex()) % 12; // Chen + time
  const wenChangIdx = (10 - lunar.getTimeZhiIndex() + 12) % 12; // Xu - time
  starsInPalaces[wenQuIdx].push('文曲');
  starsInPalaces[wenChangIdx].push('文昌');

  // ZuoFu & YouBi (based on month)
  const zuoFuIdx = (4 + Math.abs(lunar.getMonth()) - 1) % 12;
  const youBiIdx = (10 - (Math.abs(lunar.getMonth()) - 1) + 12) % 12;
  starsInPalaces[zuoFuIdx].push('左辅');
  starsInPalaces[youBiIdx].push('右弼');

  // TianKui & TianYue (based on year gan)
  const kuiYueMap: Record<string, [string, string]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['午', '寅']
  };
  const [kuiZhi, yueZhi] = kuiYueMap[lunar.getYearGan()] || ['丑', '未'];
  const kuiIdx = (zhiNames.indexOf(kuiZhi) + 12) % 12;
  const yueIdx = (zhiNames.indexOf(yueZhi) + 12) % 12;
  starsInPalaces[kuiIdx].push('天魁');
  starsInPalaces[yueIdx].push('天钺');

  // 7. Assemble Palaces
  const yang = lunar.getYearGanIndex() % 2 === 0;
  const male = gender === 'male';
  const clockwise = (yang && male) || (!yang && !male);
  
  const palaces = zhiNames.map((zhi, i) => {
    const pIdx = (lifePalaceZhiIdx - i + 12) % 12;
    const name = palaceNames[pIdx];
    const isBody = i === bodyPalaceZhiIdx;
    
    // Decade fortune calculation
    let decadeStart = 0;
    const dist = clockwise ? (i - lifePalaceZhiIdx + 12) % 12 : (lifePalaceZhiIdx - i + 12) % 12;
    decadeStart = bureau + dist * 10;
    
    return {
      name: isBody ? `${name}(身)` : name,
      zhi: zhi,
      index: i,
      stars: starsInPalaces[i],
      age: [decadeStart, decadeStart + 9]
    };
  });

  // 7. Life Master and Body Master
  const lifeMasterMap = ['贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '武曲', '廉贞', '文曲', '禄存', '巨门'];
  const bodyMasterMap = ['火星', '天相', '天梁', '天同', '文昌', '天机', '火星', '天相', '天梁', '天同', '文昌', '天机'];
  
  return { 
    solarDate: solar.toFullString(),
    lunarDate: lunar.toFullString(),
    hour: lunar.getTimeZhi() + '时',
    lifeMaster: lifeMasterMap[lifePalaceZhiIdx],
    bodyMaster: bodyMasterMap[lunar.getYearZhiIndex()],
    zodiac: lunar.getYearShengXiao(),
    palaces 
  };
}
