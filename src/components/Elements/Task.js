import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Avatar from '../Avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';

//Utils
import {parsePriorityColor, parsePirorityIcon} from '../../utils/parsers';
import {TouchableOpacity} from 'react-native';

// Swipeable
import Swipeable from 'react-native-gesture-handler/Swipeable';
import RightActions from '../Elements/RightActions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  priority: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,

    borderRadius: 20,
    marginLeft: 5,
    marginRight: 15,
    backgroundColor: 'white',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#BCBCBC',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selector: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    height: 30,
    width: 30,
    borderRadius: 100,
    marginRight: 10,
  },
  selectorActive: {
    height: 22,
    width: 22,
    borderRadius: 100,
    backgroundColor: 'red',
  },
  description: {
    fontSize: 10,
    color: '#2A7BA5',
  },
  rightContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    marginRight: 20,
  },
  priorityContainer: {
    height: '100%',
    width: 7,
    backgroundColor: 'red',
    borderRadius: 20,
  },
});

const Task = ({onSelect, onItemClick, onDelete, job, task, index}) => {
  const workers = Array.isArray(task?.workers)
    ? task?.workers
    : task?.workers?.value;
  const priority =
    typeof task?.priority === 'string' ? task?.priority : task?.priority?.value;

  const handleTaskSelector = () => {
    onSelect(task?.id, {done: !task.done});
  };

  return (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        RightActions(progress, dragX, onDelete)
      }
      containerStyle={styles.swipperContainer}
      childrenContainerStyle={{borderRadius: 10}}>
      <TouchableOpacity onPress={() => onItemClick(task)}>
        <View style={styles.container}>
          <View style={styles.leftContainer}>
            <TouchableOpacity onPress={() => handleTaskSelector()}>
              <View
                style={{
                  ...styles.selector,
                  ...{borderColor: parsePriorityColor(priority)},
                }}>
                {task?.done && (
                  <View
                    style={{
                      ...styles.selectorActive,
                      ...{backgroundColor: parsePriorityColor(priority)},
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
            <View>
              <Text>{task?.name}</Text>
              {task?.description && (
                <Text style={styles.description}>{task?.description}</Text>
              )}
            </View>
          </View>
          <View style={styles.rightContainer}>
            <View style={styles.avatarContainer}>
              {workers?.map((worker, i) => (
                <Avatar
                  key={i}
                  uri={worker?.profileImage}
                  overlap
                  size="medium"
                />
              ))}
            </View>
            {task?.priority && (
              <View
                style={[
                  styles.priority,
                  {
                    backgroundColor: parsePriorityColor(priority),
                  },
                ]}>
                <Icon
                  name={parsePirorityIcon(priority)?.name}
                  color="white"
                  size={25}
                />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default Task;
