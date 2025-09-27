<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>Football Match Statistics</title>
    
    <!-- Styles and Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-100 antialiased">
<div class="container mx-auto px-4 py-8">
    <div class="mb-6 ">
        <div class="flex justify-between items-center flex-col">
            <h1 class="text-3xl font-bold text-gray-800">Match Statistics</h1>
            <p class="text-gray-600 mt-2">Video: {{ $video->title ?? 'Match Video' }}</p>
        </div>
        {{-- <div>
            <a href="{{ route('stats.download.pdf', $videoId) }}" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
                Download PDF
            </a>
        </div> --}}
    </div>

    @if($teams && count($teams) >= 2)
    <div id="statsContent" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider w-1/5">
                            {{ $teams[0]->name }}
                        </th>
                        <th scope="col" class="  px-6 py-3 text-left text-lg font-bold text-gray-500 uppercase tracking-wider w-2/5">
                            <p class="text-center">Event / Action</p>
                        </th>
                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider w-1/5">
                            {{ $teams[1]->name }}
                        </th>
                        {{-- <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider w-1/5">
                            Total
                        </th> --}}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <!-- Possession Row -->
                    <tr class="bg-blue-50">
                        
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['possession']['team1'] ?? 0 }}%
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-lg  text-blue-800 font-bold">
                           <p class="text-center">Possession</p> 
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['possession']['team2'] ?? 0 }}%
                        </td>
                        {{-- <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            100%
                        </td> --}}
                    </tr>

                    <!-- Period Row -->
                    {{-- <tr class="bg-gray-50">
                        
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['period']['team1'] ?? 0 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <p class="text-center">Period</p> 
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ $stats['period']['team2'] ?? 0 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {{ ($stats['period']['team1'] ?? 0) + ($stats['period']['team2'] ?? 0) }}
                        </td>
                    </tr> --}}

                    <!-- Event Rows -->
                    @foreach($stats['events'] as $eventType => $eventData)
                        <!-- Skip Transition events -->
                        @if($eventType !== 'Transition')
                            <!-- Event Type Header Row -->
                            <tr class="bg-blue-50">
                                <td colspan="4" class="px-6 py-3 text-lg font-bold text-blue-800 ">
                                   <p class="text-center">{{ $eventType }}</p> 
                                </td>
                            </tr>

                            <!-- Event Actions Rows -->
                            @if($eventType === 'Shot')
                                <!-- On Target Row (Goal + Save) -->
                                <tr>
                                    
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Goal']['team1'] ?? 0) + ($eventData['actions']['Save']['team1'] ?? 0) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 ">
                                        <p class="text-center">On Target</p> 
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Goal']['team2'] ?? 0) + ($eventData['actions']['Save']['team2'] ?? 0) }}
                                    </td>
                                    {{-- <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Goal']['total'] ?? 0) + ($eventData['actions']['Save']['total'] ?? 0) }}
                                    </td> --}}
                                </tr>
                                
                                <!-- Off Target Row (Wide + Blocked) -->
                                <tr>
                                    
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Wide']['team1'] ?? 0) + ($eventData['actions']['Blocked']['team1'] ?? 0) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 ">
                                         <p class="text-center">Off Target</p> 
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Wide']['team2'] ?? 0) + ($eventData['actions']['Blocked']['team2'] ?? 0) }}
                                    </td>
                                    {{-- <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                        {{ ($eventData['actions']['Wide']['total'] ?? 0) + ($eventData['actions']['Blocked']['total'] ?? 0) }}
                                    </td> --}}
                                </tr>
                            @else
                                <!-- For other event types, show all actions -->
                                @foreach($eventData['actions'] as $action => $actionData)
                                    <tr>
                                        
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {{ $actionData['team1'] ?? 0 }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 ">
                                            <p class="text-center">{{ $action }}</p> 
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {{ $actionData['team2'] ?? 0 }}
                                        </td>
                                        {{-- <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                            {{ $actionData['total'] ?? 0 }}
                                        </td> --}}
                                    </tr>
                                @endforeach
                            @endif

                            <!-- Event Total Row -->
                            <tr>
                                
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                    {{ $eventData['team1'] ?? 0 }}
                                </td>
                                <td class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 ">
                                      <p class="text-center">{{ $eventType }} Total</p> 
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                    {{ $eventData['team2'] ?? 0 }}
                                </td>
                                {{-- <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-gray-900">
                                    {{ $eventData['total'] ?? 0 }}
                                </td> --}}
                            </tr>
                        @endif
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