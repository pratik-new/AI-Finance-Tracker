import Budget from '../models/Budget.js';

export const setBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null || monthlyBudget === '' || Number(monthlyBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets: categoryBudgets || [],
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget saved successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.userId });

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: {
          monthlyBudget: 0,
          categoryBudgets: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;

    if (monthlyBudget === undefined || monthlyBudget === null || monthlyBudget === '' || Number(monthlyBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget'
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};