@extends('layouts.admin')
@section('adminMain')
    <div class="flex gap-10">
        <h2>Select Any two Team</h2>
        <a href="{{ route('teamPage') }}"
            class="px-3 py-1 bg-blue-600 bg-yellow-400 text-black text-sm font-medium rounded-md transition-colors duration-200">Create
            new team</a>
    </div>
    <table class="w-full">
        <thead>
            <tr class="bg-slate-700 text-white">
                <th class="px-4 py-3 text-left font-medium">Team ID</th>
                <th class="px-4 py-3 text-left font-medium">Team Name</th>
                <th class="px-4 py-3 text-left font-medium">Total Players</th>
                <th class="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($teams as $teams)
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                    <td class="px-4 py-3">{{ $teams->team_id }}</td>
                    <td class="px-4 py-3">{{ $teams->team_name }}</td>
                    <td class="px-4 py-3">{{ $teams->player_count }}</td>
                    <td class="px-4 py-3">
                        <div class="flex gap-2">
                            <a href="#"
                                class="px-3 py-1 bg-blue-600 bg-yellow-400 text-black text-sm font-medium rounded-md transition-colors duration-200">Select</a>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
