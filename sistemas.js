// ============================================================
// sistemas.js – "Operación: Sistema"
// Juego de resolución de sistemas de ecuaciones 2x2
// ============================================================

// ---- CONSTANTES ----
const XP_POR_NIVEL = 100;
const MONEDAS_REWARDS = 200; // recompensa al completar misión

// ---- SISTEMAS PREDEFINIDOS (MVP) ----
// Cada objeto contiene: eq1, eq2 (como strings), solX, solY, pistas (array)
// y el método recomendado (para el desafío final)
const SISTEMAS = {
    bomba1: {
        method: 'sustitucion',
        eq1: 'y = 2x + 1',
        eq2: 'x + y = 7',
        solX: 2,
        solY: 5,
        pistas: [
            'Busca una ecuación donde una variable ya esté despejada.',
            'Sustituye y = 2x + 1 en la segunda ecuación.',
            'Obtendrás una ecuación con una sola variable: x + (2x + 1) = 7. Resuelve y luego encuentra y.'
        ]
    },
    bomba2: {
        method: 'reduccion',
        eq1: '2x + y = 9',
        eq2: '3x - y = 6',
        solX: 3,
        solY: 3,
        pistas: [
            'Observa que los coeficientes de y son opuestos (+1 y -1).',
            'Suma ambas ecuaciones para eliminar y.',
            'Obtendrás 5x = 15, luego x = 3. Sustituye para hallar y.'
        ]
    },
    bomba3: {
        method: 'igualacion',
        eq1: '2x - y = 1',
        eq2: 'x + y = 5',
        solX: 2,
        solY: 3,
        pistas: [
            'Despeja y en ambas ecuaciones.',
            'Iguala las expresiones obtenidas: 2x - 1 = 5 - x.',
            'Resuelve: 3x = 6, x = 2. Sustituye para y.'
        ]
    },
    grafico: {
        eq1: 'y = 2x - 1',
        eq2: 'y = -x + 5',
        correctPoint: { x: 2, y: 3 },
        distractors: [
            { x: 3, y: 2 },   // intercambio
            { x: 2, y: 1 },   // error en y
            { x: 1, y: 4 }    // punto cercano
        ]
    },
    estrategia: {
        eq1: '2x + 3y = 8',
        eq2: '3x - y = 1',
        metodoOptimo: 'reduccion',
        solX: 1,
        solY: 2,
        pistas: [] // no se usan pistas en este desafío
    }
};

// ---- ESTADO DEL JUEGO ----
let gameState = {
    currentScreen: 'START', // START | INTRO | BOMBA1 | BOMBA2 | GRAFICO | BOMBA3 | ESTRATEGIA | FINISH
    bombas: {
        1: { completada: false, intentos: 0, pistasUsadas: 0 },
        2: { completada: false, intentos: 0, pistasUsadas: 0 },
        3: { completada: false, intentos: 0, pistasUsadas: 0 }
    },
    grafico: { completada: false, intentos: 0 },
    estrategia: { completada: false, intentos: 0, metodoElegido: null },
    puntuacion: 0,
    erroresTotales: 0,
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
    // Para controlar el flujo
    esperandoContinuar: false,
    // Para el desafío estrategia
    faseEstrategia: 'metodo', // 'metodo' | 'resolucion'
    metodoElegido: null
};

// ---- REFERENCIAS A DOM ----
let elGameScreen = null;

// ---- FUNCIONES AUXILIARES ----
function mezclarArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Validación flexible de números
function validarNumero(val) {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
}

// Comparación tolerante
function sonIguales(a, b) {
    if (a === undefined || b === undefined) return false;
    return Math.abs(a - b) < 1e-9;
}

