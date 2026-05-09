document.addEventListener('DOMContentLoaded', function () {

  var form         = document.getElementById('form-actividad');
  var inputArchivo = document.getElementById('archivos');
  var listaArchivos = document.getElementById('lista-archivos');

  /* Mostrar nombres de archivos seleccionados */
  inputArchivo.addEventListener('change', function () {
    listaArchivos.innerHTML = '';
    Array.from(this.files).forEach(function (f) {
      var li = document.createElement('li');
      li.textContent = f.name;
      listaArchivos.appendChild(li);
    });
    limpiarError('archivos');
  });

  /* Limpiar errores al interactuar */
  ['miembro-email','nombre-actividad','tipo','dia','hora-inicio','duracion'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { limpiarError(id); });
    if (el) el.addEventListener('input',  function () { limpiarError(id); });
  });

  var _RE_HORA = /^\d{2}:\d{2}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valido = true;

    var msgEl = document.getElementById('mensaje-actividad');
    msgEl.className = 'mensaje-formulario';
    msgEl.textContent = '';

    var email = document.getElementById('miembro-email').value;
    if (estaVacio(email)) {
      mostrarError('miembro-email', 'Ingrese su correo electrónico.');
      valido = false;
    } else if (!esEmailValido(email)) {
      mostrarError('miembro-email', 'Ingrese un correo electrónico válido.');
      valido = false;
    } else {
      limpiarError('miembro-email');
    }

    var nombre = document.getElementById('nombre-actividad').value;
    if (estaVacio(nombre)) {
      mostrarError('nombre-actividad', 'El nombre es obligatorio.');
      valido = false;
    } else if (nombre.trim().length < 3) {
      mostrarError('nombre-actividad', 'El nombre debe tener al menos 3 caracteres.');
      valido = false;
    } else if (nombre.trim().length > 45) {
      mostrarError('nombre-actividad', 'El nombre no puede superar 45 caracteres.');
      valido = false;
    } else {
      limpiarError('nombre-actividad');
    }

    var tipo = document.getElementById('tipo').value;
    if (!tipo) {
      mostrarError('tipo', 'Debe seleccionar un tipo de actividad.');
      valido = false;
    } else {
      limpiarError('tipo');
    }

    var dia = document.getElementById('dia').value;
    if (!dia) {
      mostrarError('dia', 'Debe seleccionar un día.');
      valido = false;
    } else {
      limpiarError('dia');
    }

    var horaInicio = document.getElementById('hora-inicio').value;
    if (estaVacio(horaInicio) || !_RE_HORA.test(horaInicio)) {
      mostrarError('hora-inicio', 'Ingrese una hora de inicio válida.');
      valido = false;
    } else {
      limpiarError('hora-inicio');
    }

    var duracion = document.getElementById('duracion').value;
    if (estaVacio(duracion) || !_RE_HORA.test(duracion)) {
      mostrarError('duracion', 'Ingrese una duración válida (HH:MM).');
      valido = false;
    } else {
      limpiarError('duracion');
    }

    var tiposValidos = ['image/jpeg','image/png','image/gif','image/webp',
                        'video/mp4','video/webm','video/ogg','video/quicktime'];
    var archOk = Array.from(inputArchivo.files).filter(function (f) {
      return tiposValidos.indexOf(f.type) !== -1;
    });
    if (archOk.length === 0) {
      mostrarError('archivos', 'Debe adjuntar al menos una foto o video válido.');
      valido = false;
    } else {
      limpiarError('archivos');
    }

    if (valido) {
      form.submit();
    } else {
      msgEl.textContent = 'Por favor, corrija los errores indicados antes de continuar.';
      msgEl.className = 'mensaje-formulario error-general';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

});
