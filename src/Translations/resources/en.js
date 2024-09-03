export default {
  login: {
    welcome: 'Welcome!',
    login: 'Login to manage your house',
    forgot: 'Remember password',
    reset_fail: 'Please enter a correct email',
    fail: 'Email or password are wrong',
    cta: 'Login'
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
    search_name: 'Search by name...',
    informer: 'Informer',
    asigned_to: 'Asigned to',
    asigned_workers: 'Asigned workers',
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
    photos: 'Photos'
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
    subtitle: 'Info',
    form: {
      title: 'Title',
      incidence: 'Description',
      photos: 'Photos',
      create: 'Create incidence'
    }
  },
  newUser: {
    title: 'New user',
    edit: 'Edit user',
    form: {
      name: 'Name',
      surname: 'Surname',
      email: 'Email',
      phone: 'Phone',
      role: 'User role',
      gender: 'Gender',
      language: 'Language',
      create: 'Create user',
      edit: 'Edit user'
    }
  },
  users: {
    title: 'Users'
  },
  houses: {
    title: 'Houses',
    house_data: 'House data',
    house_address: 'Addresss',
    house_name: 'Name',
    house_municipality: 'Municipality',
    house_street: 'Street',
    owner_name: "Owner's name",
    owner_phone: "Owner's phone"
  },
  photos: {
    title: 'Photos'
  },
  profile: {
    edit: 'Edit',
    aditionalEmail: 'Aditional email',
    personal_data: 'Personal data',
    title: 'Profile',
    phone: 'Phone',
    email: 'Email',
    logout: 'Logout',
    name: 'Name',
    last_name: 'Surname',
    gender: 'Gender',
    role: 'Role',
    language: 'Language'
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
  }
};
