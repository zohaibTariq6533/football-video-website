// import React, { useState, useRef, useEffect } from 'react';
// import { Play, Pause, SkipBack, SkipForward, Upload, X, Save, ChevronDown, ChevronUp, BarChart3, ClipboardList, Filter, Maximize, Edit2, FastForward, Rewind, Volume2, VolumeX, ExternalLink } from 'lucide-react';
// const FootballMatchAnalyzer = ({ matchId = 1 }) => {
//   const mount = document.getElementById("football-analyzer");
//   const teamsData = JSON.parse(mount.dataset.teams);
//   const videoData = JSON.parse(mount.dataset.video);
   
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(6000);
//   const [videoProgress, setVideoProgress] = useState(0);
//   const [analysisMarkers, setAnalysisMarkers] = useState([]);
//   const [uploadedVideo, setUploadedVideo] = useState(null);
//   const [videoUrl, setVideoUrl] = useState(videoData?.video_url || null);
//   const [teams, setTeams] = useState(teamsData);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   // const [selectedTeams, setSelectedTeams] = useState({});
//   // const [selectedPlayers, setSelectedPlayers] = useState({});
//   const [isVideoLoading, setIsVideoLoading] = useState(!!videoData);
//   const [showControls, setShowControls] = useState(false);
//   const [editingMarkerId, setEditingMarkerId] = useState(null);
//   const [playbackSpeed, setPlaybackSpeed] = useState(1);
//   const [isMuted, setIsMuted] = useState(false);
//   const [volume, setVolume] = useState(1);
//   const [videoTitle, setVideoTitle] = useState(videoData?.title || null);
//   const [analysisId, setAnalysisId] = useState(null);
//   const [showStatsModal, setShowStatsModal] = useState(false);
//   const [statsData, setStatsData] = useState(null);
//   const [isLoadingStats, setIsLoadingStats] = useState(false);
  
//   // New states for event configuration
//   const [selectedEventForConfig, setSelectedEventForConfig] = useState(null);
//   const [eventConfigData, setEventConfigData] = useState({});
  
//   // New states for current events dropdown
//   const [currentEvents, setCurrentEvents] = useState([]);
//   const [showCurrentEventsDropdown, setShowCurrentEventsDropdown] = useState(false);
  
//   // New states for possession tracking
//   const [activePossession, setActivePossession] = useState(null);
//   const [possessionStartTime, setPossessionStartTime] = useState(null);
//   const [activePossessionTeam, setActivePossessionTeam] = useState('A');
  
//   // New states for period and attack 3rd tracking
//   const [activePeriod, setActivePeriod] = useState(false);
//   const [periodStartTime, setPeriodStartTime] = useState(null);
//   const [activeAttack3rd, setActiveAttack3rd] = useState(false);
//   const [attack3rdStartTime, setAttack3rdStartTime] = useState(null);
  
//   const timelineRef = useRef(null);
//   const intervalRef = useRef(null);
//   const videoRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const controlsTimeoutRef = useRef(null);
//   const videoContainerRef = useRef(null);
//   const isSeekingRef = useRef(false);
//   const timelineContainerRef = useRef(null); // New ref for timeline container
  
