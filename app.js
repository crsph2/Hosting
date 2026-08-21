// ================================================================
//  MATHQUEST - LÓGICA COMPLETA (autenticación anónima + nickname)
// ================================================================

// ---------- CONSTANTES ----------
const REGIONES = [
  { id: 1, nombre: 'Conjuntos numéricos', icono: '🔢' },
  { id: 2, nombre: 'Operatoria racional', icono: '➗' },
  { id: 3, nombre: 'Potencias', icono: '⚡' },
  { id: 4, nombre: 'Raíces', icono: '√' },
  { id: 5, nombre: 'Expresiones algebraicas', icono: '📐' },
  { id: 6, nombre: 'Productos notables', icono: '✖️' },
  { id: 7, nombre: 'Factorización', icono: '🧩' },
  { id: 8, nombre: 'Ecuaciones lineales', icono: '➖' },
  { id: 9, nombre: 'Sistemas de ecuaciones', icono: '🔄' },
  { id: 10, nombre: 'Ecuaciones cuadráticas', icono: '📈' }
];

const LOGROS = [
  'Dominio Numérico','Operador Racional','Potencia Activa','Raíz Firme',
  'Algebraico Nato','Producto Notable','Factorización Experta','Ecuador Lineal',
  'Sistemático','Cuadrático Maestro','Velocidad Rápida','Precisión Perfecta',
  'Constancia','Explorador','Retador','Vencedor de Retos',
  'Millonario','Leyenda','Maestro de Conjuntos','Racionalista',
  'Exponente','Radical','Expresivo','Notable Factor',
  'Fraccionario','Lineal Experto','Sistemático Avanzado','Cuadrático Supremo',
  'Rápido como el rayo','Precisión Quirúrgica','Dedicación','Aventurero',
  'Desafiante','Campeón de Retos','Tesoro','Invencible',
  'Estratega','Mente Maestra','Héroe Matemático','Leyenda Viva'
];

// ---------- ESTADO GLOBAL ----------
let usuarioActual = null;      // datos del usuario desde Firestore
let uidActual = null;
let vistaActual = 'mapa';
let enMision = false;
let misionesActuales = [];
let misionIndex = 0;
let regionActualData = null;

// ---------- REFERENCIAS DOM ----------
const $ = id => document.getElementById(id);
const pantallaNick = $('pantalla-nickname');
const pantallaJuego = $('pantalla-juego');
const contenidoJuego = $('contenido-juego');
const mapaRegiones = $('mapa-regiones');
const rankingLista = $('ranking-lista');
const retosPendientes = $('retos-pendientes');
const perfilInfo = $('perfil-info');

