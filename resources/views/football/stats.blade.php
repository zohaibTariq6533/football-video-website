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
<div class="container mx-auto px-4 py-8">
    <div class="mb-6 flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">Match Statistics</h1>
            <p class="text-gray-600 mt-2">Video: {{ $video->title ?? 'Match Video' }}</p>
        </div>
        <div>
            <a href="{{ route('stats.download.pdf', $videoId) }}" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Download PDF
            </a>
        </div>
    </div>

    @if($teams && count($teams) >= 2)
    <div id="statsContent" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                            Event / Action
                        </th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider w-1/5">
                            {{ $teams[0]->name }}
                        </th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-1/5">
                            {{ $teams[1]->name }}
                        </th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <!-- Possession Row -->
                    <tr class="bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Possession
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['possession']['team1'] ?? 0 }}%
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['possession']['team2'] ?? 0 }}%
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            100%
                        </td>
                    </tr>

                    <!-- Event Rows -->
                    @foreach($stats['events'] as $eventType => $eventData)
                        <!-- Event Type Header Row -->
                        <tr class="bg-blue-50">
                            <td colspan="4" class="px-6 py-3 text-sm font-bold text-blue-800">
                                {{ $eventType }}
                            </td>
                        </tr>

                        <!-- Event Actions Rows -->
                        @foreach($eventData['actions'] as $action => $actionData)
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 pl-10">
                                    {{ $action }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {{ $actionData['team1'] ?? 0 }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {{ $actionData['team2'] ?? 0 }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                    {{ $actionData['total'] ?? 0 }}
                                </td>
                            </tr>
                        @endforeach

                        <!-- Event Total Row -->
                        <tr class="bg-gray-100">
                            <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 pl-6">
                                {{ $eventType }} Total
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                {{ $eventData['team1'] ?? 0 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                {{ $eventData['team2'] ?? 0 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                {{ $eventData['total'] ?? 0 }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @else
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <p class="text-gray-700">No team data available for this video.</p>
    </div>
    @endif
</div>
</body>
</html>