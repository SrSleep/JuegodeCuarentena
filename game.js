const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const foodImages = [
    "Resources/cupcake.gif",
    "Resources/donut.gif",
    "Resources/hamburguer.gif",
    "Resources/helado.gif",
    "Resources/hotdog.gif",
    "Resources/pizza.gif"
];

// Configuración inicial de las variables
const player = { 
    x: 120, 
    y: 450, 
    width: 40, 
    height: 40, 
    image: new Image(),
    speed: 5  // Agregamos velocidad para el movimiento
};
player.image.src = "Resources/player.gif";  // Imagen inicial del jugador

const food = {
    x: Math.random() * (canvas.width - 20), // Posición aleatoria dentro del canvas
    y: Math.random() * (canvas.height - 20),
    width: 40,
    height: 40,
    image: new Image(),
};
// Seleccionar una imagen aleatoria para la comida
food.image.src = foodImages[Math.floor(Math.random() * foodImages.length)];

let imagesLoaded = 0; // Contador de imágenes cargadas
const totalImages = 2; // Solo contamos las imágenes del jugador y la comida
let score = 0; // Puntuación inicial

// Función para verificar si las imágenes están cargadas
function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        startGame(); // Inicia el juego cuando ambas imágenes estén cargadas
    }
}

// Asignar el evento onload para la imagen del jugador
player.image.onload = checkImagesLoaded;
food.image.onload = checkImagesLoaded;

// Función para iniciar el juego
function startGame() {
    console.log("La imagen del jugador se ha cargado, el juego comienza...");
    setInterval(draw, 1000 / 60); // Llama a la función draw cada 1/60 segundos (60 FPS)
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar

    // Primero dibujamos la comida
    ctx.drawImage(food.image, food.x, food.y, food.width, food.height);

    // Luego dibujamos al jugador
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

    // Mostrar la puntuación en pantalla
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Puntuación: " + score, 10, 30); // Mostrar la puntuación en la parte superior izquierda
}
// Controles de movimiento del jugador
document.addEventListener("keydown", movePlayer);
document.addEventListener("keyup", stopPlayer);

// Función para mover al jugador
function movePlayer(event) {
    if (event.key === "ArrowUp" && player.y > 0) {
        player.y -= player.speed;
        player.image.src = "Resources/player2.gif"; // Cambiar a imagen de movimiento
    } 
    if (event.key === "ArrowDown" && player.y + player.height < canvas.height) {
        player.y += player.speed;
        player.image.src = "Resources/player2.gif"; // Cambiar a imagen de movimiento
    } 
    if (event.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
        player.image.src = "Resources/player2.gif"; // Cambiar a imagen de movimiento
    } 
    if (event.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed;
        player.image.src = "Resources/player2.gif"; // Cambiar a imagen de movimiento
    }

    // Verificar colisiones después de mover al jugador
    checkCollision();
}


// Función para detener el movimiento
function stopPlayer(event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
        player.image.src = "Resources/player.gif"; // Restaurar la imagen original cuando no se mueve
    }
}

function checkCollision() {
    // Detectar si hay colisión entre el jugador y la comida
    if (player.x < food.x + food.width &&
        player.x + player.width > food.x &&
        player.y < food.y + food.height &&
        player.y + player.height > food.y) {
        // Si hay colisión
        score += 10; // Aumentar puntuación
        // Cambiar la posición de la comida a una nueva posición aleatoria
        food.x = Math.random() * (canvas.width - 40);
        food.y = Math.random() * (canvas.height - 40);
    }
}

// Sincronización para asegurar que ambas imágenes estén cargadas
food.image.onload = draw;

