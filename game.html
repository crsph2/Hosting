// ---------- Configuración de niveles y regiones ----------
const XP_POR_NIVEL = 100; // cada 100 XP acumulados = 1 nivel

const REGIONES = [
  { minNivel: 1, nombre: "Bosque de la Suma" },
  { minNivel: 3, nombre: "Colinas de la Resta" },
  { minNivel: 5, nombre: "Torre de la Multiplicación" },
  { minNivel: 8, nombre: "Abismo de la División" },
  { minNivel: 12, nombre: "Ciudadela de las Ecuaciones" }
];

function regionParaNivel(nivel) {
  let region = REGIONES[0].nombre;
  for (const r of REGIONES) {
    if (nivel >= r.minNivel) region = r.nombre;
  }
  return region;
}

// ---------- Generación de preguntas ----------
function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarPregunta(dificultad) {
  let a, b, operador, respuesta;

  if (dificultad === 'normal') {
    const ops = ['+', '-', '×'];
    operador = ops[numeroAleatorio(0, 2)];
    if (operador === '×') {
      a = numeroAleatorio(2, 12);
      b = numeroAleatorio(2, 12);
    } else {
      a = numeroAleatorio(10, 50);
      b = numeroAleatorio(10, 50);
      if (operador === '-' && b > a) [a, b] = [b, a];
    }
  } else if (dificultad === 'dificil') {
    const ops = ['×', '÷', '+', '-'];
    operador = ops[numeroAleatorio(0, 3)];
    if (operador === '÷') {
      b = numeroAleatorio(2, 12);
      respuesta = numeroAleatorio(2, 12);
      a = b * respuesta;
    } else if (operador === '×') {
      a = numeroAleatorio(11, 20);
      b = numeroAleatorio(2, 12);
    } else {
      a = numeroAleatorio(50, 200);
      b = numeroAleatorio(50, 200);
      if (operador === '-' && b > a) [a, b] = [b, a];
    }
  } else { // facil (por defecto)
    operador = Math.random() < 0.5 ? '+' : '-';
    a = numeroAleatorio(1, 20);
    b = numeroAleatorio(1, 20);
    if (operador === '-' && b > a) [a, b] = [b, a];
  }

  if (respuesta === undefined) {
    switch (operador) {
      case '+': respuesta = a + b; break;
      case '-': respuesta = a - b; break;
      case '×': respuesta = a * b; break;
      case '÷': respuesta = a / b; break;
    }
  }

  const opciones = new Set([respuesta]);
  let intentos = 0;
  while (opciones.size < 4 && intentos < 50) {
    intentos++;
    const variacion = numeroAleatorio(-10, 10) || 1;
    const candidata = respuesta + variacion;
    if (candidata !== respuesta) opciones.add(candidata);
  }

  return {
    enunciado: `${a} ${operador} ${b}`,
    respuestaCorrecta: respuesta,
    opciones: [...opciones].sort(() => Math.random() - 0.5)
  };
}

// ---------- Estado del juego ----------
let uid = null;
let jugador = null;
let preguntaActual = null;
let racha = 0;

const elNombre = document.getElementById('player-name');
const elNivel = document.getElementById('player-level');
const elMonedas = document.getElementById('player-coins');
const elXpBarra = document.getElementById('xp-bar-fill');
const elXpTexto = document.getElementById('xp-text');
const elRegion = document.getElementById('player-region');
const elPregunta = document.getElementById('pregunta-enunciado');
const elOpciones = document.getElementById('opciones-container');
const elFeedback = document.getElementById('feedback-message');
const elRacha = document.getElementById('racha-actual');

firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // No hay sesión: de vuelta al login
    window.location.href = 'index.html';
    return;
  }
  uid = user.uid;

  const snap = await db.collection('usuarios').doc(uid).get();
  if (!snap.exists) {
    window.location.href = 'index.html';
    return;
  }

  jugador = snap.data();
  actualizarUI();
  nuevaPregunta();
});

function actualizarUI() {
  elNombre.textContent = jugador.nombre;
  elNivel.textContent = jugador.nivel;
  elMonedas.textContent = jugador.monedas;
  elRegion.textContent = jugador.regionActual;

  const xpEnNivel = jugador.xp % XP_POR_NIVEL;
  elXpBarra.style.width = `${xpEnNivel}%`;
  elXpTexto.textContent = `${xpEnNivel} / ${XP_POR_NIVEL} XP`;
  elRacha.textContent = racha;
}

function nuevaPregunta() {
  elFeedback.classList.add('hidden');
  preguntaActual = generarPregunta(jugador.dificultadActual || 'facil');
  elPregunta.textContent = preguntaActual.enunciado + ' = ?';
  elOpciones.innerHTML = '';

  preguntaActual.opciones.forEach((opcion) => {
    const btn = document.createElement('button');
    btn.className = 'rpg-button btn-opcion';
    btn.textContent = opcion;
    btn.addEventListener('click', () => responder(opcion, btn));
    elOpciones.appendChild(btn);
  });
}

async function responder(opcionElegida, btnElegido) {
  [...elOpciones.children].forEach(b => b.disabled = true);

  const esCorrecta = opcionElegida === preguntaActual.respuestaCorrecta;
  let xpGanada = 0;
  let monedasGanadas = 0;

  if (esCorrecta) {
    racha++;
    xpGanada = 10 + Math.min(racha, 5) * 2; // bono por racha, tope seguro bajo el límite de la regla
    monedasGanadas = 5;
    btnElegido.classList.add('opcion-correcta');
    elFeedback.textContent = '¡Correcto, héroe! Sigue así.';
    elFeedback.classList.remove('feedback-error');
    elFeedback.classList.add('feedback-exito');
  } else {
    racha = 0;
    btnElegido.classList.add('opcion-incorrecta');
    elFeedback.textContent = `Casi. La respuesta correcta era ${preguntaActual.respuestaCorrecta}.`;
    elFeedback.classList.remove('feedback-exito');
    elFeedback.classList.add('feedback-error');
  }
  elFeedback.classList.remove('hidden');

  const nuevoXp = jugador.xp + xpGanada;
  const nuevoNivel = Math.floor(nuevoXp / XP_POR_NIVEL) + 1;
  const subioNivel = nuevoNivel > jugador.nivel;

  jugador.xp = nuevoXp;
  jugador.monedas += monedasGanadas;
  jugador.nivel = nuevoNivel;
  jugador.regionActual = regionParaNivel(nuevoNivel);
  jugador.estadisticas = jugador.estadisticas || {};
  jugador.estadisticas.correctas = (jugador.estadisticas.correctas || 0) + (esCorrecta ? 1 : 0);
  jugador.estadisticas.incorrectas = (jugador.estadisticas.incorrectas || 0) + (esCorrecta ? 0 : 1);

  try {
    await db.collection('usuarios').doc(uid).update({
      xp: jugador.xp,
      monedas: jugador.monedas,
      nivel: jugador.nivel,
      regionActual: jugador.regionActual,
      estadisticas: jugador.estadisticas,
      historial: firebase.firestore.FieldValue.arrayUnion({
        pregunta: preguntaActual.enunciado,
        correcta: esCorrecta,
        fecha: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error al guardar progreso:', error);
  }

  actualizarUI();
  if (subioNivel) {
    elFeedback.textContent += ` ¡Subiste a nivel ${jugador.nivel}!`;
  }

  setTimeout(nuevaPregunta, 1600);
}
