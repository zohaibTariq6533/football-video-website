@extends('layouts.admin')

@section('adminMain')
<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
    <div class="max-w-2xl mx-auto text-center">
        <!-- Success Icon -->
        <div class="mb-8">
            <div class="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <i class="fas fa-check text-white text-4xl"></i>
            </div>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
             {{$video->title}}
        </h1>

        <!-- Message -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-video text-white text-2xl"></i>
                </div>
            </div>
            
            <p class="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
                Your game is created
            </p>
            
            <!-- Optional Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <a href="{{route('games')}}" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <i class="fas fa-play mr-2"></i>
                    View Game
                </a>
                
                <a href="{{route('dashboard')}}" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                    <i class="fas fa-home mr-2"></i>
                    Go to Dashboard
                </a>
            </div>
        </div>

        <!-- Decorative Elements -->
        <div class="mt-12 flex justify-center space-x-4">
            <div class="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
    </div>
</div>
@endsection
