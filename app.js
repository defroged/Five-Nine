const gameDiv = document.getElementById('game');
const scoreBoardDiv = document.getElementById('scoreBoard');
const actionsDiv = document.getElementById('actions');
const currentPlayerSelect = document.getElementById('currentPlayer');
const pottedBallSelect = document.getElementById('pottedBall');
const recordScoreBtn = document.getElementById('recordScore');
// const scratchBtn = document.getElementById('scratch'); // Removed
const nextPlayerBtn = document.getElementById('nextPlayer');
const undoBtn = document.getElementById('undo');
const viewHistoryBtn = document.getElementById('viewHistory');
const turnOrderDiv = document.getElementById('turnOrder');
const endGameBtn = document.getElementById('endGame');
const historyModal = document.getElementById('historyModal');
const closeModalBtn = document.querySelector('.close');
const historyContentDiv = document.getElementById('historyContent');
const cornerBtn = document.getElementById('cornerBtn');
const sideBtn = document.getElementById('sideBtn');
const gameSettingsModal = document.getElementById('gameSettingsModal');
const gameSettingsContent = document.getElementById('gameSettingsContent');

const comboCannonFrockBtn = document.getElementById('comboCannonFrockBtn');
const comboCannonFrockModal = document.getElementById('comboCannonFrockModal');
const closeComboModalBtn = document.getElementById('closeComboModal');
const comboFrockBallsContainer = document.getElementById('comboFrockBallsContainer');

let scoringSettings = {};
let selectedBall = null;
let players = [];
let scores = {};
let turnOrder = [];
let currentTurnIndex = 0;
let totalRacks = 0;
let gameType = 'standard';
let actionHistory = []; 
let scoreHistory = []; 
let currentRack = 1; // Initialize the current rack number
let rackScores = {};  // Initialize rackScores globally

recordScoreBtn.addEventListener('click', selectBall);
// scratchBtn.addEventListener('click', recordScratch); // Removed
nextPlayerBtn.addEventListener('click', nextPlayer);
undoBtn.addEventListener('click', undoAction);
viewHistoryBtn.addEventListener('click', openHistoryModal);
closeModalBtn.addEventListener('click', closeHistoryModal);
window.addEventListener('click', outsideClick);
endGameBtn.addEventListener('click', endGame);
pottedBallSelect.addEventListener('change', updateRecordScoreButtonAppearance);

// NEW GLOBAL FLAG to detect if we’re in the middle of a combo shot
let isComboShotActive = false;

// Modify corner/side button event listeners to pass isComboShotActive
cornerBtn.addEventListener('click', function() {
    recordScore('corner', isComboShotActive);
    // Reset the flag after scoring
    isComboShotActive = false;
});

sideBtn.addEventListener('click', function() {
    recordScore('side', isComboShotActive);
    // Reset the flag after scoring
    isComboShotActive = false;
});

// Combo/Cannon/Frock button event
comboCannonFrockBtn.addEventListener('click', openComboCannonFrockModal);
closeComboModalBtn.addEventListener('click', closeComboCannonFrockModal);

function openGameSettingsModal() {
    gameSettingsModal.style.display = 'block';
    showSettingsPage1();
}

