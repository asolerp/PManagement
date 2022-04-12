import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

import {SearchBar} from 'react-native-elements';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import Avatar from '../../components/Avatar';
import {parseRoleName} from './utils/parsers';
import {useTranslation} from 'react-i18next';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

const Container = () => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const [search, setSearch] = useState();
  const [users] = useCollectionData(firestore().collection('users'), {
    idField: 'id',
  });

  const groupedUsersByRole = search
    ? users
        ?.filter((user) =>
          user.firstName.toLowerCase().includes(search?.toLowerCase()),
        )
        ?.reduce(
          (acc, user) => ({
            ...acc,
            [user?.role]: acc?.[user?.role]
              ? acc?.[user?.role].concat([{...user}])
              : [{...user}],
          }),
          {},
        )
    : users?.reduce(
        (acc, user) => ({
          ...acc,
          [user?.role]: acc?.[user?.role]
            ? acc?.[user?.role].concat([{...user}])
            : [{...user}],
        }),
        {},
      );

  return (
    <>
      <ScreenHeader title={t('users.title')} />
      <SearchBar
        round={true}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.inputContainer}
        placeholder={t('common.search_name')}
        onChangeText={setSearch}
        value={search}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[Gutters.tinyTMargin]}>
          {users &&
            Object.entries(groupedUsersByRole).map(([key, users]) => (
              <View key={key}>
                <View
                  style={[
                    styles.titleContainer,
                    Gutters.tinyVPadding,
                    Gutters.tinyHPadding,
                  ]}>
                  <Text style={[Fonts.textTitle, {color: Colors.white}]}>
                    {t(parseRoleName(key))}
                  </Text>
                </View>
                <View style={[Layout.row, Layout.wrap, Gutters.smallVMargin]}>
                  {users?.map((user) => (
                    <View
                      key={user.id}
                      style={[
                        Layout.colCenter,
                        Gutters.tinyRMargin,
                        Gutters.tinyBMargin,
                        styles.userContainer,
                      ]}>
                      <Avatar
                        id={user.id}
                        key={user.id}
                        uri={user.profileImage}
                        size="big"
                      />
                      <Text>{user.firstName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    backgroundColor: 'white',
  },
  inputContainer: {
    borderColor: 'red',
    backgroundColor: 'white',
  },
  titleContainer: {
    backgroundColor: Colors.pm,
    borderRadius: 5,
  },
  userContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    padding: 10,
    borderColor: Colors.lowGrey,
    borderWidth: 1,
  },
});

export default Container;
