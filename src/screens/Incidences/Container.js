import React, {useState} from 'react';
import {View, Text, FlatList, TouchableWithoutFeedback} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import IncidenceItem from '../../components/Items/IncidenceItem';
import ItemListSkeleton from '../../components/Skeleton/ItemListSkeleton';
import {useTheme} from '../../Theme';
import sortByDate from '../../utils/sorts';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

import {openScreenWithPush} from '../../Router/utils/actions';
import {INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';
import {parseTimeFilter} from '../../utils/parsers';
import CustomModal from '../../components/Modal';
import Filters from '../../components/Filters/Filters';
import {useTranslation} from 'react-i18next';

const Container = () => {
  const {t} = useTranslation();
  const [visibleModal, setVisibleModal] = useState();
  const [filters, setFilters] = useState({
    time: parseTimeFilter('all'),
    state: false,
  });
  const {Gutters, Layout, Fonts} = useTheme();

  const user = useSelector(userSelector);

  let firebaseQuery;

  if (user.role === 'admin') {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', filters.state)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  } else {
    firebaseQuery = firestore()
      .collection('incidences')
      .where('done', '==', filters.state)
      .where('workersId', 'array-contains', user.uid)
      .where('date', '>', new Date(filters.time.start))
      .where('date', '<', new Date(filters.time.end));
  }

  const [values, loading] = useCollectionData(firebaseQuery, {
    idField: 'id',
  });

  const incidencesList = values
    ?.filter((item) => item.id !== 'stats')
    ?.filter((incidence) =>
      filters?.houses?.length > 0
        ? filters?.houses.includes(incidence.houseId)
        : true,
    )
    ?.sort((a, b) => sortByDate(a, b, 'asc'));

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(INCIDENCE_SCREEN_KEY, {
        incidenceId: item.id,
      });
    };
    return <IncidenceItem incidence={item} onPress={handlePressIncidence} />;
  };

  return (
    <View style={[Layout.fill, Gutters.mediumTMargin]}>
      <CustomModal
        visible={visibleModal}
        setVisible={setVisibleModal}
        size={0.6}>
        <Filters
          activeFilters={{
            houses: true,
            workers: false,
            time: true,
            state: true,
          }}
          initialFilters={filters}
          onSaveFilters={(f) => {
            setFilters(f);
            setVisibleModal(false);
          }}
        />
      </CustomModal>

      {loading ? (
        <ItemListSkeleton />
      ) : (
        <View style={[Layout.fill]}>
          <TouchableWithoutFeedback onPress={() => setVisibleModal(true)}>
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Gutters.tinyBMargin,
                {width: 70},
              ]}>
              <Icon name="filter-alt" size={20} />
              <Text style={Fonts.textSmall}>{t('common.filters.title')}</Text>
            </View>
          </TouchableWithoutFeedback>
          {incidencesList?.length > 0 ? (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={incidencesList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View
              style={[
                Layout.fill,
                Layout.rowCenter,
                Layout.justifyContentCenter,
                Layout.alignItemsCenter,
              ]}>
              <Text style={[Fonts.textSmall, {textAlign: 'center'}]}>
                {t('incidences.no_found')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Container;