// ---- INICIALIZACIÓN DEL JUEGO ----
function iniciarJuego() {
    elGameScreen = document.getElementById('game-screen');
    if (!elGameScreen) return;

    // Cargar datos del jugador
    if (!window.jugador) {
        // Esperar a que common.js cargue
        document.addEventListener('jugador-cargado', () => {
            cargarEstadoDesdeFirebase();
            renderizar();
        });
    } else {
        cargarEstadoDesdeFirebase();
        renderizar();
    }

    // Configurar botones de la cabecera (común)
    const btnEdit = document.getElementById('btn-edit-name');
    if (btnEdit) btnEdit.addEventListener('click', () => {
        if (window.jugador) {
            const nuevo = prompt('Nuevo nombre:', window.jugador.nombre);
            if (nuevo && nuevo.trim()) {
                db.collection('usuarios').doc(window.uid).update({ nombre: nuevo.trim() })
                    .then(() => {
                        window.jugador.nombre = nuevo.trim();
                        sessionStorage.setItem('mathquest_nombre', nuevo.trim());
                        actualizarUICompleta();
                        mostrarFeedback('Nombre actualizado', 'exito');
                    });
            }
        }
    });

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.addEventListener('click', async () => {
        if (confirm('¿Cerrar sesión?')) {
            await firebase.auth().signOut();
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// ---- CARGA DE PROGRESO DESDE FIRESTORE ----
function cargarEstadoDesdeFirebase() {
    // Si el jugador ya tiene datos de sistemas, los cargamos
    if (window.jugador && window.jugador.sistemas) {
        const data = window.jugador.sistemas;
        // No reiniciamos el estado completo, solo usamos para saber si ya completó
        // En esta versión, cada partida es independiente, pero podemos mostrar un mensaje.
        // No sobreescribimos gameState para no mezclar partidas.
    }
    // Reiniciamos el estado para una nueva partida
    reiniciarEstado();
}

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
        metodoElegido: null
    };
    // Asignar ejercicios
    gameState.ejercicios.bomba1 = { ...SISTEMAS.bomba1 };
    gameState.ejercicios.bomba2 = { ...SISTEMAS.bomba2 };
    gameState.ejercicios.bomba3 = { ...SISTEMAS.bomba3 };
    gameState.ejercicios.grafico = { ...SISTEMAS.grafico };
    gameState.ejercicios.estrategia = { ...SISTEMAS.estrategia };
    // Barajar distractores del gráfico
    gameState.ejercicios.grafico.distractors = mezclarArray([...gameState.ejercicios.grafico.distractors]);
}

// ---- RENDERIZADO PRINCIPAL ----
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
            html = renderBomba(1);
            break;
        case 'BOMBA2':
            html = renderBomba(2);
            break;
        case 'GRAFICO':
            html = renderGrafico();
            break;
        case 'BOMBA3':
            html = renderBomba(3);
            break;
        case 'ESTRATEGIA':
            html = renderEstrategia();
            break;
        case 'FINISH':
            html = renderFinish();
            break;
        default:
            html = '<p>Error: pantalla desconocida</p>';
    }

    elGameScreen.innerHTML = html;
    // Post-render: añadir event listeners y dibujar gráficos si corresponde
    afterRender();
}

// ---- PANTALLA DE INICIO ----
function renderStart() {
    return `
        <div class="start-screen">
            <div class="title">💣 OPERACIÓN: SISTEMA</div>
            <div class="subtitle">Tu misión: desactivar el sistema antes de que sea demasiado tarde.</div>
            <button class="btn-start" id="btn-start-mission">COMENZAR MISIÓN</button>
            <div style="margin-top:1rem; display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
                <button class="rpg-button btn-secondary" id="btn-instructions">📖 Instrucciones</button>
                <button class="rpg-button btn-secondary" id="btn-sound-toggle">🔊 Sonido</button>
            </div>
        </div>
    `;
}

// ---- INTRODUCCIÓN ----
function renderIntro() {
    return `
        <div class="mission-intro">
            <p>🚨 Se ha activado el sistema de seguridad.</p>
            <p>💥 Hay 3 dispositivos que deben ser desactivados.</p>
            <p>🔐 Cada dispositivo está protegido por un sistema matemático.</p>
            <p>🧠 Encuentra la solución y utiliza el código para avanzar.</p>
            <button class="rpg-button btn-primary btn-mission" id="btn-start-mission">INICIAR</button>
        </div>
    `;
}