function showSettingsPage1() {
    gameSettingsContent.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'Player Settings';
    gameSettingsContent.appendChild(heading);

    const numPlayersLabel = document.createElement('label');
    numPlayersLabel.textContent = 'Number of Players:';
    gameSettingsContent.appendChild(numPlayersLabel);

    const numPlayersSelect = document.createElement('select');
    numPlayersSelect.id = 'numPlayers';
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + (i === 1 ? ' player' : ' players');
        if (i === 2) option.selected = true; 
        numPlayersSelect.appendChild(option);
    }
    gameSettingsContent.appendChild(numPlayersSelect);

    const playerNamesDiv = document.createElement('div');
    playerNamesDiv.id = 'playerNames';
    gameSettingsContent.appendChild(playerNamesDiv);

    generatePlayerInputsSettings(numPlayersSelect.value);

    numPlayersSelect.addEventListener('change', function() {
        generatePlayerInputsSettings(numPlayersSelect.value);
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', showSettingsPage2);
    gameSettingsContent.appendChild(nextButton);
}

function generatePlayerInputsSettings(numPlayers) {
    const playerNamesDiv = document.getElementById('playerNames');
    playerNamesDiv.innerHTML = '';

    numPlayers = parseInt(numPlayers);
    for (let i = 1; i <= numPlayers; i++) {
        const label = document.createElement('label');
        label.textContent = `Player ${i}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `Player ${i}`;
        playerNamesDiv.appendChild(label);
        playerNamesDiv.appendChild(input);
    }
}

function showSettingsPage2() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    players = [];
    for (let i = 1; i <= numPlayers; i++) {
        const playerNameInput = document.getElementById(`player${i}`);
        const playerName = playerNameInput.value.trim() || `Player ${i}`;
        players.push(playerName);
    }

    gameSettingsContent.innerHTML = '';

    const gameTypeLabel = document.createElement('label');
    gameTypeLabel.textContent = 'Select Game Type:';
    gameSettingsContent.appendChild(gameTypeLabel);

    const gameTypeSelect = document.createElement('select');
    gameTypeSelect.id = 'gameType';
    const optionStandard = document.createElement('option');
    optionStandard.value = 'standard';
    optionStandard.textContent = 'Standard(5-9)';
    optionStandard.selected = true;
    gameTypeSelect.appendChild(optionStandard);

    const optionCustom = document.createElement('option');
    optionCustom.value = 'custom';
    optionCustom.textContent = 'Custom';
    gameTypeSelect.appendChild(optionCustom);

    gameSettingsContent.appendChild(gameTypeSelect);

    const scoreTableDiv = document.createElement('div');
    scoreTableDiv.id = 'scoreTableDiv';
    gameSettingsContent.appendChild(scoreTableDiv);

    generateScoreSettingsTable(gameTypeSelect.value);

    gameTypeSelect.addEventListener('change', function() {
        generateScoreSettingsTable(gameTypeSelect.value);
    });

    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.addEventListener('click', showSettingsPage1);
    gameSettingsContent.appendChild(backButton);

    const startGameButton = document.createElement('button');
    startGameButton.textContent = 'Start Game';
    startGameButton.addEventListener('click', startGame);
    gameSettingsContent.appendChild(startGameButton);
}

function generateScoreSettingsTable(gameType) {
    const scoreTableDiv = document.getElementById('scoreTableDiv');
    scoreTableDiv.innerHTML = '';

    players.forEach(player => {
        const playerContainer = document.createElement('div');
        playerContainer.classList.add('player-container');

        const playerHeader = document.createElement('h4');
        playerHeader.textContent = player;
        playerContainer.appendChild(playerHeader);

        const inputsContainer = document.createElement('div');
        inputsContainer.classList.add('inputs-container');

        for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
            ['corner', 'side'].forEach(pocketType => {
                const label = document.createElement('label');
                label.textContent = `${ballNumber} ${pocketType === 'corner' ? 'C' : 'S'}`;

                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.id = `score_${player}_${ballNumber}_${pocketType}`;
                if (gameType === 'standard') {
                    if (ballNumber === 5 && pocketType === 'corner') {
                        input.value = 1;
                    } else if (ballNumber === 5 && pocketType === 'side') {
                        input.value = 2;
                    } else if (ballNumber === 9 && pocketType === 'corner') {
                        input.value = 2;
                    } else if (ballNumber === 9 && pocketType === 'side') {
                        input.value = 4;
                    } else {
                        input.value = 0;
                    }
                } else {
                    input.value = 0;
                }

                const inputGroup = document.createElement('div');
                inputGroup.classList.add('input-group');
                inputGroup.appendChild(label);
                inputGroup.appendChild(input);

                inputsContainer.appendChild(inputGroup);
            });
        }

        playerContainer.appendChild(inputsContainer);

        playerHeader.style.cursor = 'pointer';
        inputsContainer.style.display = 'none';

        playerHeader.addEventListener('click', function() {
            if (inputsContainer.style.display === 'none') {
                inputsContainer.style.display = 'flex';
            } else {
                inputsContainer.style.display = 'none';
            }
        });

        scoreTableDiv.appendChild(playerContainer);
    });
}

function selectBall() {
    selectedBall = pottedBallSelect.value;
    recordScoreBtn.classList.add('selected');
    cornerBtn.style.display = 'inline-block';
    sideBtn.style.display = 'inline-block';
    updateRecordScoreButtonAppearance();
}

function updateRecordScoreButtonText() {
    const selectedBall = pottedBallSelect.value;
    recordScoreBtn.textContent = selectedBall;
}

function updateRecordScoreButtonAppearance() {
    const ballImage = document.getElementById('ballImage');
    const ballToDisplay = selectedBall || pottedBallSelect.value;

    if (ballToDisplay) {
        ballImage.src = `/assets/${ballToDisplay}ball.png`;
    } else {
        ballImage.src = '';
    }
}

function startGame() {
    gameType = document.getElementById('gameType').value;

    scores = {};
    players.forEach(player => {
        scores[player] = 0;
    });

    scoringSettings = {};

    players.forEach(player => {
        scoringSettings[player] = {};
        for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
            ['corner', 'side'].forEach(pocketType => {
                const inputId = `score_${player}_${ballNumber}_${pocketType}`;
                const scoreValue = parseInt(document.getElementById(inputId).value) || 0;
                scoringSettings[player][`${ballNumber}_${pocketType}`] = scoreValue;
            });
        }
    });

    console.log("Entering startGame(), let's see players & default values…");
    console.log("scoringSettings after building:", JSON.stringify(scoringSettings, null, 2));

    turnOrder = [...players];
    currentTurnIndex = 0;
    totalRacks = 0;
    actionHistory = [];
    scoreHistory = [];
    currentRack = 1; // Reset rack number
    rackScores = {}; // Reset rack scores

    // Initialize rackScores for each player
    players.forEach(player => {
        rackScores[player] = [];
        for(let i = 0; i < 10; i++) {
            rackScores[player].push(0);
        }
    });

    updateScoreBoard();

    // 1) Clear out and re-populate currentPlayerSelect
    currentPlayerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        currentPlayerSelect.appendChild(option);
    });

    // 2) Explicitly set the select’s value to the first player
    currentPlayerSelect.value = players[0];
    console.log("currentPlayerSelect.value now:", currentPlayerSelect.value);

    // 3) Now call updatePottedBallOptions() with the valid current player
    updatePottedBallOptions();

    // 4) If STILL no scorable balls, bail out
    if (pottedBallSelect.options.length === 0) {
        console.log("No scorable balls for player:", currentPlayerSelect.value);
        alert('There are no balls with points set. Game cannot start.');
        return;
    }

    gameSettingsModal.style.display = 'none';
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
    updateRecordScoreButtonAppearance();
}

// With this full corrected version ...
function startGame() {
    gameType = document.getElementById('gameType').value;

    scores = {};
    players.forEach(player => {
        scores[player] = 0;
    });

    scoringSettings = {};

    players.forEach(player => {
        scoringSettings[player] = {};
        for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
            ['corner', 'side'].forEach(pocketType => {
                const inputId = `score_${player}_${ballNumber}_${pocketType}`;
                const scoreValue = parseInt(document.getElementById(inputId).value) || 0;
                scoringSettings[player][`${ballNumber}_${pocketType}`] = scoreValue;
            });
        }
    });

    console.log("Entering startGame(), let's see players & default values…");
    console.log("scoringSettings after building:", JSON.stringify(scoringSettings, null, 2));

    turnOrder = [...players];
    currentTurnIndex = 0;
    totalRacks = 0;
    actionHistory = [];
    scoreHistory = [];
    currentRack = 1; // Reset rack number
    rackScores = {}; // Reset rack scores

    // Initialize rackScores for each player for 10 racks
    players.forEach(player => {
        rackScores[player] = [];
        for (let i = 0; i < 10; i++) {
            rackScores[player].push(0); // Initialize each rack with 0
        }
    });

    updateScoreBoard();

    // 1) Clear out and re-populate currentPlayerSelect
    currentPlayerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        currentPlayerSelect.appendChild(option);
    });

    // 2) Explicitly set the select’s value to the first player
    currentPlayerSelect.value = players[0];
    console.log("currentPlayerSelect.value now:", currentPlayerSelect.value);

    // 3) Now call updatePottedBallOptions() with the valid current player
    updatePottedBallOptions();

    // 4) If STILL no scorable balls, bail out
    if (pottedBallSelect.options.length === 0) {
        console.log("No scorable balls for player:", currentPlayerSelect.value);
        alert('There are no balls with points set. Game cannot start.');
        return;
    }

    gameSettingsModal.style.display = 'none';
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
    updateRecordScoreButtonAppearance();
}

function updatePottedBallOptions() {
    pottedBallSelect.innerHTML = '';

    const currentPlayer = currentPlayerSelect.value;
    const ballsWithPoints = new Set();

    for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
        ['corner', 'side'].forEach(pocketType => {
            const scoreKey = `${ballNumber}_${pocketType}`;
            const points = scoringSettings[currentPlayer][scoreKey];
            if (points && points !== 0) {
                ballsWithPoints.add(ballNumber);
            }
        });
    }

    const ballsArray = Array.from(ballsWithPoints).sort((a, b) => a - b);

    ballsArray.forEach(ballNumber => {
        const option = document.createElement('option');
        option.value = ballNumber;
        option.textContent = ballNumber;
        pottedBallSelect.appendChild(option);
    });

    updateRecordScoreButtonAppearance();
}

function updateScoreBoard() {
    scoreBoardDiv.innerHTML = '<h3>Score Board</h3>';
    const table = document.createElement('table');
    table.classList.add('score-table');

    // Header row
    const headerRow = document.createElement('tr');
    const playerHeader = document.createElement('th');
    playerHeader.textContent = 'Player';
    playerHeader.classList.add('player-header');
    headerRow.appendChild(playerHeader);

    for (let rackNum = 1; rackNum <= 10; rackNum++) {
        const rackHeader = document.createElement('th');
        rackHeader.textContent = `Rack ${rackNum}`;
        rackHeader.classList.add('rack-header');
        headerRow.appendChild(rackHeader);
    }

    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Total';
    totalHeader.classList.add('total-header');
    headerRow.appendChild(totalHeader);

    table.appendChild(headerRow);

    // Player rows
    players.forEach(player => {
        const playerRow = document.createElement('tr');

        const playerNameCell = document.createElement('td');
        playerNameCell.textContent = player;
        playerNameCell.classList.add('player-name-cell');
        playerRow.appendChild(playerNameCell);

        let playerTotal = 0;
        for (let rackNum = 1; rackNum <= 10; rackNum++) {
            const scoreCell = document.createElement('td');
            let rackScore = 0;
            if (rackScores[player] && rackScores[player].length >= rackNum) {
                rackScore = rackScores[player][rackNum - 1];
                playerTotal += rackScore;
            }
            scoreCell.textContent = rackScore;
            scoreCell.classList.add('score-cell');
            playerRow.appendChild(scoreCell);
        }

        const totalCell = document.createElement('td');
        totalCell.textContent = playerTotal;
        totalCell.classList.add('total-cell');
        playerRow.appendChild(totalCell);

        table.appendChild(playerRow);
    });

    scoreBoardDiv.appendChild(table);
}

function recordScore(pocket, wasComboShot = false) {
    const player = currentPlayerSelect.value;
    const ball = selectedBall;

    if (!ball) {
        alert('A ball has not been selected.');
        return;
    }

    const scoreKey = `${ball}_${pocket}`;
    let points = scoringSettings[player][scoreKey] || 0;

    // Check if this is a break run-out (Masawari)
    let isBreakRunOut = false;
    if (parseInt(ball) === 9 && actionHistory.length > 0 && actionHistory[actionHistory.length - 1].type === 'break') {
        const ballsPottedThisRack = actionHistory
            .filter(action => action.type === 'score' && action.rack === currentRack && action.player === player)
            .map(action => parseInt(action.ball));

        if (ballsPottedThisRack.length === 8) {
            isBreakRunOut = true;
        }
    }

    // Save action for undo
    saveAction({
        type: 'score',
        player,
        points,
        scoresSnapshot: { ...scores },
        ball,
        pocket,
        rack: currentRack,
        isBreakRunOut
    });

    // Double points if it's a break run-out
    if (isBreakRunOut) {
        points *= 2;
    }

    // Add points for the current player for this rack
    rackScores[player][currentRack - 1] = (rackScores[player][currentRack - 1] || 0) + points;

    // Deduct points from others if 3+ players
    if (players.length >= 3) {
        players.forEach(p => {
            if (p !== player) {
                rackScores[p][currentRack - 1] = (rackScores[p][currentRack - 1] || 0) - points;
            }
        });
    }

    updateScoreBoard();

    // Log into score history
    let historyMessage = `${player} ${isBreakRunOut ? 'マスワリ達成！ ' : ''}は${ball}番を${pocket === 'corner' ? 'コーナー' : 'サイド'}に入れ、${points}ポイント獲得。`;
    scoreHistory.push(historyMessage);

    // If 9-ball is potted, increment the rack count and handle turn order
    if (parseInt(ball, 10) === 9) {
        currentRack++;

        // Check if it's time to change the turn order
        if (players.length === 3 && currentRack % 5 === 1 && currentRack !== 1) {
            turnOrder.reverse(); // Reverse the turn order for 3 players
            alert('5ゲーム後、順番が逆になります。');
        } else if (players.length === 4 && currentRack % 10 === 1 && currentRack !== 1) {
            alert('10ゲーム後、じゃんけんで順番を決めてください。');
        }

        // Ensure the player who potted the 9-ball gets the next turn (break)
        currentPlayerSelect.value = player;
        currentTurnIndex = turnOrder.indexOf(player);
    } else {
        // If not the 9-ball, only advance to the next ball if NOT a combo shot
        if (!wasComboShot) {
            const options = Array.from(pottedBallSelect.options);
            const currentIndex = options.findIndex(opt => opt.value === ball.toString());
            let nextIndex = (currentIndex + 1) % options.length;
            pottedBallSelect.selectedIndex = nextIndex;
        }
    }

    // Reset UI states
    cornerBtn.style.display = 'none';
    sideBtn.style.display = 'none';
    recordScoreBtn.classList.remove('selected');

    // Clear out the selected ball
    selectedBall = null;
    updateRecordScoreButtonAppearance();
}

function recordBreak() {
    const player = currentPlayerSelect.value;

    saveAction({
        type: 'break',
        player: player,
        rack: currentRack,
        scoresSnapshot: { ...scores }
    });

    scoreHistory.push(`${player} breaks.`);

    // Check if any balls were potted on the break
    const ballsPottedOnBreak = actionHistory.filter(action => action.type === 'score' && action.rack === currentRack);

    if (ballsPottedOnBreak.length === 0) {
        // If no balls were potted on the break, move to the next player
        nextTurn();
    } else {
        // If balls were potted, the current player continues their turn
        updateTurnOrderDisplay();
    }
}

const breakBtn = document.createElement('button');
breakBtn.textContent = 'Break';
breakBtn.id = 'breakBtn';
actionsDiv.appendChild(breakBtn);

// Add an event listener for the break button
breakBtn.addEventListener('click', recordBreak);

function nextPlayer() {
    saveAction({
        type: 'nextPlayer',
        previousTurnIndex: currentTurnIndex
    });

    nextTurn();
}

function nextTurn() {
    // Go to next player's index
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    currentPlayerSelect.value = turnOrder[currentTurnIndex];

    // Save the currently "active" ball
    const ballBeforeUpdate = selectedBall;

    // Refresh the dropdown for the new player
    updatePottedBallOptions();

    // If the ball was "alive," keep it selected in the dropdown
    if (ballBeforeUpdate) {
        const cornerPoints = scoringSettings[currentPlayerSelect.value][`${ballBeforeUpdate}_corner`] || 0;
        const sidePoints   = scoringSettings[currentPlayerSelect.value][`${ballBeforeUpdate}_side`]   || 0;
        if (cornerPoints !== 0 || sidePoints !== 0) {
            pottedBallSelect.value = ballBeforeUpdate;
            selectedBall = ballBeforeUpdate;
            updateRecordScoreButtonAppearance();
        }
    }

    updateTurnOrderDisplay();
}

function updateTurnOrderDisplay() {
    turnOrderDiv.innerHTML = `<p>現在の順番: ${turnOrder.join(' ➔ ')}</p>`;
    turnOrderDiv.innerHTML += `<p><strong>${currentPlayerSelect.value} のターンです。</strong></p>`;
}

function endGame() {
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
        alert(`ゲーム終了！ ${maxScore} ポイントで引き分けです。`);
    } else {
        alert(`ゲーム終了！ 勝者: ${winner}、ポイント: ${maxScore}。`);
    }

    resetGame();
}

function resetGame() {
    document.getElementById('setup').style.display = 'block';
    gameDiv.style.display = 'none';
    playerNamesDiv.innerHTML = '';
}

function saveAction(action) {
    actionHistory.push(action);
}

function undoAction() {
    if (actionHistory.length === 0) {
        alert('元に戻す操作がありません。');
        return;
    }

    const lastAction = actionHistory.pop();

    switch (lastAction.type) {
        case 'score':
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            scoreHistory.pop();
            selectedBall = lastAction.ball;
            pottedBallSelect.value = lastAction.ball;
            updateRecordScoreButtonAppearance();
            break;

        case 'nextPlayer':
            currentTurnIndex = lastAction.previousTurnIndex;
            currentPlayerSelect.value = turnOrder[currentTurnIndex];
            updateTurnOrderDisplay();
            break;
        case 'comboCannonFrock':
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            scoreHistory.pop();
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
    } else if (event.target == comboCannonFrockModal) {
        comboCannonFrockModal.style.display = 'none';
    }
}

function displayScoreHistory() {
    historyContentDiv.innerHTML = '';
    if (scoreHistory.length === 0) {
        historyContentDiv.innerHTML = '<p>まだアクションが記録されていません。</p>';
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

window.onload = function() {
    openGameSettingsModal();
};

// --- コンビ・キャノン・フロック処理 ---
function openComboCannonFrockModal() {
    // Clear previous content
    comboFrockBallsContainer.innerHTML = '';

    // Determine current player
    const currentPlayer = currentPlayerSelect.value;

    // Gather all balls that have a nonzero point value for the current player
    const availableBalls = new Set();
    for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
        ['corner', 'side'].forEach(pocketType => {
            const scoreKey = `${ballNumber}_${pocketType}`;
            const points = scoringSettings[currentPlayer][scoreKey];
            if (points && points !== 0) {
                availableBalls.add(ballNumber);
            }
        });
    }

    // Create clickable ball images
    availableBalls.forEach(ballNum => {
        const btn = document.createElement('button');
        btn.className = 'pool-ball-button';
        const img = document.createElement('img');
        img.src = `/assets/${ballNum}ball.png`;
        img.alt = `Ball ${ballNum}`;
        btn.appendChild(img);

        btn.addEventListener('click', () => {
            recordComboCannonFrockScore(ballNum);
        });

        comboFrockBallsContainer.appendChild(btn);
    });

    // Show modal
    comboCannonFrockModal.style.display = 'block';
}

function closeComboCannonFrockModal() {
    comboCannonFrockModal.style.display = 'none';
}

function recordComboCannonFrockScore(ballNumber) {
    // We are now in a combo shot
    isComboShotActive = true;

    // Set the selected ball to what was chosen in the Combo/Cannon/Frock modal
    selectedBall = ballNumber;
    // Reflect that selected ball in the pottedBallSelect so the user can see it
    pottedBallSelect.value = ballNumber;
    updateRecordScoreButtonAppearance();

    // Show corner and side buttons, just like when a regular ball is selected
    cornerBtn.style.display = 'inline-block';
    sideBtn.style.display = 'inline-block';
    recordScoreBtn.classList.add('selected');

    // Finally, close the modal
    closeComboCannonFrockModal();
}
