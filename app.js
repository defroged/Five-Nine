// Get references to DOM elements
const gameTypeSelect = document.getElementById('gameType');
const numPlayersSelect = document.getElementById('numPlayers');
const playerNamesDiv = document.getElementById('playerNames');
const startGameBtn = document.getElementById('startGame');
const gameDiv = document.getElementById('game');
const scoreBoardDiv = document.getElementById('scoreBoard');
const actionsDiv = document.getElementById('actions');
const currentPlayerSelect = document.getElementById('currentPlayer');
const pottedBallSelect = document.getElementById('pottedBall');
const pocketTypeSelect = document.getElementById('pocketType');
const recordScoreBtn = document.getElementById('recordScore');
const scratchBtn = document.getElementById('scratch');
const nextPlayerBtn = document.getElementById('nextPlayer');
const undoBtn = document.getElementById('undo');
const viewHistoryBtn = document.getElementById('viewHistory');
const turnOrderDiv = document.getElementById('turnOrder');
const endGameBtn = document.getElementById('endGame');
const historyModal = document.getElementById('historyModal');
const closeModalBtn = document.querySelector('.close');
const historyContentDiv = document.getElementById('historyContent');

// Variables to hold game state
let players = [];
let scores = {};
let turnOrder = [];
let currentTurnIndex = 0;
let totalRacks = 0;
let gameType = 'standard';
let actionHistory = []; // For undo functionality
let scoreHistory = []; // For viewing score history

// Event listeners
numPlayersSelect.addEventListener('change', generatePlayerInputs);
startGameBtn.addEventListener('click', startGame);
recordScoreBtn.addEventListener('click', recordScore);
scratchBtn.addEventListener('click', recordScratch);
nextPlayerBtn.addEventListener('click', nextPlayer);
undoBtn.addEventListener('click', undoAction);
viewHistoryBtn.addEventListener('click', openHistoryModal);
closeModalBtn.addEventListener('click', closeHistoryModal);
window.addEventListener('click', outsideClick);
endGameBtn.addEventListener('click', endGame);

