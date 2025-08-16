@extends('layouts.admin')

@section('adminMain')
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">All In Progress Games</h1>
                <p class="text-slate-600 mt-1 mx-1">Manage Games</p>
            </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                @foreach ($video as $item => $videod)
                    <tbody class="bg-white divide-y divide-slate-100">
                        {{-- Example Row (replace with your actual data loop) --}}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-center">
                                {{ $item + 1 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-center">
                                {{ $videod->id }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                {{ $videod->title }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                {{ $videod->status }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                Not added yet
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
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