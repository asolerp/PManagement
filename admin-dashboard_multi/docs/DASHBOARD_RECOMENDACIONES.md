# Recomendaciones para el dashboard SaaS (mantenimiento de propiedades)

Enfoque: empresas que gestionan **propiedades** y realizan **mantenimiento, trabajos y revisiones** (checklists, incidencias, control horario).

---

## Debe estar sí o sí en este SaaS

Estas cosas son **imprescindibles** en cualquier SaaS B2B. Si no están, la empresa (o el producto) se resiente.

| Qué | Para qué | Estado actual |
|-----|----------|----------------|
| **Datos de la empresa (perfil de empresa)** | Ver y editar nombre, dirección, CIF, logo. El registro crea `companies` con `name`, `plan`, `maxUsers`, `maxHouses`, pero en el dashboard **no hay pantalla** para verlos ni cambiarlos. | ❌ No existe en el dashboard |
| **Mi cuenta (usuario logueado)** | Cambiar mi contraseña, mi email, mi nombre. Hoy solo hay “Cerrar sesión” y en Usuarios el admin puede editar otros; **falta “Mi cuenta”** para el propio usuario. | ❌ No hay sección “Mi cuenta” |
| **Facturación / Plan / Suscripción** | Saber en qué plan estoy, límites (usuarios, propiedades), renovación, facturas o enlace al portal de pago. Backend tiene `plan`, `maxUsers`, `maxHouses` en `companies`; el dashboard **no los muestra**. | ❌ No hay UI de plan ni facturación |
| **Invitar / dar de alta usuarios** | Añadir otro admin o invitarlos por email. Crear usuario desde el dashboard (createNewUser) existe; **invitar por enlace o email** no está claro ni visible como flujo principal. | ⚠️ Crear usuario sí; “invitar” como flujo no |
| **Ayuda / Soporte** | Enlace a ayuda, documentación o contacto (email, chat). Cualquier producto serio tiene un “¿Ayuda?” o “Contactar” en header o footer. | ❌ No hay enlace de ayuda/soporte |
| **Identidad de la empresa en la UI** | Que el usuario sepa “estoy en la empresa X”. El sidebar no muestra el nombre de la empresa; solo “Port Management SL”. | ❌ No se muestra nombre de la empresa |

Resumen: **sin perfil de empresa, mi cuenta, y algo de plan/facturación**, el SaaS se siente incompleto. **Sin ayuda/soporte**, los usuarios se quedan atascados. Conviene priorizar al menos:

1. **Perfil de empresa** (leer/editar `companies/{companyId}`: nombre, opcionalmente logo, dirección, CIF).
2. **Mi cuenta** (cambiar contraseña y datos del usuario logueado; puede ser un desplegable en el header o una página).
3. **Plan / Límites** (pantalla o bloque en Configuración que muestre plan actual, maxUsers, maxHouses; más adelante enlace a facturación).
4. **Ayuda** (enlace fijo en header o footer a docs/email/chat).

---

## Lo que ya tienes (resumen)

| Sección        | Ruta           | Comentario breve                          |
|----------------|----------------|-------------------------------------------|
| Dashboard      | `/`            | Resumen, jornadas, checklists pendientes   |
| Checklists     | `/checklists`  | Revisiones por propiedad                  |
| Incidencias    | `/incidencias` | Averías/partes                             |
| Casas          | `/casas`       | Propiedades                               |
| Jornadas       | `/jornadas`    | Control horario / turnos                  |
| Trabajadores   | `/trabajadores`| Equipo de campo                           |
| Usuarios       | `/usuarios`    | Admins, propietarios, roles                |
| Papelera       | `/papelera`    | Elementos eliminados                      |
| Configuración  | `/configuracion` | Catálogos (checks, tareas)              |
| **Trabajos**   | (sin enlace)   | **Existe JobsPage pero no está en el menú** |

---

## Cambios recomendados (lo que falta o conviene cambiar)

### 1. Añadir "Trabajos" al menú

