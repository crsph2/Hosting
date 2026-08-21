const form = document.getElementById('player-form');
const input = document.getElementById('adventurer-name');
const errorDiv = document.getElementById('error-message');

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

async function iniciarJuego(playerName) {
    try {
        // ESTA ES LA FORMA CORRECTA (SDK Compat)
        // NO uses fetch aquí. El SDK se encarga de todo.
        await db.collection("jugadores").add({
            nombre: playerName,
            fechaCreacion: new Date()
        });
        
        window.location.href = 'juego.html'; 

    } catch (error) {
        console.error("Error completo de Firebase:", error);
        showError("Revisa las reglas de Firestore o tu conexión.");
    }
}

form.addEventListener('submit', (e) => {
  e.preventDefault(); 
  const playerName = input.value.trim();
  if (playerName.length < 3) {
    showError("Tu nombre debe tener al menos 3 caracteres, héroe.");
    return;
  }
  errorDiv.classList.add('hidden');
  iniciarJuego(playerName);
});
