import React from 'react';
import {View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useTheme} from '../../Theme';

const DashboardSectionSkeleton = () => {
  const {Gutters} = useTheme();
  return (
    <View style={[Gutters.regularVMargin]}>
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="flex-start"
          alignContent="center"
          marginBottom={20}>
          <SkeletonPlaceholder.Item
            width={60}
            height={20}
            borderRadius={20}
            marginRight={20}
          />
          <SkeletonPlaceholder.Item
            width={20}
            height={20}
            borderRadius={100}
            marginRight={20}
          />
        </SkeletonPlaceholder.Item>
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
