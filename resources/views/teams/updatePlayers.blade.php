@extends('layouts.admin')
@section('adminMain')
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8 flex flex-col justify-center">
                <div class="flex items-center space-x-3 mb-2">
                    <div
                        class="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-users text-white text-xl"></i>
                    </div>

                    <!-- Make title and paragraph side-by-side -->
                    <div class="flex flex-row items-center space-x-4">
                        {{-- <h1 class="text-3xl font-bold text-gray-800">{{ $video->title }}</h1> --}}
                        <h1 class="text-3xl font-bold text-gray-800">Update</h1>
                        <p class="text-gray-800">Create two teams and add players to get started</p>
                    </div>
                </div>
            </div>

            <!-- Main Form Container -->
            <form action="#" method="POST" id="mainTeamsForm">
                @csrf

                <!-- Dual Team Forms -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <!-- Team 1 Section -->
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div class="bg-gradient-to-r from-blue-900 to-blue-800 p-4">
                            <h2 class="text-xl font-bold text-white flex items-center">
                                <i class="fas fa-flag mr-2"></i>
                                Team 1
                            </h2>
                        </div>

                        <div class="p-6">
                            <!-- Team 1 Information Section -->
                            <div class="mb-6">
                                <div
                                    class="bg-blue-50 rounded-xl p-4 border-2 border-blue-100 hover:border-blue-200 transition-all duration-200">
                                    <label for="team1_name" class="block text-sm font-semibold text-gray-700 mb-3">
                                        <i class="fas fa-flag text-blue-900 mr-2"></i>
                                        Team Name
                                    </label>
                                    <input type="text" id="team1_name" name="team1_name" required
                                        placeholder="Enter team 1 name..."
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white"
                                        value="{{ old('team1_name') }}">
                                    @error('team1_name')
                                        <p class="mt-2 text-sm text-red-600 flex items-center">
                                            <i class="fas fa-exclamation-circle mr-1"></i>
                                            {{ $message }}
                                        </p>
                                    @enderror
                                </div>
                            </div>

                            <!-- Add Player Section for Team 1 -->
                            <div class="mb-6">
                                <div
                                    class="flex items-center justify-between bg-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                                    <span class="text-lg font-semibold text-gray-800">Add Player</span>
                                    <button type="button" onclick="openPlayerModal('team1')" id="addPlayerBtn1"
                                        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>

                                <!-- Players List for Team 1 -->
                                <div id="playersList1" class="mt-4 space-y-3">
                                    <!-- Players will be added here dynamically -->
                                    <div class="flex items-center space-x-4">
                                        <div
                                            class="w-10 h-10 bg-gradient-to-r from-${cardColor}-900 to-${cardColor}-800 rounded-full flex items-center justify-center">
                                            <span class="text-white font-bold text-sm">01</span>
                                        </div>
                                        <div>
                                            <h4 class="font-semibold text-gray-800">Henry</h4>
                                            <p class="text-sm text-gray-600">mate</p>
                                        </div>
                                    </div>
                                    <button type="button"
                                        onclick="removePlayer(this, '${number}', '${playerData.id}', '${team}')"
                                        class="text-red-500 hover:text-red-700 transition-colors">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>

                                <!-- Player count display for Team 1 -->
                                <div class="mt-4 text-center">
                                    <span id="playerCount1" class="text-sm text-gray-600">0 / 22 players added</span>
                                </div>
                            </div>

                            <!-- Success Message for Team 1 -->
                            @if (session('success_team1'))
                                <div
                                    class="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <i class="fas fa-check text-white text-sm"></i>
                                    </div>
                                    <p class="text-green-800 font-medium">{{ session('success_team1') }}</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Team 2 Section -->
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div class="bg-gradient-to-r from-green-900 to-green-800 p-4">
                            <h2 class="text-xl font-bold text-white flex items-center">
                                <i class="fas fa-flag mr-2"></i>
                                Team 2
                            </h2>
                        </div>

                        <div class="p-6">
                            <!-- Team 2 Information Section -->
                            <div class="mb-6">
                                <div
                                    class="bg-green-50 rounded-xl p-4 border-2 border-green-100 hover:border-green-200 transition-all duration-200">
                                    <label for="team2_name" class="block text-sm font-semibold text-gray-700 mb-3">
                                        <i class="fas fa-flag text-green-900 mr-2"></i>
                                        Team Name
                                    </label>
                                    <input type="text" id="team2_name" name="team2_name" required
                                        placeholder="Enter team 2 name..."
                                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-900 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-800 placeholder-gray-400 bg-white hover:bg-gray-50 focus:bg-white"
                                        value="{{ old('team2_name') }}">
                                    @error('team2_name')
                                        <p class="mt-2 text-sm text-red-600 flex items-center">
                                            <i class="fas fa-exclamation-circle mr-1"></i>
                                            {{ $message }}
                                        </p>
                                    @enderror
                                </div>
                            </div>

                            <!-- Add Player Section for Team 2 -->
                            <div class="mb-6">
                                <div
                                    class="flex items-center justify-between bg-gray-50 rounded-xl p-4 border-2 border-gray-100 hover:border-gray-200 transition-all duration-200">
                                    <span class="text-lg font-semibold text-gray-800">Add Player</span>
                                    <button type="button" onclick="openPlayerModal('team2')" id="addPlayerBtn2"
                                        class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>

                                <!-- Players List for Team 2 -->
                                <div id="playersList2" class="mt-4 space-y-3">
                                    <!-- Players will be added here dynamically -->
                                </div>

                                <!-- Player count display for Team 2 -->
                                <div class="mt-4 text-center">
                                    <span id="playerCount2" class="text-sm text-gray-600">0 / 22 players added</span>
                                </div>
                            </div>

                            <!-- Success Message for Team 2 -->
                            @if (session('success_team2'))
                                <div
                                    class="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <i class="fas fa-check text-white text-sm"></i>
                                    </div>
                                    <p class="text-green-800 font-medium">{{ session('success_team2') }}</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Single Submit Button -->
                <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div
                                class="w-10 h-10 bg-gradient-to-r from-purple-900 to-purple-800 rounded-xl flex items-center justify-center">
                                <i class="fas fa-rocket text-white"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-gray-800">Ready to Create Teams?</h3>
                                <p class="text-sm text-gray-600">Both teams will be created simultaneously</p>
                            </div>
                        </div>

                        <button type="submit" id="createTeamsBtn"
                            class="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-900 to-purple-800 hover:from-purple-800 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg">
                            <i class="fas fa-users"></i>
                            <span>FINALIZE LINEUPS</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </form>

            <!-- Overall Success Message -->
            @if (session('success'))
                <div class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-white text-sm"></i>
                    </div>
                    <p class="text-green-800 font-medium">{{ session('success') }}</p>
                </div>
            @endif

            <!-- Error Messages -->
            @if ($errors->any())
                <div class="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-red-800 font-semibold text-sm mb-2">Please fix the following errors:</h3>
                            <ul class="text-red-700 text-sm space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li class="flex items-start space-x-2">
                                        <i class="fas fa-circle text-xs mt-1.5 text-red-500"></i>
                                        <span>{{ $error }}</span>
                                    </li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif

            <!-- Info Card -->
            <div class="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div class="flex items-start space-x-3">
                    <div class="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i class="fas fa-info text-white text-xs"></i>
                    </div>
                    <div>
                        <h3 class="text-blue-800 font-semibold text-sm mb-1">Getting Started</h3>
                        <p class="text-blue-700 text-sm">Fill in both team names and add players to each team. When you
                            click "Create Both Teams", both teams will be created simultaneously. You can create teams with
                            different numbers of players.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Player Modal -->
    <div id="playerModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-95"
            id="modalContent">
            <div class="p-6">
                <!-- Modal Header -->
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg flex items-center justify-center"
                            id="modalIcon">
                            <i class="fas fa-user-plus text-white text-sm"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800" id="modalTitle">Add New Player</h3>
                    </div>
                    <button type="button" onclick="closePlayerModal()"
                        class="text-gray-400 hover:text-gray-600 transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <!-- Modal Form -->
                <form id="playerForm" onsubmit="addPlayer(event)">
                    <input type="hidden" id="currentTeam" value="">
                    <div class="space-y-4">
                        <!-- First Name -->
                        <div>
                            <label for="modal_first_name" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user text-blue-900 mr-2"></i>
                                First Name
                            </label>
                            <input type="text" id="modal_first_name" required placeholder="Player's first name..."
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400">
                        </div>
                        <!-- Last Name -->
                        <div>
                            <label for="modal_last_name" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-user-tag text-blue-900 mr-2"></i>
                                Last Name
                            </label>
                            <input type="text" id="modal_last_name" required placeholder="Player's last name..."
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400">
                        </div>
                        <!-- Jersey Number -->
                        <div>
                            <label for="modal_number" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-tshirt text-blue-900 mr-2"></i>
                                Jersey Number
                            </label>
                            <input type="number" id="modal_number" min="0" max="99" required
                                placeholder="0-99"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400">
                        </div>
                    </div>
                    <!-- Modal Actions -->
                    <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onclick="closePlayerModal()"
                            class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            Cancel
                        </button>
                        <button type="submit" id="modalSubmitBtn"
                            class="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                            <i class="fas fa-plus"></i>
                            <span>Add Player</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Team data management
        const teamData = {
            team1: {
                playerCount: 0,
                usedNumbers: new Set(),
                playersArray: []
            },
            team2: {
                playerCount: 0,
                usedNumbers: new Set(),
                playersArray: []
            }
        };

        const MAX_PLAYERS = 22;
        let currentTeam = '';

        function openPlayerModal(team) {
            currentTeam = team;
            const teamInfo = teamData[team];

            // Check if maximum players reached
            if (teamInfo.playerCount >= MAX_PLAYERS) {
                alert(`Maximum of ${MAX_PLAYERS} players allowed per team.`);
                return;
            }

            // Update modal styling based on team
            const modalIcon = document.getElementById('modalIcon');
            const modalTitle = document.getElementById('modalTitle');
            const modalSubmitBtn = document.getElementById('modalSubmitBtn');

            if (team === 'team1') {
                modalIcon.className =
                    'w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg flex items-center justify-center';
                modalTitle.textContent = 'Add Player to Team 1';
                modalSubmitBtn.className =
                    'flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200';
            } else {
                modalIcon.className =
                    'w-8 h-8 bg-gradient-to-r from-green-900 to-green-800 rounded-lg flex items-center justify-center';
                modalTitle.textContent = 'Add Player to Team 2';
                modalSubmitBtn.className =
                    'flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200';
            }

            document.getElementById('currentTeam').value = team;

            const modal = document.getElementById('playerModal');
            const modalContent = document.getElementById('modalContent');
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }, 10);
        }

        function closePlayerModal() {
            const modal = document.getElementById('playerModal');
            const modalContent = document.getElementById('modalContent');
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
                document.getElementById('playerForm').reset();
                currentTeam = '';
            }, 300);
        }

        function addPlayer(event) {
            event.preventDefault();

            const team = document.getElementById('currentTeam').value;
            const teamInfo = teamData[team];

            // Check if maximum players reached
            if (teamInfo.playerCount >= MAX_PLAYERS) {
                alert(`Maximum of ${MAX_PLAYERS} players allowed per team.`);
                return;
            }

            const firstName = document.getElementById('modal_first_name').value.trim();
            const lastName = document.getElementById('modal_last_name').value.trim();
            const number = document.getElementById('modal_number').value;

            // Validate input
            if (!firstName || !lastName || !number) {
                alert('Please fill in all fields.');
                return;
            }

            // Check if jersey number is already used in this team
            if (teamInfo.usedNumbers.has(number)) {
                alert(`Jersey number ${number} is already taken in this team. Please choose a different number.`);
                return;
            }

            // Add to used numbers and players array
            teamInfo.usedNumbers.add(number);
            const playerData = {
                firstName: firstName,
                lastName: lastName,
                number: number,
                id: Date.now() + Math.random()
            };
            teamInfo.playersArray.push(playerData);
            teamInfo.playerCount++;

            // Create player card
            const playersList = document.getElementById(`playersList${team === 'team1' ? '1' : '2'}`);
            const playerCard = document.createElement('div');
            const cardColor = team === 'team1' ? 'blue' : 'green';

            playerCard.className =
                `bg-${cardColor}-50 rounded-xl p-4 border-2 border-${cardColor}-100 flex items-center justify-between`;
            playerCard.setAttribute('data-player-id', playerData.id);
            playerCard.innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="w-10 h-10 bg-gradient-to-r from-${cardColor}-900 to-${cardColor}-800 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">${number}</span>
            </div>
            <div>
                <h4 class="font-semibold text-gray-800">${firstName} ${lastName}</h4>
                <p class="text-sm text-gray-600">Jersey #${number}</p>
            </div>
        </div>
        <button type="button" onclick="removePlayer(this, '${number}', '${playerData.id}', '${team}')" class="text-red-500 hover:text-red-700 transition-colors">
            <i class="fas fa-trash"></i>
        </button>
    `;

            playersList.appendChild(playerCard);
            updateHiddenInputs(team);
            updatePlayerCount(team);
            updateAddButton(team);
            updateCreateButton();
            closePlayerModal();
        }

        function removePlayer(button, number, playerId, team) {
            const teamInfo = teamData[team];

            teamInfo.usedNumbers.delete(number);
            teamInfo.playerCount--;

            // Remove from players array
            teamInfo.playersArray = teamInfo.playersArray.filter(player => player.id != playerId);

            // Remove the card
            button.closest(`[data-player-id="${playerId}"]`).remove();

            // Update hidden inputs to maintain proper indexing
            updateHiddenInputs(team);
            updatePlayerCount(team);
            updateAddButton(team);
            updateCreateButton();
        }

        function updateHiddenInputs(team) {
            const teamInfo = teamData[team];

            // Remove all existing hidden inputs for this team
            const existingInputs = document.querySelectorAll(`input[name^="${team}_players["]`);
            existingInputs.forEach(input => input.remove());

            // Add hidden inputs with proper sequential indexing
            const form = document.getElementById('mainTeamsForm');
            teamInfo.playersArray.forEach((player, index) => {
                // Create hidden inputs for each player
                const firstNameInput = document.createElement('input');
                firstNameInput.type = 'hidden';
                firstNameInput.name = `${team}_players[${index}][first_name]`;
                firstNameInput.value = player.firstName;

                const lastNameInput = document.createElement('input');
                lastNameInput.type = 'hidden';
                lastNameInput.name = `${team}_players[${index}][last_name]`;
                lastNameInput.value = player.lastName;

                const numberInput = document.createElement('input');
                numberInput.type = 'hidden';
                numberInput.name = `${team}_players[${index}][number]`;
                numberInput.value = player.number;

                form.appendChild(firstNameInput);
                form.appendChild(lastNameInput);
                form.appendChild(numberInput);
            });
        }

        function updatePlayerCount(team) {
            const teamInfo = teamData[team];
            const countElement = document.getElementById(`playerCount${team === 'team1' ? '1' : '2'}`);
            countElement.textContent = `${teamInfo.playerCount} / ${MAX_PLAYERS} players added`;
        }

        function updateAddButton(team) {
            const teamInfo = teamData[team];
            const addButton = document.getElementById(`addPlayerBtn${team === 'team1' ? '1' : '2'}`);

            if (teamInfo.playerCount >= MAX_PLAYERS) {
                addButton.disabled = true;
                addButton.classList.add('opacity-50', 'cursor-not-allowed');
                addButton.classList.remove('hover:from-blue-800', 'hover:to-blue-700', 'hover:from-green-800',
                    'hover:to-green-700', 'transform', 'hover:-translate-y-0.5');
            } else {
                addButton.disabled = false;
                addButton.classList.remove('opacity-50', 'cursor-not-allowed');
                if (team === 'team1') {
                    addButton.classList.add('hover:from-blue-800', 'hover:to-blue-700', 'transform',
                        'hover:-translate-y-0.5');
                } else {
                    addButton.classList.add('hover:from-green-800', 'hover:to-green-700', 'transform',
                        'hover:-translate-y-0.5');
                }
            }
        }

        function updateCreateButton() {
            const createBtn = document.getElementById('createTeamsBtn');
            const team1Name = document.getElementById('team1_name').value.trim();
            const team2Name = document.getElementById('team2_name').value.trim();

            // Enable button only if both team names are filled
            if (team1Name && team2Name) {
                createBtn.disabled = false;
                createBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                createBtn.classList.add('hover:from-purple-800', 'hover:to-purple-700', 'transform',
                    'hover:-translate-y-0.5');
            } else {
                createBtn.disabled = true;
                createBtn.classList.add('opacity-50', 'cursor-not-allowed');
                createBtn.classList.remove('hover:from-purple-800', 'hover:to-purple-700', 'transform',
                    'hover:-translate-y-0.5');
            }
        }

        // Add form validation before submission
        document.getElementById('mainTeamsForm').addEventListener('submit', function(e) {
            // Update hidden inputs for both teams
            updateHiddenInputs('team1');
            updateHiddenInputs('team2');

            const team1Name = document.getElementById('team1_name').value.trim();
            const team2Name = document.getElementById('team2_name').value.trim();

            if (!team1Name || !team2Name) {
                e.preventDefault();
                alert('Please fill in both team names before creating teams.');
                return;
            }

            // Add a small delay to ensure all inputs are properly set
            e.preventDefault();
            setTimeout(() => {
                this.submit();
            }, 100);
        });

        // Monitor team name inputs to update create button
        document.getElementById('team1_name').addEventListener('input', updateCreateButton);
        document.getElementById('team2_name').addEventListener('input', updateCreateButton);

        // Close modal when clicking outside
        document.getElementById('playerModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePlayerModal();
            }
        });

        // Initialize create button state
        updateCreateButton();
    </script>
@endsection
