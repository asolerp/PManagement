import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SectionList,
} from 'react-native';

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
import Badge from '../../components/Elements/Badge';
import {HDivider} from '../../components/UI/HDivider';

const Container = () => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useCollectionData(firestore().collection('users'), {
    idField: 'id',
  });

  const DATA = [
    {
      title: parseRoleName('admin'),
      data: users?.filter((user) => user.role === 'admin'),
    },
    {
      title: parseRoleName('owner'),
      data: users?.filter((user) => user.role === 'owner'),
    },
    {
      title: parseRoleName('worker'),
      data: users?.filter((user) => user.role === 'worker'),
    },
  ];

  const renderItem = ({item}) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    if (
      searchQuery.length > 0 &&
      !fullName.toLowerCase().includes(searchQuery?.toLowerCase())
    ) {
      return null; // If it doesn't match the search, don't render the item
    }

    return (
      <>
        <Pressable
          key={item.id}
          onPress={() => {
            openScreenWithPush(PROFILE_SCREEN_KEY, {
              user: item,
              mode: 'admin',
            });
          }}>
          <View
            style={[
              theme.flexRow,
              theme.itemsCenter,
              Gutters.tinyRMargin,
              Gutters.tinyBMargin,
              styles.userContainer,
            ]}>
            <Avatar
              key={item.id}
              uri={item.profileImage?.small || DEFAULT_IMAGE}
              size="big"
            />
            <View style={[theme.mL2]}>
              <View
                style={[
                  theme.flexRow,
                  theme.flexWrap,
                  theme.itemsCenter,
                  theme.justifyBetween,
                  theme.mB2,
                ]}>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  style={[theme.textBlack, theme.mR2]}>
                  {item.firstName} {item.lastName}
                </Text>
                {item?.phone && <Badge text={item.phone} variant="pm" />}
              </View>
              <View style={[theme.flexCol]}>
                <Badge text={item.email} variant="purple" />
                { item.aditionalEmail && (
                  <>
                  <View style={[theme.pB1]} />
                  <Badge text={item.aditionalEmail} variant="warning" />
                  </>
                )
                }
              </View>
            </View>
          </View>
        </Pressable>
        <HDivider />
      </>
    );
  };

  return (
    <>
      <ScreenHeader title={t('users.title')} />
      <SearchBar
        round={true}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.inputContainer}
        placeholder={t('common.search_name')}
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      {users && (
        <View style={[theme.flex1]}>
          <SectionList
            sections={DATA}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item + index}
            renderItem={renderItem}
            renderSectionHeader={({section: {title}}) => (
              <View
                style={[
                  styles.titleContainer,
                  Gutters.tinyVPadding,
                  Gutters.tinyHPadding,
                  theme.mB3,
                ]}>
                <Text style={[Fonts.textTitle, {color: Colors.white}]}>
                  {t(title)}
                </Text>
              </View>
            )}
          />
          {/* <ScrollView showsVerticalScrollIndicator={false}>
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
                    <View style={[Layout.col, Gutters.smallVMargin]}>
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
                              theme.flexRow,
                              theme.itemsCenter,
                              Gutters.tinyRMargin,
                              Gutters.tinyBMargin,
                              styles.userContainer,
                            ]}>
                            <Avatar
                              key={user.id}
                              uri={user.profileImage?.small || DEFAULT_IMAGE}
                              size="big"
                            />
                            <View style={[theme.mL2]}>
                              <View
                                style={[
                                  theme.flexRow,
                                  theme.itemsCenter,
                                  theme.justifyBetween,
                                  theme.mB2,
                                ]}>
                                <Text
                                  ellipsizeMode="tail"
                                  numberOfLines={2}
                                  style={[theme.textBlack, theme.mR4]}>
                                  {user.firstName} {user.lastName}
                                </Text>
                                {user?.phone && (
                                  <Badge text={user.phone} variant="pm" />
                                )}
                              </View>
                              <View style={[theme.flexRow]}>
                                <Badge text={user.email} variant="purple" />
                                <View style={[theme.w3]} />
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
          </View>
        </ScrollView> */}
        </View>
      )}
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
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});

export default Container;