function generatePlayerInputs() {
    playerNamesDiv.innerHTML = '';
    const numPlayers = parseInt(numPlayersSelect.value);
    for (let i = 1; i <= numPlayers; i++) {
        const label = document.createElement('label');
        label.textContent = `Player ${i} Name:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.required = true;
        playerNamesDiv.appendChild(label);
        playerNamesDiv.appendChild(input);
    }
}

function startGame() {
    const numPlayers = parseInt(numPlayersSelect.value);
    gameType = gameTypeSelect.value;
    players = [];
    scores = {};
    turnOrder = [];
    currentTurnIndex = 0;
    totalRacks = 0;
    actionHistory = [];
    scoreHistory = [];

    for (let i = 1; i <= numPlayers; i++) {
        const playerName = document.getElementById(`player${i}`).value || `Player ${i}`;
        players.push(playerName);
        scores[playerName] = 0;
    }

    // Setup turn order
    turnOrder = [...players];

    // Setup score board
    updateScoreBoard();

    // Populate current player select
    currentPlayerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        currentPlayerSelect.appendChild(option);
    });

    // Handle potted ball options
    updatePottedBallOptions();

    // Show game div and hide setup
    document.getElementById('setup').style.display = 'none';
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
}

function updatePottedBallOptions() {
    // Clear existing options
    pottedBallSelect.innerHTML = '';

    // Standard balls
    let balls = ['5', '9'];

    // If custom game, include balls 3 and 7
    if (gameType === 'custom') {
        balls = ['3', '5', '7', '9'];
    }

    // Populate potted ball select
    balls.forEach(ball => {
        const option = document.createElement('option');
        option.value = ball;
        option.textContent = ball;
        pottedBallSelect.appendChild(option);
    });
}

function updateScoreBoard() {
    scoreBoardDiv.innerHTML = '<h3>Score Board</h3>';
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    players.forEach(player => {
        const th = document.createElement('th');
        th.textContent = player;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const scoreRow = document.createElement('tr');
    players.forEach(player => {
        const td = document.createElement('td');
        td.textContent = scores[player];
        scoreRow.appendChild(td);
    });
    table.appendChild(scoreRow);

    scoreBoardDiv.appendChild(table);
}

function recordScore() {
    const player = currentPlayerSelect.value;
    const ball = pottedBallSelect.value;
    const pocket = pocketTypeSelect.value;

    let points = 0;

    // Calculate points based on the rules
    if (ball === '5') {
        points = pocket === 'corner' ? 1 : 2;
    } else if (ball === '9') {
        points = pocket === 'corner' ? 2 : 4;
    } else if (gameType === 'custom' && (ball === '3' || ball === '7')) {
        // Assign points for custom balls
        points = 1; // Adjust points as per custom rules
    }

    // Save current state for undo
    saveAction({
        type: 'score',
        player: player,
        points: points,
        scoresSnapshot: { ...scores },
        ball: ball,
        pocket: pocket
    });

    // Update scores
    scores[player] += points;

    // For 3+ players, points are deducted from others
    if (players.length >= 3) {
        players.forEach(p => {
            if (p !== player) {
                scores[p] -= points;
            }
        });
    }

    updateScoreBoard();

    // Add to score history
    scoreHistory.push(`${player} potted ball ${ball} in the ${pocket} pocket for ${points} points.`);

    // Automatically change the "Potted Ball" dropdown to the next ball in order
    const options = Array.from(pottedBallSelect.options);
    const currentIndex = options.findIndex(option => option.value === ball);

    // Calculate next index
    let nextIndex = (currentIndex + 1) % options.length;

    // Set the selected index to the next index
    pottedBallSelect.selectedIndex = nextIndex;
}

function recordScratch() {
    const player = currentPlayerSelect.value;

    // Save current state for undo
    saveAction({
        type: 'scratch',
        player: player,
        scoresSnapshot: { ...scores }
    });

    // Add to score history
    scoreHistory.push(`${player} scratched. No points awarded.`);

    // After a scratch, the turn passes to the next player
    nextTurn();
}

function nextPlayer() {
    // Save current state for undo
    saveAction({
        type: 'nextPlayer',
        previousTurnIndex: currentTurnIndex
    });

    // Manually move to the next player
    nextTurn();
}

function nextTurn() {
    totalRacks++;

    // Update turn order based on the rules
    if (players.length === 3 && totalRacks % 5 === 0) {
        turnOrder.reverse();
        alert('Turn order has been reversed after 5 racks.');
    } else if (players.length === 4 && totalRacks % 10 === 0) {
        // Decide turn order via rock-paper-scissors (not implemented)
        alert('After 10 games, decide turn order via rock-paper-scissors.');
    }

    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    currentPlayerSelect.value = turnOrder[currentTurnIndex];

    updateTurnOrderDisplay();
}

function updateTurnOrderDisplay() {
    turnOrderDiv.innerHTML = `<p>Current Turn Order: ${turnOrder.join(' ➔ ')}</p>`;
    // Highlight the current player
    turnOrderDiv.innerHTML += `<p><strong>It's ${currentPlayerSelect.value}'s turn.</strong></p>`;
}

function endGame() {
    // Determine the winner
    let maxScore = -Infinity;
    let winner = '';
    let tie = false;

    players.forEach(player => {
        if (scores[player] > maxScore) {
            maxScore = scores[player];
            winner = player;
            tie = false;
        } else if (scores[player] === maxScore && scores[player] !== 0) {
            tie = true;
        }
    });

    if (tie) {
        alert(`Game Over! It's a tie between players with ${maxScore} points.`);
    } else {
        alert(`Game Over! Winner: ${winner} with ${maxScore} points.`);
    }

    // Reset the game
    resetGame();
}

function resetGame() {
    document.getElementById('setup').style.display = 'block';
    gameDiv.style.display = 'none';
    playerNamesDiv.innerHTML = '';
    generatePlayerInputs();
}

function saveAction(action) {
    actionHistory.push(action);
}

function undoAction() {
    if (actionHistory.length === 0) {
        alert('No actions to undo.');
        return;
    }

    const lastAction = actionHistory.pop();

    switch (lastAction.type) {
        case 'score':
            // Restore scores
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            // Remove last entry from score history
            scoreHistory.pop();
            break;
        case 'scratch':
            // Restore scores (if any changes were made)
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            // Undo turn change
            currentTurnIndex = (currentTurnIndex - 1 + players.length) % players.length;
            currentPlayerSelect.value = turnOrder[currentTurnIndex];
            updateTurnOrderDisplay();
            // Remove last entry from score history
            scoreHistory.pop();
            break;
        case 'nextPlayer':
            // Restore previous turn index
            currentTurnIndex = lastAction.previousTurnIndex;
            currentPlayerSelect.value = turnOrder[currentTurnIndex];
            updateTurnOrderDisplay();
            break;
    }
}

function openHistoryModal() {
    historyModal.style.display = 'block';
    displayScoreHistory();
}

function closeHistoryModal() {
    historyModal.style.display = 'none';
}

function outsideClick(event) {
    if (event.target == historyModal) {
        historyModal.style.display = 'none';
    }
}

function displayScoreHistory() {
    historyContentDiv.innerHTML = '';
    if (scoreHistory.length === 0) {
        historyContentDiv.innerHTML = '<p>No actions recorded yet.</p>';
        return;
    }

    const list = document.createElement('ol');
    scoreHistory.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = entry;
        list.appendChild(listItem);
    });
    historyContentDiv.appendChild(list);
}

// Initialize player inputs on page load
generatePlayerInputs();
