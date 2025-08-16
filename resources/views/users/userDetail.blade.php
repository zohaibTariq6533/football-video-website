@extends('layouts.admin')

@section('adminMain')
    <a href="{{ url()->previous() }}"
        class=" mt-5  mx-5 inline-flex items-center px-4 py-2 bg-slate-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Go back
    </a>
    @foreach ($user as $user)
        <div class="min-h-64 bg-slate-50 py-7 px-4 sm:px-6 lg:px-8">
            <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div class="p-8">
                    <!-- User Header Section -->
                    <div class="flex items-center gap-6 mb-3">
                        <!-- User Avatar/Icon -->
                        <div
                            class="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>

                        <!-- User Name & Email -->
                        <div class="flex-grow">
                            <h1 class="text-3xl font-bold text-slate-900 mb-1">{{ $user->user_name }}</h1>
                            <p class="text-slate-600 text-lg">{{ $user->email }}</p>
                        </div>
                    </div>

                    <!-- Video Statistics Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <!-- Total Videos -->
                        <div class="bg-slate-50 rounded-xl p-5 text-center border border-slate-100">
                            <div class="text-3xl font-bold text-slate-900 mb-2">{{ $user->total_videos }}</div>
                            <div class="text-sm font-medium text-slate-600">Total Videos</div>
                        </div>

                        <!-- Completed Videos -->
                        <div class="bg-emerald-50 rounded-xl p-5 text-center border border-emerald-100">
                            <div class="text-3xl font-bold text-emerald-900 mb-2">{{ $user->completed_videos }}</div>
                            <div class="text-sm font-medium text-emerald-700">Completed</div>
                        </div>

                        <!-- In Progress Videos -->
                        <div class="bg-blue-50 rounded-xl p-5 text-center border border-blue-100">
                            <div class="text-3xl font-bold text-blue-900 mb-2">{{ $user->progress_videos }}</div>
                            <div class="text-sm font-medium text-blue-700">In Progress</div>
                        </div>
                    </div>

                    <!-- Video Progress Bar -->
                    @php
                        $progress =
                            $user->total_videos > 0 ? round(($user->completed_videos / $user->total_videos) * 100) : 0;
                    @endphp
                    <div class="mb-8">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium text-slate-700">Video Progress</span>
                            <span class="text-sm font-semibold text-slate-900">{{ $progress }}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-3">
                            <div class="bg-slate-900 h-3 rounded-full transition-all duration-500 ease-out"
                                style="width: {{ $progress }}%"></div>
                        </div>
                    </div>

                    <!-- Joined Date -->
                    <div class="border-t border-slate-100 pt-6 text-right">
                        <p class="text-sm text-slate-500">Joined: <span
                                class="font-medium text-slate-700">{{ \Carbon\Carbon::parse($user->joined)->format('M d, Y') }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    @endforeach
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-800">
                    <tr>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            No.
                        </th>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            Video id
                        </th>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            Name
                        </th>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            Status
                        </th>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            Assigned
                        </th>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                {{-- Table Body will go here --}}
                @foreach ($video as $item => $videod)
                    <tbody class="bg-white divide-y divide-slate-100">
                        {{-- Example Row (replace with your actual data loop) --}}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {{ $item + 1 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                {{ $videod->id }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {{ $videod->title }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {{ $videod->status }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                Not added yet
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href="{{route('videoDetailEdit', ['id'=>$videod->id])}}"
                                    class="px-3 py-1  bg-slate-800 text-white text-sm font-medium rounded-md transition-colors duration-200">View</a>

                            </td>
                        </tr>
                        {{-- End Example Row --}}
                    </tbody>
                @endforeach

            </table>
        </div>
    </div>
@endsection
