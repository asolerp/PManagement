import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import theme from '../../../Theme/Theme';
import Avatar from '../../../components/Avatar';
import { DEFAULT_IMAGE } from '../../../constants/general';
import { Logger } from '../../../lib/logging';

export const ListOfWorkers = ({ workers, onPressWorker }) => {
  const renderItem = ({ item }) => {
    Logger.debug('Rendering worker item', {workerId: item.id, workerName: item.firstName});
    return (
    <View style={theme.mX1}>
      <TouchableOpacity onPress={() => onPressWorker(item.id)}>
        <Avatar
          disabled={!item?.active}
          horizontal={true}
          uri={item?.profileImage?.small || DEFAULT_IMAGE}
          size="xl"
          name={item.firstName.split(' ')[0]}
        />
      </TouchableOpacity>
    </View>
    );
  };

  return (
    <View
      style={[
        theme.z50,
        theme.top40,
        theme.wFull,
        theme.flex,
        theme.justifyCenter,
        theme.absolute
      ]}
    >
      <FlatList
        horizontal
        data={workers}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        key={({ item }) => item.id}
        style={[theme.mX3, theme.roundedSm, theme.p2]}
      />
    </View>
  );
};
