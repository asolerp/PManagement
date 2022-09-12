import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';

import {SearchBar} from 'react-native-elements';

import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import Avatar from '../../components/Avatar';
import {parseRoleName} from './utils/parsers';
import {useTranslation} from 'react-i18next';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {openScreenWithPush} from '../../Router/utils/actions';
import {PROFILE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {DEFAULT_IMAGE} from '../../constants/general';
import theme from '../../Theme/Theme';

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
      <View style={[theme.flex1]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[Gutters.tinyTMargin]}>
            {users &&
              Object.entries(groupedUsersByRole)
                .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
                .map(([key, users]) => (
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
                    <View
                      style={[Layout.row, Layout.wrap, Gutters.smallVMargin]}>
                      {users?.map((user) => (
                        <Pressable
                          key={user.id}
                          onPress={() => {
                            openScreenWithPush(PROFILE_SCREEN_KEY, {
                              user,
                              mode: 'admin',
                            });
                          }}>
                          <View
                            style={[
                              Layout.colCenter,
                              Gutters.tinyRMargin,
                              Gutters.tinyBMargin,
                              styles.userContainer,
                            ]}>
                            <Avatar
                              key={user.id}
                              uri={user.profileImage?.small || DEFAULT_IMAGE}
                              size="big"
                            />
                            <Text>{user.firstName}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
          </View>
        </ScrollView>
      </View>
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
