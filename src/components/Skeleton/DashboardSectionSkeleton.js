import React from 'react';
import {View} from 'react-native';
import CustomSkeleton from './CustomSkeleton';
import {useTheme} from '../../Theme';

const DashboardSectionSkeleton = () => {
  const {Gutters} = useTheme();
  return (
    <View style={[Gutters.regularVMargin]}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <CustomSkeleton
          width={200}
          height={150}
          borderRadius={20}
          style={{marginRight: 20}}
        />
        <CustomSkeleton
          width={200}
          height={150}
          borderRadius={20}
          style={{marginRight: 20}}
        />
      </View>
    </View>
  );
};

export default DashboardSectionSkeleton;