- **Trabajos** (work orders) es central para mantenimiento: tareas asignadas a propiedad + trabajador, estado, fechas.
- La página `JobsPage` ya existe; solo falta enlazarla en el sidebar y en las rutas si no está.
- **Sugerencia:** entrada en el menú entre "Incidencias" y "Casas", o junto a "Checklists", con etiqueta "Trabajos".

### 2. Reorganizar y renombrar para claridad

- **"Casas" → "Propiedades"**  
  Encaja mejor con bloques, locales, garajes, etc. y suena más profesional.
- **Agrupar en el menú** (opcional):
  - **Operativo:** Dashboard, Checklists, Incidencias, Trabajos, Jornadas
  - **Organización:** Propiedades, Trabajadores, Usuarios
  - **Sistema:** Configuración, Papelera

Así la empresa ve primero lo del día a día y luego organización y ajustes.

### 3. Secciones que suelen faltar y aportan valor

| Sección              | Para qué sirve |
|----------------------|----------------|
| **Informes / Reportes** | Horas por trabajador/propiedad, incidencias resueltas, checklists completados, exportar (Excel/PDF). Ya tienes lógica en `timeTracking`; se puede exponer en el dashboard. |
| **Calendario**       | Vista por fechas: trabajos, revisiones, visitas. Facilita planificar la semana y no olvidar revisiones. |
| **Propietarios / Clientes** | Si "Usuarios" mezcla admins y propietarios, una pestaña o sección solo "Propietarios" (contactos de las propiedades) mejora la gestión comercial y de comunicación. |
| **Perfil de empresa** | En Configuración: nombre, logo, datos fiscales, configuración por defecto (moneda, idioma). Útil para multi-tenant y facturación. |

### 4. Mejoras en el Dashboard (página principal)

- **KPIs claros en la parte superior:**
  - Incidencias abiertas / resueltas este mes
  - Checklists pendientes de cerrar
  - Horas registradas hoy / esta semana
  - Trabajos en curso o retrasados
- **Acciones rápidas:** "Nueva incidencia", "Nuevo checklist", "Registrar jornada" (si aplica).
- **Listas cortas:** últimos trabajos, próximas revisiones, últimas incidencias, con enlace a cada sección.

Así el admin ve el estado del negocio en 10 segundos.

### 5. Mejoras en secciones existentes

- **Checklists:** filtro por propiedad y por estado (pendiente/en curso/cerrado); indicador de vencimiento (revisión atrasada).
- **Incidencias:** estados claros (abierta, en curso, resuelta, cerrada) y filtros por prioridad/estado.
- **Trabajos:** si existe el concepto de "cuadrantes" o planificación por zonas, una vista o filtro por cuadrante/día ayuda a los encargados.
- **Jornadas:** resumen por trabajador (horas semanales/mensuales) y posible enlace a informes de tiempo.
- **Propiedades (Casas):** tipo de propiedad (vivienda, local, garaje…) si el modelo lo permite; dirección y contacto del propietario visibles en la ficha.

### 6. Papelera y configuración

- **Papelera:** mantenerla como enlace secundario (pie de menú o agrupado en "Sistema") para no saturar el menú principal.
- **Configuración:** además de catálogos, considerar:
  - Perfil de empresa
  - Catálogos (ya están)
  - Preferencias (idioma, zona horaria, formato de fecha)
  - Si hay facturación: datos de facturación o enlace a suscripción

---

## Prioridad sugerida

1. **Inmediato:** Añadir "Trabajos" al menú (y a rutas si falta).
2. **Corto plazo:** Renombrar "Casas" → "Propiedades"; mejorar el Dashboard con KPIs y accesos rápidos.
3. **Medio plazo:** Sección Informes (apoyada en timeTracking); Calendario básico (trabajos + checklists).
4. **Según necesidad:** Propietarios como sección o pestaña; Perfil de empresa en Configuración.

Si quieres, el siguiente paso puede ser solo implementar el punto 1 (enlace a Trabajos en el sidebar y ruta en `App.jsx`) y un esqueleto de "Informes" o "Calendario" para ir creciendo desde ahí.