// ---- BOMBA (genérica) ----
function renderBomba(num) {
    const ejercicio = gameState.ejercicios[`bomba${num}`];
    if (!ejercicio) return '<p>Error: ejercicio no encontrado</p>';
    const completada = gameState.bombas[num].completada;
    const intentos = gameState.bombas[num].intentos;
    const pistasUsadas = gameState.bombas[num].pistasUsadas;
    const methodNames = {
        sustitucion: 'SUSTITUCIÓN',
        reduccion: 'REDUCCIÓN',
        igualacion: 'IGUALACIÓN'
    };
    const methodLabel = methodNames[ejercicio.method] || 'MÉTODO';

    let feedbackHtml = '';
    let hintHtml = '';
    let disabledAttr = completada ? 'disabled' : '';
    let inputDisabled = completada ? 'disabled' : '';
    let buttonText = completada ? '✅ Desactivada' : '💥 DESACTIVAR';

    // Si está completada, mostrar mensaje de éxito
    if (completada) {
        feedbackHtml = `<div class="bomb-feedback success">✅ ¡Bomba desactivada! Solución: x = ${ejercicio.solX}, y = ${ejercicio.solY}</div>`;
    } else {
        // Mostrar feedback del último intento (si existe)
        const fb = gameState.bombas[num].feedback || '';
        if (fb) {
            const type = gameState.bombas[num].feedbackType || 'error';
            feedbackHtml = `<div class="bomb-feedback ${type}">${fb}</div>`;
        }
        // Mostrar pista si se ha pedido
        if (pistasUsadas > 0 && pistasUsadas <= ejercicio.pistas.length) {
            const pista = ejercicio.pistas[pistasUsadas - 1];
            hintHtml = `<div class="bomb-feedback hint">💡 Pista: ${pista}</div>`;
        }
    }

    return `
        <div class="bomb-card">
            <div class="bomb-header">
                <span class="bomb-title">💣 BOMBA 0${num}</span>
                <span class="bomb-method">${methodLabel}</span>
            </div>
            <div class="bomb-system">
                <span class="eq">${ejercicio.eq1}</span>
                <span class="eq">${ejercicio.eq2}</span>
            </div>
            <div class="bomb-inputs">
                <label>x = <input type="number" id="input-x-${num}" step="any" ${inputDisabled}></label>
                <label>y = <input type="number" id="input-y-${num}" step="any" ${inputDisabled}></label>
            </div>
            ${feedbackHtml}
            ${hintHtml}
            <div class="bomb-actions">
                <button class="btn-disarm" id="btn-disarm-${num}" ${disabledAttr}>${buttonText}</button>
                ${!completada ? `<button class="btn-hint" id="btn-hint-${num}">💡 Pista</button>` : ''}
                ${completada ? `<button class="rpg-button btn-secondary" id="btn-continue-${num}">CONTINUAR →</button>` : ''}
            </div>
        </div>
    `;
}

