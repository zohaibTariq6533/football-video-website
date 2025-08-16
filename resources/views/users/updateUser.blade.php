@extends('layouts.admin')

@section('adminMain')
<div class="p-6">
    <a href="{{url()->previous()}}"> <- Go Back</a>
    <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Update User</h2>
           
                
            @foreach ($user as $id=>$user)
            <form class="space-y-4" method="POST" action="{{route('updateUser',$user->id)}}"> 
                @csrf
                <!-- Username Field -->
                
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        value="{{$user->user_name}}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        
                    >
                </div>
                
                <!-- Email Field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        value="{{$user->email}}"
                    >
                </div>
                
                <!-- Password Field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input 
                        type="text" 
                        id="password" 
                        name="password" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        {{-- value="{{$user->password}}" --}}
                        placeholder="Leave blank to keep old password"
                    >
                </div>
                
                <!-- Role Field -->
                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select 
                        id="role" 
                        name="role" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    >
                        <option value="Administrator" {{ $user->role == 'Administrator' ? 'selected' : '' }}>Administrator</option>
                        <option value="Coache" {{ $user->role == 'Coache' ? 'selected' : '' }}>Coache</option>
                        <option value="Analyzer" {{ $user->role == 'Analyzer' ? 'selected' : '' }}>Analyzer</option>
                    </select>
                    
                </div>
                
                <!-- Submit Button -->
                <div class="pt-4">
                    <button 
                        type="submit" 
                        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                    >
                        Update User
                    </button>
                </div>
                @endforeach
            </form>
        </div>
    </div>
</div>
@endsection