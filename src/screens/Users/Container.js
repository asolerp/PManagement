import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SectionList } from 'react-native';

import { useTheme } from '../../Theme';
import { Colors } from '../../Theme/Variables';

import { SearchBar } from 'react-native-elements';

import firestore from '@react-native-firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Avatar from '../../components/Avatar';
import { parseRoleName } from './utils/parsers';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../../components/Layout/ScreenHeader';
import { openScreenWithPush } from '../../Router/utils/actions';
import { PROFILE_SCREEN_KEY } from '../../Router/utils/routerKeys';
import { DEFAULT_IMAGE } from '../../constants/general';
import theme from '../../Theme/Theme';
import Badge from '../../components/Elements/Badge';
import { HDivider } from '../../components/UI/HDivider';
import { Spacer } from '../../components/Elements/Spacer';

const Container = () => {
  const { Gutters, Fonts } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useCollectionData(firestore().collection('users'), {
    idField: 'id'
  });

  const DATA = [
    {
      title: parseRoleName('admin'),
      data: users
        ?.filter(user => user.role === 'admin')
        .sort((a, b) => {
          if (a.firstName < b.firstName) {
            return -1;
          }
          if (a.firstName > b.firstName) {
            return 1;
          }
          return 0;
        })
    },
    {
      title: parseRoleName('owner'),
      data: users
        ?.filter(user => user.role === 'owner')
        .sort((a, b) => {
          if (a.firstName < b.firstName) {
            return -1;
          }
          if (a.firstName > b.firstName) {
            return 1;
          }
          return 0;
        })
    },
    {
      title: parseRoleName('worker'),
      data: users
        ?.filter(user => user.role === 'worker')
        .sort((a, b) => {
          if (a.firstName < b.firstName) {
            return -1;
          }
          if (a.firstName > b.firstName) {
            return 1;
          }
          return 0;
        })
    }
  ];

  const renderItem = ({ item }) => {
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
              mode: 'admin'
            });
          }}
        >
          <View
            style={[
              theme.flexRow,
              theme.itemsCenter,
              Gutters.tinyRMargin,
              Gutters.tinyBMargin,
              styles.userContainer
            ]}
          >
            <Avatar
              key={item.id}
              uri={item.profileImage?.small || DEFAULT_IMAGE}
              size="big"
            />
            <View style={theme.mL2}>
              <View
                style={[
                  theme.flexRow,
                  theme.flexWrap,
                  theme.itemsCenter,
                  theme.justifyBetween,
                  theme.mB2
                ]}
              >
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  style={[theme.textBlack, theme.mR2]}
                >
                  {item.firstName} {item.lastName}
                </Text>
                {item?.phone && <Badge text={item.phone} variant="pm" />}
              </View>
              <View style={theme.flexCol}>
                <Badge text={item.email} variant="purple" />
                {item.aditionalEmail && (
                  <>
                    {item.aditionalEmail.split(',').map((email, index) => (
                      <>
                        <Spacer space={1} />
                        <Badge key={index} text={email} variant="warning" />
                      </>
                    ))}
                  </>
                )}
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
        <View style={theme.flex1}>
          <SectionList
            sections={DATA}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item + index}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={[
                  styles.titleContainer,
                  Gutters.tinyVPadding,
                  Gutters.tinyHPadding,
                  theme.mB3
                ]}
              >
                <Text style={[Fonts.textTitle, { color: Colors.white }]}>
                  {t(title)}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: 'white',
    borderColor: 'red'
  },
  searchBarContainer: {
    backgroundColor: 'white',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent'
  },
  titleContainer: {
    backgroundColor: Colors.pm,
    borderRadius: 5
  },
  userContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10
  }
});

export default Container;
