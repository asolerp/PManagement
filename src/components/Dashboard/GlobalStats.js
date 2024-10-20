import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../Theme';
import { Colors } from '../../Theme/Variables';
import { useGetGlobalStats } from './hooks/useGetGlobalStats';

export const GlobalStats = ({ onPressStat, uid }) => {
  const { checks, incidences } = useGetGlobalStats({ uid });
  const { Layout, Fonts, Gutters } = useTheme();
  return (
    <View
      style={[
        styles.statsContainerStyle,
        Layout.row,
        Layout.alignItemsCenter,
        Layout.justifyContentSpaceAround
      ]}
    >
      <Pressable
        onPress={() => onPressStat(0)}
        style={[
          styles.statItemContainerStyle,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter
        ]}
      >
        <Text
          style={[
            Fonts.textMd2,
            Fonts.textBold,
            Gutters.tinyBMargin,
            { color: Colors.black }
          ]}
        >
          {checks || 0}
        </Text>
        <Text
          style={[
            styles.statItemTextStyle,
            Layout.justifyContentCenter,
            Layout.alignItemsCenter
          ]}
        >
          Checklists
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onPressStat(1)}
        style={[
          styles.statItemContainerStyle,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter
        ]}
      >
        <Text
          style={[
            Fonts.textMd2,
            Fonts.textBold,
            Gutters.tinyBMargin,
            { color: Colors.black }
          ]}
        >
          {incidences || 0}
        </Text>
        <Text style={styles.statItemTextStyle}>Incidencias</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  statItemContainerStyle: {},
  statItemTextStyle: {
    color: Colors.gray600,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  statsContainerStyle: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    elevation: 5,
    height: 70,
    marginBottom: 10,
    marginTop: -30,
    paddingHorizontal: 5,
    shadowColor: '#4f4f4f',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%'
  }
});
