import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getUnifiedInterpretation(birthInfo: any, fateData: any, depth: 'quick' | 'deep' = 'quick') {
  const prompt = `
    你是一个精通东西方命理的AI大师。请根据以下用户出生信息和排盘数据，提供一个${depth === 'deep' ? '极其详尽、万字长文级别的深度' : '精炼、直击要点的'}跨体系交叉验证的命理分析报告。
    
    用户信息:
    姓名: ${birthInfo.name || '未知'}
    性别: ${birthInfo.gender === 'male' ? '男' : '女'}
    出生日期: ${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 (${birthInfo.calendarType === 'solar' ? '公历' : '农历'})
    出生时间: ${birthInfo.hour}时${birthInfo.minute || 0}分
    出生地点: ${birthInfo.country} ${birthInfo.province} ${birthInfo.city}
    
    排盘数据:
    ${fateData.bazi ? `八字: ${JSON.stringify(fateData.bazi)}` : ''}
    ${fateData.ziwei ? `紫微斗数: ${JSON.stringify(fateData.ziwei)}` : ''}
    ${fateData.western ? `西方星盘: ${JSON.stringify(fateData.western)}` : ''}
    ${fateData.mbti ? `MBTI: ${JSON.stringify(fateData.mbti)}` : ''}
    生肖: ${fateData.zodiac}
    星座: ${fateData.westernZodiac}
    
    请按以下结构输出（使用Markdown格式）：
    1. **核心格局**: 综合多维数据，描述用户的本质性格和人生底色。
    2. **体系交叉验证**: 寻找不同体系（如八字与MBTI，或紫微与星盘）之间的共性与冲突点，给出深度见解。
    3. **事业与财富**: 基于命盘分析职业倾向、财富机遇及潜在挑战。
    4. **感情与人际**: 描述情感模式、社交特质及建议。
    ${depth === 'deep' ? `
    5. **十年大运分析**: 详细分析未来十年的运势起伏。
    6. **流年运势**: 针对当前及未来两年的具体建议。
    7. **身心健康与平衡**: 给出五行平衡及心理健康的深度指导。
    ` : ''}
    ${depth === 'deep' ? '8' : '5'}. **静谧指南**: 给出一个具有启发性的、侧重于内心平静与自我成长的年度行动建议。
    
    语气要专业、深邃、富有启发性，避免迷信，侧重于心理分析和人生指导。${depth === 'deep' ? '深度解读要求内容丰富，逻辑严密，字数不少于1500字。' : '快速解读要求言简意赅，重点突出。'}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Interpretation Error:", error);
    return "抱歉，AI 解读暂时无法生成。请稍后再试。";
  }
}

export async function chatWithMaster(
  birthInfo: any, 
  fateData: any, 
  history: { role: 'user' | 'model'; text: string }[], 
  message: string
) {
  const systemInstruction = `
    你是一个精通东西方命理的AI大师。你已经为用户生成了一份命理报告。
    现在用户正在与你对话，请结合他们的出生信息和排盘数据回答他们的问题。
    
    用户信息:
    姓名: ${birthInfo.name || '未知'}
    性别: ${birthInfo.gender === 'male' ? '男' : '女'}
    出生日期: ${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
    
    排盘数据:
    ${fateData.bazi ? `八字: ${JSON.stringify(fateData.bazi)}` : ''}
    ${fateData.ziwei ? `紫微斗数: ${JSON.stringify(fateData.ziwei)}` : ''}
    ${fateData.western ? `西方星盘: ${JSON.stringify(fateData.western)}` : ''}
    ${fateData.mbti ? `MBTI: ${JSON.stringify(fateData.mbti)}` : ''}
    
    请保持专业、慈悲、富有洞察力的语气。
  `;

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "抱歉，大师现在有点忙，请稍后再问。";
  }
}
