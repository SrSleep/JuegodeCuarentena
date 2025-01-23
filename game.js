const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const foodImages = [
  "Resources/cupcake.gif",
  "Resources/donut.gif",
  "Resources/hamburguer.gif",
  "Resources/helado.gif",
  "Resources/hotdog.gif",
  "Resources/pizza.gif",
];

// Configuración inicial de las variables
const player = {
  x: 120,
  y: 450,
  width: 100,
  height: 100,
  headImage: new Image(), // Inicializa headImage
  bodyImage: new Image(), // Inicializa bodyImage
};
player.headImage.src = "./Resources/player.gif"; // imagen de cuerpo
player.bodyImage.src = "./Resources/homen1.gif"; // imagen de cabeza

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

// Asignar el evento onload para las imágenes del jugador
player.headImage.onload = checkImagesLoaded;
player.bodyImage.onload = checkImagesLoaded;


// Función para iniciar el juego
function startGame() {
  console.log("La imagen del jugador se ha cargado, el juego comienza...");
  setInterval(draw, 1000 / 60); // Llama a la función draw cada 1/60 segundos (60 FPS)
}

// Función para dibujar en el canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas antes de dibujar

   // Dibujar el cuerpo
   ctx.drawImage(player.bodyImage, player.x, player.y, player.width, player.height);
   
  // Dibujar la cabeza 
  ctx.drawImage(player.headImage, player.x +18, player.y - 55, player.width  * 0.6, player.height * 0.6); // Ajusta la posición Y para que la cabeza esté sobre el cuerpo

  // Dibujar la comida
  ctx.drawImage(food.image, food.x, food.y, food.width, food.height);
}