//   // Event types configuration
//   const eventTypes = [
//     { 
//       name: 'Period', 
//       color: '#6B7280', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: ['First Half', 'Second Half', 'Extra Time', 'Penalty Kicks', 'Time-out'],
//       isTimeBased: true,
//       key: 'i',
//       requiresTeam: false
//     },
//     { 
//       name: 'Possession', 
//       color: '#10B981', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: [],
//       isTimeBased: true,
//       key: 'p',
//       requiresTeam: true
//     },
//     { 
//       name: 'Transition', 
//       color: '#3B82F6', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: ['Transition'],
//       key: 'r',
//       requiresTeam: false
//     },
//     { 
//       name: 'Set Play', 
//       color: '#8B5CF6', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: ['Kick off', 'Free Kick', 'Throw In', 'Penalty Kick', 'Goal Kick', 'Corner Kick'],
//       key: 't',
//       requiresTeam: true
//     },
//     { 
//       name: 'Attack 3rd', 
//       color: '#F97316', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: [],
//       isTimeBased: true,
//       key: 'a',
//       requiresTeam: true
//     },
//     { 
//       name: 'Shot', 
//       color: '#EF4444', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: ['Goal', 'Save', 'Wide', 'Blocked'],
//       key: 's',
//       requiresTeam: true,
//       requiresPlayer: false, // Changed to false to make player optional
//       hasAssist: true
//     },
//     { 
//       name: 'Foul', 
//       color: '#EAB308', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: ['Yellow Card', 'Red Card'],
//       key: 'f',
//       requiresTeam: true,
//       requiresPlayer: true
//     },
//     { 
//       name: 'Offside', 
//       color: '#EC4899', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: [],
//       key: 'o',
//       requiresTeam: true
//     },
//     { 
//       name: 'Aerial Duel', 
//       color: '#06B6D4', 
//       bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
//       actions: [],
//       key: 'd',
//       requiresTeam: true
//     }
//   ];
//   // Format time helper
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };
//   // Toggle fullscreen
//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement && videoContainerRef.current) {
//       videoContainerRef.current.requestFullscreen().catch(err => {
//         console.error(`Error attempting to enable fullscreen: ${err.message}`);
//       });
//     } else {
//       document.exitFullscreen();
//     }
//   };
//   // Handle mouse movement
//   const handleVideoMouseMove = () => {
//     setShowControls(true);
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     controlsTimeoutRef.current = setTimeout(() => {
//       setShowControls(false);
//     }, 3000);
//   };
  
//   useEffect(() => { 
//     // Get video data from blade's div 
//     const el = document.getElementById("football-analyzer");
//      if (el) { 
//       const videoData = JSON.parse(el.dataset.video);
//        if (videoData && videoData.video_url) { 
//         setIsVideoLoading(true);
//         setUploadedVideo(videoData.video_url);
//         setVideoUrl(videoData.video_url); 
//         setShowUploadModal(false);
        
//         const tempVideo = document.createElement('video');
//         tempVideo.src = videoData.video_url;
//         tempVideo.onloadedmetadata = () => {
//           setDuration(Math.floor(tempVideo.duration));
//           setCurrentTime(0);
//           setIsPlaying(false);
//           setIsVideoLoading(false);
//         };
//         tempVideo.onerror = () => {
//           setIsVideoLoading(false);
//         };
//       } 
//     } 
//   }, []);
//   // Handle seeking
//   const seekToTime = (newTime) => {
//     if (videoRef.current && videoUrl) {
//       isSeekingRef.current = true;
//       videoRef.current.currentTime = newTime;
//       setCurrentTime(Math.floor(newTime));
//       setVideoProgress((newTime / duration) * 100);
//       setTimeout(() => {
//         isSeekingRef.current = false;
//       }, 100);
//     } else {
//       setCurrentTime(Math.floor(newTime));
//     }
//   };
//   // Handle volume change
//   const handleVolumeChange = (newVolume) => {
//     setVolume(newVolume);
//     if (videoRef.current) {
//       videoRef.current.volume = newVolume;
//     }
//     if (newVolume === 0) {
//       setIsMuted(true);
//     } else {
//       setIsMuted(false);
//     }
//   };
//   // Toggle mute
//   const toggleMute = () => {
//     if (videoRef.current) {
//       if (isMuted) {
//         videoRef.current.volume = volume;
//         setIsMuted(false);
//       } else {
//         videoRef.current.volume = 0;
//         setIsMuted(true);
//       }
//     }
//   };
//   // Sync video with timeline
//   useEffect(() => {
//     if (videoRef.current && videoUrl && !isSeekingRef.current) {
//       if (videoRef.current.playbackRate !== playbackSpeed) {
//         videoRef.current.playbackRate = playbackSpeed;
//       }
//       videoRef.current.volume = isMuted ? 0 : volume;
      
//       try {
//         if (isPlaying && videoRef.current.paused) {
//           videoRef.current.play()
//             .catch(error => console.error("Video play error:", error));
//         } else if (!isPlaying && !videoRef.current.paused) {
//           videoRef.current.pause();
//         }
//       } catch (error) {
//         console.error("Video control error:", error);
//       }
//     }
//   }, [isPlaying, videoUrl, playbackSpeed, isMuted, volume]);
//   // Handle video time update
//   const handleVideoTimeUpdate = () => {
//     if (videoRef.current && !isSeekingRef.current) {
//       const newTime = videoRef.current.currentTime;
//       setCurrentTime(Math.floor(newTime));
//       setVideoProgress((newTime / duration) * 100);
//     }
//   };
//   // Play/pause functionality
//   useEffect(() => {
//     if (isPlaying && !videoUrl) {
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
//   // Update video progress
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
//       seekToTime(newTime);
//     }
//   };
//   // Handle possession toggle
//   const handlePossessionToggle = () => {
//     if (activePossession) {
//       const endTime = currentTime;
//       const startTime = possessionStartTime;
//       const team = teams.find(t => t.shortName === `Team ${activePossession}`);
      
//       const possessionMarker = {
//         id: Date.now(),
//         time: startTime,
//         endTime: endTime,
//         eventType: 'Possession',
//         team: team.name,
//         player_id: null,
//         jerseyNo: null,
//         playerName: null,
//         action: 'Ball Control',
//         color: team.color,
//         isTimeBased: true,
//         isConfigured: true
//       };
      
//       setAnalysisMarkers(prev => [...prev, possessionMarker]);
//       setActivePossession(null);
//       setPossessionStartTime(null);
//       setActivePossessionTeam(activePossession === 'A' ? 'B' : 'A');
//     } else {
//       setActivePossession(activePossessionTeam);
//       setPossessionStartTime(currentTime);
      
//       const transitionMarker = {
//         id: Date.now() + 1,
//         time: Math.max(0, currentTime - 2),
//         endTime: Math.min(duration, currentTime + 2),
//         eventType: 'Transition',
//         team: `Team ${activePossessionTeam}`,
//         player_id: null,
//         jerseyNo: null,
//         playerName: null,
//         action: 'Transition',
//         color: eventTypes.find(et => et.name === 'Transition').color,
//         isTimeBased: true,
//         isConfigured: true
//       };
      
//       setAnalysisMarkers(prev => [...prev, transitionMarker]);
//     }
//   };
//   // Handle period toggle
//   const handlePeriodToggle = () => {
//     if (activePeriod) {
//       const endTime = currentTime;
//       const startTime = periodStartTime;
      
//       const periodMarker = {
//         id: Date.now(),
//         time: startTime,
//         endTime: endTime,
//         eventType: 'Period',
//         team: 'Match',
//         player_id: null,
//         jerseyNo: null,
//         playerName: null,
//         action: 'Period',
//         color: eventTypes.find(et => et.name === 'Period').color,
//         isTimeBased: true,
//         isConfigured: true
//       };
      
//       setAnalysisMarkers(prev => [...prev, periodMarker]);
//       setActivePeriod(false);
//       setPeriodStartTime(null);
//     } else {
//       setActivePeriod(true);
//       setPeriodStartTime(currentTime);
//     }
//   };
//   // Handle attack 3rd toggle
//   const handleAttack3rdToggle = () => {
//     if (activeAttack3rd) {
//       const endTime = currentTime;
//       const startTime = attack3rdStartTime;
      
//       const attack3rdMarker = {
//         id: Date.now(),
//         time: startTime,
//         endTime: endTime,
//         eventType: 'Attack 3rd',
//         team: 'Match',
//         player_id: null,
//         jerseyNo: null,
//         playerName: null,
//         action: 'Final Third Entry',
//         color: eventTypes.find(et => et.name === 'Attack 3rd').color,
//         isTimeBased: true,
//         isConfigured: false
//       };
      
//       setAnalysisMarkers(prev => [...prev, attack3rdMarker]);
//       setCurrentEvents(prev => [...prev, attack3rdMarker]);
//       setActiveAttack3rd(false);
//       setAttack3rdStartTime(null);
//     } else {
//       setActiveAttack3rd(true);
//       setAttack3rdStartTime(currentTime);
//     }
//   };
//   // Add event to timeline
//   const addEventToTimeline = (eventTypeName) => {
//     if (eventTypeName === 'Possession') {
//       handlePossessionToggle();
//       return;
//     }
//     if (eventTypeName === 'Period') {
//       handlePeriodToggle();
//       return;
//     }
//     if (eventTypeName === 'Attack 3rd') {
//       handleAttack3rdToggle();
//       return;
//     }
    
//     const eventConfig = eventTypes.find(et => et.name === eventTypeName);
//     const startTime = Math.max(0, currentTime - 4);
//     const endTime = Math.min(duration, currentTime + 7);
//     const newMarker = {
//       id: Date.now(),
//       time: startTime,
//       endTime: endTime,
//       eventType: eventTypeName,
//       team: null,
//       player_id: null,
//       jerseyNo: null,
//       playerName: null,
//       action: null,
//       assist_player_id: null,
//       assistJerseyNo: null,
//       assistPlayerName: null,
//       color: eventConfig.color,
//       isTimeBased: true,
//       isConfigured: false
//     };
//     setAnalysisMarkers(prev => [...prev, newMarker]);
//     setCurrentEvents(prev => [...prev, newMarker]);
//   };
//   // Handle event bar click
//   const handleEventBarClick = (marker, e) => {
//     e.stopPropagation();
//     if (!marker.isConfigured) {
//       setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
//       setSelectedEventForConfig(marker);
//       setEventConfigData({
//         selectedTeam: null,
//         selectedPlayer: null,
//         selectedAction: null,
//         selectedAssistPlayer: null
//       });
//     }
//   };
//   // Handle current event select
//   const handleCurrentEventSelect = (marker) => {
//     setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
//     setSelectedEventForConfig(marker);
//     setEventConfigData({
//       selectedTeam: null,
//       selectedPlayer: null,
//       selectedAction: null,
//       selectedAssistPlayer: null
//     });
//     setShowCurrentEventsDropdown(false);
//   };
//   // Edit event
//   const handleEditEvent = (marker) => {
//     setEditingMarkerId(marker.id);
//     setSelectedEventForConfig(marker);
//     const team = teams.find(t => t.name === marker.team);
//     const player = team?.players.find(p => p.id === marker.player_id);
//     const assistPlayer = team?.players.find(p => p.id === marker.assist_player_id);
//     setEventConfigData({
//       selectedTeam: team,
//       selectedPlayer: player,
//       selectedAction: marker.action,
//       selectedAssistPlayer: assistPlayer
//     });
//   };
//   // Save configured event
//   const saveConfiguredEvent = () => {
//     if (!selectedEventForConfig) return;
    
//     const eventConfig = eventTypes.find(et => et.name === selectedEventForConfig.eventType);
    
//     if (eventConfig.requiresTeam && !eventConfigData.selectedTeam) {
//       alert('Please select a team');
//       return;
//     }
//     // Only require player for events that require it and are not Shot events
//     if (eventConfig.requiresPlayer && !eventConfigData.selectedPlayer && selectedEventForConfig.eventType !== 'Shot') {
//       alert('Please select a player for this event');
//       return;
//     }
//     setAnalysisMarkers(prev => 
//       prev.map(marker => 
//         marker.id === selectedEventForConfig.id 
//           ? {
//               ...marker,
//               team: eventConfig.requiresTeam ? eventConfigData.selectedTeam.name : 'Match',
//               player_id: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.id : null,
//               jerseyNo: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.jerseyNo : null,
//               playerName: eventConfigData.selectedPlayer ? eventConfigData.selectedPlayer.name : null,
//               action: eventConfigData.selectedAction || (eventConfig.actions.length > 0 ? eventConfig.actions[0] : selectedEventForConfig.eventType),
//               assist_player_id: eventConfigData.selectedAssistPlayer ? eventConfigData.selectedAssistPlayer.id : null,
//               assistJerseyNo: eventConfigData.selectedAssistPlayer ? eventConfigData.selectedAssistPlayer.jerseyNo : null,
//               assistPlayerName: eventConfigData.selectedAssistPlayer ? eventConfigData.selectedAssistPlayer.name : null,
//               isConfigured: true
//             }
//           : marker
//       )
//     );
//     setSelectedEventForConfig(null);
//     setEventConfigData({});
//     setEditingMarkerId(null);
//   };
//   // Cancel event config
//   const cancelEventConfig = () => {
//     if (!editingMarkerId && selectedEventForConfig) {
//       setCurrentEvents(prev => [...prev, selectedEventForConfig]);
//     }
//     setSelectedEventForConfig(null);
//     setEventConfigData({});
//     setEditingMarkerId(null);
//   };
//   // Remove marker
//   const removeMarker = (markerId) => {
//     setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
//     setCurrentEvents(prev => prev.filter(event => event.id !== markerId));
//     if (selectedEventForConfig && selectedEventForConfig.id === markerId) {
//       setSelectedEventForConfig(null);
//       setEventConfigData({});
//     }
//   };
//   // Keyboard event handler
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
//         return;
//       }
//       const key = e.key.toLowerCase();
      
//       // Handle space bar for play/pause
//       if (key === ' ') {
//         e.preventDefault();
//         setIsPlaying(prev => !prev);
//         return;
//       }
      
//       const eventType = eventTypes.find(et => et.key === key);
      
//       if (eventType) {
//         e.preventDefault();
//         addEventToTimeline(eventType.name);
//       }
//     };
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [currentTime, duration, activePossession, activePeriod, activeAttack3rd, possessionStartTime, periodStartTime, attack3rdStartTime, activePossessionTeam]);
//   // Generate timeline grid
//   const generateTimelineGrid = () => {
//     const elements = [];
//     for (let i = 60; i <= duration; i += 60) {
//       const leftPosition = (i / duration) * 100;
//       elements.push(
//         <div
//           key={`minute-line-${i}`}
//           className="absolute top-0 bottom-0 border-l border-gray-300"
//           style={{ left: `${leftPosition}%` }}
//         />
//       );
//     }
//     return elements;
//   };
//   // Auto-scroll timeline when current time indicator is near edges
//   useEffect(() => {
//     if (!timelineContainerRef.current || !timelineRef.current) return;
    
//     const container = timelineContainerRef.current;
//     const timeline = timelineRef.current;
//     const indicatorPosition = (currentTime / duration) * timeline.offsetWidth;
//     const containerWidth = container.offsetWidth;
//     const scrollLeft = container.scrollLeft;
    
//     // Check if indicator is near the edges (within 20% of container width)
//     const leftThreshold = scrollLeft + containerWidth * 0.2;
//     const rightThreshold = scrollLeft + containerWidth * 0.8;
    
//     if (indicatorPosition < leftThreshold || indicatorPosition > rightThreshold) {
//       // Scroll to center the indicator
//       const newScrollLeft = Math.max(0, indicatorPosition - containerWidth / 2);
//       container.scrollTo({
//         left: newScrollLeft,
//         behavior: 'smooth'
//       });
//     }
//   }, [currentTime, duration]);
//   // Load stats data
//   const loadStatsData = async () => {
//     if (!analysisId) return;
    
//     setIsLoadingStats(true);
//     try {
//       const response = await fetch(`/api/analysis/${analysisId}/stats`, {
//         headers: {
//           'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setStatsData(data);
//         setShowStatsModal(true);
//       } else {
//         throw new Error('Failed to load stats');
//       }
//     } catch (error) {
//       console.error('Error loading stats:', error);
//       alert('Error loading statistics. Please try again.');
//     } finally {
//       setIsLoadingStats(false);
//     }
//   };
//   // Save analysis data
//   const saveAllAnalysis = async () => {
//     setIsSaving(true);
//     try {
//       const analysisData = {
//         video_id: videoData?.id || null,
//         match_id: matchId,
//         markers: analysisMarkers.filter(marker => marker.isConfigured),
//         created_at: new Date().toISOString()
//       };
      
//       const response = await fetch('/api/save-analysis', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
//         },
//         body: JSON.stringify(analysisData)
//       });
      
//       if (response.ok) {
//         const result = await response.json();
//         setAnalysisId(result.analysis_id);
//         alert('Analysis saved successfully!');
//       } else {
//         throw new Error('Failed to save analysis');
//       }
//     } catch (error) {
//       console.error('Error saving analysis:', error);
//       alert('Error saving analysis. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };
//   // Cleanup
//   useEffect(() => {
//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);
//   // Get sorted markers
//   const getSortedMarkers = () => {
//     return [...analysisMarkers]
//       .filter(marker => marker.isConfigured)
//       .sort((a, b) => b.time - a.time);
//   };
//   // Stats Modal Component
//   const StatsModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-90vh overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-2xl font-bold text-gray-800">Match Statistics</h3>
//           <button
//             onClick={() => setShowStatsModal(false)}
//             className="text-gray-500 hover:text-gray-700 p-2"
//           >
//             <X size={24} />
//           </button>
//         </div>
        
//         {isLoadingStats ? (
//           <div className="flex justify-center items-center h-40">
//             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//           </div>
//         ) : statsData ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Team Statistics */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h4 className="text-lg font-semibold mb-4">Team Statistics</h4>
//               <div className="grid grid-cols-2 gap-4">
//                 {statsData.teams && Object.entries(statsData.teams).map(([teamName, stats]) => (
//                   <div key={teamName} className="bg-white p-4 rounded shadow">
//                     <h5 className="font-bold mb-3">{teamName}</h5>
//                     <div className="space-y-2 text-sm">
//                       <div>Possession: {stats.possession}%</div>
//                       <div>Shots: {stats.shots}</div>
//                       <div>Goals: {stats.goals}</div>
//                       <div>Fouls: {stats.fouls}</div>
//                       <div>Corners: {stats.corners}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             {/* Player Statistics */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h4 className="text-lg font-semibold mb-4">Player Statistics</h4>
//               <div className="space-y-3">
//                 {statsData.players && statsData.players.map((player, index) => (
//                   <div key={index} className="bg-white p-3 rounded shadow">
//                     <h6 className="font-semibold">#{player.jerseyNo} {player.name}</h6>
//                     <div className="text-sm text-gray-600">
//                       Goals: {player.goals} | Assists: {player.assists} | Fouls: {player.fouls}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             {/* Event Timeline */}
//             <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
//               <h4 className="text-lg font-semibold mb-4">Event Timeline</h4>
//               <div className="space-y-2 max-h-60 overflow-y-auto">
//                 {statsData.timeline && statsData.timeline.map((event, index) => (
//                   <div key={index} className="bg-white p-3 rounded shadow flex items-center">
//                     <div 
//                       className="w-4 h-4 rounded-sm mr-3"
//                       style={{ backgroundColor: event.color }}
//                     />
//                     <div className="flex-1">
//                       <div className="font-medium">{event.eventType}</div>
//                       <div className="text-sm text-gray-600">
//                         {event.team} • {formatTime(event.time)}
//                         {event.playerName && ` • #${event.jerseyNo} ${event.playerName}`}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="text-center text-gray-500 py-8">
//             No statistics available
//           </div>
//         )}
//       </div>
//     </div>
//   );
//   return (
//     <div className="w-full max-w-full mx-auto bg-gray-100 min-h-screen">
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
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="video/*"
//               onChange={handleVideoUpload}
//               className="w-full p-2 border border-gray-300 rounded mb-4"
//             />
//             <button
//               onClick={() => setShowUploadModal(false)}
//               className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//       {/* Stats Modal */}
//       {showStatsModal && <StatsModal />}
//       {/* Video Section */}
//       <div className="bg-white shadow-sm">
//         <div 
//           ref={videoContainerRef}
//           className="relative bg-black" 
//           onMouseMove={handleVideoMouseMove}
//           onMouseLeave={() => setShowControls(false)}
//         >
//           {videoUrl ? (
//             <>
//               <video
//                 ref={videoRef}
//                 src={videoUrl}
//                 className="w-full h-88 object-contain bg-black"
//                 style={{
//                   height: document.fullscreenElement ? '100vh' : '352px'
//                 }}
//                 onTimeUpdate={handleVideoTimeUpdate}
//                 onLoadedMetadata={() => {
//                   if (videoRef.current) {
//                     setDuration(Math.floor(videoRef.current.duration));
//                     setCurrentTime(videoRef.current.currentTime);
//                     setIsVideoLoading(false);
//                     videoRef.current.volume = volume;
//                   }
//                 }}
//                 onLoadStart={() => setIsVideoLoading(true)}
//                 onCanPlay={() => setIsVideoLoading(false)}
//                 playsInline
//                 preload="auto"
//               />
              
//               {/* Video Timeline */}
//               <div className="absolute bottom-4 left-0 right-0 px-4">
//                 <div 
//                   className="h-1 bg-gray-600 bg-opacity-50 rounded-full cursor-pointer relative"
//                   onClick={(e) => {
//                     const rect = e.currentTarget.getBoundingClientRect();
//                     const clickX = e.clientX - rect.left;
//                     const percentage = clickX / rect.width;
//                     const newTime = percentage * duration;
//                     seekToTime(newTime);
//                   }}
//                 >
//                   <div 
//                     className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
//                     style={{ width: `${videoProgress}%` }}
//                   />
//                   <div 
//                     className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
//                     style={{ left: `${videoProgress}%` }}
//                   />
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="h-88 bg-gradient-to-br from-blue-900 to-green-900 flex items-center justify-center">
//               <button
//                 onClick={() => setShowUploadModal(true)}
//                 className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-lg"
//               >
//                 <Upload size={24} />
//                 Upload Match Video
//               </button>
//             </div>
//           )}
          
//           {/* Video overlay info */}
//           <div className="absolute top-4 left-4 text-white bg-black bg-opacity-75 px-4 py-2 rounded-lg">
//             {videoTitle && (
//               <div className="text-sm font-semibold mb-1">{videoTitle}</div>
//             )}
//             <div className="text-lg font-semibold">{formatTime(currentTime)} / {formatTime(duration)}</div>
//             {activePossession && (
//               <div className="text-sm mt-1">
//                 <span className={`px-2 py-1 rounded text-xs ${activePossession === 'A' ? 'bg-red-600' : 'bg-green-600'}`}>
//                   Team {activePossession} Possession Active
//                 </span>
//               </div>
//             )}
//             {activePeriod && (
//               <div className="text-sm mt-1">
//                 <span className="px-2 py-1 rounded text-xs bg-gray-600">
//                   Period Active
//                 </span>
//               </div>
//             )}
//             {activeAttack3rd && (
//               <div className="text-sm mt-1">
//                 <span className="px-2 py-1 rounded text-xs bg-orange-600">
//                   Attack 3rd Active
//                 </span>
//               </div>
//             )}
//           </div>
          
//           {/* Fullscreen button */}
//           <button
//             onClick={toggleFullscreen}
//             className="absolute bottom-10 right-4 p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-all"
//           >
//             <Maximize size={20} />
//           </button>
          
//           {/* Save button overlay */}
//           <div className="absolute top-4 right-4">
//             {/* Stat buttons */}
//             <div className="flex flex-row mb-4">
//               <button
//                 onClick={loadStatsData}
//                 disabled={!analysisId || isLoadingStats}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 title="View Statistics"
//               >
//                 <BarChart3 size={18} />
//               </button>
//               <button
//                 onClick={() => window.open(`/analysis/${analysisId}/report`, '_blank')}
//                 disabled={!analysisId}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 title="View Detailed Report"
//               >
//                 <ClipboardList size={18} />
//               </button>
//               <button
//                 onClick={() => window.open(`/analysis/${analysisId}/export`, '_blank')}
//                 disabled={!analysisId}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 title="Export Data"
//               >
//                 <ExternalLink size={18} />
//               </button>
//             </div>
//             <div className="flex flex-row-reverse">
//               <button
//                 onClick={saveAllAnalysis}
//                 disabled={isSaving || analysisMarkers.length === 0}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Save size={18} />
//                 {isSaving ? 'Saving...' : 'Save'}
//               </button>
//             </div>
//           </div>
//           {/* Overlay Video Controls */}
//           {videoUrl && (
//             <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
//               showControls ? 'opacity-100' : 'opacity-0'
//             }`}>
//               <div className="flex items-center gap-4 bg-black bg-opacity-75 px-3.5 py-2 rounded-full">
//                 <button
//                   onClick={() => {
//                     const newTime = Math.max(0, currentTime - 10);
//                     seekToTime(newTime);
//                   }}
//                   className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
//                   title="Rewind 10 seconds"
//                 >
//                   <Rewind size={18} />
//                 </button>
//                 <button
//                   onClick={() => setIsPlaying(!isPlaying)}
//                   className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
//                   title={isPlaying ? "Pause" : "Play"}
//                 >
//                   {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//                 </button>
//                 <button
//                   onClick={() => {
//                     const newTime = Math.min(duration, currentTime + 10);
//                     seekToTime(newTime);
//                   }}
//                   className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
//                   title="Forward 10 seconds"
//                 >
//                   <FastForward size={18} />
//                 </button>
                
//                 {/* Volume Control */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={toggleMute}
//                     className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
//                     title={isMuted ? "Unmute" : "Mute"}
//                   >
//                     {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
//                   </button>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1"
//                     step="0.1"
//                     value={isMuted ? 0 : volume}
//                     onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
//                     className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
//                     style={{
//                       background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(isMuted ? 0 : volume) * 100}%, #6B7280 ${(isMuted ? 0 : volume) * 100}%, #6B7280 100%)`
//                     }}
//                     title="Volume control"
//                   />
//                 </div>
                
//                 {/* Speed Control Dropdown */}
//                 <div className="relative group">
//                   <button className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium" title="Playback speed">
//                     {playbackSpeed}x
//                   </button>
//                   <div className="absolute bottom-full mb-0.5 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
//                     <div className="bg-gray-800 rounded-md shadow-lg overflow-hidden">
//                       <button
//                         onClick={() => setPlaybackSpeed(0.5)}
//                         className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 0.5 ? 'bg-blue-600' : ''}`}
//                       >
//                         0.5x
//                       </button>
//                       <button
//                         onClick={() => setPlaybackSpeed(1)}
//                         className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 1 ? 'bg-blue-600' : ''}`}
//                       >
//                         1x
//                       </button>
//                       <button
//                         onClick={() => setPlaybackSpeed(2)}
//                         className={`block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 ${playbackSpeed === 2 ? 'bg-blue-600' : ''}`}
//                       >
//                         2x
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
        
//         {/* Video Loading Indicator */}
//         {isVideoLoading && (
//           <div className="bg-gray-100 py-3">
//             <div className="flex items-center justify-center gap-2">
//               <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//               <span className="text-sm text-gray-600">Loading video...</span>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* Main Content - Three Column Layout */}
//       <div className="flex h-auto bg-gray-100">
//         {/* Column 1: Timeline */}
//         <div className="w-1/2 bg-white border-r border-gray-300">
//           <div className="p-2 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
//           </div>
          
//           <div className="p-4">
//             {/* Event Types Labels Column */}
//             <div className="flex">
//               <div className="w-24 mr-4">
//                 <div className="text-sm font-medium text-gray-600 mb-1 h-12 flex items-center">Timeline</div>
//                 {eventTypes.map((eventType, index) => (
//                   <div
//                     key={eventType.name}
//                     className="text-xs font-medium text-gray-700 flex items-center border-b border-gray-200 px-1"
//                     style={{ height: '24px' }}
//                   >
//                     <div 
//                       className="w-3 h-3 rounded-sm mr-2"
//                       style={{ backgroundColor: eventType.color }}
//                     />
//                     {eventType.name}
//                   </div>
//                 ))}
//               </div>
//               {/* Timeline Area with Horizontal Scroll */}
//               <div 
//                 ref={timelineContainerRef}
//                 className="flex-1 overflow-x-auto"
//               >
//                 <div
//                   ref={timelineRef}
//                   className="relative bg-gray-50 border border-gray-200 cursor-crosshair"
//                   style={{ 
//                     height: `${48 + (eventTypes.length * 26)}px`,
//                     width: `${Math.max(800, duration * 2)}px`
//                   }}
//                 >
//                   {/* Minute-based column lines */}
//                   {generateTimelineGrid()}
//                   {/* Horizontal Scrollable Timeline Header */}
//                   <div className="h-8 bg-gradient-to-r from-gray-500 to-gray-600 relative">
//                     {/* Second markers */}
//                     {Array.from({ length: duration + 1 }, (_, i) => {
//                       const leftPosition = (i / duration) * 100;
//                       const isSecondMark = i % 1 === 0;
//                       const isTenSecMark = i % 10 === 0;
//                       const isMinuteMark = i % 60 === 0;
                      
//                       return (
//                         <div
//                           key={`timeline-marker-${i}`}
//                           className="absolute top-0 bottom-0 flex flex-col justify-between"
//                           style={{ left: `${leftPosition}%` }}
//                         >
//                           {/* Time labels */}
//                           {isMinuteMark && (
//                             <div className="text-xs text-white font-medium px-1 bg-black bg-opacity-30 rounded">
//                               {formatTime(i)}
//                             </div>
//                           )}
                          
//                           {/* Tick marks */}
//                           <div className="flex-1 flex flex-col justify-end">
//                             <div 
//                               className={`border-l ${
//                                 isMinuteMark 
//                                   ? 'border-white border-l-2 h-6' 
//                                   : isTenSecMark 
//                                   ? 'border-gray-200 h-4' 
//                                   : 'border-gray-300 h-2'
//                               }`}
//                             />
//                           </div>
//                         </div>
//                       );
//                     })}
                    
//                     {/* Current time indicator */}
//                     <div
//                       className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-30 transition-all duration-100"
//                       style={{ left: `${(currentTime / duration) * 100}%` }}
//                     >
//                       <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
//                         <div className="w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-lg"></div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Progress bar (blue) */}
//                   <div
//                     className="absolute top-8 h-62 bg-blue-500 opacity-30 transition-all duration-100"
//                     style={{ width: `${videoProgress}%` }}
//                   />
                  
//                   {/* Current time indicator (red line) for event area */}
//                   <div
//                     className="absolute top-12 bottom-0 w-1 bg-red-500 z-20 transition-all duration-100"
//                     style={{ left: `${videoProgress}%` }}
//                   />
                  
//                   {/* Active possession bar */}
//                   {activePossession && possessionStartTime !== null && (
//                     <div
//                       className="absolute z-15 opacity-60"
//                       style={{
//                         left: `${(possessionStartTime / duration) * 100}%`,
//                         width: `${((currentTime - possessionStartTime) / duration) * 100}%`,
//                         top: `${48 + (eventTypes.findIndex(et => et.name === 'Possession') * 24) + 4}px`,
//                         height: '16px',
//                         backgroundColor: activePossession === 'A' ? '#EF4444' : '#10B981'
//                       }}
//                     /> 
//                   )}
//                   {/* Active period bar */}
//                   {activePeriod && periodStartTime !== null && (
//                     <div
//                       className="absolute z-15 opacity-60"
//                       style={{
//                         left: `${(periodStartTime / duration) * 100}%`,
//                         width: `${((currentTime - periodStartTime) / duration) * 100}%`,
//                         top: `${48 + (eventTypes.findIndex(et => et.name === 'Period') * 24) + 4}px`,
//                         height: '16px',
//                         backgroundColor: '#6B7280'
//                       }}
//                     />
//                   )}
//                   {/* Active attack 3rd bar */}
//                   {activeAttack3rd && attack3rdStartTime !== null && (
//                     <div
//                       className="absolute z-15 opacity-60"
//                       style={{
//                         left: `${(attack3rdStartTime / duration) * 100}%`,
//                         width: `${((currentTime - attack3rdStartTime) / duration) * 100}%`,
//                         top: `${48 + (eventTypes.findIndex(et => et.name === 'Attack 3rd') * 24) + 4}px`,
//                         height: '16px',
//                         backgroundColor: '#F97316'
//                       }}
//                     />
//                   )}
                  
//                   {/* Time-based event bars */}
//                   {analysisMarkers.filter(marker => marker.isTimeBased && marker.endTime).map(marker => {
//                     const eventTypeIndex = eventTypes.findIndex(et => et.name === marker.eventType);
//                     const leftPosition = (marker.time / duration) * 100;
//                     const width = ((marker.endTime - marker.time) / duration) * 100;
//                     const topOffset = 48 + (eventTypeIndex * 24) + 4;
                    
//                     return (
//                       <div
//                         key={`bar-${marker.id}`}
//                         className={`absolute group cursor-pointer ${
//                           !marker.isConfigured ? 'opacity-40 border-2 border-dashed border-yellow-400' : 'opacity-60'
//                         }`}
//                         style={{
//                           left: `${leftPosition}%`,
//                           width: `${width}%`,
//                           top: `${topOffset}px`,
//                           height: '16px',
//                           backgroundColor: marker.color
//                         }}
//                         title={marker.isConfigured 
//                           ? `${marker.eventType} - ${marker.team} from ${formatTime(marker.time)} to ${formatTime(marker.endTime)}${marker.action ? ` (${marker.action})` : ''}`
//                           : `Click to configure ${marker.eventType} event`
//                         }
//                         onClick={(e) => handleEventBarClick(marker, e)}
//                       >
//                         {/* Configuration indicator for unconfigured events */}
//                         {!marker.isConfigured && (
//                           <div className="absolute inset-0 flex items-center justify-center">
//                             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
//                           </div>
//                         )}
                        
//                         {/* Delete button for events */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeMarker(marker.id);
//                           }}
//                           className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-30"
//                           style={{ fontSize: '10px' }}
//                         >
//                           ×
//                         </button>
//                       </div>
//                     );
//                   })}
//                   {/* Click handler overlay */}
//                   <div 
//                     className="absolute inset-0 cursor-pointer"
//                     onClick={handleTimelineClick}
//                   />
//                 </div>
//               </div>
//             </div>
//             {/* Unconfigured Events Section */}
//             {analysisMarkers.filter(marker => !marker.isConfigured).length > 0 && (
//               <div className="bg-yellow-50 border-t-2 border-b-2 border-yellow-200 p-4 mt-2">
//                 <h4 className="text-sm font-semibold text-yellow-800 mb-2">
//                   Unconfigured Events (Click to configure):
//                 </h4>
//                 <div className="flex flex-wrap gap-2">
//                   {analysisMarkers.filter(marker => !marker.isConfigured).map(marker => (
//                     <div 
//                       key={marker.id} 
//                       className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-yellow-300 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
//                       onClick={() => {
//                         setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
//                         setSelectedEventForConfig(marker);
//                         setEventConfigData({
//                           selectedTeam: null,
//                           selectedPlayer: null,
//                           selectedAction: null,
//                           selectedAssistPlayer: null
//                         });
//                       }}
//                     >
//                       <div
//                         className="w-3 h-3 rounded-sm"
//                         style={{ backgroundColor: marker.color }}
//                       />
//                       <span className="text-sm font-medium">{marker.eventType}</span>
//                       <span className="text-xs text-gray-500">
//                         {formatTime(marker.time)} - {formatTime(marker.endTime)}
//                       </span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removeMarker(marker.id);
//                         }}
//                         className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                         style={{ fontSize: '10px' }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//           </div>
//         </div>
//         {/* Column 2: Event Types and Action List */}
//         <div className="w-1/4 bg-gray-50 border-r border-gray-300 overflow-y-auto">
//           <div className="p-2 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800">Event Types</h3>
//           </div>
          
//           <div className="p-4">
//             <div className="grid grid-cols-3 gap-2 mb-6">
//               {eventTypes.map(eventType => (
//                 <button
//                   key={eventType.name}
//                   onClick={() => addEventToTimeline(eventType.name)}
//                   className={`p-2 rounded-md text-white text-xs font-medium transition-all hover:opacity-90 hover:scale-105 ${
//                     (eventType.name === 'Possession' && activePossession) ||
//                     (eventType.name === 'Period' && activePeriod) ||
//                     (eventType.name === 'Attack 3rd' && activeAttack3rd)
//                       ? 'bg-blue-600' 
//                       : 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]'
//                   }`}
//                   style={{ minHeight: '40px' }}
//                   title={`Press ${eventType.key.toUpperCase()} or click to add ${eventType.name}`}
//                 >
//                   <div className="flex flex-col items-center justify-center h-full">
//                     <span className="text-center leading-tight">
//                       {eventType.name}
//                       <span className="block text-xs opacity-75">({eventType.key.toUpperCase()})</span>
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//             {/* Action List */}
//             <div className="border-t border-gray-200 pt-4">
//               <h4 className="font-semibold text-gray-800 mb-3">Action List ({analysisMarkers.filter(m => m.isConfigured).length})</h4>
//               <div className="space-y-2 h-auto overflow-y-auto">
//                 {getSortedMarkers().map(marker => (
//                   <div key={marker.id} className="p-2 bg-white rounded-lg border shadow-sm">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div
//                           className="w-3 h-3 rounded-sm"
//                           style={{ backgroundColor: marker.color }}
//                         />
//                         <span className="text-sm font-medium">{marker.eventType}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <span className="text-xs text-gray-500">
//                           {marker.isTimeBased && marker.endTime 
//                             ? `${formatTime(marker.time)} - ${formatTime(marker.endTime)}` 
//                             : formatTime(marker.time)
//                           }
//                         </span>
//                         <button
//                           onClick={() => handleEditEvent(marker)}
//                           className="w-5 h-5 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
//                           title="Edit event"
//                         >
//                           <Edit2 size={12} />
//                         </button>
//                         <button
//                           onClick={() => removeMarker(marker.id)}
//                           className="w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
//                           title="Delete event"
//                         >
//                           <X size={12} />
//                         </button>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-600 mt-1">
//                       {marker.team}
//                       {marker.playerName && ` • #${marker.jerseyNo} ${marker.playerName}`}
//                       {marker.action && ` • ${marker.action}`}
//                       {marker.assistPlayerName && ` • Assist: #${marker.assistJerseyNo} ${marker.assistPlayerName}`}
//                     </div>
//                   </div>
//                 ))}
                
//                 {analysisMarkers.filter(m => m.isConfigured).length === 0 && (
//                   <div className="text-sm text-gray-500 italic text-center py-4">
//                     No configured events yet
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Column 3: Event Configuration */}
//         <div className="w-1/4 bg-white">
//           <div className="p-2 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
//           </div>
          
