import React, {useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

// UI
import Avatar from '../Avatar';

// Firebase
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';

// Utils
import moment from 'moment';
import {ScrollView} from 'react-native';

import Badge from '../../components/Elements/Badge';
import {defaultLabel, marginBottom, normalShadow} from '../../styles/common';
import EditableInput from '../Elements/EditableInput';
import updateDocument from '../../Services/updateDocument';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import {useTranslation} from 'react-i18next';
import {useLocales} from '../../utils/useLocales';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';
import {DEFAULT_IMAGE} from '../../constants/general';
import ImageView from 'react-native-image-viewing';

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexGrow: 1,
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
  const [modal, setModal] = useState();
  const [imageIndex, setImageIndex] = useState(0);
  const {Layout, Fonts, Gutters} = useTheme();
  const {jobId} = route.params;
  const {t} = useTranslation();
  const {locale} = useLocales();
  const user = useSelector(userSelector);
  const {document: job} = useGetDocFirebase('jobs', jobId);

  const photoFinish = {
    uri: job.photoFinish,
    id: job.photoFinish,
  };

  const taksDescByLocale = (job) =>
    job?.task?.locales?.[locale]?.desc ||
    job?.task?.locales?.en?.desc ||
    job?.task?.desc;

  return (
    <>
      <ImageView
        visible={modal}
        imageIndex={0}
        images={[photoFinish]}
        onRequestClose={() => setModal(false)}
      />
      <View style={[theme.flexGrow]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[theme.flexGrow]}>
          <View style={[styles.container]}>
            <View style={[theme.flexGrow]}>
              <View
                style={[
                  Layout.row,
                  Layout.justifyContentSpaceBetween,
                  Gutters.mediumBMargin,
                ]}>
                <View>
                  <Badge
                    text={job?.house?.houseName}
                    variant="purple"
                    containerStyle={Gutters.smallVMargin}
                  />
                  <Badge
                    label={t('common.date') + ': '}
                    text={moment(job?.date?.toDate()).format('LL')}
                  />
                </View>
                <Badge
                  text={job?.done ? t('job.finished') : t('job.not_finished')}
                  variant={job?.done ? 'success' : 'danger'}
                  containerStyle={Gutters.smallBMargin}
                />
              </View>
              <View style={[Layout.row, Layout.justifyContentSpaceBetween]}>
                <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
                  {taksDescByLocale(job)}
                </Text>
              </View>
              {job?.quadrantStartHour && job?.quadrantEndHour && (
                <View style={[theme.flexRow, theme.mB5]}>
                  <Badge
                    variant="successFilter"
                    text={moment(job?.quadrantStartHour.toDate()).format('LT')}
                  />
                  <View style={[theme.mL2]} />
                  <Badge
                    variant="successFilter"
                    text={moment(job?.quadrantEndHour.toDate()).format('LT')}
                  />
                </View>
              )}
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
              {user.role === 'admin' && (
                <View style={[Layout.grouw, Gutters.mediumTMargin, theme.mB5]}>
                  <Text style={{...defaultLabel, ...marginBottom(10)}}>
                    {t('common.asigned_to')}
                  </Text>
                  <View style={[Layout.row]}>
                    {job?.workers?.map((worker, i) => (
                      <View style={[theme.justifyCenter, theme.itemsCenter]}>
                        <Avatar
                          overlap={job?.workers?.length > 1}
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
                            theme.textGray600,
                            theme.textCenter,
                            theme.w12,
                          ]}>
                          {worker.firstName} {worker.secondName}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {user.role === 'admin' && job.done && (
                <View>
                  <Text>
                    Hora de finalización:{' '}
                    <Text style={[theme.fontSansBold]}>
                      {moment(job?.photoFinishDate?.toDate()).format('LT')}h
                    </Text>
                  </Text>
                  <TouchableOpacity onPress={() => setModal(true)}>
                    <FastImage
                      style={styles.houseImage}
                      source={{
                        uri: job?.photoFinish,
                        priority: FastImage.priority.normal,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <View style={[theme.flexGrow, theme.justifyEnd, theme.mB10]}>
                <FastImage
                  style={styles.houseImage}
                  source={{
                    uri: job?.house && job?.house?.houseImage?.original,
                    priority: FastImage.priority.normal,
                  }}
                />
                <Badge
                  label={t('houses.house_municipality') + ': '}
                  text={job?.house?.municipio}
                  containerStyle={Gutters.smallBMargin}
                />
                <Badge
                  label={t('houses.house_street') + ': '}
                  text={job?.house?.street}
                  variant="warning"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default React.memo(Info);
