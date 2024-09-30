import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Redux

//Firebase
import firestore from '@react-native-firebase/firestore';
import {
  useCollectionData,
  useDocumentData
} from 'react-firebase-hooks/firestore';

// styles

import { GREY_1, PM_COLOR } from '../../styles/colors';

// utils
import moment from 'moment';

import EditableInput from '../Elements/EditableInput';

import { useRoute } from '@react-navigation/core';
import updateChecklistInput from '../../Services/updateChecklistInput';

import ListOfChecks from './ListOfChecks';
import { CHECKLISTS } from '../../utils/firebaseKeys';
import { useTheme } from '../../Theme';

import Avatar from '../Avatar';

import { AnimatedCircularProgress } from 'react-native-circular-progress';

import Badge from '../Elements/Badge';
import { Colors } from '../../Theme/Variables';
import { openScreenWithPush } from '../../Router/utils/actions';
import { HOUSE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import useAuth from '../../utils/useAuth';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import theme from '../../Theme/Theme';
import { DEFAULT_IMAGE } from '../../constants/general';
import { normalShadow } from '../../styles/common';

const styles = StyleSheet.create({
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: PM_COLOR,
    borderRadius: 100,
    height: 32,
    justifyContent: 'center',
    marginRight: 10,
    width: 32
  },
  checkboxWrapper: {
    flexDirection: 'row'
  },
  checklistContainer: {
    flex: 1,
    marginTop: 10
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: GREY_1,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    padding: 10
  },
  dateStyle: {
    color: '#2A7BA5'
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 0,
    paddingRight: 20
  },
  name: {
    fontSize: 15
  },
  observationsStyle: {
    fontSize: 15
  }
});

const Info = ({ isCheckFinished }) => {
  const route = useRoute();
  const { isOwner } = useAuth();
  const { Layout, Gutters, Fonts } = useTheme();
  const { docId } = route.params;
  const { t } = useTranslation();
  const query = useMemo(() => {
    return firestore().collection('checklists').doc(docId).collection('checks');
  }, [docId]);

  const queryChecklist = useMemo(() => {
    return firestore().collection(CHECKLISTS).doc(docId);
  }, [docId]);

  const [checklist, loadingChecklist] = useDocumentData(queryChecklist, {
    idField: 'id'
  });

  const [checks, loadingChecks] = useCollectionData(query, {
    idField: 'id'
  });

  const doneCounter = checks?.filter(check => check.done).length;

  const date = checklist?.date?._d?.toDate() || checklist?.date?.toDate();

  return (
    <ScrollView
      style={styles.checklistContainer}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 10 }}>
        {checklist?.finished && (
          <Badge text={t('checklists.checkPage.done')} variant={'success'} />
        )}
        <View style={Gutters.smallBMargin}>
          <View
            style={[
              Layout.row,
              Layout.justifyContentSpaceBetween,
              Layout.alignItemsCenter,
              Gutters.smallVMargin
            ]}
          >
            <View>
              <Badge
                text={checklist?.house?.[0].houseName}
                variant="purple"
                containerStyle={Gutters.smallBMargin}
                onPress={() =>
                  openScreenWithPush(HOUSE_SCREEN_KEY, {
                    houseId: checklist?.house?.[0].id
                  })
                }
              />
              <Badge
                label={t('common.date') + ': '}
                text={moment(date).format('LL')}
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
                backgroundWidth={2}
              >
                {() => (
                  <Text style={{ fontSize: 12, color: 'black' }}>
                    {Math.round((doneCounter / checklist?.total) * 100)}%
                  </Text>
                )}
              </AnimatedCircularProgress>
            )}
          </View>
        </View>

        <View style={Gutters.smallBMargin}>
          <Text
            style={[Gutters.smallVMargin, Fonts.textTitle, theme.textBlack]}
          >
            {t('checklists.comments')}
          </Text>
          {isOwner ? (
            <View style={[Gutters.smallBMargin, { width: '90%' }]}>
              <Text
                style={[
                  Gutters.regularTMargin,
                  Gutters.tinyBMargin,
                  theme.textBlack
                ]}
              >
                Our team is working hard to keep your house clean and safe! 🚀🚀
              </Text>
              <Text style={theme.textBlack}>
                Here you will see the update of the jobs made in your house
              </Text>
            </View>
          ) : (
            <View
              style={[
                { borderWidth: 1 },
                theme.borderGray500,
                theme.roundedSm,
                theme.p4
              ]}
            >
              {checklist && (
                <EditableInput
                  value={checklist?.observations || 'Sin observaciones'}
                  onPressAccept={change =>
                    updateChecklistInput(docId, { observations: change })
                  }
                />
              )}
            </View>
          )}
        </View>

        {checklist?.workers?.length > 0 && (
          <>
            <View style={[Layout.col, Gutters.smallVMargin]}>
              <View style={[Layout.row, Layout.justifyContentSpaceBetween]}>
                <Text
                  style={[
                    Gutters.smallBMargin,
                    Fonts.textTitle,
                    theme.textBlack
                  ]}
                >
                  {isOwner
                    ? t('checklists.checkPage.workers')
                    : t('common.asigned_workers')}
                </Text>
              </View>
              <View style={[Layout.row, theme.mL1]}>
                {checklist?.workers?.map((worker, i) => (
                  <View
                    key={i}
                    style={[theme.justifyCenter, theme.itemsCenter]}
                  >
                    <Avatar
                      enabled={!isOwner}
                      overlap={checklist?.workers?.length > 1}
                      index={i}
                      id={worker.id}
                      key={worker.id}
                      uri={worker.profileImage?.small || DEFAULT_IMAGE}
                      size="big"
                      style={[normalShadow, theme.mB2]}
                    />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        theme.textXs,
                        theme.textBlack,
                        theme.textCenter,
                        theme.w12
                      ]}
                    >
                      {worker.firstName}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
      {!loadingChecklist && (
        <ListOfChecks
          disabled={isOwner}
          checks={checks}
          checkId={docId}
          isCheckFinished={isCheckFinished}
        />
      )}
    </ScrollView>
  );
};

export default Info;
