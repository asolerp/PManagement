import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

// Utils
import CheckItem from './CheckItem';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../Theme';
import theme from '../../Theme/Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import { sortByFinished } from '../../utils/sorts';
import { openScreenWithPush } from '../../Router/utils/actions';
import {
  CHECK_SCREEN_KEY,
  CHECK_STACK_KEY
} from '../../Router/utils/routerKeys';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../Theme/Variables';
import {
  fetchChecklistsFinished,
  fetchChecklistsNotFinished
} from '../../Services/firebase/checklistServices';

const ChecklistList = ({ uid, house, houses }) => {
  const { Gutters } = useTheme();
  const { t } = useTranslation();
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState([]);

  const { data: checklistsNotFinished, isLoading: isLoadingNotFinished } =
    useQuery({
      queryKey: ['checklistsNotFinished', uid, house, limit || 5, houses],
      queryFn: fetchChecklistsNotFinished
    });
  const { data: checklistsFinished, isLoading: isLoadingFinished } = useQuery({
    queryKey: ['checklistsFinished', null, limit, houses],
    queryFn: fetchChecklistsFinished
  });

  useEffect(() => {
    if (checklistsFinished || checklistsNotFinished) {
      let result =
        houses && houses?.length > 0
          ? [...(checklistsNotFinished || []), ...(checklistsFinished || [])]
          : [...(checklistsNotFinished || [])];
      setData(result);
    }
  }, [checklistsFinished, checklistsNotFinished, houses]);

  useEffect(() => {
    setLimit(5);
  }, [houses]);

  const handleShowMore = () => {
    setLimit(prevLimit => prevLimit + 5);
  };

  const renderItem = ({ item }) => {
    const handlePressIncidence = () => {
      openScreenWithPush(CHECK_STACK_KEY, {
        screen: CHECK_SCREEN_KEY,
        docId: item.id
      });
    };

    return (
      <Pressable
        onPress={() => handlePressIncidence()}
        style={Gutters.tinyHMargin}
      >
        <CheckItem item={item} fullWidth />
      </Pressable>
    );
  };

  return (
    <View style={theme.flexGrow}>
      {isLoadingFinished || isLoadingNotFinished ? (
        <DashboardSectionSkeleton />
      ) : (
        <FlatList
          scrollEnabled={true}
          ListEmptyComponent={
            <Text style={theme.textBlack}>{t('checklists.empty')}</Text>
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity onPress={handleShowMore}>
              <Text
                style={[
                  { color: Colors.pm },
                  theme.fontSansBold,
                  theme.textCenter
                ]}
              >
                Show more
              </Text>
            </TouchableOpacity>
          }
          contentInset={{ bottom: 150 }}
          data={data && sortByFinished(data)}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={theme.mT3}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
};

export default ChecklistList;
