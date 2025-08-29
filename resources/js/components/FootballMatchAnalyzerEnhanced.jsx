import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, X, Save, ChevronDown, ChevronUp } from 'lucide-react';

const FootballMatchAnalyzer = ({ matchId = 1 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6000); // 100 minutes in seconds
  const [videoProgress, setVideoProgress] = useState(0);
  const [analysisMarkers, setAnalysisMarkers] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEventSections, setActiveEventSections] = useState({});
  const [selectedTeams, setSelectedTeams] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState({});
  
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [videoTitle, setVideoTitle] = useState(null);

  // Event types configuration with unique colors and actions
  const eventTypes = [
    { 
      name: 'Possession', 
      color: '#10B981', 
      // bgColor: 'bg-emerald-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Ball Control', 'Pass', 'Dribble', 'Cross']
    },
    { 
      name: 'Transition', 
      color: '#3B82F6', 
      // bgColor: 'bg-blue-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Counter Attack', 'Build Up', 'Switch Play']
    },
    { 
      name: 'Set Play', 
      color: '#8B5CF6', 
      // bgColor: 'bg-purple-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Corner', 'Free Kick', 'Throw In', 'Penalty']
    },
    { 
      name: 'Attack 3rd', 
      color: '#F97316', 
      // bgColor: 'bg-orange-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Final Third Entry', 'Box Entry', 'Chance Creation']
    },
    { 
      name: 'Shot', 
      color: '#EF4444', 
      // bgColor: 'bg-red-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Goal', 'Save', 'Wide', 'Blocked', 'Hit Post']
    },
    { 
      name: 'Defensive', 
      color: '#6B7280', 
      // bgColor: 'bg-gray-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Tackle', 'Interception', 'Block', 'Clearance']
    },
    { 
      name: 'Foul', 
      color: '#EAB308', 
      // bgColor: 'bg-yellow-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Yellow Card', 'Red Card', 'Free Kick', 'Advantage']
    },
    { 
      name: 'Offside', 
      color: '#EC4899', 
      // bgColor: 'bg-pink-500',
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Offside Called', 'VAR Check']
    }
  ];

  // Teams configuration with players
  const teams = [
    { 
      name: 'Schwaig', 
      color: 'bg-blue-600', 
      shortName: 'Schwaig',
      players: [
        { id: 1, name: 'Player 1', jerseyNo: 1 },
        { id: 2, name: 'Player 2', jerseyNo: 7 },
        { id: 3, name: 'Player 3', jerseyNo: 10 },
        { id: 4, name: 'Player 4', jerseyNo: 9 },
        { id: 5, name: 'Player 5', jerseyNo: 11 },
        { id: 6, name: 'Player 6', jerseyNo: 6 },
        { id: 7, name: 'Player 7', jerseyNo: 4 },
        { id: 8, name: 'Player 8', jerseyNo: 8 },
        { id: 9, name: 'Player 9', jerseyNo: 2 }
      ]
    },
    { 
      name: 'Rosenheim', 
      color: 'bg-red-600', 
      shortName: 'Rosenheim',
      players: [
        { id: 10, name: 'Player 10', jerseyNo: 1 },
        { id: 11, name: 'Player 11', jerseyNo: 7 },
        { id: 12, name: 'Player 12', jerseyNo: 10 },
        { id: 13, name: 'Player 13', jerseyNo: 9 },
        { id: 14, name: 'Player 14', jerseyNo: 11 },
        { id: 15, name: 'Player 15', jerseyNo: 6 },
        { id: 16, name: 'Player 16', jerseyNo: 4 },
        { id: 17, name: 'Player 17', jerseyNo: 8 },
        { id: 18, name: 'Player 18', jerseyNo: 2 }
      ]
    }
  ];

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

  // Modify the first useEffect hook for fetching video
  // useEffect(() => {
  //   // Get video data from blade's div
  //   const el = document.getElementById("football-analyzer");
  //   if (el) {
  //     const videoData = JSON.parse(el.dataset.video);

  //     if (videoData && videoData.video_url) {
  //       setVideoUrl(videoData.video_url);
        
  //       // Create temporary video element to get duration
  //       const tempVideo = document.createElement('video');
  //       tempVideo.src = videoData.video_url;
  //       tempVideo.onloadedmetadata = () => {
  //         setDuration(Math.floor(tempVideo.duration));
  //         setCurrentTime(0);
  //         setIsPlaying(false);
  //         if (videoRef.current) {
  //           videoRef.current.currentTime = 0;
  //         }
  //       };
  //     }
  //   }
  // }, []);
  

  // Sync video with timeline
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
      
      try {
        if (isPlaying && videoRef.current.paused) {
          videoRef.current.play()
            .catch(error => console.error("Video play error:", error));
        } else if (!isPlaying && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      } catch (error) {
        console.error("Video control error:", error);
      }
    }
  }, [currentTime, isPlaying, videoUrl]);

  // Update the video time sync useEffect
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Only sync if there's a significant time difference to avoid constant updates
      const timeDiff = Math.abs(videoRef.current.currentTime - currentTime);
      if (timeDiff > 0.5) { // Only sync if difference is more than 0.5 seconds
        videoRef.current.currentTime = currentTime;
      }
      
      if (isPlaying && videoRef.current.paused) {
        videoRef.current.play();
      } else if (!isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [currentTime, isPlaying, videoUrl]);

  // Update the handleVideoTimeUpdate function
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const newTime = Math.floor(videoRef.current.currentTime);
      // Only update if the time has actually changed to reduce re-renders
      if (newTime !== currentTime) {
        setCurrentTime(newTime);
        setVideoProgress((newTime / duration) * 100);
      }
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

  // Toggle event section in details panel
  const toggleEventSection = (eventType) => {
    setActiveEventSections(prev => ({
      ...prev,
      [eventType]: !prev[eventType]
    }));
  };

  // Handle team selection
  const handleTeamSelection = (eventType, team) => {
    setSelectedTeams(prev => ({
      ...prev,
      [eventType]: team
    }));
    // Clear selected player when team changes
    setSelectedPlayers(prev => ({
      ...prev,
      [eventType]: null
    }));
  };

  // Handle player selection
  const handlePlayerSelection = (eventType, player) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [eventType]: player
    }));
  };

  // Add marker to timeline
  const addMarkerToTimeline = (eventType, action = null) => {
    const eventConfig = eventTypes.find(et => et.name === eventType);
    const team = selectedTeams[eventType];
    const player = selectedPlayers[eventType];
    
    if (!team) {
      alert('Please select a team first');
      return;
    }

    // For Shot and Set Play events, require player selection
    if (['Shot', 'Set Play'].includes(eventType) && !player) {
      alert('Please select a player for this event');
      return;
    }

    const newMarker = {
      id: Date.now(),
      time: currentTime,
      eventType,
      team: team.name,
      player_id: player ? player.id : null,
      jerseyNo: player ? player.jerseyNo : null,
      playerName: player ? player.name : null,
      action,
      color: eventConfig.color
    };

    setAnalysisMarkers(prev => [...prev, newMarker]);
  };

  // Remove marker from timeline and action list
  const removeMarker = (markerId) => {
    setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
  };

  // Generate timeline with second-wise precision
  const generateTimelineGrid = () => {
    const elements = [];
    const pixelsPerSecond = 2; // 2 pixels per second for better precision
    const totalWidth = duration * pixelsPerSecond;
    
    // Major time markers (every 5 minutes)
    for (let i = 0; i <= duration; i += 300) {
      const leftPosition = (i / duration) * 100;
      elements.push(
        <div
          key={`major-${i}`}
          className="absolute top-0 bottom-0 border-l-2 border-gray-400"
          style={{ left: `${leftPosition}%` }}
        >
          <span className="absolute -top-6 -left-4 bg-white px-1 text-xs font-semibold text-gray-700">
            {formatTime(i)}
          </span>
        </div>
      );
    }

    // Minor time markers (every minute)
    for (let i = 60; i <= duration; i += 60) {
      if (i % 300 !== 0) { // Don't duplicate major markers
        const leftPosition = (i / duration) * 100;
        elements.push(
          <div
            key={`minor-${i}`}
            className="absolute top-0 bottom-0 border-l border-gray-300"
            style={{ left: `${leftPosition}%` }}
          >
            <span className="absolute -top-5 -left-3 text-xs text-gray-500">
              {formatTime(i)}
            </span>
          </div>
        );
      }
    }

    return elements;
  };

  // Save analysis data
  const saveAllAnalysis = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('Error saving analysis. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-full mx-auto bg-gray-100 min-h-screen">
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
      <div className="bg-white shadow-sm">
        <div className="h-128 relative">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain bg-black"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(Math.floor(videoRef.current.duration));
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              playsInline
              preload="auto"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-lg"
              >
                <Upload size={24} />
                Upload Match Video
              </button>
            </div>
          )}
          
          {/* Video overlay info */}
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-75 px-4 py-2 rounded-lg">
            <div className="text-lg font-semibold">{formatTime(currentTime)} / {formatTime(duration)}</div>
          </div>
          
          {/* Save button overlay */}
          <div className="absolute top-4 right-4">
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
        
        {/* Video Controls */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className=""></div>
            <div className="flex items-center gap-4 ml-24">
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SkipBack size={20} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {uploadedVideo ? uploadedVideo.name.substring(0, 50) + '...' : 'No video loaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex h-screen bg-gray-100">
        {/* Column 1: Timeline */}
        <div className="w-1/2 bg-white border-r border-gray-300">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
          </div>
          
          <div className="p-4">
            {/* Timestamp Header */}
            <div className="mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="text-lg font-mono font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg border">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>

            {/* Event Types Labels Column */}
            <div className="flex">
              <div className="w-24 mr-4">
                <div className="text-sm font-medium text-gray-600 mb-1 h-12 flex items-center">Timeline</div>
                {eventTypes.map((eventType, index) => (
                  <div
                    key={eventType.name}
                    className="text-xs font-medium text-gray-700 flex items-center border-b border-gray-200 px-1"
                    style={{ height: '24px' }}
                  >
                    <div 
                      className="w-3 h-3 rounded-sm mr-2"
                      style={{ backgroundColor: eventType.color }}
                    />
                    {eventType.name}
                  </div>
                ))}
              </div>

              {/* Timeline Area with Horizontal Scroll */}
              <div className="flex-1 overflow-x-auto">
                <div
                  ref={timelineRef}
                  className="relative bg-gray-50 border border-gray-200 cursor-crosshair"
                  style={{ 
                    height: `${48 + (eventTypes.length * 26)}px`,
                    width: `${Math.max(800, duration * 2)}px`
                  }}
                >
                  {/* Horizontal Scrollable Timeline Header */}
                  <div className="h-8 bg-gradient-to-r from-gray-500 to-gray-600 relative">
                    {/* Second markers */}
                    {Array.from({ length: duration + 1 }, (_, i) => {
                      const leftPosition = (i / duration) * 100;
                      const isSecondMark = i % 1 === 0;
                      const isTenSecMark = i % 10 === 0;
                      const isMinuteMark = i % 60 === 0;
                      
                      return (
                        <div
                          key={`timeline-marker-${i}`}
                          className="absolute top-0 bottom-0 flex flex-col justify-between"
                          style={{ left: `${leftPosition}%` }}
                        >
                          {/* Time labels */}
                          {isMinuteMark && (
                            <div className="text-xs text-white font-medium px-1 bg-black bg-opacity-30 rounded">
                              {formatTime(i)}
                            </div>
                          )}
                          {/* {isTenSecMark && !isMinuteMark && (
                            <div className="text-xs text-white px-1">
                              {i}s
                            </div>
                          )} */}
                          
                          {/* Tick marks */}
                          <div className="flex-1 flex flex-col justify-end">
                            <div 
                              className={`border-l ${
                                isMinuteMark 
                                  ? 'border-white border-l-2 h-6' 
                                  : isTenSecMark 
                                  ? 'border-gray-200 h-4' 
                                  : 'border-gray-300 h-2'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Current time indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-30 transition-all duration-100"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar (blue) */}
                  <div
                    className="absolute top-8 h-55.5 bg-blue-500 opacity-30 transition-all duration-100"
                    style={{ width: `${videoProgress}%` }}
                  />
                  
                  {/* Current time indicator (red line) for event area */}
                  <div
                    className="absolute top-12 bottom-0 w-1 bg-red-500 z-20 transition-all duration-100"
                    style={{ left: `${videoProgress}%` }}
                  />
                  
                  {/* Event markers on respective rows */}
                  {analysisMarkers.map(marker => {
                    const leftPosition = (marker.time / duration) * 100;
                    const eventTypeIndex = eventTypes.findIndex(et => et.name === marker.eventType);
                    const topOffset = 48 + (eventTypeIndex * 24) + 4;
                    
                    return (
                      <div
                        key={marker.id}
                        className="absolute group cursor-pointer"
                        style={{
                          left: `${leftPosition}%`,
                          top: `${topOffset}px`
                        }}
                      >
                        {/* Main marker */}
                        <div
                          className="w-2 h-4 rounded-sm shadow-md border border-white z-10 hover:scale-110 transition-transform"
                          style={{ backgroundColor: marker.color }}
                          title={`${marker.eventType} - ${marker.team}${marker.playerName ? ` (#${marker.jerseyNo} ${marker.playerName})` : ''} at ${formatTime(marker.time)}${marker.action ? ` (${marker.action})` : ''}`}
                        />
                        
                        {/* Delete button (appears on hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(marker.id);
                          }}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          style={{ fontSize: '10px' }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {/* Click handler overlay */}
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      const newTime = Math.floor(percentage * duration);
                      setCurrentTime(Math.max(0, Math.min(duration, newTime)));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Event Types */}
        <div className="w-1/4 bg-gray-50 border-r border-gray-300">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Event Types</h3>
          </div>
          
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="grid grid-cols-3 gap-2">
              {eventTypes.map(eventType => (
                <button
                  key={eventType.name}
                  onClick={() => toggleEventSection(eventType.name)}
                  className={`p-2 rounded-md text-white text-xs font-medium transition-all hover:opacity-90 hover:scale-105 ${eventType.bgColor}`}
                  style={{ minHeight: '40px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div 
                      className=""
                      // className="w-4 h-4 rounded-sm mb-1"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                    />
                    <span className="text-center leading-tight">{eventType.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Event Details */}
        <div className="w-1/4 bg-white">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
          </div>
          
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 130px)' }}>
            {/* Active Event Sections */}
            {Object.entries(activeEventSections).filter(([_, active]) => active).map(([eventType, _]) => {
              const eventConfig = eventTypes.find(et => et.name === eventType);
              const selectedTeam = selectedTeams[eventType];
              
              return (
                <div key={eventType} className="border-b border-[#EFEFEF]">
                  <div className={` bg-[#EFEFEF] text-black`}>
                    <div className="flex items-center justify-between mb-3 bg-[#1fcefe] px-4 py-2">
                      <span className="font-semibold text-white">{eventType}</span>
                      <button
                        onClick={() => toggleEventSection(eventType)}
                        className="text-white hover:text-gray-200"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>
                    
                    {/* Team Selection */}
                    <div className="mb-3 px-4">
                      <div className="text-sm mb-2">Select Team:</div>
                      <div className="flex gap-2">
                        {teams.map(team => (
                          <button
                            key={team.name}
                            onClick={() => handleTeamSelection(eventType, team)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              selectedTeam?.name === team.name
                                ? 'bg-[linear-gradient(180deg,#E001F7_0%,#E801DD_20%,#F901B1_40%,#FD0E9E_60%,#FE2F87_80%,#FE3A68_100%)] text-white'
                                : 'bg-[linear-gradient(180deg,#01BB96_0%,#01C59D_25%,#01CA9E_50%,#03D492_77.5%,#06DF73_100%)] bg-opacity-20 text-white hover:bg-opacity-30'
                            }`}
                          >
                            {team.shortName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Player Selection for Shot and Set Play events */}
                    {(['Shot', 'Set Play'].includes(eventType) && selectedTeam) && (
                      <div className="mb-3 px-4">
                        <div className="text-sm mb-2">Select Player:</div>
                        <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                          {selectedTeam.players.map(player => (
                            <button
                              key={player.id}
                              onClick={() => handlePlayerSelection(eventType, player)}
                              className={`p-1 rounded text-xs font-medium transition-colors ${
                                selectedPlayers[eventType]?.id === player.id
                                  ? 'bg-white text-gray-800'
                                  : 'bg-[#3B1144] bg-opacity-20 text-white hover:bg-opacity-30'
                              }`}
                            >
                              #{player.jerseyNo}
                            </button>
                          ))}
                        </div>
                        {selectedPlayers[eventType] && (
                          <div className="text-xs mt-1 bg-white bg-opacity-20 rounded px-2 py-1">
                            Selected: #{selectedPlayers[eventType].jerseyNo} - {selectedPlayers[eventType].name}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="space-y-2 p-4">
                      <div className="text-sm">Actions:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {eventConfig.actions.map(action => (
                          <button
                            key={action}
                            onClick={() => addMarkerToTimeline(eventType, action)}
                            disabled={!selectedTeam}
                            className="px-2 py-1 text-xs bg-[#3B1144] bg-opacity-20 text-white rounded hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Action List */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Action List ({analysisMarkers.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {analysisMarkers.map(marker => (
                  <div key={marker.id} className="p-2 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: marker.color }}
                        />
                        <span className="text-sm font-medium">{marker.eventType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formatTime(marker.time)}</span>
                        <button
                          onClick={() => removeMarker(marker.id)}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          style={{ fontSize: '10px' }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {marker.team}
                      {marker.playerName && ` • #${marker.jerseyNo} ${marker.playerName}`}
                      {marker.action && ` • ${marker.action}`}
                    </div>
                  </div>
                ))}
                {analysisMarkers.length === 0 && (
                  <div className="text-sm text-gray-500 italic text-center py-4">
                    No events recorded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballMatchAnalyzer;