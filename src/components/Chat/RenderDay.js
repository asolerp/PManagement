import moment from 'moment';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  textStyle: {
    color: '#969696',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
  },
});

const RenderDay = ({message}) => {
  return (
    <View style={message.containerStyle}>
      <Text style={styles.textStyle}>
        {`${moment(message?.currentMessage?.createdAt.toDate()).format('LL')}`}
      </Text>
    </View>
  );
};

export default RenderDay;
