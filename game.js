import { fetchRanking, saveScore } from "./firebaseconect.js"; // Importar funciones desde firebaseconect.js

const canvas = document.getElementById("gameCanvas");
canvas.width = 500; // Cambiado de 600 a 500
canvas.height = 500; // Cambiado de 600 a 500
const ctx = canvas.getContext("2d");

canvas.style.border = "3px solid black";

let username = "";
let gameState = "start"; 

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

const foodTypes = [
  { src: "Resources/cupcake.gif", points: 1 },
  { src: "Resources/donut.gif", points: 2 },
  { src: "Resources/helado.gif", points: 3 },
  { src: "Resources/hotdog.gif", points: 4 },
  { src: "Resources/pizza.gif", points: 5 },
  { src: "Resources/hamburguer.gif", points: 6 }
];

// Reemplazar la constante food por un array de comidas
const foods = foodTypes.map(type => ({
  x: Math.random() * (canvas.width - 40),
  y: Math.random() * (canvas.height - 40),
  width: 40,
  height: 40,
  points: type.points,
  image: new Image(),
  isVisible: true,
  draw: function(ctx) {
    if (this.isVisible && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}));

// Inicializar las imágenes de comida
foods.forEach((food, index) => {
  food.image.src = foodTypes[index].src;
  food.image.onload = checkImagesLoaded;
});

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

const eatSound = new Audio('Resources/eat.mp3');// Sonido para la colisión
const backgroundMusic = new Audio('Resources/Cuarentena.wav');// Sonido para la música de fondo

// Función para verificar si todas las imágenes se han cargado
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === (2 + foods.length)) { // 2 imágenes del jugador + todas las comidas
    principal(); // Iniciar el bucle principal si todas las imágenes están listas
  }
}

// Asignar el evento onload para las imágenes
player.headImage.onload = checkImagesLoaded;
player.bodyImage.onload = checkImagesLoaded;

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
  // Limpiar todos los intervalos existentes
  if (window.gameInterval) {
    clearInterval(window.gameInterval);
    window.gameInterval = null;
  }
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
    window.clockInterval = null;
  }
  
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
    window.gameInterval = null;
  }
  if (window.clockInterval) {
    clearInterval(window.clockInterval);
    window.clockInterval = null;
  }

  // Reiniciar variables de estado
  gameActive = true;
  countdown = 60;
  score = 0;
  player.x = 200; 
  player.y = 200;
  player.bodyImage.src = "Resources/homen1.gif";
  
  // Limpiar estado de teclas
  Object.keys(keysPressed).forEach(key => {
    keysPressed[key] = false;
  });

  // Reemplazar la parte de reubicar comidas con:
  showNewFoodPair();

  document.getElementById("gameInfoPanel").style.display = "flex";
  document.getElementById("gameRankingPanel").style.display = "block";
  document.getElementById("playerNameDisplay").textContent = username;

  // Agregar esta línea para mostrar la guía de puntajes
  createFoodScoreGuide();

  // Iniciar los intervalos del juego
  window.gameInterval = setInterval(gameLoop, 1000 / 60);
  window.clockInterval = setInterval(updateClock, 1000);
  
  // Reiniciar y reproducir música
  backgroundMusic.currentTime = 0;
  backgroundMusic.loop = true;
  backgroundMusic.play();
  
  // Asegurar que el bucle principal se ejecute
  requestAnimationFrame(principal);
}

// Función para crear y mostrar la guía de puntajes
function createFoodScoreGuide() {
  const guideContainer = document.getElementById('foodScoreGuide');
  const listContainer = guideContainer.querySelector('.food-score-list');
  
  listContainer.innerHTML = '';
  
  const sortedFoods = [...foodTypes].sort((a, b) => b.points - a.points);
  
  sortedFoods.forEach(food => {
    const item = document.createElement('div');
    item.className = 'food-score-item';
    
    const img = document.createElement('img');
    img.src = food.src;
    img.alt = `${food.points} puntos`;
    
    const points = document.createElement('span');
    points.textContent = `+${food.points}`;
    points.style.color = '#27ae60';
    points.style.fontWeight = '600';
    
    item.appendChild(img);
    item.appendChild(points);
    listContainer.appendChild(item);
  });
  
  guideContainer.style.display = 'block';
}

