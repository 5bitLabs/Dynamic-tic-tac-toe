document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const resetButton = document.getElementById("reset-btn");
    const movesList = document.getElementById("moves-list");
    const infoBox = document.getElementById("info-box");
    const gameInfo = document.getElementById("game-info");

    let gameBoard, moveSequence, moveCount, currentPlayer, gameActive;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function initializeGame() {
        gameBoard = ["", "", "", "", "", "", "", "", ""];
        moveSequence = [];
        moveCount = 0;
        currentPlayer = "O";
        gameActive = true;
        movesList.innerHTML = "";
        updateStatus();

        board.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove("win-highlight");
            cell.addEventListener("click", handleCellClick);
        });
    }

    function updateStatus() {
        statusText.innerHTML = `Player <span style="color: ${currentPlayer === "O" ? "#3a86ff" : "#ff006e"};">${currentPlayer}</span>'s Turn`;
    }

    window.toggleInfo = function () {
        infoBox.style.display = infoBox.style.display === "none" ? "block" : "none";
        // gameInfo.style.display = gameInfo.style.display === "none" ? "block" : "none";
    };

    function handleCellClick(event) {
        if (!gameActive) return;

        const index = [...board].indexOf(event.target);
        if (gameBoard[index] !== "") return;

        makeMove(index);
    }

    let soundEnabled = true;
    const moveSound = new Audio("move.mp3");

    function toggleSound() {
        soundEnabled = !soundEnabled;
        const soundIcon = document.getElementById("sound-icon");

        // Toggle sound icon class
        soundIcon.classList.toggle("fa-volume-up", soundEnabled);
        soundIcon.classList.toggle("fa-volume-mute", !soundEnabled);
    }

    function playMoveSound() {
        if (soundEnabled) {
            moveSound.currentTime = 0;  // Reset to start for quick replays
            moveSound.play();
        }
    }

    const winSound = new Audio("win.mp3");

    function playWinSound() {
        if (soundEnabled) {
            winSound.currentTime = 0;  // Reset to start for quick replays
            winSound.play();
        }
    }

    // Attach event listener (if using <button>)
    document.getElementById("sound-toggle").addEventListener("click", toggleSound);

    function makeMove(cellIndex) {
        if (!gameActive || gameBoard[cellIndex] !== "") return;

        playMoveSound();

        gameBoard[cellIndex] = currentPlayer;
        const cell = board[cellIndex];
        cell.textContent = currentPlayer;
        cell.style.color = currentPlayer === "O" ? "#3a86ff" : "#ff006e";

        moveCount++;
        const moveNumberSpan = document.createElement("span");
        moveNumberSpan.classList.add("move-number");
        moveNumberSpan.textContent = moveCount;
        cell.appendChild(moveNumberSpan);

        moveSequence.push({ index: cellIndex, player: currentPlayer, moveNumber: moveCount });

        addMoveToHistory(currentPlayer, cellIndex, moveCount);

        // If more than 6 moves, remove the oldest one
        if (moveSequence.length > 6) {
            removeOldestMove();
        }

        // After move removal, recheck for a valid win
        if (checkWinner(currentPlayer)) {
            highlightWinningCells(currentPlayer);
            statusText.innerHTML = `Player <span style="color: ${currentPlayer === "O" ? "#3a86ff" : "#ff006e"};">${currentPlayer}</span> Wins..! 🎉`;
            playWinSound();
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus();
    }

    function removeOldestMove() {
        if (moveSequence.length === 0) return;
    
        let oldestMove = moveSequence.shift(); // Remove the first (oldest) move
        let cellIndex = oldestMove.index;
        let player = oldestMove.player;
        let moveNum = oldestMove.moveNumber;
    
        // Remove only from the board, NOT from the move history
        if (!board[cellIndex].classList.contains("win-highlight")) {
            gameBoard[cellIndex] = "";
            board[cellIndex].innerText = "";
    
            // Add to removal history
            addRemovalToHistory(player, cellIndex, moveNum);
        }
    }
    

    window.goHome = function () {
        window.location.href = "index.html"; // Change if home page has a different filename
    }

    function checkWinner(player) {
        return winningConditions.some(condition => condition.every(index => gameBoard[index] === player));
    }

    function highlightWinningCells(player) {
        for (const condition of winningConditions) {
            if (condition.every(index => gameBoard[index] === player)) {
                condition.forEach(index => {
                    board[index].classList.add("win-highlight");
                });
                gameActive = false;
                break;
            }
        }
    }

    function addMoveToHistory(player, cellIndex, moveNum) {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        moveItem.innerHTML = `
            <span>Move #${moveNum}</span>
            <span class="move-player ${player.toLowerCase()}">${player} → Cell ${cellIndex + 1}</span>
        `;
        movesList.appendChild(moveItem);
        movesList.scrollTop = movesList.scrollHeight;
    }

    function addRemovalToHistory(player, cellIndex, moveNum) {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        moveItem.innerHTML = `
            <span>Removed #${moveNum}</span>
            <span class="move-player ${player.toLowerCase()}">${player} ← Cell ${cellIndex + 1}</span>
        `;
        movesList.appendChild(moveItem);
        // Scroll to bottom
        movesList.scrollTop = movesList.scrollHeight;
    }
    

    function resetGame() {
        gameActive = false;
        setTimeout(() => {
            board.forEach(cell => {
                cell.classList.remove("win-highlight");
                cell.innerText = "";
                cell.removeEventListener("click", handleCellClick);
            });
            initializeGame();
        }, 500);
    }

    resetButton.addEventListener("click", resetGame);
    initializeGame();
});
