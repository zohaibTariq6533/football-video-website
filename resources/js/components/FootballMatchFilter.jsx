import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    FastForward,
    Rewind,
    Users,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const FootballMatchFilter = ({
    teams: propTeams,
    video: propVideo,
    analysisData: propAnalysisData,
}) => {
    // Initialize data from either props or dataset
    const [initialData, setInitialData] = useState({
        teamsData: [],
        videoData: null,
        analysisData: { markers: [] },
    });

    // State variables
    const [isBuffering, setIsBuffering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(6000);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const [teams, setTeams] = useState([]);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [videoTitle, setVideoTitle] = useState(null);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filter states
    const [selectedEvents, setSelectedEvents] = useState({});
    const [selectedPlayers, setSelectedPlayers] = useState({});
    const [selectedActions, setSelectedActions] = useState({}); // New state for actions
    const [filteredEvents, setFilteredEvents] = useState([]);
    
    // New state to track selection timestamps
    const [selectionTimestamps, setSelectionTimestamps] = useState({});

    // New states for hover popups
    const [hoveredEventCount, setHoveredEventCount] = useState(null); // { teamId, eventType }
    const [hoveredActionCount, setHoveredActionCount] = useState(null); // { teamId, eventType }
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [actionPopupPosition, setActionPopupPosition] = useState({
        top: 0,
        left: 0,
    });

    // Refs
    const videoRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const isSeekingRef = useRef(false);
    const currentTimeRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);

    // Effect to initialize data from either props or dataset
    useEffect(() => {
        let teamsData = propTeams || [];
        let videoData = propVideo || null;
        let analysisData = propAnalysisData || { markers: [] };

        // If props are not provided, try to get data from mount point
        if (!propTeams || !propVideo || !propAnalysisData) {
            try {
                const mount = document.getElementById("football-filter");
                if (mount?.dataset?.teams) {
                    teamsData = JSON.parse(mount.dataset.teams);
                }
                if (mount?.dataset?.video) {
                    videoData = JSON.parse(mount.dataset.video);
                }
                if (mount?.dataset?.analysis) {
                    analysisData = JSON.parse(mount.dataset.analysis);
                }
            } catch (error) {
                console.error("Error parsing data from mount point:", error);
            }
        }

        console.log("Initialized data:", {
            teamsData,
            videoData,
            analysisData,
        });
        setInitialData({ teamsData, videoData, analysisData });
    }, [propTeams, propVideo, propAnalysisData]);

    // Effect to update states when initialData changes
    useEffect(() => {
        const { videoData, teamsData, analysisData } = initialData;
        setVideoUrl(videoData?.video_url || null);
        setTeams(teamsData || []);
        setIsVideoLoading(!!videoData);
        setVideoTitle(videoData?.title || null);

        // Initialize filtered events
        if (analysisData?.markers && Array.isArray(analysisData.markers)) {
            setFilteredEvents(analysisData.markers);
            console.log("Set filtered events:", analysisData.markers);
        } else {
            console.warn(
                "Analysis data is not properly initialized:",
                analysisData
            );
            setFilteredEvents([]);
        }
    }, [initialData]);

    // Initialize selected events - ALL UNCHECKED BY DEFAULT
    useEffect(() => {
        const { analysisData } = initialData;

        if (!teams?.length || !analysisData?.markers?.length) {
            console.log("Missing required data:", { teams, analysisData });
            return;
        }

        const initialSelectedEvents = {};
        const initialSelectedActions = {}; // Initialize actions

        // Get all event types from the analysis data
        const eventTypes = [
            ...new Set(
                analysisData.markers
                    .filter((marker) => marker?.eventType)
                    .map((marker) => marker.eventType)
            ),
        ];

        teams.forEach((team) => {
            initialSelectedEvents[team.id] = {};
            initialSelectedActions[team.id] = {}; // Initialize actions for team

            eventTypes.forEach((eventType) => {
                // Initially UNSELECT all events
                initialSelectedEvents[team.id][eventType] = false;

                // Get all unique actions for this team and event type
                const actions = [
                    ...new Set(
                        analysisData.markers
                            .filter(
                                (marker) =>
                                    marker.eventType === eventType &&
                                    marker.team_id === team.id &&
                                    marker.action
                            )
                            .map((marker) => marker.action)
                    ),
                ];

                // Initialize actions for this event type
                initialSelectedActions[team.id][eventType] = {};
                actions.forEach((action) => {
                    initialSelectedActions[team.id][eventType][action] = false;
                });
            });
        });

        // Add events without team
        initialSelectedEvents.no_team = {};
        initialSelectedActions.no_team = {};
        eventTypes.forEach((eventType) => {
            initialSelectedEvents.no_team[eventType] = false;

            // Get actions for events without team
            const actions = [
                ...new Set(
                    analysisData.markers
                        .filter(
                            (marker) =>
                                marker.eventType === eventType &&
                                marker.team_id === null &&
                                marker.action
                        )
                        .map((marker) => marker.action)
                ),
            ];

            initialSelectedActions.no_team[eventType] = {};
            actions.forEach((action) => {
                initialSelectedActions.no_team[eventType][action] = false;
            });
        });

        setSelectedEvents(initialSelectedEvents);
        setSelectedActions(initialSelectedActions); // Set actions state
    }, [teams, initialData]);

    // Format time helper
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement && videoRef.current) {
            videoRef.current.requestFullscreen().catch((err) => {
                console.error(
                    `Error attempting to enable fullscreen: ${err.message}`
                );
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
        // Don't hide controls in fullscreen mode
        if (!isFullscreen) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isFullscreen]);

    // Handle seeking
    const seekToTime = useCallback(
        (newTime) => {
            if (videoRef.current && videoUrl) {
                isSeekingRef.current = true;
                videoRef.current.currentTime = newTime;
                setCurrentTime(Math.floor(newTime));
                currentTimeRef.current = Math.floor(newTime);
                setVideoProgress((newTime / duration) * 100);
                setTimeout(() => {
                    isSeekingRef.current = false;
                }, 100);
            } else {
                setCurrentTime(Math.floor(newTime));
                currentTimeRef.current = Math.floor(newTime);
                setVideoProgress((newTime / duration) * 100);
            }
        },
        [videoUrl, duration]
    );

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

    // Handle video time update
    const handleVideoTimeUpdate = useCallback(() => {
        if (videoRef.current && !isSeekingRef.current) {
            currentTimeRef.current = Math.floor(videoRef.current.currentTime);

            // Update display time at throttled rate
            const now = Date.now();
            if (now - lastUpdateTimeRef.current > 200) {
                lastUpdateTimeRef.current = now;
                setCurrentTime(currentTimeRef.current);
                setVideoProgress((currentTimeRef.current / duration) * 100);
            }
        }
    }, [duration]);

    // Sync video with timeline
    useEffect(() => {
        if (videoRef.current && videoUrl && !isSeekingRef.current) {
            if (videoRef.current.playbackRate !== playbackSpeed) {
                videoRef.current.playbackRate = playbackSpeed;
            }
            videoRef.current.volume = isMuted ? 0 : volume;

            try {
                if (isPlaying && videoRef.current.paused) {
                    videoRef.current
                        .play()
                        .catch((error) =>
                            console.error("Video play error:", error)
                        );
                } else if (!isPlaying && !videoRef.current.paused) {
                    videoRef.current.pause();
                }
            } catch (error) {
                console.error("Video control error:", error);
            }
        }
    }, [isPlaying, videoUrl, playbackSpeed, isMuted, volume]);

    // Handle timeline click
    const handleTimelineClick = useCallback(
        (e) => {
            if (videoRef.current) {
                const rect = videoRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newTime = Math.floor(percentage * duration);
                seekToTime(newTime);
            }
        },
        [duration, seekToTime]
    );

    // Toggle event selection with timestamp tracking
    const toggleEventSelection = useCallback((teamId, eventType) => {
        setSelectedEvents((prev) => {
            // Create a copy of the previous state
            const newState = { ...prev };
            
            // If the teamId doesn't exist in the state, initialize it
            if (!newState[teamId]) {
                newState[teamId] = {};
            }
            
            // If the eventType doesn't exist for this team, initialize it
            if (newState[teamId][eventType] === undefined) {
                newState[teamId][eventType] = false;
            }
            
            // Toggle the selection
            newState[teamId][eventType] = !newState[teamId][eventType];
            
            return newState;
        });
        
        // Update the timestamp when an event is selected
        if (!selectedEvents[teamId]?.[eventType]) {
            setSelectionTimestamps(prev => ({
                ...prev,
                [`${teamId}-${eventType}`]: Date.now()
            }));
        }
    }, [selectedEvents]);

    // Toggle action selection
    const toggleActionSelection = useCallback(
        (teamId, eventType, action) => {
            setSelectedActions((prev) => {
                // Create a copy of the previous state
                const newState = { ...prev };
                
                // If the teamId doesn't exist, initialize it
                if (!newState[teamId]) {
                    newState[teamId] = {};
                }
                
                // If the eventType doesn't exist for this team, initialize it
                if (!newState[teamId][eventType]) {
                    newState[teamId][eventType] = {};
                }
                
                // If the action doesn't exist for this eventType, initialize it
                if (newState[teamId][eventType][action] === undefined) {
                    newState[teamId][eventType][action] = false;
                }
                
                // Toggle the selection
                newState[teamId][eventType][action] = !newState[teamId][eventType][action];
                
                return newState;
            });

            // Auto-select the event type when an action is selected
            if (!selectedEvents[teamId]?.[eventType]) {
                setSelectedEvents((prev) => {
                    const newState = { ...prev };
                    if (!newState[teamId]) {
                        newState[teamId] = {};
                    }
                    if (newState[teamId][eventType] === undefined) {
                        newState[teamId][eventType] = false;
                    }
                    newState[teamId][eventType] = true;
                    return newState;
                });
                
                // Update timestamp for the event type when selected via action
                setSelectionTimestamps(prev => ({
                    ...prev,
                    [`${teamId}-${eventType}`]: Date.now()
                }));
            }
        },
        [selectedEvents]
    );

    // Toggle player selection with auto event selection
    const togglePlayerSelection = useCallback(
        (teamId, playerId, eventType) => {
            setSelectedPlayers((prev) => {
                // Create a copy of the previous state
                const newState = { ...prev };
                
                // If the teamId doesn't exist, initialize it
                if (!newState[teamId]) {
                    newState[teamId] = {};
                }
                
                // Toggle the selection
                newState[teamId][playerId] = !newState[teamId]?.[playerId];
                
                return newState;
            });

            // Auto-select the event type when a player is selected
            if (!selectedEvents[teamId]?.[eventType]) {
                setSelectedEvents((prev) => {
                    const newState = { ...prev };
                    if (!newState[teamId]) {
                        newState[teamId] = {};
                    }
                    if (newState[teamId][eventType] === undefined) {
                        newState[teamId][eventType] = false;
                    }
                    newState[teamId][eventType] = true;
                    return newState;
                });
                
                // Update timestamp for the event type when selected via player
                setSelectionTimestamps(prev => ({
                    ...prev,
                    [`${teamId}-${eventType}`]: Date.now()
                }));
            }
        },
        [selectedEvents]
    );

    // Handle event count hover for player popup
    const handleEventCountHover = useCallback((teamId, eventType, e) => {
        setHoveredEventCount({ teamId, eventType });
        const rect = e.currentTarget.getBoundingClientRect();
        setPopupPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX + rect.width + 0.5, // 0.5px offset to the right
        });
    }, []);

    // Handle action count hover for action popup
    const handleActionCountHover = useCallback((teamId, eventType, e) => {
        setHoveredActionCount({ teamId, eventType });
        const rect = e.currentTarget.getBoundingClientRect();
        setActionPopupPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX + rect.width + 0.5, // 0.5px offset to the right
        });
    }, []);

    // Handle mouse leave from event count badge
    const handleEventCountLeave = useCallback(() => {
        setHoveredEventCount(null);
    }, []);

    // Handle mouse leave from action count badge
    const handleActionCountLeave = useCallback(() => {
        setHoveredActionCount(null);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Space bar for play/pause
            if (e.code === "Space") {
                e.preventDefault();
                setIsPlaying((prev) => !prev);
            }
            // Left arrow for rewind
            else if (e.code === "ArrowLeft") {
                e.preventDefault();
                const newTime = Math.max(0, currentTimeRef.current - 10);
                seekToTime(newTime);
            }
            // Right arrow for forward
            else if (e.code === "ArrowRight") {
                e.preventDefault();
                const newTime = Math.min(duration, currentTimeRef.current + 10);
                seekToTime(newTime);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [duration, seekToTime]);

    // Apply filters - UPDATED to handle action filtering differently
    useEffect(() => {
        const { analysisData } = initialData;

        if (!analysisData?.markers || !Array.isArray(analysisData.markers)) {
            console.warn(
                "No valid markers array found in analysisData:",
                analysisData
            );
            setFilteredEvents([]);
            return;
        }

        let filtered = [...analysisData.markers];

        // Apply event type filters
        Object.entries(selectedEvents).forEach(([teamId, events]) => {
            Object.entries(events).forEach(([eventType, isSelected]) => {
                if (!isSelected) {
                    if (teamId === "no_team") {
                        // Filter events without a team
                        filtered = filtered.filter(
                            (event) =>
                                !(
                                    event.team_id === null &&
                                    event.eventType === eventType
                                )
                        );
                    } else {
                        // Filter events for specific team
                        filtered = filtered.filter(
                            (event) =>
                                !(
                                    event.team_id === parseInt(teamId) &&
                                    event.eventType === eventType
                                )
                        );
                    }
                }
            });
        });

        // Apply player filters if any players are selected
        const hasPlayerFilters = Object.values(selectedPlayers).some(
            (teamPlayers) =>
                teamPlayers &&
                Object.values(teamPlayers).some((selected) => selected)
        );

        if (hasPlayerFilters) {
            // Only filter out events that have players but are not selected
            // Events without players should remain visible
            filtered = filtered.filter((event) => {
                // If event has no player_id, always show it
                if (!event.player_id) return true;

                // If event has a player_id, check if that player is selected
                const teamPlayers = selectedPlayers[event.team_id];
                return teamPlayers && teamPlayers[event.player_id];
            });
        }

        // NEW ACTION FILTERING LOGIC
        // Check if any actions are selected
        const hasSelectedActions = Object.values(selectedActions).some(
            (teamEventTypes) =>
                teamEventTypes &&
                Object.values(teamEventTypes).some(
                    (actions) =>
                        actions &&
                        Object.values(actions).some((selected) => selected)
                )
        );

        if (hasSelectedActions) {
            // First, identify event types with selected actions
            const eventTypesWithSelectedActions = new Set();
            
            Object.entries(selectedActions).forEach(([teamId, eventTypes]) => {
                Object.entries(eventTypes).forEach(([eventType, actions]) => {
                    if (Object.values(actions).some(selected => selected)) {
                        eventTypesWithSelectedActions.add(`${teamId}-${eventType}`);
                    }
                });
            });

            // Apply filtering based on selected actions
            filtered = filtered.filter((event) => {
                const eventKey = `${event.team_id || 'no_team'}-${event.eventType}`;
                
                // If this event type has selected actions
                if (eventTypesWithSelectedActions.has(eventKey)) {
                    // Only show events with selected actions for this event type
                    if (!event.action) return false; // Hide events without actions
                    
                    const teamActions = selectedActions[event.team_id || "no_team"];
                    const eventTypeActions = teamActions?.[event.eventType];
                    
                    // Only show if this specific action is selected
                    return eventTypeActions && eventTypeActions[event.action];
                }
                
                // For event types without selected actions, show all events
                return true;
            });
        }

        // Sort by selection timestamp (most recent first), then by time
        filtered.sort((a, b) => {
            // Get selection timestamps for these events
            const aTimestampKey = `${a.team_id || 'no_team'}-${a.eventType}`;
            const bTimestampKey = `${b.team_id || 'no_team'}-${b.eventType}`;
            
            const aTimestamp = selectionTimestamps[aTimestampKey] || 0;
            const bTimestamp = selectionTimestamps[bTimestampKey] || 0;
            
            // If both events have selection timestamps, sort by most recent first
            if (aTimestamp && bTimestamp) {
                return bTimestamp - aTimestamp; // Descending order (newer first)
            }
            
            // If only one has a timestamp, prioritize it
            if (aTimestamp) return -1;
            if (bTimestamp) return 1;
            
            // If neither has a timestamp, sort by time (ascending)
            return a.time - b.time;
        });

        setFilteredEvents(filtered);
    }, [selectedEvents, selectedPlayers, selectedActions, initialData, selectionTimestamps]);

    // Play event from the exact start time
    const playEvent = useCallback(
        (startTime) => {
            if (videoRef.current && videoUrl) {
                // Set the video to the exact start time of the event
                videoRef.current.currentTime = startTime;

                // Play the video
                videoRef.current
                    .play()
                    .then(() => {
                        setIsPlaying(true);
                        setCurrentTime(startTime);
                        currentTimeRef.current = startTime;
                        setVideoProgress((startTime / duration) * 100);
                    })
                    .catch((error) => {
                        console.error("Error playing video:", error);
                    });
            } else {
                // Fallback if video is not loaded yet
                seekToTime(startTime);
                setIsPlaying(true);
            }
        },
        [videoUrl, duration, seekToTime]
    );

    // Cleanup
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // Handle fullscreen change event
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Always show controls in fullscreen
            if (document.fullscreenElement) {
                setShowControls(true);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    // Get all event types
    const allEventTypes = [
        ...new Set(
            initialData.analysisData.markers?.map(
                (marker) => marker.eventType
            ) || []
        ),
    ];

    // Get events without a team
    const eventsWithoutTeam =
        initialData.analysisData.markers?.filter((marker) => !marker.team_id) ||
        [];

    // Get players for an event type and team
    const getPlayersForEventType = (teamId, eventType) => {
        const markers = initialData.analysisData.markers || [];
        let filteredMarkers = markers.filter((marker) => {
            if (marker.eventType !== eventType) return false;
            if (teamId === "no_team") {
                return marker.team_id === null;
            } else {
                return marker.team_id === parseInt(teamId);
            }
        });

        // Extract unique players
        const playersMap = {};
        filteredMarkers.forEach((marker) => {
            if (marker.player_id && marker.playerName) {
                playersMap[marker.player_id] = {
                    id: marker.player_id,
                    name: marker.playerName,
                    jerseyNo: marker.jerseyNo,
                    teamId: marker.team_id,
                };
            }
            if (marker.assistPlayerId && marker.assistPlayerName) {
                playersMap[marker.assistPlayerId] = {
                    id: marker.assistPlayerId,
                    name: marker.assistPlayerName,
                    jerseyNo: marker.assistJerseyNo,
                    teamId: marker.team_id,
                };
            }
        });

        return Object.values(playersMap);
    };

    // Get actions for an event type and team
    const getActionsForEventType = (teamId, eventType) => {
        const markers = initialData.analysisData.markers || [];
        let filteredMarkers = markers.filter((marker) => {
            if (marker.eventType !== eventType) return false;
            if (teamId === "no_team") {
                return marker.team_id === null;
            } else {
                return marker.team_id === parseInt(teamId);
            }
        });

        // Extract unique actions
        const actionsSet = new Set();
        filteredMarkers.forEach((marker) => {
            if (marker.action) {
                actionsSet.add(marker.action);
            }
        });

        return Array.from(actionsSet);
    };

    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Teams and Events (30% width) */}
                <div className="w-[27%] bg-white border-r border-gray-300 p-4 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Filter Events</h2>

                    {/* Events without team section */}
                    {eventsWithoutTeam.length > 0 && (
                        <div className="mb-6 bg-gray-100 rounded-lg p-3 transition-all duration-300 hover:bg-gray-200">
                            <h3 className="text-md font-semibold mb-2">
                                Events Without Team
                            </h3>
                            <div className="space-y-2">
                                {allEventTypes.map((eventType) => {
                                    // Count events of this type without a team
                                    const eventCount = eventsWithoutTeam.filter(
                                        (marker) =>
                                            marker.eventType === eventType
                                    ).length;

                                    if (eventCount === 0) return null;

                                    return (
                                        <div
                                            key={`no_team-${eventType}`}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`event-no_team-${eventType}`}
                                                    checked={
                                                        selectedEvents
                                                            .no_team?.[
                                                            eventType
                                                        ] || false
                                                    }
                                                    onChange={() =>
                                                        toggleEventSelection(
                                                            "no_team",
                                                            eventType
                                                        )
                                                    }
                                                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                                                />
                                                <label
                                                    htmlFor={`event-no_team-${eventType}`}
                                                    className="text-sm"
                                                >
                                                    {eventType}
                                                </label>
                                            </div>

                                            <div className="flex space-x-2">
                                                <span className="text-xs bg-gray-200 rounded-full px-2 py-1 transition-colors">
                                                        {eventCount}
                                                    </span>
                                                <span
                                                    className="text-xs bg-gray-200 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-300 transition-colors"
                                                    onMouseEnter={(e) =>
                                                        handleActionCountHover(
                                                            "no_team",
                                                            eventType,
                                                            e
                                                        )
                                                    }
                                                    onMouseLeave={
                                                        handleActionCountLeave
                                                    }
                                                >
                                                    Actions
                                                </span>
                                                <span
                                                    className="text-xs bg-gray-200 rounded-full px-2 py-2 cursor-pointer hover:bg-gray-300 transition-colors"
                                                    onMouseEnter={(e) =>
                                                        handleEventCountHover(
                                                            "no_team",
                                                            eventType,
                                                            e
                                                        )
                                                    }
                                                    onMouseLeave={
                                                        handleEventCountLeave
                                                    }
                                                >
                                                    <Users size={15} />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Two rows of teams */}
                    <div className="grid grid-cols-1 gap-4">
                        {teams.map((team) => (
                            <div
                                key={team.id}
                                className="bg-gray-50 rounded-lg p-3 transition-all duration-300 hover:bg-gray-100"
                            >
                                <div className="flex items-center mb-2">
                                    <div
                                        className={`w-4 h-4 rounded-full mr-2 ${
                                            team.team_type === "team1"
                                                ? "bg-red-600"
                                                : "bg-green-600"
                                        }`}
                                    ></div>
                                    <h3 className="text-md font-semibold">
                                        {team.name}
                                    </h3>
                                </div>

                                {/* Event Types */}
                                <div className="space-y-2">
                                    {allEventTypes.map((eventType) => {
                                        // Count events of this type for this team
                                        const eventCount =
                                            initialData.analysisData.markers?.filter(
                                                (marker) =>
                                                    marker.eventType ===
                                                        eventType &&
                                                    marker.team_id === team.id
                                            ).length || 0;

                                        if (eventCount === 0) return null;

                                        return (
                                            <div
                                                key={`${team.id}-${eventType}`}
                                                className="flex items-center justify-between transition-all duration-200 hover:bg-gray-200 hover:rounded"
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`event-${team.id}-${eventType}`}
                                                        checked={
                                                            selectedEvents[
                                                                team.id
                                                            ]?.[eventType] ||
                                                            false
                                                        }
                                                        onChange={() =>
                                                            toggleEventSelection(
                                                                team.id,
                                                                eventType
                                                            )
                                                        }
                                                        className="mr-2 h-4 w-4 text-blue-600 rounded"
                                                    />
                                                    <label
                                                        htmlFor={`event-${team.id}-${eventType}`}
                                                        className="text-sm"
                                                    >
                                                        {eventType}
                                                    </label>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <span className="text-xs bg-gray-200 rounded-full px-2 py-1 transition-colors">
                                                        {eventCount}
                                                    </span>
                                                    <span
                                                        className="text-xs bg-gray-200 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-300 transition-colors"
                                                        onMouseEnter={(e) =>
                                                            handleActionCountHover(
                                                                team.id,
                                                                eventType,
                                                                e
                                                            )
                                                        }
                                                        onMouseLeave={
                                                            handleActionCountLeave
                                                        }
                                                    >
                                                        Actions
                                                    </span>
                                                    <span
                                                        className="text-xs bg-gray-200 rounded-full px-2 py-2 cursor-pointer hover:bg-gray-300 transition-colors"
                                                        onMouseEnter={(e) =>
                                                            handleEventCountHover(
                                                                team.id,
                                                                eventType,
                                                                e
                                                            )
                                                        }
                                                        onMouseLeave={
                                                            handleEventCountLeave
                                                        }
                                                    >
                                                        <Users size={15} />
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Video and Events (70% width) */}
                <div className="w-[73%] flex flex-col">
                    {/* Video Player (60% height - reduced from 70%) */}
                    <div
                        className="video-section h-3/5 bg-black relative"
                        onMouseMove={handleVideoMouseMove}
                        onMouseLeave={() => setShowControls(false)}
                    >
                        {videoUrl ? (
                            <>
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-contain bg-black"
                                    onTimeUpdate={handleVideoTimeUpdate}
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) {
                                            setDuration(
                                                Math.floor(
                                                    videoRef.current.duration
                                                )
                                            );
                                            setCurrentTime(0);
                                            currentTimeRef.current = 0;
                                            setIsVideoLoading(false);
                                            videoRef.current.volume = volume;
                                        }
                                    }}
                                    onLoadStart={() => setIsVideoLoading(true)}
                                    onCanPlay={() => setIsVideoLoading(false)}
                                    onWaiting={() => setIsBuffering(true)}
                                    onPlaying={() => setIsBuffering(false)}
                                    playsInline
                                    preload="auto"
                                />

                                {/* Video Controls */}
                                <div
                                    className={`absolute bottom-4 left-0 right-0 px-4 transition-opacity duration-300 ${
                                        showControls || isFullscreen
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                >
                                    <div
                                        className="h-1 bg-gray-600 bg-opacity-50 rounded-full cursor-pointer relative"
                                        onClick={handleTimelineClick}
                                    >
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                            style={{
                                                width: `${videoProgress}%`,
                                            }}
                                        />
                                        <div
                                            className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                                            style={{
                                                left: `${videoProgress}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-center mt-2 gap-2">
                                        <button
                                            onClick={() => {
                                                const newTime = Math.max(
                                                    0,
                                                    currentTimeRef.current - 10
                                                );
                                                seekToTime(newTime);
                                            }}
                                            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                            title="Rewind 10 seconds"
                                        >
                                            <Rewind size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setIsPlaying(!isPlaying)
                                            }
                                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                            title={isPlaying ? "Pause" : "Play"}
                                        >
                                            {isPlaying ? (
                                                <Pause size={20} />
                                            ) : (
                                                <Play size={20} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newTime = Math.min(
                                                    duration,
                                                    currentTimeRef.current + 10
                                                );
                                                seekToTime(newTime);
                                            }}
                                            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                            title="Forward 10 seconds"
                                        >
                                            <FastForward size={18} />
                                        </button>

                                        {/* Volume Control */}
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={toggleMute}
                                                className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                                                title={
                                                    isMuted ? "Unmute" : "Mute"
                                                }
                                            >
                                                {isMuted ? (
                                                    <VolumeX size={16} />
                                                ) : (
                                                    <Volume2 size={16} />
                                                )}
                                            </button>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={isMuted ? 0 : volume}
                                                onChange={(e) =>
                                                    handleVolumeChange(
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                                style={{
                                                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                                                        (isMuted ? 0 : volume) *
                                                        100
                                                    }%, #6B7280 ${
                                                        (isMuted ? 0 : volume) *
                                                        100
                                                    }%, #6B7280 100%)`,
                                                }}
                                                title="Volume control"
                                            />
                                        </div>

                                        {/* Speed Control */}
                                        <div className="ml-4">
                                            <select
                                                value={playbackSpeed}
                                                onChange={(e) =>
                                                    setPlaybackSpeed(
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="bg-gray-600 text-white rounded px-2 py-1 text-sm"
                                            >
                                                <option value="0.5">
                                                    0.5x
                                                </option>
                                                <option value="1">1x</option>
                                                <option value="2">2x</option>
                                            </select>
                                        </div>

                                        {/* Fullscreen button */}
                                        <button
                                            onClick={toggleFullscreen}
                                            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors ml-4"
                                            title="Fullscreen"
                                        >
                                            <Maximize size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Video overlay info */}
                                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-75 px-4 py-2 rounded-lg">
                                    {videoTitle && (
                                        <div className="text-sm font-semibold mb-1">
                                            {videoTitle}
                                        </div>
                                    )}
                                    <div className="text-lg font-semibold">
                                        {formatTime(currentTime)} /{" "}
                                        {formatTime(duration)}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-green-900">
                                <div className="text-white text-center">
                                    <div className="text-2xl font-bold mb-2">
                                        No Video Available
                                    </div>
                                    <p className="text-gray-300">
                                        Please upload a video to analyze
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Video Loading/Buffering Indicator */}
                        {(isVideoLoading || isBuffering) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Filtered Events Section (40% height - increased from 30%) */}
                    <div className="h-2/5 bg-white border-t border-gray-300 overflow-hidden flex flex-col">
                        {/* Events Table Header */}
                        <div className="grid grid-cols-10 gap-2 p-3 bg-gray-100 border-b border-gray-300 text-xs font-semibold uppercase">
                            <div className="col-span-1">#</div>
                            <div className="col-span-1">Event</div>
                            <div className="col-span-1">Action</div>
                            <div className="col-span-1">Event Start</div>
                            <div className="col-span-1">Event End</div>
                            <div className="col-span-1">Team</div>
                            <div className="col-span-1">Result</div>
                            <div className="col-span-2 pl-20">Player</div>
                            <div className="col-span-1 pl-5">Assist</div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => {
                                    // Check if this event involves any selected player
                                    const hasSelectedPlayer = Object.values(
                                        selectedPlayers
                                    ).some(
                                        (teamPlayers) =>
                                            teamPlayers &&
                                            Object.entries(teamPlayers).some(
                                                ([playerId, selected]) =>
                                                    selected &&
                                                    (event.player_id ===
                                                        parseInt(playerId) ||
                                                        event.assistPlayerId ===
                                                            parseInt(playerId))
                                            )
                                    );

                                    // Check if this event type was recently selected
                                    const eventKey = `${event.team_id || 'no_team'}-${event.eventType}`;
                                    const isRecentlySelected = selectionTimestamps[eventKey] > 0;

                                    return (
                                        <div
                                            key={event.id}
                                            className={`grid grid-cols-10 gap-2 p-3 border-b border-gray-200 transition-all duration-300 ${
                                                index % 2 === 0
                                                    ? "bg-gray-50"
                                                    : "bg-white"
                                            } ${
                                                hasSelectedPlayer
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : ""
                                            } ${
                                                isRecentlySelected && !hasSelectedPlayer
                                                    ? "bg-yellow-50 border-l-4 border-yellow-400"
                                                    : ""
                                            }`}
                                        >
                                            <div className="col-span-1 text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="col-span-1 flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-sm mr-2"
                                                    style={{
                                                        backgroundColor:
                                                            event.color,
                                                    }}
                                                ></div>
                                                <span className="text-sm font-medium">
                                                    {event.eventType}
                                                </span>
                                            </div>
                                            {/* <div className="col-span-1 text-sm">
                                                    {event.action || "-"}
                                                </div> */}

                                            {/* Play button spanning the entire row */}
                                            <div className="col-span-1 flex ">
                                                <button
                                                    onClick={() =>
                                                        playEvent(event.time)
                                                    }
                                                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs flex items-center"
                                                    title="Play event from start"
                                                >
                                                    <Play
                                                        size={12}
                                                        className="mr-1"
                                                    />
                                                    Play
                                                </button>
                                            </div>
                                            <div className="col-span-1 text-sm">
                                                {formatTime(event.time)}
                                            </div>
                                            <div className="col-span-1 text-sm">
                                                {formatTime(event.endTime)}
                                            </div>
                                            <div className="col-span-1 text-sm">
                                                {event.team || "-"}
                                            </div>
                                            <div className="col-span-1 text-sm pr-3">
                                                {event.action === "Goal"
                                                    ? "Goal"
                                                    : event.action === "Foul"
                                                    ? "Foul"
                                                    : event.action || "-"}
                                            </div>
                                            <div className="col-span-2 text-sm text-center">
                                                {event.playerName
                                                    ? `#${event.jerseyNo} ${event.playerName}`
                                                    : "-"}
                                            </div>
                                            <div className="col-span-1 text-sm text-center">
                                                {event.assistPlayerName
                                                    ? `#${event.assistJerseyNo} ${event.assistPlayerName}`
                                                    : "-"}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-gray-500 py-4">
                                    No events match the selected filters
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Popup */}
            {hoveredEventCount && (
                <div
                    className="absolute bg-white shadow-lg rounded-lg p-4 z-10 border border-gray-200 w-64"
                    style={{
                        top: `${popupPosition.top}px`,
                        left: `${popupPosition.left}px`,
                    }}
                    onMouseEnter={() => setHoveredEventCount(hoveredEventCount)} // Keep popup open when hovering over it
                    onMouseLeave={handleEventCountLeave}
                >
                    <h3 className="font-semibold mb-2 text-sm">
                        Players for {hoveredEventCount.eventType}
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {getPlayersForEventType(
                            hoveredEventCount.teamId,
                            hoveredEventCount.eventType
                        ).map((player) => (
                            <div key={player.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`player-popup-${player.id}`}
                                    checked={
                                        selectedPlayers[player.teamId]?.[
                                            player.id
                                        ] || false
                                    }
                                    onChange={() =>
                                        togglePlayerSelection(
                                            player.teamId,
                                            player.id,
                                            hoveredEventCount.eventType
                                        )
                                    }
                                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                                />
                                <label
                                    htmlFor={`player-popup-${player.id}`}
                                    className="text-sm"
                                >
                                    #{player.jerseyNo} {player.name}
                                </label>
                            </div>
                        ))}
                        {getPlayersForEventType(
                            hoveredEventCount.teamId,
                            hoveredEventCount.eventType
                        ).length === 0 && (
                            <p className="text-sm text-gray-500">
                                No players in this event type
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Popup */}
            {hoveredActionCount && (
                <div
                    className="absolute bg-white shadow-lg rounded-lg p-4 z-10 border border-gray-200 w-64"
                    style={{
                        top: `${actionPopupPosition.top}px`,
                        left: `${actionPopupPosition.left}px`,
                    }}
                    onMouseEnter={() =>
                        setHoveredActionCount(hoveredActionCount)
                    } // Keep popup open when hovering over it
                    onMouseLeave={handleActionCountLeave}
                >
                    <h3 className="font-semibold mb-2 text-sm">
                        Actions for {hoveredActionCount.eventType}
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {getActionsForEventType(
                            hoveredActionCount.teamId,
                            hoveredActionCount.eventType
                        ).map((action) => (
                            <div key={action} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`action-popup-${action}`}
                                    checked={
                                        selectedActions[
                                            hoveredActionCount.teamId
                                        ]?.[hoveredActionCount.eventType]?.[
                                            action
                                        ] || false
                                    }
                                    onChange={() =>
                                        toggleActionSelection(
                                            hoveredActionCount.teamId,
                                            hoveredActionCount.eventType,
                                            action
                                        )
                                    }
                                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                                />
                                <label
                                    htmlFor={`action-popup-${action}`}
                                    className="text-sm"
                                >
                                    {action}
                                </label>
                            </div>
                        ))}
                        {getActionsForEventType(
                            hoveredActionCount.teamId,
                            hoveredActionCount.eventType
                        ).length === 0 && (
                            <p className="text-sm text-gray-500">
                                No actions in this event type
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FootballMatchFilter;