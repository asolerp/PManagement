import React from 'react';
import {Dimensions} from 'react-native';
import {View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useTheme} from '../../Theme';

const ItemList = () => {
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
            width={360}
            height={40}
            borderRadius={10}
            marginRight={20}
          />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="flex-start"
          alignContent="center"
          marginBottom={20}>
          <SkeletonPlaceholder.Item
            width={360}
            height={40}
            borderRadius={10}
            marginRight={20}
          />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="flex-start"
          alignContent="center"
          marginBottom={20}>
          <SkeletonPlaceholder.Item
            width={360}
            height={40}
            borderRadius={10}
            marginRight={20}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default ItemList;
