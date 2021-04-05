import React, {useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

// Redux
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {
  addTask,
  editForm,
  resetTask,
  removeTask,
  addEditedTask,
} from '../../../store/jobFormActions';

import Task from '../../Elements/Task';
import NewEditTask from './NewEditTask';

import {deleteTaskAlert} from '../../Alerts/deleteJobAlert';
import {v1 as uuidv1} from 'uuid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
  },
  subtitle: {
    color: '#2A7BA5',
  },
  tasksContainer: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});

const TaskForm = ({onNew, onEdit}) => {
  const dispatch = useDispatch();
  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);

  const addTaskAction = useCallback((task) => dispatch(addTask(task)), [
    dispatch,
  ]);

  const editFormAction = useCallback((task) => dispatch(editForm(task, job)), [
    dispatch,
    job,
  ]);

  const addEditedTaskAction = useCallback(
    (index, task) => dispatch(addEditedTask(index, task)),
    [dispatch],
  );

  const resetTaskAction = useCallback(() => dispatch(resetTask()), [dispatch]);
  const removeTaskAction = useCallback(
    (taskId) => {
      const index = job.tasks.findIndex((task) => task.internalUUID === taskId);
      return dispatch(removeTask(index));
    },
    [dispatch, job],
  );

  const onDeleteTask = (taskId) => {
    removeTaskAction(taskId);
  };

  const handleItemSelect = (task) => {
    editFormAction(task);
  };

  const addTaskHandler = () => {
    const task = {
      name: job.taskName,
      date: job?.date,
      description: job.taskDescription,
      workers: job.taskWorkers,
      priority: job.taskPriority,
      internalUUID: Date.now(),
    };
    addTaskAction(task);
  };

  const cleanTask = () => {
    resetTaskAction();
  };

  const handleSubmitNew = () => {
    addTaskHandler();
    cleanTask();
  };

  const handleSubmitEdit = () => {
    const index = job.tasks.findIndex(
      (task) => task.internalUUID === job.taskId,
    );
    const task = {
      name: job.taskName,
      date: job.date,
      description: job.taskDescription,
      workers: job.taskWorkers,
      priority: job.taskPriority,
      internalUUID: job.taskId,
    };
    addEditedTaskAction(index, task);
    cleanTask();
  };

  return (
    <View style={styles.container}>
      <View>
        <ScrollView>
          <NewEditTask onSubmit={handleSubmitNew} onEdit={handleSubmitEdit} />
        </ScrollView>
      </View>
      <Text style={styles.tasksTitle}>Tareas</Text>
      <View style={styles.tasksContainer}>
        <ScrollView>
          {job.tasks?.map((task, i) => (
            <Task
              task={task}
              key={task.internalUUID}
              onItemClick={handleItemSelect}
              onDelete={() =>
                deleteTaskAlert(() => onDeleteTask(task.internalUUID))
              }
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default TaskForm;
