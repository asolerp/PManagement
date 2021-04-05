export const setInputForm = (label, value) => {
  return {
    type: 'SET_FORM_JOB',
    label: label,
    payload: value,
  };
};

export const setTask = (task) => {
  return {
    type: 'SET_TASK',
    payload: task,
  };
};

export const editForm = (task, job) => {
  return {
    type: 'EDIT_FORM',
    payload: {
      jobId: job?.id,
      taskId: task?.id || task?.internalUUID,
      taskName: task?.name,
      taskDescription: task?.description,
      taskWorkers: {
        value: task?.workers || task?.workers?.value,
        switch:
          task?.workers?.length > 0 || task?.workers?.value?.length > 0
            ? true
            : false,
      },
      taskPriority: {
        value: task?.priority || task?.priority?.value,
        switch: task?.priority || task?.priority?.value ? true : false,
      },
      mode: 'edit',
    },
  };
};

export const resetTask = () => {
  return {
    type: 'RESET_TASK',
    label: 'tasks',
  };
};

export const resetForm = () => {
  return {
    type: 'RESET_FORM',
  };
};
