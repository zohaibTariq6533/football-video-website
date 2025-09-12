<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>

<div class="container-fluid">
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Match Filter</h3>
            <div class="card-tools">
                <a href="{{ route('video.analysis.stats', ['matchId' => $matchId, 'videoId' => $videoId]) }}" class="btn btn-sm btn-info" target="_blank">
                    <i class="fas fa-chart-bar mr-1"></i> Open Stats View
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Filter by Team</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <select class="form-control" id="teamFilter">
                                    <option value="">All Teams</option>
                                    @foreach($filterData['teams'] as $team)
                                    <option value="{{ $team }}">{{ $team }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Filter by Event Type</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <select class="form-control" id="eventTypeFilter">
                                    <option value="">All Event Types</option>
                                    @foreach($filterData['eventTypes'] as $eventType)
                                    <option value="{{ $eventType }}">{{ $eventType }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Filter by Player</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <select class="form-control" id="playerFilter">
                                    <option value="">All Players</option>
                                    @foreach($filterData['players'] as $player)
                                    <option value="{{ $player }}">{{ $player }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Filter by Time</h5>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <select class="form-control" id="timeFilter">
                                    <option value="">All Time</option>
                                    <option value="firstHalf">First Half</option>
                                    <option value="secondHalf">Second Half</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Filtered Events</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-bordered" id="eventsTable">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Event Type</th>
                                            <th>Team</th>
                                            <th>Player</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($filterData['allMarkers'] as $marker)
                                        <tr class="event-row" 
                                            data-team="{{ $marker['team'] }}" 
                                            data-event-type="{{ $marker['eventType'] }}" 
                                            data-player="{{ $marker['playerName'] }}"
                                            data-time="{{ $marker['time'] }}">
                                            <td>{{ gmdate("i:s", $marker['time']) }}</td>
                                            <td>{{ $marker['eventType'] }}</td>
                                            <td>{{ $marker['team'] ?? 'N/A' }}</td>
                                            <td>{{ $marker['playerName'] ?? 'N/A' }}</td>
                                            <td>{{ $marker['action'] ?? 'N/A' }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
$(document).ready(function() {
    // Filter functionality
    function filterEvents() {
        var team = $('#teamFilter').val();
        var eventType = $('#eventTypeFilter').val();
        var player = $('#playerFilter').val();
        var timeRange = $('#timeFilter').val();
        
        $('.event-row').each(function() {
            var row = $(this);
            var show = true;
            
            if (team && row.data('team') !== team) {
                show = false;
            }
            
            if (eventType && row.data('event-type') !== eventType) {
                show = false;
            }
            
            if (player && row.data('player') !== player) {
                show = false;
            }
            
            if (timeRange) {
                var time = parseInt(row.data('time'));
                var range = {{ json_encode($filterData['timeRanges']) }};
                
                if (time < range[timeRange].start || time > range[timeRange].end) {
                    show = false;
                }
            }
            
            if (show) {
                row.show();
            } else {
                row.hide();
            }
        });
    }
    
    $('#teamFilter, #eventTypeFilter, #playerFilter, #timeFilter').on('change', filterEvents);
});
</script>
@endpush
</body>
</html>