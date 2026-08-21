// ================================================================
//  MATHQUEST - LÓGICA COMPLETA (corregida)
// ================================================================

// ---------- CONFIGURACIÓN DE FIREBASE (REEMPLAZA CON TUS DATOS) ----------
const firebaseConfig = {
  apiKey: "AIzaSy...",          // <-- REEMPLAZA
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------- CONSTANTES ----------
const REGIONES = [ /* ... igual que antes ... */ ];
const LOGROS = [ /* ... 40 logros ... */ ];

// ---------- ESTADO GLOBAL ----------
let usuarioActual = null;
let uidActual = null;
let vistaActual = 'mapa';
let enMision = false;
let misionesActuales = [];
let misionIndex = 0;
let regionActualData = null;

// ---------- REFERENCIAS DOM ----------
const $ = id => document.getElementById(id);

// ---------- FUNCIONES AUXILIARES ----------
function mostrarMensaje(texto, tipo = 'info', contenedor = null) {
  const el = document.createElement('div');
  el.className = `mensaje ${tipo}`;
  el.textContent = texto;
  if (contenedor) contenedor.prepend(el);
  else document.getElementById('contenido-juego')?.prepend(el) || document.body.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

// ---------- FUNCIONES DE GENERACIÓN DE PREGUNTAS (igual que antes) ----------
function generarPregunta(regionId, dificultad) { /* ... */ }
function mcd(a,b) { /* ... */ }
function generarMisiones(regionId, dificultad) { /* ... */ }

// ---------- FUNCIONES FIRESTORE ----------
async function actualizarUsuario(datos) {
  if (!uidActual) return;
  await db.collection('usuarios').doc(uidActual).update(datos);
}

async function obtenerUsuario(uid) {
  const doc = await db.collection('usuarios').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ---------- RENDER MAPA, MISIONES, RANKING, RETOS (igual que antes) ----------
// ... (todas las funciones ya definidas en la versión anterior) ...

// ---------- CARGA DE USUARIO ACTUAL ----------
async function cargarUsuarioActual() {
  if (!uidActual) return;
  const data = await obtenerUsuario(uidActual);
  if (data) {
    usuarioActual = { ...data, uid: uidActual };
    // Actualizar UI (nickname, XP, monedas, perfil, etc.)
    document.getElementById('nickname-display').textContent = data.nickname || 'Jugador';
    document.getElementById('xp-display').textContent = data.xp || 0;
    document.getElementById('monedas-display').textContent = data.monedas || 0;
    // ... (resto de actualizaciones) ...
    renderMapa();
    actualizarRanking();
    cargarRetosPendientes();
  }
}

// ---------- AUTENTICACIÓN ANÓNIMA + NICKNAME ----------
// Esta función se ejecuta al cargar la página
auth.onAuthStateChanged(async user => {
  console.log('onAuthStateChanged:', user);
  if (user) {
    uidActual = user.uid;
    const doc = await db.collection('usuarios').doc(uidActual).get();
    if (doc.exists) {
      // Usuario ya registrado → mostrar juego
      document.getElementById('pantalla-nickname').classList.add('oculta');
      document.getElementById('pantalla-juego').classList.remove('oculta');
      await cargarUsuarioActual();
    } else {
      // Primera vez → mostrar pantalla de nickname
      document.getElementById('pantalla-nickname').classList.remove('oculta');
      document.getElementById('pantalla-juego').classList.add('oculta');
    }
  } else {
    // No hay usuario → crear anónimo
    try {
      await auth.signInAnonymously();
      console.log('Usuario anónimo creado');
    } catch (e) {
      console.error('Error en autenticación anónima:', e);
      mostrarMensaje('Error al conectar con el servidor. Intenta de nuevo.', 'error');
    }
  }
});

// ---------- EVENTO GUARDAR NICKNAME ----------
// Aseguramos que el DOM esté cargado antes de asignar el evento
document.addEventListener('DOMContentLoaded', () => {
  const btnGuardar = document.getElementById('btn-guardar-nick');
  if (btnGuardar) {
    btnGuardar.addEventListener('click', async () => {
      console.log('Click en guardar nickname');
      const nick = document.getElementById('input-nickname').value.trim();
      if (!nick) {
        mostrarMensaje('Ingresa un nickname', 'error', document.getElementById('mensaje-nick'));
        return;
      }
      // Verificar unicidad
      const snapshot = await db.collection('usuarios').where('nickname', '==', nick).get();
      if (!snapshot.empty) {
        mostrarMensaje('Ese nickname ya está en uso', 'error', document.getElementById('mensaje-nick'));
        return;
      }
      // Crear documento
      try {
        await db.collection('usuarios').doc(uidActual).set({
          nickname: nick,
          nivel: 1,
          xp: 0,
          monedas: 0,
          regionActual: 1,
          logros: [],
          historial: [],
          estadisticas: { totalPreguntas: 0, aciertos: 0, errores: 0, tiempoPromedio: 0 },
          progresoRegiones: {},
          dificultadActual: 3,
          bloqueado: false,
          rol: 'usuario',
          fechaRegistro: new Date()
        });
        // Ocultar pantalla de nickname y mostrar juego
        document.getElementById('pantalla-nickname').classList.add('oculta');
        document.getElementById('pantalla-juego').classList.remove('oculta');
        await cargarUsuarioActual();
        mostrarMensaje(`¡Bienvenido, ${nick}!`, 'exito');
      } catch (e) {
        console.error('Error al guardar nickname:', e);
        mostrarMensaje('Error al guardar. Intenta de nuevo.', 'error', document.getElementById('mensaje-nick'));
      }
    });
  } else {
    console.error('Botón "btn-guardar-nick" no encontrado en el DOM');
  }
});

// ---------- EL RESTO DE EVENTOS Y FUNCIONES (cambiarVista, retos, admin, etc.) ----------
// ... (todo el resto del código se mantiene igual, pero asegúrate de que las referencias
//      a elementos del DOM usen getElementById y que los eventos se asignen después del DOMContentLoaded) ...

console.log('MathQuest cargado. Esperando autenticación...');
