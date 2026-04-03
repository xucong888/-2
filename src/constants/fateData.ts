export const COUNTRIES = [
  { label: '中国', value: 'CN' },
  { label: '美国', value: 'US' },
  { label: '日本', value: 'JP' },
  { label: '英国', value: 'UK' },
  { label: '韩国', value: 'KR' },
  { label: '法国', value: 'FR' },
  { label: '德国', value: 'DE' },
  { label: '意大利', value: 'IT' },
  { label: '西班牙', value: 'ES' },
  { label: '加拿大', value: 'CA' },
  { label: '澳大利亚', value: 'AU' },
  { label: '新加坡', value: 'SG' },
  { label: '马来西亚', value: 'MY' },
  { label: '泰国', value: 'TH' },
  { label: '印度', value: 'IN' },
];

export const PROVINCES: Record<string, { label: string; value: string }[]> = {
  'CN': [
    { label: '北京', value: 'BJ' },
    { label: '上海', value: 'SH' },
    { label: '天津', value: 'TJ' },
    { label: '重庆', value: 'CQ' },
    { label: '广东', value: 'GD' },
    { label: '浙江', value: 'ZJ' },
    { label: '江苏', value: 'JS' },
    { label: '山东', value: 'SD' },
    { label: '河南', value: 'HN' },
    { label: '四川', value: 'SC' },
    { label: '湖北', value: 'HB' },
    { label: '湖南', value: 'HN' },
    { label: '福建', value: 'FJ' },
    { label: '安徽', value: 'AH' },
    { label: '陕西', value: 'SN' },
    { label: '河北', value: 'HE' },
    { label: '辽宁', value: 'LN' },
    { label: '黑龙江', value: 'HL' },
    { label: '吉林', value: 'JL' },
    { label: '甘肃', value: 'GS' },
    { label: '山西', value: 'SX' },
    { label: '江西', value: 'JX' },
    { label: '云南', value: 'YN' },
    { label: '广西', value: 'GX' },
    { label: '贵州', value: 'GZ' },
    { label: '海南', value: 'HI' },
    { label: '宁夏', value: 'NX' },
    { label: '青海', value: 'QH' },
    { label: '西藏', value: 'XZ' },
    { label: '新疆', value: 'XJ' },
    { label: '内蒙古', value: 'NM' },
    { label: '台湾', value: 'TW' },
    { label: '香港', value: 'HK' },
    { label: '澳门', value: 'MO' },
  ],
  'US': [
    { label: '加利福尼亚州', value: 'CA' },
    { label: '纽约州', value: 'NY' },
    { label: '德克萨斯州', value: 'TX' },
    { label: '佛罗里达州', value: 'FL' },
    { label: '伊利诺伊州', value: 'IL' },
    { label: '宾夕法尼亚州', value: 'PA' },
    { label: '俄亥俄州', value: 'OH' },
    { label: '乔治亚州', value: 'GA' },
    { label: '密歇根州', value: 'MI' },
    { label: '新泽西州', value: 'NJ' },
  ],
  'JP': [
    { label: '东京都', value: 'TK' },
    { label: '大阪府', value: 'OS' },
    { label: '京都府', value: 'KT' },
    { label: '北海道', value: 'HK' },
    { label: '神奈川县', value: 'KN' },
  ],
  'UK': [
    { label: '英格兰', value: 'EN' },
    { label: '苏格兰', value: 'SC' },
    { label: '威尔士', value: 'WL' },
    { label: '北爱尔兰', value: 'NI' },
  ],
  'KR': [
    { label: '首尔特别市', value: 'SE' },
    { label: '釜山广域市', value: 'BS' },
    { label: '大邱广域市', value: 'DG' },
    { label: '仁川广域市', value: 'IC' },
  ],
  'FR': [
    { label: '巴黎', value: 'PA' },
    { label: '马赛', value: 'MA' },
    { label: '里昂', value: 'LY' },
  ],
  'DE': [
    { label: '柏林', value: 'BE' },
    { label: '慕尼黑', value: 'MU' },
    { label: '汉堡', value: 'HH' },
  ],
  'IT': [
    { label: '罗马', value: 'RM' },
    { label: '米兰', value: 'MI' },
    { label: '威尼斯', value: 'VE' },
  ],
  'ES': [
    { label: '马德里', value: 'MD' },
    { label: '巴塞罗那', value: 'BC' },
    { label: '瓦伦西亚', value: 'VL' },
  ],
  'CA': [
    { label: '安大略省', value: 'ON' },
    { label: '魁北克省', value: 'QC' },
    { label: '不列颠哥伦比亚省', value: 'BC' },
  ],
  'AU': [
    { label: '新南威尔士州', value: 'NSW' },
    { label: '维多利亚州', value: 'VIC' },
    { label: '昆士兰州', value: 'QLD' },
  ],
  'SG': [
    { label: '新加坡', value: 'SG' },
  ],
  'MY': [
    { label: '吉隆坡', value: 'KL' },
    { label: '槟城', value: 'PG' },
    { label: '柔佛', value: 'JH' },
  ],
  'TH': [
    { label: '曼谷', value: 'BK' },
    { label: '清迈', value: 'CM' },
    { label: '普吉岛', value: 'PP' },
  ],
  'IN': [
    { label: '德里', value: 'DL' },
    { label: '孟买', value: 'MU' },
    { label: '加尔各答', value: 'CC' },
  ],
};

