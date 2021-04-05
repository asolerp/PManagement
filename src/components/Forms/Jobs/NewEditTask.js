import React, {useCallback} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

import {useSelector, useDispatch, shallowEqual} from 'react-redux';

import Accordian from '../../../components/Elements/Accordian';
import InputGroup from '../../../components/Elements/InputGroup';
import DynamicSelectorList from '../../../components/DynamicSelectorList';
import PrioritySelector from '../../../components/Elements/PrioritySelector';

// Utils
import {parsePriority} from '../../../utils/parsers';

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
  addEditButton: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F8AA3',
  },
});

const NewEditTask = ({onSubmit, onEdit}) => {
  const dispatch = useDispatch();

  const {job} = useSelector(({jobForm: {job}}) => ({job}), shallowEqual);

  const setInputForm = useCallback(
    (label, value) =>
      dispatch({
        type: 'SET_FORM',
        label: label,
        payload: value,
      }),
    [dispatch],
  );

  return (
    <View style={{marginBottom: 20}}>
      <InputGroup>
        <TextInput
          style={{height: 40}}
          placeholder="Tarea"
          onChangeText={(text) => setInputForm('taskName', text)}
          value={job.taskName}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Descripción"
          onChangeText={(text) => setInputForm('taskDescription', text)}
          value={job.taskDescription}
        />
      </InputGroup>
      <InputGroup>
        <Accordian
          title="Asignar a..."
          subtitle={
            <View>
              {job?.taskWorkers?.value?.map((worker, i) => (
                <View key={i} style={{flexDirection: 'row'}}>
                  <Text style={styles.subtitle}>{worker.firstName}</Text>
                  {job?.taskWorkers?.value?.length - 1 !== i && (
                    <Text style={styles.subtitle}> & </Text>
                  )}
                </View>
              ))}
            </View>
          }
          switcher={job?.taskWorkers?.switch}
          iconProps={{name: 'person', color: '#55A5AD'}}
          onOpen={() => setInputForm('taskWorkers', {value: [], switch: true})}
          onClose={() =>
            setInputForm('taskWorkers', {value: undefined, switch: false})
          }>
          <View style={styles.asignList}>
            <DynamicSelectorList
              collection="users"
              searchBy="firstName"
              schema={{img: 'profileImage', name: 'firstName'}}
              get={job.taskWorkers?.value || []}
              set={(workers) => {
                setInputForm('taskWorkers', {
                  ...job.taskWorkers,
                  value: workers,
                });
              }}
              multiple={true}
            />
          </View>
        </Accordian>
      </InputGroup>
      <InputGroup>
        <Accordian
          title="Prioridad"
          subtitle={[
            <Text style={styles.subtitle}>
              {parsePriority(job.taskPriority?.value)}
            </Text>,
          ]}
          switcher={job.taskPriority?.switch}
          iconProps={{name: 'house', color: '#55A5AD'}}
          onOpen={() =>
            setInputForm('taskPriority', {value: undefined, switch: true})
          }
          onClose={() =>
            setInputForm('taskPriority', {value: undefined, switch: false})
          }>
          <PrioritySelector
            get={job.taskPriority?.value || []}
            set={(priority) => {
              setInputForm('taskPriority', {
                ...job.taskPriority,
                value: priority,
              });
            }}
          />
        </Accordian>
      </InputGroup>
      <Text
        style={styles.addEditButton}
        onPress={job.mode === 'new' ? onSubmit : onEdit}>
        {job.mode === 'new' ? 'Añadir' : 'Editar'}
      </Text>
    </View>
  );
};

export default NewEditTask;
