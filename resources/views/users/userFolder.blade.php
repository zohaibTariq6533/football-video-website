@extends('layouts.admin')

@section('adminMain')
<div class="min-h-screen bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">User Folders</h1>
                <p class="text-slate-600 mt-1 mx-1">Game Management</p>
            </div>
            <a href="{{route('add-user')}}"
               class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add User
            </a>
        </div>

        <!-- User Folders Grid -->
        @if(!$userData->isEmpty())
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            @foreach ($userData as $user)
            <div class="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
                <div class="p-8">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-8">
                        <div class="flex items-center gap-4">
                            <!-- Team Icon -->
                            <div class="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            
                            <!-- Team Info -->
                            <div>
                                {{-- {{$data->team_name}} --}}
                                <h2 class="text-xl font-semibold text-slate-900 mb-2">{{$user->user_name}}</h2>
                                <div class="w-8 h-0.5 bg-slate-900 rounded-full"></div>
                                {{-- {{ucfirst($data->team_type)}} --}}
                                <span class="text-sm text-slate-500 mt-1"></span>
                            </div>
                        </div>
                        
                        <!-- Team ID -->
                        <span class="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-sm font-medium">
                            {{$user->id}}
                        </span>
                    </div>

                    <!-- Stats Section -->
                    <div class="mb-8">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                </svg>
                            </div>
                            <div>
                                {{-- {{$data->player_count}} --}}
                                <div class="text-2xl font-bold text-slate-900"></div>
                                <div class="text-sm text-slate-500 font-medium">Total Matches: {{$user->total_videos}}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="mb-8">
                        <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span class="text-sm font-medium">Completed Videos: {{ $user->completed_videos }}</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3">
                        <a href="{{route('user-detail', ['id' => $user->id])}}"
                           class="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            View Details
                        </a>
                        
                        
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @else
        <!-- Empty State -->
        <div class="text-center py-20">
            <div class="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            </div>
            {{-- <h3 class="text-xl font-semibold text-slate-900 mb-2">No teams yet</h3>
            <p class="text-slate-500 mb-8 max-w-sm mx-auto">Get started by creating your first team to begin managing players and activities.</p> --}}
            {{-- <a href="{{route('teamPage', ['video_id' => $video_id])}}"
               class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Create Your First Team
            </a> --}}
        </div>
        @endif
    </div>
</div>



@endsection