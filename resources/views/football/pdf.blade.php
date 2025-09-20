<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Match Statistics</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .event-header {
            background-color: #dbeafe !important;
            font-weight: bold;
            text-align: center;
        }
        .possession-row {
            background-color: #f9fafb;
        }
        .total-row {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        .team1 {
            color: #dc2626;
            text-align: center;
        }
        .team2 {
            color: #16a34a;
            text-align: center;
        }
        .total-col {
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Match Statistics</div>
        <div class="subtitle">Video: {{ $video->title ?? 'Match Video' }}</div>
        <div class="subtitle">Generated on: {{ now()->format('F d, Y') }}</div>
    </div>

    @if($teams && count($teams) >= 2)
    <table>
        <thead>
            <tr>
                <th width="40%">Event / Action</th>
                <th width="20%" class="team1">{{ $teams[0]->name }}</th>
                <th width="20%" class="team2">{{ $teams[1]->name }}</th>
                <th width="20%" class="total-col">Total</th>
            </tr>
        </thead>
        <tbody>
            <!-- Possession Row -->
            <tr class="possession-row">
                <td>Possession</td>
                <td class="team1">{{ $stats['possession']['team1'] ?? 0 }}%</td>
                <td class="team2">{{ $stats['possession']['team2'] ?? 0 }}%</td>
                <td class="total-col">100%</td>
            </tr>

            <!-- Event Rows -->
            @foreach($stats['events'] as $eventType => $eventData)
                <!-- Event Type Header Row -->
                <tr>
                    <td colspan="4" class="event-header">{{ $eventType }}</td>
                </tr>

                <!-- Event Actions Rows -->
                @foreach($eventData['actions'] as $action => $actionData)
                    <tr>
                        <td style="padding-left: 20px;">{{ $action }}</td>
                        <td class="team1">{{ $actionData['team1'] ?? 0 }}</td>
                        <td class="team2">{{ $actionData['team2'] ?? 0 }}</td>
                        <td class="total-col">{{ $actionData['total'] ?? 0 }}</td>
                    </tr>
                @endforeach

                <!-- Event Total Row -->
                <tr class="total-row">
                    <td>{{ $eventType }} Total</td>
                    <td class="team1">{{ $eventData['team1'] ?? 0 }}</td>
                    <td class="team2">{{ $eventData['team2'] ?? 0 }}</td>
                    <td class="total-col">{{ $eventData['total'] ?? 0 }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p>No team data available for this video.</p>
    @endif
</body>
</html>