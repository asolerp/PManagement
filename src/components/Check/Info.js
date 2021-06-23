import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Redux

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

// styles
import {defaultLabel, marginBottom} from '../../styles/common';
import {GREY_1, PM_COLOR} from '../../styles/colors';

// utils
import moment from 'moment';

import EditableInput from '../Elements/EditableInput';

import {useRoute} from '@react-navigation/core';
import updateChecklistInput from '../../Services/updateChecklistInput';

import ListOfChecks from './ListOfChecks';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {useTheme} from '../../Theme';
import Avatar from '../Avatar';

const styles = StyleSheet.create({
  checklistContainer: {
    flex: 1,
    borderTopRightRadius: 50,
    marginTop: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: GREY_1,
    borderRadius: 10,
  },
  observationsStyle: {
    fontSize: 15,
  },
  checkboxWrapper: {
    flexDirection: 'row',
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 0,
    paddingRight: 20,
  },
  name: {
    fontSize: 15,
  },
  dateStyle: {
    color: '#2A7BA5',
  },
  date: {
    marginBottom: 10,
    marginVertical: 10,
  },
  buttonStyle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 100,
    marginRight: 10,
  },
});

const Info = () => {
  const route = useRoute();
  const {Layout, Gutters, Fonts} = useTheme();
  const {docId} = route.params;

  const queryChecklist = useMemo(() => {
    return firestore().collection(CHECKLISTS).doc(docId);
  }, [docId]);

  const [checklist, loadingChecklist] = useDocumentData(queryChecklist, {
    idField: 'id',
  });

  return (
    <View style={styles.checklistContainer}>
      <View style={{marginBottom: 20}}>
        <Text style={styles.date}>
          🕜 {moment(checklist?.date?.toDate()).format('LL')}
        </Text>
        <View>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
            🕵️‍♂️ Observaciones
          </Text>
          <EditableInput
            value={checklist?.observations}
            onPressAccept={(change) =>
              updateChecklistInput(docId, {observations: change})
            }
          />
        </View>
        <View
          style={[
            Layout.colCenter,
            Layout.justifyContentStart,
            Layout.alignItemsStart,
            Gutters.smallVMargin,
          ]}>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
            👷‍♀️ Trabajadores asignados
          </Text>
          {checklist?.workers?.map((worker) => (
            <Avatar
              id={worker.id}
              key={worker.id}
              uri={worker.profileImage}
              size="big"
            />
          ))}
        </View>
      </View>
      {!loadingChecklist && <ListOfChecks checkId={docId} />}
    </View>
  );
};

export default Info;
