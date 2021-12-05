import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// Firebase

import AddButton from '../../components/Elements/AddButton';
import HouseItemList from '../../components/HouseItemList';
import PageLayout from '../../components/PageLayout';

import {useGetFirebase} from '../../hooks/useGetFirebase';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  HOUSE_SCREEN_KEY,
  NEW_HOUSE_SCREEN_KEY,
} from '../../Router/utils/routerKeys';

const HousesScreen = () => {
  const {t} = useTranslation();
  const {list: houses} = useGetFirebase('houses');

  const handleNewHome = () => {
    openScreenWithPush(NEW_HOUSE_SCREEN_KEY);
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={{width: '100%'}}
        onPress={() =>
          openScreenWithPush(HOUSE_SCREEN_KEY, {
            houseId: item.id,
          })
        }>
        <HouseItemList house={item} />
      </TouchableOpacity>
    );
  };

  return (
    <React.Fragment>
      <AddButton iconName="add" onPress={() => handleNewHome()} />
      <PageLayout
        safe
        edges={['top']}
        titleLefSide={true}
        titleProps={{
          leftSide: true,
          title: t('houses.title'),
          subPage: false,
        }}>
        <View style={styles.container}>
          <View style={styles.homesScreen}>
            {houses ? (
              <SafeAreaView style={{alignSelf: 'stretch'}}>
                <FlatList
                  data={houses}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                  }}
                />
              </SafeAreaView>
            ) : (
              <Text>{t('houses.no_found')}</Text>
            )}
          </View>
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
  },
  addButton: {
    position: 'absolute',
    right: 30,
    bottom: 40,
    zIndex: 10,
  },
  homesScreen: {
    flex: 10,
    paddingTop: 20,
  },
  scrollWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HousesScreen;
