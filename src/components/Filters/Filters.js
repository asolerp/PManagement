import React, {useState} from 'react';
import {View, Text, TouchableWithoutFeedback} from 'react-native';
import {useSelector} from 'react-redux';
import HouseFilter from './HouseFilter';
import StatusIncidence from './StatusIncidence';
import TimeFilter from './TimeFilter';
import WorkersFilter from './WorkeresFilter';

import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';

import CustomButton from '../Elements/CustomButton';

import {Colors} from '../../Theme/Variables';
import {parseTimeFilter} from '../../utils/parsers';
import {useTranslation} from 'react-i18next';

const Filters = ({
  onClearFilters,
  onSaveFilters,
  initialFilters,
  activeFilters = {
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
  const [filterHouses, setFilterHouses] = useState(initialFilters.houses);
  const [state, setState] = useState(initialFilters.state);

  const clearFilters = () => {
    setFilterWorkers(null);
    setTimeFilter(parseTimeFilter('all'));
    setFilterHouses(null);
    setState(false);
  };

  return (
    <View
      style={[
        Gutters.mediumTMargin,
        Layout.fill,
        user.role !== 'admin' && Gutters.mediumTMargin,
      ]}>
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
          <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
        </View>
      )}
      {activeFilters.state && (
        <View style={[Gutters.mediumBMargin]}>
          <Text style={[Fonts.textTitle, Gutters.mediumBMargin]}>
            {t('common.state')}
          </Text>
          <StatusIncidence onChangeFilter={setState} state={state} />
        </View>
      )}
      <View
        style={[
          Layout.grow,
          Layout.justifyContentEnd,
          Gutters.regularBPadding,
        ]}>
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
          title={t('common.save')}
          onPress={() => {
            onSaveFilters({
              workers: filterWorkers,
              time: timeFilter,
              houses: filterHouses,
              state,
            });
          }}
        />
      </View>
    </View>
  );
};

export default Filters;
