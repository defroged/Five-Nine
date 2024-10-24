// DOM要素への参照を取得
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



// ゲームの状態を保持するための変数
let players = [];
let scores = {};
let turnOrder = [];
let currentTurnIndex = 0;
let totalRacks = 0;
let gameType = 'standard';
let actionHistory = []; // 元に戻す機能のため
let scoreHistory = []; // スコア履歴を見るため

// イベントリスナー
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
pottedBallSelect.addEventListener('change', updateRecordScoreButtonAppearance);


function updateRecordScoreButtonText() {
    const selectedBall = pottedBallSelect.value;
    recordScoreBtn.textContent = selectedBall;
}

function updateRecordScoreButtonAppearance() {
    const selectedBall = pottedBallSelect.value;
    const ballImage = document.getElementById('ballImage');

    // Set the corresponding image for each ball
    switch (selectedBall) {
        case '3':
            ballImage.src = '/assets/3ball.png';
            break;
        case '5':
            ballImage.src = '/assets/5ball.png';
            break;
        case '7':
            ballImage.src = '/assets/7ball.png';
            break;
        case '9':
            ballImage.src = '/assets/9ball.png';
            break;
        default:
            ballImage.src = '';
            break;
    }
}



function generatePlayerInputs() {
    playerNamesDiv.innerHTML = '';
    const numPlayers = parseInt(numPlayersSelect.value);
    for (let i = 1; i <= numPlayers; i++) {
        const label = document.createElement('label');
        label.textContent = `プレイヤー ${i}:`;
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
        const playerName = document.getElementById(`player${i}`).value || `プレイヤー ${i}`;
        players.push(playerName);
        scores[playerName] = 0;
    }

    // 順番設定
    turnOrder = [...players];

    // スコアボード設定
    updateScoreBoard();

    // 現在のプレイヤー選択を設定
    currentPlayerSelect.innerHTML = '';
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        currentPlayerSelect.appendChild(option);
    });

    // ポットされたボールオプションを設定
    updatePottedBallOptions();

    // ゲーム画面を表示、設定画面を非表示
    document.getElementById('setup').style.display = 'none';
    gameDiv.style.display = 'block';

    updateTurnOrderDisplay();
}