export const CITIES: Record<string, { label: string; value: string }[]> = {
  'BJ': [
    { label: '东城区', value: 'DC' },
    { label: '西城区', value: 'XC' },
    { label: '朝阳区', value: 'CY' },
    { label: '海淀区', value: 'HD' },
    { label: '丰台区', value: 'FT' },
    { label: '石景山区', value: 'SJS' },
    { label: '通州区', value: 'TZ' },
    { label: '顺义区', value: 'SY' },
    { label: '大兴区', value: 'DX' },
  ],
  'SH': [
    { label: '黄浦区', value: 'HP' },
    { label: '徐汇区', value: 'XH' },
    { label: '长宁区', value: 'CN' },
    { label: '静安区', value: 'JA' },
    { label: '普陀区', value: 'PT' },
    { label: '虹口区', value: 'HK' },
    { label: '杨浦区', value: 'YP' },
    { label: '浦东新区', value: 'PDX' },
    { label: '闵行区', value: 'MH' },
  ],
  'TJ': [
    { label: '和平区', value: 'HP' },
    { label: '河东区', value: 'HD' },
    { label: '河西区', value: 'HX' },
    { label: '南开区', value: 'NK' },
    { label: '河北区', value: 'HB' },
    { label: '红桥区', value: 'HQ' },
  ],
  'CQ': [
    { label: '渝中区', value: 'YZ' },
    { label: '万州区', value: 'WZ' },
    { label: '涪陵区', value: 'FL' },
    { label: '江北区', value: 'JB' },
    { label: '沙坪坝区', value: 'SPB' },
  ],
  'GD': [
    { label: '广州', value: 'GZ' },
    { label: '深圳', value: 'SZ' },
    { label: '珠海', value: 'ZH' },
    { label: '汕头', value: 'ST' },
    { label: '佛山', value: 'FS' },
    { label: '韶关', value: 'SG' },
    { label: '湛江', value: 'ZJ' },
    { label: '肇庆', value: 'ZQ' },
    { label: '江门', value: 'JM' },
    { label: '茂名', value: 'MM' },
    { label: '惠州', value: 'HZ' },
    { label: '梅州', value: 'MZ' },
    { label: '汕尾', value: 'SW' },
    { label: '河源', value: 'HY' },
    { label: '阳江', value: 'YJ' },
    { label: '清远', value: 'QY' },
    { label: '东莞', value: 'DG' },
    { label: '中山', value: 'ZS' },
    { label: '潮州', value: 'CZ' },
    { label: '揭阳', value: 'JY' },
    { label: '云浮', value: 'YF' },
  ],
  'ZJ': [
    { label: '杭州', value: 'HZ' },
    { label: '宁波', value: 'NB' },
    { label: '温州', value: 'WZ' },
    { label: '绍兴', value: 'SX' },
    { label: '湖州', value: 'HZ' },
    { label: '嘉兴', value: 'JX' },
    { label: '金华', value: 'JH' },
    { label: '衢州', value: 'QZ' },
    { label: '舟山', value: 'ZS' },
    { label: '台州', value: 'TZ' },
    { label: '丽水', value: 'LS' },
  ],
  'JS': [
    { label: '南京', value: 'NJ' },
    { label: '无锡', value: 'WX' },
    { label: '徐州', value: 'XZ' },
    { label: '常州', value: 'CZ' },
    { label: '苏州', value: 'SZ' },
    { label: '南通', value: 'NT' },
    { label: '连云港', value: 'LYG' },
    { label: '淮安', value: 'HA' },
    { label: '盐城', value: 'YC' },
    { label: '扬州', value: 'YZ' },
    { label: '镇江', value: 'ZJ' },
    { label: '泰州', value: 'TZ' },
    { label: '宿迁', value: 'SQ' },
  ],
  'SD': [
    { label: '济南', value: 'JN' },
    { label: '青岛', value: 'QD' },
    { label: '淄博', value: 'ZB' },
    { label: '枣庄', value: 'ZZ' },
    { label: '东营', value: 'DY' },
    { label: '烟台', value: 'YT' },
    { label: '潍坊', value: 'WF' },
    { label: '济宁', value: 'JN' },
    { label: '泰安', value: 'TA' },
    { label: '威海', value: 'WH' },
    { label: '日照', value: 'RZ' },
    { label: '临沂', value: 'LY' },
    { label: '德州', value: 'DZ' },
    { label: '聊城', value: 'LC' },
    { label: '滨州', value: 'BZ' },
    { label: '菏泽', value: 'HZ' },
  ],
  'HN': [
    { label: '郑州', value: 'ZZ' },
    { label: '开封', value: 'KF' },
    { label: '洛阳', value: 'LY' },
    { label: '平顶山', value: 'PDS' },
    { label: '安阳', value: 'AY' },
    { label: '鹤壁', value: 'HB' },
    { label: '新乡', value: 'XX' },
    { label: '焦作', value: 'JZ' },
    { label: '濮阳', value: 'PY' },
    { label: '许昌', value: 'XC' },
    { label: '漯河', value: 'LH' },
    { label: '三门峡', value: 'SMX' },
    { label: '南阳', value: 'NY' },
    { label: '商丘', value: 'SQ' },
    { label: '信阳', value: 'XY' },
    { label: '周口', value: 'ZK' },
    { label: '驻马店', value: 'ZMD' },
  ],
  'SC': [
    { label: '成都', value: 'CD' },
    { label: '自贡', value: 'ZG' },
    { label: '攀枝花', value: 'PZH' },
    { label: '泸州', value: 'LZ' },
    { label: '德阳', value: 'DY' },
    { label: '绵阳', value: 'MY' },
    { label: '广元', value: 'GY' },
    { label: '遂宁', value: 'SN' },
    { label: '内江', value: 'NJ' },
    { label: '乐山', value: 'LS' },
    { label: '南充', value: 'NC' },
    { label: '眉山', value: 'MS' },
    { label: '宜宾', value: 'YB' },
    { label: '广安', value: 'GA' },
    { label: '达州', value: 'DZ' },
    { label: '雅安', value: 'YA' },
    { label: '巴中', value: 'BZ' },
    { label: '资阳', value: 'ZY' },
  ],
  'CA': [
    { label: '洛杉矶', value: 'LA' },
    { label: '旧金山', value: 'SF' },
    { label: '圣迭戈', value: 'SD' },
    { label: '圣何塞', value: 'SJ' },
    { label: '弗雷斯诺', value: 'FRE' },
  ],
  'NY': [
    { label: '纽约市', value: 'NYC' },
    { label: '布法罗', value: 'BUF' },
    { label: '罗切斯特', value: 'ROC' },
    { label: '奥尔巴尼', value: 'ALB' },
  ],
  'TX': [
    { label: '休斯顿', value: 'HOU' },
    { label: '达拉斯', value: 'DAL' },
    { label: '圣安东尼奥', value: 'SA' },
    { label: '奥斯汀', value: 'AUS' },
    { label: '沃斯堡', value: 'FW' },
  ],
  'TK': [
    { label: '东京', value: 'TK' },
  ],
  'OS': [
    { label: '大阪', value: 'OS' },
  ],
  'KT': [
    { label: '京都', value: 'KT' },
  ],
  'HK': [
    { label: '札幌', value: 'SAP' },
    { label: '函馆', value: 'HK' },
  ],
  'KN': [
    { label: '横滨', value: 'YOK' },
    { label: '川崎', value: 'KAW' },
    { label: '相模原', value: 'SAG' },
  ],
  'EN': [
    { label: '伦敦', value: 'LON' },
    { label: '伯明翰', value: 'BIR' },
    { label: '曼彻斯特', value: 'MAN' },
    { label: '利物浦', value: 'LIV' },
  ],
  'SC': [
    { label: '爱丁堡', value: 'EDI' },
    { label: '格拉斯哥', value: 'GLA' },
  ],
  'WL': [
    { label: '加的夫', value: 'CAR' },
  ],
  'NI': [
    { label: '贝尔法斯特', value: 'BEL' },
  ],
  'SE': [
    { label: '首尔', value: 'SEL' },
  ],
  'BS': [
    { label: '釜山', value: 'BUS' },
  ],
  'DG': [
    { label: '大邱', value: 'DAE' },
  ],
  'IC': [
    { label: '仁川', value: 'ICH' },
  ],
  'PA': [
    { label: '巴黎', value: 'PAR' },
  ],
  'MA': [
    { label: '马赛', value: 'MAR' },
  ],
  'LY': [
    { label: '里昂', value: 'LYO' },
  ],
  'BE': [
    { label: '柏林', value: 'BER' },
  ],
  'MU': [
    { label: '慕尼黑', value: 'MUN' },
  ],
  'HH': [
    { label: '汉堡', value: 'HAM' },
  ],
  'RM': [
    { label: '罗马', value: 'ROM' },
  ],
  'MI': [
    { label: '米兰', value: 'MIL' },
  ],
  'VE': [
    { label: '威尼斯', value: 'VEN' },
  ],
  'MD': [
    { label: '马德里', value: 'MAD' },
  ],
  'BC': [
    { label: '巴塞罗那', value: 'BAR' },
  ],
  'VL': [
    { label: '瓦伦西亚', value: 'VAL' },
  ],
  'ON': [
    { label: '多伦多', value: 'TOR' },
    { label: '渥太华', value: 'OTT' },
  ],
  'QC': [
    { label: '蒙特利尔', value: 'MON' },
    { label: '魁北克市', value: 'QUE' },
  ],
  'BC': [
    { label: '温哥华', value: 'VAN' },
    { label: '维多利亚', value: 'VIC' },
  ],
  'NSW': [
    { label: '悉尼', value: 'SYD' },
    { label: '纽卡斯尔', value: 'NEW' },
  ],
  'VIC': [
    { label: '墨尔本', value: 'MEL' },
    { label: '吉朗', value: 'GEE' },
  ],
  'QLD': [
    { label: '布里斯班', value: 'BRI' },
    { label: '黄金海岸', value: 'GC' },
  ],
  'SG': [
    { label: '新加坡', value: 'SGP' },
  ],
  'KL': [
    { label: '吉隆坡', value: 'KUL' },
  ],
  'PG': [
    { label: '乔治市', value: 'PEN' },
  ],
  'JH': [
    { label: '新山', value: 'JB' },
  ],
  'BK': [
    { label: '曼谷', value: 'BKK' },
  ],
  'CM': [
    { label: '清迈', value: 'CNX' },
  ],
  'PP': [
    { label: '普吉岛', value: 'HKT' },
  ],
  'DL': [
    { label: '新德里', value: 'DEL' },
  ],
  'MU': [
    { label: '孟买', value: 'BOM' },
  ],
  'CC': [
    { label: '加尔各答', value: 'CCU' },
  ],
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