// Función para actualizar el cuerpo del jugador
function updatePlayerBody() {
  if (score >= 30) {
    player.bodyImage.src = "Resources/homen4.gif"; 
  } else if (score >= 20) {
    player.bodyImage.src = "Resources/homen3.gif"; 
  } else if (score >= 10) {
    player.bodyImage.src = "Resources/homen2.gif"; 
  } else {
    player.bodyImage.src = "Resources/homen1.gif"; 
  }
}


// Bucle principal
function principal() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
  drawPlayer(ctx); // Dibujar al jugador
  foods.forEach(food => food.draw(ctx)); // Dibujar todas las comidas
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
    ctx.save();
    // Voltear la imagen horizontalmente
    ctx.scale(-1, 1); // Escalar en el eje X (invertir horizontalmente)
    ctx.drawImage(
      player.bodyImage,
      -player.x - player.width,  // Ajustar la posición para el volteo
      player.y,
      player.width,
      player.height
    );
    ctx.restore();    // Restaurar el estado del contexto para no afectar otras imágenes
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

// Modificar la función checkCollision
function checkCollision() {
  let collision = false;
  
  foods.forEach(food => {
    if (food.isVisible &&
        player.x < food.x + food.width &&
        player.x + player.width > food.x &&
        player.y < food.y + food.height &&
        player.y + player.height > food.y) {
      
      score += food.points;
      eatSound.play();
      
      // Mostrar indicador de puntos
      showPointsIndicator(food.points);
      
      // Hacer invisible todas las comidas y mostrar un nuevo par
      showNewFoodPair();
      collision = true;
      
      player.headImage.src = "Resources/player2.gif";
      setTimeout(() => {
        player.headImage.src = "Resources/player.gif";
      }, 1000);

      updatePlayerBody();
    }
  });
  
  return collision;
}

// Agregar función para mostrar indicador de puntos
function showPointsIndicator(points) {
  const scoreDisplay = document.getElementById("scoreDisplay");
  const indicator = document.createElement("div");
  indicator.className = "points-indicator";
  indicator.textContent = `+${points}`;
  
  const rect = scoreDisplay.getBoundingClientRect();
  indicator.style.left = `${rect.right + 10}px`;
  indicator.style.top = `${rect.top}px`;
  
  document.body.appendChild(indicator);
  
  void indicator.offsetWidth;
  
  indicator.classList.add("show");
  
  // Aumentar el tiempo antes de eliminar el indicador de 500ms a 1000ms
  setTimeout(() => {
    document.body.removeChild(indicator);
  }, 1000);
}

// Modificar la función relocateFood para mostrar 2 nuevas comidas aleatorias
function showNewFoodPair() {
  // Hacer todas las comidas invisibles
  foods.forEach(food => food.isVisible = false);
  
  // Seleccionar 2 comidas aleatorias diferentes
  const availableFoods = [...foods];
  const food1 = availableFoods.splice(Math.floor(Math.random() * availableFoods.length), 1)[0];
  const food2 = availableFoods[Math.floor(Math.random() * availableFoods.length)];
  
  // Hacer visibles las comidas seleccionadas y reubicarlas
  food1.isVisible = true;
  food2.isVisible = true;
  
  // Ubicar las comidas en lados opuestos del canvas
  food1.x = Math.random() * (canvas.width/2 - food1.width);
  food1.y = Math.random() * (canvas.height - food1.height);
  
  food2.x = (canvas.width/2) + Math.random() * (canvas.width/2 - food2.width);
  food2.y = Math.random() * (canvas.height - food2.height);
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
      backgroundMusic.pause();     // Detener la música de fondo
      backgroundMusic.currentTime = 0; // Reiniciar la música
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
