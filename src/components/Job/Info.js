import React from 'react';
import {useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, Image} from 'react-native';

// UI
import Avatar from '../Avatar';

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
import theme from '../../Theme/Theme';
import {useTranslation} from 'react-i18next';
import {useLocales} from '../../utils/useLocales';
import FastImage from 'react-native-fast-image';

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
  const {t} = useTranslation();
  const {locale} = useLocales();
  const {document: job} = useGetDocFirebase('jobs', jobId);

  const taksDescByLocale = (job) =>
    job?.task?.locales?.[locale]?.desc ||
    job?.task?.locales?.en?.desc ||
    job?.task?.desc;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[styles.container]}>
        <View>
          <View
            style={[
              Layout.row,
              Layout.justifyContentSpaceBetween,
              Gutters.mediumBMargin,
            ]}>
            <View>
              <Badge
                text={job?.house?.[0].houseName}
                variant="purple"
                containerStyle={Gutters.smallVMargin}
              />
              <Badge
                label={t('common.date') + ': '}
                text={moment(job?.date?.toDate()).format('LLL')}
              />
            </View>
            <Badge
              text={job?.done ? t('job.finished') : t('job.not_finished')}
              variant={job?.done ? 'success' : 'danger'}
              containerStyle={Gutters.smallBMargin}
            />
          </View>
          <View
            style={[
              Layout.fill,
              Layout.row,
              Layout.justifyContentSpaceBetween,
            ]}>
            <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
              {taksDescByLocale(job)}
            </Text>
          </View>
          <Text style={[Gutters.smallVMargin, Fonts.textTitle]}>
            {t('checklists.comments')}
          </Text>
          <View
            style={[
              {borderWidth: 1},
              theme.borderGray500,
              theme.roundedSm,
              theme.p4,
            ]}>
            <EditableInput
              value={job?.observations}
              onPressAccept={(change) =>
                updateDocument('jobs', jobId, {observations: change})
              }
            />
          </View>
          <View style={[Layout.grouw, Gutters.mediumTMargin]}>
            <Text style={{...defaultLabel, ...marginBottom(10)}}>
              {t('common.asigned_to')}
            </Text>
            <View style={[Layout.row]}>
              {job?.workers?.map((worker, i) => (
                <Avatar
                  overlap={job?.workers.length > 1}
                  index={i}
                  id={worker.id}
                  key={worker.id}
                  uri={worker.profileImage?.small}
                  size="big"
                />
              ))}
            </View>
          </View>
          <FastImage
            style={styles.houseImage}
            source={{
              uri: job?.house && job?.house[0]?.houseImage?.original,
              priority: FastImage.priority.normal,
            }}
          />
          <Badge
            label={t('houses.house_municipality') + ': '}
            text={job?.house?.[0]?.municipio}
            containerStyle={Gutters.smallBMargin}
          />
          <Badge
            label={t('houses.house_street') + ': '}
            text={job?.house?.[0]?.street}
            variant="warning"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(Info);
