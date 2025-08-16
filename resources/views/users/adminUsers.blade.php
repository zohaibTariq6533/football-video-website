@extends('layouts.admin')

@section('adminMain')

<div class="p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">All Users</h1>
                <p class="text-slate-600 mt-1 mx-1">Manage Users</p>
            </div>
            <a href="{{route('add-user')}}"
               class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add User
            </a>
        </div>
    {{-- <a href="{{route('add-user')}}" class="flex justify-end mb-4">Add new user</a> --}}
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        
        <table class="w-full">
            <thead>
                <tr class="bg-slate-700 text-white">
                    <th class="px-4 py-3 text-left font-medium">User Name</th>
                    <th class="px-4 py-3 text-left font-medium">Email</th>
                    <th class="px-4 py-3 text-left font-medium">Role</th>
                    <th class="px-4 py-3 text-left font-medium">Joined</th>
                    <th class="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($user as $id=>$data)
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                        <td class="px-4 py-3">{{ $data->user_name }}</td>
                        <td class="px-4 py-3">{{ $data->email }}</td>
                        <td class="px-4 py-3">{{ $data->role }}</td>
                        <td class="px-4 py-3">{{ \Carbon\Carbon::parse($data->created_at)->format('d-m-Y') }}</td>
                        <td class="px-4 py-3">
                            <div class="flex gap-2">
                                <a href="{{route('showUpdateUser',$data->id)}}" class="px-3 py-1 bg-blue-600 bg-yellow-400 text-black text-sm font-medium rounded-md transition-colors duration-200">Edit</a>
                                <a href="{{route('delete-user',$data->id)}}" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors duration-200">Delete</a>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <div class="my-5">
            {{ $user->links() }}
        </div>
    </div>
</div>
@endsection