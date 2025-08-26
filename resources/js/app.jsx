import React from 'react';
import { createRoot } from 'react-dom/client';
import FootballMatchAnalyzer from './components/FootballMatchAnalyzerEnhanced';
// import FootballMatchAnalyzer from './components/FootballMatchAnalyzer';

// Mount the React component
const container = document.getElementById('football-analyzer');
if (container) {
    const root = createRoot(container);
    root.render(<FootballMatchAnalyzer />);
}