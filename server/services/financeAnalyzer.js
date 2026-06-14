const currency = (value) => `₹${Math.round(value || 0).toLocaleString('en-IN')}`;

export const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};

export const summarizeTransactions = (transactions = [], budget = null) => {
  const income = transactions.filter((item) => item.type === 'income');
  const expenses = transactions.filter((item) => item.type === 'expense');
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const savings = totalIncome - totalExpense;
  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetRemaining = monthlyBudget ? monthlyBudget - totalExpense : savings;

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyBuckets = new Map();
  transactions.forEach((item) => {
    const date = new Date(item.transactionDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyBuckets.get(key) || { month: key, income: 0, expense: 0 };
    current[item.type] += item.amount;
    monthlyBuckets.set(key, current);
  });

  const monthlyTrend = Array.from(monthlyBuckets.values()).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalIncome,
    totalExpense,
    savings,
    budgetRemaining,
    monthlyBudget,
    categoryBreakdown,
    monthlyTrend
  };
};

export const analyzeFinance = ({ transactions = [], budget = null }) => {
  const summary = summarizeTransactions(transactions, budget);
  const expenses = transactions.filter((item) => item.type === 'expense');
  const insights = [];
  const recommendations = [];

  if (!transactions.length) {
    return {
      ...summary,
      insights: [
        'Add your first income and expense entries to unlock personalized finance insights.',
        'Set a monthly budget so FinTrack can flag overspending before it becomes a problem.'
      ],
      recommendations: ['Start with recurring expenses like rent, subscriptions, groceries, and transport.'],
      predictedExpense: 0,
      confidence: 0
    };
  }

  const topCategory = summary.categoryBreakdown[0];
  if (topCategory) {
    const share = summary.totalExpense ? Math.round((topCategory.amount / summary.totalExpense) * 100) : 0;
    insights.push(`${topCategory.category} is your biggest spending category at${currency(topCategory.amount)} (${share}% of expenses).`);
  }

  if (summary.monthlyBudget > 0) {
    const used = Math.round((summary.totalExpense / summary.monthlyBudget) * 100);
    if (used >= 100) {
      insights.push(`You have exceeded your monthly budget by${currency(Math.abs(summary.budgetRemaining))}.`);
    } else if (used >= 80) {
      insights.push(`You have used${used}% of your monthly budget. Slow down discretionary spending this month.`);
    } else {
      insights.push(`You still have${currency(summary.budgetRemaining)} available from this month's budget.`);
    }
  }

  budget?.categoryBudgets?.forEach((item) => {
    const spent = summary.categoryBreakdown.find((entry) => entry.category === item.category)?.amount || 0;
    if (item.limit > 0 && spent > item.limit) {
      insights.push(`${item.category} spending exceeded its category budget by${currency(spent - item.limit)}.`);
    }
  });

  if (summary.savings < 0) {
    insights.push(`Your expenses are higher than income by${currency(Math.abs(summary.savings))}.`);
    recommendations.push('Prioritize reducing flexible categories until monthly cash flow is positive again.');
  } else {
    recommendations.push(`You are currently saving${currency(summary.savings)}. Consider moving part of it to a dedicated savings goal.`);
  }

  if (topCategory) {
    recommendations.push(`A 10% reduction in${topCategory.category} could save about${currency(topCategory.amount * 0.1)} this period.`);
  }

  const monthlyExpenses = summary.monthlyTrend.map((item) => item.expense);
  const predictedExpense = monthlyExpenses.length
    ? Math.round(monthlyExpenses.reduce((sum, item) => sum + item, 0) / monthlyExpenses.length)
    : Math.round(summary.totalExpense);
  const confidence = Math.min(95, Math.max(55, 60 + expenses.length * 3));

  return {
    ...summary,
    insights,
    recommendations,
    predictedExpense,
    confidence
  };
};