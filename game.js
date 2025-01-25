const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.style.border = "3px solid black";

// Configuración inicial de las variables
const player = {
    x: 120,
    y: 450,
    width: 100,
    height: 100,
    headImage: new Image(),
    bodyImage: new Image(),
};
player.headImage.src = "Resources/player.gif"; // Cabeza del jugador
player.bodyImage.src = "Resources/homen1.gif"; // Cuerpo del jugador

const foodImages = [
    "Resources/cupcake.gif",
    "Resources/donut.gif",
    "Resources/hamburguer.gif",
    "Resources/helado.gif",
    "Resources/hotdog.gif",
    "Resources/pizza.gif"
];

const food = {
    x: Math.random() * (canvas.width - 40),
    y: Math.random() * (canvas.height - 40),
    width: 40,
    height: 40,
    image: new Image(),
    isVisible: true,
    draw: function (ctx) {
        if (this.isVisible && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    },
};

food.image.src = foodImages[Math.floor(Math.random() * foodImages.length)];

let imagesLoaded = 0;
let score = 0;
let countdown = 60; // Tiempo inicial del temporizador
let gameActive = true; // Variable para controlar el estado del juego

// Función para verificar si todas las imágenes se han cargado
function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        principal(); // Iniciar el bucle principal si todas las imágenes están listas
    }
}

// Asignar el evento onload para las imágenes
player.headImage.onload = checkImagesLoaded;
player.bodyImage.onload = checkImagesLoaded;
food.image.onload = checkImagesLoaded;

// Bucle principal
function principal() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    drawPlayer(ctx); // Dibujar al jugador
    food.draw(ctx); // Dibujar la comida
    drawClockDigits(ctx); // Dibujar los dígitos del reloj
    drawScore(ctx); // Dibujar la puntuación

    checkCollision(); // Verificar colisiones

    if (gameActive) {
        requestAnimationFrame(principal);
    }
}

// Función para dibujar al jugador
function drawPlayer(ctx) {
    if (player.headImage.complete && player.bodyImage.complete) {
        ctx.drawImage(player.bodyImage, player.x, player.y, player.width, player.height);
        const headWidth = player.width / 3;
        const headX = player.x + (player.width - headWidth) / 2; // Centrar la cabeza
        ctx.drawImage(player.headImage, headX, player.y - player.headImage.height * 0.8, headWidth, player.headImage.height);
    }
}

// Función para mover al jugador
function movePlayer(event) {
    switch (event.key) {
        case "ArrowUp":
            if (player.y > 30) player.y -= 10;
            break;
        case "ArrowDown":
            if (player.y + player.height < canvas.height) player.y += 10;
            break;
        case "ArrowLeft":
            if (player.x > 0) player.x -= 10;
            break;
        case "ArrowRight":
            if (player.x + player.width < canvas.width) player.x += 10;
            break;
    }
}

// Llamar a movePlayer para que escuche eventos de teclado
window.addEventListener("keydown", movePlayer);

// Función para verificar colisiones
function checkCollision() {
    if (
        player.x < food.x + food.width &&
        player.x + player.width > food.x &&
        player.y < food.y + food.height &&
        player.y + player.height > food.y
    ) {
        score++; // Incrementar la puntuación
        relocateFood(); // Reubicar la comida
    }
}

// Función para reubicar la comida
function relocateFood() {
    food.x = Math.random() * (canvas.width - food.width);
    food.y = Math.random() * (canvas.height - food.height);
}

// Función para actualizar el temporizador
function updateClock() {
    if (countdown > 0) {
        countdown -= 1 / 60; // Decrementar el temporizador
    } else {
        if (gameActive) {
            alert("¡Tiempo agotado!");
            gameActive = false; // Cambiar el estado del juego a inactivo
        }
    }
}

// Función para dibujar los dígitos del reloj
function drawClockDigits(ctx) {
    const digits = String(Math.floor(countdown)).padStart(2, "0"); // Asegurarse de que el temporizador tenga dos dígitos
    for (let i = 0; i < digits.length; i++) {
        const digit = parseInt(digits[i]);
        ctx.drawImage(clockDigits[digit].image, 10 + i * 20, 10, 20, 30); // Ajustar tamaño según sea necesario
    }
}

// Función para dibujar la puntuación
function drawScore(ctx) {
    ctx.fillStyle = "black"; // Color de la fuente
    ctx.font = "30px Arial"; // Estilo de la fuente
    ctx.fillText("Puntuación: " + score, 10, 70); // Dibujar la puntuación en la pantalla
}

// Inicializar los dígitos del reloj
const clockImages = [
    "./Resources/cero.gif", "./Resources/uno.gif", "./Resources/dos.gif",
    "./Resources/tres.gif", "./Resources/cuatro.gif", "./Resources/cinco.gif",
    "./Resources/seis.gif", "./Resources/siete.gif", "./Resources/ocho.gif",
    "./Resources/nueve.gif"
];

const clockDigits = [];
for (let i = 0; i < 10; i++) {
    const img = new Image();
    img.src = clockImages[i];
    clockDigits.push({ x: 10, y: 10, image: img });
}

// Bucle principal del juego
function gameLoop() {
    if (gameActive) {
        updateClock(); // Actualizar el temporizador
        principal(); // Llamar al bucle principal
    }
}

// Iniciar el bucle principal
setInterval(gameLoop, 1000 / 60); // 60 FPS