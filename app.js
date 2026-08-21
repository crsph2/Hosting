// 1. Capturamos los elementos del HTML
const form = document.getElementById('player-form');
const input = document.getElementById('adventurer-name');
const errorDiv = document.getElementById('error-message');

// 2. La función para mostrar errores (esta es la que faltaba)
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden'); // Quita la clase que lo oculta
}

// 3. La función para iniciar el juego (esta es la que faltaba)
// Aquí es donde iría tu lógica de Firebase
function iniciarJuego(playerName) {
    console.log("¡Bienvenido, " + playerName + "! Vamos a empezar.");
    
    // 👇 AQUÍ ES DONDE VA TU CÓDIGO DE FIREBASE (el fetch o el addDoc)
    // Ejemplo básico:
    // const db = getFirestore();
    // addDoc(collection(db, 'jugadores'), { nombre: playerName });
    // 👆 Si haces esto, ahí es donde te sale el error de CORS.
}

// 4. El código que te dio Gemini
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita que la página se recargue
  const playerName = input.value.trim();

  if (playerName.length < 3) {
    showError("Tu nombre debe tener al menos 3 caracteres, héroe.");
    return;
  }

  // Llamamos a la función de arriba
  iniciarJuego(playerName);
});
