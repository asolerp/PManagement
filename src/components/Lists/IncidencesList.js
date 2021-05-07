import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import Avatar from '../Avatar';

import {
  defaultLabel,
  marginRight,
  width,
  marginBottom,
} from '../../styles/common';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';

// Utils
import {minimizetext, parseDateWithText} from '../../utils/parsers';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.danger,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 210,
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
    color: Colors.white,
    backgroundColor: Colors.danger,
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const IncidencesList = () => {
  const {Gutters, Layout} = useTheme();
  const {list, loading} = useGetFirebase('incidences', null, [
    {
      label: 'done',
      operator: '==',
      condition: false,
    },
  ]);

  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Incidence', {
        incidenceId: item.id,
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
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item?.title}{' '}
          </Text>
          <View style={styles.infoWrapper}>
            <Text style={styles.infoStyle} ellipsizeMode="tail">
              {item?.incidence}
            </Text>
            <Text style={[styles.bold, Gutters.regularBMargin]}>
              {item?.house?.houseName}
            </Text>
            <View style={styles.avatarWrapper}>
              <Avatar
                key={item?.user?.id}
                uri={item?.user?.profileImage}
                size="medium"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Text>Cargando lista..</Text>;
  }

  if (list.length === 0) {
    return <Text>No hay ninguna incidencia</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={{...defaultLabel, ...marginRight(10)}}>Incidencias</Text>
        <View style={styles.badget}>
          <Text style={{...defaultLabel, ...{color: 'white'}}}>
            {list.length}
          </Text>
        </View>
      </View>
      {list.length === 0 ? (
        <Text>No tienes incidencias en este estado</Text>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </React.Fragment>
  );
};

export default IncidencesList;
