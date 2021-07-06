import React from 'react';
import {View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useTheme} from '../../Theme';

const DashboardSectionSkeleton = () => {
  const {Gutters} = useTheme();
  return (
    <View style={[Gutters.regularVMargin]}>
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
          <SkeletonPlaceholder.Item
            width={200}
            height={150}
            borderRadius={20}
            marginRight={20}
          />
          <SkeletonPlaceholder.Item
            width={200}
            height={150}
            borderRadius={20}
            marginRight={20}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default DashboardSectionSkeleton;
