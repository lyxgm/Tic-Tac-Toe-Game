document.addEventListener('DOMContentLoaded', () => {
    const playerText = document.getElementById('playerText');
    const restartBtn = document.getElementById('reset');
    const boxes = Array.from(document.getElementsByClassName('box'));
    const winnerIndicator = getComputedStyle(document.body).getPropertyValue('--button-hover');

    const O_TEXT = "O";
    const X_TEXT = "X";
    let currentPlayer = X_TEXT;
    let spaces = Array(9).fill(null);
    let isGameActive = true;

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

    const queryParams = new URLSearchParams(window.location.search);
    const mode = queryParams.get('mode'); // Check the game mode

    const startGame = () => {
        boxes.forEach(box => box.addEventListener('click', boxClicked));
        updatePlayerText();
    };

    function boxClicked(e) {
        const id = e.target.id;

        if (!spaces[id] && isGameActive) {
            spaces[id] = currentPlayer;
            e.target.innerText = currentPlayer;

            const winningBlocks = playerHasWon();
            if (winningBlocks) {
                isGameActive = false;
                playerText.innerHTML = `Player ${currentPlayer} has won!`;
                winningBlocks.forEach(box => boxes[box].classList.add('winner'));
                return;
            }

            if (!spaces.includes(null)) {
                playerText.innerHTML = 'It\'s a Tie!';
                return;
            }

            currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
            updatePlayerText();

            if (mode === 'vs-bot' && currentPlayer === O_TEXT) {
                botMove();
            }
        }
    }

    function botMove() {
        const bestMove = findBestMove();
        if (bestMove !== null) {
            makeMove(bestMove);
        }
    }

    function findBestMove() {
        const depthLimit = 3; // Limit the depth to make it less challenging
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

    function minimax(board, depth, isMaximizing, depthLimit) {
        const scores = { 'X': -10, 'O': 10, 'tie': 0 };

        const result = checkWinner();
        if (result !== null) return scores[result];

        if (depth >= depthLimit) return scores['tie']; // Limit the depth of the search

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

    function makeMove(index) {
        spaces[index] = currentPlayer;
        boxes[index].innerText = currentPlayer;

        const winningBlocks = playerHasWon();
        if (winningBlocks) {
            isGameActive = false;
            playerText.innerHTML = `Player ${currentPlayer} has won!`;
            winningBlocks.forEach(box => boxes[box].classList.add('winner'));
            return;
        }

        if (!spaces.includes(null)) {
            playerText.innerHTML = 'It\'s a Tie!';
            return;
        }

        currentPlayer = X_TEXT;
        updatePlayerText();
    }

    function updatePlayerText() {
        playerText.innerHTML = `Player ${currentPlayer}'s turn`;
    }

    function playerHasWon() {
        for (const condition of winningCombos) {
            const [a, b, c] = condition;
            if (spaces[a] && spaces[a] === spaces[b] && spaces[a] === spaces[c]) {
                return [a, b, c];
            }
        }
        return false;
    }

    function restart() {
        spaces.fill(null);
        isGameActive = true;

        boxes.forEach(box => {
            box.innerText = '';
            box.classList.remove('winner'); // Remove winner class on restart
        });

        currentPlayer = X_TEXT;
        updatePlayerText();
    }

    restartBtn.addEventListener('click', restart);
    startGame();
});
