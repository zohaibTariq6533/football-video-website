@extends('layouts.admin')

@section('adminMain')
<div class="flex items-center justify-center min-h-[60vh]">
    <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Log Out</h2>
        <p class="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
        <a href="{{ route('logoutUser') }}"
           class="inline-block bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 shadow">
            Log Out
        </a>
    </div>
</div>
@endsection