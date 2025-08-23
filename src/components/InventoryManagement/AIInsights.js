import React from 'react';
import { Brain, Lightbulb, TrendingUp } from 'lucide-react';

export default function AIInsights({ insights, isLoading, onRefresh }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        AI Inventory Insights
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        AI insights component for inventory - to be implemented
      </p>
    </div>
  );
}
