/* Utilidades de validación compartidas entre formularios */

function mostrarError(campoId, mensaje) {
  var inputEl = document.getElementById(campoId);
  var errorEl = document.getElementById('error-' + campoId);
  if (inputEl) inputEl.classList.add('campo-invalido');
  if (errorEl) {
    errorEl.textContent = mensaje;
    errorEl.classList.add('visible');
  }
}

function limpiarError(campoId) {
  var inputEl = document.getElementById(campoId);
  var errorEl = document.getElementById('error-' + campoId);
  if (inputEl) inputEl.classList.remove('campo-invalido');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

function estaVacio(valor) {
  return !valor || valor.trim() === '';
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
