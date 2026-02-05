import React from 'react';
import {View} from 'react-native';
import CustomSkeleton from '../Skeleton/CustomSkeleton';

export const HousesSkeleton = () => {
  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <CustomSkeleton
        width={60}
        height={60}
        borderRadius={50}
        style={{marginRight: 10}}
      />
      <CustomSkeleton
        width={60}
        height={60}
        borderRadius={50}
        style={{marginRight: 10}}
      />
      <CustomSkeleton
        width={60}
        height={60}
        borderRadius={50}
        style={{marginRight: 10}}
      />
      <CustomSkeleton
        width={60}
        height={60}
        borderRadius={50}
        style={{marginRight: 10}}
      />
      <CustomSkeleton
        width={60}
        height={60}
        borderRadius={50}
        style={{marginRight: 10}}
      />
    </View>
  );
};
