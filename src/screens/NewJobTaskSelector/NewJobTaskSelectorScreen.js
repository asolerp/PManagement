import React, {useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';

// UI
import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Firebase
import firestore from '@react-native-firebase/firestore';

import TaskItem from '../../components/Elements/TaskItem';
import PageLayout from '../../components/PageLayout';
import {setTask} from '../../Store/JobForm/jobFormSlice';
import {openScreenWithPush, popScreen} from '../../Router/utils/actions';
import {NEW_JOB_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {Colors} from '../../Theme/Variables';

import {useTranslation} from 'react-i18next';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {useLocales} from '../../utils/useLocales';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#BCBCBC',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  taskSelectorBackScreen: {
    flex: 1,
  },
  taskSelectorScreen: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 50,
    height: '100%',
    paddingTop: 30,
  },
});

const NewJobTaskSelectorScreen = ({route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);
  const {locale} = useLocales();
  const [tasks, loadingTasks] = useCollectionData(
    firestore().collection('tasks'),
    {
      idField: 'id',
    },
  );

  const setTaskAction = useCallback(
    (task) => dispatch(setTask({task})),
    [dispatch],
  );

  const taskName = (task) =>
    task?.locales?.[locale].name || task?.locales?.en.name || task.name;

  const handlerTaskClick = (task) => {
    setTaskAction(task);
    openScreenWithPush(NEW_JOB_SCREEN_KEY, {
      taskName: task.name,
    });
  };

  const tasksByLocale = tasks?.map((task) => ({
    ...task,
    name: taskName(task),
  }));

  return (
    <PageLayout
      safe
      titleRightSide={
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} />
          </View>
        </TouchableWithoutFeedback>
      }
      titleProps={{
        title: t('newJob.title'),
        subPage: true,
      }}>
      {loadingTasks ? (
        <View style={styles.taskSelectorScreen}>
          <Text>Cargando tareas..</Text>
        </View>
      ) : (
        <View style={styles.taskSelectorScreen}>
          {tasksByLocale
            .sort(function (a, b) {
              if (a.name > b.name) {
                return 1;
              }
              if (a.name < b.name) {
                return -1;
              }
              return 0;
            })
            .map((task) => (
              <TaskItem
                key={task.id}
                icon={task?.icon}
                name={task?.name}
                active={job?.task?.name === task?.name}
                onPress={() => handlerTaskClick(task)}
              />
            ))}
        </View>
      )}
    </PageLayout>
  );
};

export default NewJobTaskSelectorScreen;
