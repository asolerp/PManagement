export default {
  login: {
    welcome: 'Bienvenido!',
    login: 'Inicia sesión para continuar',
    forgot: '¿Olvidaste tu contraseña?',
    reset_fail: 'Por favor, introduce un correo electrónico válido',
    fail: 'El email o la contraseña son incorrectos',
    cta: 'Iniciar sesión',
    loading: 'Entrando...',
    email_placeholder: 'Correo electrónico',
    password_placeholder: 'Contraseña'
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
    delete: 'Eliminar',
    cancel: 'Cancelar',
    photo: 'foto',
    photos: 'fotos',
    selected: 'seleccionadas',
    search_name: 'Busca por nombre...',
    informer: 'Informador',
    asigned_to: 'Asignado a',
    asigned_workers: 'Trabajadores asignados',
    today: 'Hoy',
    tomorrow: 'Mañana',
    next_week: 'Próxima semana',
    select: 'Seleccionar',
    select_date: 'Seleccionar fecha',
    select_time: 'Seleccionar hora',
    no_results: 'No se encontraron resultados',
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
    resendEmail: 'Reenviar email al propietario',
    photos: 'Fotos'
  },
  checkPhotos: {
    noPhotos: 'Sin fotos',
    noPhotosDescription: 'Aún no se han añadido fotos a este check',
    deleteTitle: '¿Eliminar fotos?',
    deleteDescriptionSingle: 'Esta foto se eliminará permanentemente.',
    deleteDescriptionMultiple: 'Se eliminarán {{count}} fotos permanentemente.',
    deleteWarning: 'Esta acción no se puede deshacer'
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
    subtitle: 'Reporta un problema o incidencia',
    error: 'Ha ocurrido un error al crear la incidencia. Inténtalo de nuevo.',
    form: {
      title: 'Título',
      title_placeholder: '¿Qué ha pasado?',
      incidence: 'Descripción',
      incidence_placeholder: 'Describe el problema con detalle...',
      photos: 'Fotos',
      photos_description: 'Añade fotos para documentar la incidencia (opcional)',
      create: 'Crear incidencia'
    }
  },
  newUser: {
    title: 'Nuevo usuario',
    subtitle: 'Completa la información para crear un nuevo usuario',
    edit: 'Editar usuario',
    editSubtitle: 'Modifica la información del usuario',
    sections: {
      personal: 'Información personal',
      contact: 'Contacto',
      role: 'Rol y permisos'
    },
    form: {
      name: 'Nombre',
      surname: 'Apellido',
      email: 'Email',
      phone: 'Teléfono',
      role: 'Rol',
      gender: 'Género',
      create: 'Crear usuario',
      edit: 'Guardar cambios',
      language: 'Idioma',
      photoHint: 'Toca para cambiar la foto'
    }
  },
  users: {
    title: 'Usuarios'
  },
  houses: {
    title: 'Casas',
    newHouse: 'Nueva casa',
    createHouse: 'Crear casa',
    basicInfo: 'Información básica',
    houseName: 'Nombre de la casa',
    address: 'Dirección',
    street: 'Calle y número',
    city: 'Municipio',
    postalCode: 'Código postal',
    phone: 'Teléfono',
    addPhoto: 'Añadir foto',
    addPhotoHint: 'Toca para seleccionar una imagen',
    selectOwner: 'Seleccionar propietario',
    house_data: 'Datos de la propiedad',
    house_address: 'Dirección',
    house_name: 'Nombre',
    house_municipality: 'Municipio',
    house_street: 'Calle',
    owner_name: 'Nombre del propietario',
    owner_phone: 'Teléfono'
  },
  photos: {
    title: 'Fotos',
    add_photo: 'Añadir foto',
    add_photo_description: 'Selecciona cómo quieres añadir la foto',
    take_photo: 'Hacer foto',
    take_photo_description: 'Usa la cámara del dispositivo',
    from_gallery: 'Elegir de galería',
    from_gallery_description: 'Selecciona fotos existentes'
  },
  profile: {
    edit: 'Editar',
    personal_data: 'Datos personales',
    personalInfo: 'Información personal',
    contactInfo: 'Información de contacto',
    security: 'Seguridad',
    title: 'Perfil',
    phone: 'Teléfono',
    email: 'Email',
    aditionalEmail: 'Email adicional',
    logout: 'Cerrar sesión',
    name: 'Nombre',
    last_name: 'Apellido',
    gender: 'Género',
    role: 'Rol',
    language: 'Idioma',
    oldPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    changePassword: 'Cambiar contraseña'
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
  },
  validation: {
    required: 'Este campo es obligatorio'
  }
};
