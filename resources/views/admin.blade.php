@extends('layouts.admin')

@section('adminMain')
<div class="flex items-center justify-center min-h-[60vh] bg-gray-50">
    <div class="relative bg-white border-t-8 border-blue-500 rounded-2xl shadow-xl p-10 w-full max-w-lg text-center">
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-blue-500 drop-shadow-lg" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2 drop-shadow">Welcome to the  Panel</h2> {{Auth::user()->role=='Administrator'? 'Admin,':'Coach'}}
        <p class="text-lg text-gray-700 mb-6">Hello, <span class="text-blue-600 font-semibold"></span>{{ Auth::user()->user_name }}!</p> 
        <p class="text-gray-500">Manage your {{Auth::user()->role=='Administrator'? 'Users,':''}} Games, Analytics, and more from this dashboard.</p> 
    </div>
</div>
@endsection