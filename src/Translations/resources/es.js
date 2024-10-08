export default {
  login: {
    welcome: 'Bienvenido!',
    login: 'Logeate para continuar',
    forgot: 'He olvidado mi contraseña',
    reset_fail: 'Por favor, introduzca un correo electrónico correcto',
    fail: 'El email o la contraseña son incorrectos',
    cta: 'Login'
  },
  tabs: {
    dashboard: 'Home',
    checks: 'Checks',
    jobs: 'Trabajos',
    incidences: 'Incidencias',
    users: 'Usuarios',
    houses: 'Casas',
    profile: 'Perfil'
  },
  common: {
    apply: 'Aplicar',
    hey: 'Hola!',
    create: 'Crear',
    all: 'Todos',
    neither: 'Ninguno',
    observations: 'Observaciones',
    no_assigned: 'Sin asignar',
    resolved: 'Resuelta',
    no_resolved: 'Sin resolver',
    date: 'Fecha',
    admins: 'Administradores',
    jobs: 'Trabajos',
    owner: 'Propietario',
    owners: 'Propietarios',
    worker: 'Trabajador',
    workers: 'Trabajadores',
    house: 'Casa',
    houses: 'Casas',
    state: 'Estado',
    clean: 'Limpiar',
    save: 'Guardar',
    edit: 'Editar',
    search_name: 'Busca por nombre...',
    informer: 'Informador',
    asigned_to: 'Asignado a',
    asigned_workers: 'Trabajadores asignados',
    range_time: {
      today: 'Hoy',
      next: 'En {{numberOfDays}} días',
      week: 'Esta semana',
      more_week: 'Más de una semana'
    },
    filters: {
      title: 'Filtros',
      range_time: 'Rango de tiempo',
      state: {
        resolved: 'Resueltas',
        no_resolved: 'Sin resolver'
      },
      checklistState: {
        resolved: 'Terminadas',
        no_resolved: 'Sin terminar'
      },
      time: {
        day: 'Hoy',
        week: 'Esta semana',
        month: 'Este mes',
        year: 'Este año',
        all: 'Todo'
      }
    }
  },
  welcome: 'Hoy es {{date}}',
  homeMessage: 'Estas son tus tareas asignadas para hoy 💪🏡',
  check: {
    done: 'Finalizar y enviar al propietario',
    photos: 'Fotos'
  },
  new_checklist: {
    title: 'Nuevo checklist',
    check_list: 'Lista de checks'
  },
  checklists: {
    title: 'Checklists',
    empty: 'No se ha encontrado ningún checklist activo',
    no_found: 'No se ha encontrado ningún checklist',
    comments: 'Comentarios',
    owner_text_1:
      'Nuestro equipo esta trabajando para tener su casa siempre perfecta! 🚀🚀',
    owner_text_2:
      'A continuación una lista de los trabajos que se están realizando en su casa',
    checkPage: {
      done: 'Terminado',
      workers: 'Working in your hosue',
      jobs: 'Trabajos'
    }
  },
  incidence: {
    title: 'Incidencia',
    resolved: 'Abrir incidencia',
    no_resolved: 'Resolver incidencia',
    status: {
      title: 'Estado de la incidencia',
      ini: 'Iniciada',
      process: 'En proceso',
      done: 'Finalizada'
    }
  },
  incidences: {
    title: 'Incidencias',
    empty: 'No se han encontrado incidencias activas en este momento',
    no_found: 'No se han encontrado incidencias'
  },
  newJob: {
    title: 'Nuevo trabajo',
    desc_title: 'Nuevo trabajo de {{job}}'
  },
  job: {
    title: 'Trabajo',
    finished: 'Terminada',
    not_finished: 'Sin terminar',
    done: 'Abrir',
    no_done: 'Finalizar',
    empty: 'No hay trabajos activos en estos momentos'
  },
  jobs: {
    title: 'Trabajos',
    no_found: 'No se han encontrado trabajos'
  },
  newIncidence: {
    title: 'Nueva Incidencia',
    subtitle: 'Info',
    form: {
      title: 'Título',
      incidence: 'Descripción',
      photos: 'Fotos',
      create: 'Crear incidencia'
    }
  },
  newUser: {
    title: 'Nuevo usuario',
    edit: 'Editar usuario',
    form: {
      name: 'Nombre',
      surname: 'Apellido',
      email: 'Email',
      phone: 'Teléfono',
      role: 'Rol usuario',
      gender: 'Género',
      create: 'Crear usuario',
      language: 'Idioma'
    }
  },
  users: {
    title: 'Usuarios'
  },
  houses: {
    title: 'Casas',
    house_data: 'Datos de la propiedad',
    house_address: 'Dirección',
    house_name: 'Nombre',
    house_municipality: 'Municipio',
    house_street: 'Calle',
    owner_name: 'Nombre del propietario',
    owner_phone: 'Teléfono'
  },
  photos: {
    title: 'Fotos'
  },
  profile: {
    edit: 'Editar',
    personal_data: 'Datos personales',
    title: 'Perfil',
    phone: 'Teléfono',
    email: 'Email',
    logout: 'Desconectarse',
    name: 'Nombre',
    last_name: 'Apellido',
    gender: 'Género',
    role: 'Rol',
    language: 'Idioma'
  },
  options: {
    title: 'Opciones',
    edit: 'Editar',
    duplicate: 'Duplicar',
    restorePassword: 'Restaurar contraseña',
    delete: 'Borrar',
    removing: 'Eliminando...'
  },
  alerts: {
    attention: 'Atención',
    cancel: 'Cancelar',
    accept: 'Aceptar',
    incidence: {
      resolve: '¿Seguro que quieres resolver la incidencia?',
      remove: '¿Seguro que quieres eliminar la incidencia?',
      open: '¿Seguro que quieres volver a abrir la incidencia?'
    },
    job: {
      finish:
        '¿Seguro que quieres finalizar el trabajo? Haz una foto a la casa para que se guarde tu hora de salida',
      open: '¿Seguro que quieres abrir el trabajo?'
    },
    checklist: {
      remove: '¿Seguro que quieres eliminar este checklist?',
      finish:
        '¿Seguro que quieres finalizar y enviar el informe al propietario?'
    }
  },
  chat: {
    view_incidence: 'Ver incidencia',
    view_checklist: 'Ver checklist'
  }
};
