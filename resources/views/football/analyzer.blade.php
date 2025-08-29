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
        <!-- Header -->
        {{-- <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <h1 class="text-2xl font-bold text-gray-900">Football Match Analyzer</h1>
                    <div class="text-sm text-gray-500">
                        
                    </div>
                </div>
            </div>
        </header> --}}

        <!-- Main Content -->
        <main>
            <!-- React Component Mount Point -->
            <div id="football-analyzer" data-video='@json($video)'></div>
        </main>
        {{-- <script>
            window.videoData = @json($video);
        </script>
        <script src="{{ mix('js/app.js') }}"></script>  --}}
    </div>
</body>
</html>