// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import FootballMatchAnalyzer from './components/FootballMatchAnalyzerEnhanced';
// // import FootballMatchAnalyzer from './components/FootballMatchAnalyzer';

// // Mount the React component
// const container = document.getElementById('football-analyzer');
// if (container) {
//     const root = createRoot(container);
//     root.render(<FootballMatchAnalyzer />);
// }


import './bootstrap';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FootballMatchAnalyzer from './components/FootballMatchAnalyzerEnhanced';
import StatisticsPage from './components/StatisticsPage';

// Mount the React component with routing
const container = document.getElementById('football-analyzer');
if (container) {
    const root = createRoot(container);
    root.render(
        <Router>
            <Routes>
                <Route path="/admin/dashboard/video-analyze/:matchId" element={<FootballMatchAnalyzer />} />
                {/* <Route path="/video/:videoId/stats" element={<StatisticsPage />} /> */}
            </Routes>
        </Router>
    );
}