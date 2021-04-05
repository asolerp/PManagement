import React, {useCallback, useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, Image} from 'react-native';

// UI
import Avatar from '../Avatar';
import InfoIcon from '../InfoIcon';
import CustomButton from '../Elements/CustomButton';

// Firebase
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useDeleteFirebase} from '../../hooks/useDeleteFirebase';

// Redux
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
import {editForm} from '../../store/jobFormActions';

// Utils
import moment from 'moment';
import {finishTaskAlert, openTaskStatus} from '../Alerts/deleteJobAlert';
import {ScrollView} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
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
  const dispatch = useDispatch();
  const {jobId} = route.params;
  const {document: job, loadingJob, errorJob} = useGetDocFirebase(
    'jobs',
    jobId,
  );

  const {job: jobFormState} = useSelector(
    ({jobForm: {job}}) => ({job}),
    shallowEqual,
  );

  const {updateFirebase, loading, error} = useUpdateFirebase('jobs');

  const handleFinishTask = (status) => {
    updateFirebase(`${jobId}`, {
      done: status,
    });
  };

  const editFormAaction = useCallback((task) => dispatch(editForm(task, job)), [
    dispatch,
    job,
  ]);

  return (
    <ScrollView contentContainerStyle={{flex: 1}}>
      <View style={styles.container}>
        <View style={{flex: 1}}>
          <View style={styles.infoWrapper}>
            <InfoIcon
              info={job.done ? 'Termianda' : 'Sin terminar'}
              color={job.done ? '#7dd891' : '#ED7A7A'}
            />
          </View>
          <Text style={styles.date}>
            🕜 {moment(job?.date?.toDate()).format('LL')}
          </Text>
          <Text style={styles.label}>🕵️‍♀️ Observaciones</Text>
          {job?.observations ? (
            <Text style={styles.observations}>{job?.observations}</Text>
          ) : (
            <Text style={styles.observations}>
              No se han detallado observaciones
            </Text>
          )}
          <Text style={styles.label}>👷‍♂️ Trabajadores asignados</Text>
          <View style={styles.workers}>
            {job?.workers?.map((worker) => (
              <Avatar
                key={worker.id}
                uri={worker.profileImage}
                overlap
                size="big"
              />
            ))}
          </View>
          <Text style={styles.label}>
            🏡 {job?.house && job?.house[0].houseName}
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
        <View style={styles.actionButtonWrapper}>
          <CustomButton
            title={job?.done ? 'No está terminada' : 'Finalizar'}
            onPress={() => {
              if (job?.done) {
                openTaskStatus(() => handleFinishTask(false));
              } else {
                finishTaskAlert(() => handleFinishTask(true));
              }
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(Info);