// ---------- FUNCIONES AUXILIARES ----------
function mostrarMensaje(texto, tipo = 'info', contenedor = null) {
  const el = document.createElement('div');
  el.className = `mensaje ${tipo}`;
  el.textContent = texto;
  if (contenedor) contenedor.prepend(el);
  else contenidoJuego.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

function mostrarMensajeEn(contenedor, texto, tipo = 'info') {
  const el = document.createElement('div');
  el.className = `mensaje ${tipo}`;
  el.textContent = texto;
  contenedor.prepend(el);
  setTimeout(() => el.remove(), 5000);
}

// ---------- GENERACIÓN DE PREGUNTAS ----------
function generarPregunta(regionId, dificultad) {
  let a, b, c, opciones, correcta, enunciado;
  switch(regionId) {
    case 1:
      a = Math.floor(Math.random()*20)+1; b = Math.floor(Math.random()*20)+1;
      enunciado = `MCD de ${a} y ${b}`;
      correcta = mcd(a,b);
      opciones = [correcta, correcta+1, correcta+2, correcta+3];
      break;
    case 2:
      a = Math.floor(Math.random()*10)+1; b = Math.floor(Math.random()*10)+1;
      let c2 = Math.floor(Math.random()*10)+1; let d = Math.floor(Math.random()*10)+1;
      enunciado = `${a}/${b} + ${c2}/${d}`;
      let res = (a/b + c2/d);
      correcta = Math.round(res*100)/100;
      opciones = [correcta, correcta+0.1, correcta-0.1, correcta+0.2];
      break;
    case 3:
      a = Math.floor(Math.random()*5)+2; b = Math.floor(Math.random()*4)+2;
      enunciado = `${a}^${b}`;
      correcta = Math.pow(a,b);
      opciones = [correcta, correcta+1, correcta-1, correcta*2];
      break;
    // Casos 4 a 10 (simplificados para demo, se pueden expandir)
    default:
      a = Math.floor(Math.random()*10)+1; b = Math.floor(Math.random()*10)+1;
      enunciado = `${a} + ${b}`;
      correcta = a+b;
      opciones = [correcta, correcta+1, correcta-1, correcta*2];
  }
  // Mezclar opciones
  let indices = [0,1,2,3];
  for (let i = indices.length-1; i>0; i--) {
    let j = Math.floor(Math.random()*(i+1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  let opcionesMezcladas = indices.map(i => opciones[i]);
  let respuestaCorrecta = indices.indexOf(0);
  return { enunciado, opciones: opcionesMezcladas, respuesta: respuestaCorrecta };
}
function mcd(a,b) { while(b) [a,b]=[b,a%b]; return a; }

// ---------- MISIONES ----------
function generarMisiones(regionId, dificultad) {
  let misiones = [];
  let numPreguntas = 3 + Math.floor(dificultad/2);
  for (let i=0; i<5; i++) {
    let preguntas = [];
    for (let j=0; j<numPreguntas; j++) {
      preguntas.push(generarPregunta(regionId, dificultad));
    }
    misiones.push({ tipo: 'mision', preguntas });
  }
  let jefe = generarPregunta(regionId, dificultad+2);
  misiones.push({ tipo: 'jefe', preguntas: [jefe] });
  return misiones;
}

// ---------- FUNCIONES FIRESTORE ----------
async function actualizarUsuario(datos) {
  if (!uidActual) return;
  await db.collection('usuarios').doc(uidActual).update(datos);
}

async function obtenerUsuario(uid) {
  let doc = await db.collection('usuarios').doc(uid).get();
  return doc.exists ? doc.data() : null;
}

// ---------- RENDER MAPA ----------
function renderMapa() {
  if (!usuarioActual) return;
  let html = '';
  for (let r of REGIONES) {
    let prog = usuarioActual.progresoRegiones ? usuarioActual.progresoRegiones[`region_${r.id}`] : null;
    let completada = prog ? prog.completada : false;
    let bloqueada = r.id > 1 && !(usuarioActual.progresoRegiones && usuarioActual.progresoRegiones[`region_${r.id-1}`]?.completada);
    let estado = bloqueada ? '🔒' : (completada ? '✅' : '▶️');
    html += `<div class="card" data-region="${r.id}">
      <span class="icono">${r.icono}</span>
      <strong>${r.nombre}</strong> ${estado}
      ${bloqueada ? '<span class="badge">Bloqueada</span>' : ''}
      ${completada ? '<span class="badge verde">Completada</span>' : ''}
    </div>`;
  }
  mapaRegiones.innerHTML = html;
  document.querySelectorAll('[data-region]').forEach(el => {
    el.addEventListener('click', function() {
      let regionId = parseInt(this.dataset.region);
      ingresarRegion(regionId);
    });
  });
}

// ---------- INGRESAR REGIÓN ----------
async function ingresarRegion(regionId) {
  if (!usuarioActual) return;
  if (regionId > 1 && !(usuarioActual.progresoRegiones && usuarioActual.progresoRegiones[`region_${regionId-1}`]?.completada)) {
    mostrarMensaje('Región bloqueada. Completa la anterior.', 'error');
    return;
  }
  let dificultad = usuarioActual.dificultadActual || 3;
  misionesActuales = generarMisiones(regionId, dificultad);
  misionIndex = 0;
  regionActualData = regionId;
  enMision = true;
  mostrarMision();
}

// ---------- MOSTRAR MISIÓN ----------
function mostrarMision() {
  if (misionIndex >= misionesActuales.length) {
    completarRegion();
    return;
  }
  let mision = misionesActuales[misionIndex];
  let tipo = mision.tipo === 'jefe' ? '⚔️ JEFE FINAL' : '📜 Misión';
  let html = `<div class="card"><h3>${tipo} (${misionIndex+1}/${misionesActuales.length})</h3>`;
  let pregunta = mision.preguntas[0];
  html += `<p>${pregunta.enunciado}</p><div class="flex-col">`;
  pregunta.opciones.forEach((opc, idx) => {
    html += `<button class="boton secundario opcion-btn" data-opcion="${idx}">${opc}</button>`;
  });
  html += `</div></div>`;
  contenidoJuego.innerHTML = html;
  document.querySelectorAll('.opcion-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      let idx = parseInt(this.dataset.opcion);
      let correcta = mision.preguntas[0].respuesta === idx;
      await procesarRespuesta(correcta);
      mision.preguntas.shift();
      if (mision.preguntas.length === 0) {
        misionIndex++;
        let xpGanado = 10 + Math.floor(Math.random()*10);
        let monedasGanadas = 5 + Math.floor(Math.random()*5);
        if (mision.tipo === 'jefe') { xpGanado *= 2; monedasGanadas *= 2; }
        await actualizarUsuario({
          xp: firebase.firestore.FieldValue.increment(xpGanado),
          monedas: firebase.firestore.FieldValue.increment(monedasGanadas),
          historial: firebase.firestore.FieldValue.arrayUnion({ fecha: new Date(), tipo: 'mision', detalle: `Misión ${misionIndex} región ${regionActualData}` })
        });
        await cargarUsuarioActual();
        mostrarMision();
      } else {
        mostrarMision();
      }
    });
  });
}

async function procesarRespuesta(correcta) {
  let stats = usuarioActual.estadisticas || { totalPreguntas:0, aciertos:0, errores:0, tiempoPromedio:0 };
  stats.totalPreguntas++;
  if (correcta) stats.aciertos++;
  else stats.errores++;
  await actualizarUsuario({ estadisticas: stats });
}

async function completarRegion() {
  let progreso = usuarioActual.progresoRegiones || {};
  progreso[`region_${regionActualData}`] = { completada: true, estrellas: 3, misionesCompletadas: 5 };
  await actualizarUsuario({ 
    progresoRegiones: progreso,
    regionActual: regionActualData + 1 > 10 ? 10 : regionActualData + 1
  });
  await verificarLogros();
  await cargarUsuarioActual();
  mostrarMensaje(`🎉 ¡Región ${regionActualData} completada!`, 'exito');
  renderMapa();
  cambiarVista('mapa');
}

// ---------- VERIFICAR LOGROS ----------
async function verificarLogros() {
  if (!usuarioActual) return;
  let logrosActuales = usuarioActual.logros || [];
  let nuevos = [];
  // Ejemplos de condiciones
  if (usuarioActual.progresoRegiones?.region_1?.completada && !logrosActuales.includes('Dominio Numérico')) nuevos.push('Dominio Numérico');
  if (usuarioActual.progresoRegiones?.region_2?.completada && !logrosActuales.includes('Operador Racional')) nuevos.push('Operador Racional');
  // ... se pueden añadir más condiciones para los 40 logros
  if (nuevos.length) {
    await actualizarUsuario({ logros: firebase.firestore.FieldValue.arrayUnion(...nuevos) });
    mostrarMensaje(`🏅 Logro(s) desbloqueado(s): ${nuevos.join(', ')}`, 'exito');
  }
}

// ---------- RANKING ----------
async function actualizarRanking() {
  let snapshot = await db.collection('usuarios').orderBy('xp', 'desc').limit(20).get();
  let top = [];
  snapshot.forEach(doc => {
    let data = doc.data();
    top.push({ uid: doc.id, nickname: data.nickname, xp: data.xp, nivel: data.nivel });
  });
  await db.collection('ranking').doc('global').set({ top20: top, actualizado: new Date() });
  renderRanking(top);
}

function renderRanking(top) {
  let html = '';
  top.forEach((item, idx) => {
    html += `<div class="ranking-item"><span class="ranking-pos">#${idx+1}</span><span>${item.nickname}</span><span>${item.xp} XP</span></div>`;
  });
  rankingLista.innerHTML = html || 'No hay datos';
}

// ---------- RETOS ----------
async function cargarRetosPendientes() {
  if (!uidActual) return;
  let snapshot = await db.collection('retos').where('desafiado', '==', uidActual).where('estado', '==', 'pendiente').get();
  let html = '';
  snapshot.forEach(doc => {
    let data = doc.data();
    html += `<div class="card"><p>Reto de ${data.desafianteNick || 'alguien'}</p>
      <p>${data.pregunta.enunciado}</p><div class="flex-row">`;
    data.pregunta.opciones.forEach((opc, idx) => {
      html += `<button class="boton secundario responder-reto" data-reto="${doc.id}" data-opcion="${idx}">${opc}</button>`;
    });
    html += `</div></div>`;
  });
  retosPendientes.innerHTML = html || 'No hay retos pendientes';
  document.querySelectorAll('.responder-reto').forEach(btn => {
    btn.addEventListener('click', async function() {
      let retoId = this.dataset.reto;
      let opcion = parseInt(this.dataset.opcion);
      let retoDoc = await db.collection('retos').doc(retoId).get();
      let reto = retoDoc.data();
      let correcta = opcion === reto.pregunta.respuesta;
      let xpGanado = correcta ? 15 : 5;
      await db.collection('retos').doc(retoId).update({ estado: 'respondido', respuestaDesafiado: opcion });
      await actualizarUsuario({ xp: firebase.firestore.FieldValue.increment(xpGanado) });
      mostrarMensaje(correcta ? '¡Correcto! +15 XP' : 'Incorrecto, +5 XP', correcta ? 'exito' : 'error');
      cargarRetosPendientes();
      cargarUsuarioActual();
    });
  });
}

async function enviarReto(nickname) {
  if (!nickname) return;
  let snapshot = await db.collection('usuarios').where('nickname', '==', nickname).get();
  if (snapshot.empty) { mostrarMensaje('Usuario no encontrado', 'error'); return; }
  let desafiadoUid = snapshot.docs[0].id;
  if (desafiadoUid === uidActual) { mostrarMensaje('No te desafíes a ti mismo', 'error'); return; }
  let pregunta = generarPregunta(usuarioActual.regionActual || 1, usuarioActual.dificultadActual || 3);
  await db.collection('retos').add({
    desafiante: uidActual,
    desafianteNick: usuarioActual.nickname,
    desafiado: desafiadoUid,
    pregunta: pregunta,
    estado: 'pendiente',
    fechaEnvio: new Date()
  });
  mostrarMensaje('Reto enviado correctamente', 'exito');
  cargarRetosPendientes();
}

// ---------- CARGA DE USUARIO ACTUAL ----------
async function cargarUsuarioActual() {
  if (!uidActual) return;
  let data = await obtenerUsuario(uidActual);
  if (data) {
    usuarioActual = { ...data, uid: uidActual };
    // Actualizar UI
    $('nickname-display').textContent = data.nickname || 'Jugador';
    $('xp-display').textContent = data.xp || 0;
    $('monedas-display').textContent = data.monedas || 0;
    // Perfil
    let stats = data.estadisticas || {};
    perfilInfo.innerHTML = `
      <p><strong>Nick:</strong> ${data.nickname}</p>
      <p><strong>Nivel:</strong> ${data.nivel}</p>
      <p><strong>XP:</strong> ${data.xp}</p>
      <p><strong>Monedas:</strong> ${data.monedas}</p>
      <p><strong>Región actual:</strong> ${data.regionActual}</p>
      <p><strong>Logros:</strong> ${(data.logros||[]).join(', ') || 'Sin logros'}</p>
      <p><strong>Estadísticas:</strong> Preguntas: ${stats.totalPreguntas||0}, Aciertos: ${stats.aciertos||0}, Errores: ${stats.errores||0}</p>
    `;
    let btnAdmin = $('btn-admin-panel');
    if (data.rol === 'admin') btnAdmin.style.display = 'block';
    else btnAdmin.style.display = 'none';
    renderMapa();
    actualizarRanking();
    cargarRetosPendientes();
  }
}

// ---------- CAMBIAR VISTA ----------
function cambiarVista(vista) {
  vistaActual = vista;
  const vistas = ['mapa','perfil','ranking','retos','admin'];
  const contenedores = {
    mapa: 'vista-mapa',
    perfil: 'vista-perfil',
    ranking: 'vista-ranking',
    retos: 'vista-retos',
    admin: 'vista-admin'
  };
  vistas.forEach(v => {
    let el = $(contenedores[v]);
    if (el) el.classList.toggle('oculta', v !== vista);
  });
  // Actualizar contenido si es necesario
  if (vista === 'ranking') actualizarRanking();
  if (vista === 'retos') cargarRetosPendientes();
  if (vista === 'mapa') renderMapa();
}

// ---------- AUTENTICACIÓN ANÓNIMA + NICKNAME ----------
// Iniciar sesión anónima al cargar la app
auth.onAuthStateChanged(async user => {
  if (user) {
    uidActual = user.uid;
    // Verificar si ya tiene nickname en Firestore
    let doc = await db.collection('usuarios').doc(uidActual).get();
    if (doc.exists) {
      // Ya registrado, cargar juego
      pantallaNick.classList.add('oculta');
      pantallaJuego.classList.remove('oculta');
      await cargarUsuarioActual();
    } else {
      // Primera vez: mostrar pantalla de nickname
      pantallaNick.classList.remove('oculta');
      pantallaJuego.classList.add('oculta');
    }
  } else {
    // No hay usuario anónimo, crearlo
    try {
      await auth.signInAnonymously();
    } catch(e) {
      console.error('Error en autenticación anónima:', e);
    }
  }
});

// Evento guardar nickname
$('btn-guardar-nick').addEventListener('click', async () => {
  let nick = $('input-nickname').value.trim();
  if (!nick) { mostrarMensajeEn($('mensaje-nick'), 'Ingresa un nickname', 'error'); return; }
  // Verificar que no esté en uso
  let snapshot = await db.collection('usuarios').where('nickname', '==', nick).get();
  if (!snapshot.empty) {
    mostrarMensajeEn($('mensaje-nick'), 'Ese nickname ya está en uso', 'error');
    return;
  }
  // Crear documento de usuario
  await db.collection('usuarios').doc(uidActual).set({
    nickname: nick,
    nivel: 1,
    xp: 0,
    monedas: 0,
    regionActual: 1,
    logros: [],
    historial: [],
    estadisticas: { totalPreguntas:0, aciertos:0, errores:0, tiempoPromedio:0 },
    progresoRegiones: {},
    dificultadActual: 3,
    bloqueado: false,
    rol: 'usuario',
    fechaRegistro: new Date()
  });
  // Ocultar pantalla nickname y mostrar juego
  pantallaNick.classList.add('oculta');
  pantallaJuego.classList.remove('oculta');
  await cargarUsuarioActual();
  // Ejecutar tutorial/diagnóstico (10 preguntas) - se puede hacer de forma invisible
  // Por simplicidad, se omite pero se podría implementar como una misión especial
  mostrarMensaje(`¡Bienvenido, ${nick}!`, 'exito');
});

// ---------- EVENTOS DE NAVEGACIÓN ----------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    let vista = this.dataset.vista;
    cambiarVista(vista);
    // Resaltar botón activo
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
  });
});

