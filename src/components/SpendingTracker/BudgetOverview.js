import React from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BudgetOverview({ budgets, expenses, onUpdateBudget }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Budget Overview
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Budget overview component - to be implemented
      </p>
    </div>
  );
}
