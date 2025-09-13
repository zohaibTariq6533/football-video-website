
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>Football Match Filter</title>
    
    <!-- Styles and Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-100 antialiased">
    <div class="container-fluid">
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Match Statistics</h3>
            <div class="card-tools">
                <a href="{{ route('video.analysis.filter', ['videoId' => $videoId]) }}" class="btn btn-sm btn-info" target="_blank">
                    <i class="fas fa-filter mr-1"></i> Open Filter View
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="info-box bg-info">
                        <span class="info-box-icon"><i class="fas fa-futbol"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Total Events</span>
                            <span class="info-box-number">{{ $stats['totalEvents'] }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="info-box bg-success">
                        <span class="info-box-icon"><i class="fas fa-bullseye"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Goals</span>
                            <span class="info-box-number">{{ $stats['goals'] }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="info-box bg-warning">
                        <span class="info-box-icon"><i class="fas fa-crosshairs"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Shots</span>
                            <span class="info-box-number">{{ $stats['shots'] }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="info-box bg-danger">
                        <span class="info-box-icon"><i class="fas fa-exclamation-triangle"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Fouls</span>
                            <span class="info-box-number">{{ $stats['fouls'] }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Events by Type</h5>
                        </div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Event Type</th>
                                        <th>Count</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($stats['eventsByType'] as $type => $count)
                                    <tr>
                                        <td>{{ $type }}</td>
                                        <td>{{ $count }}</td>
                                        <td>{{ round(($count / $stats['totalEvents']) * 100, 1) }}%</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title">Events by Team</h5>
                        </div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Count</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($stats['eventsByTeam'] as $team => $count)
                                    <tr>
                                        <td>{{ $team }}</td>
                                        <td>{{ $count }}</td>
                                        <td>{{ round(($count / $stats['totalEvents']) * 100, 1) }}%</td>
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
</body>
</html>