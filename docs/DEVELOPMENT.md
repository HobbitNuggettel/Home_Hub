# Development Guide

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Firebase account

### Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure Firebase settings
5. Start development: `npm start`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── modules/        # Feature modules
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── services/       # API services
└── utils/          # Utilities
```

## Development Workflow

1. Create feature branch
2. Make changes
3. Write tests
4. Run test suite
5. Create pull request

## 🎨 Color Customization System

### Overview
Home Hub features a comprehensive color customization system that allows users to personalize the entire application with custom themes.

### Key Components
- **ColorPicker.js** - Interactive HSL color picker with real-time preview
- **ThemeSettings.js** - Comprehensive theme management interface
- **ThemePreview.js** - Live preview of color changes across components
- **ThemeContext.js** - Theme management with localStorage persistence
- **theme-variables.css** - CSS custom properties for dynamic theming

### Usage
1. Navigate to `/color-picker` to experiment with colors
2. Use `/theme-settings` for comprehensive customization
3. Apply colors as Primary, Secondary, or Accent colors
4. Generate complete themes from a single color
5. Export/import themes for sharing

### Technical Implementation
- CSS custom properties for real-time theming
- localStorage persistence for custom themes
- Theme presets for quick customization
- Real-time preview across all components

## Code Standards

- Use ESLint configuration
- Follow Prettier formatting
- Write component documentation
- Maintain test coverage >90%

## Testing

Run tests with `npm test`
View coverage with `npm run test:coverage`

## Security

- Validate all inputs
- Use security middleware
- Follow OWASP guidelines
- Regular security audits