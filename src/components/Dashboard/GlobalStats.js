import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import {useGetGlobalStats} from './hooks/useGetGlobalStats';

export const GlobalStats = ({onPressStat, uid}) => {
  const {checks, incidences, jobs} = useGetGlobalStats({uid});
  const {Layout, Fonts, Gutters} = useTheme();
  return (
    <View
      style={[
        styles.statsContainerStyle,
        Layout.row,
        Layout.alignItemsCenter,
        Layout.justifyContentSpaceAround,
      ]}>
      <Pressable
        onPress={() => onPressStat(0)}
        style={[
          styles.statItemContainerStyle,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter,
        ]}>
        <Text
          style={[
            Fonts.textMd2,
            Fonts.textBold,
            Gutters.tinyBMargin,
            {color: Colors.black},
          ]}>
          {checks}
        </Text>
        <Text
          style={[
            styles.statItemTextStyle,
            Layout.justifyContentCenter,
            Layout.alignItemsCenter,
          ]}>
          Checklists
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onPressStat(1)}
        style={[
          styles.statItemContainerStyle,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter,
        ]}>
        <Text
          style={[
            Fonts.textMd2,
            Fonts.textBold,
            Gutters.tinyBMargin,
            {color: Colors.black},
          ]}>
          {incidences}
        </Text>
        <Text style={[styles.statItemTextStyle]}>Incidencias</Text>
      </Pressable>
      <Pressable
        onPress={() => onPressStat(2)}
        style={[
          styles.statItemContainerStyle,
          Layout.justifyContentCenter,
          Layout.alignItemsCenter,
        ]}>
        <Text
          style={[
            Fonts.textMd2,
            Fonts.textBold,
            Gutters.tinyBMargin,
            {color: Colors.black},
          ]}>
          {jobs}
        </Text>
        <Text style={[styles.statItemTextStyle]}>Trabajos</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  statItemContainerStyle: {},
  statItemTextStyle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: Colors.gray600,
  },
  statsContainerStyle: {
    paddingHorizontal: 5,
    marginTop: -30,
    marginBottom: 10,
    height: 70,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: '#4f4f4f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
