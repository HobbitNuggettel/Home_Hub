import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import AdvancedAnalytics from './components/AdvancedAnalytics';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<AdvancedAnalytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 