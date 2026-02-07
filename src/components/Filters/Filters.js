import React, {useState} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {useSelector} from 'react-redux';
import HouseFilter from './HouseFilter';
import StatusJob from './StatusJob';
import StatusIncidence from './StatusIncidence';
import StatusChecklist from './StatusChecklist';
import TimeFilter from './TimeFilter';
import WorkersFilter from './WorkeresFilter';

import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';

import CustomButton from '../Elements/CustomButton';

import {Colors} from '../../Theme/Variables';
import {parseTimeFilter} from '../../utils/parsers';
import {useTranslation} from 'react-i18next';
import {JobTypeFilter} from './JobTypeFilter';
import {ScrollView} from 'react-native-gesture-handler';

const Filters = ({
  onSaveFilters,
  initialFilters,
  activeFilters = {
    checklistState: true,
    houses: true,
    workers: true,
    state: true,
    time: true,
  },
}) => {
  const user = useSelector(userSelector);
  const {t} = useTranslation();
  const {Layout, Fonts, Gutters} = useTheme();

  const [filterWorkers, setFilterWorkers] = useState(initialFilters.workers);
  const [timeFilter, setTimeFilter] = useState(initialFilters.time);
  const [jobType, setJobType] = useState(initialFilters.type);
  const [filterHouses, setFilterHouses] = useState(initialFilters.houses);
  const [state, setState] = useState(initialFilters.state);
  const [checklistState, setChecklistState] = useState(
    initialFilters.checklistState,
  );
  const [incidenceState, setIncidenceState] = useState(
    initialFilters.incidenceState,
  );

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[Layout.grow]}
      style={[Gutters.mediumTMargin]}>
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
        <View style={[Gutters.smallBMargin]}>
          <TouchableWithoutFeedback
            onPress={() => {
              clearFilters();
            }}>
            <Text
              style={[
                Gutters.smallBMargin,
                {textAlign: 'center', color: Colors.primary},
              ]}>
              {t('common.clean')}
            </Text>
          </TouchableWithoutFeedback>
          <CustomButton
            styled="rounded"
            loading={false}
            title={t('common.save')}
            onPress={() => {
              onSaveFilters({
                type: jobType,
                workers: filterWorkers,
                time: timeFilter,
                houses: filterHouses,
                checklistState,
                incidenceState,
                state,
              });
            }}
          />
        </View>
      </React.Fragment>
    </ScrollView>
  );
};

export default Filters;
