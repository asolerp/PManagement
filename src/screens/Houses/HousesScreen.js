import React from 'react';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {useTranslation} from 'react-i18next';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';

// Firebase

import AddButton from '../../components/Elements/AddButton';
import HouseItemList from '../../components/HouseItemList';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import PageLayout from '../../components/PageLayout';
import firestore from '@react-native-firebase/firestore';

import {openScreenWithPush} from '../../Router/utils/actions';
import {
  HOUSE_SCREEN_KEY,
  NEW_HOUSE_SCREEN_KEY,
} from '../../Router/utils/routerKeys';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import { useQuery } from '@tanstack/react-query';
import { HOUSES } from '../../utils/firebaseKeys';
import { fetchHouses } from '../../Services/firebase/houseServices';


const HousesScreen = () => {
  const {t} = useTranslation();

  const { data: houses} = useQuery({queryKey: [HOUSES], queryFn: fetchHouses})
  const {Layout} = useTheme();

  console.log("[[HOUSES]]", houses)

  const handleNewHome = () => {
    openScreenWithPush(NEW_HOUSE_SCREEN_KEY);
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={[theme.wFull]}
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
      <PageLayout safe titleLefSide={true} edges={['top']}>
        <AddButton
          iconName="add"
          onPress={() => handleNewHome()}
          containerStyle={{right: 0, bottom: 30}}
        />
        <View style={styles.container}>
          <ScreenHeader title={t('houses.title')} />
          <View style={styles.homesScreen}>
            <FlatList
              data={houses}
              ListEmptyComponent={() => (
                <View style={[theme.wFull, theme.mT10]}>
                  <Text style={[theme.fontSans]}>
                    No hay creada ninguna casa. Crear tu primera casa para poder
                    empezar a asignar trabajos a tus trabajadores
                  </Text>
                </View>
              )}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                Layout.flexGrow,
                Layout.alignItemsCenter,
                theme.pB10,
              ]}
            />
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
