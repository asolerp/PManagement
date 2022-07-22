import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
export const HousesSkeleton = () => {
  return (
    <SkeletonPlaceholder>
      <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
        <SkeletonPlaceholder.Item
          width={60}
          height={60}
          borderRadius={50}
          marginRight={10}
        />
        <SkeletonPlaceholder.Item
          width={60}
          height={60}
          borderRadius={50}
          marginRight={10}
        />
        <SkeletonPlaceholder.Item
          width={60}
          height={60}
          borderRadius={50}
          marginRight={10}
        />
        <SkeletonPlaceholder.Item
          width={60}
          height={60}
          borderRadius={50}
          marginRight={10}
        />
        <SkeletonPlaceholder.Item
          width={60}
          height={60}
          borderRadius={50}
          marginRight={10}
        />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
