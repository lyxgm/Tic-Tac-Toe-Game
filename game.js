document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements
    const playerText = document.getElementById('playerText');
    const restartBtn = document.getElementById('reset');
    const resetScoresBtn = document.getElementById('resetScores');
    const boxes = Array.from(document.getElementsByClassName('box'));
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreTie = document.getElementById('scoreTie');
    const winnerIndicator = getComputedStyle(document.body).getPropertyValue('--winning-blocks');

    // Constants for player symbols
    const O_TEXT = "O";
    const X_TEXT = "X";

    // Game state variables
    let currentPlayer = X_TEXT;
    let spaces = Array(9).fill(null);
    let isGameActive = true;
    let scores = { X: 0, O: 0, tie: 0 };
    let moveHistory = [];

    // Winning combinations for Tic Tac Toe
    const winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Get the game mode from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const mode = queryParams.get('mode');

    // Initialize the game based on the mode
    const startGame = () => {
        boxes.forEach(box => box.addEventListener('click', boxClicked));
        updatePlayerText();
        if (mode === 'endless') {
            initializeEndlessMode();
            scoreTie.style.display = 'none'; // Hide tie score for endless mode
        } else {
            scoreTie.style.display = 'block'; // Show tie score for other modes
        }
    };

    // Handle clicks on the game board
    function boxClicked(e) {
        const id = e.target.id;

        if (mode === 'endless') {
            handleEndlessMode(id, e.target);
        } else {
            // Normal Player vs. Player or Player vs. Bot mode
            if (!spaces[id] && isGameActive) {
                spaces[id] = currentPlayer;
                e.target.innerText = currentPlayer;

                // Check for a win
                const winningBlocks = playerHasWon();
                if (winningBlocks) {
                    isGameActive = false;
                    playerText.innerHTML = `Player ${currentPlayer} has won!`;
                    winningBlocks.forEach(box => boxes[box].style.backgroundColor = winnerIndicator);
                    updateScores(currentPlayer);
                    return;
                }

                // Check for a tie
                if (!spaces.includes(null)) {
                    playerText.innerHTML = 'It\'s a Tie!';
                    updateScores('tie');
                    return;
                }

                // Switch players
                currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
                updatePlayerText();

                // Bot move if in Player vs. Bot mode
                if (mode === 'vs-bot' && currentPlayer === O_TEXT) {
                    botMove();
                }
            }
        }
    }

    // Handling Endless Mode Moves
    function handleEndlessMode(id, box) {
        if (spaces[id] !== null) return;
    
        spaces[id] = currentPlayer;
        moveHistory.push(id);
        box.innerText = currentPlayer;
    
        // Check for a win
        const winningBlocks = playerHasWon();
        if (winningBlocks) {
            isGameActive = false;
            playerText.innerHTML = `Player ${currentPlayer} wins!`;
            winningBlocks.forEach(box => boxes[box].style.backgroundColor = winnerIndicator);
            updateScores(currentPlayer);
            return;
        }
    
        // Remove oldest move if the board is full
        if (moveHistory.length === 9) {
            removeOldestMove();
        }
    
        // Check for a tie after removing the oldest move
        if (!spaces.includes(null)) {
            playerText.innerHTML = 'It\'s a Tie!';
            updateScores('tie');
            resetGame();
            return;
        }
    
        // Switch players
        currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
        updatePlayerText();
    }
    

    // Remove the oldest move in Endless mode
    function removeOldestMove() {
        const oldestMoveIndex = moveHistory.shift();
        spaces[oldestMoveIndex] = null;
        document.querySelector(`.box[id="${oldestMoveIndex}"]`).innerText = '';
    }
    

    // Update the score display
    function updateScores(result) {
        if (result === 'X' || result === 'O') {
            scores[result]++;
        } else if (result === 'tie') {
            scores.tie++;
        }
        scoreX.innerText = `Player X: ${scores.X}`;
        scoreO.innerText = `Player O: ${scores.O}`;
        if (mode !== 'endless') {
            scoreTie.innerText = `Ties: ${scores.tie}`;
        }
    }

    // Make a move for the bot in Player vs. Bot mode
    function botMove() {
        const bestMove = findBestMove();
        if (bestMove !== null) {
            makeMove(bestMove);
        }
    }

    // Find the best move for the bot using the minimax algorithm
    function findBestMove() {
        const depthLimit = 3;
        let bestVal = -Infinity;
        let bestMove = null;

        for (let i = 0; i < spaces.length; i++) {
            if (spaces[i] === null) {
                spaces[i] = O_TEXT;
                const moveVal = minimax(spaces, 0, false, depthLimit);
                spaces[i] = null;

                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    }

    // Minimax algorithm to determine the best move for the bot
    function minimax(board, depth, isMaximizing, depthLimit) {
        const scores = { 'X': -10, 'O': 10, 'tie': 0 };

        const result = checkWinner();
        if (result !== null) return scores[result];

        if (depth >= depthLimit) return scores['tie'];

        if (isMaximizing) {
            let best = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = O_TEXT;
                    best = Math.max(best, minimax(board, depth + 1, false, depthLimit));
                    board[i] = null;
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = X_TEXT;
                    best = Math.min(best, minimax(board, depth + 1, true, depthLimit));
                    board[i] = null;
                }
            }
            return best;
        }
    }

    // Check if there is a winner
    function checkWinner() {
        for (const condition of winningCombos) {
            const [a, b, c] = condition;
            if (spaces[a] && spaces[a] === spaces[b] && spaces[a] === spaces[c]) {
                return spaces[a];
            }
        }
        if (!spaces.includes(null)) {
            return 'tie';
        }
        return null;
    }

    // Make a move for the current player
    function makeMove(index) {
        spaces[index] = currentPlayer;
        boxes[index].innerText = currentPlayer;

        // Check for a win
        const winningBlocks = playerHasWon();
        if (winningBlocks) {
            isGameActive = false;
            playerText.innerHTML = `Player ${currentPlayer} has won!`;
            winningBlocks.forEach(box => boxes[box].style.backgroundColor = winnerIndicator);
            updateScores(currentPlayer);
            return;
        }

        // Check for a tie
        if (!spaces.includes(null)) {
            playerText.innerHTML = 'It\'s a Tie!';
            updateScores('tie');
            return;
        }

        // Switch players
        currentPlayer = X_TEXT;
        updatePlayerText();
    }

    // Update the player text display