// ---- DESAFÍO GRÁFICO ----
function renderGrafico() {
    const ejercicio = gameState.ejercicios.grafico;
    if (!ejercicio) return '<p>Error</p>';
    const completada = gameState.grafico.completada;
    const intentos = gameState.grafico.intentos;

    let feedbackHtml = '';
    let optionsHtml = '';
    if (completada) {
        feedbackHtml = `<div class="bomb-feedback success">✅ ¡Correcto! El punto de intersección es (${ejercicio.correctPoint.x}, ${ejercicio.correctPoint.y}).</div>`;
        optionsHtml = `<div class="graph-options">
            ${ejercicio.distractors.map((d, i) => {
                const isCorrect = (d.x === ejercicio.correctPoint.x && d.y === ejercicio.correctPoint.y);
                return `<button class="${isCorrect ? 'correct' : ''}" disabled>${i+1}. (${d.x}, ${d.y})</button>`;
            }).join('')}
        </div>`;
    } else {
        // Mostrar alternativas (incluyendo la correcta)
        const allOptions = [...ejercicio.distractors, ejercicio.correctPoint];
        const shuffled = mezclarArray([...allOptions]);
        optionsHtml = `<div class="graph-options" id="graph-options">
            ${shuffled.map((p, idx) => `
                <button data-x="${p.x}" data-y="${p.y}" data-idx="${idx}">(${p.x}, ${p.y})</button>
            `).join('')}
        </div>`;
        const fb = gameState.grafico.feedback || '';
        if (fb) {
            const type = gameState.grafico.feedbackType || 'error';
            feedbackHtml = `<div class="bomb-feedback ${type}">${fb}</div>`;
        }
    }

    return `
        <div class="graph-challenge">
            <h2 style="text-align:center;">📈 INTERCEPCIÓN</h2>
            <p style="text-align:center;">¿En qué punto se intersectan las dos funciones?</p>
            <div class="graph-container">
                <canvas id="graph-canvas" width="400" height="400"></canvas>
            </div>
            ${optionsHtml}
            ${feedbackHtml}
            ${completada ? `<div style="text-align:center; margin-top:1rem;"><button class="rpg-button btn-secondary" id="btn-continue-grafico">CONTINUAR →</button></div>` : ''}
        </div>
    `;
}

// ---- DESAFÍO ESTRATEGIA ----
function renderEstrategia() {
    const ejercicio = gameState.ejercicios.estrategia;
    if (!ejercicio) return '<p>Error</p>';
    const fase = gameState.faseEstrategia;
    const completada = gameState.estrategia.completada;

    let html = `<div class="bomb-card"><h2 style="text-align:center;">🎯 DESAFÍO FINAL</h2>`;
    html += `<div class="bomb-system"><span class="eq">${ejercicio.eq1}</span><span class="eq">${ejercicio.eq2}</span></div>`;

    if (fase === 'metodo' && !completada) {
        html += `
            <p style="text-align:center; font-weight:500;">¿Qué estrategia utilizarías para resolver este sistema?</p>
            <div class="strategy-options" id="strategy-options">
                <button data-metodo="sustitucion">A. Sustitución</button>
                <button data-metodo="reduccion">B. Adición</button>
                <button data-metodo="igualacion">C. Igualación</button>
                <button data-metodo="grafico">D. Método gráfico</button>
            </div>
            <div id="feedback-estrategia" class="bomb-feedback"></div>
        `;
    } else if (fase === 'resolucion' && !completada) {
        html += `
            <p style="text-align:center;">Resuelve el sistema y escribe la solución:</p>
            <div class="bomb-inputs">
                <label>x = <input type="number" id="input-x-estrategia" step="any"></label>
                <label>y = <input type="number" id="input-y-estrategia" step="any"></label>
            </div>
            <div id="feedback-estrategia-res" class="bomb-feedback"></div>
            <div class="bomb-actions">
                <button class="btn-disarm" id="btn-resolver-estrategia">💥 RESOLVER</button>
            </div>
        `;
    } else if (completada) {
        html += `
            <div class="bomb-feedback success">✅ ¡Misión completada! Solución: x = ${ejercicio.solX}, y = ${ejercicio.solY}</div>
            <div style="text-align:center; margin-top:1rem;"><button class="rpg-button btn-secondary" id="btn-continue-estrategia">VER RESULTADOS</button></div>
        `;
    }

    html += `</div>`;
    return html;
}

