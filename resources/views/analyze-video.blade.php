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
    <style>
        .main-body {
            font-family: 'Instrument Sans', sans-serif;
            background-color: black;
        }

        #playBtn,
        #pauseBtn {
            background-color: #21CDFF;
            border-radius: 50%;
        }

        #rewindBtn,
        #forwardBtn {
            color: #21CDFF;
        }
    </style>
</head>

<body class="main-body text-white h-screen">
    <div class="relative h-105">
        <div class="flex justify-end buttonDiv absolute top-0 right-0 z-10">
            <div class="flex space-x-3 py-2 px-2">
                <button class="text-white cursor-pointer ">
                    <i class="fa-solid fa-chart-column "></i>
                    Stats
                </button>
                <button class="text-white cursor-pointer ">
                    <i class="fa-solid fa-clipboard-list"></i>
                    Lineup
                </button>
                <button class="text-white cursor-pointer ">
                    <i class="fa-solid fa-filter"></i>
                    Filter
                </button>
            </div>
        </div>
        <div class="h-85 absolute inset-0">
            <div class="flex justify-center w-full h-105">
                <video src="{{ $video->video_url }}" id="matchVideo" class="w-full max-w-5xl "></video>
                <button id="fullscreenBtn"
                    class="absolute bottom-2 right-2 px-3 py-2 bg-black/70 text-white rounded-lg hover:bg-black">
                    <i class="fa-solid fa-expand"></i>
                </button>
            </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full bg-black/50">
            <div class="flex justify-center gap-2 mt-1">
                <button id="rewindBtn" class="text-2xl">-5
                    <i class="fa-solid fa-backward"></i>
                </button>
                <button id="pauseBtn" class="w-8 h-8  text-white hover:bg-slate-600 transition">
                    <i class="fa-solid fa-pause"></i>

                </button>
                <button id="playBtn" class="w-8 h-8  text-white hover:bg-slate-600 transition">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button id="forwardBtn" class="text-2xl">
                    <i class="fa-solid fa-forward"></i>
                    <span class="">5+</span>
                </button>

            </div>
            <div>

                <div class="w-full max-w-8xl flex items-center gap-2 mx-auto">
                    <span id="currentTime" class="text-white">0:00</span>
                    <input type="range" id="videoTimeline" value="0" min="0" step="0.1"
                        class="w-full h-1">
                    <span id="durationTime" class="text-white">0:00</span>
                </div>
            </div>
        </div>
    </div>
    <div class="flex h-55 bg-blue-500 ">
        <div class="bg-gray-500 w-full border-2 border-gray-800">Hello</div>

        {{-- Events --}}
        <div class="h-full w-190 border-2 border-gray-800">

            <div class="bg-slate-900 top-0">
                <p class="px-2 py-1">Event Type</p>
                <div class="h-full bg-gray-600">
                    <button class="px-4 py-2 border border-slate-900 rounded-md bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-colors duration-300">
                        Click Me
                    </button>
                </div>
            </div>

        </div>
        <div class="bg-gray-500 w-190 border-2 border-gray-800">Hello</div>
    </div>

</body>

</html>
