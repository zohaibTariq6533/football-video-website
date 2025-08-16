@extends('Layouts.public')

@section('main')
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <!-- Background stars effect -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="stars"></div>
        </div>

        <!-- Login Form Container -->
        <div class="relative z-10 w-full max-w-md mx-4">
            <div class="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                <!-- Title -->
                <h1 class="text-3xl font-bold text-white text-center mb-8">Login</h1>

                <!-- Login Form -->
                <form class="space-y-6" method="POST" action="{{ route('loginUser') }}">
                    @csrf
                    <!-- Email Field -->
                    <div class="relative">
                        <input type="email" placeholder="Email" autocomplete="off" name="email" value="{{ old('email') }}"
                            class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300">
                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg class="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Password Field -->
                    <div class="relative">
                        <input type="password" placeholder="Password" autocomplete="off" name="password" value="{{ old('password') }}"
                            class="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300">
                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg class="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Remember Me and Forgot Password -->
                    <div class="flex items-center justify-between text-sm">
                        {{-- <label class="flex items-center text-white/90 cursor-pointer">
                            <input type="checkbox"
                                class="mr-2 w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2">
                            Remember me
                        </label> --}}
                        <a href="#" class="text-white/90 hover:text-white transition-colors duration-200">Forgot
                            password?</a>
                    </div>

                    <!-- Login Button -->
                    <button type="submit"
                        class="w-full bg-white text-blue-900 font-semibold py-3 px-6 rounded-full hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg">
                        Login
                    </button>


                </form>
            </div>
            @if ($errors->any())
                <div class="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                        </svg>
                        <div>
                            <h3 class="text-sm font-medium text-red-200 mb-1">Please fix the following errors:</h3>
                            <ul class="text-sm text-red-100 space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li class="flex items-center">
                                        <span class="w-1 h-1 bg-red-300 rounded-full mr-2"></span>
                                        {{ $error }}
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <style>
        .stars {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image:
                radial-gradient(2px 2px at 20px 30px, #ffffff, transparent),
                radial-gradient(2px 2px at 40px 70px, #ffffff, transparent),
                radial-gradient(1px 1px at 90px 40px, #ffffff, transparent),
                radial-gradient(1px 1px at 130px 80px, #ffffff, transparent),
                radial-gradient(2px 2px at 160px 30px, #ffffff, transparent);
            background-repeat: repeat;
            background-size: 200px 100px;
            animation: sparkle 4s linear infinite;
        }

        @keyframes sparkle {
            0% {
                transform: translateY(0px);
            }

            100% {
                transform: translateY(-100px);
            }
        }

        /* Additional stars for more density */
        .stars::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background-image:
                radial-gradient(1px 1px at 60px 20px, #ffffff, transparent),
                radial-gradient(2px 2px at 100px 60px, #ffffff, transparent),
                radial-gradient(1px 1px at 140px 10px, #ffffff, transparent),
                radial-gradient(1px 1px at 180px 50px, #ffffff, transparent),
                radial-gradient(2px 2px at 220px 80px, #ffffff, transparent);
            background-repeat: repeat;
            background-size: 200px 100px;
            animation: sparkle 6s linear infinite reverse;
        }
    </style>
@endsection
