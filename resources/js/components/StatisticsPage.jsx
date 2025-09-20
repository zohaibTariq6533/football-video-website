import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart3, Download, ArrowLeft } from 'lucide-react';

const StatisticsPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/video/${videoId}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStatsData(data);
                } else {
                    throw new Error('Failed to load statistics');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [videoId]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExport = () => {
        // Create a CSV representation of the data
        let csv = 'Event Type,Time,Team,Player,Action\n';
        
        if (statsData && statsData.timeline) {
            statsData.timeline.forEach(event => {
                csv += `${event.eventType},${formatTime(event.time)},${event.team || ''},${event.playerName || ''},${event.action || ''}\n`;
            });
        }
        
        // Create a blob and download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `analysis-${videoId}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!statsData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
                    <p className="text-gray-600">No statistics found for this analysis.</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back to Analysis
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">Match Statistics</h1>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <Download size={18} className="mr-2" />
                        Export Data
                    </button>
                </div>

                {/* Team Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart3 size={20} className="mr-2" />
                        Team Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(statsData.teams).map(([teamName, stats]) => (
                            <div key={teamName} className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="font-bold text-lg mb-3">{teamName}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Possession:</span>
                                        <span className="font-medium">{stats.possession}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shots:</span>
                                        <span className="font-medium">{stats.shots}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Goals:</span>
                                        <span className="font-medium">{stats.goals}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fouls:</span>
                                        <span className="font-medium">{stats.fouls}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Corners:</span>
                                        <span className="font-medium">{stats.corners}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Player Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Player Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {statsData.players.map((player, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="font-bold">#{player.jerseyNo} {player.name}</h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Goals:</span>
                                        <span>{player.goals}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Assists:</span>
                                        <span>{player.assists}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fouls:</span>
                                        <span>{player.fouls}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Timeline */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Timeline</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {statsData.timeline.map((event, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatTime(event.time)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div 
                                                    className="w-3 h-3 rounded-sm mr-2" 
                                                    style={{ backgroundColor: event.color }}
                                                ></div>
                                                {event.eventType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.team || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.playerName ? `#${event.jerseyNo} ${event.playerName}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {event.action || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;