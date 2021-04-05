import React, {useCallback} from 'react';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';

// UI
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import TitlePage from '../../components/TitlePage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';
import TaskItem from '../../components/Elements/TaskItem';
import {setTask} from '../../store/jobFormActions';
import PagetLayout from '../../components/PageLayout';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    borderTopRightRadius: 50,
    height: '100%',
    paddingTop: 30,
  },
});

const NewJobTaskSelectorScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);

  const {list: tasks, loading: loadingTasks} = useGetFirebase('tasks');

  const setTaskAction = useCallback((task) => dispatch(setTask(task)), [
    dispatch,
  ]);

  const handlerTaskClick = (task) => {
    setTaskAction(task);
    navigation.navigate('NewJob', {
      taskName: task?.name,
    });
  };

  return (
    <PagetLayout
      titleLefSide={
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <View style={styles.iconWrapper}>
            <Icon name="arrow-back" size={25} color="#5090A5" />
          </View>
        </TouchableOpacity>
      }
      titleProps={{
        title: 'Nuevo trabajo',
        subPage: true,
      }}>
      {loadingTasks ? (
        <View style={styles.taskSelectorScreen}>
          <Text>Cargando tareas..</Text>
        </View>
      ) : (
        <View style={styles.taskSelectorScreen}>
          {tasks
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
    </PagetLayout>
  );
};

export default NewJobTaskSelectorScreen;
