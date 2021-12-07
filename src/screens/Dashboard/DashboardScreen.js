import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';

// Components
import ProfileBar from '../../components/ProfileBar';
import JobsList from '../../components/Lists/JobsList';
import IncidencesList from '../../components/Lists/IncidencesList';
import ChecklistList from '../../components/Lists/ChecklistList';

// UI
import PageLayout from '../../components/PageLayout';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ActionButton from 'react-native-action-button';

// Utils
import moment from 'moment';
import {useTheme} from '../../Theme';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  NEW_CHECKLIST_SCREEN,
  NEW_INCIDENCE_SCREEN_KEY,
  NEW_JOB_STACK_KEY,
  PROFILE_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {useTranslation} from 'react-i18next';
import Filters from '../../components/Filters/Filters';
import CustomModal from '../../components/Modal';
import {parseTimeFilter} from '../../utils/parsers';
import {Colors} from '../../Theme/Variables';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

const DashboardScreen = () => {
  const {t} = useTranslation();
  const {Layout, Gutters, Fonts} = useTheme();
  const [visibleModal, setVisibleModal] = useState();
  const user = useSelector(userSelector);
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
    type: ['jobs', 'incidences', 'checklists'],
  });
  const date = moment(new Date()).format('LL').split(' ');
  date[2] = date[2][0].toUpperCase() + date[2].slice(1);

  return (
    <PageLayout safe edges={['top']} withTitle={false}>
      <React.Fragment>
        <ActionButton
          buttonColor={Colors.danger}
          style={{zIndex: 10}}
          offsetX={0}>
          <ActionButton.Item
            buttonColor={Colors.rightGreen}
            onPress={() => openScreenWithPush(NEW_CHECKLIST_SCREEN)}>
            <Icon
              name="check"
              color={Colors.white}
              size={20}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor={Colors.warning}
            onPress={() => openScreenWithPush(NEW_INCIDENCE_SCREEN_KEY)}>
            <Icon
              name="warning"
              color={Colors.white}
              size={20}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor={Colors.pm}
            onPress={() => openScreenWithPush(NEW_JOB_STACK_KEY)}>
            <Icon
              name="construction"
              color={Colors.white}
              size={20}
              style={styles.actionButtonIcon}
            />
          </ActionButton.Item>
        </ActionButton>
        <ScrollView
          style={[Layout.fill, styles.container]}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          <ProfileBar onPress={() => openScreenWithPush(PROFILE_SCREEN_KEY)} />
          <View style={[Gutters.mediumBMargin]}>
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Layout.justifyContentSpaceBetween,
              ]}>
              <View>
                <Text style={[Fonts.textRegular, {color: Colors.pm}]}>
                  Hola {user.firstName || '' + '.'}
                </Text>
                <Text
                  style={[Fonts.textRegular, {width: 200, fontWeight: '400'}]}>
                  Estas son tus tareas en el día de hoy
                </Text>
              </View>
              <TouchableWithoutFeedback onPress={() => setVisibleModal(true)}>
                <View style={[Layout.row, Layout.alignItemsCenter]}>
                  <Icon
                    name="filter-alt"
                    size={15}
                    style={[Gutters.tinyRMargin]}
                  />
                  <Text style={[Fonts.textTitle]}>
                    {t('common.filters.title')}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={styles.home}>
            <CustomModal
              visible={visibleModal}
              swipeDirection={null}
              setVisible={setVisibleModal}
              onClose={() => setVisibleModal(false)}
              size={1}>
              <Filters
                activeFilters={{
                  houses: true,
                  workers: true,
                  time: true,
                  state: true,
                  type: [],
                }}
                initialFilters={filters}
                onSaveFilters={(f) => {
                  setFilters(f);
                  setVisibleModal(false);
                }}
              />
            </CustomModal>
            <View>
              {filters.type.some((t) => t === 'checklists') && (
                <ChecklistList
                  workers={filters?.workers}
                  houses={filters?.houses}
                  typeFilters={filters?.type}
                  time={filters?.time}
                />
              )}
              {filters.type.some((t) => t === 'incidences') && (
                <IncidencesList
                  workers={filters?.workers}
                  houses={filters?.houses}
                  state={filters?.incidenceState}
                  typeFilters={filters.type}
                  time={filters?.time}
                />
              )}
              {filters.type.some((t) => t === 'jobs') && (
                <JobsList
                  workers={filters?.workers}
                  houses={filters?.houses}
                  typeFilters={filters.type}
                  time={filters?.time}
                  state={filters?.state}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </React.Fragment>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {},
  home: {
    flex: 5,
  },
});

export default DashboardScreen;
