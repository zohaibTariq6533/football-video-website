@extends('layouts.admin')
@section('adminMain')
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
            <div class="mb-4 sm:mb-0 mx-3">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">Dashboard</h1>
                {{-- <p class="text-slate-600 mt-1 mx-1">Game Management</p> --}}
            </div>
        </div>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div class="container mx-auto px-6 py-8 max-w-6xl">
            <!-- Enhanced Header -->
            {{-- <div class="text-center mb-16">
                <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mb-6 shadow-lg">
                    <i class="fas fa-futbol text-white text-3xl"></i>
                </div>
                <h1 class="text-5xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-4">Game Manager</h1>
                <p class="text-slate-600 text-xl font-medium">Create and manage your football games with precision</p>
            </div> --}}

            <!-- Minimalist Grid Button Section -->
            <div class=" mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto justify-center">
                    <!-- Create Game Button - Blue -->
                    <div class="relative group">
                        <div
                            class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300">
                        </div>
                        <a href="{{ route('gamePage') }}"
                            class="relative bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl border border-white/20 backdrop-blur-sm h-[160px] flex flex-col items-center justify-center">
                            <div class="bg-white/20 p-3 rounded-full mb-4 backdrop-blur-sm border border-white/20">
                                <i class="fas fa-plus text-white text-xl"></i>
                            </div>
                            <span class="font-bold text-lg">Create Game</span>
                            <span class="text-blue-100 text-sm mt-1">New Match</span>
                        </a>
                    </div>

                    <!-- Total Games Button -->
                    @if (Auth::user()->role == 'Administrator')
                        <div class="relative group">
                            <div
                                class="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300">
                            </div>
                            <a href="{{route('user-folder')}}"
                                class="relative bg-white/95 backdrop-blur-sm border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl h-[160px] flex flex-col items-center justify-center">
                                <div class="bg-emerald-100 p-3 rounded-full mb-4">
                                    <i class="fas fa-chart-line text-emerald-600 text-xl"></i>
                                </div>
                                <span class="font-bold text-lg">User Folders</span>
                            </a>
                        </div>
                    @endif

                    <!-- Draft Games Button -->
                    <div class="relative group">
                        <div
                            class="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300">
                        </div>
                        <a href="{{ (Auth::user()->role == 'Coache') ? route('games') : route('progressGame')  }}"
                            class="relative bg-white/95 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 hover:bg-orange-50 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl h-[160px] flex flex-col items-center justify-center">
                            <div class="bg-orange-100 p-3 rounded-full mb-4">
                                <i class="fas fa-video text-orange-600 text-xl"></i>
                            </div>
                            <span class="font-bold text-lg">{{(Auth::user()->role=='Coache') ? 'My Games' : 'In Progress Games'}}</span>
                            {{-- <span class="text-orange-600 text-sm mt-1">In Progress</span> --}}
                        </a>
                    </div>

                    <!-- Completed Games Button -->
                    @if (Auth::user()->role == 'Administrator')
                        <div class="relative group">
                            <div
                                class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300">
                            </div>
                            <a href="{{ route('add-user') }}"
                                class="relative bg-white/95 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 hover:bg-purple-50 p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-2xl h-[160px] flex flex-col items-center justify-center">
                                <div class="bg-purple-100 p-3 rounded-full mb-4">
                                    <i class="fas fa-user text-purple-600 text-xl"></i>
                                </div>
                                <span class="font-bold text-lg">Create User</span>
                                {{-- <span class="text-purple-600 text-sm mt-1">Finished Games</span> --}}
                            </a>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Horizontal Game Info Card -->
            <div class="mb-12">
                <div class="flex justify-between items-center mb-4">
                    <h2
                        class="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                        Most Recent Games</h2>
                    <a href="{{ route('games') }}"
                        class="bg-white/80 backdrop-blur-sm text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-xl px-6 py-3 text-lg font-semibold rounded-2xl group transition-all duration-300 inline-flex items-center border border-slate-200 hover:border-slate-300 transform hover:scale-105">
                        View All Games Detail
                        <i
                            class="fas fa-arrow-right ml-3 text-lg group-hover:translate-x-2 transition-transform duration-300"></i>
                    </a>

                </div>
                @if ($recentGame->isEmpty())
                    <div class="text-center text-gray-500">No recent games available.</div>
                @else
                    @foreach ($recentGame as $game)
                        <div class="flex justify-center">
                            <div
                                class="w-full max-w-5xl shadow-2xl border-0 bg-white rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                                <div class="flex flex-col lg:flex-row">
                                    <!-- Left Side - Game Info -->
                                    <div class="flex-1 p-8">
                                        <div class="flex items-center mb-6">
                                            <div
                                                class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mr-6 shadow-lg">
                                                <i class="fas fa-futbol text-white text-xl"></i>
                                            </div>
                                            <div>
                                                <h3 class="text-3xl font-bold text-slate-800 mb-2">{{ $game->title }}</h3>
                                                <div
                                                    class="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex items-center mb-6">
                                            <div
                                                class="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full mr-6 border border-blue-200">
                                                <i class="fas fa-users text-blue-600 text-xl"></i>
                                            </div>
                                            <div>
                                                <p class="text-3xl font-bold text-slate-800">{{ $game->total_players }}</p>
                                                <p class="text-slate-600 text-lg font-medium">Total Players</p>
                                            </div>
                                        </div>

                                        <div
                                            class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 inline-flex items-center">
                                            <div class="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                                            <p class="text-grey-500 font-semibold">Status: {{ $game->status }}</p>
                                        </div>
                                    </div>

                                    <!-- Right Side - Action Buttons -->
                                    <div
                                        class="lg:w-80 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-100 p-8 flex flex-col justify-center">
                                        <div class="space-y-4">
                                            <a href="{{ route('video.analysis.stats', $game->id) }}" target="_blank"
                                                class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl inline-flex items-center justify-center transform hover:scale-105 w-full">
                                                <i class="fas fa-chart-line mr-3 text-xl"></i>
                                                Show Statistics
                                            </a>
                                            <a href="{{route('analyze-video-page',$game->id)}}" target="_blank"
                                                class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl inline-flex items-center justify-center transform hover:scale-105 w-full">
                                                <i class="fas fa-video mr-3 text-xl"></i>
                                                Analyze Video
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @endif
            </div>
        </div>
    </div>
@endsection
