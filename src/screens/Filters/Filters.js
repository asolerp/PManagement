import React, {useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import HouseFilter from '../../components/Filters/HouseFilter';
import StatusIncidence from '../../components/Filters/StatusIncidence';
import TimeFilter from '../../components/Filters/TimeFilter';
import WorkersFilter from '../../components/Filters/WorkeresFilter';

import {userSelector} from '../../Store/User/userSlice';
import {useTheme} from '../../Theme';
import {parseTimeFilter} from '../../utils/parsers';

const Filters = ({onSaveFilters}) => {
  const user = useSelector(userSelector);
  const {Layout, Gutters} = useTheme();

  const [filterWorkers, setFilterWorkers] = useState();
  const [timeFilter, setTimeFilter] = useState(parseTimeFilter('all'));
  const [filterHouses, setFilterHouses] = useState();
  const [state, setState] = useState();

  return (
    <View style={[user.role !== 'admin' && Gutters.mediumTMargin]}>
      <View style={[Gutters.tinyTMargin, Gutters.smallBMargin]}>
        {user.role === 'admin' && (
          <WorkersFilter
            workers={filterWorkers}
            onClickWorker={setFilterWorkers}
          />
        )}
        <TimeFilter
          onChangeFilter={setTimeFilter}
          state={timeFilter}
          withAll={true}
        />
        <HouseFilter houses={filterHouses} onClickHouse={setFilterHouses} />
        <StatusIncidence onChangeFilter={setState} state={state} />
      </View>
    </View>
  );
};

export default Filters;
