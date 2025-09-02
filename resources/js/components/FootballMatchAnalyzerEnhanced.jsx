import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, X, Save, ChevronDown, ChevronUp, BarChart3, ClipboardList, Filter, Maximize, Edit2, FastForward, Rewind } from 'lucide-react';

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
  const [selectedTeams, setSelectedTeams] = useState({});
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // New state for playback speed
  
  // New states for event configuration
  const [selectedEventForConfig, setSelectedEventForConfig] = useState(null);
  const [eventConfigData, setEventConfigData] = useState({});
  
  // New states for possession tracking
  const [activePossession, setActivePossession] = useState(null); // null, 'A', or 'B'
  const [possessionStartTime, setPossessionStartTime] = useState(null);
  const [activePossessionTeam, setActivePossessionTeam] = useState('A'); // Track which team should start next possession
  
  // New states for period and attack 3rd tracking
  const [activePeriod, setActivePeriod] = useState(false);
  const [periodStartTime, setPeriodStartTime] = useState(null);
  const [activeAttack3rd, setActiveAttack3rd] = useState(false);
  const [attack3rdStartTime, setAttack3rdStartTime] = useState(null);
  
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const videoContainerRef = useRef(null);
  const isSeekingRef = useRef(false);
  const [videoTitle, setVideoTitle] = useState(null);

  // Event types configuration with unique colors and actions
  const eventTypes = [
    { 
      name: 'Period', 
      color: '#6B7280', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Tackle', 'Interception', 'Block', 'Clearance'],
      isTimeBased: true,
      key: 'i'
    },
    { 
      name: 'Possession', 
      color: '#10B981', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Ball Control', 'Pass', 'Dribble', 'Cross'],
      isTimeBased: true,
      key: 'p'
    },
    { 
      name: 'Transition', 
      color: '#3B82F6', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Counter Attack', 'Build Up', 'Switch Play'],
      key: 'r'
    },
    { 
      name: 'Set Play', 
      color: '#8B5CF6', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Corner', 'Free Kick', 'Throw In', 'Penalty'],
      key: 't'
    },
    { 
      name: 'Attack 3rd', 
      color: '#F97316', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Final Third Entry', 'Box Entry', 'Chance Creation'],
      isTimeBased: true,
      key: 'a'
    },
    { 
      name: 'Shot', 
      color: '#EF4444', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Goal', 'Save', 'Wide', 'Blocked', 'Hit Post'],
      key: 's'
    },
    { 
      name: 'Foul', 
      color: '#EAB308', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Yellow Card', 'Red Card', 'Free Kick', 'Advantage'],
      key: 'f'
    },
    { 
      name: 'Offside', 
      color: '#EC4899', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Offside Called', 'VAR Check'],
      key: 'o'
    },
    { 
      name: 'Aerial Duel', 
      color: '#06B6D4', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Won Header', 'Lost Header', 'Flick On', 'Clearance'],
      key: 'd'
    }
  ];

  // Teams configuration with players
  const teams = [
    { 
      name: 'Team A', 
      color: '#EF4444', // Red color for Team A
      bgColor: 'bg-red-600',
      shortName: 'Team A',
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
      name: 'Team B', 
      color: '#10B981', // Green color for Team B
      bgColor: 'bg-green-600',
      shortName: 'Team B',
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

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle mouse movement over video to show controls
  const handleVideoMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds of no mouse movement
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setIsVideoLoading(true);
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
        setIsVideoLoading(false);
      };
      tempVideo.onerror = () => {
        setIsVideoLoading(false);
      };
    }
  };

  // Handle seeking
  const seekToTime = (newTime) => {
    if (videoRef.current && videoUrl) {
      isSeekingRef.current = true;
      videoRef.current.currentTime = newTime;
      setCurrentTime(Math.floor(newTime));
      setVideoProgress((newTime / duration) * 100);
      
      // Reset seeking flag after a short delay
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    } else {
      // For non-video timeline, just update the time
      setCurrentTime(Math.floor(newTime));
    }
  };

  // Sync video with timeline
  useEffect(() => {
    if (videoRef.current && videoUrl && !isSeekingRef.current) {
      // Set playback speed
      if (videoRef.current.playbackRate !== playbackSpeed) {
        videoRef.current.playbackRate = playbackSpeed;
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
  }, [isPlaying, videoUrl, playbackSpeed]);

  // Update the handleVideoTimeUpdate function
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isSeekingRef.current) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(Math.floor(newTime));
      setVideoProgress((newTime / duration) * 100);
    }
  };

  // Play/pause functionality - only for non-video timeline
  useEffect(() => {
    // Only use interval when there's no video
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
      seekToTime(newTime);
    }
  };

  // Handle possession toggle
  const handlePossessionToggle = () => {
    if (activePossession) {
      // End current possession
      const endTime = currentTime;
      const startTime = possessionStartTime;
      const team = teams.find(t => t.shortName === `Team ${activePossession}`);
      
      // Create possession marker
      const possessionMarker = {
        id: Date.now(),
        time: startTime,
        endTime: endTime,
        eventType: 'Possession',
        team: team.name,
        player_id: null,
        jerseyNo: null,
        playerName: null,
        action: 'Ball Control',
        color: team.color,
        isTimeBased: true,
        isConfigured: true
      };
      
      setAnalysisMarkers(prev => [...prev, possessionMarker]);
      
      // Reset possession state
      setActivePossession(null);
      setPossessionStartTime(null);
      
      // Switch to other team for next possession
      setActivePossessionTeam(activePossession === 'A' ? 'B' : 'A');
    } else {
      // Start new possession
      setActivePossession(activePossessionTeam);
      setPossessionStartTime(currentTime);
      
      // Automatically create a transition event
      const transitionStartTime = Math.max(0, currentTime - 2);
      const transitionEndTime = Math.min(duration, currentTime + 2);
      
      const transitionMarker = {
        id: Date.now() + 1,
        time: transitionStartTime,
        endTime: transitionEndTime,
        eventType: 'Transition',
        team: null,
        player_id: null,
        jerseyNo: null,
        playerName: null,
        action: null,
        color: eventTypes.find(et => et.name === 'Transition').color,
        isTimeBased: true,
        isConfigured: false
      };
      
      setAnalysisMarkers(prev => [...prev, transitionMarker]);
    }
  };

  // Handle period toggle
  const handlePeriodToggle = () => {
    if (activePeriod) {
      // End current period
      const endTime = currentTime;
      const startTime = periodStartTime;
      
      // Create period marker
      const periodMarker = {
        id: Date.now(),
        time: startTime,
        endTime: endTime,
        eventType: 'Period',
        team: 'Match',
        player_id: null,
        jerseyNo: null,
        playerName: null,
        action: 'Period',
        color: eventTypes.find(et => et.name === 'Period').color,
        isTimeBased: true,
        isConfigured: true
      };
      
      setAnalysisMarkers(prev => [...prev, periodMarker]);
      
      // Reset period state
      setActivePeriod(false);
      setPeriodStartTime(null);
    } else {
      // Start new period
      setActivePeriod(true);
      setPeriodStartTime(currentTime);
    }
  };

  // Handle attack 3rd toggle
  const handleAttack3rdToggle = () => {
    if (activeAttack3rd) {
      // End current attack 3rd
      const endTime = currentTime;
      const startTime = attack3rdStartTime;
      
      // Create attack 3rd marker
      const attack3rdMarker = {
        id: Date.now(),
        time: startTime,
        endTime: endTime,
        eventType: 'Attack 3rd',
        team: 'Match',
        player_id: null,
        jerseyNo: null,
        playerName: null,
        action: 'Final Third Entry',
        color: eventTypes.find(et => et.name === 'Attack 3rd').color,
        isTimeBased: true,
        isConfigured: true
      };
      
      setAnalysisMarkers(prev => [...prev, attack3rdMarker]);
      
      // Reset attack 3rd state
      setActiveAttack3rd(false);
      setAttack3rdStartTime(null);
    } else {
      // Start new attack 3rd
      setActiveAttack3rd(true);
      setAttack3rdStartTime(currentTime);
    }
  };

  // Add unconfigured marker to timeline
  const addEventToTimeline = (eventTypeName) => {
    // Handle possession specially
    if (eventTypeName === 'Possession') {
      handlePossessionToggle();
      return;
    }

    // Handle period specially
    if (eventTypeName === 'Period') {
      handlePeriodToggle();
      return;
    }

    // Handle attack 3rd specially
    if (eventTypeName === 'Attack 3rd') {
      handleAttack3rdToggle();
      return;
    }
    
    const eventConfig = eventTypes.find(et => et.name === eventTypeName);
    
    // Create marker with 4 seconds before and 7 seconds after current time
    const startTime = Math.max(0, currentTime - 4);
    const endTime = Math.min(duration, currentTime + 7);

    const newMarker = {
      id: Date.now(),
      time: startTime,
      endTime: endTime,
      eventType: eventTypeName,
      team: null,
      player_id: null,
      jerseyNo: null,
      playerName: null,
      action: null,
      color: eventConfig.color,
      isTimeBased: true,
      isConfigured: false // Mark as unconfigured
    };

    setAnalysisMarkers(prev => [...prev, newMarker]);
  };

  // Handle clicking on timeline event bar
  const handleEventBarClick = (marker, e) => {
    e.stopPropagation();
    if (!marker.isConfigured) {
      setSelectedEventForConfig(marker);
      setEventConfigData({
        selectedTeam: null,
        selectedPlayer: null,
        selectedAction: null
      });
    }
  };

  // Edit configured event
  const handleEditEvent = (marker) => {
    setEditingMarkerId(marker.id);
    setSelectedEventForConfig(marker);
    const team = teams.find(t => t.name === marker.team);
    const player = team?.players.find(p => p.id === marker.player_id);
    setEventConfigData({
      selectedTeam: team,
      selectedPlayer: player,
      selectedAction: marker.action
    });
  };

  // Save configured event
  const saveConfiguredEvent = () => {
    if (!selectedEventForConfig || !eventConfigData.selectedTeam) {
      alert('Please select a team');
      return;
    }

    // For Shot and Set Play events, require player selection
    if (['Shot', 'Set Play', 'Aerial Duel'].includes(selectedEventForConfig.eventType) && !eventConfigData.selectedPlayer) {
      alert('Please select a player for this event');
      return;
    }

    // Update the marker with configuration
    setAnalysisMarkers(prev => 
      prev.map(marker => 
        marker.id === selectedEventForConfig.id 
          ? {
              ...marker,
              team: eventConfigData.selectedTeam.name,
              player_id: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.id : null,
              jerseyNo: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.jerseyNo : null,
              playerName: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.name : null,
              action: eventConfigData.selectedAction || eventTypes.find(et => et.name === marker.eventType).actions[0],
              isConfigured: true
            }
          : marker
      )
    );

    // Close configuration panel and reset editing state
    setSelectedEventForConfig(null);
    setEventConfigData({});
    setEditingMarkerId(null);
  };

  // Cancel event configuration
  const cancelEventConfig = () => {
    setSelectedEventForConfig(null);
    setEventConfigData({});
    setEditingMarkerId(null);
  };

  // Remove marker from timeline and action list
  const removeMarker = (markerId) => {
    setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
    // Close config panel if this marker was being configured
    if (selectedEventForConfig && selectedEventForConfig.id === markerId) {
      setSelectedEventForConfig(null);
      setEventConfigData({});
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle keys when not typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      const eventType = eventTypes.find(et => et.key === key);
      
      if (eventType) {
        e.preventDefault();
        addEventToTimeline(eventType.name);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, duration, activePossession, activePeriod, activeAttack3rd, possessionStartTime, periodStartTime, attack3rdStartTime, activePossessionTeam]);

  const generateTimelineGrid = () => {
    const elements = [];
    
    // Minute-based column lines
    for (let i = 60; i <= duration; i += 60) {
      const leftPosition = (i / duration) * 100;
      elements.push(
        <div
          key={`minute-line-${i}`}
          className="absolute top-0 bottom-0 border-l border-gray-300"
          style={{ left: `${leftPosition}%` }}
        />
      );
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
        <div 
          ref={videoContainerRef}
          className="relative bg-black" 
          onMouseMove={handleVideoMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-88 object-contain bg-black"
                style={{
                  height: document.fullscreenElement ? '100vh' : '352px'
                }}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(Math.floor(videoRef.current.duration));
                    setCurrentTime(videoRef.current.currentTime);
                    setIsVideoLoading(false);
                  }
                }}
                onLoadStart={() => setIsVideoLoading(true)}
                onCanPlay={() => setIsVideoLoading(false)}
                playsInline
                preload="auto"
              />
              
              {/* Video Timeline */}
              <div className="absolute bottom-4 left-0 right-0 px-4">
                <div 
                  className="h-1 bg-gray-600 bg-opacity-50 rounded-full cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newTime = percentage * duration;
                    seekToTime(newTime);
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                    style={{ width: `${videoProgress}%` }}
                  />
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                    style={{ left: `${videoProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-88 bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center">
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
            {activePossession && (
              <div className="text-sm mt-1">
                <span className={`px-2 py-1 rounded text-xs ${activePossession === 'A' ? 'bg-red-600' : 'bg-green-600'}`}>
                  Team {activePossession} Possession Active
                </span>
              </div>
            )}
            {activePeriod && (
              <div className="text-sm mt-1">
                <span className="px-2 py-1 rounded text-xs bg-gray-600">
                  Period Active
                </span>
              </div>
            )}
            {activeAttack3rd && (
              <div className="text-sm mt-1">
                <span className="px-2 py-1 rounded text-xs bg-orange-600">
                  Attack 3rd Active
                </span>
              </div>
            )}
          </div>
          
          {/* Keyboard shortcuts info */}
          {/* <div className="absolute bottom-20 left-4 text-white bg-black bg-opacity-75 px-3 py-2 rounded-lg">
            <div className="text-xs">
              <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
              <div>I: Period | P: Possession | T: Set Play | A: Attack 3rd</div>
              <div>S: Shot | F: Foul | O: Offside | R: Transition | D: Aerial Duel</div>
            </div>
          </div> */}
          
          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-10 right-4 p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            <Maximize size={20} />
          </button>
          
          {/* Save button overlay */}
          <div className="absolute top-4 right-4">
            {/* Stat buttons */}
            <div className="flex flex-row mb-4">
              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-l-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BarChart3 size={18} />
              </button>

              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardList size={18} />
              </button>

              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-r-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Filter size={18} />
              </button>
            </div>

            <div className="flex flex-row-reverse">
              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Overlay Video Controls */}
          {videoUrl && (
            <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex items-center gap-4 bg-black bg-opacity-75 px-3.5 py-2 rounded-full">
                <button
                  onClick={() => {
                    const newTime = Math.max(0, currentTime - 10);
                    seekToTime(newTime);
                  }}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Rewind size={18} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    seekToTime(newTime);
                  }}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                >
                  {/* <SkipForward  /> */}
                  <FastForward size={18} />
                </button>
                
                {/* Speed Control Dropdown */}
                <div className="relative group">
                  <button className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
                    {playbackSpeed}x
                  </button>
                  <div className="absolute bottom-full mb-0.5 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-gray-800 rounded-md shadow-lg overflow-hidden">
                      <button
                        onClick={() => setPlaybackSpeed(0.5)}
                        className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 0.5 ? 'bg-blue-600' : ''}`}
                      >
                        0.5x
                      </button>
                      <button
                        onClick={() => setPlaybackSpeed(1)}
                        className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 1 ? 'bg-blue-600' : ''}`}
                      >
                        1x
                      </button>
                      <button
                        onClick={() => setPlaybackSpeed(2)}
                        className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 2 ? 'bg-blue-600' : ''}`}
                      >
                        2x
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Video Loading Indicator */}
        {isVideoLoading && (
          <div className="bg-gray-100 py-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading video...</span>
            </div>
          </div>
        )}
      </div>


      {/* Main Content - Three Column Layout */}
      <div className="flex h-auto bg-gray-100">
        {/* Column 1: Timeline */}
        <div className="w-1/2 bg-white border-r border-gray-300">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
          </div>
          
          <div className="p-4">
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
                  {/* Minute-based column lines */}
                  {generateTimelineGrid()}

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
                    className="absolute top-8 h-62 bg-blue-500 opacity-30 transition-all duration-100"
                    style={{ width: `${videoProgress}%` }}
                  />
                  
                  {/* Current time indicator (red line) for event area */}
                  <div
                    className="absolute top-12 bottom-0 w-1 bg-red-500 z-20 transition-all duration-100"
                    style={{ left: `${videoProgress}%` }}
                  />
                  
                  {/* Active possession bar */}
                  {activePossession && possessionStartTime !== null && (
                    <div
                      className="absolute z-15 opacity-60"
                      style={{
                        left: `${(possessionStartTime / duration) * 100}%`,
                        width: `${((currentTime - possessionStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Possession') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: activePossession === 'A' ? '#EF4444' : '#10B981'
                      }}
                    />
                  )}

                  {/* Active period bar */}
                  {activePeriod && periodStartTime !== null && (
                    <div
                      className="absolute z-15 opacity-60"
                      style={{
                        left: `${(periodStartTime / duration) * 100}%`,
                        width: `${((currentTime - periodStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Period') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: '#6B7280'
                      }}
                    />
                  )}

                  {/* Active attack 3rd bar */}
                  {activeAttack3rd && attack3rdStartTime !== null && (
                    <div
                      className="absolute z-15 opacity-60"
                      style={{
                        left: `${(attack3rdStartTime / duration) * 100}%`,
                        width: `${((currentTime - attack3rdStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Attack 3rd') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: '#F97316'
                      }}
                    />
                  )}
                  
                  {/* Time-based event bars */}
                  {analysisMarkers.filter(marker => marker.isTimeBased && marker.endTime).map(marker => {
                    const eventTypeIndex = eventTypes.findIndex(et => et.name === marker.eventType);
                    const leftPosition = (marker.time / duration) * 100;
                    const width = ((marker.endTime - marker.time) / duration) * 100;
                    const topOffset = 48 + (eventTypeIndex * 24) + 4;
                    
                    return (
                      <div
                        key={`bar-${marker.id}`}
                        className={`absolute group cursor-pointer ${
                          !marker.isConfigured ? 'opacity-40 border-2 border-dashed border-yellow-400' : 'opacity-60'
                        }`}
                        style={{
                          left: `${leftPosition}%`,
                          width: `${width}%`,
                          top: `${topOffset}px`,
                          height: '16px',
                          backgroundColor: marker.color
                        }}
                        title={marker.isConfigured 
                          ? `${marker.eventType} - ${marker.team} from ${formatTime(marker.time)} to ${formatTime(marker.endTime)}${marker.action ? ` (${marker.action})` : ''}`
                          : `Click to configure ${marker.eventType} event`
                        }
                        onClick={(e) => handleEventBarClick(marker, e)}
                      >
                        {/* Configuration indicator for unconfigured events */}
                        {!marker.isConfigured && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        
                        {/* Delete button for events */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(marker.id);
                          }}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-30"
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
                    onClick={handleTimelineClick}
                  />
                </div>
              </div>
            </div>

              {/* Unconfigured Events Section - Below Video */}
              {analysisMarkers.filter(marker => !marker.isConfigured).length > 0 && (
                <div className="bg-yellow-50 border-t-2 border-b-2 border-yellow-200 p-4 mt-2">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    Unconfigured Events (Click to configure):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisMarkers.filter(marker => !marker.isConfigured).map(marker => (
                      <div 
                        key={marker.id} 
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-yellow-300 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                        onClick={() => {
                          setSelectedEventForConfig(marker);
                          setEventConfigData({
                            selectedTeam: null,
                            selectedPlayer: null,
                            selectedAction: null
                          });
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: marker.color }}
                        />
                        <span className="text-sm font-medium">{marker.eventType}</span>
                        <span className="text-xs text-gray-500">
                          {formatTime(marker.time)} - {formatTime(marker.endTime)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(marker.id);
                          }}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          style={{ fontSize: '10px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

          </div>
        </div>

        {/* Column 2: Event Types and Action List */}
        <div className="w-1/4 bg-gray-50 border-r border-gray-300 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Event Types</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-6">
              {eventTypes.map(eventType => (
                <button
                  key={eventType.name}
                  onClick={() => addEventToTimeline(eventType.name)}
                  className={`p-2 rounded-md text-white text-xs font-medium transition-all hover:opacity-90 hover:scale-105 ${eventType.bgColor} ${
                    (eventType.name === 'Possession' && activePossession) ||
                    (eventType.name === 'Period' && activePeriod) ||
                    (eventType.name === 'Attack 3rd' && activeAttack3rd)
                      ? 'ring-2 ring-yellow-400 ring-offset-2' 
                      : ''
                  }`}
                  style={{ minHeight: '40px' }}
                  title={`Press ${eventType.key.toUpperCase()} or click to add ${eventType.name}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-center leading-tight">
                      {eventType.name}
                      <span className="block text-xs opacity-75">({eventType.key.toUpperCase()})</span>
                      {eventType.name === 'Possession' && activePossession && (
                        <span className="block text-xs mt-1">
                          {activePossession === 'A' ? 'Team A' : 'Team B'}
                        </span>
                      )}
                      {eventType.name === 'Period' && activePeriod && (
                        <span className="block text-xs mt-1">Active</span>
                      )}
                      {eventType.name === 'Attack 3rd' && activeAttack3rd && (
                        <span className="block text-xs mt-1">Active</span>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action List */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Action List ({analysisMarkers.filter(m => m.isConfigured).length})</h4>
              <div className="space-y-2 h-auto overflow-y-auto">
                {analysisMarkers.filter(marker => marker.isConfigured).map(marker => (
                  <div key={marker.id} className="p-2 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: marker.color }}
                        />
                        <span className="text-sm font-medium">{marker.eventType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          {marker.isTimeBased && marker.endTime 
                            ? `${formatTime(marker.time)} - ${formatTime(marker.endTime)}` 
                            : formatTime(marker.time)
                          }
                        </span>
                        <button
                          onClick={() => handleEditEvent(marker)}
                          className="w-5 h-5 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
                          title="Edit event"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => removeMarker(marker.id)}
                          className="w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Delete event"
                        >
                          <X size={12} />
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
                
                {analysisMarkers.filter(m => m.isConfigured).length === 0 && (
                  <div className="text-sm text-gray-500 italic text-center py-4">
                    No configured events yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Event Configuration */}
        <div className="w-1/4 bg-white">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Event Configuration</h3>
          </div>
          
          <div className="overflow-y-auto">
            {selectedEventForConfig ? (
              // Event Configuration Panel
              <div className="p-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {editingMarkerId ? 'Edit' : 'Configure'} {selectedEventForConfig.eventType}
                  </h4>
                  <div className="text-sm text-blue-600">
                    Time: {formatTime(selectedEventForConfig.time)} - {formatTime(selectedEventForConfig.endTime)}
                  </div>
                </div>

                {/* Team Selection */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Select Team:</div>
                  <div className="flex gap-2">
                    {teams.map(team => (
                      <button
                        key={team.name}
                        onClick={() => setEventConfigData(prev => ({ ...prev, selectedTeam: team, selectedPlayer: null }))}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          eventConfigData.selectedTeam?.name === team.name
                            ? 'bg-blue-600 text-white'
                            : team.name === 'Team A' 
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {team.shortName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Selection for Shot, Set Play, and Aerial Duel events */}
                {(['Shot', 'Set Play', 'Aerial Duel'].includes(selectedEventForConfig.eventType) && eventConfigData.selectedTeam) && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Select Player:</div>
                    <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                      {eventConfigData.selectedTeam.players.map(player => (
                        <button
                          key={player.id}
                          onClick={() => setEventConfigData(prev => ({ ...prev, selectedPlayer: player }))}
                          className={`p-2 rounded text-xs font-medium transition-colors ${
                            eventConfigData.selectedPlayer?.id === player.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          #{player.jerseyNo}
                        </button>
                      ))}
                    </div>
                    {eventConfigData.selectedPlayer && (
                      <div className="text-xs mt-2 bg-blue-50 rounded px-2 py-1">
                        Selected: #{eventConfigData.selectedPlayer.jerseyNo} - {eventConfigData.selectedPlayer.name}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Selection */}
                {eventConfigData.selectedTeam && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Select Action:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {eventTypes.find(et => et.name === selectedEventForConfig.eventType).actions.map(action => (
                        <button
                          key={action}
                          onClick={() => setEventConfigData(prev => ({ ...prev, selectedAction: action }))}
                          className={`px-2 py-2 text-xs rounded transition-colors ${
                            eventConfigData.selectedAction === action
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Save and Cancel buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={saveConfiguredEvent}
                    disabled={!eventConfigData.selectedTeam}
                    className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {editingMarkerId ? 'Update Event' : 'Save Event'}
                  </button>
                  <button
                    onClick={cancelEventConfig}
                    className="flex-1 px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Instructions when no event is selected
              <div className="p-8 text-center text-gray-500">
                <div className="text-lg mb-4">Event Configuration</div>
                <div className="text-sm mb-4">
                  1. Click an event type button or use keyboard shortcuts to add events to timeline
                  <br />
                  2. Click on unconfigured event bars (yellow dashed) to configure them
                  <br />
                  3. Select team, player (for shots/set plays/aerial duels), and action
                  <br />
                  4. Save to add to action list
                </div>
                <div className="text-sm text-blue-600 bg-blue-50 rounded p-3">
                  <strong>Keyboard Shortcuts:</strong>
                  <br />I: Period | P: Possession | T: Set Play
                  <br />A: Attack 3rd | S: Shot | F: Foul | O: Offside
                  <br />R: Transition | D: Aerial Duel
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballMatchAnalyzer;