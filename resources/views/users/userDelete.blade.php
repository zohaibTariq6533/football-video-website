@extends('layouts.admin')

@section('adminMain')
    <div class="p-6">
        <div class="max-w-lg mx-auto">
            <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                @if ($user)
                    <h1 class="text-2xl font-semibold text-green-600 mb-4">User Deleted Successfully</h1>
                    <p class="text-gray-600 mb-6">The user was successfully removed from the system.</p>
                @else
                    <h1 class="text-2xl font-semibold text-red-600 mb-4">User Not Deleted</h1>
                    <p class="text-gray-600 mb-6">There was a problem deleting the user. Please try again.</p>
                @endif
                <a href="{{ url()->previous() }}"
                    class="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200">&larr;
                    Back</a>
            </div>
        </div>
    </div>
@endsection
