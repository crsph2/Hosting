// ============================================================
// sistemas.js – "Operación: Sistema" (VERSIÓN MEJORADA)
// ============================================================

// ---- CONSTANTES ----
const XP_POR_NIVEL = 100;
const MONEDAS_REWARDS = 200;
const MAX_PISTAS = 5;           // Límite global de pistas
const MAX_INTENTOS = 5;          // Intentos fallidos antes de explosión

// ========== GENERADORES DE SISTEMAS ==========

// Genera un sistema para el método de SUSTITUCIÓN
// Ejemplo: y = mx + b;  ax + by = c
function generarSistemaSustitucion() {
    let x, y, m, b, a, c;
    let intentos = 0;
    do {
        x = Math.floor(Math.random() * 11) - 5;   // -5..5
        y = Math.floor(Math.random() * 11) - 5;
        m = Math.floor(Math.random() * 5) + 1;    // 1..5 (pendiente no cero)
        b = y - m * x;                            // para que y = m*x + b
        // Segunda ecuación: a*x + y = c (o a*x - y = c)
        a = Math.floor(Math.random() * 5) + 1;
        c = a * x + y;
        intentos++;
    } while ((x === 0 && y === 0) || intentos < 3 || Math.abs(b) > 10 || Math.abs(c) > 20);
    // Asegurar soluciones enteras y no triviales

    const eq1 = `y = ${m}x + ${b}`;
    const eq2 = `${a}x + y = ${c}`;
    const pistas = [
        'Busca una ecuación donde una variable ya esté despejada.',
        `Sustituye y = ${m}x + ${b} en la segunda ecuación.`,
        `Obtendrás una ecuación con una sola variable: ${a}x + (${m}x + ${b}) = ${c}. Resuelve y luego encuentra y.`
    ];
    return { method: 'sustitucion', eq1, eq2, solX: x, solY: y, pistas };
}

// Genera un sistema para el método de REDUCCIÓN (suma/resta)
// Ejemplo: ax + by = c;  dx + ey = f  donde b y e son opuestos o iguales
function generarSistemaReduccion() {
    let x, y, a, b, c, d, e, f;
    let intentos = 0;
    do {
        x = Math.floor(Math.random() * 11) - 5;
        y = Math.floor(Math.random() * 11) - 5;
        // Hacemos que los coeficientes de y sean opuestos: b = p, e = -p
        let p = Math.floor(Math.random() * 5) + 1;
        b = p;
        e = -p;
        a = Math.floor(Math.random() * 5) + 1;
        d = Math.floor(Math.random() * 5) + 1;
        c = a * x + b * y;
        f = d * x + e * y;
        intentos++;
    } while ((x === 0 && y === 0) || Math.abs(c) > 30 || Math.abs(f) > 30 || intentos < 3);

    const eq1 = `${a}x + ${b}y = ${c}`;
    const eq2 = `${d}x + ${e}y = ${f}`;
    const pistas = [
        'Observa que los coeficientes de y son opuestos (suma las ecuaciones).',
        'Suma ambas ecuaciones para eliminar y.',
        `Obtendrás ${a+d}x = ${c+f}, luego x = ${x}. Sustituye para hallar y.`
    ];
    return { method: 'reduccion', eq1, eq2, solX: x, solY: y, pistas };
}

// Genera un sistema para el método de IGUALACIÓN
// Ambas ecuaciones despejadas en y: y = m1*x + b1; y = m2*x + b2
function generarSistemaIgualacion() {
    let x, y, m1, b1, m2, b2;
    let intentos = 0;
    do {
        x = Math.floor(Math.random() * 11) - 5;
        y = Math.floor(Math.random() * 11) - 5;
        m1 = Math.floor(Math.random() * 5) + 1;
        m2 = Math.floor(Math.random() * 5) + 1;
        // Evitar que sean iguales
        if (m1 === m2) m2 = (m2 + 1) % 5 + 1;
        b1 = y - m1 * x;
        b2 = y - m2 * x;
        intentos++;
    } while ((x === 0 && y === 0) || Math.abs(b1) > 15 || Math.abs(b2) > 15 || intentos < 3);

    const eq1 = `y = ${m1}x + ${b1}`;
    const eq2 = `y = ${m2}x + ${b2}`;
    const pistas = [
        'Despeja y en ambas ecuaciones (ya lo están).',
        `Iguala las expresiones: ${m1}x + ${b1} = ${m2}x + ${b2}.`,
        `Resuelve: ${m1-m2}x = ${b2-b1}, x = ${x}. Sustituye para y.`
    ];
    return { method: 'igualacion', eq1, eq2, solX: x, solY: y, pistas };
}

// Genera sistema para el DESAFÍO GRÁFICO
function generarSistemaGrafico() {
    let x, y, m1, b1, m2, b2;
    let intentos = 0;
    do {
        x = Math.floor(Math.random() * 11) - 5;
        y = Math.floor(Math.random() * 11) - 5;
        m1 = Math.floor(Math.random() * 5) + 1;
        m2 = Math.floor(Math.random() * 5) + 1;
        if (m1 === m2) m2 = (m2 + 1) % 5 + 1;
        b1 = y - m1 * x;
        b2 = y - m2 * x;
        intentos++;
    } while ((x === 0 && y === 0) || Math.abs(b1) > 15 || Math.abs(b2) > 15 || intentos < 3);

    const eq1 = `y = ${m1}x + ${b1}`;
    const eq2 = `y = ${m2}x + ${b2}`;
    const correctPoint = { x, y };

    // Generar 3 distractores a partir del punto correcto
    const distractors = [];
    const posibles = [
        { x: x + 1, y: y }, { x: x - 1, y: y }, { x, y: y + 1 }, { x, y: y - 1 },
        { x: x + 1, y: y + 1 }, { x: x - 1, y: y - 1 },
        { x: y, y: x } // intercambio
    ];
    // Tomar 3 aleatorios, asegurando que no sean iguales al correcto y no repetidos
    const shuffled = posibles.sort(() => Math.random() - 0.5);
    for (let p of shuffled) {
        if (distractors.length >= 3) break;
        if (p.x !== correctPoint.x || p.y !== correctPoint.y) {
            // Evitar duplicados
            if (!distractors.some(d => d.x === p.x && d.y === p.y)) {
                distractors.push(p);
            }
        }
    }
    // Si no se generaron suficientes, rellenar con valores fijos
    while (distractors.length < 3) {
        let dx = Math.floor(Math.random() * 7) - 3;
        let dy = Math.floor(Math.random() * 7) - 3;
        if (dx !== 0 || dy !== 0) {
            if (!distractors.some(d => d.x === correctPoint.x + dx && d.y === correctPoint.y + dy)) {
                distractors.push({ x: correctPoint.x + dx, y: correctPoint.y + dy });
            }
        }
    }

    return { eq1, eq2, correctPoint, distractors };
}

