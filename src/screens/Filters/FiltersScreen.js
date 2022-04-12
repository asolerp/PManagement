import React, {useContext, useState} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {useSelector} from 'react-redux';
import HouseFilter from '../../components/Filters/HouseFilter';
import StatusJob from '../../components/Filters/StatusJob';
import StatusIncidence from '../../components/Filters/StatusIncidence';
import StatusChecklist from '../../components/Filters/StatusChecklist';
import TimeFilter from '../../components/Filters/TimeFilter';
import WorkersFilter from '../../components/Filters/WorkeresFilter';

import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';

import CustomButton from '../../components/Elements/CustomButton';

import {Colors} from '../../Theme/Variables';
import {parseTimeFilter} from '../../utils/parsers';
import {useTranslation} from 'react-i18next';
import {JobTypeFilter} from '../../components/Filters/JobTypeFilter';
import {ScrollView} from 'react-native-gesture-handler';
import {FiltersContext} from '../../context/FiltersContext';
import PageLayout from '../../components/PageLayout';
import {HDivider} from '../../components/UI/HDivider';

import Icon from 'react-native-vector-icons/Ionicons';
import {popScreen} from '../../Router/utils/actions';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

const activeFilters = {
  houses: true,
  workers: true,
  time: true,
  state: true,
  checklistState: true,
  type: [],
};

const FiltersScreen = () => {
  const {filters, setFilters} = useContext(FiltersContext);

  const user = useSelector(userSelector);
  const {t} = useTranslation();
  const {Layout, Fonts, Gutters} = useTheme();

  const [filterWorkers, setFilterWorkers] = useState(filters.workers);
  const [timeFilter, setTimeFilter] = useState(filters.time);
  const [jobType, setJobType] = useState(filters.type);
  const [filterHouses, setFilterHouses] = useState(filters.houses);
  const [state, setState] = useState(filters.state);
  const [checklistState, setChecklistState] = useState(filters.checklistState);
  const [incidenceState, setIncidenceState] = useState(filters.incidenceState);

  const clearFilters = () => {
    setFilterWorkers(null);
    setTimeFilter(parseTimeFilter('all'));
    setFilterHouses(null);
    setState(false);
    setJobType(['jobs', 'incidences', 'checklists']);
    setIncidenceState(null);
    setChecklistState(false);
  };

  return (
    <PageLayout
      safe
      edges={['bottom']}
      footer={
        <View>
          <HDivider />
          <TouchableWithoutFeedback
            onPress={() => {
              clearFilters();
            }}>
            <Text
              style={[
                Gutters.smallBMargin,
                {textAlign: 'center', color: Colors.pm},
              ]}>
              {t('common.clean')}
            </Text>
          </TouchableWithoutFeedback>
          <CustomButton
            styled="rounded"
            loading={false}
            title={t('common.apply')}
            onPress={() => {
              setFilters({
                type: jobType,
                workers: filterWorkers,
                time: timeFilter,
                houses: filterHouses,
                checklistState,
                incidenceState,
                state,
              });
              popScreen();
            }}
          />
        </View>
      }>
      <View
        style={[
          Layout.row,
          Layout.justifyContentSpaceBetween,
          Layout.alignItemsCenter,
          Gutters.regularBMargin,
        ]}>
        <ScreenHeader title="Filtros" />
        <TouchableWithoutFeedback
          onPress={() => {
            popScreen();
          }}>
          <View>
            <Icon name="close" size={25} />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[Layout.grow]}>
        <React.Fragment>
          <View style={[Layout.fill]}>
            <View style={[Gutters.mediumBMargin]}>
              <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>Tipo</Text>
              <JobTypeFilter state={jobType} onChangeFilter={setJobType} />
            </View>
            {activeFilters.workers && (
              <View style={[Gutters.mediumBMargin]}>
                {user.role === 'admin' && (
                  <React.Fragment>
                    <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>
                      {t('common.workers')}
                    </Text>
                    <WorkersFilter
                      workers={filterWorkers}
                      onClickWorker={setFilterWorkers}
                    />
                  </React.Fragment>
                )}
              </View>
            )}
            {activeFilters.time && (
              <View style={[Gutters.mediumBMargin]}>
                <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
                  {t('common.filters.range_time')}
                </Text>
                <TimeFilter
                  onChangeFilter={setTimeFilter}
                  state={timeFilter}
                  withAll={true}
                />
              </View>
            )}
            {activeFilters.houses && (
              <View style={[Gutters.mediumBMargin]}>
                <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
                  {t('common.houses')}
                </Text>
                <HouseFilter
                  houses={filterHouses}
                  onClickHouse={setFilterHouses}
                />
              </View>
            )}
            {jobType.some((t) => t === 'jobs') && (
              <View style={[Gutters.mediumBMargin]}>
                <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
                  Estado del trabajo
                </Text>
                <StatusJob onChangeFilter={setState} state={state} />
              </View>
            )}
            {jobType.some((t) => t === 'checklists') && (
              <View style={[Gutters.mediumBMargin]}>
                <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
                  Estado del checklist
                </Text>
                <StatusChecklist
                  onChangeFilter={setChecklistState}
                  checklistState={checklistState}
                />
              </View>
            )}
            {jobType.some((t) => t === 'incidences') && (
              <View style={[Gutters.mediumBMargin]}>
                <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
                  Estado de la incidencia
                </Text>
                <StatusIncidence
                  onChangeFilter={setIncidenceState}
                  state={incidenceState}
                />
              </View>
            )}
          </View>
        </React.Fragment>
      </ScrollView>
    </PageLayout>
  );
};

export default FiltersScreen;
