import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity
} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';

// UI
import PageLayout from '../../components/PageLayout';

// Utils
import moment from 'moment';
import { useTheme } from '../../Theme';

import { Colors } from '../../Theme/Variables';

import { useSelector } from 'react-redux';
import { userSelector } from '../../Store/User/userSlice';
import { useGetHouseById } from './hooks/useGetHouseById';
import theme from '../../Theme/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/Elements/Badge';
import { OwnerChecks } from '../../components/Check/OwnerChecks';
import FastImage from 'react-native-fast-image';
import { openScreenWithPush } from '../../Router/utils/actions';
import {
  TIME_TRACKING_SCREEN_KEY,
  ENTRANCES_MANAGER_SCREEN_KEY
} from '../../Router/utils/routerKeys';

const DEFAULT_BACKGROUND_IMAGE =
  'https://res.cloudinary.com/enalbis/image/upload/v1663600847/PortManagement/varios/w0n2hq4uhhgjdrlhlnns.jpg';

const DashboardOwner = () => {
  const { Layout } = useTheme();

  const user = useSelector(userSelector);
  const [date] = React.useState(moment(new Date()).format('LL').split(' '));
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  const { house, checklist, checksFromChecklist } = useGetHouseById(user?.id);

  return (
    <>
      <PageLayout
        statusBar="light-content"
        withTitle={false}
        withPadding={false}
      >
        {/* <ActionButtons /> */}
        <ScrollView style={Layout.grow} showsVerticalScrollIndicator={false}>
          <ImageBackground
            imageStyle={[styles.profileImageContainerStyle]}
            source={{
              uri: house?.houseImage?.original || DEFAULT_BACKGROUND_IMAGE
            }}
            style={styles.profileBarContainerStyle}
          >
            <SafeAreaView edges={['top']} style={theme.flexGrow}>
              <View style={[theme.flexRow, theme.justifyCenter]}>
                <Image
                  source={require('../../assets/images/logo_pm_servicios.png')}
                  style={{ height: 30, resizeMode: 'contain' }}
                />
              </View>
              <View>
                <ProfileBar role="owner" />
              </View>
              <View
                style={[theme.flexGrow, theme.justifyEnd, theme.mB3, theme.pX8]}
              />
            </SafeAreaView>
          </ImageBackground>

          {/* Time Tracking Button */}
          <View style={theme.p4}>
            <TouchableOpacity
              style={styles.timeTrackingButton}
              onPress={() => openScreenWithPush(TIME_TRACKING_SCREEN_KEY)}
            >
              <View style={[theme.flexRow, theme.itemsCenter]}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>📊</Text>
                </View>
                <View style={theme.flex1}>
                  <Text style={[theme.fontSansBold, theme.textBase]}>
                    Registro de Jornada
                  </Text>
                  <Text style={[theme.textGray600, theme.textSm]}>
                    Ver fichajes y exportar registros
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Entrances Manager Button */}
          <View style={[theme.pX4, theme.pB4]}>
            <TouchableOpacity
              style={styles.timeTrackingButton}
              onPress={() => openScreenWithPush(ENTRANCES_MANAGER_SCREEN_KEY)}
            >
              <View style={[theme.flexRow, theme.itemsCenter]}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>📍</Text>
                </View>
                <View style={theme.flex1}>
                  <Text style={[theme.fontSansBold, theme.textBase]}>
                    Entradas y Salidas
                  </Text>
                  <Text style={[theme.textGray600, theme.textSm]}>
                    Ver registro de entradas y salidas de trabajadores
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {checklist?.finished ? (
            <View style={theme.p4}>
              <Text style={[theme.fontSansNormal, theme.textXl]}>
                Last report
              </Text>
              <View style={theme.mT4}>
                <View
                  style={[theme.flexRow, theme.flexWrap, theme.itemsCenter]}
                >
                  <Text style={theme.mR1}>We checked on</Text>
                  <Badge
                    text={moment(checklist?.date?.toDate()).format('LL')}
                  />
                  <Text style={theme.mY1}>
                    the functioning and state of your Villa located in{' '}
                  </Text>
                  <Badge text={house?.street} variant="purple" />
                </View>
              </View>
              <OwnerChecks
                checklist={checklist}
                checksFromChecklist={checksFromChecklist}
              />
            </View>
          ) : (
            <View style={theme.p4}>
              <Text style={[theme.fontSansNormal, theme.textXl]}>
                Working on your Villa
              </Text>
              <View style={theme.mB4} />
              <Text style={theme.mY1}>
                We are currently working on your Villa. We will inform you when
                we finish the report.
              </Text>
              <FastImage
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/port-management-9bd53.appspot.com/o/other%2Fworking.png?alt=media&token=71271f2f-5d48-414b-ab17-9931abff842a',
                  priority: FastImage.priority.normal
                }}
                style={{ width: '100%', height: 300 }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          )}
        </ScrollView>
      </PageLayout>
    </>
  );
};

const styles = StyleSheet.create({
  arrow: {
    color: Colors.gray400,
    fontSize: 32,
    fontWeight: '300'
  },
  container: {
    paddingHorizontal: 0
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.pm + '20',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48
  },
  iconText: {
    fontSize: 24
  },
  indicatorStyle: {
    backgroundColor: Colors.pm,
    borderRadius: 5,
    height: 5
  },
  profileBarContainerStyle: {
    backgroundColor: Colors.pm,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: 200
  },
  profileImageContainerStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  tabBarContainerStyle: {
    backgroundColor: null
  },
  tabTextStyle: {
    fontWeight: '500'
  },
  timeTrackingButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  }
});

export default DashboardOwner;
