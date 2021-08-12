import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Redux

//Firebase
import firestore from '@react-native-firebase/firestore';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';

// styles

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
import {Divider} from 'react-native-elements';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

import Badge from '../Elements/Badge';
import {Colors} from '../../Theme/Variables';
import {openScreenWithPush} from '../../Router/utils/actions';
import {HOUSE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import useAuth from '../../utils/useAuth';
import {useTranslation} from 'react-i18next';

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
  const {isOwner} = useAuth();
  const {Layout, Gutters, Fonts} = useTheme();
  const {docId} = route.params;
  const {t} = useTranslation();
  const query = useMemo(() => {
    return firestore().collection('checklists').doc(docId).collection('checks');
  }, [docId]);

  const queryChecklist = useMemo(() => {
    return firestore().collection(CHECKLISTS).doc(docId);
  }, [docId]);

  const [checklist, loadingChecklist] = useDocumentData(queryChecklist, {
    idField: 'id',
  });

  const [checks, loadingChecks] = useCollectionData(query, {
    idField: 'id',
  });

  const doneCounter = checks?.filter((check) => check.done).length;

  return (
    <View style={styles.checklistContainer}>
      <View style={{marginBottom: 20}}>
        {checklist?.finished && (
          <Badge text={t('checklists.checkPage.done')} variant={'success'} />
        )}
        <View style={[Gutters.smallBMargin]}>
          {isOwner ? (
            <View style={[Gutters.smallBMargin, {width: '90%'}]}>
              <Text style={[Gutters.regularTMargin, Gutters.tinyBMargin]}>
                Our team is working hard to keep your house clean and safe! 🚀🚀
              </Text>
              <Text>
                Here you will see the update of the jobs made in your house
              </Text>
            </View>
          ) : (
            <View>
              <EditableInput
                value={checklist?.observations}
                onPressAccept={(change) =>
                  updateChecklistInput(docId, {observations: change})
                }
              />
            </View>
          )}
          <View
            style={[
              Layout.row,
              Layout.justifyContentSpaceBetween,
              Layout.alignItemsCenter,
              Gutters.smallVMargin,
            ]}>
            <View>
              <Badge
                text={checklist?.house?.[0].houseName}
                variant="purple"
                containerStyle={Gutters.smallBMargin}
                onPress={() =>
                  openScreenWithPush(HOUSE_SCREEN_KEY, {
                    houseId: checklist?.house?.[0].id,
                  })
                }
              />
              <Badge
                label={t('common.date') + ': '}
                text={moment(checklist?.date?.toDate()).format('LL')}
                variant={'pm'}
              />
            </View>
            {!loadingChecks && (
              <AnimatedCircularProgress
                size={60}
                width={4}
                fill={(doneCounter / checklist?.total) * 100}
                tintColor={Colors.pm}
                backgroundColor={Colors.lowGrey}
                backgroundWidth={2}>
                {() => (
                  <Text style={{fontSize: 12}}>
                    {Math.round((doneCounter / checklist?.total) * 100)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            )}
          </View>
        </View>
        <Divider />
        <View style={[Layout.col, Gutters.smallVMargin]}>
          <View style={[Layout.row, Layout.justifyContentSpaceBetween]}>
            <Text style={[Gutters.smallBMargin, Fonts.textTitle]}>
              {isOwner
                ? t('checklists.checkPage.workers')
                : t('common.asigned_workers')}
            </Text>
          </View>
          <View style={[Layout.row]}>
            {checklist?.workers?.map((worker, i) => (
              <Avatar
                overlap={checklist?.workers?.length > 1}
                index={i}
                id={worker.id}
                key={worker.id}
                uri={worker.profileImage}
                size="big"
              />
            ))}
          </View>
        </View>
        <Divider />
      </View>
      {!loadingChecklist && (
        <ListOfChecks disabled={false} checks={checks} checkId={docId} />
      )}
    </View>
  );
};

export default Info;
