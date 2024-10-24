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
const turnOrderDiv = document.getElementById('turnOrder');
const endGameBtn = document.getElementById('endGame');

// Variables to hold game state
let players = [];
let scores = {};
let turnOrder = [];
let currentTurnIndex = 0;
let totalRacks = 0;
let gameType = 'standard';

// Event listeners
numPlayersSelect.addEventListener('change', generatePlayerInputs);
startGameBtn.addEventListener('click', startGame);
recordScoreBtn.addEventListener('click', recordScore);
scratchBtn.addEventListener('click', recordScratch);
endGameBtn.addEventListener('click', endGame);

// Create "Next Player" button
const nextPlayerBtn = document.createElement('button');
nextPlayerBtn.id = 'nextPlayer';
nextPlayerBtn.textContent = 'Next Player';
actionsDiv.appendChild(nextPlayerBtn);
nextPlayerBtn.addEventListener('click', nextPlayer);

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

    // Handle custom game type
    if (gameType === 'custom') {
        ['3', '7'].forEach(ball => {
            const option = document.createElement('option');
            option.value = ball;
            option.textContent = ball;
            pottedBallSelect.appendChild(option);
        });
    } else {
        // Ensure balls 3 and 7 are not in the select if game type is standard
        Array.from(pottedBallSelect.options).forEach(option => {
            if (option.value === '3' || option.value === '7') {
                pottedBallSelect.removeChild(option);
            }
        });
    }

    // Show game div and hide setup
    document.getElementById('setup').style.display = 'none';
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
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
        points = 1; // You can adjust the points as per your custom rules
    }

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

    // Since the player continues as long as they pot a ball,
    // we do not call nextTurn() here.
}

function recordScratch() {
    const player = currentPlayerSelect.value;
    // Scratch results in 0 points; no score update needed

    // After a scratch, the turn passes to the next player
    nextTurn();
}

function nextPlayer() {
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
        } else if (scores[player] === maxScore) {
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

// Initialize player inputs on page load
generatePlayerInputs();
