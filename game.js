import { fetchRanking, saveScore } from "./firebaseconect.js"; // Importar funciones desde firebaseconect.js

const canvas = document.getElementById("gameCanvas");
canvas.width = 500; // Cambiado de 600 a 500
canvas.height = 500; // Cambiado de 600 a 500
const ctx = canvas.getContext("2d");

canvas.style.border = "3px solid black";

let username = "";
let gameState = "start"; // 'start', 'countdown', 'playing', 'ended'

// Configuración inicial de las variables
const player = {
  x: 200, // Cambiado de 120 a 200 para que aparezca dentro del canvas
  y: 200, // Cambiado de 450 a 200 para que aparezca dentro del canvas
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
  "Resources/pizza.gif",
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
let countdown = 0; // Cambiado a 0 inicialmente
let gameActive = true; // Variable para controlar el estado del juego

// Para controlar las teclas presionadas (movimiento del player)
const keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};


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

// Obtener el ranking al cargar la página
window.addEventListener("load", fetchRanking);

// Manejo del formulario de inicio
document.getElementById("startForm").addEventListener("submit", function (e) {
  e.preventDefault();
  username = document.getElementById("username").value;
  if (username.trim() !== "") {
    gameState = "countdown";
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("countdownScreen").style.display = "block";
    startInitialCountdown();
    fetchRanking(); // Llamar a fetchRanking para obtener el ranking desde Firebase
  }
});

function startInitialCountdown(isReset = false) {
  document.getElementById("gameCanvas").style.display = "none";
  document.getElementById("countdownScreen").style.display = "block";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameInfoPanel").style.display = "none";
  document.getElementById("gameRankingPanel").style.display = "none";

  let count = 3;
  const countdownElement = document.getElementById("countdown");
  countdownElement.textContent = count;

  const countInterval = setInterval(() => {
    count--;
    countdownElement.textContent = count;

    if (count <= 0) {
      clearInterval(countInterval);
      document.getElementById("countdownScreen").style.display = "none";
      document.getElementById("gameCanvas").style.display = "block";
      startGame();
    }
  }, 1000);
}

function startGame() {
  // Limpiar intervalos anteriores
  if (window.gameInterval) {
    clearInterval(window.gameInterval);
  }
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
  }

  // Reiniciar variables del juego
  gameActive = true;
  countdown = 60;
  score = 0;
  player.x = 200; 
  player.y = 200;
  relocateFood();

  document.getElementById("gameInfoPanel").style.display = "flex";
  document.getElementById("gameRankingPanel").style.display = "block";
  document.getElementById("playerNameDisplay").textContent = username;

  // Iniciar el juego
  if (imagesLoaded === 3) {
    window.gameInterval = setInterval(gameLoop, 1000 / 60);  // FPS para el juego
    window.clockInterval = setInterval(updateClock, 1000);    // Actualizar reloj cada 1 segundo
  }
}


// Bucle principal
function principal() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
  drawPlayer(ctx); // Dibujar al jugador
  food.draw(ctx); // Dibujar la comida
  drawClockDigits(); // Dibujar los dígitos del reloj
  drawScore(); // Dibujar la puntuación

  checkCollision(); // Verificar colisiones

  if (gameActive) {
    requestAnimationFrame(principal);
  }
}

// Función para dibujar al jugador
function drawPlayer(ctx) {
  if (player.headImage.complete && player.bodyImage.complete) {
    ctx.drawImage(
      player.bodyImage,
      player.x,
      player.y,
      player.width,
      player.height
    );
    const headWidth = player.width / 3;
    const headX = player.x + (player.width - headWidth) / 2; // Centrar la cabeza
    ctx.drawImage(
      player.headImage,
      headX,
      player.y - player.headImage.height * 0.8,
      headWidth,
      player.headImage.height
    );
  }
}


// Función para mover al jugador
function movePlayer() {
  const speed = 5; // Velocidad de movimiento
  const margin = -20; // Margen para todos los bordes

  // Movimiento en la dirección vertical (arriba o abajo)
  if (keysPressed.ArrowUp && player.y - player.headImage.height * 1 > 0) {
      player.y -= speed; // Mover hacia arriba
  }
  if (keysPressed.ArrowDown && player.y + player.height < canvas.height) {
      player.y += speed; // Mover hacia abajo
  }

  // Movimiento en la dirección horizontal (izquierda o derecha)
  if (keysPressed.ArrowLeft && player.x > margin) {
      player.x -= speed; // Mover hacia la izquierda
  }
  
  if (keysPressed.ArrowRight) {
      // Medir la distancia entre el borde derecho y el jugador
      const distanceToRightEdge = canvas.width - (player.x + player.width);
      
      // Si la distancia es mayor que el margen, mover al jugador
      if (distanceToRightEdge > margin) {
          player.x += speed; // Mover hacia la derecha
      } else {
          player.x = canvas.width - player.width - margin; // Ajustar al borde derecho
      }
  }
}

// Llamar a movePlayer para que escuche eventos de teclado
window.addEventListener("keydown", (event) => {
  if (event.key in keysPressed) {
      keysPressed[event.key] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keysPressed) {
      keysPressed[event.key] = false;
  }
});

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
async function backToStart() {
  await saveScore(username, score);
  window.location.reload();
}

function updateClock() {
  if (countdown > 0) {
    countdown--;  // Decrementar el temporizador
  } else {
    if (gameActive) {
      gameActive = false;
      clearInterval(window.clockInterval); // Detener el reloj
      // Mostrar la alerta de fin de tiempo
      Swal.fire({
        title: "¡Tiempo agotado!",
        text: `${username}, tu puntuación final es: ${score}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Reintentar",
        cancelButtonText: "Cerrar",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          startInitialCountdown(true);
        } else {
          backToStart();
        }
      });
    }
  }
  drawClockDigits(); // Actualizar la visualización del reloj
}


// Función para dibujar los dígitos del reloj
function drawClockDigits() {
  const timerDisplay = document.getElementById("timerDisplay");
  timerDisplay.innerHTML = ""; // Limpiar el contenedor
  const digits = String(Math.ceil(countdown)).padStart(2, "0");

  for (let i = 0; i < digits.length; i++) {
    const digit = parseInt(digits[i]);
    const img = new Image();
    img.src = clockImages[digit];
    img.className = "clock-digit";
    timerDisplay.appendChild(img);
  }
}

// Función para dibujar la puntuación
function drawScore() {
  document.getElementById("scoreDisplay").textContent = score;
}

// Inicializar los dígitos del reloj
const clockImages = [
  "./Resources/cero.gif",
  "./Resources/uno.gif",
  "./Resources/dos.gif",
  "./Resources/tres.gif",
  "./Resources/cuatro.gif",
  "./Resources/cinco.gif",
  "./Resources/seis.gif",
  "./Resources/siete.gif",
  "./Resources/ocho.gif",
  "./Resources/nueve.gif",
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
    movePlayer(); // Mover al jugador
    principal();  // Actualizar la pantalla de juego
  }
}
