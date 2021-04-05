import React, {useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

// Redux
import {useSelector, shallowEqual} from 'react-redux';

//Firebase
import {useGetFirebase} from '../../hooks/useGetFirebase';
import {useGetDocFirebase} from '../../hooks/useGetDocFIrebase';
import {useUpdateFirebase} from '../../hooks/useUpdateFirebase';

// UI
import PagetLayout from '../../components/PageLayout';
import CheckBox from '@react-native-community/checkbox';

// styles
import {defaultLabel} from '../../styles/common';

// utils
import {format} from 'date-fns';
import moment from 'moment';
import Avatar from '../../components/Avatar';
import TextWrapper from '../../components/TextWrapper';

const styles = StyleSheet.create({
  checklistContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 50,
    marginTop: 10,
    // height: '100%',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dadada',
  },
  observationsStyle: {
    fontSize: 15,
  },
  avatarWrapper: {
    flex: 1,
  },
  labelWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoWrapper: {
    flex: 6,
    marginLeft: 10,
  },
  name: {
    fontSize: 15,
  },
  dateStyle: {
    color: '#2A7BA5',
  },
  date: {
    fontSize: 18,
    marginBottom: 20,
    marginVertical: 10,
    color: '#3DB6BA',
  },
  counter: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const CheckItem = ({check, handleCheck}) => {
  return (
    <View style={styles.container}>
      {check?.worker && <Avatar uri={check?.worker?.profileImage} size="big" />}
      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{check.title}</Text>
        {check?.date && (
          <Text style={styles.dateStyle}>
            {moment(check?.date).format('LL')}
          </Text>
        )}
      </View>
      <View style={styles.checkboxWrapper}>
        <CheckBox
          disabled={false}
          value={check.done}
          onValueChange={() => handleCheck()}
        />
      </View>
    </View>
  );
};

const CheckScreen = ({route, navigation}) => {
  const {checkId} = route.params;
  console.log(checkId);
  const {document: checklist} = useGetDocFirebase('checklists', checkId);
  const {list: checks} = useGetFirebase(`checklists/${checkId}/checks`);

  const {user} = useSelector(
    ({userLoggedIn: {user}}) => ({user}),
    shallowEqual,
  );

  const {updateFirebase} = useUpdateFirebase('checklists');

  const renderItem = ({item}) => (
    <CheckItem
      key={item.id}
      check={item}
      handleCheck={() => handleCheck(checklist, item, !item.done)}
    />
  );

  const handleCheck = async (checklist, check, state) => {
    try {
      await updateFirebase(`${checklist.id}`, {
        ...checklist,
        done: state ? checklist.done + 1 : checklist.done - 1,
      });
      await updateFirebase(`${checklist.id}/checks/${check.id}`, {
        ...check,
        date: !state ? null : new Date(),
        done: state,
        worker: state ? user : null,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <PagetLayout
      backButton
      titleProps={{
        subPage: true,
        title: `Check list en ${
          checklist?.house && checklist?.house[0]?.houseName
        }`,
        color: 'white',
      }}>
      <View style={styles.checklistContainer}>
        <View style={{marginBottom: 20}}>
          <Text style={styles.date}>
            🕜 {moment(checklist?.date?.toDate()).format('LL')}
          </Text>
          <Text style={{...defaultLabel, marginBottom: 10}}>
            🕵️ Observaciones
          </Text>
          <TextWrapper>
            <Text style={styles.observationsStyle}>
              {checklist?.observations}
            </Text>
          </TextWrapper>
        </View>
        <View style={styles.labelWrapper}>
          <Text style={{...defaultLabel}}>✅ Listado de checks</Text>
          <Text style={styles.counter}>
            {checklist.done}/{checklist.total}
          </Text>
        </View>
        <FlatList
          data={checks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </PagetLayout>
  );
};

export default CheckScreen;