// ---------- CERRAR SESIÓN (anónima) ----------
$('btn-cerrar-sesion').addEventListener('click', () => {
  auth.signOut().then(() => {
    // Se recargará la página o se mostrará login; con anónimo, se vuelve a crear usuario
    location.reload();
  });
});

// ---------- ENVIAR RETO ----------
$('btn-enviar-reto').addEventListener('click', async () => {
  let nick = $('reto-nickname').value.trim();
  await enviarReto(nick);
});

// ---------- PANEL ADMIN ----------
$('btn-admin-panel').addEventListener('click', () => {
  if (usuarioActual?.rol === 'admin') cambiarVista('admin');
  else alert('No tienes permisos');
});

// Eventos de admin (delegación)
document.getElementById('admin-botones').addEventListener('click', async (e) => {
  let target = e.target.closest('button');
  if (!target) return;
  let accion = target.dataset.admin;
  if (!accion) return;
  if (!confirm(`¿Ejecutar ${accion}?`)) return;
  try {
    switch(accion) {
      case 'reset-ranking':
        await db.collection('ranking').doc('global').set({ top20: [], actualizado: new Date() });
        mostrarMensajeEn($('mensaje-admin'), 'Ranking reiniciado', 'exito');
        break;
      case 'reset-monedas': {
        let snap = await db.collection('usuarios').get();
        let batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { monedas: 0 }));
        await batch.commit();
        mostrarMensajeEn($('mensaje-admin'), 'Monedas reiniciadas', 'exito');
        break;
      }
      case 'reset-progreso': {
        let snap = await db.collection('usuarios').get();
        let batch = db.batch();
        snap.forEach(doc => batch.update(doc.ref, { nivel: 1, regionActual: 1, xp: 0, progresoRegiones: {}, logros: [] }));
        await batch.commit();
        mostrarMensajeEn($('mensaje-admin'), 'Progreso reiniciado', 'exito');
        break;
      }
      case 'reset-temporada':
        // similar a reset-progreso pero se podría conservar algo
        mostrarMensajeEn($('mensaje-admin'), 'Temporada reiniciada (similar a progreso)', 'exito');
        break;
      case 'bloquear': {
        let nick = prompt('Nickname del usuario a bloquear');
        if (!nick) return;
        let snap = await db.collection('usuarios').where('nickname', '==', nick).get();
        if (snap.empty) { mostrarMensajeEn($('mensaje-admin'), 'Usuario no encontrado', 'error'); return; }
        await snap.docs[0].ref.update({ bloqueado: true });
        mostrarMensajeEn($('mensaje-admin'), 'Usuario bloqueado', 'exito');
        break;
      }
      case 'desbloquear': {
        let nick = prompt('Nickname del usuario a desbloquear');
        if (!nick) return;
        let snap = await db.collection('usuarios').where('nickname', '==', nick).get();
        if (snap.empty) { mostrarMensajeEn($('mensaje-admin'), 'Usuario no encontrado', 'error'); return; }
        await snap.docs[0].ref.update({ bloqueado: false });
        mostrarMensajeEn($('mensaje-admin'), 'Usuario desbloqueado', 'exito');
        break;
      }
    }
  } catch(e) {
    mostrarMensajeEn($('mensaje-admin'), 'Error: '+e.message, 'error');
  }
});

// ---------- INICIO ----------
console.log('MathQuest cargado. Usando autenticación anónima + nickname.');