const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// Game Variables
let monkey = { x: 350, y: 400, width: 100, height: 100 };
let bananas = [];
let score = 0;
let isGameRunning = false;
let gameDuration = 60; // Set game time to 60 seconds
let timeLeft = gameDuration;
let timerInterval;


// Difficulty Settings
let difficultySettings = {
    easy: { bananaSpeed: 2, spawnRate: 2000, badBananaChance: 0.1 },
    normal: { bananaSpeed: 4, spawnRate: 1500, badBananaChance: 0.2 },
    hard: { bananaSpeed: 6, spawnRate: 1000, badBananaChance: 0.3 }
};

let currentDifficulty = "normal";

// Load Images
const monkeyImg = new Image();
monkeyImg.src = "assets/monkey.png";
const badBananaImg = new Image();
badBananaImg.src = "assets/bad_banana.png";

// Fetch Banana Image from API
async function getBananaImage() {
    return fetch("https://marcconrad.com/uob/banana/")
        .then(response => response.text())  // API returns an image URL as plain text
        .then(imageUrl => imageUrl.trim()) // Remove unwanted whitespace
        .catch(error => {
            console.error("Error fetching banana:", error);
            return "assets/banana.png"; // Fallback image
        });
}


// Start Game
function startGame() {
    isGameRunning = true;
    score = 0;
    timeLeft = gameDuration; // Reset timer
    bananas = [];

    // Get difficulty settings
    currentDifficulty = document.getElementById("difficulty").value;
    let settings = difficultySettings[currentDifficulty];

    bananaFallSpeed = settings.bananaSpeed;
    spawnRate = settings.spawnRate;
    badBananaChance = settings.badBananaChance;

    // Spawn bananas at a fixed rate
    setInterval(spawnBanana, spawnRate);

    // Start countdown timer
    clearInterval(timerInterval); // Prevent multiple timers
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Start game loop
    requestAnimationFrame(updateGame);
}



// Spawn Bananas
async function spawnBanana() {
    if (!isGameRunning) return;

    let isBadBanana = Math.random() < badBananaChance;
    let bananaImage = isBadBanana ? "assets/bad_banana.png" : await getBananaImage();

    let banana = {
        x: Math.random() * (canvas.width - 50),
        y: 0,
        speed: bananaFallSpeed,
        bad: isBadBanana,
        img: new Image()
    };
    banana.img.src = bananaImage;

    bananas.push(banana);
}


// Update Game
function updateGame() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(monkeyImg, monkey.x, monkey.y, monkey.width, monkey.height);

    // Move and draw bananas
    for (let i = 0; i < bananas.length; i++) {
        let banana = bananas[i];
        banana.y += banana.speed; // Move bananas down

        ctx.drawImage(banana.img, banana.x, banana.y, 50, 50);

        // Collision Detection
        if (
            banana.y + 50 >= monkey.y &&
            banana.x >= monkey.x &&
            banana.x <= monkey.x + monkey.width
        ) {
            score += banana.bad ? -5 : 10;
            bananas.splice(i, 1);
            i--;
        }
    }

    // Draw Score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    // Draw Timer
    ctx.fillText("Time Left: " + timeLeft + "s", 650, 30);

    requestAnimationFrame(updateGame); // Keep game running
}

function endGame() {
    isGameRunning = false;
    clearInterval(timerInterval); // Stop the countdown

    // Show final score
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! Final Score: " + score, canvas.width / 2 - 150, canvas.height / 2);
}


// Move Monkey
// Move Monkey (Fix)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" && monkey.x > 0) {
        monkey.x -= 20;
    } else if (event.key === "ArrowRight" && monkey.x < canvas.width - monkey.width) {
        monkey.x += 20;
    }
});

