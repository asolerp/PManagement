import React from 'react';
import { View } from 'react-native';
import CustomSkeleton from './CustomSkeleton';
import { useTheme } from '../../Theme';

const ItemList = () => {
  const { Gutters } = useTheme();
  return (
    <View style={Gutters.regularVMargin}>
      <View style={{ marginBottom: 20 }}>
        <CustomSkeleton width={360} height={40} borderRadius={10} />
      </View>
      <View style={{ marginBottom: 20 }}>
        <CustomSkeleton width={360} height={40} borderRadius={10} />
      </View>
      <View style={{ marginBottom: 20 }}>
        <CustomSkeleton width={360} height={40} borderRadius={10} />
      </View>
    </View>
  );
};

export default ItemList;
