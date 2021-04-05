import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InfoIcon from './InfoIcon';

// Utils
import {minimizetext, parseDateWithText} from '../utils/parsers';
import moment from 'moment';
const styles = StyleSheet.create({
  incidenceWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ddf2ff70',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  infoWrapper: {
    marginTop: 10,
  },
  rightWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  titleWrapper: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});

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
        style={styles.incidenceWrapper}
        onPress={() => handlePressIncidence()}>
        <View>
          <View style={styles.titleWrapper}>
            <Text style={{...styles.bold}}>🏡 {item?.house?.houseName}</Text>
          </View>
          <Text style={styles.title}>⚠️ {item?.title} </Text>
          <Text>{minimizetext(item?.incidence)}</Text>
          <View style={styles.infoWrapper}>
            <Text style={{marginRight: 10}}>
              <Text>👮‍♂️ Informador: </Text>
              <Text style={styles.bold}>{item?.user?.firstName}</Text>
            </Text>
          </View>
          <View style={{width: 110, marginTop: 10}}>
            <InfoIcon
              info={item.done ? 'Resuleta' : 'Sin resolver'}
              color={item.done ? '#7dd891' : '#ED7A7A'}
            />
          </View>
        </View>
        <View style={styles.rightWrapper}>
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 10,
              }}>
              🕜 {parseDateWithText(item?.date)}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <Icon name="keyboard-arrow-right" color="#454545" size={30} />
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
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </React.Fragment>
  );
};

export default IncidencesList;
