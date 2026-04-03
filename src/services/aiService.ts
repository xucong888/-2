// 火山方舟 API 配置
const ARK_API_KEY = '92e7669d-4a53-49bb-99fa-e81262096cb6';
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const ARK_MODEL = 'ep-20260402174320-2ghnf';

interface ArkMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callArkApi(messages: ArkMessage[], temperature: number = 0.7): Promise<string> {
  try {
    const response = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: ARK_MODEL,
        messages,
        temperature,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Ark API Error:', error);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '抱歉，解读生成失败。';
  } catch (error) {
    console.error('Ark API Error:', error);
    return '抱歉，AI 解读暂时无法生成。请稍后再试。';
  }
}

// 构建结构化分析数据
function buildStructuredData(fateData: any) {
  const bazi = fateData.bazi;
  if (!bazi) return null;

  // 计算喜用神
  const dayMaster = bazi.dayMaster;
  const fiveElements = bazi.fiveElements;
  
  // 根据日主强弱判断喜用神
  const isStrong = dayMaster.strength === '偏强' || dayMaster.strength === '极强';
  const isWeak = dayMaster.strength === '偏弱' || dayMaster.strength === '极弱';
  
  // 五行生克关系
  const produces: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  };
  const overcomes: Record<string, string> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
  };
  const producedBy: Record<string, string> = {
    '火': '木', '土': '火', '金': '土', '水': '金', '木': '水'
  };
  const overcomeBy: Record<string, string> = {
    '土': '木', '水': '土', '火': '水', '金': '火', '木': '金'
  };

  const dmElement = dayMaster.element.charAt(0); // 取五行首字
  
  let xiYong = '';
  let jiShen = '';
  
  if (isStrong) {
    // 身强：克我、泄我者为喜用
    xiYong = overcomeBy[dmElement] || '';
    jiShen = produces[dmElement] || '';
  } else if (isWeak) {
    // 身弱：生我、同我者为喜用
    xiYong = producedBy[dmElement] || '';
    jiShen = overcomeBy[dmElement] || '';
  } else {
    // 中庸：根据五行分布调整
    const sorted = Object.entries(fiveElements)
      .sort((a: any, b: any) => a[1].percentage - b[1].percentage);
    xiYong = sorted[0]?.[0] || '';
    jiShen = sorted[sorted.length - 1]?.[0] || '';
  }

  return {
    dayMaster: {
      gan: bazi.pillars.day.gan,
      element: dayMaster.element,
      strength: dayMaster.strength,
      description: dayMaster.description
    },
    fiveElements,
    xiYongShen: xiYong,
    jiShen: jiShen,
    pillars: bazi.pillars,
    shenSha: {
      year: bazi.pillars.year.shenSha,
      month: bazi.pillars.month.shenSha,
      day: bazi.pillars.day.shenSha,
      hour: bazi.pillars.hour.shenSha
    }
  };
}

