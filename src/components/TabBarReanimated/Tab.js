import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const Tab = ({onLayout, title, handleTab, index}) => {
  return (
    <View style={styles.tab} onLayout={onLayout}>
      <TouchableOpacity onPress={() => handleTab(index)}>
        <Text style={styles.tabTitle}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    alignSelf: 'stretch',
  },
  tabTitle: {
    fontWeight: 'bold',
  },
});

export default Tab;
