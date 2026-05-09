document.addEventListener('DOMContentLoaded', function () {

  var form      = document.getElementById('form-registro');
  var selRegion = document.getElementById('region_id');
  var selComuna = document.getElementById('comuna_id');

  /* Filtrar comunas según región seleccionada */
  function filtrarComunas() {
    var rid = selRegion.value;
    var opts = selComuna.querySelectorAll('option');
    var primero = true;
    opts.forEach(function (opt) {
      if (!opt.value) return;
      var mostrar = !rid || opt.dataset.region === rid;
      opt.style.display = mostrar ? '' : 'none';
      if (mostrar && primero) {
        if (selComuna.value === '' || opt.dataset.region !== rid) {
          /* no resetear si ya hay una comuna válida seleccionada */
        }
        primero = false;
      }
    });
    /* Si la comuna seleccionada no pertenece a la región, limpiar */
    var selected = selComuna.querySelector('option[value="' + selComuna.value + '"]');
    if (selected && selected.dataset.region && selected.dataset.region !== rid) {
      selComuna.value = '';
    }
  }

  selRegion.addEventListener('change', filtrarComunas);
  filtrarComunas();

  /* Limpiar error al cambiar */
  ['nombre','email','telefono'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { limpiarError(id); });
  });
  selRegion.addEventListener('change', function () { limpiarError('region_id'); });
  selComuna.addEventListener('change', function () { limpiarError('comuna_id'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valido = true;

    var msgEl = document.getElementById('mensaje-registro');
    msgEl.className = 'mensaje-formulario';
    msgEl.textContent = '';

    var nombre = document.getElementById('nombre').value;
    if (estaVacio(nombre)) {
      mostrarError('nombre', 'El nombre es obligatorio.');
      valido = false;
    } else if (nombre.trim().length < 2) {
      mostrarError('nombre', 'El nombre debe tener al menos 2 caracteres.');
      valido = false;
    } else {
      limpiarError('nombre');
    }

    var email = document.getElementById('email').value;
    if (estaVacio(email)) {
      mostrarError('email', 'El correo electrónico es obligatorio.');
      valido = false;
    } else if (!esEmailValido(email)) {
      mostrarError('email', 'Ingrese un correo electrónico válido.');
      valido = false;
    } else {
      limpiarError('email');
    }

    var telefono = document.getElementById('telefono').value;
    if (estaVacio(telefono)) {
      mostrarError('telefono', 'El teléfono es obligatorio.');
      valido = false;
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(telefono.trim())) {
      mostrarError('telefono', 'Ingrese un teléfono válido (ej: +56 9 1234 5678).');
      valido = false;
    } else {
      limpiarError('telefono');
    }

    if (!selRegion.value) {
      mostrarError('region_id', 'Debe seleccionar una región.');
      valido = false;
    } else {
      limpiarError('region_id');
    }

    if (!selComuna.value) {
      mostrarError('comuna_id', 'Debe seleccionar una comuna.');
      valido = false;
    } else {
      limpiarError('comuna_id');
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
