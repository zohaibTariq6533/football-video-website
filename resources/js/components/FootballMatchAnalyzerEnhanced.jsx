import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Upload, X, Save, ChevronDown, ChevronUp, BarChart3, ClipboardList, Filter, Maximize, Edit2, FastForward, Rewind, Volume2, VolumeX, ExternalLink, Funnel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FootballMatchAnalyzer = ({ 
  matchId = 1, 
  initialTeams, 
  initialVideo, 
  videoId: propVideoId 
}) => {
  const videoId = propVideoId;

  // const mount = document.getElementById("football-analyzer");
  // const teamsData = JSON.parse(mount.dataset.teams);
  // const videoData = JSON.parse(mount.dataset.video);
  // const videoId = mount.dataset.videoId ? JSON.parse(mount.dataset.videoId) : null;

  const [videoUrl, setVideoUrl] = useState(initialVideo?.video_url || null);
  const [teams, setTeams] = useState(initialTeams || []);
  const [videoTitle, setVideoTitle] = useState(initialVideo?.title || null);
   
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0); // For display purposes only
  const [duration, setDuration] = useState(6000);
  const [videoProgress, setVideoProgress] = useState(0);
  const [analysisMarkers, setAnalysisMarkers] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  // const [videoUrl, setVideoUrl] = useState(videoData?.video_url || null);
  // const [teams, setTeams] = useState(teamsData);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(!!videoUrl);
  const [showControls, setShowControls] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  // const [videoTitle, setVideoTitle] = useState(videoData?.title || null);
  const [analysisId, setAnalysisId] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); // New state for fullscreen
  
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
  const lastUpdateTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const currentTimeRef = useRef(0); // Ref to hold current time without triggering re-renders
  const displayTimeRef = useRef(0); // Ref for display time
  
  // Event types configuration
  const eventTypes = [
    { 
      name: 'Period', 
      color: '#6B7280', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: ['First Half', 'Second Half', 'Extra Time', 'Penalty Kicks', 'Time-out'],
      isTimeBased: true,
      key: 'p',
      requiresTeam: false
    },
    { 
      name: 'Possession', 
      color: '#10B981', 
      bgColor: 'bg-gradient-to-b from-[#FE5E3A] via-[#FC404E] to-[#FD337F]',
      actions: [],
      isTimeBased: true,
      key: 'q',
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
      key: 'w',
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
      requiresPlayer: false // Changed to false to make player optional
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

  // Function to load analysis events from the database
  const loadAnalysisEvents = useCallback(async () => {
    if (!videoId) return;

    try {
      const response = await fetch(`/api/video/${videoId}/events`, {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
      });

      if (response.ok) {
        const events = await response.json();
        setAnalysisMarkers(events);
      } else {
        console.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }, [videoId]);

  // Load events when component mounts
  useEffect(() => {
    loadAnalysisEvents();
  }, [loadAnalysisEvents]);
  
  // Format time helper - memoized for performance
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && videoContainerRef.current) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);
  
  // Handle mouse movement - debounced
  const handleVideoMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);
  
  // useEffect(() => { 
  //   const el = document.getElementById("football-analyzer");
  //    if (el) { 
  //     const videoData = JSON.parse(el.dataset.video);
  //      if (videoData && videoData.video_url) { 
  //       setIsVideoLoading(true);
  //       setUploadedVideo(videoData.video_url);
  //       setVideoUrl(videoData.video_url); 
  //       setShowUploadModal(false);
        
  //       const tempVideo = document.createElement('video');
  //       tempVideo.src = videoData.video_url;
  //       tempVideo.onloadedmetadata = () => {
  //         setDuration(Math.floor(tempVideo.duration));
  //         setCurrentTime(0);
  //         currentTimeRef.current = 0;
  //         displayTimeRef.current = 0;
  //         setDisplayTime(0);
  //         setIsPlaying(false);
  //         setIsVideoLoading(false);
  //       };
  //       tempVideo.onerror = () => {
  //         setIsVideoLoading(false);
  //       };
  //     } 
  //   } 
  // }, []);
  
  // Handle seeking - optimized
  const seekToTime = useCallback((newTime) => {
    if (videoRef.current && videoUrl) {
      isSeekingRef.current = true;
      videoRef.current.currentTime = newTime;
      setCurrentTime(Math.floor(newTime));
      currentTimeRef.current = Math.floor(newTime);
      displayTimeRef.current = Math.floor(newTime);
      setDisplayTime(Math.floor(newTime));
      setVideoProgress((newTime / duration) * 100);
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    } else {
      setCurrentTime(Math.floor(newTime));
      currentTimeRef.current = Math.floor(newTime);
      displayTimeRef.current = Math.floor(newTime);
      setDisplayTime(Math.floor(newTime));
    }
  }, [videoUrl, duration]);
  
  // Handle volume change
  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, []);
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);
  
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
  
  // Handle video time update - optimized with requestAnimationFrame and throttled display updates
  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current && !isSeekingRef.current) {
      // Update the ref immediately for accurate time tracking
      currentTimeRef.current = Math.floor(videoRef.current.currentTime);
      
      // Only update the display state at a throttled rate (5 times per second)
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > 200) { // Update every 200ms
        lastUpdateTimeRef.current = now;
        setDisplayTime(currentTimeRef.current);
        setVideoProgress((currentTimeRef.current / duration) * 100);
      }
    }
  }, [duration]);
  
  // Play/pause functionality
  useEffect(() => {
    if (isPlaying && !videoUrl) {
      intervalRef.current = setInterval(() => {
        const newTime = currentTimeRef.current + 1;
        currentTimeRef.current = newTime;
        
        // Update display time at throttled rate
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 200) {
          lastUpdateTimeRef.current = now;
          setDisplayTime(newTime);
          setVideoProgress((newTime / duration) * 100);
        }
        
        if (newTime >= duration) {
          setIsPlaying(false);
        }
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
  const handleTimelineHeaderClick = useCallback((e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = Math.floor(percentage * duration);
      seekToTime(newTime);
    }
  }, [duration, seekToTime]);
  
// Handle possession toggle
const handlePossessionToggle = useCallback(() => {
    if (activePossession) {
        const endTime = currentTimeRef.current;
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
        // Don't switch team automatically - let user select it in the config panel
    } else {
        setActivePossession(activePossessionTeam);
        setPossessionStartTime(currentTimeRef.current);
        
        // Don't automatically create a transition marker - let user configure it
    }
}, [activePossession, possessionStartTime, activePossessionTeam, teams, eventTypes]);
  
  // Handle period toggle
  const handlePeriodToggle = useCallback(() => {
    if (activePeriod) {
      const endTime = currentTimeRef.current;
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
        isConfigured: false // Set to false so it opens for configuration
      };
      
      setAnalysisMarkers(prev => [...prev, periodMarker]);
      setActivePeriod(false);
      setPeriodStartTime(null);
      
      // Open configuration panel for this period
      setOpenEventConfigs(prev => [
        {
          event: periodMarker,
          configData: {
            selectedTeam: null,
            selectedPlayer: null,
            selectedAction: null,
            selectedAssistPlayer: null
          }
        },
        ...prev
      ]);
    } else {
      setActivePeriod(true);
      setPeriodStartTime(currentTimeRef.current);
    }
  }, [activePeriod, periodStartTime]);
  
  // Handle attack 3rd toggle
  const handleAttack3rdToggle = useCallback(() => {
    if (activeAttack3rd) {
      const endTime = currentTimeRef.current;
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
        isConfigured: false // Set to false so it opens for configuration
      };
      
      setAnalysisMarkers(prev => [...prev, attack3rdMarker]);
      setCurrentEvents(prev => [...prev, attack3rdMarker]);
      setActiveAttack3rd(false);
      setAttack3rdStartTime(null);
      
      // Open configuration panel for this attack 3rd
      setOpenEventConfigs(prev => [
        {
          event: attack3rdMarker,
          configData: {
            selectedTeam: null,
            selectedPlayer: null,
            selectedAction: null,
            selectedAssistPlayer: null
          }
        },
        ...prev
      ]);
    } else {
      setActiveAttack3rd(true);
      setAttack3rdStartTime(currentTimeRef.current);
    }
  }, [activeAttack3rd, attack3rdStartTime]);
  
  // Add event to timeline
  const addEventToTimeline = useCallback((eventTypeName) => {
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
    const startTime = Math.max(0, currentTimeRef.current - 4);
    const endTime = Math.min(duration, currentTimeRef.current + 7);
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
  }, [currentTimeRef, duration, handlePossessionToggle, handlePeriodToggle, handleAttack3rdToggle, openEventConfigs]);
  
  // Handle event bar click - for both configured and unconfigured events
  const handleEventBarClick = useCallback((marker, e) => {
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
  }, [openEventConfigs, teams]);
  
  // Handle current event select
  const handleCurrentEventSelect = useCallback((marker) => {
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
  }, [openEventConfigs]);
  
  // Edit event
  const handleEditEvent = useCallback((marker) => {
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
  }, [openEventConfigs, teams]);
  
  // Update config data for a specific event
  const updateEventConfigData = useCallback((eventId, newData) => {
    setOpenEventConfigs(prev => 
      prev.map(config => 
        config.event.id === eventId 
          ? { ...config, configData: { ...config.configData, ...newData } }
          : config
      )
    );
  }, []);
  
// Save configured event
const saveConfiguredEvent = useCallback((eventId) => {
    const eventConfigIndex = openEventConfigs.findIndex(config => config.event.id === eventId);
    if (eventConfigIndex === -1) return;
    
    const { event, configData } = openEventConfigs[eventConfigIndex];
    const eventTypeConfig = eventTypes.find(et => et.name === event.eventType);
    
    // For Shot and Foul events, team is optional
    if (eventTypeConfig.requiresTeam && !configData.selectedTeam && event.eventType !== 'Shot' && event.eventType !== 'Foul') {
        alert('Please select a team');
        return;
    }
    
    // Update the marker in analysisMarkers
    setAnalysisMarkers(prev => 
        prev.map(marker => {
            if (marker.id !== event.id) return marker;
            
            // Find team object to get team_id
            const team = configData.selectedTeam;
            
            // Find player object to get player_id
            const player = configData.selectedPlayer;
            
            // Find assist player object to get assist_player_id
            const assistPlayer = configData.selectedAssistPlayer;
            
            // Create the updated marker with all required fields
            const updatedMarker = {
                ...marker,
                team: configData.selectedTeam ? configData.selectedTeam.name : 'Match',
                team_id: team?.id || null,  // Use team.id if available
                player_id: player?.id || null,
                jerseyNo: player?.jerseyNo || null,
                playerName: player?.name || null,
                // Only set action if one is selected, otherwise set to null
                action: configData.selectedAction || null,
                assist_player_id: assistPlayer?.id || null,
                assistJerseyNo: assistPlayer?.jerseyNo || null,
                assistPlayerName: assistPlayer?.name || null,
                isConfigured: true
            };
            
            // Special handling for Shot events - ensure IDs are set
            if (event.eventType === 'Shot') {
                // For Shot events, ensure team_id is set if team is selected
                if (configData.selectedTeam) {
                    updatedMarker.team_id = configData.selectedTeam.id;
                }
                // Ensure player_id is set if player is selected
                if (configData.selectedPlayer) {
                    updatedMarker.player_id = configData.selectedPlayer.id;
                }
                // Ensure assist_player_id is set if assist player is selected
                if (configData.selectedAssistPlayer) {
                    updatedMarker.assist_player_id = configData.selectedAssistPlayer.id;
                }
            }
            
            // Special handling for Foul events
            if (event.eventType === 'Foul') {
                // For Foul events, ensure team_id is set if team is selected
                if (configData.selectedTeam) {
                    updatedMarker.team_id = configData.selectedTeam.id;
                }
                // Ensure player_id is set if player is selected
                if (configData.selectedPlayer) {
                    updatedMarker.player_id = configData.selectedPlayer.id;
                }
            }
            
            return updatedMarker;
        })
    );
    
    // Remove from open event configs
    setOpenEventConfigs(prev => prev.filter(config => config.event.id !== eventId));
    setEditingMarkerId(null);
}, [openEventConfigs]);
  
  // Cancel event config
  const cancelEventConfig = useCallback((eventId) => {
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
  }, [openEventConfigs, editingMarkerId]);
  
  // Remove marker
  const removeMarker = useCallback((markerId) => {
    setAnalysisMarkers(prev => prev.filter(marker => marker.id !== markerId));
    setCurrentEvents(prev => prev.filter(event => event.id !== markerId));
    setOpenEventConfigs(prev => prev.filter(config => config.event.id !== markerId));
    
    if (selectedEventForConfig && selectedEventForConfig.id === markerId) {
      setSelectedEventForConfig(null);
      setEventConfigData({});
    }
  }, [selectedEventForConfig]);
  
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
  }, [addEventToTimeline]);
  
  // Generate timeline grid
  const generateTimelineGrid = useCallback(() => {
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
  }, [duration]);
  
  // Auto-scroll timeline when current time indicator is near edges
  useEffect(() => {
    if (!timelineContainerRef.current || !timelineRef.current) return;
    
    const container = timelineContainerRef.current;
    const timeline = timelineRef.current;
    const indicatorPosition = (currentTimeRef.current / duration) * timeline.offsetWidth;
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
  }, [displayTime, duration]); // Use displayTime instead of currentTime to reduce re-renders
  