//           <div className="overflow-y-auto">
//             {/* Current Events Dropdown */}
//             {currentEvents.length > 0 && (
//               <div className="bg-blue-50 border-t-2 border-b-2 border-blue-200 p-4 mt-2">
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="text-sm font-semibold text-blue-800">
//                     Current Events ({currentEvents.length})
//                   </h4>
//                   <button
//                     onClick={() => setShowCurrentEventsDropdown(!showCurrentEventsDropdown)}
//                     className="p-1 text-blue-600 hover:bg-blue-100 rounded"
//                   >
//                     {showCurrentEventsDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                   </button>
//                 </div>
                
//                 {showCurrentEventsDropdown && (
//                   <div className="space-y-2 max-h-40 overflow-y-auto">
//                     {currentEvents.map(event => (
//                       <div 
//                         key={event.id}
//                         className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
//                         onClick={() => handleCurrentEventSelect(event)}
//                       >
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-3 h-3 rounded-sm"
//                             style={{ backgroundColor: event.color }}
//                           />
//                           <span className="text-sm font-medium">{event.eventType}</span>
//                           <span className="text-xs text-gray-500">
//                             {formatTime(event.time)} - {formatTime(event.endTime)}
//                           </span>
//                         </div>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeMarker(event.id);
//                           }}
//                           className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                           style={{ fontSize: '10px' }}
//                         >
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//             {selectedEventForConfig ? (
//               // Event Configuration Panel
//               <div className="p-4">
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                   <h4 className="font-semibold text-blue-800 mb-2">
//                     {editingMarkerId ? 'Edit' : 'Configure'} {selectedEventForConfig.eventType}
//                   </h4>
//                   <div className="text-sm text-blue-600">
//                     Time: {formatTime(selectedEventForConfig.time)} - {formatTime(selectedEventForConfig.endTime)}
//                   </div>
//                 </div>
//                 {/* Action Selection for Period events */}
//                 {(selectedEventForConfig.eventType === 'Period') && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Select Period Type:</div>
//                     <div className="grid grid-cols-2 gap-1">
//                       {eventTypes.find(et => et.name === 'Period').actions.map(action => (
//                         <button
//                           key={action}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedAction: action }))}
//                           className={`px-2 py-2 text-xs rounded transition-colors ${
//                             eventConfigData.selectedAction === action
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           {action}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {/* Team Selection - Only show for events that require team */}
//                 {eventTypes.find(et => et.name === selectedEventForConfig.eventType)?.requiresTeam && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Select Team:</div>
//                     <div className="flex gap-2">
//                       {teams.map(team => (
//                         <button
//                           key={team.name}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedTeam: team, selectedPlayer: null, selectedAssistPlayer: null }))}
//                           className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
//                             eventConfigData.selectedTeam?.name === team.name
//                               ? 'bg-blue-600 text-white'
//                               : team.shortName === 'Team A' 
//                               ? 'bg-red-600 text-white hover:bg-red-700'
//                               : 'bg-green-600 text-white hover:bg-green-700'
//                           }`}
//                         >
//                           {team.name}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {/* Action Selection for Shot events */}
//                 {(selectedEventForConfig.eventType === 'Shot' && eventConfigData.selectedTeam) && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Result:</div>
//                     <div className="grid grid-cols-2 gap-1">
//                       {['Goal', 'Save', 'Wide', 'Blocked'].map(action => (
//                         <button
//                           key={action}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedAction: action }))}
//                           className={`px-2 py-2 text-xs rounded transition-colors ${
//                             eventConfigData.selectedAction === action
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           {action}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {/* Action Selection for other events that have actions */}
//                 {(eventConfigData.selectedTeam && selectedEventForConfig.eventType !== 'Shot' && selectedEventForConfig.eventType !== 'Period' && eventTypes.find(et => et.name === selectedEventForConfig.eventType).actions.length > 0) && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Select Action:</div>
//                     <div className="grid grid-cols-2 gap-1">
//                       {eventTypes.find(et => et.name === selectedEventForConfig.eventType).actions.map(action => (
//                         <button
//                           key={action}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedAction: action }))}
//                           className={`px-2 py-2 text-xs rounded transition-colors ${
//                             eventConfigData.selectedAction === action
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           {action}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {/* Player Selection for events that require player */}
//                 {(eventTypes.find(et => et.name === selectedEventForConfig.eventType)?.requiresPlayer && eventConfigData.selectedTeam) && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">
//                       Select Player {selectedEventForConfig.eventType === 'Shot' ? '(Optional)' : ''}:
//                     </div>
//                     <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
//                       {/* Add "None" option for Shot events */}
//                       {selectedEventForConfig.eventType === 'Shot' && (
//                         <button
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedPlayer: null }))}
//                           className={`p-2 rounded text-xs font-medium transition-colors ${
//                             !eventConfigData.selectedPlayer
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           None
//                         </button>
//                       )}
//                       {eventConfigData.selectedTeam.players.map(player => (
//                         <button
//                           key={player.id}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedPlayer: player }))}
//                           className={`p-2 rounded text-xs font-medium transition-colors ${
//                             eventConfigData.selectedPlayer?.id === player.id
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           #{player.jerseyNo}
//                         </button>
//                       ))}
//                     </div>
//                     {eventConfigData.selectedPlayer && (
//                       <div className="text-xs mt-2 bg-blue-50 rounded px-2 py-1">
//                         Selected: #{eventConfigData.selectedPlayer.jerseyNo} - {eventConfigData.selectedPlayer.name}
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 {/* Assist Player Selection for Shot events */}
//                 {(selectedEventForConfig.eventType === 'Shot' && eventConfigData.selectedTeam && eventConfigData.selectedAction === 'Goal') && (
//                   <div className="mb-4">
//                     <div className="text-sm font-medium text-gray-700 mb-2">Select Assist (Optional):</div>
//                     <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
//                       <button
//                         onClick={() => setEventConfigData(prev => ({ ...prev, selectedAssistPlayer: null }))}
//                         className={`p-2 rounded text-xs font-medium transition-colors ${
//                           !eventConfigData.selectedAssistPlayer
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                         }`}
//                       >
//                         None
//                       </button>
//                       {eventConfigData.selectedTeam.players.map(player => (
//                         <button
//                           key={player.id}
//                           onClick={() => setEventConfigData(prev => ({ ...prev, selectedAssistPlayer: player }))}
//                           className={`p-2 rounded text-xs font-medium transition-colors ${
//                             eventConfigData.selectedAssistPlayer?.id === player.id
//                               ? 'bg-blue-600 text-white'
//                               : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                           }`}
//                         >
//                           #{player.jerseyNo}
//                         </button>
//                       ))}
//                     </div>
//                     {eventConfigData.selectedAssistPlayer && (
//                       <div className="text-xs mt-2 bg-blue-50 rounded px-2 py-1">
//                         Assist: #{eventConfigData.selectedAssistPlayer.jerseyNo} - {eventConfigData.selectedAssistPlayer.name}
//                       </div>
//                     )}
//                   </div>
//                 )}
                
//                 {/* Save and Cancel buttons */}
//                 <div className="flex gap-2">
//                   <button
//                     onClick={saveConfiguredEvent}
//                     disabled={
//                       (eventTypes.find(et => et.name === selectedEventForConfig.eventType)?.requiresTeam && !eventConfigData.selectedTeam) ||
//                       (eventTypes.find(et => et.name === selectedEventForConfig.eventType)?.requiresPlayer && !eventConfigData.selectedPlayer && selectedEventForConfig.eventType !== 'Shot')
//                     }
//                     className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {editingMarkerId ? 'Update Event' : 'Save Event'}
//                   </button>
//                   <button
//                     onClick={cancelEventConfig}
//                     className="flex-1 px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               // Instructions when no event is selected
//               <div className="p-8 text-center text-gray-500">
//                 <div className="text-lg mb-4">Event Details</div>
//                 <div className="text-sm mb-4">
//                   1. Click an event type button or use keyboard shortcuts to add events to timeline
//                   <br />
//                   2. Click on unconfigured event bars (yellow dashed) to configure them
//                   <br />
//                   3. Select team and player (for applicable events)
//                   <br />
//                   4. Save to add to action list
//                 </div>
//                 <div className="text-sm text-blue-600 bg-blue-50 rounded p-3">
//                   <strong>Keyboard Shortcuts:</strong>
//                   <br />I: Period | P: Possession | T: Set Play
//                   <br />A: Attack 3rd | S: Shot | F: Foul | O: Offside
//                   <br />R: Transition | D: Aerial Duel | Space: Play/Pause
//                 </div>
//                 <div className="text-sm text-green-600 bg-green-50 rounded p-3 mt-3">
//                   <strong>Event Types:</strong>
//                   <br />• <strong>Team-based:</strong> Possession, Attack 3rd, Offside, Aerial Duel
//                   <br />• <strong>Player-based:</strong> Shot (Optional), Foul
//                   <br />• <strong>Match-based:</strong> Period, Transition
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default FootballMatchAnalyzer;


























import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, X, Save, ChevronDown, ChevronUp, BarChart3, ClipboardList, Filter, Maximize, Edit2, FastForward, Rewind, Volume2, VolumeX, ExternalLink } from 'lucide-react';
const FootballMatchAnalyzer = ({ matchId = 1 }) => {
  const mount = document.getElementById("football-analyzer");
  const teamsData = JSON.parse(mount.dataset.teams);
  const videoData = JSON.parse(mount.dataset.video);
   
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6000);
  const [videoProgress, setVideoProgress] = useState(0);
  const [analysisMarkers, setAnalysisMarkers] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(videoData?.video_url || null);
  const [teams, setTeams] = useState(teamsData);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(!!videoData);
  const [showControls, setShowControls] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [videoTitle, setVideoTitle] = useState(videoData?.title || null);
  const [analysisId, setAnalysisId] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // New states for event configuration
  const [selectedEventForConfig, setSelectedEventForConfig] = useState(null);
  const [eventConfigData, setEventConfigData] = useState({});
  
  // New states for current events dropdown
  const [currentEvents, setCurrentEvents] = useState([]);
  const [showCurrentEventsDropdown, setShowCurrentEventsDropdown] = useState(false);
  
  // New states for possession tracking
  const [activePossession, setActivePossession] = useState(null);
  const [possessionStartTime, setPossessionStartTime] = useState(null);
  const [activePossessionTeam, setActivePossessionTeam] = useState('A');
  
  // New states for period and attack 3rd tracking
  const [activePeriod, setActivePeriod] = useState(false);
  const [periodStartTime, setPeriodStartTime] = useState(null);
  const [activeAttack3rd, setActiveAttack3rd] = useState(false);
  const [attack3rdStartTime, setAttack3rdStartTime] = useState(null);
  
  // New state for multiple event configuration panels
  const [openEventConfigs, setOpenEventConfigs] = useState([]);
  
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const videoContainerRef = useRef(null);
  const isSeekingRef = useRef(false);
  const timelineContainerRef = useRef(null);
  const eventDetailsContainerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastClickTimeRef = useRef({});
  
  // Event types configuration
  const eventTypes = [
    { 
      name: 'Period', 
      color: '#6B7280', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['First Half', 'Second Half', 'Extra Time', 'Penalty Kicks', 'Time-out'],
      isTimeBased: true,
      key: 'i',
      requiresTeam: false
    },
    { 
      name: 'Possession', 
      color: '#10B981', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: [],
      isTimeBased: true,
      key: 'p',
      requiresTeam: true
    },
    { 
      name: 'Transition', 
      color: '#3B82F6', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Transition'],
      key: 'r',
      requiresTeam: false
    },
    { 
      name: 'Set Play', 
      color: '#8B5CF6', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Kick off', 'Free Kick', 'Throw In', 'Penalty Kick', 'Goal Kick', 'Corner Kick'],
      key: 't',
      requiresTeam: true
    },
    { 
      name: 'Attack 3rd', 
      color: '#F97316', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: [],
      isTimeBased: true,
      key: 'a',
      requiresTeam: true
    },
    { 
      name: 'Shot', 
      color: '#EF4444', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Goal', 'Save', 'Wide', 'Blocked'],
      key: 's',
      requiresTeam: false, // Team is optional for Shot events
      requiresPlayer: false, // Player is optional for Shot events
      hasAssist: true // Now Shot events can have assists
    },
    { 
      name: 'Foul', 
      color: '#EAB308', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['Yellow Card', 'Red Card'],
      key: 'f',
      requiresTeam: true,
      requiresPlayer: true
    },
    { 
      name: 'Offside', 
      color: '#EC4899', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: [],
      key: 'o',
      requiresTeam: true
    },
    { 
      name: 'Aerial Duel', 
      color: '#06B6D4', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: [],
      key: 'd',
      requiresTeam: true
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
  
  // Handle mouse movement
  const handleVideoMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  useEffect(() => { 
    const el = document.getElementById("football-analyzer");
     if (el) { 
      const videoData = JSON.parse(el.dataset.video);
       if (videoData && videoData.video_url) { 
        setIsVideoLoading(true);
        setUploadedVideo(videoData.video_url);
        setVideoUrl(videoData.video_url); 
        setShowUploadModal(false);
        
        const tempVideo = document.createElement('video');
        tempVideo.src = videoData.video_url;
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
    } 
  }, []);
  
  // Handle seeking
  const seekToTime = (newTime) => {
    if (videoRef.current && videoUrl) {
      isSeekingRef.current = true;
      videoRef.current.currentTime = newTime;
      setCurrentTime(Math.floor(newTime));
      setVideoProgress((newTime / duration) * 100);
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    } else {
      setCurrentTime(Math.floor(newTime));
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  // Sync video with timeline
  useEffect(() => {
    if (videoRef.current && videoUrl && !isSeekingRef.current) {
      if (videoRef.current.playbackRate !== playbackSpeed) {
        videoRef.current.playbackRate = playbackSpeed;
      }
      videoRef.current.volume = isMuted ? 0 : volume;
      
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
  }, [isPlaying, videoUrl, playbackSpeed, isMuted, volume]);
  
  // Handle video time update
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isSeekingRef.current) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(Math.floor(newTime));
      setVideoProgress((newTime / duration) * 100);
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
  
  // Update video progress
  useEffect(() => {
    setVideoProgress((currentTime / duration) * 100);
  }, [currentTime, duration]);
  
  // Handle timeline click - only on header
  const handleTimelineHeaderClick = (e) => {
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
      const endTime = currentTime;
      const startTime = possessionStartTime;
      const team = teams.find(t => t.shortName === `Team ${activePossession}`);
      
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
      setActivePossession(null);
      setPossessionStartTime(null);
      setActivePossessionTeam(activePossession === 'A' ? 'B' : 'A');
    } else {
      setActivePossession(activePossessionTeam);
      setPossessionStartTime(currentTime);
      
      const transitionMarker = {
        id: Date.now() + 1,
        time: Math.max(0, currentTime - 2),
        endTime: Math.min(duration, currentTime + 2),
        eventType: 'Transition',
        team: `Team ${activePossessionTeam}`,
        player_id: null,
        jerseyNo: null,
        playerName: null,
        action: 'Transition',
        color: eventTypes.find(et => et.name === 'Transition').color,
        isTimeBased: true,
        isConfigured: true
      };
      
      setAnalysisMarkers(prev => [...prev, transitionMarker]);
    }
  };
  
  // Handle period toggle
  const handlePeriodToggle = () => {
    if (activePeriod) {
      const endTime = currentTime;
      const startTime = periodStartTime;
      
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
      setActivePeriod(false);
      setPeriodStartTime(null);
    } else {
      setActivePeriod(true);
      setPeriodStartTime(currentTime);
    }
  };
  
  // Handle attack 3rd toggle
  const handleAttack3rdToggle = () => {
    if (activeAttack3rd) {
      const endTime = currentTime;
      const startTime = attack3rdStartTime;
      
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
        isConfigured: false
      };
      
      setAnalysisMarkers(prev => [...prev, attack3rdMarker]);
      setCurrentEvents(prev => [...prev, attack3rdMarker]);
      setActiveAttack3rd(false);
      setAttack3rdStartTime(null);
    } else {
      setActiveAttack3rd(true);
      setAttack3rdStartTime(currentTime);
    }
  };
  
  // Add event to timeline
  const addEventToTimeline = (eventTypeName) => {
    // Prevent rapid button clicks using a more precise timing mechanism
    const now = Date.now();
    const lastClickTime = lastClickTimeRef.current[eventTypeName] || 0;
    
    if (now - lastClickTime < 300) {
      return;
    }
    
    lastClickTimeRef.current[eventTypeName] = now;
    
    if (eventTypeName === 'Possession') {
      handlePossessionToggle();
      return;
    }
    if (eventTypeName === 'Period') {
      handlePeriodToggle();
      return;
    }
    if (eventTypeName === 'Attack 3rd') {
      handleAttack3rdToggle();
      return;
    }
    
    const eventConfig = eventTypes.find(et => et.name === eventTypeName);
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
      assist_player_id: null,
      assistJerseyNo: null,
      assistPlayerName: null,
      color: eventConfig.color,
      isTimeBased: true,
      isConfigured: false
    };
    
    setAnalysisMarkers(prev => [...prev, newMarker]);
    setCurrentEvents(prev => [...prev, newMarker]);
    
    // Check if event already has an open configuration panel
    const existingConfigIndex = openEventConfigs.findIndex(config => config.event.id === newMarker.id);
    if (existingConfigIndex === -1) {
      // Open event configuration panel for this new event
      setOpenEventConfigs(prev => [
        {
          event: newMarker,
          configData: {
            selectedTeam: null,
            selectedPlayer: null,
            selectedAction: null,
            selectedAssistPlayer: null
          }
        },
        ...prev
      ]);
    }
  };
  
  // Handle event bar click - for both configured and unconfigured events
  const handleEventBarClick = (marker, e) => {
    e.stopPropagation();
    
    // Check if event already has an open configuration panel
    const existingConfigIndex = openEventConfigs.findIndex(config => config.event.id === marker.id);
    
    if (existingConfigIndex !== -1) {
      // Scroll to existing panel
      const panelElement = document.getElementById(`event-config-${marker.id}`);
      if (panelElement && eventDetailsContainerRef.current) {
        panelElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // If the event is configured, we are editing it
      if (marker.isConfigured) {
        setEditingMarkerId(marker.id);
        
        const team = teams.find(t => t.name === marker.team);
        const player = team?.players.find(p => p.id === marker.player_id);
        const assistPlayer = team?.players.find(p => p.id === marker.assist_player_id);
        
        setOpenEventConfigs(prev => [
          {
            event: marker,
            configData: {
              selectedTeam: team,
              selectedPlayer: player,
              selectedAction: marker.action,
              selectedAssistPlayer: assistPlayer
            }
          },
          ...prev
        ]);
      } else {
        // For unconfigured events
        setOpenEventConfigs(prev => [
          {
            event: marker,
            configData: {
              selectedTeam: null,
              selectedPlayer: null,
              selectedAction: null,
              selectedAssistPlayer: null
            }
          },
          ...prev
        ]);
      }
    }
    
    // Remove from current events
    setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
  };
  
  // Handle current event select
  const handleCurrentEventSelect = (marker) => {
    // Check if event already has an open configuration panel
    const existingConfigIndex = openEventConfigs.findIndex(config => config.event.id === marker.id);
    
    if (existingConfigIndex !== -1) {
      // Scroll to existing panel
      const panelElement = document.getElementById(`event-config-${marker.id}`);
      if (panelElement && eventDetailsContainerRef.current) {
        panelElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // Open event configuration panel for this event
      setOpenEventConfigs(prev => [
        {
          event: marker,
          configData: {
            selectedTeam: null,
            selectedPlayer: null,
            selectedAction: null,
            selectedAssistPlayer: null
          }
        },
        ...prev
      ]);
    }
    
    // Remove from current events
    setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
    setShowCurrentEventsDropdown(false);
  };
  
  // Edit event
  const handleEditEvent = (marker) => {
    setEditingMarkerId(marker.id);
    
    const team = teams.find(t => t.name === marker.team);
    const player = team?.players.find(p => p.id === marker.player_id);
    const assistPlayer = team?.players.find(p => p.id === marker.assist_player_id);
    
    // Check if event already has an open configuration panel
    const existingConfigIndex = openEventConfigs.findIndex(config => config.event.id === marker.id);
    
    if (existingConfigIndex !== -1) {
      // Scroll to existing panel
      const panelElement = document.getElementById(`event-config-${marker.id}`);
      if (panelElement && eventDetailsContainerRef.current) {
        panelElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      // Open event configuration panel for this event
      setOpenEventConfigs(prev => [
        {
          event: marker,
          configData: {
            selectedTeam: team,
            selectedPlayer: player,
            selectedAction: marker.action,
            selectedAssistPlayer: assistPlayer
          }
        },
        ...prev
      ]);
    }
  };
  
  // Update config data for a specific event
  const updateEventConfigData = (eventId, newData) => {
    setOpenEventConfigs(prev => 
      prev.map(config => 
        config.event.id === eventId 
          ? { ...config, configData: { ...config.configData, ...newData } }
          : config
      )
    );
  };
  
  // Save configured event
  const saveConfiguredEvent = (eventId) => {
    const eventConfigIndex = openEventConfigs.findIndex(config => config.event.id === eventId);
    if (eventConfigIndex === -1) return;
    
    const { event, configData } = openEventConfigs[eventConfigIndex];
    const eventTypeConfig = eventTypes.find(et => et.name === event.eventType);
    
    // For Shot events, team is optional
    if (eventTypeConfig.requiresTeam && !configData.selectedTeam && event.eventType !== 'Shot') {
      alert('Please select a team');
      return;
    }
    
    // Update the marker in analysisMarkers
    setAnalysisMarkers(prev => 
      prev.map(marker => 
        marker.id === event.id 
          ? {
              ...marker,
              team: eventTypeConfig.requiresTeam && configData.selectedTeam ? configData.selectedTeam.name : 'Match',
              player_id: configData.selectedPlayer ? configData.selectedPlayer.id : null,
              jerseyNo: configData.selectedPlayer ? configData.selectedPlayer.jerseyNo : null,
              playerName: configData.selectedPlayer ? configData.selectedPlayer.name : null,
              action: configData.selectedAction || (eventTypeConfig.actions.length > 0 ? eventTypeConfig.actions[0] : event.eventType),
              assist_player_id: configData.selectedAssistPlayer ? configData.selectedAssistPlayer.id : null,
              assistJerseyNo: configData.selectedAssistPlayer ? configData.selectedAssistPlayer.jerseyNo : null,
              assistPlayerName: configData.selectedAssistPlayer ? configData.selectedAssistPlayer.name : null,
              isConfigured: true
            }
          : marker
      )
    );
    
    // Remove from open event configs
    setOpenEventConfigs(prev => prev.filter(config => config.event.id !== eventId));
    setEditingMarkerId(null);
  };
  
  // Cancel event config
  const cancelEventConfig = (eventId) => {
    const eventConfigIndex = openEventConfigs.findIndex(config => config.event.id === eventId);
    if (eventConfigIndex === -1) return;
    
    const { event } = openEventConfigs[eventConfigIndex];
    
    // If not editing, add back to current events only if it doesn't already exist there
    if (!editingMarkerId) {
      setCurrentEvents(prev => {
        // Check if event already exists in current events
        const eventExists = prev.some(e => e.id === event.id);
        if (!eventExists) {
          return [...prev, event];
        }
        return prev;
      });
    }
    
    // Remove from open event configs
    setOpenEventConfigs(prev => prev.filter(config => config.event.id !== eventId));
    setEditingMarkerId(null);
  };
  
  // Remove marker
  const removeMarker = (markerId) => {
    setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
    setCurrentEvents(prev => prev.filter(event => event.id !== markerId));
    setOpenEventConfigs(prev => prev.filter(config => config.event.id !== markerId));
    
    if (selectedEventForConfig && selectedEventForConfig.id === markerId) {
      setSelectedEventForConfig(null);
      setEventConfigData({});
    }
  };
  
  // Keyboard event handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      const key = e.key.toLowerCase();
      
      // Handle space bar for play/pause
      if (key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        return;
      }
      
      const eventType = eventTypes.find(et => et.key === key);
      
      if (eventType) {
        e.preventDefault();
        addEventToTimeline(eventType.name);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, duration, activePossession, activePeriod, activeAttack3rd, possessionStartTime, periodStartTime, attack3rdStartTime, activePossessionTeam]);
  
  // Generate timeline grid
  const generateTimelineGrid = () => {
    const elements = [];
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
  
  // Auto-scroll timeline when current time indicator is near edges
  useEffect(() => {
    if (!timelineContainerRef.current || !timelineRef.current) return;
    
    const container = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const indicatorPosition = (currentTime / duration) * timeline.offsetWidth;
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    
    // Check if indicator is near the edges (within 20% of container width)
    const leftThreshold = scrollLeft + containerWidth * 0.2;
    const rightThreshold = scrollLeft + containerWidth * 0.8;
    
    if (indicatorPosition < leftThreshold || indicatorPosition > rightThreshold) {
      // Scroll to center the indicator
      const newScrollLeft = Math.max(0, indicatorPosition - containerWidth / 2);
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentTime, duration]);
  
  // Load stats data
  const loadStatsData = async () => {
    if (!analysisId) return;
    
    setIsLoadingStats(true);
    try {
      const response = await fetch(`/api/analysis/${analysisId}/stats`, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
        setShowStatsModal(true);
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      alert('Error loading statistics. Please try again.');
    } finally {
      setIsLoadingStats(false);
    }
  };
  
  // Save analysis data
  const saveAllAnalysis = async () => {
    setIsSaving(true);
    try {
      const analysisData = {
        video_id: videoData?.id || null,
        match_id: matchId,
        markers: analysisMarkers.filter(marker => marker.isConfigured),
        created_at: new Date().toISOString()
      };
      
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify(analysisData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysisId(result.analysis_id);
        alert('Analysis saved successfully!');
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
  
  // Cleanup
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
  
  // Get sorted markers
  const getSortedMarkers = () => {
    return [...analysisMarkers]
      .filter(marker => marker.isConfigured)
      .sort((a, b) => b.time - a.time);
  };
  
  // Stats Modal Component
  const StatsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Match Statistics</h3>
          <button
            onClick={() => setShowStatsModal(false)}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <X size={24} />
          </button>
        </div>
        
        {isLoadingStats ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : statsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Team Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                {statsData.teams && Object.entries(statsData.teams).map(([teamName, stats]) => (
                  <div key={teamName} className="bg-white p-4 rounded shadow">
                    <h5 className="font-bold mb-3">{teamName}</h5>
                    <div className="space-y-2 text-sm">
                      <div>Possession: {stats.possession}%</div>
                      <div>Shots: {stats.shots}</div>
                      <div>Goals: {stats.goals}</div>
                      <div>Fouls: {stats.fouls}</div>
                      <div>Corners: {stats.corners}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Player Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Player Statistics</h4>
              <div className="space-y-3">
                {statsData.players && statsData.players.map((player, index) => (
                  <div key={index} className="bg-white p-3 rounded shadow">
                    <h6 className="font-semibold">#{player.jerseyNo} {player.name}</h6>
                    <div className="text-sm text-gray-600">
                      Goals: {player.goals} | Assists: {player.assists} | Fouls: {player.fouls}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Event Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h4 className="text-lg font-semibold mb-4">Event Timeline</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {statsData.timeline && statsData.timeline.map((event, index) => (
                  <div key={index} className="bg-white p-3 rounded shadow flex items-center">
                    <div 
                      className="w-4 h-4 rounded-sm mr-3"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{event.eventType}</div>
                      <div className="text-sm text-gray-600">
                        {event.team} • {formatTime(event.time)}
                        {event.playerName && ` • #${event.jerseyNo} ${event.playerName}`}
                        {event.assistPlayerName && ` (Assist: #${event.assistJerseyNo} ${event.assistPlayerName})`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No statistics available
          </div>
        )}
      </div>
    </div>
  );
  
  // Event Configuration Panel Component
  const EventConfigPanel = ({ eventConfig, onClose }) => {
    const { event, configData } = eventConfig;
    const eventTypeConfig = eventTypes.find(et => et.name === event.eventType);
    
    return (
      <div 
        id={`event-config-${event.id}`}
        className="bg-white border border-gray-200 rounded-lg shadow-sm mb-3 overflow-hidden"
      >
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-blue-800">
              {editingMarkerId === event.id ? 'Edit' : 'Configure'} {event.eventType}
            </h4>
            <div className="text-xs text-blue-600">
              {formatTime(event.time)} - {formatTime(event.endTime)}
            </div>
          </div>
          <button
            onClick={() => onClose(event.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-3">
          {/* Action Selection for Period events */}
          {(event.eventType === 'Period') && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Select Period Type:</div>
              <div className="grid grid-cols-2 gap-1">
                {eventTypeConfig.actions.map(action => (
                  <button
                    key={action}
                    onClick={() => updateEventConfigData(event.id, { selectedAction: action })}
                    className={`px-2 py-2 text-xs rounded transition-colors ${
                      configData.selectedAction === action
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
          
          {/* Team Selection - Show for all events that might need it */}
          {(eventTypeConfig.requiresTeam || event.eventType === 'Shot') && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Select Team {event.eventType === 'Shot' ? '(Optional)' : ''}:
              </div>
              <div className="flex gap-2">
                {teams.map(team => (
                  <button
                    key={team.name}
                    onClick={() => updateEventConfigData(event.id, { 
                      selectedTeam: team, 
                      selectedPlayer: null,
                      selectedAssistPlayer: null
                    })}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      configData.selectedTeam?.name === team.name
                        ? 'bg-gray-100 text-black border border-black '
                        : team.shortName === 'Team A' 
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Selection for Shot events */}
          {(event.eventType === 'Shot' && configData.selectedTeam) && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Result:</div>
              <div className="grid grid-cols-2 gap-1">
                {['Goal', 'Save', 'Wide', 'Blocked'].map(action => (
                  <button
                    key={action}
                    onClick={() => updateEventConfigData(event.id, { selectedAction: action })}
                    className={`px-2 py-2 text-xs rounded transition-colors ${
                      configData.selectedAction === action
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
          
          {/* Action Selection for other events that have actions */}
          {(configData.selectedTeam && event.eventType !== 'Shot' && event.eventType !== 'Period' && eventTypeConfig.actions.length > 0) && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Select Action:</div>
              <div className="grid grid-cols-2 gap-1">
                {eventTypeConfig.actions.map(action => (
                  <button
                    key={action}
                    onClick={() => updateEventConfigData(event.id, { selectedAction: action })}
                    className={`px-2 py-2 text-xs rounded transition-colors ${
                      configData.selectedAction === action
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
          
          {/* Player Selection for events that require player */}
          {(eventTypeConfig.requiresPlayer || event.eventType === 'Shot') && configData.selectedTeam && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Select Player {event.eventType === 'Shot' ? '(Optional)' : ''}:
              </div>
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                {/* Add "None" option for Shot events */}
                {event.eventType === 'Shot' && (
                  <button
                    onClick={() => updateEventConfigData(event.id, { selectedPlayer: null })}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      !configData.selectedPlayer
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    None
                  </button>
                )}
                {configData.selectedTeam.players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => updateEventConfigData(event.id, { selectedPlayer: player })}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      configData.selectedPlayer?.id === player.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    #{player.jerseyNo}
                  </button>
                ))}
              </div>
              {configData.selectedPlayer && (
                <div className="text-xs mt-2 bg-blue-50 rounded px-2 py-1">
                  Selected: #{configData.selectedPlayer.jerseyNo} - {configData.selectedPlayer.name}
                </div>
              )}
            </div>
          )}
          
          {/* Assist Player Selection for Shot events */}
          {(event.eventType === 'Shot' && configData.selectedTeam && configData.selectedPlayer) && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Select Assist Player (Optional):
              </div>
              <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                {/* Add "None" option */}
                <button
                  onClick={() => updateEventConfigData(event.id, { selectedAssistPlayer: null })}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    !configData.selectedAssistPlayer
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  None
                </button>
                {configData.selectedTeam.players
                  .filter(player => player.id !== configData.selectedPlayer?.id) // Exclude the main player
                  .map(player => (
                  <button
                    key={`assist-${player.id}`}
                    onClick={() => updateEventConfigData(event.id, { selectedAssistPlayer: player })}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      configData.selectedAssistPlayer?.id === player.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    #{player.jerseyNo}
                  </button>
                ))}
              </div>
              {configData.selectedAssistPlayer && (
                <div className="text-xs mt-2 bg-blue-50 rounded px-2 py-1">
                  Assist: #{configData.selectedAssistPlayer.jerseyNo} - {configData.selectedAssistPlayer.name}
                </div>
              )}
            </div>
          )}
          
          {/* Save and Cancel buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => saveConfiguredEvent(event.id)}
              disabled={
                (eventTypeConfig.requiresTeam && !configData.selectedTeam && event.eventType !== 'Shot') ||
                (eventTypeConfig.requiresPlayer && !configData.selectedPlayer && event.eventType !== 'Shot')
              }
              className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingMarkerId === event.id ? 'Update Event' : 'Save Event'}
            </button>
            <button
              onClick={() => cancelEventConfig(event.id)}
              className="flex-1 px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
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
      
      {/* Stats Modal */}
      {showStatsModal && <StatsModal />}
      
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
                className="w-full h-86  2xl:h-122 object-contain bg-black"
                style={{
                  // height: document.fullscreenElement ? '100vh' : '450px'
                }}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(Math.floor(videoRef.current.duration));
                    setCurrentTime(videoRef.current.currentTime);
                    setIsVideoLoading(false);
                    videoRef.current.volume = volume;
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
            {videoTitle && (
              <div className="text-sm font-semibold mb-1">{videoTitle}</div>
            )}
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
                onClick={loadStatsData}
                disabled={!analysisId || isLoadingStats}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="View Statistics"
              >
                <BarChart3 size={18} />
              </button>
              <button
                onClick={() => window.open(`/analysis/${analysisId}/report`, '_blank')}
                disabled={!analysisId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="View Detailed Report"
              >
                <ClipboardList size={18} />
              </button>
              <button
                onClick={() => window.open(`/analysis/${analysisId}/export`, '_blank')}
                disabled={!analysisId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Data"
              >
                <ExternalLink size={18} />
              </button>
            </div>
            <div className="flex flex-row-reverse">
              <button
                onClick={saveAllAnalysis}
                disabled={isSaving || analysisMarkers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  title="Rewind 10 seconds"
                >
                  <Rewind size={18} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => {
                    const newTime = Math.min(duration, currentTime + 10);
                    seekToTime(newTime);
                  }}
                  className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  title="Forward 10 seconds"
                >
                  <FastForward size={18} />
                </button>
                
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(isMuted ? 0 : volume) * 100}%, #6B7280 ${(isMuted ? 0 : volume) * 100}%, #6B7280 100%)`
                    }}
                    title="Volume control"
                  />
                </div>
                
                {/* Speed Control Dropdown */}
                <div className="relative group">
                  <button className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium" title="Playback speed">
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
              <div 
                ref={timelineContainerRef}
                className="flex-1 overflow-x-auto"
              >
                <div
                  ref={timelineRef}
                  className="relative bg-gray-50 border border-gray-200"
                  style={{ 
                    height: `${48 + (eventTypes.length * 26)}px`,
                    width: `${Math.max(800, duration * 2)}px`
                  }}
                >
                  {/* Minute-based column lines */}
                  {generateTimelineGrid()}
                  
                  {/* Horizontal Scrollable Timeline Header - Clickable for seeking */}
                  <div 
                    className="h-8 bg-gradient-to-r from-gray-500 to-gray-600 relative cursor-pointer"
                    onClick={handleTimelineHeaderClick}
                  >
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
                      className="absolute z-15 opacity-60 cursor-pointer"
                      style={{
                        left: `${(possessionStartTime / duration) * 100}%`,
                        width: `${((currentTime - possessionStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Possession') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: activePossession === 'A' ? '#EF4444' : '#10B981'
                      }}
                      onClick={(e) => {
                        const possessionMarker = analysisMarkers.find(
                          m => m.eventType === 'Possession' && m.time === possessionStartTime
                        );
                        if (possessionMarker) {
                          handleEventBarClick(possessionMarker, e);
                        }
                      }}
                    /> 
                  )}
                  
                  {/* Active period bar */}
                  {activePeriod && periodStartTime !== null && (
                    <div
                      className="absolute z-15 opacity-60 cursor-pointer"
                      style={{
                        left: `${(periodStartTime / duration) * 100}%`,
                        width: `${((currentTime - periodStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Period') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: '#6B7280'
                      }}
                      onClick={(e) => {
                        const periodMarker = analysisMarkers.find(
                          m => m.eventType === 'Period' && m.time === periodStartTime
                        );
                        if (periodMarker) {
                          handleEventBarClick(periodMarker, e);
                        }
                      }}
                    />
                  )}
                  
                  {/* Active attack 3rd bar */}
                  {activeAttack3rd && attack3rdStartTime !== null && (
                    <div
                      className="absolute z-15 opacity-60 cursor-pointer"
                      style={{
                        left: `${(attack3rdStartTime / duration) * 100}%`,
                        width: `${((currentTime - attack3rdStartTime) / duration) * 100}%`,
                        top: `${48 + (eventTypes.findIndex(et => et.name === 'Attack 3rd') * 24) + 4}px`,
                        height: '16px',
                        backgroundColor: '#F97316'
                      }}
                      onClick={(e) => {
                        const attack3rdMarker = analysisMarkers.find(
                          m => m.eventType === 'Attack 3rd' && m.time === attack3rdStartTime
                        );
                        if (attack3rdMarker) {
                          handleEventBarClick(attack3rdMarker, e);
                        }
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
                </div>
              </div>
            </div>
            
            {/* Unconfigured Events Section */}
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
                        // Check if event already has an open configuration panel
                        const existingConfigIndex = openEventConfigs.findIndex(config => config.event.id === marker.id);
                        
                        if (existingConfigIndex !== -1) {
                          // Scroll to existing panel
                          const panelElement = document.getElementById(`event-config-${marker.id}`);
                          if (panelElement && eventDetailsContainerRef.current) {
                            panelElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        } else {
                          // Open event configuration panel for this event
                          setOpenEventConfigs(prev => [
                            {
                              event: marker,
                              configData: {
                                selectedTeam: null,
                                selectedPlayer: null,
                                selectedAction: null,
                                selectedAssistPlayer: null
                              }
                            },
                            ...prev
                          ]);
                        }
                        
                        // Remove from current events
                        setCurrentEvents(prev => prev.filter(event => event.id !== marker.id));
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
                  className={`p-2 rounded-md text-white text-xs font-medium transition-all hover:opacity-90 hover:scale-105 ${
                    (eventType.name === 'Possession' && activePossession) ||
                    (eventType.name === 'Period' && activePeriod) ||
                    (eventType.name === 'Attack 3rd' && activeAttack3rd)
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]'
                  }`}
                  style={{ minHeight: '40px' }}
                  title={`Press ${eventType.key.toUpperCase()} or click to add ${eventType.name}`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-center leading-tight">
                      {eventType.name}
                      <span className="block text-xs opacity-75">({eventType.key.toUpperCase()})</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Action List */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Action List ({analysisMarkers.filter(m => m.isConfigured).length})</h4>
              <div className="space-y-2 h-auto overflow-y-auto">
                {getSortedMarkers().map(marker => (
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
                      {marker.assistPlayerName && ` (Assist: #${marker.assistJerseyNo} ${marker.assistPlayerName})`}
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
            <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
          </div>
          
          <div 
            ref={eventDetailsContainerRef}
            className="overflow-y-auto p-4"
          >
            {/* Current Events Dropdown */}
            {/* {currentEvents.length > 0 && (
              <div className="bg-blue-50 border-t-2 border-b-2 border-blue-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800">
                    Current Events ({currentEvents.length})
                  </h4>
                  <button
                    onClick={() => setShowCurrentEventsDropdown(!showCurrentEventsDropdown)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    {showCurrentEventsDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                
                {showCurrentEventsDropdown && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentEvents.map(event => (
                      <div 
                        key={event.id}
                        className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleCurrentEventSelect(event)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: event.color }}
                          />
                          <span className="text-sm font-medium">{event.eventType}</span>
                          <span className="text-xs text-gray-500">
                            {formatTime(event.time)} - {formatTime(event.endTime)}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(event.id);
                          }}
                          className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          style={{ fontSize: '10px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )} */}
            
            {/* Open Event Configuration Panels */}
            {openEventConfigs.length > 0 ? (
              <div className="space-y-3">
                {openEventConfigs.map(eventConfig => (
                  <EventConfigPanel 
                    key={eventConfig.event.id} 
                    eventConfig={eventConfig} 
                    onClose={cancelEventConfig} 
                  />
                ))}
              </div>
            ) : (
              // Instructions when no event is selected
              <div className="text-center text-gray-500">
                <div className="text-lg mb-4">Event Details</div>
                <div className="text-sm mb-4">
                  1. Click an event type button or use keyboard shortcuts to add events to timeline
                  <br />
                  2. Click on unconfigured event bars (yellow dashed) to configure them
                  <br />
                  3. Select team and player (for applicable events)
                  <br />
                  4. Save to add to action list
                </div>
                <div className="text-sm text-blue-600 bg-blue-50 rounded p-3">
                  <strong>Keyboard Shortcuts:</strong>
                  <br />I: Period | P: Possession | T: Set Play
                  <br />A: Attack 3rd | S: Shot | F: Foul | O: Offside
                  <br />R: Transition | D: Aerial Duel | Space: Play/Pause
                </div>
                <div className="text-sm text-green-600 bg-green-50 rounded p-3 mt-3">
                  <strong>Event Types:</strong>
                  <br />• <strong>Team-based:</strong> Possession, Attack 3rd, Offside, Aerial Duel
                  <br />• <strong>Player-based:</strong> Shot (Optional), Foul
                  <br />• <strong>Match-based:</strong> Period, Transition
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
