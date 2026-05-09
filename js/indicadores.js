var datosPorTipo = [
  { etiqueta: 'Est. Pregrado',    valor: 7,  color: '#2980b9' },
  { etiqueta: 'Est. Postgrado',   valor: 4,  color: '#27ae60' },
  { etiqueta: 'Funcionario/a',    valor: 3,  color: '#e67e22' },
  { etiqueta: 'Académico/a',      valor: 4,  color: '#8e44ad' }
];

var datosPorCategoria = [
  { etiqueta: 'Artísticas',    valor: 8,  color: '#e74c3c' },
  { etiqueta: 'Deportivas',    valor: 12, color: '#2980b9' },
  { etiqueta: 'Tecnológicas',  valor: 6,  color: '#16a085' },
  { etiqueta: 'Sociales',      valor: 5,  color: '#f39c12' },
  { etiqueta: 'Recreativas',   valor: 9,  color: '#8e44ad' }
];

function dibujarBarras(canvasId, datos) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var ancho = canvas.width;
  var alto = canvas.height;
  var margenIzq = 45;
  var margenDer = 20;
  var margenSup = 20;
  var margenInf = 60;

  var maxValor = 0;
  datos.forEach(function (d) {
    if (d.valor > maxValor) maxValor = d.valor;
  });
  maxValor = Math.ceil(maxValor * 1.15);

  var anchoGrafico = ancho - margenIzq - margenDer;
  var altoGrafico = alto - margenSup - margenInf;

  ctx.clearRect(0, 0, ancho, alto);

  /* Líneas de referencia */
  ctx.strokeStyle = '#ecf0f1';
  ctx.lineWidth = 1;
  var lineas = 4;
  for (var i = 0; i <= lineas; i++) {
    var y = margenSup + altoGrafico - (i / lineas) * altoGrafico;
    ctx.beginPath();
    ctx.moveTo(margenIzq, y);
    ctx.lineTo(ancho - margenDer, y);
    ctx.stroke();

    var val = Math.round((i / lineas) * maxValor);
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, margenIzq - 6, y + 4);
  }

  /* Barras */
  var separacion = anchoGrafico / datos.length;
  var anchoBarra = separacion * 0.55;

  datos.forEach(function (d, i) {
    var altoBarra = (d.valor / maxValor) * altoGrafico;
    var x = margenIzq + i * separacion + (separacion - anchoBarra) / 2;
    var y = margenSup + altoGrafico - altoBarra;

    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.roundRect(x, y, anchoBarra, altoBarra, 3);
    ctx.fill();

    /* Valor encima */
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 12px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.valor, x + anchoBarra / 2, y - 5);

    /* Etiqueta debajo */
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '11px Segoe UI, sans-serif';
    var palabras = d.etiqueta.split(' ');
    if (palabras.length > 1) {
      ctx.fillText(palabras[0], x + anchoBarra / 2, margenSup + altoGrafico + 16);
      ctx.fillText(palabras.slice(1).join(' '), x + anchoBarra / 2, margenSup + altoGrafico + 30);
    } else {
      ctx.fillText(d.etiqueta, x + anchoBarra / 2, margenSup + altoGrafico + 16);
    }
  });
}

/* Polyfill para roundRect en navegadores sin soporte */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
  };
}

document.addEventListener('DOMContentLoaded', function () {
  dibujarBarras('grafico-tipos', datosPorTipo);
  dibujarBarras('grafico-categorias', datosPorCategoria);
});
