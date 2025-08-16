<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FSS</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>

<body class="bg-gray-100 font-[Instrument_Sans]">
    <div class="max-w-5xl mx-auto px-4 py-5 text-center flex justify-center flex-col items-center">
        <h1 class="text-3xl font-semibold text-gray-800">Analyze Videos</h1>

        <div class="w-full max-w-3xl flex justify-between mb-1">
            <div class="flex item-center">
                <h3 class="text-lg font-medium text-gray-600">{{ $video->title }}</h3>
            </div>
            <div class="flex space-x-1">
                <button class="px-5 py-2 bg-slate-900 text-white font-medium rounded-3xl hover:bg-slate-600 transition">
                    Stats
                </button>
                <button class="px-5 py-2 bg-slate-900 text-white font-medium rounded-3xl hover:bg-slate-600 transition">
                    Lineup
                </button>
                <button class="px-5 py-2 bg-slate-900 text-white font-medium rounded-3xl hover:bg-slate-600 transition">
                    Filter
                </button>
            </div>

        </div>
        <div class="flex justify-center w-full">
            <video src="{{ $video->video_url }}" id="matchVideo"
                class="w-full max-w-3xl h-[280px] rounded-lg shadow-lg object-cover"></video>
        </div>
        <div class="w-full max-w-2xl mt-2 flex items-center gap-2">
            <span id="currentTime">0:00</span>
            <input type="range" id="videoTimeline" value="0" min="0" step="0.1" class="w-full">
            <span id="durationTime">0:00</span>
        </div>
        <div class="flex justify-center mt-4 gap-2">
            <button id="rewindBtn" class="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-600 transition">« 5s</button>
            <button id="playBtn" class="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-600 transition">Play</button>
            {{-- <button id="pauseBtn" class="px-4 py-2 bg-red-600 text-white rounded">Pause</button> --}}

            <button id="forwardBtn" class="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-600 transition">5s »</button>
        </div>
    </div>
</body>

</html>
