// ---------- Configuración de niveles y regiones ----------
const XP_POR_NIVEL = 100;
const REGIONES = [
  { minNivel: 1, nombre: "Aldea del Factor Común" },
  { minNivel: 3, nombre: "Bosque de la Diferencia de Cuadrados" },
  { minNivel: 5, nombre: "Montaña del Trinomio Cuadrado" },
  { minNivel: 8, nombre: "Cueva de la Factorización Compleja" },
  { minNivel: 12, nombre: "Ciudadela de los Polinomios" }
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
    let enunciado, respuestaCorrecta, opciones = [];

    // Generamos la expresión y su factorización según la dificultad
    if (dificultad === 'facil') {
        // Factor común monomio: ax + ab = a(x + b)
        const a = numeroAleatorio(2, 6);
        const b = numeroAleatorio(2, 9);
        const termino1 = a * b;
        // Expresión: a*x + termino1
        const expresion = `${a}x + ${termino1}`;
        const factorizacion = `${a}(x + ${b})`;
        enunciado = `Factoriza: ${expresion}`;
        respuestaCorrecta = factorizacion;
        // Generamos opciones incorrectas
        opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'facil');
    } else if (dificultad === 'normal') {
        // 50% diferencia de cuadrados, 50% trinomio simple (coeficiente líder = 1)
        if (Math.random() < 0.5) {
            // Diferencia de cuadrados: x² - a² = (x + a)(x - a)
            const a = numeroAleatorio(2, 7);
            const expresion = `x² - ${a*a}`;
            const factorizacion = `(x + ${a})(x - ${a})`;
            enunciado = `Factoriza: ${expresion}`;
            respuestaCorrecta = factorizacion;
            opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'normal');
        } else {
            // Trinomio simple: x² + bx + c = (x + m)(x + n) con m*n = c y m+n = b
            const m = numeroAleatorio(2, 5);
            const n = numeroAleatorio(2, 5);
            const b = m + n;
            const c = m * n;
            const expresion = `x² + ${b}x + ${c}`;
            const factorizacion = `(x + ${m})(x + ${n})`;
            enunciado = `Factoriza: ${expresion}`;
            respuestaCorrecta = factorizacion;
            opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'normal');
        }
    } else { // dificil
        // Trinomio con coeficiente líder > 1: ax² + bx + c = (px + q)(rx + s)
        // Generamos p, q, r, s de modo que a = p*r, b = p*s + q*r, c = q*s
        const p = numeroAleatorio(2, 3);
        const r = numeroAleatorio(2, 3);
        const q = numeroAleatorio(1, 4);
        const s = numeroAleatorio(1, 4);
        const a = p * r;
        const b = p * s + q * r;
        const c = q * s;
        const expresion = `${a}x² + ${b}x + ${c}`;
        const factorizacion = `(${p}x + ${q})(${r}x + ${s})`;
        enunciado = `Factoriza: ${expresion}`;
        respuestaCorrecta = factorizacion;
        opciones = generarOpcionesFactorizacion(respuestaCorrecta, 3, 'dificil');
    }

    // Mezclamos las opciones
    opciones = mezclarArray([respuestaCorrecta, ...opciones]);

    return {
        enunciado: enunciado,
        respuestaCorrecta: respuestaCorrecta,
        opciones: opciones
    };
}

// Genera N opciones incorrectas para una factorización dada
function generarOpcionesFactorizacion(correcta, cantidad, nivel) {
    const opciones = new Set();
    let intentos = 0;
    while (opciones.size < cantidad && intentos < 100) {
        intentos++;
        let candidata = '';
        if (nivel === 'facil') {
            // Errores: cambiar signos, cambiar el factor común
            const match = correcta.match(/(\d+)\(x \+ (\d+)\)/);
            if (match) {
                const a = parseInt(match[1]);
                const b = parseInt(match[2]);
                const variantes = [
                    `${a}(x - ${b})`,
                    `${a+1}(x + ${b})`,
                    `${a}(x + ${b+1})`,
                    `${a}(x - ${b+1})`
                ];
                candidata = variantes[numeroAleatorio(0, variantes.length-1)];
            }
        } else if (nivel === 'normal') {
            // Errores: signos cambiados, factores intercambiados, etc.
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
        } else { // dificil
            // Errores: cambiar coeficientes, signos, etc.
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
