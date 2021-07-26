import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import HouseFilter from './HouseFilter';
import StatusIncidence from './StatusIncidence';
import TimeFilter from './TimeFilter';
import WorkersFilter from './WorkeresFilter';

import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';

import CustomButton from '../Elements/CustomButton';

const Filters = ({
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
  const {Layout, Fonts, Gutters} = useTheme();

  const [filterWorkers, setFilterWorkers] = useState(initialFilters.workers);
  const [timeFilter, setTimeFilter] = useState(initialFilters.time);
  const [filterHouses, setFilterHouses] = useState(initialFilters.houses);
  const [state, setState] = useState(initialFilters.state);

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
              <Text style={[Fonts.textTitle]}>Trabajadores</Text>
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
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>Cuando</Text>
          <TimeFilter
            onChangeFilter={setTimeFilter}
            state={timeFilter}
            withAll={true}
          />
        </View>
      )}
      {activeFilters.houses && (
        <View style={[Gutters.mediumBMargin]}>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>Casa</Text>
          <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
        </View>
      )}
      {activeFilters.state && (
        <View style={[Gutters.mediumBMargin]}>
          <Text style={[Fonts.textTitle, Gutters.smallBMargin]}>Estado</Text>
          <StatusIncidence onChangeFilter={setState} state={state} />
        </View>
      )}
      <View
        style={[
          Layout.grow,
          Layout.justifyContentEnd,
          Gutters.regularBPadding,
        ]}>
        <CustomButton
          styled="rounded"
          loading={false}
          title={'Guardar'}
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
