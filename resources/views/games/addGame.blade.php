@extends('layouts.admin')
@section('adminMain')
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- Elegant Header -->
            <div class="mb-6">
                <div class="flex items-center justify-center space-x-5 mb-6">
                    <div
                        class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 group hover:shadow-xl transition-all duration-300">
                        <i
                            class="fas fa-video text-xl text-blue-600 group-hover:scale-110 transition-transform duration-300"></i>
                    </div>
                    <div class="text-left">
                        <h1 class="text-3xl font-light text-gray-800 mb-1">
                            Add New Video
                        </h1>
                        <p class="text-base text-gray-500">
                            Create something amazing
                        </p>
                    </div>
                </div>
                <!-- Centered decorative line -->
                <div class="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            </div>

            <!-- Beautiful Form Card -->
            <div
                class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div class="p-8 lg:p-10">
                    <form method="POST" action="{{ route('createGamefuntion') }}" class="space-y-8"
                        enctype="multipart/form-data" id="videoForm">
                        @csrf
                        
                        <!-- Video Title Field -->
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                <div>
                                    <label class="text-lg font-medium text-gray-800">Video Title</label>
                                    <p class="text-sm text-gray-500">Team A Name / Team B Name // Coach Name</p>
                                </div>
                            </div>
                            <div class="relative group">
                                <input type="text" id="title" name="title" required
                                    placeholder="Team A Name / Team B Name // Coach Name"
                                    value="{{ old('title') }}"
                                    class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:border-gray-300">
                                <div class="absolute inset-y-0 right-0 flex items-center pr-6">
                                    <div
                                        class="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                                    </div>
                                </div>
                            </div>
                            @error('title')
                                <div
                                    class="flex items-center space-x-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                    <i class="fas fa-exclamation-circle text-sm"></i>
                                    <span class="text-sm">{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <!-- Video Upload Field -->
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                                <label class="text-lg font-medium text-gray-800">Upload Video</label>
                            </div>
                            
                            <!-- File Upload Area -->
                            <div class="relative group">
                                <label for="video_url" id="uploadLabel"
                                    class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all duration-300 group">
                                    <div class="flex flex-col items-center justify-center pt-5 pb-6" id="uploadContent">
                                        <div
                                            class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                                            <i class="fas fa-cloud-upload-alt text-blue-600 text-xl"></i>
                                        </div>
                                        <p class="mb-2 text-lg font-medium text-gray-700">
                                            Drop your video here
                                        </p>
                                        <p class="text-sm text-gray-500 mb-3">or click to browse</p>
                                        <div class="flex items-center space-x-2 text-xs text-gray-400">
                                            <span class="px-3 py-1 bg-white rounded-full border">MP4</span>
                                            <span class="px-3 py-1 bg-white rounded-full border">AVI</span>
                                            <span class="px-3 py-1 bg-white rounded-full border">MOV</span>
                                            <span>• Max 1GB</span>
                                        </div>
                                    </div>
                                </label>
                                
                                <!-- Hidden file input -->
                                <input type="file" id="video_url" name="video_url" accept="video/*" required
                                    class="hidden">
                            </div>
                            
                            <!-- File info display -->
                            <div id="fileInfo" class="hidden bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i class="fas fa-file-video text-blue-600"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="font-medium text-gray-800" id="fileName"></p>
                                        <p class="text-sm text-gray-500" id="fileSize"></p>
                                    </div>
                                    <button type="button" onclick="removeFile()" class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            @error('video_url')
                                <div
                                    class="flex items-center space-x-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                                    <i class="fas fa-exclamation-circle text-sm"></i>
                                    <span class="text-sm">{{ $message }}</span>
                                </div>
                            @enderror
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center justify-between pt-8 border-t border-gray-100">
                            <a href="{{ url()->previous() }}"
                                class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                                <i
                                    class="fas fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform duration-200"></i>
                                <span>Cancel</span>
                            </a>
                            
                            <button type="submit" id="submitBtn"
                                class="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-plus text-sm"></i>
                                <span>Create Video</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Success Message -->
            @if (session('success'))
                <div class="mt-8 bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <i class="fas fa-check text-green-600 text-lg"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-medium text-gray-800">Success!</h3>
                                <p class="text-gray-600">{{ session('success') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>

    <script>
        let selectedFile = null;
const fileInput = document.getElementById('video_url');
const uploadLabel = document.getElementById('uploadLabel');
const uploadContent = document.getElementById('uploadContent');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const submitBtn = document.getElementById('submitBtn');
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

// Get CSRF token from multiple sources
function getCsrfToken() {
    // Try meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.content;
    
    // Try hidden input as fallback
    const hiddenInput = document.querySelector('input[name="_token"]');
    if (hiddenInput) return hiddenInput.value;
    
    // Try Laravel's global variable
    if (typeof Laravel !== 'undefined' && Laravel.csrfToken) {
        return Laravel.csrfToken;
    }
    
    throw new Error('CSRF token not found');
}

// File input change handler
fileInput.addEventListener('change', function(e) {
    handleFileSelect(e.target.files[0]);
});

function handleFileSelect(file) {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid video file (MP4, AVI, MOV)');
        return;
    }
    
    selectedFile = file;
    
    // Update UI
    fileName.textContent = file.name;
    fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    
    // Hide upload area and show file info
    uploadLabel.classList.add('hidden');
    fileInfo.classList.remove('hidden');
}

function removeFile() {
    selectedFile = null;
    fileInput.value = '';
    
    // Show upload area and hide file info
    uploadLabel.classList.remove('hidden');
    fileInfo.classList.add('hidden');
}

// Form submission with chunked upload
document.getElementById('videoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('title');
    
    // Validate title
    if (!titleInput.value.trim()) {
        alert('Please enter a video title');
        titleInput.focus();
        return;
    }
    
    // Validate file
    if (!selectedFile) {
        alert('Please select a video file');
        return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin text-sm"></i><span>Uploading...</span>';
    
    try {
        await uploadFileInChunks(selectedFile, titleInput.value);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus text-sm"></i><span>Create Video</span>';
    }
});

async function uploadFileInChunks(file, title) {
    const fileId = generateFileId();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    try {
        const csrfToken = getCsrfToken();
        
        // Upload all chunks
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);
            
            const formData = new FormData();
            formData.append('file', chunk);
            formData.append('file_id', fileId);
            formData.append('chunk_index', chunkIndex);
            formData.append('total_chunks', totalChunks);
            
            const response = await fetch('/upload-chunk', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Chunk upload failed: ${response.statusText}`);
            }
            
            // Update progress
            const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin text-sm"></i><span>Uploading... ${progress}%</span>`;
        }
        
        // Complete the upload
        const formData = new FormData();
        formData.append('file_id', fileId);
        formData.append('title', title);
        formData.append('original_name', file.name);
        formData.append('total_chunks', totalChunks);
        
        const response = await fetch('/complete-upload', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            body: formData
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload completion failed');
        }
    } catch (error) {
        throw error;
    }
}

function generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Drag and drop functionality
const dropZone = uploadLabel;
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('border-blue-400', 'bg-blue-50');
}

function unhighlight(e) {
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        // Set the file to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        fileInput.files = dataTransfer.files;
        
        handleFileSelect(files[0]);
    }
}
    </script>
@endsection
