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

import Badge from '../../components/Elements/Badge';
import {defaultLabel, marginBottom} from '../../styles/common';
import EditableInput from '../Elements/EditableInput';
import updateDocument from '../../Services/updateDocument';
import {useTheme} from '../../Theme';

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
  date: {},
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
  const {Layout, Fonts, Gutters} = useTheme();
  const {jobId} = route.params;

  const {document: job} = useGetDocFirebase('jobs', jobId);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.container]}>
        <View>
          <View
            style={[
              Layout.fill,
              Layout.row,
              Layout.justifyContentSpaceBetween,
            ]}>
            <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
              {job?.task?.desc}
            </Text>
            <Badge
              text={job?.done ? 'Termianda' : 'Sin terminar'}
              variant={job?.done ? 'success' : 'danger'}
            />
          </View>
          <EditableInput
            value={job?.observations}
            onPressAccept={(change) =>
              updateDocument('jobs', jobId, {observations: change})
            }
          />
          <Badge
            text={job?.house?.[0].houseName}
            variant="purple"
            containerStyle={Gutters.smallVMargin}
          />
          <Badge
            label="Fecha: "
            text={moment(job?.date?.toDate()).format('LL')}
          />
          <View style={[Gutters.mediumTMargin]}>
            <Text style={{...defaultLabel, ...marginBottom(10)}}>
              Asignado a
            </Text>
            <View style={styles.workers}>
              {job?.workers?.map((worker) => (
                <Avatar
                  id={worker.id}
                  key={worker.id}
                  uri={worker.profileImage}
                  size="big"
                />
              ))}
            </View>
          </View>
          <Image
            style={styles.houseImage}
            source={{
              uri: job?.house && job?.house[0]?.houseImage,
            }}
          />
          <Badge
            label="Municipio: "
            text={job?.house?.[0]?.municipio}
            containerStyle={Gutters.smallBMargin}
          />
          <Badge
            label="Calle: "
            text={job?.house?.[0]?.street}
            variant="warning"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(Info);
