import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import InfoIcon from './InfoIcon';
import Avatar from './Avatar';

import {DARK_BLUE, GREY, GREY_1, MEDIUM_GREY} from '../styles/colors';

// Utils
import {minimizetext, parseDateWithText} from '../utils/parsers';
import {marginBottom, marginRight, width} from '../styles/common';

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    borderWidth: 1,
    borderColor: GREY_1,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: GREY,
    marginBottom: 10,
  },
  rightWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
    color: DARK_BLUE,
  },
  bold: {
    fontWeight: '600',
    color: DARK_BLUE,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: MEDIUM_GREY,
  },
  buble: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
});

const BubleIncidence = ({status}) => {
  return (
    <View
      style={{
        ...styles.buble,
        backgroundColor: status ? '#7dd891' : '#ED7A7A',
      }}
    />
  );
};

const IncidencesList = ({list, loading}) => {
  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Incidence', {
        incidenceId: item.id,
      });
    };

    return (
      <TouchableOpacity
        style={{...styles.incidenceWrapper, ...marginRight(10)}}
        onPress={() => handlePressIncidence()}>
        <View style={{...width(100)}}>
          <View style={styles.titleWrapper}>
            <Text style={styles.date}>🕜 {parseDateWithText(item?.date)}</Text>
            <BubleIncidence />
          </View>
          <Text adjustsFontSizeToFit style={styles.title}>
            {item?.title}{' '}
          </Text>
          <View style={styles.infoWrapper}>
            <Text style={styles.infoStyle}>
              {minimizetext(item?.incidence)}
            </Text>
            <Text style={{...styles.bold, ...marginBottom(10)}}>
              {item?.house?.houseName}
            </Text>
            <View style={styles.avatarWrapper}>
              <Avatar key={item?.user?.id} uri={item?.user?.profileImage} />
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