// ---- PANTALLA FINAL ----
function renderFinish() {
    const puntos = gameState.puntuacion;
    const errores = gameState.erroresTotales;
    const pistas = gameState.pistasTotalesUsadas;
    const tiempo = gameState.tiempoTotal;
    const estrellas = calcularEstrellas(errores, pistas);
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
                <div class="stats-item">💡 Pistas utilizadas: <span>${pistas}</span></div>
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

// ---- FUNCIONES DE CÁLCULO ----
function calcularEstrellas(errores, pistas) {
    if (errores === 0 && pistas === 0) return 3;
    if (errores <= 2 && pistas <= 1) return 2;
    return 1;
}

function formatearTiempo(segundos) {
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---- POST-RENDER: EVENTOS Y GRÁFICOS ----
function afterRender() {
    const screen = gameState.currentScreen;

    // START
    if (screen === 'START') {
        const btnStart = document.getElementById('btn-start-mission');
        if (btnStart) btnStart.addEventListener('click', () => {
            gameState.currentScreen = 'INTRO';
            renderizar();
        });
        const btnInst = document.getElementById('btn-instructions');
        if (btnInst) {
            btnInst.addEventListener('click', () => {
                alert('📖 Instrucciones:\n\nResuelve los sistemas de ecuaciones para desactivar las bombas.\nUsa los métodos de sustitución, reducción e igualación.\n¡Cuidado con los errores! Puedes pedir pistas si lo necesitas.');
            });
        }
        const btnSound = document.getElementById('btn-sound-toggle');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                // Toggle sonido (global)
                const soundOn = localStorage.getItem('soundOn') !== 'false';
                localStorage.setItem('soundOn', String(!soundOn));
                btnSound.textContent = soundOn ? '🔇 Sonido' : '🔊 Sonido';
            });
        }
    }

    // INTRO
    if (screen === 'INTRO') {
        const btnStart = document.getElementById('btn-start-mission');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                gameState.currentScreen = 'BOMBA1';
                gameState.inicioTiempo = Date.now();
                renderizar();
            });
        }
    }

    // BOMBAS
    for (let i = 1; i <= 3; i++) {
        if (screen === `BOMBA${i}`) {
            const btnDisarm = document.getElementById(`btn-disarm-${i}`);
            if (btnDisarm) {
                btnDisarm.addEventListener('click', () => manejarBomba(i));
            }
            const btnHint = document.getElementById(`btn-hint-${i}`);
            if (btnHint) {
                btnHint.addEventListener('click', () => manejarPista(i));
            }
            const btnContinue = document.getElementById(`btn-continue-${i}`);
            if (btnContinue) {
                btnContinue.addEventListener('click', () => {
                    // Avanzar a la siguiente pantalla
                    if (i === 1) gameState.currentScreen = 'BOMBA2';
                    else if (i === 2) gameState.currentScreen = 'GRAFICO';
                    else if (i === 3) gameState.currentScreen = 'ESTRATEGIA';
                    renderizar();
                });
            }
        }
    }

    // GRÁFICO
    if (screen === 'GRAFICO') {
        dibujarGrafico();
        if (!gameState.grafico.completada) {
            const options = document.querySelectorAll('#graph-options button');
            options.forEach(btn => {
                btn.addEventListener('click', () => manejarGrafico(btn));
            });
        } else {
            const btnCont = document.getElementById('btn-continue-grafico');
            if (btnCont) {
                btnCont.addEventListener('click', () => {
                    gameState.currentScreen = 'BOMBA3';
                    renderizar();
                });
            }
        }
    }

    // ESTRATEGIA
    if (screen === 'ESTRATEGIA') {
        if (gameState.faseEstrategia === 'metodo' && !gameState.estrategia.completada) {
            const opts = document.querySelectorAll('#strategy-options button');
            opts.forEach(btn => {
                btn.addEventListener('click', () => manejarEstrategiaMetodo(btn));
            });
        } else if (gameState.faseEstrategia === 'resolucion' && !gameState.estrategia.completada) {
            const btnRes = document.getElementById('btn-resolver-estrategia');
            if (btnRes) {
                btnRes.addEventListener('click', () => manejarEstrategiaResolucion());
            }
        } else if (gameState.estrategia.completada) {
            const btnCont = document.getElementById('btn-continue-estrategia');
            if (btnCont) {
                btnCont.addEventListener('click', () => {
                    finalizarMision();
                });
            }
        }
    }

    // FINISH
    if (screen === 'FINISH') {
        document.getElementById('btn-replay')?.addEventListener('click', () => {
            reiniciarEstado();
            gameState.currentScreen = 'START';
            renderizar();
        });
        document.getElementById('btn-retry')?.addEventListener('click', () => {
            // Reiniciar desde la primera bomba
            reiniciarEstado();
            gameState.currentScreen = 'BOMBA1';
            renderizar();
        });
        document.getElementById('btn-back-lobby')?.addEventListener('click', () => {
            window.location.href = 'lobby.html';
        });
    }
}

