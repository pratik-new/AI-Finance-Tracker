import OpenAI from 'openai';
import { analyzeFinance } from './financeAnalyzer.js';

const hasOpenAIKey = () => {
  const key = process.env.OPENAI_API_KEY;
  return key && key !== 'your_openai_api_key_here';
};

export const generateAIInsights = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({ transactions, budget });

  if (!hasOpenAIKey()) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = [
      'Generate concise personal finance insights for this user.',
      'Return only a JSON array of strings.',
      JSON.stringify({
        totalIncome: analysis.totalIncome,
        totalExpense: analysis.totalExpense,
        savings: analysis.savings,
        budgetRemaining: analysis.budgetRemaining,
        categoryBreakdown: analysis.categoryBreakdown,
        monthlyTrend: analysis.monthlyTrend
      })
    ].join('\n');

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4
    });

    const text = response.choices?.[0]?.message?.content || '[]';
    const insights = JSON.parse(text);

    return {
      provider: 'openai',
      insights: Array.isArray(insights) && insights.length ? insights : analysis.insights
    };
  } catch (error) {
    return {
      provider: 'heuristic',
      insights: [...analysis.insights, ...analysis.recommendations].slice(0, 8)
    };
  }
};

export const predictExpense = async ({ transactions, budget }) => {
  const analysis = analyzeFinance({ transactions, budget });

  return {
    predictedExpense: analysis.predictedExpense,
    confidence: analysis.confidence,
    budgetRisk: analysis.monthlyBudget > 0 ? analysis.predictedExpense > analysis.monthlyBudget : false,
    recommendations: analysis.recommendations
  };
};