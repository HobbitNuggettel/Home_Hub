import React from 'react';
import { Edit, Trash2, Eye, DollarSign, Calendar, Tag, TrendingUp, TrendingDown } from 'lucide-react';

const ExpenseList = ({ 
  expenses = [], 
  selectedExpenses = [], 
  onEdit, 
  onDelete, 
  onView, 
  onToggleSelection,
  viewMode = 'grid'
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Groceries': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Home & Garden': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Dining Out': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Healthcare': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
      'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'Shopping': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Utilities': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Insurance': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
      'Travel': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
      'Other': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[category] || colors.Other;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'Debit Card': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'Cash': return <DollarSign className="w-4 h-4 text-green-500" />;
      default: return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                    onChange={() => {}} // Handled by parent
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => onToggleSelection(expense.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.description}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {expense.notes}
                      </div>
                      {expense.recurring && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Recurring
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(expense.paymentMethod)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {expense.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(expense.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onView(expense)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Edit Expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedExpenses.includes(expense.id)}
                  onChange={() => onToggleSelection(expense.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                {expense.recurring && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    Recurring
                  </span>
                )}
                {expense.aiRecommended && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    AI
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {expense.description}
            </h3>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span className="font-medium">Amount:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium w-20">Category:</span>
                <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-20">Payment:</span>
                <div className="flex items-center">
                  {getPaymentMethodIcon(expense.paymentMethod)}
                  <span className="ml-1">{expense.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(expense.date)}</span>
              </div>

              {expense.notes && (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  "{expense.notes}"
                </div>
              )}

              {expense.tags && expense.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1">
                  <Tag className="w-4 h-4 mr-2" />
                  {expense.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {expense.aiRecommended && expense.aiConfidence && (
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-xs">
                  <div className="font-medium text-green-800 dark:text-green-200">
                    AI Categorized ({Math.round(expense.aiConfidence * 100)}% confidence)
                  </div>
                  {expense.aiReasoning && (
                    <div className="text-green-600 dark:text-green-300 mt-1">
                      {expense.aiReasoning}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onView(expense)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(expense)}
                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1"
                title="Edit Expense"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                title="Delete Expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