// Genera sistema para el DESAFÍO ESTRATEGIA
// El método óptimo se determina según los coeficientes
function generarSistemaEstrategia() {
    let x, y, a, b, c, d, e, f;
    let intentos = 0;
    // Elegir método óptimo al azar entre sustitución, reducción, igualación
    const metodos = ['sustitucion', 'reduccion', 'igualacion'];
    const metodoOptimo = metodos[Math.floor(Math.random() * metodos.length)];
    // Generar sistema que se resuelva bien con ese método
    switch (metodoOptimo) {
        case 'sustitucion':
            // y despejada fácil
            do {
                x = Math.floor(Math.random() * 11) - 5;
                y = Math.floor(Math.random() * 11) - 5;
                let m = Math.floor(Math.random() * 5) + 1;
                let b1 = y - m * x;
                let a1 = Math.floor(Math.random() * 5) + 1;
                let c1 = a1 * x + y;
                // eq1: y = m x + b1, eq2: a1 x + y = c1
                // Asegurar que el método de sustitución sea razonable
                if (Math.abs(b1) < 15 && Math.abs(c1) < 30) {
                    a = a1; b = 0; c = c1; d = m; e = b1; f = 0; // guardamos para después
                    // Reconstruir las ecuaciones
                    const eq1 = `y = ${m}x + ${b1}`;
                    const eq2 = `${a1}x + y = ${c1}`;
                    return { eq1, eq2, solX: x, solY: y, metodoOptimo: 'sustitucion', pistas: [] };
                }
                intentos++;
            } while (intentos < 20);
            break;
        case 'reduccion':
            do {
                x = Math.floor(Math.random() * 11) - 5;
                y = Math.floor(Math.random() * 11) - 5;
                let p = Math.floor(Math.random() * 5) + 1;
                let a1 = Math.floor(Math.random() * 5) + 1;
                let d1 = Math.floor(Math.random() * 5) + 1;
                let b1 = p;
                let e1 = -p;
                let c1 = a1 * x + b1 * y;
                let f1 = d1 * x + e1 * y;
                if (Math.abs(c1) < 30 && Math.abs(f1) < 30) {
                    const eq1 = `${a1}x + ${b1}y = ${c1}`;
                    const eq2 = `${d1}x + ${e1}y = ${f1}`;
                    return { eq1, eq2, solX: x, solY: y, metodoOptimo: 'reduccion', pistas: [] };
                }
                intentos++;
            } while (intentos < 20);
            break;
        case 'igualacion':
            do {
                x = Math.floor(Math.random() * 11) - 5;
                y = Math.floor(Math.random() * 11) - 5;
                let m1 = Math.floor(Math.random() * 5) + 1;
                let m2 = Math.floor(Math.random() * 5) + 1;
                if (m1 === m2) m2 = (m2 + 1) % 5 + 1;
                let b1 = y - m1 * x;
                let b2 = y - m2 * x;
                if (Math.abs(b1) < 15 && Math.abs(b2) < 15) {
                    const eq1 = `y = ${m1}x + ${b1}`;
                    const eq2 = `y = ${m2}x + ${b2}`;
                    return { eq1, eq2, solX: x, solY: y, metodoOptimo: 'igualacion', pistas: [] };
                }
                intentos++;
            } while (intentos < 20);
            break;
    }
    // Fallback: si no se generó, devolver un sistema fijo
    return {
        eq1: '2x + 3y = 8',
        eq2: '3x - y = 1',
        solX: 1,
        solY: 2,
        metodoOptimo: 'reduccion',
        pistas: []
    };
}

// ========== INICIALIZACIÓN DEL ESTADO ==========
let gameState = {};

function reiniciarEstado() {
    gameState = {
        currentScreen: 'START',
        bombas: {
            1: { completada: false, intentos: 0, pistasUsadas: 0 },
            2: { completada: false, intentos: 0, pistasUsadas: 0 },
            3: { completada: false, intentos: 0, pistasUsadas: 0 }
        },
        grafico: { completada: false, intentos: 0 },
        estrategia: { completada: false, intentos: 0, metodoElegido: null },
        puntuacion: 0,
        erroresTotales: 0,
        pistasDisponibles: MAX_PISTAS,   // LÍMITE GLOBAL
        pistasTotalesUsadas: 0,
        inicioTiempo: null,
        tiempoTotal: 0,
        ejercicios: {
            bomba1: null,
            bomba2: null,
            bomba3: null,
            grafico: null,
            estrategia: null
        },
        esperandoContinuar: false,
        faseEstrategia: 'metodo',
        metodoElegido: null,
        gameOver: false
    };
    // Generar todos los ejercicios aleatoriamente
    gameState.ejercicios.bomba1 = generarSistemaSustitucion();
    gameState.ejercicios.bomba2 = generarSistemaReduccion();
    gameState.ejercicios.bomba3 = generarSistemaIgualacion();
    const grafico = generarSistemaGrafico();
    gameState.ejercicios.grafico = grafico;
    // Barajar distractores
    gameState.ejercicios.grafico.distractors = mezclarArray([...grafico.distractors]);
    gameState.ejercicios.estrategia = generarSistemaEstrategia();
}

// ---- FUNCIONES AUXILIARES (sin cambios) ----
function mezclarArray(arr) { /* ... */ }
function validarNumero(val) { /* ... */ }
function sonIguales(a, b) { /* ... */ }