function updatePottedBallOptions() {
    // 既存オプションをクリア
    pottedBallSelect.innerHTML = '';

    // スタンダードボール
    let balls = ['5', '9'];

    // カスタムゲームの場合、3番と7番を含む
    if (gameType === 'custom') {
        balls = ['3', '5', '7', '9'];
    }

    // ポットされたボールセレクトを設定
    balls.forEach(ball => {
        const option = document.createElement('option');
        option.value = ball;
        option.textContent = ball;
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

function recordScore() {
    const player = currentPlayerSelect.value;
    const ball = pottedBallSelect.value;
    const pocket = pocketTypeSelect.value;

    let points = 0;

    // ルールに基づいてポイント計算
    if (ball === '5') {
        points = pocket === 'corner' ? 1 : 2;
    } else if (ball === '9') {
        points = pocket === 'corner' ? 2 : 4;
    } else if (gameType === 'custom' && (ball === '3' || ball === '7')) {
        // カスタムボールの場合のポイント設定
        points = 1; // カスタムルールに基づいて調整
    }

    // 元に戻すための現在の状態を保存
    saveAction({
        type: 'score',
        player: player,
        points: points,
        scoresSnapshot: { ...scores },
        ball: ball,
        pocket: pocket
    });

    // スコアを更新
    scores[player] += points;

    // 3名以上のプレイヤーの場合、他のプレイヤーからポイントを引く
    if (players.length >= 3) {
        players.forEach(p => {
            if (p !== player) {
                scores[p] -= points;
            }
        });
    }

    updateScoreBoard();

    // スコア履歴に追加
    scoreHistory.push(`${player}は${ball}番を${pocket === 'corner' ? 'コーナー' : 'サイド'}ポケットに入れて、${points} ポイント獲得。`);

    // 次のボールを自動的に選択
    const options = Array.from(pottedBallSelect.options);
    const currentIndex = options.findIndex(option => option.value === ball);

    // 次のインデックスを計算
    let nextIndex = (currentIndex + 1) % options.length;

    // 選択を次のボールに変更
    // Change the selected ball to the next one
    pottedBallSelect.selectedIndex = nextIndex;

    // Update the button text to reflect the new selection
    updateRecordScoreButtonAppearance();
}

function recordScratch() {
    const player = currentPlayerSelect.value;

    // 元に戻すための現在の状態を保存
    saveAction({
        type: 'scratch',
        player: player,
        scoresSnapshot: { ...scores }
    });

    // スコア履歴に追加
    scoreHistory.push(`${player}はスクラッチしました。ポイントはありません。`);

    // スクラッチ後、ターンを次のプレイヤーに渡す
    nextTurn();
}

function nextPlayer() {
    // 元に戻すための現在の状態を保存
    saveAction({
        type: 'nextPlayer',
        previousTurnIndex: currentTurnIndex
    });

    // 手動で次のプレイヤーに移行
    nextTurn();
}

function nextTurn() {
    totalRacks++;

    // ルールに基づいて順番を更新
    if (players.length === 3 && totalRacks % 5 === 0) {
        turnOrder.reverse();
        alert('5ゲーム後、順番が逆になります。');
    } else if (players.length === 4 && totalRacks % 10 === 0) {
        // じゃんけんで順番を決める（未実装）
        alert('10ゲーム後、じゃんけんで順番を決めてください。');
    }

    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    currentPlayerSelect.value = turnOrder[currentTurnIndex];

    updateTurnOrderDisplay();
}

function updateTurnOrderDisplay() {
    turnOrderDiv.innerHTML = `<p>現在の順番: ${turnOrder.join(' ➔ ')}</p>`;
    // 現在のプレイヤーを強調表示
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
        } else if (scores[player] === maxScore) {
            tie = true;
        }
    });

    if (tie) {
        alert(`Game over! It's a tie with ${maxScore} points.`);
    } else {
        const multiplier = prompt(`Enter the points multiplier for the final result (e.g., 2 for double points):`, '1');
        const finalScore = maxScore * parseInt(multiplier);
        alert(`Game over! The winner is ${winner} with ${finalScore} points (multiplier: ${multiplier}).`);
    }

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
        alert('元に戻す操作がありません。');
        return;
    }

    const lastAction = actionHistory.pop();

    switch (lastAction.type) {
        case 'score':
            // スコアを復元
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            // スコア履歴から最後のエントリを削除
            scoreHistory.pop();
            break;
        case 'scratch':
            // スコアを復元（変更があれば）
            scores = lastAction.scoresSnapshot;
            updateScoreBoard();
            // ターンの変更を元に戻す
            currentTurnIndex = (currentTurnIndex - 1 + players.length) % players.length;
            currentPlayerSelect.value = turnOrder[currentTurnIndex];
            updateTurnOrderDisplay();
            // スコア履歴から最後のエントリを削除
            scoreHistory.pop();
            break;
        case 'nextPlayer':
            // 前のターンインデックスを復元
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

// ページ読み込み時にプレイヤー入力を初期化
generatePlayerInputs();

function handleFoul(foulType) {
    // Save current state for undo functionality
    saveAction({
        type: 'foul',
        foulType: foulType,
        scoresSnapshot: { ...scores },
        turnIndex: currentTurnIndex,
    });

    if (foulType === 'scratch') {
        alert("Scratch! Move the cue ball to the kitchen and proceed.");

    // Pass turn to the next player
    nextTurn();
}

// Event listeners for fouls
document.getElementById('scratch').addEventListener('click', () => handleFoul('scratch'));


function recordCombinationShot(type) {
    const player = currentPlayerSelect.value;
    const ball = pottedBallSelect.value;
    const pocket = pocketTypeSelect.value;
    let points = 0;

    if (type === 'combo' || type === 'cannon' || type === 'block') {
        points = 1; // For simplicity, assign 1 point for valid combinations.
        alert(`${type} shot!`);
    }

    saveAction({
        type: 'combinationShot',
        player: player,
        shotType: type,
        points: points,
        scoresSnapshot: { ...scores },
        ball: ball,
        pocket: pocket
    });

    // Update score
    scores[player] += points;
    updateScoreBoard();
    scoreHistory.push(`${player} scored ${points} points with a ${type} shot.`);
}

document.getElementById('comboShot').addEventListener('click', () => recordCombinationShot('combo'));
document.getElementById('cannonShot').addEventListener('click', () => recordCombinationShot('cannon'));
document.getElementById('blockShot').addEventListener('click', () => recordCombinationShot('block'));

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
        td.textContent = scores[player];  // Display simple numeric values
        scoreRow.appendChild(td);
    });
    table.appendChild(scoreRow);

    scoreBoardDiv.appendChild(table);
}

