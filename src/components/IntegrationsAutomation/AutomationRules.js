import React from 'react';
import { Zap, Clock, MapPin, Play, Pause, Trash2 } from 'lucide-react';

export default function AutomationRules({ rules, devices, onToggle, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Automation Rules
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Automation rules component - to be implemented
      </p>
    </div>
  );
}
