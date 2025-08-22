#!/usr/bin/env node

/**
 * TODO List Update Script
 * 
 * This script helps update the TODO.md file by marking items as completed.
 * Usage: node scripts/update-todo.js [task-id] [status]
 * 
 * Examples:
 * - node scripts/update-todo.js "firebase-env-vars" "completed"
 * - node scripts/update-todo.js "error-boundaries" "in-progress"
 * - node scripts/update-todo.js "dashboard-component" "completed"
 */

const fs = require('fs');
const path = require('path');

// Task ID mappings for easy reference
const TASK_IDS = {
  // Phase 6.1: Security & Bug Fixes
  'firebase-env-vars': 'Move Firebase API keys to environment variables',
  'react-router-fix': 'Fix React Router bypass in Home.js',
  'error-boundaries': 'Implement Error Boundaries',
  
  // Phase 6.2: Code Quality & Performance
  'state-management': 'Refactor complex state management',
  'performance-optimization': 'Add memoization and optimization',
  'form-handling': 'Modernize form handling',
  
  // Phase 6.3: New Features & Components
  'dashboard-component': 'Dashboard Component',
  'settings-component': 'Settings Component',
  'notification-system': 'Notification System',
  'data-analytics': 'Data Analytics',
  
  // README Planned Features
  'barcode-scanning': 'Barcode Scanning',
  'advanced-ai': 'Advanced AI Features',
  'voice-commands': 'Voice Commands',
  'iot-integration': 'IoT Integration',
  'financial-planning': 'Financial Planning',
  'family-calendar': 'Family Calendar',
  'user-roles': 'User Roles & Permissions',
  'multi-tenant': 'Multi-tenant Support',
  
  // Phase 6.4: User Experience & Accessibility
  'accessibility': 'Fix accessibility issues',
  'responsive-design': 'Mobile-first responsive design',
  'dark-mode': 'Theme system',
  
  // Phase 6.5: Advanced Features
  'websocket-integration': 'WebSocket integration',
  'offline-support': 'Progressive Web App features',
  'data-management': 'Enhanced data features',
  
  // Phase 6.6: Testing & Quality Assurance
  'testing-framework': 'Add comprehensive testing',
  'code-quality-tools': 'Add development tools',
  'documentation': 'Improve documentation',
  
  // README Planned Improvements
  'backend-integration': 'Backend Integration',
  'realtime-updates': 'Real-time Updates',
  'advanced-offline': 'Advanced Offline',
  'performance-optimization': 'Performance Optimization',
  'multi-tenant-support': 'Multi-tenant Support',
  'advanced-user-roles': 'Advanced User Roles'
};

function showHelp() {
  console.log(`
🏠 Home Hub - TODO Update Script

Usage: node scripts/update-todo.js [task-id] [status]

Available task IDs:
${Object.entries(TASK_IDS).map(([id, desc]) => `  ${id}: ${desc}`).join('\n')}

Available statuses:
  completed    - Mark task as completed
  in-progress - Mark task as in progress
  not-started - Mark task as not started
  blocked     - Mark task as blocked

Examples:
  node scripts/update-todo.js firebase-env-vars completed
  node scripts/update-todo.js dashboard-component in-progress
  node scripts/update-todo.js error-boundaries blocked

To see all available tasks:
  node scripts/update-todo.js list
`);
}

function updateTaskStatus(taskId, status) {
  const todoPath = path.join(__dirname, '..', 'TODO.md');
  
  if (!fs.existsSync(todoPath)) {
    console.error('❌ TODO.md file not found!');
    return;
  }
  
  let content = fs.readFileSync(todoPath, 'utf8');
  
  // Define status emojis
  const statusEmojis = {
    'completed': '✅',
    'in-progress': '🟡',
    'not-started': '🔴',
    'blocked': '⛔'
  };
  
  const emoji = statusEmojis[status] || '🔴';
  
  // Find and replace the task
  const taskDescription = TASK_IDS[taskId];
  if (!taskDescription) {
    console.error(`❌ Unknown task ID: ${taskId}`);
    return;
  }
  
  // Look for the task in the TODO file
  const taskPattern = new RegExp(`(- \\[ \\] \\*\\*${taskDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*)`, 'g');
  const replacement = `$1 (${emoji} ${status})`;
  
  if (content.includes(taskDescription)) {
    content = content.replace(taskPattern, replacement);
    fs.writeFileSync(todoPath, content, 'utf8');
    console.log(`✅ Updated task: ${taskDescription} -> ${status} ${emoji}`);
  } else {
    console.error(`❌ Task not found in TODO.md: ${taskDescription}`);
  }
}

function listTasks() {
  console.log('\n🏠 Home Hub - Available Tasks\n');
  
  Object.entries(TASK_IDS).forEach(([id, desc]) => {
    console.log(`${id.padEnd(25)} - ${desc}`);
  });
  
  console.log('\nUse: node scripts/update-todo.js [task-id] [status] to update a task');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  if (args[0] === 'list') {
    listTasks();
    return;
  }
  
  if (args.length !== 2) {
    console.error('❌ Invalid arguments. Use: node scripts/update-todo.js [task-id] [status]');
    console.error('   Run "node scripts/update-todo.js help" for more information.');
    return;
  }
  
  const [taskId, status] = args;
  
  if (!TASK_IDS[taskId]) {
    console.error(`❌ Unknown task ID: ${taskId}`);
    console.error('   Run "node scripts/update-todo.js list" to see available tasks.');
    return;
  }
  
  if (!['completed', 'in-progress', 'not-started', 'blocked'].includes(status)) {
    console.error(`❌ Invalid status: ${status}`);
    console.error('   Valid statuses: completed, in-progress, not-started, blocked');
    return;
  }
  
  updateTaskStatus(taskId, status);
}

if (require.main === module) {
  main();
}

module.exports = { TASK_IDS, updateTaskStatus };
