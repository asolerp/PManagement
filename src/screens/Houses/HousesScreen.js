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
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';

import {useGetFirebase} from '../../hooks/useGetFirebase';
import {openScreenWithPush} from '../../Router/utils/actions';
import {
  HOUSE_SCREEN_KEY,
  NEW_HOUSE_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {useTheme} from '../../Theme';

const HousesScreen = () => {
  const {t} = useTranslation();
  const {list: houses} = useGetFirebase('houses');
  const {Gutters, Layout} = useTheme();

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
      <PageLayout safe titleLefSide={true}>
        <AddButton
          iconName="add"
          onPress={() => handleNewHome()}
          containerStyle={{right: 0, bottom: 30}}
        />
        <View style={styles.container}>
          <ScreenHeader title={t('houses.title')} />
          <View style={styles.homesScreen}>
            {houses ? (
              <>
                <FlatList
                  data={houses}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    Layout.flexGrow,
                    Layout.alignItemsCenter,
                  ]}
                />
              </>
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
    paddingTop: 20,
  },
  scrollWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HousesScreen;
