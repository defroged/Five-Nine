const gameDiv = document.getElementById('game');
const scoreBoardDiv = document.getElementById('scoreBoard');
const actionsDiv = document.getElementById('actions');
const currentPlayerSelect = document.getElementById('currentPlayer');
const pottedBallSelect = document.getElementById('pottedBall');
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
const cornerBtn = document.getElementById('cornerBtn');
const sideBtn = document.getElementById('sideBtn');
const gameSettingsModal = document.getElementById('gameSettingsModal');
const gameSettingsContent = document.getElementById('gameSettingsContent');

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


recordScoreBtn.addEventListener('click', selectBall);
scratchBtn.addEventListener('click', recordScratch);
nextPlayerBtn.addEventListener('click', nextPlayer);
undoBtn.addEventListener('click', undoAction);
viewHistoryBtn.addEventListener('click', openHistoryModal);
closeModalBtn.addEventListener('click', closeHistoryModal);
window.addEventListener('click', outsideClick);
endGameBtn.addEventListener('click', endGame);
pottedBallSelect.addEventListener('change', updateRecordScoreButtonAppearance);

cornerBtn.addEventListener('click', function() {
    recordScore('corner');
});

sideBtn.addEventListener('click', function() {
    recordScore('side');
});

function openGameSettingsModal() {
    gameSettingsModal.style.display = 'block';
    showSettingsPage1();
}

function showSettingsPage1() {
    gameSettingsContent.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'プレイヤー設定';
    gameSettingsContent.appendChild(heading);

    // Number of players selection
    const numPlayersLabel = document.createElement('label');
    numPlayersLabel.textContent = 'プレイヤー人数:';
    gameSettingsContent.appendChild(numPlayersLabel);

    const numPlayersSelect = document.createElement('select');
    numPlayersSelect.id = 'numPlayers';
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '名描き';
        if (i === 2) option.selected = true; // default to 2 players
        numPlayersSelect.appendChild(option);
    }
    gameSettingsContent.appendChild(numPlayersSelect);

    // Player names inputs
    const playerNamesDiv = document.createElement('div');
    playerNamesDiv.id = 'playerNames';
    gameSettingsContent.appendChild(playerNamesDiv);

    // Generate initial player inputs
    generatePlayerInputsSettings(numPlayersSelect.value);

    // Update player inputs when number of players changes
    numPlayersSelect.addEventListener('change', function() {
        generatePlayerInputsSettings(numPlayersSelect.value);
    });

    // Next button to go to page 2
    const nextButton = document.createElement('button');
    nextButton.textContent = '次へ';
    nextButton.addEventListener('click', showSettingsPage2);
    gameSettingsContent.appendChild(nextButton);
}

