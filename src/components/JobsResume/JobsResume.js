import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';

// Ui
import {VictoryPie} from 'victory-native';
import PriorityResume from './PriorityResume';

// Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

// Utils

import {parsePriority} from '../../utils/parsers';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginTop: 20,
  },
  prioritiesWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const JobsResume = () => {
  const {list, loading, result} = useGetFirebase('jobs', null, [
    {
      label: 'done',
      operator: '==',
      condition: false,
    },
  ]);
  const [resume, setResume] = useState([]);

  useEffect(() => {
    if (list) {
      const listResume = list.reduce((priorityCount, job) => {
        priorityCount[parsePriority(job.priority)] =
          (priorityCount[parsePriority(job.priority)] || 0) + 1;
        return priorityCount;
      }, {});
      const formatedResume = Object.keys(listResume).map((key) => ({
        x: key,
        y: listResume[key],
      }));
      setResume(formatedResume);
    }
  }, [list]);

  return (
    <View style={styles.container}>
      <View>
        {loading ? (
          <Text>Cargando gráfico...</Text>
        ) : (
          <VictoryPie
            data={resume}
            width={200}
            height={200}
            padAngle={5}
            padding={{left: 30, right: 30}}
            labels={() => null}
            colorScale={['#ED7A7A', '#F5C66D', '#58BFC0']}
            innerRadius={50}
            style={{
              labels: {
                fill: 'red',
                fontSize: 15,
                padding: 7,
              },
            }}
          />
        )}
      </View>
      <View style={styles.prioritiesWrapper}>
        <PriorityResume
          color="#ED7A7A"
          label="Alta"
          value={resume[0]?.y || 0}
        />
        <PriorityResume
          color="#F5C66D"
          label="Media"
          value={resume[1]?.y || 0}
        />
        <PriorityResume
          color="#58BFC0"
          label="Baja"
          value={resume[2]?.y || 0}
        />
      </View>
      <View />
    </View>
  );
};

export default JobsResume;
