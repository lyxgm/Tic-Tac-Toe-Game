document.addEventListener("DOMContentLoaded", () => {
    const gameboard = document.querySelectorAll(".cell");
    const restartButton = document.getElementById("restart");
    let currentPlayer = "X";
    let boardState = Array(9).fill(null);
    let gameActive = true;

    // Winning combinations
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Handle cell click
    gameboard.forEach(cell => {
        cell.addEventListener("click", () => {
            const index = cell.getAttribute("data-index");

            if (boardState[index] || !gameActive) return;

            boardState[index] = currentPlayer;
            cell.textContent = currentPlayer;

            if (checkWin()) {
                alert(`Player ${currentPlayer} wins!`);
                gameActive = false;
            } else if (boardState.every(cell => cell !== null)) {
                alert("It's a draw!");
                gameActive = false;
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
            }
        });
    });

    // Restart game
    restartButton.addEventListener("click", () => {
        boardState.fill(null);
        gameboard.forEach(cell => (cell.textContent = ""));
        currentPlayer = "X";
        gameActive = true;
    });

    // Check for a win
    function checkWin() {
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return boardState[index] === currentPlayer;
            });
        });
    }
});
