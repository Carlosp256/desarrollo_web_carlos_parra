# CC5002 Desarrollo Web

## Decisiones de implementación

- Se usa Flask con SQLAlchemy para la interacción con MySQL/MariaDB.
- El modelo de datos sigue el esquema provisto en `tarea2.sql` (miembro, actividad, foto, region, comuna).
- El formulario de registro de miembro incluye selección de región y comuna (cargadas desde la BD via `region-comuna.sql`). Al seleccionar una región, el selector de comunas se filtra dinámicamente con JavaScript sin recargar la página.
- El formulario de registro de actividad permite adjuntar múltiples fotos/videos en un mismo envío, generando una inserción en `actividad` y una o más inserciones en `foto`.
- Los archivos subidos se guardan en `uploads/` con nombre UUID para evitar colisiones. La carpeta está excluida del repositorio via `.gitignore`.
- La validación se realiza tanto en el cliente (JavaScript, sin atributo `required`) como en el servidor (Flask). Protección contra entradas maliciosas: SQLAlchemy previene SQL injection mediante queries parametrizadas y Jinja2 escapa automáticamente el HTML para prevenir XSS.
- El listado de miembros es paginado (5 por página) y ofrece tres filtros combinables: búsqueda por nombre o correo, filtro por región (usando el join Miembro → Comuna → Región) y filtro por presencia de actividades (con/sin). Los filtros se preservan al navegar entre páginas y al abrir el detalle de un miembro.
- Las rutas `/css/`, `/js/` y `/uploads/` son servidas directamente por Flask.
- El enunciado menciona "Registrar miembro y actividades" como una sola opción del menú. Se implementó como dos páginas separadas (`/registro` y `/actividad`) para mayor claridad y usabilidad, ambas accesibles desde el menú de navegación.

## Decisiones de diseño y estilo

- El diseño usa únicamente HTML5, CSS3 y JavaScript vanilla, sin frameworks externos (sin Bootstrap, sin jQuery).
- Se usan variables CSS (`--color-primario`, `--color-secundario`, etc.) para mantener una paleta de colores coherente en todo el sitio.
- El layout es responsivo: los formularios y tablas se adaptan a distintos tamaños de pantalla usando CSS Grid y Flexbox.
- Los formularios usan `novalidate` para deshabilitar la validación nativa del browser y controlar completamente los mensajes de error con JavaScript.
- Los mensajes de error aparecen inline debajo de cada campo, con clase `visible` activada por JS. Si hay error de servidor (POST fallido), el formulario se repopula con los datos ingresados y los errores correspondientes.
- El listado de miembros usa filas clickeables (`cursor: pointer`) que navegan al detalle del miembro sin botones adicionales, manteniendo el contexto de búsqueda y paginación en la URL.
- La paleta de colores usa azul oscuro (`#2c3e50`) como color primario y azul medio (`#2980b9`) como secundario, con fondo gris claro para contraste y legibilidad.
- La tipografía usa `system-ui` para asegurar consistencia visual entre navegadores sin cargar fuentes externas.
- Los archivos CSS y JS están organizados en carpetas separadas (`css/`, `js/`) y servidos por Flask mediante rutas explícitas.
