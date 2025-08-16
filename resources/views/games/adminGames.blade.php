@extends('layouts.admin')

@section('adminMain')
    <div class="p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">My
                    Games</h1>
                <p class="text-slate-600 mt-1 mx-1">List of my all Games</p>
            </div>
            <a href="{{ route('gamePage') }}"
                class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create new game
            </a>
        </div>
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            @if (Auth::user()->role=='Coache')
            <table class="w-full">
                <thead class="bg-slate-900">
                    <tr class="bg-slate-900 text-white">
                        <th class="px-4 py-3 text-center font-medium text-center align-middle">MN</th>
                        <th class="px-4 py-3 text-center font-sm ">Match ID</th>
                        <th class="px-4 py-3 text-center font-medium">Match Title</th>
                        <th class="px-4 py-3 text-center font-medium">Date of creation</th>
                        <th class="px-4 py-3 text-center font-medium">Analyze Status</th>
                        <th class="px-4 py-3 text-center font-medium">Action</th>
                        <th class="px-4 py-3 text-center font-medium">Edit Lineups</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($game as $index => $game)
                        <tr class="border-b border-gray-200 hover:bg-gray-50">
                            <td class="px-4 py-3  text-center">{{ $index + 1 }}</td>
                            <td class="px-4 py-3 text-center">{{ $game->id }}</td>
                            <td class="px-4 py-3 text-sm text-center">{{ $game->title }}</td>
                            <td class="px-4 py-3 text-center">{{ \Carbon\Carbon::parse($game->created_at)->format('d-m-Y') }}</td>
                            <td class="px-4 py-3 text-center">{{ $game->status }}</td>
                            <td class="px-4 py-3 text-center "><a href="{{ route('games') }}"
                                    class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-1 py-1 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl inline-flex items-center justify-center transform hover:scale-105 w-full">
                                    <i class="fas fa-video mr-3 text-xl"></i>
                                    Analyze
                                </a></td>
                            <td class="px-4 py-3 text-center"><a href="#"><i class="fa-solid fa-pen-to-square text-2xl text-slate-600"></i></a></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>  
            @else
                <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-800">
                    <tr>
                        <th scope="col" class="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">
                            MN.
                        </th>
                        <th scope="col" class="px-6 py-4 text-center text-sm font-semibold text-white tracking-wider">
                            Match id
                        </th>
                        <th scope="col" class="px-6 py-4 text-center text-sm font-semibold text-white tracking-wider">
                            Match Title
                        </th>
                        <th scope="col" class="px-6 py-4 text-center text-sm font-semibold text-white tracking-wider">
                            Status
                        </th>
                        <th scope="col" class="px-6 py-4 text-center text-sm font-semibold text-white tracking-wider">
                            Assigned
                        </th>
                        <th scope="col" class="px-6 py-4 text-center text-sm font-semibold text-white tracking-wider">
                            Actions 
                        </th>
                    </tr>
                </thead>
                {{-- Table Body will go here --}}
                @foreach ($game as $item => $game)
                    <tbody class="bg-white divide-y divide-slate-100">
                        {{-- Example Row (replace with your actual data loop) --}}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-center">
                                {{ $item + 1 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-center">
                                {{ $game->id }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                {{ $game->title }}
                            </td>
                            @if ($game->status=='In progress')
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-center ">
                                {{ $game->status }}
                            </td>
                            @elseif ($game->status=='Completed')
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-center">
                                    {{ $game->status }}
                                </td>
                            @endif
                            
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                Not added yet
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                <a href="{{route('videoDetailEdit', ['id'=>$game->id])}}"
                                    class="px-3 py-1  bg-slate-800 text-white text-sm font-medium rounded-md transition-colors duration-200">View</a>

                            </td>
                        </tr>
                        {{-- End Example Row --}}
                    </tbody>
                @endforeach

            </table>
            @endif
            
            {{-- <div class="my-5">
            {{ $user->links() }}
        </div> --}}
        </div>
    </div>
@endsection
