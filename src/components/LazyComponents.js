import React, { Suspense, lazy } from 'react';
import LoadingSkeleton from './common/LoadingSkeleton.js';

// Lazy load heavy components
export const LazyInventoryManagement = lazy(() => import('./InventoryManagement'));
export const LazySpendingTracker = lazy(() => import('./modules/Spending'));
export const LazyRecipeManagement = lazy(() => import('./RecipeManagement'));
export const LazyShoppingLists = lazy(() => import('./ShoppingLists'));
export const LazyAIDashboard = lazy(() => import('./ai/AIDashboard'));
export const LazyWeatherDashboard = lazy(() => import('./WeatherDashboard'));
export const LazyAnalyticsDashboard = lazy(() => import('./analytics/AnalyticsDashboard'));
export const LazyMonitoringDashboard = lazy(() => import('./monitoring/MonitoringDashboard'));
export const LazyUserManagement = lazy(() => import('./UserManagement'));
export const LazySettings = lazy(() => import('./Settings'));

// Higher-order component for lazy loading with fallback
export const withLazyLoading = (Component, fallback = <LoadingSkeleton />) => {
  const LazyComponent = (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent;
};

// Lazy route components
export const LazyRoutes = {
  InventoryManagement: withLazyLoading(LazyInventoryManagement),
  SpendingTracker: withLazyLoading(LazySpendingTracker),
  RecipeManagement: withLazyLoading(LazyRecipeManagement),
  ShoppingLists: withLazyLoading(LazyShoppingLists),
  AIDashboard: withLazyLoading(LazyAIDashboard),
  WeatherDashboard: withLazyLoading(LazyWeatherDashboard),
  AnalyticsDashboard: withLazyLoading(LazyAnalyticsDashboard),
  MonitoringDashboard: withLazyLoading(LazyMonitoringDashboard),
  UserManagement: withLazyLoading(LazyUserManagement),
  Settings: withLazyLoading(LazySettings)
};
