import React from 'react';
import {useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, Image} from 'react-native';

// UI
import Avatar from '../Avatar';
import InfoIcon from '../InfoIcon';

// Firebase
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';

// Utils
import moment from 'moment';
import {ScrollView} from 'react-native';

import {defaultLabel, marginBottom} from '../../styles/common';
import EditableInput from '../Elements/EditableInput';
import updateDocument from '../../Services/updateDocument';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
  },
  infoWrapper: {
    width: '30%',
  },
  actionButtonWrapper: {
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  date: {
    fontSize: 18,
    marginVertical: 10,
    color: '#3DB6BA',
  },
  label: {
    fontSize: 20,
    width: '90%',
    color: '#284748',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  observations: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
    marginBottom: 30,
  },
  houseItems: {
    fontSize: 18,
    width: '90%',
    color: '#284748',
  },
  houseImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    marginVertical: 10,
    borderRadius: 10,
  },
  workers: {
    flexDirection: 'row',
    marginBottom: 30,
  },
});

const Info = () => {
  const route = useRoute();
  const {jobId} = route.params;

  const {document: job} = useGetDocFirebase('jobs', jobId);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={{flex: 1}}>
          <View style={styles.infoWrapper}>
            <InfoIcon
              info={job.done ? 'Termianda' : 'Sin terminar'}
              color={job.done ? '#7dd891' : '#ED7A7A'}
            />
          </View>
          <Text style={styles.date}>
            {moment(job?.date?.toDate()).format('LL')}
          </Text>
          <Text style={{...defaultLabel, ...marginBottom(10)}}>
            Observaciones
          </Text>
          <EditableInput
            value={job?.observations}
            onPressAccept={(change) =>
              updateDocument('jobs', jobId, {observations: change})
            }
          />
          <Text style={{...defaultLabel, ...marginBottom(10)}}>
            Trabajadores asignados
          </Text>
          <View style={styles.workers}>
            {job?.workers?.map((worker) => (
              <Avatar
                id={worker.id}
                name={worker.firstName}
                key={worker.id}
                uri={worker.profileImage}
                size="big"
              />
            ))}
          </View>
          <Text style={styles.label}>
            {job?.house && job?.house[0].houseName}
          </Text>
          <Text style={styles.houseItems}>
            <Text style={{fontWeight: 'bold'}}>Calle: </Text>
            <Text>{job?.house && job?.house[0]?.street}</Text>{' '}
          </Text>
          <Text style={styles.houseItems}>
            <Text style={{fontWeight: 'bold'}}>Municipio: </Text>
            <Text>{job?.house && job?.house[0]?.municipio}</Text>{' '}
          </Text>
          <Image
            style={styles.houseImage}
            source={{
              uri: job?.house && job?.house[0]?.houseImage,
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(Info);
