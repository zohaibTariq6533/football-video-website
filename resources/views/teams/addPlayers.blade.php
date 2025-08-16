@extends('layouts.admin')

@section('adminMain')
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center space-x-3 mb-2">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i class="fas fa-user-plus text-white text-lg"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">Add Team Players</h1>
            </div>
            <p class="text-gray-600 ml-13">Add 9 players to your team with their details</p>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <form method="POST" action="{{ route('createPlayers') }}" class="p-8">
                @csrf
                
                <!-- Team Selection -->
                <div class="mb-8">
                    <label for="team_id" class="block text-sm font-semibold text-gray-700 mb-3">
                        <i class="fas fa-users text-blue-500 mr-2"></i>
                        Select Team
                    </label>
                    <div class="relative">
                        <select 
                            id="team_id" 
                            name="team_id" 
                            required
                            class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 bg-gray-50 hover:bg-white focus:bg-white"
                        >
                            <option value="">Select a team...</option>
                            {{-- @foreach($teams as $team)
                                <option value="{{ $team->id }}">{{ $team->name }}</option>
                            @endforeach --}}
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                            <i class="fas fa-chevron-down text-gray-400"></i>
                        </div>
                    </div>
                    @error('team_id')
                        <p class="mt-2 text-sm text-red-600 flex items-center">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            {{ $message }}
                        </p>
                    @enderror
                </div>

                <!-- Players Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    @for($i = 1; $i <= 9; $i++)
                    <div class="bg-gray-50 rounded-xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-all duration-200">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">Player {{ $i }}</h3>
                            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-bold">{{ $i }}</span>
                            </div>
                        </div>

                        <!-- Player Name -->
                        <div class="mb-4">
                            <label for="player_name_{{ $i }}" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-user text-purple-500 mr-1"></i>
                                Name
                            </label>
                            <input 
                                type="text" 
                                id="player_name_{{ $i }}" 
                                name="players[{{ $i }}][name]" 
                                required
                                placeholder="Player name..."
                                class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white"
                            >
                            @error("players.{$i}.name")
                                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Position -->
                        <div class="mb-4">
                            <label for="player_position_{{ $i }}" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-map-marker-alt text-blue-500 mr-1"></i>
                                Position
                            </label>
                            <select 
                                id="player_position_{{ $i }}" 
                                name="players[{{ $i }}][position]" 
                                required
                                class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-gray-800 bg-white"
                            >
                                <option value="">Select position...</option>
                                <option value="Goalkeeper">Goalkeeper</option>
                                <option value="Defender">Defender</option>
                                <option value="Midfielder">Midfielder</option>
                                <option value="Forward">Forward</option>
                                <option value="Striker">Striker</option>
                            </select>
                            @error("players.{$i}.position")
                                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- Jersey Number -->
                        <div class="mb-2">
                            <label for="player_jersey_{{ $i }}" class="block text-sm font-medium text-gray-700 mb-2">
                                <i class="fas fa-tshirt text-green-500 mr-1"></i>
                                Jersey #
                            </label>
                            <input 
                                type="number" 
                                id="player_jersey_{{ $i }}" 
                                name="players[{{ $i }}][jersey_number]" 
                                required
                                min="1"
                                max="99"
                                placeholder="1-99"
                                class="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white"
                            >
                            @error("players.{$i}.jersey_number")
                                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                            @enderror
                        </div>
                    </div>
                    @endfor
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                    <a href="{{ url()->previous() }}" 
                       class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                        <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        <span class="font-medium">Cancel</span>
                    </a>
                    
                    <button type="submit" 
                            class="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        <i class="fas fa-save"></i>
                        <span>Add All Players</span>
                    </button>
                </div>
            </form>
        </div>

        <!-- Success Message -->
        @if(session('success'))
            <div class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-white text-sm"></i>
                </div>
                <p class="text-green-800 font-medium">{{ session('success') }}</p>
            </div>
        @endif

        <!-- Info Card -->
        <div class="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div class="flex items-start space-x-3">
                <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fas fa-info text-white text-xs"></i>
                </div>
                <div>
                    <h3 class="text-purple-800 font-semibold text-sm mb-1">Player Information</h3>
                    <p class="text-purple-700 text-sm">Add 9 players to your team. Each player needs a name, position, and unique jersey number (1-99).</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection