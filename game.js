// ---------- Configuración de niveles y regiones ----------
const XP_POR_NIVEL = 10; // XP necesaria para subir de nivel

// Regiones según nivel (mínimos actualizados)
const REGIONES = [
  { minNivel: 1, nombre: "Aldea del Factor Común" },
  { minNivel: 2, nombre: "Ciudad del Factor Común" },
  { minNivel: 5, nombre: "Montaña del Binomio Cuadrado" },
  { minNivel: 9, nombre: "Cueva de la Factorización Compleja" },
  { minNivel: 13, nombre: "Ciudadela de los Polinomios" }
];

// Calcula la región según el nivel
function regionParaNivel(nivel) {
  let region = REGIONES[0].nombre;
  for (const r of REGIONES) {
    if (nivel >= r.minNivel) region = r.nombre;
  }
  return region;
}

// Calcula la dificultad (1 a 5) a partir del nivel
function obtenerDificultad(nivel) {
  if (nivel === 1) return 1;           // Dificultad 1: factor común positivo
  if (nivel >= 2 && nivel <= 4) return 2; // Dificultad 2: factor común con suma/resta
  if (nivel >= 5 && nivel <= 8) return 3; // Dificultad 3: binomios y trinomios simples
  if (nivel >= 9 && nivel <= 12) return 4; // Dificultad 4: trinomios con coeficiente >1
  return 5; // Dificultad 5: diferencia de cubos (nivel 13+)
}

// ---------- Generación de preguntas ----------
function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera una pregunta según la dificultad (1 a 5)
function generarPregunta(dificultad) {
  let enunciado, respuestaCorrecta, opciones = [];

  switch(dificultad) {
    case 1: // Factor común positivo (nivel 1)
      const a1 = numeroAleatorio(2, 6);
      const b1 = numeroAleatorio(2, 9);
      const termino1 = a1 * b1;
      enunciado = `Factoriza: ${a1}x + ${termino1}`;
      respuestaCorrecta = `${a1}(x + ${b1})`;
      opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'facil');
      break;

    case 2: // Factor común con suma o resta (niveles 2-4)
      const a2 = numeroAleatorio(2, 6);
      const b2 = numeroAleatorio(2, 9);
      const signo = Math.random() < 0.5 ? '+' : '-';
      const termino2 = signo === '+' ? a2 * b2 : -a2 * b2;
      const expresion2 = `${a2}x ${signo} ${Math.abs(termino2)}`;
      const factorizacion2 = `${a2}(x ${signo} ${b2})`;
      enunciado = `Factoriza: ${expresion2}`;
      respuestaCorrecta = factorizacion2;
      opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'facil');
      break;

    case 3: // 50% diferencia de cuadrados, 50% trinomio simple (niveles 5-8)
      if (Math.random() < 0.5) {
        // Diferencia de cuadrados: x² - a² = (x+a)(x-a)
        const a3 = numeroAleatorio(2, 7);
        enunciado = `Factoriza: x² - ${a3*a3}`;
        respuestaCorrecta = `(x + ${a3})(x - ${a3})`;
        opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'normal');
      } else {
        // Trinomio simple: x² + bx + c = (x+m)(x+n)
        const m = numeroAleatorio(2, 5);
        const n = numeroAleatorio(2, 5);
        const b = m + n;
        const c = m * n;
        enunciado = `Factoriza: x² + ${b}x + ${c}`;
        respuestaCorrecta = `(x + ${m})(x + ${n})`;
        opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'normal');
      }
      break;

    case 4: // Trinomio con coeficiente líder > 1 (niveles 9-12)
      const p = numeroAleatorio(2, 3);
      const r = numeroAleatorio(2, 3);
      const q = numeroAleatorio(1, 4);
      const s = numeroAleatorio(1, 4);
      const a4 = p * r;
      const b4 = p * s + q * r;
      const c4 = q * s;
      enunciado = `Factoriza: ${a4}x² + ${b4}x + ${c4}`;
      respuestaCorrecta = `(${p}x + ${q})(${r}x + ${s})`;
      opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'dificil');
      break;

    case 5: // Diferencia o suma de cubos (nivel 13+)
      const tipoCubo = Math.random() < 0.5 ? 'diferencia' : 'suma';
      const a5 = numeroAleatorio(2, 4);
      const b5 = numeroAleatorio(2, 4);
      const aCubo = a5 * a5 * a5;
      const bCubo = b5 * b5 * b5;
      let expresion5, factorizacion5;
      if (tipoCubo === 'diferencia') {
        expresion5 = `x³ - ${bCubo}`;
        factorizacion5 = `(x - ${b5})(x² + ${b5}x + ${b5*b5})`;
      } else {
        expresion5 = `x³ + ${bCubo}`;
        factorizacion5 = `(x + ${b5})(x² - ${b5}x + ${b5*b5})`;
      }
      enunciado = `Factoriza: ${expresion5}`;
      respuestaCorrecta = factorizacion5;
      opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'cubos');
      break;
  }

  // Mezclar opciones (incluye la correcta)
  opciones = mezclarArray([respuestaCorrecta, ...opciones]);
  return { enunciado, respuestaCorrecta, opciones };
}

// Genera opciones incorrectas (errores comunes) para cada tipo
function generarOpcionesFactorizacion(correcta, cantidad, nivel) {
  const opciones = new Set();
  let intentos = 0;
  while (opciones.size < cantidad && intentos < 100) {
    intentos++;
    let candidata = '';

    if (nivel === 'facil') {
      // Para factor común: cambiar signos o coeficientes
      const match = correcta.match(/(\d+)\(x ([+-]) (\d+)\)/);
      if (match) {
        const a = parseInt(match[1]);
        const signo = match[2];
        const b = parseInt(match[3]);
        const variantes = [
          `${a}(x ${signo === '+' ? '-' : '+'} ${b})`,
          `${a+1}(x ${signo} ${b})`,
          `${a}(x ${signo} ${b+1})`,
          `${a}(x ${signo === '+' ? '-' : '+'} ${b+1})`
        ];
        candidata = variantes[numeroAleatorio(0, variantes.length-1)];
      } else {
        // Fallback: cambiar números
        const nums = correcta.match(/\d+/g);
        if (nums) {
          const a = parseInt(nums[0]);
          const b = parseInt(nums[1] || '1');
          candidata = `${a+1}(x + ${b})`;
        }
      }
    } else if (nivel === 'normal') {
      // Para binomios: cambiar signos o factores
      const match = correcta.match(/\(x \+ (\d+)\)\(x - (\d+)\)/);
      if (match) {
        const a = parseInt(match[1]);
        const b = parseInt(match[2]);
        const variantes = [
          `(x - ${a})(x + ${b})`,
          `(x + ${a})(x + ${b})`,
          `(x - ${a})(x - ${b})`,
          `(x + ${a+1})(x - ${b})`
        ];
        candidata = variantes[numeroAleatorio(0, variantes.length-1)];
      } else {
        const match2 = correcta.match(/\(x \+ (\d+)\)\(x \+ (\d+)\)/);
        if (match2) {
          const a = parseInt(match2[1]);
          const b = parseInt(match2[2]);
          const variantes = [
            `(x - ${a})(x + ${b})`,
            `(x + ${a})(x - ${b})`,
            `(x - ${a})(x - ${b})`,
            `(x + ${a+1})(x + ${b})`
          ];
          candidata = variantes[numeroAleatorio(0, variantes.length-1)];
        }
      }
    } else if (nivel === 'dificil') {
      // Para trinomios con coeficiente >1
      const match = correcta.match(/\((\d+)x \+ (\d+)\)\((\d+)x \+ (\d+)\)/);
      if (match) {
        const p = parseInt(match[1]), q = parseInt(match[2]);
        const r = parseInt(match[3]), s = parseInt(match[4]);
        const variantes = [
          `(${p}x - ${q})(${r}x + ${s})`,
          `(${p}x + ${q})(${r}x - ${s})`,
          `(${p}x + ${q+1})(${r}x + ${s})`,
          `(${p+1}x + ${q})(${r}x + ${s})`
        ];
        candidata = variantes[numeroAleatorio(0, variantes.length-1)];
      }
    } else if (nivel === 'cubos') {
      // Para cubos: cambiar signos o coeficientes
      const match = correcta.match(/\(x ([+-]) (\d+)\)\(x² ([+-]) (\d+)x \+ (\d+)\)/);
      if (match) {
        const signo1 = match[1];
        const num1 = parseInt(match[2]);
        const signo2 = match[3];
        const num2 = parseInt(match[4]);
        const num3 = parseInt(match[5]);
        const variantes = [
          `(x ${signo1 === '+' ? '-' : '+'} ${num1})(x² ${signo2} ${num2+1}x + ${num3})`,
          `(x ${signo1} ${num1+1})(x² ${signo2} ${num2}x + ${num3})`,
          `(x ${signo1 === '+' ? '-' : '+'} ${num1})(x² ${signo2 === '+' ? '-' : '+'} ${num2}x + ${num3})`
        ];
        candidata = variantes[numeroAleatorio(0, variantes.length-1)];
      }
    }

    if (candidata && candidata !== correcta) {
      opciones.add(candidata);
    }
  }
  return Array.from(opciones);
}

// Mezcla un array (Fisher-Yates)
function mezclarArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

// Autenticación con Firebase
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
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
  const dificultad = obtenerDificultad(jugador.nivel);
  preguntaActual = generarPregunta(dificultad);
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
    xpGanada = 10 + Math.min(racha, 5) * 2; // base + bono por racha
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

  // Actualizar experiencia y nivel
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
