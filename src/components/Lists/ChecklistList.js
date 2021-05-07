import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {defaultLabel, width} from '../../styles/common';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

// Utils

import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import {parseDateWithText} from '../../utils/parsers';

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 150,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: Colors.white,
    marginBottom: 10,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
    fontWeight: '500',
    color: Colors.white,
    height: 60,
  },
  bold: {
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: Colors.white,
  },
  buble: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 20,
  },
  badget: {
    backgroundColor: Colors.success,
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ChecklistList = () => {
  const {Gutters, Layout, Fonts} = useTheme();
  const {list, loading} = useGetFirebase('checklists', null, [
    {
      label: 'finished',
      operator: '==',
      condition: false,
    },
  ]);

  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Check', {
        checkId: item.id,
      });
    };

    return (
      <TouchableOpacity
        style={[styles.incidenceWrapper, Gutters.mediumRMargin]}
        onPress={() => handlePressIncidence()}>
        <View style={[Layout.fill]}>
          <View
            style={[
              Layout.rowCenter,
              Layout.justifyContentStart,
              Gutters.smallBMargin,
            ]}>
            <Text style={styles.date}>🕜 {parseDateWithText(item?.date)}</Text>
          </View>
          <View style={styles.infoWrapper}>
            <Text style={[styles.bold, Gutters.smallBMargin]}>
              {item?.house?.[0].houseName}
            </Text>
            <Text
              style={styles.infoStyle}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {item?.observations}
            </Text>
          </View>
          <View
            style={[
              Layout.grow,
              Layout.justifyContentEnd,
              Layout.alignItemsEnd,
            ]}>
            <Text style={[Fonts.textWhite]}>
              {item?.done}/{item?.total}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Text>Cargando lista..</Text>;
  }

  if (list.length === 0) {
    return <Text>No hay ningun checklist</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={[Fonts.textTitle, Gutters.mediumRMargin]}>Checklists</Text>
        <View style={styles.badget}>
          <Text style={{...defaultLabel, ...{color: Colors.white}}}>
            {list.length}
          </Text>
        </View>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </React.Fragment>
  );
};

export default ChecklistList;
