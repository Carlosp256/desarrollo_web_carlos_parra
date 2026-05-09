# CC5002 Desarrollo Web — Tarea 2

## Decisiones relevantes para la corrección

- El selector de comunas se filtra dinámicamente por región con JavaScript, sin recargar la página.
- Los archivos subidos se nombran con UUID para evitar colisiones y se sirven desde `/uploads/` via Flask.
- El listado permite filtrar por región (join Miembro → Comuna → Región), por presencia de actividades (con/sin) y buscar por nombre o correo. Los filtros se preservan al paginar y al abrir el detalle.
- Las validaciones JS usan `novalidate` en el form (sin atributo `required`). Si el servidor detecta errores, el formulario se repopula con los datos y mensajes correspondientes.
- El menú tiene entradas separadas para registro de miembro y de actividad, en lugar de una sola entrada, por claridad.
- Importar `region-comuna.sql` con `--default-character-set=utf8` para evitar problemas de encoding con tildes y eñes.