const handleViewStats = () => {
    if (analysisId) {
        const statsUrl = `/admin/dashboard/video-analyze/stats/${analysisId}`;
        window.open(statsUrl, '_blank');
    } else {
        alert('Please save the analysis first');
    }
};

const handleViewFilter = () => {
    if (analysisId) {
        const filterUrl = `/admin/dashboard/video-analyze/filter/${analysisId}`;
        window.open(filterUrl, '_blank');
    } else {
        alert('Please save the analysis first');
    }
};

  // Load stats data
  const loadStatsData = useCallback(async () => {
  if (!analysisId) return;

  setIsLoadingStats(true);
  try {
    const response = await fetch(`/api/video/${analysisId}/stats`, {
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
}, [analysisId]);
  
  // Save analysis data
const saveAllAnalysis = useCallback(async () => {
  setIsSaving(true);
  try {
    // Clean and prepare markers data
    const cleanedMarkers = analysisMarkers
      .filter(marker => marker.isConfigured)
      .map(marker => {
        // Use the IDs that are already set in the marker object
        const baseMarker = {
          id: marker.id,
          time: marker.time,
          endTime: marker.endTime,
          eventType: marker.eventType,
          team: marker.team,
          team_id: marker.team_id || null,  // Use the team_id from the marker
          player_id: marker.player_id || null,  // Use the player_id from the marker
          jerseyNo: marker.jerseyNo || null,
          playerName: marker.playerName || null,
          action: marker.action || null,
          assist_player_id: marker.assist_player_id || null,  // Use the assist_player_id from the marker
          assistJerseyNo: marker.assistJerseyNo || null,
          assistPlayerName: marker.assistPlayerName || null,
          color: marker.color,
          isTimeBased: marker.isTimeBased || false
        };
        
        // Special handling for Shot events - only try to find IDs if they're not already set
        if (marker.eventType === 'Shot') {
          // For Shot events, ensure team_id is set if team is selected but ID is missing
          if (marker.team && !baseMarker.team_id) {
            const team = teams.find(t => t.name === marker.team);
            baseMarker.team_id = team?.id || null;
          }
          // Ensure player_id is set if player is selected but ID is missing
          if (marker.playerName && marker.jerseyNo && !baseMarker.player_id) {
            const team = teams.find(t => t.name === marker.team);
            if (team) {
              const player = team.players?.find(p => 
                p.name === marker.playerName && p.jerseyNo === marker.jerseyNo
              );
              baseMarker.player_id = player?.id || null;
            }
          }
          // Ensure assist_player_id is set if assist player is selected but ID is missing
          if (marker.assistPlayerName && marker.assistJerseyNo && !baseMarker.assist_player_id) {
            const team = teams.find(t => t.name === marker.team);
            if (team) {
              const assistPlayer = team.players?.find(p => 
                p.name === marker.assistPlayerName && p.jerseyNo === marker.assistJerseyNo
              );
              baseMarker.assist_player_id = assistPlayer?.id || null;
            }
          }
        }
        
        // Debug log to check values
        console.log('Processing marker:', {
          eventType: marker.eventType,
          team: marker.team,
          team_id: baseMarker.team_id,
          player_id: baseMarker.player_id,
          assist_player_id: baseMarker.assist_player_id
        });
        
        return baseMarker;
      });
    
    const analysisData = {
      video_id: parseInt(videoId) || null,
      markers: cleanedMarkers,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    

    // Send request
    const response = await fetch('/api/save-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify(analysisData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `Server returned ${response.status}: ${response.statusText}`
      );
    }
    
    const result = await response.json();
    
    if (!result || typeof result.video_id === 'undefined') {
      throw new Error('Invalid response from server');
    }
    
    setAnalysisId(result.video_id);
    alert('Analysis saved successfully!');
  } catch (error) {
    console.error('Error saving analysis:', error);
    alert(
      'Failed to save analysis: ' + 
      (error.message || 'Unknown error occurred. Please try again.')
    );
  } finally {
    setIsSaving(false);
  }
}, [analysisMarkers, videoId, teams]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Get sorted markers - now sorted by ending point
  const getSortedMarkers = useCallback(() => {
    return [...analysisMarkers]
      .filter(marker => marker.isConfigured)
      .sort((a, b) => {
        // For time-based events, use endTime, otherwise use time
        const timeA = a.endTime || a.time;
        const timeB = b.endTime || b.time;
        return timeB - timeA; // Sort in descending order (highest ending time first)
      });
  }, [analysisMarkers]);
  
  // Stats Modal Component - memoized
  const StatsModal = memo(() => (
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
  ));
  
// Event Configuration Panel Component - memoized
const EventConfigPanel = memo(({ eventConfig, onClose }) => {
  const { event, configData } = eventConfig;
  const eventTypeConfig = eventTypes.find(et => et.name === event.eventType);
  
  // Determine if team selection is required for this event
  const requiresTeamSelection = eventTypeConfig.requiresTeam && 
                                 event.eventType !== 'Period' && 
                                 event.eventType !== 'Possession' && 
                                 event.eventType !== 'Transition';
  
  // Check if team selection is satisfied
  const teamSelectionSatisfied = !requiresTeamSelection || configData.selectedTeam;
  
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
      </div>
      
      <div className="p-3">
        {/* Action Selection for Period events */}
        {(event.eventType === 'Period') && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Select Period Type:</div>
            <div className="grid grid-cols-2 gap-1">
              {/* Add "None" option */}
              <button
                onClick={() => updateEventConfigData(event.id, { selectedAction: null })}
                className={`px-2 py-2 text-xs rounded transition-colors ${
                  configData.selectedAction === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                None
              </button>
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
        {(eventTypeConfig.requiresTeam || event.eventType === 'Shot' || event.eventType === 'Foul' || event.eventType === 'Possession' || event.eventType === 'Set Play') && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Select Team {event.eventType === 'Shot' || event.eventType === 'Foul' ? '(Optional)' : ''}:
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
              {/* Add "None" option */}
              <button
                onClick={() => updateEventConfigData(event.id, { selectedAction: null })}
                className={`px-2 py-2 text-xs rounded transition-colors ${
                  configData.selectedAction === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                None
              </button>
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
        
        {/* Action Selection for Foul events */}
        {(event.eventType === 'Foul' && configData.selectedTeam) && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Card Type:</div>
            <div className="grid grid-cols-2 gap-1">
              {/* Add "None" option */}
              <button
                onClick={() => updateEventConfigData(event.id, { selectedAction: null })}
                className={`px-2 py-2 text-xs rounded transition-colors ${
                  configData.selectedAction === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                None
              </button>
              {['Yellow Card', 'Red Card'].map(action => (
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
        
        {/* Action Selection for Set Play events */}
        {(event.eventType === 'Set Play' && configData.selectedTeam) && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Select Play Type:</div>
            <div className="grid grid-cols-2 gap-1">
              {/* Add "None" option */}
              <button
                onClick={() => updateEventConfigData(event.id, { selectedAction: null })}
                className={`px-2 py-2 text-xs rounded transition-colors ${
                  configData.selectedAction === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                None
              </button>
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
        
        {/* Action Selection for other events that have actions */}
        {(configData.selectedTeam && event.eventType !== 'Shot' && event.eventType !== 'Period' && event.eventType !== 'Foul' && event.eventType !== 'Set Play' && eventTypeConfig.actions.length > 0) && (
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
        {(eventTypeConfig.requiresPlayer || event.eventType === 'Shot' || event.eventType === 'Foul') && configData.selectedTeam && (
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Select Player {event.eventType === 'Shot' || event.eventType === 'Foul' ? '(Optional)' : ''}:
            </div>
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
              {/* Add "None" option for Shot and Foul events */}
              {(event.eventType === 'Shot' || event.eventType === 'Foul') && (
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
            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
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
            disabled={!teamSelectionSatisfied || 
                     (eventTypeConfig.requiresPlayer && !configData.selectedPlayer && event.eventType !== 'Shot' && event.eventType !== 'Foul')}
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
        
        {/* Show requirement message if team selection is needed but not satisfied */}
        {requiresTeamSelection && !configData.selectedTeam && (
          <div className="text-xs text-red-500 mt-2">
            Team selection is required for this event type
          </div>
        )}
      </div>
    </div>
  );
});
  
  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
                className="w-full h-full object-contain bg-black"
                style={{
                  height: isFullscreen ? '100vh' : '450px'
                }}
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(Math.floor(videoRef.current.duration));
                    setCurrentTime(0);
                    currentTimeRef.current = 0;
                    displayTimeRef.current = 0;
                    setDisplayTime(0);
                    setIsVideoLoading(false);
                    videoRef.current.volume = volume;
                  }
                }}
                onLoadStart={() => setIsVideoLoading(true)}
                onCanPlay={() => setIsVideoLoading(false)}
                playsInline
                preload="auto"
              />
              
              {/* Video Timeline - Hide in fullscreen */}
              {!isFullscreen && (
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
              )}
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
            <div className="text-lg font-semibold">{formatTime(displayTime)} / {formatTime(duration)}</div>
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
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            ) : (
              <Maximize size={20} />
            )}
          </button>
          
          {/* Save button overlay - Hide in fullscreen */}
          {!isFullscreen && (
            <div className="absolute top-4 right-4">
              <div className="flex flex-row mb-4">
                {/* // Stats button */}
                <button
                    onClick={handleViewStats}
                    disabled={!analysisId}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="View Statistics"
                >
                    <BarChart3 size={18} />
                </button>

                {/* // report button */}
                <button
                    onClick={handleViewFilter}
                    disabled={!analysisId}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Filter Events"
                >
                    {/* <ClipboardList  /> */}
                    <Funnel size={18} />
                </button>

                {/* // Export button */}
                {/* <button
                    onClick={() => {
                        if (analysisId) {
                            window.open(`/video/${analysisId}/export`, '_blank');
                        } else {
                            alert('Please save the analysis first');
                        }
                    }}
                    disabled={!analysisId}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export Data"
                >
                    <ExternalLink size={18} />
                </button> */}
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
          )}
          
          {/* Overlay Video Controls */}
          {videoUrl && (
            <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex items-center gap-4 bg-black bg-opacity-75 px-3.5 py-2 rounded-full">
                <button
                  onClick={() => {
                    const newTime = Math.max(0, currentTimeRef.current - 10);
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
                    const newTime = Math.min(duration, currentTimeRef.current + 10);
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
                      style={{ left: `${(currentTimeRef.current / duration) * 100}%` }}
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
                        width: `${((currentTimeRef.current - possessionStartTime) / duration) * 100}%`,
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
                        width: `${((currentTimeRef.current - periodStartTime) / duration) * 100}%`,
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
                        width: `${((currentTimeRef.current - attack3rdStartTime) / duration) * 100}%`,
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
            
            {/* Action List - Now sorted by ending point */}
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
                  <br />P: Period | Q: Possession | W: Set Play
                  <br />A: Attack 3rd | S: Shot | F: Foul | O: Offside
                  <br />R: Transition | D: Aerial Duel | Space: Play/Pause
                </div>
                <div className="text-sm text-green-600 bg-green-50 rounded p-3 mt-3">
                  <strong>Event Types:</strong>
                  <br />• <strong>Team-based:</strong> Possession, Attack 3rd, Offside, Aerial Duel
                  <br />• <strong>Player-based:</strong> Shot (Optional), Foul (Optional)
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