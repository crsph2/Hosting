// Elementos del DOM
const form = document.getElementById('player-form');
const input = document.getElementById('adventurer-name');
const errorDiv = document.getElementById('error-message');

// Función para mostrar errores
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Función para iniciar la partida (Usando la sintaxis Compat)
async function iniciarJuego(playerName) {
    try {
        // Usamos la sintaxis antigua: db.collection(...).add(...)
        await db.collection("jugadores").add({
            nombre: playerName,
            fechaCreacion: new Date()
        });

        console.log(`¡Bienvenido, ${playerName}! Los datos se guardaron correctamente.`);
        
        // AQUÍ IRÍA TU REDIRECCIÓN AL JUEGO
        window.location.href = 'juego.html';

    } catch (error) {
        console.error("Error completo de Firebase:", error);
        showError("No se pudo conectar con los servidores. Revisa tus permisos o tu conexión a internet.");
    }
}

// Evento del formulario
form.addEventListener('submit', (e) => {
  e.preventDefault(); 
  
  const playerName = input.value.trim();

  if (playerName.length < 3) {
    showError("Tu nombre debe tener al menos 3 caracteres, héroe.");
    return;
  }

  // Limpiamos el error anterior si lo hubiera
  errorDiv.classList.add('hidden');

  // Llamamos a la lógica de Firebase
  iniciarJuego(playerName);
});
