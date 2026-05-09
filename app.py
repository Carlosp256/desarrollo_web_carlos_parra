import os
import re
import uuid
from datetime import datetime

from flask import Flask, render_template, request, redirect, url_for, flash, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

app = Flask(__name__, template_folder='templates')
app.secret_key = 'clave-tarea2-cc5002'
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2?charset=utf8mb4'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

db = SQLAlchemy(app)

# ── Modelos ───────────────────────────────────────────────────────────────────

class Region(db.Model):
    __tablename__ = 'region'
    id      = db.Column(db.Integer, primary_key=True)
    nombre  = db.Column(db.String(200), nullable=False)
    comunas = db.relationship('Comuna', backref='region', lazy=True)


class Comuna(db.Model):
    __tablename__ = 'comuna'
    id        = db.Column(db.Integer, primary_key=True)
    nombre    = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)


class Miembro(db.Model):
    __tablename__ = 'miembro'
    id             = db.Column(db.Integer, primary_key=True)
    nombre         = db.Column(db.String(255), nullable=False)
    email          = db.Column(db.String(80),  nullable=False, unique=True)
    telefono       = db.Column(db.String(15),  nullable=False)
    fecha_registro = db.Column(db.DateTime,    nullable=False, default=datetime.now)
    comuna_id      = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)

    comuna      = db.relationship('Comuna', lazy=True)
    actividades = db.relationship('Actividad', backref='miembro', lazy=True)


class Actividad(db.Model):
    __tablename__ = 'actividad'
    id          = db.Column(db.Integer, primary_key=True)
    miembro_id  = db.Column(db.Integer, db.ForeignKey('miembro.id'), nullable=False)
    dia         = db.Column(
        db.Enum('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'),
        nullable=False
    )
    hora_inicio = db.Column(db.String(5),  nullable=False)
    duracion    = db.Column(db.String(5),  nullable=False)
    tipo        = db.Column(
        db.Enum('arte', 'deporte', 'tecnología', 'social', 'recreación', 'otra'),
        nullable=False
    )
    nombre      = db.Column(db.String(45), nullable=False)
    descripcion = db.Column(db.Text,       nullable=True)

    fotos = db.relationship('Foto', backref='actividad', lazy=True)


class Foto(db.Model):
    __tablename__ = 'foto'
    id             = db.Column(db.Integer, primary_key=True)
    ruta_archivo   = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    actividad_id   = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)

# ── Helpers ───────────────────────────────────────────────────────────────────

_RE_EMAIL      = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')
_RE_HORA       = re.compile(r'^\d{2}:\d{2}$')
_TIPOS_ARCHIVO = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
}
_TIPOS_ACTIVIDAD = {'arte', 'deporte', 'tecnología', 'social', 'recreación', 'otra'}
_DIAS_VALIDOS    = {'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'}


def vacio(v):
    return not v or not v.strip()


def guardar_archivo(f):
    ext   = os.path.splitext(secure_filename(f.filename))[1].lower()
    fname = str(uuid.uuid4()) + ext
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    f.save(os.path.join(app.config['UPLOAD_FOLDER'], fname))
    return fname

# ── Archivos estáticos ────────────────────────────────────────────────────────

@app.route('/css/<path:fname>')
def css_files(fname):
    return send_from_directory('css', fname)

@app.route('/js/<path:fname>')
def js_files(fname):
    return send_from_directory('js', fname)

@app.route('/uploads/<path:fname>')
def uploads(fname):
    return send_from_directory(app.config['UPLOAD_FOLDER'], fname)

# ── Portada ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    ultimos = Miembro.query.order_by(Miembro.fecha_registro.desc()).limit(5).all()
    return render_template('index.html', ultimos=ultimos)

# ── Registro de miembro ───────────────────────────────────────────────────────

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    errores = {}
    datos   = {}
    regiones = Region.query.order_by(Region.nombre).all()
    comunas  = Comuna.query.order_by(Comuna.nombre).all()

    if request.method == 'POST':
        f        = request.form
        datos    = f.to_dict()
        nombre   = f.get('nombre',   '').strip()
        email    = f.get('email',    '').strip()
        telefono = f.get('telefono', '').strip()
        cid_str  = f.get('comuna_id','').strip()

        if vacio(nombre) or len(nombre) < 2:
            errores['nombre'] = 'El nombre es obligatorio (mínimo 2 caracteres).'
        if vacio(email):
            errores['email'] = 'El correo electrónico es obligatorio.'
        elif not _RE_EMAIL.match(email):
            errores['email'] = 'Ingrese un correo electrónico válido.'
        elif Miembro.query.filter_by(email=email).first():
            errores['email'] = 'Ya existe un miembro registrado con ese correo.'
        if vacio(telefono):
            errores['telefono'] = 'El teléfono es obligatorio.'
        elif not re.match(r'^\+?[\d\s\-]{7,15}$', telefono):
            errores['telefono'] = 'Ingrese un teléfono válido (ej: +56 9 1234 5678).'

        comuna_id = None
        if vacio(cid_str):
            errores['comuna_id'] = 'Debe seleccionar una comuna.'
        else:
            try:
                comuna_id = int(cid_str)
                if not db.session.get(Comuna, comuna_id):
                    errores['comuna_id'] = 'Comuna inválida.'
            except ValueError:
                errores['comuna_id'] = 'Comuna inválida.'

        if not errores:
            m = Miembro()
            m.nombre         = nombre
            m.email          = email
            m.telefono       = telefono
            m.fecha_registro = datetime.now()
            m.comuna_id      = comuna_id
            db.session.add(m)
            db.session.commit()
            flash('Miembro registrado exitosamente.', 'exito')
            return redirect(url_for('index'))

    return render_template('registro.html', errores=errores, datos=datos,
                           regiones=regiones, comunas=comunas)