// ---- MANEJO DE BOMBA ----
function manejarBomba(num) {
    if (gameState.bombas[num].completada) return;
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
        // Correcto
        gameState.bombas[num].completada = true;
        gameState.bombas[num].feedback = '';
        // Sumar puntos (sin pistas: 100, con pistas: menos)
        const pistasUsadas = gameState.bombas[num].pistasUsadas;
        let puntos = 100;
        if (pistasUsadas === 1) puntos = 75;
        else if (pistasUsadas >= 2) puntos = 50;
        gameState.puntuacion += puntos;
        // Registrar
        gameState.bombas[num].feedbackType = 'success';
        // Reproducir sonido (si está activado)
        playSound('success');
        renderizar();
    } else {
        // Incorrecto
        gameState.bombas[num].intentos++;
        gameState.erroresTotales++;
        let mensaje = '❌ Revisa tus cálculos.';
        // Detectar errores comunes
        if (sonIguales(xVal, ejercicio.solY) && sonIguales(yVal, ejercicio.solX)) {
            mensaje = '⚠️ Parece que has intercambiado x e y.';
        } else if (!okX && okY) {
            mensaje = '⚠️ Revisa el valor de x.';
        } else if (okX && !okY) {
            mensaje = '⚠️ Revisa el valor de y.';
        }
        // Si ya lleva varios intentos, sugerir pista
        if (gameState.bombas[num].intentos >= 3) {
            mensaje += ' ¿Necesitas una pista?';
        }
        gameState.bombas[num].feedback = mensaje;
        gameState.bombas[num].feedbackType = 'error';
        playSound('error');
        renderizar();
    }
}

// ---- MANEJO DE PISTA ----
function manejarPista(num) {
    if (gameState.bombas[num].completada) return;
    const ejercicio = gameState.ejercicios[`bomba${num}`];
    const pistasUsadas = gameState.bombas[num].pistasUsadas;
    if (pistasUsadas >= ejercicio.pistas.length) {
        gameState.bombas[num].feedback = 'Ya no quedan más pistas.';
        gameState.bombas[num].feedbackType = 'error';
        renderizar();
        return;
    }
    gameState.bombas[num].pistasUsadas++;
    gameState.pistasTotalesUsadas++;
    // No penalizar puntos aún, solo registramos
    // Actualizar feedback para mostrar la pista
    gameState.bombas[num].feedback = '';
    renderizar();
}

// ---- MANEJO DE GRÁFICO ----
function manejarGrafico(btn) {
    if (gameState.grafico.completada) return;
    const x = parseFloat(btn.dataset.x);
    const y = parseFloat(btn.dataset.y);
    const correct = gameState.ejercicios.grafico.correctPoint;
    if (sonIguales(x, correct.x) && sonIguales(y, correct.y)) {
        gameState.grafico.completada = true;
        gameState.grafico.feedback = '✅ ¡Correcto! La solución del sistema corresponde al punto de intersección.';
        gameState.grafico.feedbackType = 'success';
        gameState.puntuacion += 100;
        playSound('success');
        renderizar();
    } else {
        gameState.grafico.intentos++;
        gameState.erroresTotales++;
        gameState.grafico.feedback = '❌ No es el punto correcto. Vuelve a intentarlo.';
        gameState.grafico.feedbackType = 'error';
        playSound('error');
        renderizar();
    }
}

