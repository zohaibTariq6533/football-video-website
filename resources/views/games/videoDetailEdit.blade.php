@extends('layouts.admin')

@section('adminMain')
    @foreach ($video as $video)
        <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="w-full flex justify-between items-center mb-8">
    <!-- Left Button -->
    <a href="{{ url()->previous() }}"
        class="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 border border-slate-200 hover:border-slate-300">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Go Back</span>
    </a>

    <!-- Right Button -->
    <button onclick="confirmDelete('{{ $video->id }}', '{{ $video->title }}')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>Delete Video</span>
    </button>
</div>

            <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div class="p-8">
                    <!-- Header Section -->
                    <div class="flex items-center justify-between mb-8">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-5 4v-4a3 3 0 00-3-3H4a3 3 0 00-3 3v4a3 3 0 003 3h3a3 3 0 003-3z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-3xl font-bold text-slate-900">Edit Video</h1>
                                <p class="text-slate-600 text-lg">{{ $video->title }}</p>
                            </div>
                        </div>
                        <!-- Action Buttons -->
                        <div class="flex gap-3">
                            {{-- UPDATED ASSIGNED TO BUTTON --}}
                            <button onclick="openAssignModal('{{ $video->id }}', '{{ $video->title }}')"
                                class="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-white hover:text-slate-900 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-slate-300">
                                <svg class="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Assigned To</span>
                            </button>
                            {{-- <a href="{{ route('games') }}"
                                                class="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-2 py-1 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl inline-flex items-center justify-center transform hover:scale-105 w-full">
                                                <i class="fas fa-video mr-3 text-xl"></i>
                                                Analyze
                                            </a> --}}
                            <a href="{{route('analyze-video-page',$video->id)}}"  target="_blank"
                                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                <i class="fas fa-video mr-3 text-lg"></i>
                                <span>Analyze Video</span>
                            </a>
                            {{-- <a href="{{route('video.analysis.filter',$video->id)}}"  target="_blank"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                                <span>Filter Video</span>
                            </a> --}}
                            {{-- <button onclick="confirmDelete('{{ $video->id }}', '{{ $video->title }}')"
                                class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete Video</span>
                            </button> --}}
                        </div>
                    </div>
                    <!-- Success/Error Messages -->
                    @if (session('success'))
                        <div
                            class="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p class="text-emerald-800 font-medium">{{ session('success') }}</p>
                            </div>
                            <button onclick="this.parentElement.remove()" class="text-emerald-600 hover:text-emerald-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    @endif
                    @if (session('error'))
                        <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4m0 4h.01" />
                                    </svg>
                                </div>
                                <p class="text-red-800 font-medium">{{ session('error') }}</p>
                            </div>
                            <button onclick="this.parentElement.remove()" class="text-red-600 hover:text-red-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    @endif
                    <!-- Edit Video Form -->
                    <form class="space-y-6" method="POST" action="{{ route('videoUpdate', $video->id) }}">
                        {{-- Replace # with your update route --}}
                        @csrf{{-- Use PUT method for updates --}}
                        <!-- Video Title Field -->
                        <div>
                            <label for="videoTitle" class="block text-sm font-medium text-slate-700 mb-2">Video
                                Title</label>
                            <input type="text" id="videoTitle" name="videoTitle" value="{{ $video->title }}"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 hover:border-slate-400 text-slate-800 placeholder-slate-400">
                            @error('videoTitle')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <!-- Video Status Field -->
                        <div>
                            <label for="videoStatus" class="block text-sm font-medium text-slate-700 mb-2">Change Video
                                Status</label>
                            <select id="videoStatus" name="videoStatus"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 hover:border-slate-400 text-slate-800">
                                <option value="{{ $video->status }}" selected>{{ $video->status }}</option>
                                <option value="{{ $video->status == 'In progress' ? 'Completed' : 'In progress' }}">
                                    {{ $video->status == 'In progress' ? 'Completed' : 'In progress' }}</option>
                            </select>
                            @error('videoStatus')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        <!-- Submit Button -->
                        <div class="pt-4">
                            <button type="submit"
                                class="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                Update Video
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endforeach

    {{-- NEW ASSIGN VIDEO MODAL --}}
    <div id="assignVideoModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 scale-95"
            id="assignModalContent">
            <div class="p-8">
                <div class="text-center">
                    <!-- Icon -->
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    <!-- Modal Content -->
                    <h3 class="text-xl font-semibold text-slate-900 mb-3">Assign Video to Analyzer</h3>
                    <p class="text-slate-600 mb-4">Assign "<strong id="videoTitleToAssign"></strong>" to an analyzer by
                        entering their email.</p>

                    <form id="assignForm" class="space-y-4" method="POST" action="{{ route('users') }}">
                        @csrf
                        <input type="hidden" id="assignVideoId" name="videoId">
                        <div>
                            <label for="analyzerEmail" class="sr-only">Analyzer Email</label>
                            <input type="email" id="analyzerEmail" name="analyzerEmail"
                                placeholder="Enter analyzer's email (e.g., analyzer@example.com)" required
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 hover:border-slate-400 text-slate-800 placeholder-slate-400">
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button type="button" onclick="closeAssignModal()"
                                class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                                Cancel
                            </button>
                            <button type="submit"
                                class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center">
                                Assign
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Video Confirmation Modal -->
    <div id="deleteVideoModal"
        class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 scale-95"
            id="videoModalContent">
            <div class="p-8">
                <div class="text-center">
                    <!-- Warning Icon -->
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <!-- Modal Content -->
                    <h3 class="text-xl font-semibold text-slate-900 mb-3">Delete Video</h3>
                    <p class="text-slate-600 mb-2">Are you sure you want to delete the video "<strong
                            id="videoTitleToDelete"></strong>"?</p>
                    <p class="text-sm text-red-600 mb-6">
                        This action cannot be undone.
                    </p>
                    <!-- Action Buttons -->
                    <div class="flex gap-3">
                        <button onclick="closeDeleteVideoModal()"
                            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                            Cancel
                        </button>
                        <a id="confirmDeleteVideoLink" href="#"
                            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 text-center">
                            Delete Video
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Loading Overlay -->
    <div id="videoLoadingOverlay"
        class="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm hidden items-center justify-center z-40">
        <div class="text-center">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4">
            </div>
            <p class="text-slate-600 font-medium">Processing...</p>
        </div>
    </div>
    <script>
        let currentVideoId = null; // Used for delete modal
        let currentAssignVideoId = null; // Used for assign modal

        // --- Assign Video Modal Functions ---
        function openAssignModal(videoId, videoTitle) {
            currentAssignVideoId = videoId;
            document.getElementById('videoTitleToAssign').textContent = videoTitle;
            document.getElementById('assignVideoId').value = videoId; // Set hidden input for form submission
            document.getElementById('analyzerEmail').value = ''; // Clear previous email

            const modal = document.getElementById('assignVideoModal');
            const modalContent = document.getElementById('assignModalContent');

            modal.classList.remove('hidden');
            modal.classList.add('flex');

            setTimeout(() => {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }, 10);
        }

        function closeAssignModal() {
            const modal = document.getElementById('assignVideoModal');
            const modalContent = document.getElementById('assignModalContent');

            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');

            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                currentAssignVideoId = null;
            }, 200);
        }

        // Handle Assign Form Submission (Placeholder)
        document.getElementById('assignForm').addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission

            const videoId = document.getElementById('assignVideoId').value;
            const analyzerEmail = document.getElementById('analyzerEmail').value;

            // Show loading overlay
            document.getElementById('videoLoadingOverlay').classList.remove('hidden');
            document.getElementById('videoLoadingOverlay').classList.add('flex');
            closeAssignModal(); // Close the assign modal

            // --- IMPORTANT: Replace this with your actual AJAX call or form submission ---
            // Example using fetch API (you'll need to define your backend route for this)
            fetch('/admin/videos/assign', { // Replace with your actual assign route
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute(
                            'content') // If using CSRF token
                    },
                    body: JSON.stringify({
                        video_id: videoId,
                        email: analyzerEmail
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // Handle success response
                    console.log('Video assigned:', data);
                    // You might want to show a success message here
                    // For now, just hide loading and refresh or show a simple alert
                    alert(`Video assigned to ${analyzerEmail}!`);
                })
                .catch(error => {
                    // Handle error response
                    console.error('Error assigning video:', error);
                    // Show an error message
                    alert('Failed to assign video. Please try again.');
                })
                .finally(() => {
                    // Hide loading overlay regardless of success or failure
                    document.getElementById('videoLoadingOverlay').classList.add('hidden');
                    document.getElementById('videoLoadingOverlay').classList.remove('flex');
                });
            // --- END IMPORTANT SECTION ---
        });


        // --- Delete Video Modal Functions (Existing) ---
        function confirmDelete(videoId, videoTitle) {
            currentVideoId = videoId;
            document.getElementById('videoTitleToDelete').textContent = videoTitle;
            // IMPORTANT: Replace '/videos/delete/' with your actual delete video route
            document.getElementById('confirmDeleteVideoLink').href = `/admin/videos/delete/${videoId}`;
            const modal = document.getElementById('deleteVideoModal');
            const modalContent = document.getElementById('videoModalContent');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }, 10);
        }

        function closeDeleteVideoModal() {
            const modal = document.getElementById('deleteVideoModal');
            const modalContent = document.getElementById('videoModalContent');
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                currentVideoId = null;
            }, 200);
        }

        // --- Global Modal Event Listeners ---
        document.getElementById('deleteVideoModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeDeleteVideoModal();
            }
        });

        document.getElementById('assignVideoModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAssignModal();
            }
        });

        // Handle escape key for both modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (currentVideoId) { // If delete modal is open
                    closeDeleteVideoModal();
                }
                if (currentAssignVideoId) { // If assign modal is open
                    closeAssignModal();
                }
            }
        });

        // Show loading overlay when delete is confirmed
        document.getElementById('confirmDeleteVideoLink').addEventListener('click', function() {
            document.getElementById('videoLoadingOverlay').classList.remove('hidden');
            document.getElementById('videoLoadingOverlay').classList.add('flex');
            closeDeleteVideoModal();
        });
    </script>
@endsection