function updatePlayerText() {
    let modeText = '';

    // Set modeText based on the game mode
    if (mode === 'endless') {
        modeText = 'Endless Mode';
    } else if (mode === 'vs-bot') {
        modeText = 'Player vs Bot';
    } else if (mode === 'vs-player') {
        modeText = 'Player vs Player';
    }

    playerText.innerHTML = `${modeText} - Player ${currentPlayer}'s turn`;
}

    // Check if a player has won
    function playerHasWon() {
        for (const condition of winningCombos) {
            const [a, b, c] = condition;
            if (spaces[a] && spaces[a] === spaces[b] && spaces[a] === spaces[c]) {
                return [a, b, c];
            }
        }
        return false;
    }

    // Restart the game
    function restart() {
        if (mode === 'endless') {
            resetGame();
        } else {
            spaces.fill(null);
            isGameActive = true;

            boxes.forEach(box => {
                box.innerText = '';
                box.style.backgroundColor = '';
            });
            currentPlayer = X_TEXT;
            updatePlayerText();
        }
    }

    // Reset the game
    function resetGame() {
        spaces.fill(null);
        moveHistory = [];
        isGameActive = true;
        boxes.forEach(box => {
            box.innerText = '';
            box.style.backgroundColor = '';
        });
        currentPlayer = X_TEXT;
        updatePlayerText();
        
        // Ensure tie score visibility matches the mode after reset
        if (mode === 'endless') {
            scoreTie.style.display = 'none';
        } else {
            scoreTie.style.display = 'block';
        }
    }

    // Reset scores
    function resetScores() {
        scores = { X: 0, O: 0, tie: 0 };
        updateScores();
    }

    // Event listeners for buttons
    restartBtn.addEventListener('click', restart);
    resetScoresBtn.addEventListener('click', resetScores);

    startGame();
});