// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhSRGwrn3ttPzc5btHoSD5Bily0lA1IGQ",
  authDomain: "juego-cuarentena.firebaseapp.com",
  projectId: "juego-cuarentena",
  storageBucket: "juego-cuarentena.firebasestorage.app",
  messagingSenderId: "702486778361",
  appId: "1:702486778361:web:a62fd587b1cc9ede2b2d28",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the collection and fetch documents
async function fetchRanking() {
  try {
    const rankingRef = collection(db, "ranking"); // Obtén una referencia a la colección "ranking"
    const q = query(rankingRef, orderBy("puntuacion", "desc"), limit(5)); // Ordenar por puntuación descendente y limitar a 5
    const querySnapshot = await getDocs(q); // Obtén los documentos de la colección
    const rankingList = document.querySelectorAll(".ranking-list");
    rankingList.forEach((list) => (list.innerHTML = "")); // Limpiar listas de ranking
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rankingList.forEach((list) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="rank">${rank}.</span> <span class="name">${data.nombre}</span> <span class="score">${data.puntuacion}</span>`;
        list.appendChild(li);
      });
      rank++;
    });
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
}

async function saveScore(name, score) {
  try {
    await addDoc(collection(db, "ranking"), {
      nombre: name,
      puntuacion: score,
    });
  } catch (error) {
    console.error("Error saving score: ", error);
  }
}

export { fetchRanking, saveScore };
