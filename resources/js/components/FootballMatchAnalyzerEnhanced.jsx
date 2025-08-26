import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, X, Save } from 'lucide-react';

const FootballMatchAnalyzer = ({ matchId = 1 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6000); // 100 minutes in seconds
  const [videoProgress, setVideoProgress] = useState(0);
  const [analysisMarkers, setAnalysisMarkers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [selectedAction, setSelectedAction] = useState({});
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample events data with proper event types
  const [events, setEvents] = useState([
    { id: 1, type: 'Possession', time: 300, team: 'Barca' },
    { id: 2, type: 'Transition', time: 480, team: 'Real' },
    { id: 3, type: 'Set Play', time: 720, team: 'Barca' },
    { id: 4, type: 'Attack 3rd', time: 1200, team: 'Real' },
    { id: 5, type: 'Shot', time: 1500, team: 'Barca' },
    { id: 6, type: 'Goal', time: 1800, team: 'Real' },
    { id: 7, type: 'Save', time: 2100, team: 'Barca' },
    { id: 8, type: 'Wide', time: 2700, team: 'Real' },
    { id: 9, type: 'Blocked', time: 3300, team: 'Barca' },
    { id: 10, type: 'Foul', time: 3900, team: 'Real' },
    { id: 11, type: 'Offside', time: 4200, team: 'Barca' },
  ]);

  // Event types with their row positions and colors
  const eventTypes = [
    { name: 'Possession', color: 'bg-green-500', row: 0 },
    { name: 'Transition', color: 'bg-blue-500', row: 1 },
    { name: 'Set Play', color: 'bg-purple-500', row: 2 },
    { name: 'Attack 3rd', color: 'bg-orange-500', row: 3 },
    { name: 'Shot', color: 'bg-red-500', row: 4 },
    { name: 'Goal', color: 'bg-green-600', row: 5 },
    { name: 'Save', color: 'bg-blue-600', row: 6 },
    { name: 'Wide', color: 'bg-gray-500', row: 7 },
    { name: 'Blocked', color: 'bg-yellow-600', row: 8 },
    { name: 'Foul', color: 'bg-yellow-500', row: 9 },
    { name: 'Offside', color: 'bg-pink-500', row: 10 },
  ];

  const rowHeight = 24; // Height of each row in pixels

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setShowUploadModal(false);
      
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        setDuration(Math.floor(tempVideo.duration));
        setCurrentTime(0);
        setIsPlaying(false);
      };
    }
  };

  // Sync video with timeline
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentTime, isPlaying, videoUrl]);

  // Handle video time updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(Math.floor(videoRef.current.currentTime));
    }
  };

  // Play/pause functionality
  useEffect(() => {
    if (isPlaying && !videoUrl) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration, videoUrl]);

  // Update video progress based on current time
  useEffect(() => {
    setVideoProgress((currentTime / duration) * 100);
  }, [currentTime, duration]);

  // Handle timeline click
  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = Math.floor(percentage * duration);
      setCurrentTime(newTime);
    }
  };

  // Add analysis marker
  const addAnalysisMarker = (eventType, team, action) => {
    const eventConfig = eventTypes.find(et => et.name === eventType);
    const newMarker = {
      id: Date.now(),
      startTime: currentTime,
      type: eventType,
      team: team,
      action: action,
      color: eventConfig.color,
      row: eventConfig.row
    };
    setAnalysisMarkers(prev => [...prev, newMarker]);
  };

  // Save all analysis data to backend
  const saveAllAnalysis = async () => {
    setIsSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log("csrf token: " + csrfToken)
      const response = await fetch('http://localhost/HOME/football-video-website/public/api/match/analysis/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
          // match_id: matchId,
          analysis_data: analysisMarkers.map(marker => ({
            event_type: marker.type,
            start_time: marker.startTime,
            team: marker.team,
            action: marker.action
          }))
        })
      });

      if (response.ok) {
        alert('Analysis saved successfully!');
        console.log('All analysis data saved successfully');
      } else {
        throw new Error('Failed to save analysis');
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate time column markers (20 equal parts)
  const generateTimeColumnMarkers = () => {
    const markers = [];
    const divisions = 20;
    const timePerDivision = duration / divisions;
    
    for (let i = 0; i <= divisions; i++) {
      const percentage = (i / divisions) * 100;
      const timeAtMark = i * timePerDivision;
      markers.push(
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-400"
          style={{ left: `${percentage}%` }}
        >
          <span className="absolute -top-6 -left-6 bg-white px-1 text-xs text-gray-700 font-medium">
            {formatTime(Math.floor(timeAtMark))}
          </span>
        </div>
      );
    }
    return markers;
  };

  // Generate periods bar (45 min + 45 min with halftime)
  const generatePeriodsBar = () => {
    const firstHalfEnd = 2700; // 45 minutes
    const secondHalfEnd = 5400; // 90 minutes
    const firstHalfPercent = (firstHalfEnd / duration) * 100;
    const secondHalfPercent = (secondHalfEnd / duration) * 100;
    
    return (
      <div className="absolute top-0 left-0 right-0 h-6 flex">
        <div 
          className="bg-blue-600 text-white text-xs flex items-center justify-center font-medium border-r border-white"
          style={{ width: `${firstHalfPercent}%` }}
        >
          1st Half
        </div>
        <div 
          className="bg-gray-400 text-white text-xs flex items-center justify-center font-medium border-r border-white"
          style={{ width: `${(2700 / duration) * 100}%` }}
        >
          HT
        </div>
        <div 
          className="bg-blue-600 text-white text-xs flex items-center justify-center font-medium"
          style={{ width: `${secondHalfPercent - firstHalfPercent}%` }}
        >
          2nd Half
        </div>
      </div>
    );
  };

  // Handle team selection
  const handleTeamSelection = (eventType, team) => {
    setSelectedTeam(prev => ({
      ...prev,
      [eventType]: team
    }));
  };

  // Handle action selection
  const handleActionSelection = (eventType, action) => {
    setSelectedAction(prev => ({
      ...prev,
      [eventType]: action
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Video Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Match Video</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Video Section */}
      <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-64 relative">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain bg-black"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(Math.floor(videoRef.current.duration));
                }
              }}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-green-400 via-blue-300 to-purple-300 flex items-center justify-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Upload size={24} />
                Upload Match Video
              </button>
            </div>
          )}
          <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-75 px-3 py-2 rounded-lg">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        {/* Video Controls */}
        <div className="p-4 bg-white border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {uploadedVideo ? uploadedVideo.name.substring(0, 30) + '...' : 'No video loaded'}
              </div>
              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline and Controls Section */}
      <div className="flex gap-6 mb-6">
        {/* Timeline Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Match Timeline</h3>
          
          <div className="flex">
            {/* Event Type Labels */}
            <div className="w-24 mr-4">
              <div className="text-sm font-medium text-gray-600 mb-1 h-8">Periods</div>
              {eventTypes.map((eventType) => (
                <div
                  key={eventType.name}
                  className="text-sm font-medium text-gray-700 flex items-center border-b border-gray-200"
                  style={{ height: `${rowHeight}px` }}
                >
                  {eventType.name}
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="flex-1">
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="relative bg-gray-100 rounded-lg cursor-pointer border"
                style={{ height: `${32 + (eventTypes.length * rowHeight)}px` }}
              >
                {/* Periods Bar */}
                {generatePeriodsBar()}

                {/* Time Column Markers */}
                <div className="absolute inset-0 mt-8">
                  {generateTimeColumnMarkers()}
                </div>

                {/* Current Time Red Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30"
                  style={{ left: `${videoProgress}%` }}
                />

                {/* Event Segments */}
                {events.map(event => {
                  const startPercent = (event.time / duration) * 100;
                  const eventConfig = eventTypes.find(et => et.name === event.type);
                  const topOffset = 32 + (eventConfig.row * rowHeight) + 4;
                  
                  return (
                    <div
                      key={event.id}
                      className={`absolute ${eventConfig.color} rounded-sm shadow-sm`}
                      style={{
                        left: `${startPercent}%`,
                        width: '12px',
                        height: '16px',
                        top: `${topOffset}px`,
                      }}
                      title={`${event.type} - ${event.team} at ${formatTime(event.time)}`}
                    />
                  );
                })}

                {/* Analysis Markers */}
                {analysisMarkers.map(marker => {
                  const startPercent = (marker.startTime / duration) * 100;
                  const topOffset = 32 + (marker.row * rowHeight) + 4;
                  
                  return (
                    <div
                      key={marker.id}
                      className={`absolute ${marker.color} border-2 border-white rounded-sm shadow-md`}
                      style={{
                        left: `${startPercent}%`,
                        width: '12px',
                        height: '16px',
                        top: `${topOffset}px`,
                      }}
                      title={`Analysis: ${marker.type} - ${marker.team} at ${formatTime(marker.startTime)}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Analysis Controls */}
        <div className="w-80 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Event Analysis Controls</h3>
          
          <div className="space-y-3">
            {/* Possession */}
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Possession</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleTeamSelection('Possession', 'Barca')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Possession'] === 'Barca' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Barca
                  </button>
                  <button 
                    onClick={() => handleTeamSelection('Possession', 'Real')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Possession'] === 'Real' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Real
                  </button>
                </div>
              </div>
              <button
                onClick={() => addAnalysisMarker('Possession', selectedTeam['Possession'], null)}
                className="w-full py-1 bg-green-800 text-white text-xs rounded hover:bg-green-900 disabled:opacity-50 transition-colors"
                disabled={!selectedTeam['Possession']}
              >
                Add Marker
              </button>
            </div>

            {/* Shot Analysis */}
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Shot Analysis</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleTeamSelection('Shot', 'Barca')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Shot'] === 'Barca' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Barca
                  </button>
                  <button 
                    onClick={() => handleTeamSelection('Shot', 'Real')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Shot'] === 'Real' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Real
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                {['Goal', 'Save', 'Wide', 'Blocked'].map(action => (
                  <button
                    key={action}
                    onClick={() => {
                      handleActionSelection('Shot', action);
                      addAnalysisMarker(action, selectedTeam['Shot'], action);
                    }}
                    className="px-1 py-1 text-xs bg-red-800 hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                    disabled={!selectedTeam['Shot']}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Offside */}
            <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Offside</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleTeamSelection('Offside', 'Barca')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Offside'] === 'Barca' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Barca
                  </button>
                  <button 
                    onClick={() => handleTeamSelection('Offside', 'Real')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Offside'] === 'Real' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Real
                  </button>
                </div>
              </div>
              <button
                onClick={() => addAnalysisMarker('Offside', selectedTeam['Offside'], null)}
                className="w-full py-1 bg-pink-800 text-white text-xs rounded hover:bg-pink-900 disabled:opacity-50 transition-colors"
                disabled={!selectedTeam['Offside']}
              >
                Add Marker
              </button>
            </div>

            {/* More Event Types */}
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Transition</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleTeamSelection('Transition', 'Barca')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Transition'] === 'Barca' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Barca
                  </button>
                  <button 
                    onClick={() => handleTeamSelection('Transition', 'Real')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Transition'] === 'Real' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Real
                  </button>
                </div>
              </div>
              <button
                onClick={() => addAnalysisMarker('Transition', selectedTeam['Transition'], null)}
                className="w-full py-1 bg-blue-800 text-white text-xs rounded hover:bg-blue-900 disabled:opacity-50 transition-colors"
                disabled={!selectedTeam['Transition']}
              >
                Add Marker
              </button>
            </div>

            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Attack 3rd</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleTeamSelection('Attack 3rd', 'Barca')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Attack 3rd'] === 'Barca' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    Barca
                  </button>
                  <button 
                    onClick={() => handleTeamSelection('Attack 3rd', 'Real')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeam['Attack 3rd'] === 'Real' ? 'bg-red-800' : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Real
                  </button>
                </div>
              </div>
              <button
                onClick={() => addAnalysisMarker('Attack 3rd', selectedTeam['Attack 3rd'], null)}
                className="w-full py-1 bg-orange-800 text-white text-xs rounded hover:bg-orange-900 disabled:opacity-50 transition-colors"
                disabled={!selectedTeam['Attack 3rd']}
              >
                Add Marker
              </button>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-semibold mb-2 text-gray-800">Analysis Summary ({analysisMarkers.length})</h4>
            <div className="max-h-40 overflow-y-auto">
              {analysisMarkers.map(marker => (
                <div key={marker.id} className="text-xs p-2 mb-1 bg-white rounded shadow-sm">
                  <span className="font-medium text-gray-800">{marker.type}</span> - 
                  <span className="text-blue-600 ml-1">{marker.team}</span> at 
                  <span className="text-green-600 ml-1">{formatTime(marker.startTime)}</span>
                  {marker.action && <span className="text-orange-600 ml-1">({marker.action})</span>}
                </div>
              ))}
              {analysisMarkers.length === 0 && (
                <div className="text-xs text-gray-500 italic">No markers yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballMatchAnalyzer;



// import React, { useState, useRef, useEffect } from 'react';
// import { Play, Pause, SkipBack, SkipForward, Upload, X } from 'lucide-react';

// const FootballMatchAnalyzer = ({ matchId = 1 }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(6000); // 100 minutes in seconds
//   const [videoProgress, setVideoProgress] = useState(0);
//   const [analysisMarkers, setAnalysisMarkers] = useState([]);
//   const [selectedTeam, setSelectedTeam] = useState({});
//   const [selectedAction, setSelectedAction] = useState({});
//   const [uploadedVideo, setUploadedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [showUploadModal, setShowUploadModal] = useState(false);
  
//   const timelineRef = useRef(null);
//   const intervalRef = useRef(null);
//   const videoRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Sample events data
//   const [events, setEvents] = useState([
//     { id: 1, type: 'Possession', time: 300, team: 'Barca', duration: 180 },
//     { id: 2, type: 'Transition', time: 480, team: 'Real', duration: 45 },
//     { id: 3, type: 'Set Play', time: 720, team: 'Barca', duration: 30 },
//     { id: 4, type: 'Attack 3rd', time: 1200, team: 'Real', duration: 90 },
//     { id: 5, type: 'Shot', time: 1500, team: 'Barca', duration: 15 },
//     { id: 6, type: 'Foul', time: 1800, team: 'Real', duration: 20 },
//     { id: 7, type: 'Offside', time: 2100, team: 'Barca', duration: 10 },
//     { id: 8, type: 'Goal', time: 2700, team: 'Real', duration: 30 },
//     { id: 9, type: 'Save', time: 3300, team: 'Barca', duration: 15 },
//     { id: 10, type: 'Wide', time: 3900, team: 'Real', duration: 20 },
//     { id: 11, type: 'Blocked', time: 4200, team: 'Barca', duration: 25 },
//   ]);

//   // Event type configurations with unique colors and heights
//   const eventConfig = {
//     'Possession': { 
//       color: 'bg-green-500', 
//       markerColor: 'bg-green-400', 
//       height: 'h-8',
//       borderColor: 'border-green-600',
//       textColor: 'text-green-800'
//     },
//     'Transition': { 
//       color: 'bg-blue-500', 
//       markerColor: 'bg-blue-400', 
//       height: 'h-6',
//       borderColor: 'border-blue-600',
//       textColor: 'text-blue-800'
//     },
//     'Set Play': { 
//       color: 'bg-purple-500', 
//       markerColor: 'bg-purple-400', 
//       height: 'h-5',
//       borderColor: 'border-purple-600',
//       textColor: 'text-purple-800'
//     },
//     'Attack 3rd': { 
//       color: 'bg-orange-500', 
//       markerColor: 'bg-orange-400', 
//       height: 'h-6',
//       borderColor: 'border-orange-600',
//       textColor: 'text-orange-800'
//     },
//     'Shot': { 
//       color: 'bg-red-500', 
//       markerColor: 'bg-red-400', 
//       height: 'h-7',
//       borderColor: 'border-red-600',
//       textColor: 'text-red-800'
//     },
//     'Foul': { 
//       color: 'bg-yellow-500', 
//       markerColor: 'bg-yellow-400', 
//       height: 'h-4',
//       borderColor: 'border-yellow-600',
//       textColor: 'text-yellow-800'
//     },
//     'Offside': { 
//       color: 'bg-pink-500', 
//       markerColor: 'bg-pink-400', 
//       height: 'h-5',
//       borderColor: 'border-pink-600',
//       textColor: 'text-pink-800'
//     },
//     'Goal': { 
//       color: 'bg-emerald-600', 
//       markerColor: 'bg-emerald-400', 
//       height: 'h-10',
//       borderColor: 'border-emerald-700',
//       textColor: 'text-emerald-800'
//     },
//     'Save': { 
//       color: 'bg-cyan-500', 
//       markerColor: 'bg-cyan-400', 
//       height: 'h-6',
//       borderColor: 'border-cyan-600',
//       textColor: 'text-cyan-800'
//     },
//     'Wide': { 
//       color: 'bg-gray-500', 
//       markerColor: 'bg-gray-400', 
//       height: 'h-4',
//       borderColor: 'border-gray-600',
//       textColor: 'text-gray-800'
//     },
//     'Blocked': { 
//       color: 'bg-indigo-500', 
//       markerColor: 'bg-indigo-400', 
//       height: 'h-5',
//       borderColor: 'border-indigo-600',
//       textColor: 'text-indigo-800'
//     },
//   };

//   // Format time helper
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Handle video upload
//   const handleVideoUpload = (event) => {
//     const file = event.target.files[0];
//     if (file && file.type.startsWith('video/')) {
//       setUploadedVideo(file);
//       const url = URL.createObjectURL(file);
//       setVideoUrl(url);
//       setShowUploadModal(false);
      
//       // Create a video element to get duration
//       const tempVideo = document.createElement('video');
//       tempVideo.src = url;
//       tempVideo.onloadedmetadata = () => {
//         setDuration(Math.floor(tempVideo.duration));
//         setCurrentTime(0);
//         setIsPlaying(false);
//       };
//     }
//   };

//   // Sync video with timeline
//   useEffect(() => {
//     if (videoRef.current && videoUrl) {
//       videoRef.current.currentTime = currentTime;
//       if (isPlaying) {
//         videoRef.current.play();
//       } else {
//         videoRef.current.pause();
//       }
//     }
//   }, [currentTime, isPlaying, videoUrl]);

//   // Handle video time updates
//   const handleVideoTimeUpdate = () => {
//     if (videoRef.current) {
//       setCurrentTime(Math.floor(videoRef.current.currentTime));
//     }
//   };

//   // Play/pause functionality
//   useEffect(() => {
//     if (isPlaying && !videoUrl) {
//       // Simulate video playback if no video uploaded
//       intervalRef.current = setInterval(() => {
//         setCurrentTime(prev => {
//           if (prev >= duration) {
//             setIsPlaying(false);
//             return duration;
//           }
//           return prev + 1;
//         });
//       }, 1000);
//     } else {
//       clearInterval(intervalRef.current);
//     }

//     return () => clearInterval(intervalRef.current);
//   }, [isPlaying, duration, videoUrl]);

//   // Update video progress based on current time
//   useEffect(() => {
//     setVideoProgress((currentTime / duration) * 100);
//   }, [currentTime, duration]);

//   // Handle timeline click
//   const handleTimelineClick = (e) => {
//     if (timelineRef.current) {
//       const rect = timelineRef.current.getBoundingClientRect();
//       const clickX = e.clientX - rect.left;
//       const percentage = clickX / rect.width;
//       const newTime = Math.floor(percentage * duration);
//       setCurrentTime(newTime);
//     }
//   };

//   // Add analysis marker
//   const addAnalysisMarker = (eventType, team, action) => {
//     const config = eventConfig[eventType];
//     const newMarker = {
//       id: Date.now(),
//       startTime: currentTime,
//       endTime: Math.min(currentTime + 60, duration), // 60 seconds duration
//       type: eventType,
//       team: team,
//       action: action,
//       color: config.markerColor,
//       borderColor: config.borderColor
//     };
//     setAnalysisMarkers(prev => [...prev, newMarker]);

//     // Save to backend
//     saveAnalysisToBackend(newMarker);
//   };

//   // Save analysis to Laravel backend
//   const saveAnalysisToBackend = async (marker) => {
//     try {
//       const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
//       const response = await fetch('/api/match/analysis', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRF-TOKEN': csrfToken
//         },
//         body: JSON.stringify({
//           match_id: matchId,
//           event_type: marker.type,
//           start_time: marker.startTime,
//           end_time: marker.endTime,
//           team: marker.team,
//           action: marker.action
//         })
//       });

//       if (response.ok) {
//         console.log('Analysis saved successfully');
//       }
//     } catch (error) {
//       console.error('Error saving analysis:', error);
//     }
//   };

//   // Generate minute markers
//   const generateMinuteMarkers = () => {
//     const markers = [];
//     const totalMinutes = Math.ceil(duration / 60);
    
//     for (let i = 0; i <= totalMinutes; i += 5) {
//       const percentage = (i * 60) / duration * 100;
//       markers.push(
//         <div
//           key={i}
//           className="absolute top-0 bottom-0 border-l border-gray-400 text-xs text-gray-600"
//           style={{ left: `${percentage}%` }}
//         >
//           <span className="absolute -top-5 -left-3 bg-white px-1 rounded text-xs">
//             {formatTime(i * 60)}
//           </span>
//         </div>
//       );
//     }
//     return markers;
//   };

//   // Handle team selection
//   const handleTeamSelection = (eventType, team) => {
//     setSelectedTeam(prev => ({
//       ...prev,
//       [eventType]: team
//     }));
//   };

//   // Handle action selection
//   const handleActionSelection = (eventType, action) => {
//     setSelectedAction(prev => ({
//       ...prev,
//       [eventType]: action
//     }));
//   };

//   // Remove analysis marker
//   const removeAnalysisMarker = (markerId) => {
//     setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
//   };

//   return (
//     <div className="w-full max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
//       {/* Video Upload Modal */}
//       {showUploadModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Upload Match Video</h3>
//               <button
//                 onClick={() => setShowUploadModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="mb-4">
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="video/*"
//                 onChange={handleVideoUpload}
//                 className="w-full p-2 border border-gray-300 rounded"
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowUploadModal(false)}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Video Preview Area */}
//       <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="h-64 relative">
//           {videoUrl ? (
//             <video
//               ref={videoRef}
//               src={videoUrl}
//               className="w-full h-full object-contain"
//               onTimeUpdate={handleVideoTimeUpdate}
//               onLoadedMetadata={() => {
//                 if (videoRef.current) {
//                   setDuration(Math.floor(videoRef.current.duration));
//                 }
//               }}
//             />
//           ) : (
//             <div className="h-full bg-gradient-to-br from-green-400 via-blue-300 to-purple-300 flex items-center justify-center">
//               <div className="text-center">
//                 <div className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded mb-4">
//                   Match Video Preview
//                 </div>
//                 <button
//                   onClick={() => setShowUploadModal(true)}
//                   className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//                 >
//                   <Upload size={20} />
//                   Upload Video
//                 </button>
//               </div>
//             </div>
//           )}
//           <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-75 px-3 py-1 rounded">
//             {formatTime(currentTime)} / {formatTime(duration)}
//           </div>
//           {/* Upload button overlay for uploaded videos */}
//           {videoUrl && (
//             <button
//               onClick={() => setShowUploadModal(true)}
//               className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
//             >
//               <Upload size={16} />
//             </button>
//           )}
//         </div>
        
//         {/* Video Controls */}
//         <div className="p-4 bg-white border-t">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
//               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//             >
//               <SkipBack size={20} />
//             </button>
//             <button
//               onClick={() => setIsPlaying(!isPlaying)}
//               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//             >
//               {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//             </button>
//             <button
//               onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
//               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//             >
//               <SkipForward size={20} />
//             </button>
//             <div className="ml-auto text-sm text-gray-600">
//               {uploadedVideo ? `Uploaded: ${uploadedVideo.name}` : 'No video uploaded'}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         {/* Timeline Section */}
//         <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Match Timeline</h3>
          
//           {/* Timeline Container */}
//           <div className="relative">
//             {/* Main Timeline */}
//             <div
//               ref={timelineRef}
//               onClick={handleTimelineClick}
//               className="relative h-40 bg-gray-200 rounded cursor-pointer overflow-hidden"
//             >
//               {/* Minute Markers */}
//               <div className="absolute inset-0">
//                 {generateMinuteMarkers()}
//               </div>

//               {/* Video Progress Bar */}
//               <div
//                 className="absolute top-0 h-3 bg-blue-500 transition-all duration-300 ease-linear z-10"
//                 style={{ width: `${videoProgress}%` }}
//               />

//               {/* Current Time Red Line */}
//               <div
//                 className="absolute top-0 bottom-0 w-1 bg-red-600 z-30 shadow-lg"
//                 style={{ left: `${videoProgress}%` }}
//               >
//                 <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
//               </div>

//               {/* Event Bars */}
//               {events.map(event => {
//                 const startPercent = (event.time / duration) * 100;
//                 const widthPercent = (event.duration / duration) * 100;
//                 const config = eventConfig[event.type];
                
//                 return (
//                   <div
//                     key={event.id}
//                     className={`absolute ${config.color} ${config.height} opacity-90 rounded shadow-sm border-l-2 ${config.borderColor}`}
//                     style={{
//                       left: `${startPercent}%`,
//                       width: `${widthPercent}%`,
//                       top: event.type === 'Possession' ? '12px' : 
//                            event.type === 'Goal' ? '20px' : 
//                            event.type === 'Shot' ? '28px' : '36px'
//                     }}
//                     title={`${event.type} - ${event.team} at ${formatTime(event.time)}`}
//                   />
//                 );
//               })}

//               {/* Analysis Markers with unique colors */}
//               {analysisMarkers.map(marker => {
//                 const startPercent = (marker.startTime / duration) * 100;
//                 const widthPercent = ((marker.endTime - marker.startTime) / duration) * 100;
                
//                 return (
//                   <div
//                     key={marker.id}
//                     className={`absolute h-full ${marker.color} opacity-80 border-l-4 border-r-4 ${marker.borderColor}`}
//                     style={{
//                       left: `${startPercent}%`,
//                       width: `${widthPercent}%`,
//                     }}
//                     title={`Analysis: ${marker.type} - ${marker.team} at ${formatTime(marker.startTime)}`}
//                   />
//                 );
//               })}
//             </div>

//             {/* Event Legend */}
//             <div className="mt-6 grid grid-cols-6 gap-3 text-xs">
//               {Object.entries(eventConfig).map(([type, config]) => (
//                 <div key={type} className="flex items-center gap-2">
//                   <div className={`w-4 ${config.height} ${config.color} rounded border ${config.borderColor}`}></div>
//                   <span className={`${config.textColor} font-medium`}>{type}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Control Panel */}
//         <div className="w-80 bg-white rounded-lg shadow-lg p-6">
//           <h3 className="text-lg font-semibold mb-4">Event Analysis</h3>
          
//           {/* Event Types */}
//           <div className="mb-6">
//             <h4 className="font-medium mb-3 text-teal-700">Event Types</h4>
//             <div className="space-y-2">
//               {['Possession', 'Transition', 'Set Play', 'Attack 3rd', 'Shot', 'Foul', 'Offside'].map(type => {
//                 const config = eventConfig[type];
//                 return (
//                   <div key={type} className={`flex items-center justify-between p-2 ${config.color} text-white rounded shadow-sm`}>
//                     <span className="text-sm font-medium">{type}</span>
//                     <div className={`w-3 ${config.height} bg-white bg-opacity-30 rounded`}></div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Event Details */}
//           <div className="mb-6">
//             <h4 className="font-medium mb-3 text-teal-700">Event Details</h4>
//             <div className="space-y-3">
//               {/* Possession Event */}
//               <div className="p-3 bg-green-600 text-white rounded-lg shadow-sm">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold">Possession</span>
//                   <div className="flex gap-1">
//                     <button 
//                       onClick={() => handleTeamSelection('Possession', 'Barca')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Possession'] === 'Barca' ? 'bg-blue-800 ring-2 ring-white' : 'bg-blue-500 hover:bg-blue-600'
//                       }`}
//                     >
//                       Barca
//                     </button>
//                     <button 
//                       onClick={() => handleTeamSelection('Possession', 'Real')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Possession'] === 'Real' ? 'bg-red-800 ring-2 ring-white' : 'bg-red-500 hover:bg-red-600'
//                       }`}
//                     >
//                       Real
//                     </button>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => addAnalysisMarker('Possession', selectedTeam['Possession'], null)}
//                   className="w-full py-2 bg-green-800 text-white text-sm rounded-lg hover:bg-green-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={!selectedTeam['Possession']}
//                 >
//                   Submit
//                 </button>
//               </div>

//               {/* Shot Event */}
//               <div className="p-3 bg-red-600 text-white rounded-lg shadow-sm">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold">Shot</span>
//                   <div className="flex gap-1">
//                     <button 
//                       onClick={() => handleTeamSelection('Shot', 'Barca')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Shot'] === 'Barca' ? 'bg-blue-800 ring-2 ring-white' : 'bg-blue-500 hover:bg-blue-600'
//                       }`}
//                     >
//                       Barca
//                     </button>
//                     <button 
//                       onClick={() => handleTeamSelection('Shot', 'Real')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Shot'] === 'Real' ? 'bg-red-800 ring-2 ring-white' : 'bg-red-500 hover:bg-red-600'
//                       }`}
//                     >
//                       Real
//                     </button>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => addAnalysisMarker('Shot', selectedTeam['Shot'], null)}
//                   className="w-full py-2 bg-red-800 text-white text-sm rounded-lg hover:bg-red-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={!selectedTeam['Shot']}
//                 >
//                   Submit
//                 </button>
//               </div>

//               {/* Shot Outcome Event */}
//               <div className="p-3 bg-emerald-600 text-white rounded-lg shadow-sm">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold">Shot Outcome</span>
//                   <div className="grid grid-cols-2 gap-1">
//                     {[
//                       { action: 'Goal', color: 'bg-emerald-500' },
//                       { action: 'Save', color: 'bg-cyan-500' },
//                       { action: 'Wide', color: 'bg-gray-500' },
//                       { action: 'Blocked', color: 'bg-indigo-500' }
//                     ].map(({ action, color }) => (
//                       <button
//                         key={action}
//                         onClick={() => handleActionSelection('Shot', action)}
//                         className={`px-2 py-1 text-white text-xs rounded-full transition-all ${
//                           selectedAction['Shot'] === action ? 'ring-2 ring-white bg-opacity-80' : `${color} hover:bg-opacity-80`
//                         }`}
//                       >
//                         {action}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => addAnalysisMarker('Shot', selectedTeam['Shot'], selectedAction['Shot'])}
//                   className="w-full py-2 bg-emerald-800 text-white text-sm rounded-lg hover:bg-emerald-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={!selectedAction['Shot']}
//                 >
//                   Submit
//                 </button>
//               </div>

//               {/* Offside Event */}
//               <div className="p-3 bg-pink-600 text-white rounded-lg shadow-sm">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-semibold">Offside</span>
//                   <div className="flex gap-1">
//                     <button 
//                       onClick={() => handleTeamSelection('Offside', 'Barca')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Offside'] === 'Barca' ? 'bg-blue-800 ring-2 ring-white' : 'bg-blue-500 hover:bg-blue-600'
//                       }`}
//                     >
//                       Barca
//                     </button>
//                     <button 
//                       onClick={() => handleTeamSelection('Offside', 'Real')}
//                       className={`px-3 py-1 text-white text-xs rounded-full transition-all ${
//                         selectedTeam['Offside'] === 'Real' ? 'bg-red-800 ring-2 ring-white' : 'bg-red-500 hover:bg-red-600'
//                       }`}
//                     >
//                       Real
//                     </button>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => addAnalysisMarker('Offside', selectedTeam['Offside'], null)}
//                   className="w-full py-2 bg-pink-800 text-white text-sm rounded-lg hover:bg-pink-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   disabled={!selectedTeam['Offside']}
//                 >
//                   Submit
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Current Analysis */}
//           <div>
//             <h4 className="font-medium mb-3 text-gray-700">Analysis Markers ({analysisMarkers.length})</h4>
//             <div className="space-y-2 max-h-40 overflow-y-auto">
//               {analysisMarkers.map(marker => {
//                 const config = eventConfig[marker.type];
//                 return (
//                   <div key={marker.id} className={`text-xs p-3 ${config.markerColor} rounded-lg border-l-4 ${config.borderColor} shadow-sm`}>
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <div className="font-semibold text-gray-800">{marker.type} - {marker.team}</div>
//                         <div className="text-gray-700 mt-1">
//                           {formatTime(marker.startTime)} - {formatTime(marker.endTime)}
//                           {marker.action && ` (${marker.action})`}
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => removeAnalysisMarker(marker.id)}
//                         className="text-red-600 hover:text-red-800 ml-2"
//                       >
//                         <X size={14} />
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//               {analysisMarkers.length === 0 && (
//                 <div className="text-xs text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg">
//                   No analysis markers yet. Click Submit on events above to add markers.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FootballMatchAnalyzer;