// ---- MANEJO DE ESTRATEGIA (método) ----
function manejarEstrategiaMetodo(btn) {
    const metodo = btn.dataset.metodo;
    const ejercicio = gameState.ejercicios.estrategia;
    const feedback = document.getElementById('feedback-estrategia');
    if (!feedback) return;

    if (metodo === ejercicio.metodoOptimo) {
        feedback.textContent = '✅ ¡Excelente! Este es el método más conveniente. Ahora resuelve el sistema.';
        feedback.className = 'bomb-feedback success';
        gameState.faseEstrategia = 'resolucion';
        gameState.metodoElegido = metodo;
        // Sumar puntos por elección correcta
        gameState.puntuacion += 50;
        renderizar();
    } else {
        feedback.textContent = '⚠️ Esa estrategia también puede funcionar, pero no es la más eficiente. Intenta con otro método.';
        feedback.className = 'bomb-feedback error';
        // No penalizamos, solo sugerimos
        // Permitir elegir de nuevo
    }
}

// ---- MANEJO DE ESTRATEGIA (resolución) ----
function manejarEstrategiaResolucion() {
    const ejercicio = gameState.ejercicios.estrategia;
    const inputX = document.getElementById('input-x-estrategia');
    const inputY = document.getElementById('input-y-estrategia');
    const feedback = document.getElementById('feedback-estrategia-res');
    if (!inputX || !inputY || !feedback) return;

    const xVal = validarNumero(inputX.value);
    const yVal = validarNumero(inputY.value);
    if (xVal === null || yVal === null) {
        feedback.textContent = '⚠️ Ingresa valores numéricos válidos.';
        feedback.className = 'bomb-feedback error';
        return;
    }

    if (sonIguales(xVal, ejercicio.solX) && sonIguales(yVal, ejercicio.solY)) {
        gameState.estrategia.completada = true;
        gameState.puntuacion += 100;
        feedback.textContent = '✅ ¡Correcto! Has completado la misión.';
        feedback.className = 'bomb-feedback success';
        playSound('success');
        renderizar();
    } else {
        gameState.erroresTotales++;
        let mensaje = '❌ Revisa tus cálculos.';
        if (sonIguales(xVal, ejercicio.solY) && sonIguales(yVal, ejercicio.solX)) {
            mensaje = '⚠️ Parece que has intercambiado x e y.';
        }
        feedback.textContent = mensaje;
        feedback.className = 'bomb-feedback error';
        playSound('error');
        // No avanzamos
    }
}

// ---- FINALIZAR MISIÓN ----
function finalizarMision() {
    // Calcular tiempo
    if (gameState.inicioTiempo) {
        gameState.tiempoTotal = (Date.now() - gameState.inicioTiempo) / 1000;
    }
    // Guardar en Firebase
    guardarProgresoFirebase();

    gameState.currentScreen = 'FINISH';
    renderizar();
}