export async function getUnifiedInterpretation(
  birthInfo: any, 
  fateData: any, 
  depth: 'quick' | 'deep' = 'quick'
) {
  const structuredData = buildStructuredData(fateData);
  
  const systemPrompt = `你是一位融合子平八字与紫微斗数的命理分析专家，拥有20年实战经验。你的分析风格参考资深命理师"天承"的参考报告。

【核心原则】
1. 数据驱动：所有结论必须基于提供的结构化数据，禁止编造
2. 专业严谨：使用标准命理术语，解释清晰易懂
3. 人文关怀：语气温暖，给予建设性建议，避免宿命论
4. 交叉验证：八字与紫微结论相互印证，矛盾处明确指出

【分析框架】
1. 格局定调：日主强弱 + 五行分布 → 确定基本格局
2. 交叉证据：八字十神 + 紫微主星 → 双重验证性格特质
3. 动态推演：喜用神 → 运势起伏 → 具体建议

【输出规范】
- 快速分析：1500-2000字，聚焦核心特质与近期建议
- 深度分析：5000-8000字，包含10个章节完整分析`;

  const userPrompt = `请为以下用户提供${depth === 'deep' ? '深度' : '快速'}命理分析。

【用户资料】
姓名：${birthInfo.name || '未提供'}
性别：${birthInfo.gender === 'male' ? '男' : '女'}
出生：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${birthInfo.hour}时${birthInfo.minute || 0}分
农历/公历：${birthInfo.calendarType === 'solar' ? '公历' : '农历'}
生肖：${fateData.zodiac}
星座：${fateData.westernZodiac}

【八字结构化数据】
${structuredData ? JSON.stringify(structuredData, null, 2) : '未提供'}

${fateData.ziwei ? `【紫微斗数数据】
命宫主星：${fateData.ziwei.lifeMaster}
身宫主星：${fateData.ziwei.bodyMaster}
五行局：${fateData.ziwei.palaces?.[0]?.stars?.join('、') || '未计算'}
` : ''}

${fateData.mbti ? `【MBTI类型】
${fateData.mbti.energy}${fateData.mbti.perception}${fateData.mbti.judgment}${fateData.mbti.lifestyle}
` : ''}

【输出要求】
${depth === 'deep' ? `
请按以下10个章节输出：
1. 命局总览（日主特性、五行分布、格局判定）
2. 性格解码（核心特质、优势短板、行为模式）
3. 事业财富（职业倾向、财富格局、发展建议）
4. 感情婚姻（情感模式、配偶特质、相处之道）
5. 健康提示（五行对应、潜在隐患、调养建议）
6. 十年大运（每步大运分析，重点标注关键年份）
7. 流年运势（2025-2027年逐年详解）
8. 喜用指南（喜用神解析、开运建议、避忌提示）
9. 紫微印证（紫微主星与八字结论的交叉验证）
10. 人生建议（综合建议、心态调整、行动指南）

字数要求：5000-8000字
语气：专业、温暖、有洞察力
` : `
请按以下5个章节输出：
1. 命局概览（日主特性、五行强弱、基本格局）
2. 性格画像（核心特质、3个关键词、行为倾向）
3. 事业财运（适合方向、财富趋势、近期建议）
4. 感情人际（情感模式、相处建议）
5. 开运指南（喜用神、近期注意事项、行动建议）

字数要求：1500-2000字
语气：精炼、直击要点、有启发性
`}

【强制要求】
- 所有分析必须基于提供的结构化数据
- 禁止编造任何未提供的信息
- 日主强弱判断必须明确说明依据
- 喜用神分析必须有五行分布数据支撑`;

  const messages: ArkMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  return await callArkApi(messages, depth === 'deep' ? 0.7 : 0.5);
}

export async function chatWithMaster(
  birthInfo: any, 
  fateData: any, 
  history: { role: 'user' | 'model'; text: string }[], 
  message: string
) {
  const structuredData = buildStructuredData(fateData);
  
  const systemPrompt = `你是一位经验丰富的命理分析师，正在与用户进行对话。

【用户背景】
姓名：${birthInfo.name || '未提供'}
性别：${birthInfo.gender === 'male' ? '男' : '女'}
出生：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日

【八字核心信息】
${structuredData ? `
日主：${structuredData.dayMaster.gan}（${structuredData.dayMaster.element}）
日主强弱：${structuredData.dayMaster.strength}
喜用神：${structuredData.xiYongShen}
忌神：${structuredData.jiShen}
` : '未提供'}

【对话原则】
1. 基于用户命盘数据回答，不编造信息
2. 语气专业但亲切，像资深顾问
3. 给出具体、可操作的建议
4. 涉及预测时保持谨慎，强调个人努力的重要性`;

  const messages: ArkMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.text
    }) as ArkMessage),
    { role: 'user', content: message }
  ];

  return await callArkApi(messages, 0.8);
}
