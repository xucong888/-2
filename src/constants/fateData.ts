export const COUNTRIES = [
  { label: '中国', value: 'CN' },
  { label: '美国', value: 'US' },
  { label: '日本', value: 'JP' },
  { label: '英国', value: 'UK' },
];

export const PROVINCES: Record<string, { label: string; value: string }[]> = {
  'CN': [
    { label: '北京', value: 'BJ' },
    { label: '上海', value: 'SH' },
    { label: '广东', value: 'GD' },
    { label: '浙江', value: 'ZJ' },
    { label: '四川', value: 'SC' },
  ],
  'US': [
    { label: '加利福尼亚州', value: 'CA' },
    { label: '纽约州', value: 'NY' },
    { label: '德克萨斯州', value: 'TX' },
  ]
};

export const CITIES: Record<string, { label: string; value: string }[]> = {
  'BJ': [{ label: '东城区', value: 'DC' }, { label: '西城区', value: 'XC' }, { label: '朝阳区', value: 'CY' }],
  'GD': [{ label: '广州', value: 'GZ' }, { label: '深圳', value: 'SZ' }, { label: '珠海', value: 'ZH' }],
  'CA': [{ label: '洛杉矶', value: 'LA' }, { label: '旧金山', value: 'SF' }],
};

export const getGanZhiYear = (year: number) => {
  const gan = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
  const zhi = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'];
  return `${gan[year % 10]}${zhi[year % 12]}`;
};

export const YEARS = Array.from({ length: 2030 - 1930 + 1 }, (_, i) => {
  const y = 1930 + i;
  return { label: `${y} (${getGanZhiYear(y)})`, value: y };
}).reverse();

export const SYSTEMS = [
  { id: 'bazi', label: '八字 (BaZi)', category: 'CN' },
  { id: 'ziwei', label: '紫微斗数 (Zi Wei)', category: 'CN' },
  { id: 'western', label: '西方星盘 (Western)', category: 'WEST' },
  { id: 'mbti', label: '性格分析 (MBTI)', category: 'PSYCH' },
];
