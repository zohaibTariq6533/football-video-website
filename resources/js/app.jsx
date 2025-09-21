import './bootstrap';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FootballMatchAnalyzer from './components/FootballMatchAnalyzerEnhanced';
// import StatisticsPage from './components/StatisticsPage';
import FootballMatchFilter from './components/FootballMatchFilter';

// Function to safely parse JSON data from dataset
const getDataFromElement = (element) => {
    if (!element) return null;
    
    const data = {};
    try {
        if (element.dataset.teams) {
            data.teams = JSON.parse(element.dataset.teams);
        }
        if (element.dataset.video) {
            data.video = JSON.parse(element.dataset.video);
        }
        if (element.dataset.analysis) {
            data.analysis = JSON.parse(element.dataset.analysis);
        }
        if (element.dataset.videoId) {
            data.videoId = JSON.parse(element.dataset.videoId);
        }
    } catch (error) {
        console.error('Error parsing data from element:', error);
        return null;
    }
    return data;
};

// Mount components based on presence of mount points
const analyzerContainer = document.getElementById('football-analyzer');
const filterContainer = document.getElementById('football-filter');

if (analyzerContainer) {
    const analyzerData = getDataFromElement(analyzerContainer);
    const root = createRoot(analyzerContainer);
    root.render(
        <Router>
            <Routes>
                <Route 
                    path="/admin/dashboard/video-analyze/:matchId" 
                    element={
                        <FootballMatchAnalyzer 
                            initialTeams={analyzerData?.teams}
                            initialVideo={analyzerData?.video}
                            videoId={analyzerData?.videoId}
                        />
                    } 
                />
            </Routes>
        </Router>
    );
}

// Mount Filter component if present
if (filterContainer) {
    const filterData = getDataFromElement(filterContainer);
    const filterRoot = createRoot(filterContainer);
    filterRoot.render(
        <FootballMatchFilter 
            teams={filterData?.teams}
            video={filterData?.video}
            analysis={filterData?.analysis}
        />
    );
}