function generatePlayerInputsSettings(numPlayers) {
    const playerNamesDiv = document.getElementById('playerNames');
    playerNamesDiv.innerHTML = '';

    numPlayers = parseInt(numPlayers);
    for (let i = 1; i <= numPlayers; i++) {
        const label = document.createElement('label');
        label.textContent = `プレイヤー ${i}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `プレイヤー ${i}`;
        playerNamesDiv.appendChild(label);
        playerNamesDiv.appendChild(input);
    }
}

function showSettingsPage2() {
    // Collect player names from page 1
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    players = [];
    for (let i = 1; i <= numPlayers; i++) {
        const playerNameInput = document.getElementById(`player${i}`);
        const playerName = playerNameInput.value.trim() || `プレイヤー ${i}`;
        players.push(playerName);
    }

    gameSettingsContent.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = 'ゲームタイプとスコア設定';
    gameSettingsContent.appendChild(heading);

    // Game type selection
    const gameTypeLabel = document.createElement('label');
    gameTypeLabel.textContent = 'ゲームタイプを選択:';
    gameSettingsContent.appendChild(gameTypeLabel);

    const gameTypeSelect = document.createElement('select');
    gameTypeSelect.id = 'gameType';
    const optionStandard = document.createElement('option');
    optionStandard.value = 'standard';
    optionStandard.textContent = 'スタンダード(5-9)';
    gameTypeSelect.appendChild(optionStandard);

    const optionCustom = document.createElement('option');
    optionCustom.value = 'custom';
    optionCustom.textContent = 'カスタム';
    gameTypeSelect.appendChild(optionCustom);

    gameSettingsContent.appendChild(gameTypeSelect);

    // Score settings table
    const scoreTableDiv = document.createElement('div');
    scoreTableDiv.id = 'scoreTableDiv';
    gameSettingsContent.appendChild(scoreTableDiv);

    // Generate initial score table
    generateScoreSettingsTable(gameTypeSelect.value);

    // Update score table when game type changes
    gameTypeSelect.addEventListener('change', function() {
        generateScoreSettingsTable(gameTypeSelect.value);
    });

    // Back button to go back to page 1
    const backButton = document.createElement('button');
    backButton.textContent = '戻る';
    backButton.addEventListener('click', showSettingsPage1);
    gameSettingsContent.appendChild(backButton);

    // Start Game button
    const startGameButton = document.createElement('button');
    startGameButton.textContent = 'ゲーム開始';
    startGameButton.addEventListener('click', startGame);
    gameSettingsContent.appendChild(startGameButton);
}

function generateScoreSettingsTable(gameType) {
    const scoreTableDiv = document.getElementById('scoreTableDiv');
    scoreTableDiv.innerHTML = '';

    const table = document.createElement('table');
    table.id = 'scoreSettingsTable';

    // Create header row
    const headerRow = document.createElement('tr');

    // First header cell: "プレイヤー名"
    const playerNameHeader = document.createElement('th');
    playerNameHeader.textContent = 'プレイヤー名';
    headerRow.appendChild(playerNameHeader);

    // Next headers: "1番コーナー", "1番サイド", ..., "9番サイド"
    for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
        ['コーナー', 'サイド'].forEach(pocketType => {
            const headerCell = document.createElement('th');
            headerCell.textContent = `${ballNumber}番${pocketType}`;
            headerRow.appendChild(headerCell);
        });
    }
    table.appendChild(headerRow);

    // For each player, create a row
    players.forEach(player => {
        const row = document.createElement('tr');

        // Player name cell
        const playerNameCell = document.createElement('td');
        playerNameCell.textContent = player;
        row.appendChild(playerNameCell);

        // For each ball and pocket type, create an input cell
        for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
            ['corner', 'side'].forEach(pocketType => {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                input.id = `score_${player}_${ballNumber}_${pocketType}`;
                input.style.width = '50px';
                // Set default values based on game type
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
                cell.appendChild(input);
                row.appendChild(cell);
            });
        }

        table.appendChild(row);
    });

    scoreTableDiv.appendChild(table);
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
    // Get gameType from the select in the modal
    gameType = document.getElementById('gameType').value;

    // Initialize scores
    scores = {};
    players.forEach(player => {
        scores[player] = 0;
    });

    // Collect scoring settings from the table
    scoringSettings = {};

    // For each player, get the scoring settings
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

    // Now that scoringSettings is populated, update the potted ball options
    updatePottedBallOptions();

    // Check if there are any balls with points
    if (pottedBallSelect.options.length === 0) {
        alert('ポイントが設定されたボールがありません。ゲームを開始できません。');
        return;
    }

    // Turn order
    turnOrder = [...players];
    currentTurnIndex = 0;
    totalRacks = 0;
    actionHistory = [];
    scoreHistory = [];

    updateScoreBoard();

    // Update current player select options
    currentPlayerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        currentPlayerSelect.appendChild(option);
    });

    // Hide the modal
    gameSettingsModal.style.display = 'none';

    // Show the game interface
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
    updateRecordScoreButtonAppearance();
}



function updatePottedBallOptions() {
    pottedBallSelect.innerHTML = '';

    // Create a Set to store unique ball numbers that have non-zero points
    const ballsWithPoints = new Set();

    // Loop through all players' scoring settings
    players.forEach(player => {
        for (let ballNumber = 1; ballNumber <= 9; ballNumber++) {
            ['corner', 'side'].forEach(pocketType => {
                const scoreKey = `${ballNumber}_${pocketType}`;
                const points = scoringSettings[player][scoreKey];
                if (points && points !== 0) {
                    ballsWithPoints.add(ballNumber);
                }
            });
        }
    });

    // Convert the Set to an array and sort it
    const ballsArray = Array.from(ballsWithPoints).sort((a, b) => a - b);

    // Populate the pottedBallSelect dropdown
    ballsArray.forEach(ballNumber => {
        const option = document.createElement('option');
        option.value = ballNumber;
        option.textContent = ballNumber;
        pottedBallSelect.appendChild(option);
    });

    updateRecordScoreButtonAppearance();
}



function updateScoreBoard() {
    scoreBoardDiv.innerHTML = '<h3>スコアボード</h3>';
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

function recordScore(pocket) {
    const player = currentPlayerSelect.value;
    const ball = selectedBall; 

    if (!ball) {
        alert('ボールが選択されていません。');
        return;
    }

    // Retrieve the points from scoringSettings
    const scoreKey = `${ball}_${pocket}`;
    let points = scoringSettings[player][scoreKey] || 0;

    saveAction({
        type: 'score',
        player: player,
        points: points,
        scoresSnapshot: { ...scores },
        ball: ball,
        pocket: pocket
    });

    scores[player] += points;

    if (players.length >= 3) {
        players.forEach(p => {
            if (p !== player) {
                scores[p] -= points;
            }
        });
    }

    updateScoreBoard();

    scoreHistory.push(`${player}は${ball}番を${pocket === 'corner' ? 'コーナー' : 'サイド'}ポケットに入れて、${points} ポイント獲得。`);

    const options = Array.from(pottedBallSelect.options);
    const currentIndex = options.findIndex(option => option.value === ball);

    let nextIndex = (currentIndex + 1) % options.length;

    pottedBallSelect.selectedIndex = nextIndex;

    updateRecordScoreButtonAppearance();

    cornerBtn.style.display = 'none';
    sideBtn.style.display = 'none';
    recordScoreBtn.classList.remove('selected');
    selectedBall = null;
    updateRecordScoreButtonAppearance();
}



function recordScratch() {
    const player = currentPlayerSelect.value;

    saveAction({
        type: 'scratch',
        player: player,
        scoresSnapshot: { ...scores }
    });

    scoreHistory.push(`${player}はスクラッチしました。ポイントはありません。`);

    nextTurn();
}

function nextPlayer() {
    saveAction({
        type: 'nextPlayer',
        previousTurnIndex: currentTurnIndex
    });

    nextTurn();
}

function nextTurn() {
    totalRacks++;

    if (players.length === 3 && totalRacks % 5 === 0) {
        turnOrder.reverse();
        alert('5ゲーム後、順番が逆になります。');
    } else if (players.length === 4 && totalRacks % 10 === 0) {
        alert('10ゲーム後、じゃんけんで順番を決めてください。');
    }

    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    currentPlayerSelect.value = turnOrder[currentTurnIndex];

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
            break;
        case 'scratch':
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            currentTurnIndex = (currentTurnIndex - 1 + players.length) % players.length;
            currentPlayerSelect.value = turnOrder[currentTurnIndex];
            updateTurnOrderDisplay();
            scoreHistory.pop();
            break;
        case 'nextPlayer':
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

// Open the game settings modal when the page loads
window.onload = function() {
    openGameSettingsModal();
};
