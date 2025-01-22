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
const player = { x: 120, y: 450, width: 40, height: 40, image: new Image() };
player.image.src = "Resources/player.gif";

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
const totalImages = 2; // Solo tenemos la imagen del jugador
// Función para verificar si las imágenes están cargadas
function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        startGame(); // Inicia el juego cuando la imagen esté cargada
    }
}

// Asignar el evento onload para la imagen del jugador
player.image.onload = checkImagesLoaded;

// Función para iniciar el juego
function startGame() {
    console.log("La imagen del jugador se ha cargado, el juego comienza...");
    setInterval(draw, 1000 / 60); // Llama a la función draw cada 1/60 segundos (60 FPS)
}

// Función para dibujar en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar
    // Dibujar al jugador
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
    // Dibujar la comida
    ctx.drawImage(food.image, food.x, food.y, food.width, food.height);
}

player.image.onload = () => {
    food.image.onload = draw; // Llamar a draw cuando ambas imágenes estén cargadas
};