# ── Registro de actividad ─────────────────────────────────────────────────────

@app.route('/actividad', methods=['GET', 'POST'])
def actividad():
    errores = {}
    datos   = {}

    if request.method == 'POST':
        f           = request.form
        datos       = f.to_dict()
        email_m     = f.get('miembro-email',    '').strip()
        nombre_a    = f.get('nombre-actividad', '').strip()
        tipo        = f.get('tipo',             '').strip()
        descripcion = f.get('descripcion',      '').strip()
        dia         = f.get('dia',              '').strip()
        hora_inicio = f.get('hora-inicio',      '').strip()
        duracion    = f.get('duracion',         '').strip()
        archivos    = request.files.getlist('archivos')

        miembro = None
        if vacio(email_m):
            errores['miembro-email'] = 'Ingrese su correo electrónico.'
        else:
            miembro = Miembro.query.filter_by(email=email_m).first()
            if not miembro:
                errores['miembro-email'] = 'No se encontró ningún miembro con ese correo.'

        if vacio(nombre_a) or len(nombre_a) < 3:
            errores['nombre-actividad'] = 'El nombre es obligatorio (mínimo 3 caracteres).'
        elif len(nombre_a) > 45:
            errores['nombre-actividad'] = 'El nombre no puede superar 45 caracteres.'
        if tipo not in _TIPOS_ACTIVIDAD:
            errores['tipo'] = 'Debe seleccionar un tipo válido.'
        if dia not in _DIAS_VALIDOS:
            errores['dia'] = 'Debe seleccionar un día válido.'
        if vacio(hora_inicio) or not _RE_HORA.match(hora_inicio):
            errores['hora-inicio'] = 'Ingrese una hora válida (HH:MM).'
        if vacio(duracion) or not _RE_HORA.match(duracion):
            errores['duracion'] = 'Ingrese una duración válida (HH:MM, ej: 01:30).'

        arch_ok = [a for a in archivos if a.filename and a.mimetype in _TIPOS_ARCHIVO]
        if not arch_ok:
            errores['archivos'] = 'Debe adjuntar al menos una foto o video válido.'

        if not errores and miembro:
            act = Actividad()
            act.miembro_id  = miembro.id
            act.nombre      = nombre_a
            act.tipo        = tipo
            act.descripcion = descripcion or None
            act.dia         = dia
            act.hora_inicio = hora_inicio
            act.duracion    = duracion
            db.session.add(act)
            db.session.flush()

            for arch in arch_ok:
                fname = guardar_archivo(arch)
                foto = Foto()
                foto.actividad_id  = act.id
                foto.ruta_archivo  = fname
                foto.nombre_archivo = arch.filename
                db.session.add(foto)
            db.session.commit()
            flash('Actividad registrada exitosamente.', 'exito')
            return redirect(url_for('index'))

    return render_template('actividad.html', errores=errores, datos=datos)

# ── Listado de miembros ───────────────────────────────────────────────────────

POR_PAGINA = 5


def _query_miembros():
    busq        = request.args.get('busqueda', '')
    orden       = request.args.get('orden', 'nombre-asc')
    region_id   = request.args.get('region_id', '', type=str)
    actividades = request.args.get('actividades', '')

    q = Miembro.query
    if busq:
        p = f'%{busq}%'
        q = q.filter(db.or_(
            Miembro.nombre.ilike(p),
            Miembro.email.ilike(p)
        ))
    if region_id:
        q = q.join(Miembro.comuna).filter(Comuna.region_id == int(region_id))
    if actividades == 'con':
        q = q.filter(Miembro.actividades.any())
    elif actividades == 'sin':
        q = q.filter(~Miembro.actividades.any())

    col_map = {
        'nombre-asc':  Miembro.nombre.asc(),
        'nombre-desc': Miembro.nombre.desc(),
        'email-asc':   Miembro.email.asc(),
        'fecha-desc':  Miembro.fecha_registro.desc(),
    }
    q = q.order_by(col_map.get(orden, Miembro.nombre.asc()))
    return q, busq, orden, region_id, actividades


@app.route('/miembros')
def miembros():
    regiones = Region.query.order_by(Region.nombre).all()
    q, busq, orden, region_id, actividades = _query_miembros()
    pagina = request.args.get('pagina', 1, type=int)
    pag    = q.paginate(page=pagina, per_page=POR_PAGINA, error_out=False)
    return render_template('miembros.html', pag=pag, sel=None,
                           busqueda=busq, orden=orden,
                           region_id=region_id, actividades=actividades,
                           regiones=regiones)


@app.route('/miembros/<int:mid>')
def detalle_miembro(mid):
    sel = db.session.get(Miembro, mid)
    if not sel:
        abort(404)
    regiones = Region.query.order_by(Region.nombre).all()
    q, busq, orden, region_id, actividades = _query_miembros()
    pagina = request.args.get('pagina', 1, type=int)
    pag    = q.paginate(page=pagina, per_page=POR_PAGINA, error_out=False)
    return render_template('miembros.html', pag=pag, sel=sel,
                           busqueda=busq, orden=orden,
                           region_id=region_id, actividades=actividades,
                           regiones=regiones)


@app.route('/estadisticas')
def estadisticas():
    return render_template('indicadores.html')


if __name__ == '__main__':
    app.run(debug=True)
