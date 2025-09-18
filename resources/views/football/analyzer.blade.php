<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>Football Match Analyzer</title>
    
    <!-- Styles and Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gray-100 antialiased">
    <div class="min-h-screen">

        <!-- Main Content -->
        <main>
            <!-- React Component Mount Point -->
            <div id="football-analyzer" 
                data-video="{{ json_encode($video) }}"
                data-teams="{{ json_encode($teams) }}"
                data-video-id="{{ json_encode($videoId) }}"
                ></div>
        </main>
    </div>
</body>
</html>