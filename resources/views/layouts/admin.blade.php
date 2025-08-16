<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FSS</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Styles / Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <!-- Enhanced Sidebar -->
        <div class="w-70 bg-gradient-to-b from-slate-900 to-slate-900 shadow-xl">
            <!-- Header -->
            <div class="p-6 border-b border-slate-700">
                <a href="{{ route('admin') }}" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <i class="fas fa-futbol text-white text-lg"></i>
                    </div>
                    <div>
                        <h1 class="text-white text-xl font-bold">FSS Admin</h1>
                        <p class="text-slate-400 text-sm">Dashboard</p>
                    </div>
                </a>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="mt-6 px-4">
                <div class="space-y-2">
                    <a href="{{ route('dashboard') }}" 
                       class="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200 group">
                        <i class="fas fa-tachometer-alt text-lg group-hover:text-yellow-400 transition-colors"></i>
                        <span class="font-medium">DASHBOARD</span>
                    </a>
                    @if(Auth::user()->role == 'Administrator')
                    <a href="{{ route('users') }}" 
                       class="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200 group">
                        <i class="fas fa-users text-lg group-hover:text-blue-400 transition-colors"></i>
                        <span class="font-medium">USER MANAGEMENT</span>
                    </a>
                    @endif
                    
                    <a href="{{ route('games') }}" 
                       class="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200 group">
                        <i class="fa-solid fa-futbol text-lg group-hover:text-green-400 transition-colors"></i>
                        <span class="font-medium">ALL MATCHES</span>
                    </a>
                    @if (Auth::user()->role == 'Administrator')
                        <a href="{{route('user-folder')}}" 
                       class="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200 group">
                        <i class="fas fa-handshake text-lg group-hover:text-green-400 transition-colors"></i>
                        <span class="font-medium">ALL CLIENTS</span>
                    </a>
                    @endif
                    
                    
                    
                </div>
                
                <!-- Divider -->
                <div class="border-t border-slate-700 my-6"></div>
                
                <!-- Logout Section -->
                <div class="space-y-2">
                    <a href="{{ route('logout') }}" 
                       class="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-200 group">
                        <i class="fas fa-sign-out-alt text-lg"></i>
                        <span class="font-medium">LOGOUT</span>
                    </a>
                </div>
            </nav>
            
            <!-- Footer -->
            <div class="absolute bottom-0 w-64 p-4 border-t border-slate-700">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-slate-300 text-sm"></i>
                    </div>
                    <div>
                        <p class="text-slate-300 text-sm font-medium">{{Auth::user()->role=='Administrator'? 'Admin ': 'Coach'}}</p>
                        
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Main Content Area -->
        <div class="flex-1 bg-gray-50 overflow-auto">
            @yield('adminMain')
        </div>
    </div>
</body>
</html>