// ---- GUARDAR EN FIRESTORE ----
async function guardarProgresoFirebase() {
    if (!window.uid || !window.jugador) return;
    try {
        const estrellas = calcularEstrellas(gameState.erroresTotales, gameState.pistasTotalesUsadas);
        // Sumar monedas
        const nuevasMonedas = (window.jugador.monedas || 0) + MONEDAS_REWARDS;
        await db.collection('usuarios').doc(window.uid).update({
            monedas: nuevasMonedas,
            'sistemas.completado': true,
            'sistemas.puntuacion': gameState.puntuacion,
            'sistemas.estrellas': estrellas,
            'sistemas.bombasDesactivadas': 3,
            'sistemas.errores': gameState.erroresTotales,
            'sistemas.pistasUsadas': gameState.pistasTotalesUsadas,
            'sistemas.tiempo': gameState.tiempoTotal,
            historial: firebase.firestore.FieldValue.arrayUnion({
                juego: 'sistemas',
                puntuacion: gameState.puntuacion,
                estrellas: estrellas,
                errores: gameState.erroresTotales,
                pistas: gameState.pistasTotalesUsadas,
                fecha: new Date().toISOString()
            })
        });
        // Actualizar jugador en memoria
        window.jugador.monedas = nuevasMonedas;
        window.jugador.sistemas = {
            completado: true,
            puntuacion: gameState.puntuacion,
            estrellas: estrellas,
            bombasDesactivadas: 3,
            errores: gameState.erroresTotales,
            pistasUsadas: gameState.pistasTotalesUsadas,
            tiempo: gameState.tiempoTotal
        };
        // Actualizar UI común
        actualizarUICompleta();
        mostrarFeedback('🎉 ¡Misión completada! Has ganado 200 monedas.', 'exito');
    } catch (error) {
        console.error('Error al guardar progreso:', error);
    }
}

// ---- DIBUJAR GRÁFICO (Canvas) ----
function dibujarGrafico() {
    const canvas = document.getElementById('graph-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    const plotW = w - 2 * padding;
    const plotH = h - 2 * padding;

    // Limpiar
    ctx.clearRect(0, 0, w, h);

    // Determinar rango de visualización
    const ejercicio = gameState.ejercicios.grafico;
    // Extraer pendiente e intercepto de las ecuaciones (asumimos formato y = mx + b)
    const eq1 = ejercicio.eq1;
    const eq2 = ejercicio.eq2;
    // Parsear simple: asumimos "y = mx + b"
    function parseRecta(eq) {
        const parts = eq.split('=');
        if (parts.length !== 2) return { m: 1, b: 0 };
        const right = parts[1].trim();
        let m = 1, b = 0;
        // Buscar término x
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

    // Encontrar rango x apropiado: centrar en el punto de intersección
    const cx = ejercicio.correctPoint.x;
    const cy = ejercicio.correctPoint.y;
    let xMin = cx - 5, xMax = cx + 5;
    // Ajustar para que las rectas se vean bien
    const yMin = Math.min(rect1.m * xMin + rect1.b, rect2.m * xMin + rect2.b, cy - 3);
    const yMax = Math.max(rect1.m * xMax + rect1.b, rect2.m * xMax + rect2.b, cy + 3);
    const rangoX = xMax - xMin;
    const rangoY = yMax - yMin;
    // Escalar para que quepa
    const escala = Math.min(plotW / rangoX, plotH / rangoY) * 0.9;
    const midX = (xMin + xMax) / 2;
    const midY = (yMin + yMax) / 2;

    // Función de transformación
    function toCanvas(px, py) {
        const xCanvas = padding + plotW/2 + (px - midX) * escala;
        const yCanvas = padding + plotH/2 - (py - midY) * escala;
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

    // Dibujar cuadrícula (opcional)
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

    // Dibujar punto de intersección (si está visible)
    const pInt = toCanvas(cx, cy);
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(pInt.x, pInt.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('x', w - padding + 5, origen.y + 4);
    ctx.fillText('y', origen.x + 4, padding - 5);
    // Etiqueta del punto
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`(${cx}, ${cy})`, pInt.x + 10, pInt.y - 10);
}

// ---- SONIDO (simple) ----
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
        } else {
            osc.frequency.value = 600;
            gain.gain.value = 0.2;
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        }
    } catch (e) { /* Silenciar errores de audio */ }
}

// ---- INICIO ----
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que common.js cargue el jugador
    if (window.jugador) {
        iniciarJuego();
    } else {
        document.addEventListener('jugador-cargado', iniciarJuego);
    }
});

// Si por alguna razón no se dispara, intentar de nuevo
setTimeout(() => {
    if (!window.jugador) {
        console.warn('Recargando jugador...');
        cargarJugador();
    }
}, 2000);
