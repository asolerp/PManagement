export default {
  login: {
    welcome: 'Welcome!',
    login: 'Sign in to continue',
    forgot: 'Forgot your password?',
    reset_fail: 'Please enter a valid email address',
    fail: 'Email or password are incorrect',
    cta: 'Sign in',
    loading: 'Signing in...',
    email_placeholder: 'Email address',
    password_placeholder: 'Password'
  },
  tabs: {
    dashboard: 'Home',
    checks: 'Checks',
    jobs: 'Jobs',
    incidences: 'Incidences',
    users: 'Users',
    houses: 'Houses',
    profile: 'Profile'
  },
  common: {
    apply: 'Apply',
    hey: 'Hello!',
    create: 'Create',
    all: 'All',
    neither: 'Neither',
    observations: 'Observations',
    no_assigned: 'Not assigned',
    resolved: 'Resolved',
    no_resolved: 'No resolved',
    date: 'Date',
    jobs: 'Jobs',
    admins: 'Admins',
    owner: 'Owner',
    owners: 'Owners',
    worker: 'Worker',
    workers: 'Workers',
    house: 'House',
    houses: 'Houses',
    state: 'State',
    clean: 'Clean',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    photo: 'photo',
    photos: 'photos',
    selected: 'selected',
    search_name: 'Search by name...',
    informer: 'Informer',
    asigned_to: 'Asigned to',
    asigned_workers: 'Asigned workers',
    today: 'Today',
    tomorrow: 'Tomorrow',
    next_week: 'Next week',
    select: 'Select',
    select_date: 'Select date',
    select_time: 'Select time',
    no_results: 'No results found',
    range_time: {
      today: 'Today',
      next: 'In {{numberOfDays}} days',
      past: '{{numberOfDays}} days ago',
      week: 'This week',
      more_week: 'More than a week'
    },
    filters: {
      title: 'Filters',
      range_time: 'Range of time',
      time: {
        day: 'Today',
        week: 'This week',
        month: 'This month',
        year: 'This year',
        all: 'All'
      },
      state: {
        resolved: 'Resolved',
        no_resolved: 'No resolved'
      },
      checklistState: {
        resolved: 'Finished',
        no_resolved: 'Unfinished'
      }
    }
  },
  welcome: 'Today is {{date}} ☀️',
  homeMessage: 'These are your asigned jobs for today 💪🏡',
  check: {
    done: 'Finish and send to owner',
    resendEmail: 'Resend email to owner',
    photos: 'Photos'
  },
  checkPhotos: {
    noPhotos: 'No photos',
    noPhotosDescription: 'No photos have been added to this check yet',
    deleteTitle: 'Delete photos?',
    deleteDescriptionSingle: 'This photo will be permanently deleted.',
    deleteDescriptionMultiple: '{{count}} photos will be permanently deleted.',
    deleteWarning: 'This action cannot be undone'
  },
  new_checklist: {
    title: 'New checklist',
    check_list: 'List of checks'
  },
  edit_checklist: {
    title: 'Edit checklist'
  },
  checklists: {
    title: 'Checklists',
    empty: 'No active checklist at the moment',
    no_found: 'No checklist found',
    owner_text_1: 'Our team is working to keep your house clean and safe! 🚀🚀',
    owner_text_2: 'Here you will see the update of the jobs made in your house',
    comments: 'Comments',
    checkPage: {
      done: 'Finished!',
      workers: 'Working in your hosue',
      jobs: 'Jobs'
    }
  },
  incidence: {
    title: 'Incidence',
    resolved: 'Open incidence',
    no_resolved: 'Resolve incidence',
    status: {
      title: 'Incidence status',
      ini: 'Initiate',
      process: 'In process',
      done: 'Done'
    }
  },
  incidences: {
    title: 'Incidences',
    empty: 'No active incidences in this moment',
    no_found: 'No incidences found'
  },
  newJob: {
    title: 'New Job',
    desc_title: 'New job of {{job}}'
  },
  job: {
    title: 'Job',
    finished: 'Finished',
    not_finished: 'Unfinished',
    done: 'Open',
    no_done: 'Finish',
    empty: 'No active jobs at the moment'
  },
  jobs: {
    title: 'Jobs',
    no_found: 'No jobs found'
  },
  newIncidence: {
    title: 'New Incidence',
    subtitle: 'Report a problem or issue',
    error: 'An error occurred while creating the incidence. Please try again.',
    form: {
      title: 'Title',
      title_placeholder: 'What happened?',
      incidence: 'Description',
      incidence_placeholder: 'Describe the problem in detail...',
      photos: 'Photos',
      photos_description: 'Add photos to document the issue (optional)',
      create: 'Create incidence'
    }
  },
  newUser: {
    title: 'New user',
    subtitle: 'Fill in the information to create a new user',
    edit: 'Edit user',
    editSubtitle: 'Modify user information',
    sections: {
      personal: 'Personal information',
      contact: 'Contact',
      role: 'Role and permissions'
    },
    form: {
      name: 'Name',
      surname: 'Surname',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      gender: 'Gender',
      language: 'Language',
      create: 'Create user',
      edit: 'Save changes',
      photoHint: 'Tap to change photo'
    }
  },
  users: {
    title: 'Users'
  },
  houses: {
    title: 'Houses',
    newHouse: 'New house',
    createHouse: 'Create house',
    basicInfo: 'Basic information',
    houseName: 'House name',
    address: 'Address',
    street: 'Street and number',
    city: 'City',
    postalCode: 'Postal code',
    phone: 'Phone',
    addPhoto: 'Add photo',
    addPhotoHint: 'Tap to select an image',
    selectOwner: 'Select owner',
    house_data: 'House data',
    house_address: 'Address',
    house_name: 'Name',
    house_municipality: 'Municipality',
    house_street: 'Street',
    owner_name: "Owner's name",
    owner_phone: "Owner's phone"
  },
  photos: {
    title: 'Photos',
    add_photo: 'Add photo',
    add_photo_description: 'Choose how to add the photo',
    take_photo: 'Take photo',
    take_photo_description: 'Use device camera',
    from_gallery: 'Choose from gallery',
    from_gallery_description: 'Select existing photos'
  },
  profile: {
    edit: 'Edit',
    aditionalEmail: 'Additional email',
    personal_data: 'Personal data',
    personalInfo: 'Personal information',
    contactInfo: 'Contact information',
    security: 'Security',
    title: 'Profile',
    phone: 'Phone',
    email: 'Email',
    logout: 'Log out',
    name: 'Name',
    last_name: 'Surname',
    gender: 'Gender',
    role: 'Role',
    language: 'Language',
    oldPassword: 'Current password',
    newPassword: 'New password',
    changePassword: 'Change password'
  },
  options: {
    title: 'Options',
    edit: 'Edit',
    restorePassword: 'Restore password',
    duplicate: 'Duplicate',
    delete: 'Delete',
    removing: 'Removing...'
  },
  alerts: {
    attention: 'Attention',
    cancel: 'Cancel',
    accept: 'Accept',
    incidence: {
      resolve: 'Are you sure you want to resolve the incidence?',
      remove: 'Are you sure you want to delete the incidence?',
      open: 'Are you sure you want to open the incidence?'
    },
    job: {
      finish: 'Are you sure you want to finish the job?',
      open: 'Are you sure you want to open the job?'
    },
    checklist: {
      remove: 'Are you sure you want to delete this checklist?',
      finish:
        'Are you sure you want to finalize and send the report to the owner?'
    }
  },
  chat: {
    view_incidence: 'Go to incidence',
    view_checklist: 'Go to checklist'
  },
  validation: {
    required: 'This field is required'
  }
};