// ========== MANEJO DE PISTAS (con límite global) ==========
function manejarPista(num) {
    if (gameState.bombas[num].completada) return;
    if (gameState.pistasDisponibles <= 0) {
        gameState.bombas[num].feedback = '⚠️ No te quedan más pistas.';
        gameState.bombas[num].feedbackType = 'error';
        renderizar();
        return;
    }
    const ejercicio = gameState.ejercicios[`bomba${num}`];
    const pistasUsadas = gameState.bombas[num].pistasUsadas;
    if (pistasUsadas >= ejercicio.pistas.length) {
        gameState.bombas[num].feedback = 'Ya no quedan más pistas para esta bomba.';
        gameState.bombas[num].feedbackType = 'error';
        renderizar();
        return;
    }
    // Mostrar la siguiente pista
    const pista = ejercicio.pistas[pistasUsadas];
    gameState.bombas[num].pistasUsadas++;
    gameState.pistasDisponibles--;
    gameState.pistasTotalesUsadas++;
    gameState.bombas[num].feedback = `💡 Pista: ${pista}`;
    gameState.bombas[num].feedbackType = 'hint';
    renderizar();
}

// ========== MANEJO DE BOMBA (con límite de intentos y explosión) ==========
function manejarBomba(num) {
    if (gameState.bombas[num].completada) return;
    if (gameState.gameOver) return;

    const ejercicio = gameState.ejercicios[`bomba${num}`];
    const inputX = document.getElementById(`input-x-${num}`);
    const inputY = document.getElementById(`input-y-${num}`);
    if (!inputX || !inputY) return;

    const xVal = validarNumero(inputX.value);
    const yVal = validarNumero(inputY.value);
    if (xVal === null || yVal === null) {
        gameState.bombas[num].feedback = '⚠️ Ingresa valores numéricos válidos.';
        gameState.bombas[num].feedbackType = 'error';
        renderizar();
        return;
    }

    const okX = sonIguales(xVal, ejercicio.solX);
    const okY = sonIguales(yVal, ejercicio.solY);

    if (okX && okY) {
        // ACIERTO
        gameState.bombas[num].completada = true;
        gameState.bombas[num].feedback = '';
        const pistasUsadas = gameState.bombas[num].pistasUsadas;
        let puntos = 100;
        if (pistasUsadas === 1) puntos = 75;
        else if (pistasUsadas >= 2) puntos = 50;
        gameState.puntuacion += puntos;
        gameState.bombas[num].feedbackType = 'success';
        playSound('success');
        renderizar();
    } else {
        // ERROR
        gameState.bombas[num].intentos++;
        gameState.erroresTotales++;
        let mensaje = '❌ Revisa tus cálculos.';
        if (sonIguales(xVal, ejercicio.solY) && sonIguales(yVal, ejercicio.solX)) {
            mensaje = '⚠️ Parece que has intercambiado x e y.';
        } else if (!okX && okY) {
            mensaje = '⚠️ Revisa el valor de x.';
        } else if (okX && !okY) {
            mensaje = '⚠️ Revisa el valor de y.';
        }
        // Si ya lleva 3 intentos, sugerir pista
        if (gameState.bombas[num].intentos >= 3 && gameState.pistasDisponibles > 0) {
            mensaje += ' ¿Necesitas una pista?';
        }
        gameState.bombas[num].feedback = mensaje;
        gameState.bombas[num].feedbackType = 'error';
        playSound('error');

        // Verificar si llegó al máximo de intentos fallidos
        if (gameState.bombas[num].intentos >= MAX_INTENTOS) {
            // ¡EXPLOSIÓN!
            gameState.gameOver = true;
            playSound('explosion');
            gameState.currentScreen = 'GAME_OVER';
            renderizar();
            return;
        }
        renderizar();
    }
}

// ========== PANTALLA DE GAME OVER ==========
function renderGameOver() {
    return `
        <div class="final-screen" style="background: #2d0000; border: 3px solid #ff0000; border-radius: 20px; padding: 2rem;">
            <div class="big-icon">💥</div>
            <h1 style="color: #ff4444; font-size: 2.5rem;">¡BOMBA EXPLOTADA!</h1>
            <p style="color: #ffaaaa; font-size: 1.3rem;">Has fallado en desactivar la bomba.</p>
            <p style="color: #ffaaaa;">La misión ha fracasado. Inténtalo de nuevo.</p>
            <div class="final-actions" style="margin-top: 1.5rem;">
                <button class="rpg-button btn-primary" id="btn-retry-gameover">REINTENTAR MISIÓN</button>
                <button class="rpg-button btn-secondary" id="btn-back-lobby-gameover">VOLVER AL LOBBY</button>
            </div>
        </div>
    `;
}

