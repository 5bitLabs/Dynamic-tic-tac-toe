document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    const resetButton = document.getElementById("reset-btn");
    const movesList = document.getElementById('moves-list');
    const switchSidesBtn = document.getElementById('switch-sides-btn');
    const infoBox = document.getElementById("info-box");

    let gameBoard, moves, currentPlayer, gameActive;
    let moveSequence = [];
    let moveCount = 0;

    gameBoard = ["", "", "", "", "", "", "", "", ""];
    moves = [];
    moveSequence = [];
    moveCount = 0;
    currentPlayer = "O";  // User starts as "O"
    gameActive = true;
    updateStatus();

    
    // function toggleInfo() {
    //     const infoBox = document.getElementById("info-box");
    //     infoBox.style.display = infoBox.style.display === "none" ? "block" : "none";
    // }

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function initializeGame() {
        gameBoard = ["", "", "", "", "", "", "", "", ""];
        moves = [];
        moveSequence = [];
        moveCount = 0;
        currentPlayer = "O";  // User starts as "O"
        gameActive = true;
        updateStatus();

        board.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove("win-highlight");
            cell.addEventListener("click", handleCellClick);
        });
    }

    window.toggleInfo = function () {
        infoBox.style.display = infoBox.style.display === "none" ? "block" : "none";
    };

    window.goHome = function () {
        window.location.href = "fp.html"; // Change if home page has a different filename
    }

    // Switch sides button
    switchSidesBtn.addEventListener('click', () => {
        switchPlayerSides();
    });

    // Switch player sides
    function switchPlayerSides() {
        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
        // aiSymbol = aiSymbol === 'O' ? 'X' : 'O';
        updateStatus();
        resetGame();
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

    // Attach event listener (if using <button>)
    document.getElementById("sound-toggle").addEventListener("click", toggleSound);

    const winSound = new Audio("win.mp3");

    function playWinSound() {
        winSound.currentTime = 0;  // Reset to start for quick replays
        winSound.play();
    }

    function updateStatus() {
        if (currentPlayer === "O") {
            statusText.innerHTML = `Your (<span style="color: #3a86ff;">O</span>'s) Turn`;
        } 
        else {
            statusText.innerHTML = `AI (<span style="color: #ff006e;">X</span>) is thinking... 🤖`;
        }
    }

    function handleCellClick(event) {
        if (!gameActive) return;
    
        const index = [...board].indexOf(event.target);
        if (gameBoard[index] !== "") return;
    
        makeMove(index, false);
    }
    
    function makeMove(cellIndex, isAI = false) {
        if (!gameActive || gameBoard[cellIndex] !== '') return;

        playMoveSound();
    
        // Update game state
        gameBoard[cellIndex] = currentPlayer;
        const cell = board[cellIndex];
        cell.textContent = currentPlayer;
        cell.style.color = currentPlayer === 'O' ? '#3a86ff' : '#ff006e';
    
        // Add move number inside the cell
        moveCount++;
        const moveNumberSpan = document.createElement('span');
        moveNumberSpan.classList.add('move-number');
        moveNumberSpan.textContent = moveCount;
        cell.appendChild(moveNumberSpan);
    
        // Track move sequence
        moveSequence.push({ index: cellIndex, player: currentPlayer, moveNumber: moveCount, isAI });
    
        if (moveSequence.length > 6) {
            removeOldestMove();
        }
    
        // **Check for winner AFTER removing the oldest move**
        if (checkWinner(currentPlayer)) {
            highlightWinningCells(currentPlayer);
            statusText.innerHTML = currentPlayer === 'O' ? 
                "You (<span style='color: #3a86ff;'>O</span>) Won..! 🎉" : 
                "AI (<span style='color: #ff006e;'>X</span>) Wins..! 🤖🎉";
            playWinSound()
            gameActive = false;
            return;
        }
        
        addMoveToHistory(currentPlayer, cellIndex, moveCount, isAI);
        
        // Switch turn
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();

        // AI Move
        if (currentPlayer === 'X' && gameActive) {
            setTimeout(aiMove, 800);
        }
    }

    // Add move to history
    function addMoveToHistory(player, cellIndex, moveNum, isAI) {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        moveItem.innerHTML = `
        <span>Move #${moveNum}</span>
        <span class="move-player ${player.toLowerCase()}">${player}${isAI ? ' (AI)' : ''} → Cell ${cellIndex + 1}</span>
        `;
        movesList.appendChild(moveItem);
        // Scroll to bottom
        movesList.scrollTop = movesList.scrollHeight;
    }

    // Add move removed from history
    function addRemovalToHistory(player, cellIndex, moveNum, isAI) {
        const moveItem = document.createElement('div');
        moveItem.classList.add('move-item');
        moveItem.innerHTML = `
        <span>Removed #${moveNum}</span>
        <span class="move-player ${player.toLowerCase()}">${player}${isAI ? ' (AI)' : ''} ← Cell ${cellIndex + 1}</span>
        `;
        movesList.appendChild(moveItem);
        // Scroll to bottom
        movesList.scrollTop = movesList.scrollHeight;
    }
    
    function aiMove() {
        if (!gameActive) return;
    
        let bestMove = getBestMove();
        if (bestMove !== -1) {
            makeMove(bestMove, true);
            
            // Add to move history
            // addMoveToHistory(currentPlayer, cellIndex, moveCount, isAI);
        }
    }
    
    function removeOldestMove() {
        let oldestMove = moveSequence.shift();
        if (oldestMove && !board[oldestMove.index].classList.contains("win-highlight")) {
            gameBoard[oldestMove.index] = "";
            board[oldestMove.index].innerText = "";
        }
    
        // **Recheck for winner after move removal**
        if (!checkWinner("X") && !checkWinner("O")) {
            statusText.innerHTML = "Game continues...";
            gameActive = true;  // Allow game to continue if no win
        }
    }
    
    function getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        gameBoard.forEach((cell, index) => {
            if (cell === "") {
                gameBoard[index] = "X";
                let score = minimax(gameBoard, 0, false);
                gameBoard[index] = "";
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            }
        });

        return bestMove;
    }

    function minimax(boardState, depth, isMaximizing) {
        let result = evaluate(boardState);
        if (result !== 0) return result - depth;
        if (!boardState.includes("")) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            boardState.forEach((cell, index) => {
                if (cell === "") {
                    boardState[index] = "X";
                    bestScore = Math.max(bestScore, minimax(boardState, depth + 1, false));
                    boardState[index] = "";
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            boardState.forEach((cell, index) => {
                if (cell === "") {
                    boardState[index] = "O";
                    bestScore = Math.min(bestScore, minimax(boardState, depth + 1, true));
                    boardState[index] = "";
                }
            });
            return bestScore;
        }
    }

    function evaluate(boardState) {
        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return boardState[a] === "X" ? 10 : -10;
            }
        }
        return 0;
    }

    function checkWinner(player) {
        return winningConditions.some(condition => 
            condition.every(index => gameBoard[index] === player)
        );
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
        
        // Clear the moves list
        movesList.innerHTML = '';
    }

    resetButton.addEventListener("click", resetGame);
    initializeGame();
});