// ========== DIBUJAR GRÁFICO (sin punto de intersección) ==========
function dibujarGrafico() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, w, h);

    const ejercicio = gameState.ejercicios.grafico;
    const eq1 = ejercicio.eq1;
    const eq2 = ejercicio.eq2;

    function parseRecta(eq) {
        const parts = eq.split('=');
        if (parts.length !== 2) return { m: 1, b: 0 };
        const right = parts[1].trim();
        let m = 1, b = 0;
        const xIndex = right.indexOf('x');
        if (xIndex === -1) {
            b = parseFloat(right) || 0;
            m = 0;
        } else {
            const coef = right.substring(0, xIndex).trim();
            if (coef === '' || coef === '+') m = 1;
            else if (coef === '-') m = -1;
            else m = parseFloat(coef) || 1;
            const rest = right.substring(xIndex + 1).trim();
            if (rest.startsWith('+')) b = parseFloat(rest.substring(1)) || 0;
            else if (rest.startsWith('-')) b = parseFloat(rest) || 0;
            else b = parseFloat(rest) || 0;
        }
        return { m, b };
    }

    const rect1 = parseRecta(eq1);
    const rect2 = parseRecta(eq2);

    // Rango dinámico basado en las rectas
    const cx = 0; // centro aproximado
    const cy = 0;
    let xMin = -8, xMax = 8;
    const yMin = Math.min(rect1.m * xMin + rect1.b, rect2.m * xMin + rect2.b, -5);
    const yMax = Math.max(rect1.m * xMax + rect1.b, rect2.m * xMax + rect2.b, 5);
    const rangoX = xMax - xMin;
    const rangoY = yMax - yMin;
    const escala = Math.min((w - 2 * padding) / rangoX, (h - 2 * padding) / rangoY) * 0.9;
    const midX = (xMin + xMax) / 2;
    const midY = (yMin + yMax) / 2;

    function toCanvas(px, py) {
        const xCanvas = padding + (w - 2 * padding) / 2 + (px - midX) * escala;
        const yCanvas = padding + (h - 2 * padding) / 2 - (py - midY) * escala;
        return { x: xCanvas, y: yCanvas };
    }

    // Dibujar ejes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    const origen = toCanvas(0, 0);
    ctx.beginPath();
    ctx.moveTo(padding, origen.y);
    ctx.lineTo(w - padding, origen.y);
    ctx.moveTo(origen.x, padding);
    ctx.lineTo(origen.x, h - padding);
    ctx.stroke();

    // Cuadrícula
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const px = toCanvas(i, 0).x;
        ctx.beginPath();
        ctx.moveTo(px, padding);
        ctx.lineTo(px, h - padding);
        ctx.stroke();
        const py = toCanvas(0, i).y;
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(w - padding, py);
        ctx.stroke();
    }

    // Dibujar rectas
    function dibujarRecta(m, b, color) {
        const x1 = xMin;
        const x2 = xMax;
        const y1 = m * x1 + b;
        const y2 = m * x2 + b;
        const p1 = toCanvas(x1, y1);
        const p2 = toCanvas(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    dibujarRecta(rect1.m, rect1.b, '#e74c3c');
    dibujarRecta(rect2.m, rect2.b, '#3498db');

    // NO dibujar el punto de intersección (se elimina)
    // Etiquetas de ejes
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('x', w - padding + 5, origen.y + 4);
    ctx.fillText('y', origen.x + 4, padding - 5);
}

// ========== MODIFICAR afterRender para incluir GAME_OVER ==========
function afterRender() {
    const screen = gameState.currentScreen;

    if (screen === 'GAME_OVER') {
        document.getElementById('btn-retry-gameover')?.addEventListener('click', () => {
            reiniciarEstado();
            gameState.currentScreen = 'START';
            renderizar();
        });
        document.getElementById('btn-back-lobby-gameover')?.addEventListener('click', () => {
            window.location.href = 'lobby.html';
        });
        return;
    }

    // ... (resto del afterRender sin cambios, solo agregar el manejo de GAME_OVER al principio)
    // Asegurarse de que el resto del código de afterRender esté igual que antes
    // (incluyendo los listeners para START, INTRO, BOMBAS, GRAFICO, ESTRATEGIA, FINISH)
}

// ========== ACTUALIZAR renderFinish para mostrar pistas restantes ==========
function renderFinish() {
    const puntos = gameState.puntuacion;
    const errores = gameState.erroresTotales;
    const pistasUsadas = gameState.pistasTotalesUsadas;
    const tiempo = gameState.tiempoTotal;
    const estrellas = calcularEstrellas(errores, pistasUsadas);
    const starStr = '⭐'.repeat(estrellas) + '☆'.repeat(3 - estrellas);

    return `
        <div class="final-screen">
            <div class="big-icon">🎉</div>
            <h1 style="font-size:2.5rem; color:var(--btn-primary);">¡MISIÓN COMPLETADA!</h1>
            <div class="stars">${starStr}</div>
            <div class="score">🏆 Puntaje: ${puntos}</div>
            <div class="stats">
                <div class="stats-item">💣 Bombas desactivadas: <span>3/3</span></div>
                <div class="stats-item">❌ Errores: <span>${errores}</span></div>
                <div class="stats-item">💡 Pistas utilizadas: <span>${pistasUsadas}</span></div>
                <div class="stats-item">💡 Pistas restantes: <span>${gameState.pistasDisponibles}</span></div>
                <div class="stats-item">⏱️ Tiempo: <span>${formatearTiempo(tiempo)}</span></div>
            </div>
            <div style="margin:1rem 0; font-size:1.2rem; color:var(--btn-gold);">
                🪙 ¡Has ganado ${MONEDAS_REWARDS} monedas!
            </div>
            <div class="final-actions">
                <button class="rpg-button btn-primary" id="btn-replay">JUGAR NUEVAMENTE</button>
                <button class="rpg-button btn-secondary" id="btn-retry">REINTENTAR DESAFÍO</button>
                <button class="rpg-button btn-secondary" id="btn-back-lobby">VOLVER AL LOBBY</button>
            </div>
        </div>
    `;
}

// ========== ACTUALIZAR playSound con efecto de explosión ==========
function playSound(type) {
    if (localStorage.getItem('soundOn') === 'false') return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        if (type === 'success') {
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
            setTimeout(() => {
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.frequency.value = 1100;
                gain2.gain.value = 0.3;
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.15);
            }, 150);
        } else if (type === 'error') {
            osc.frequency.value = 300;
            gain.gain.value = 0.2;
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'explosion') {
            // Sonido de explosión: ruido blanco o tonos graves descendentes
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.6);
            gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        } else {
            osc.frequency.value = 600;
            gain.gain.value = 0.2;
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        }
    } catch (e) { /* Silenciar errores de audio */ }
}

// ========== ACTUALIZAR renderizar para incluir GAME_OVER ==========
function renderizar() {
    if (!elGameScreen) return;
    const screen = gameState.currentScreen;
    let html = '';

    switch (screen) {
        case 'START':
            html = renderStart();
            break;
        case 'INTRO':
            html = renderIntro();
            break;
        case 'BOMBA1':
        case 'BOMBA2':
        case 'BOMBA3':
            const num = parseInt(screen.replace('BOMBA', ''));
            html = renderBomba(num);
            break;
        case 'GRAFICO':
            html = renderGrafico();
            break;
        case 'ESTRATEGIA':
            html = renderEstrategia();
            break;
        case 'FINISH':
            html = renderFinish();
            break;
        case 'GAME_OVER':
            html = renderGameOver();
            break;
        default:
            html = '<p>Error: pantalla desconocida</p>';
    }

    elGameScreen.innerHTML = html;
    afterRender();
}

// ========== INICIALIZACIÓN (sin cambios) ==========
// ... (mantener el resto del código: iniciarJuego, cargarEstadoDesdeFirebase, etc.)
