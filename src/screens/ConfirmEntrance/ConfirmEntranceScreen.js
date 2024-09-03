import React, { memo, useCallback } from 'react';
import CustomButton from '../../components/Elements/CustomButton';
import PageLayout from '../../components/PageLayout';
import { SearchBar } from 'react-native-elements';
import { FlatList, View } from 'react-native';
import theme from '../../Theme/Theme';

import { useTranslation } from 'react-i18next';
import ItemList from '../../components/ItemList';
import { HDivider } from '../../components/UI/HDivider';
import { useConfirmEntrance } from './hooks/useConfirmEntrance';
import { Variants } from '../../Theme/Variables';

const schema = { img: 'houseImage', name: 'houseName' };

const ItemMemorized = memo(ItemList, (prev, next) => {
  return prev.active === next.active;
});

const ConfirmEntranceScreen = () => {
  const { t } = useTranslation();

  const { fList, search, selected, setSearch, onRegisterEnter, setSelected } =
    useConfirmEntrance();

  const renderItem = useCallback(
    ({ item }) => {
      const handleChange = () => {
        if (item.id === selected?.[0].id) {
          setSelected(null);
        } else {
          setSelected([item]);
        }
      };

      return (
        <React.Fragment>
          <ItemMemorized
            item={item}
            schema={schema}
            setter={setSelected}
            handleChange={handleChange}
            active={selected?.some(i => (i?.id || i?.uid) === item?.id)}
            multiple={false}
          />
          <HDivider />
        </React.Fragment>
      );
    },
    [selected]
  );

  return (
    <PageLayout
      safe
      backButton
      titleProps={{
        subPage: true
      }}
      footer={
        <CustomButton
          disabled={!selected || selected.length === 0}
          color={Variants.success.color}
          styled="rounded"
          loading={false}
          title={'Guardar entrada'}
          onPress={() => onRegisterEnter()}
        />
      }
    >
      <SearchBar
        placeholder={t('common.search_name')}
        onChangeText={setSearch}
        value={search}
        platform="ios"
        round
        containerStyle={[theme.p0]}
        inputStyle={{ fontSize: 14, padding: 0 }}
      />

      <View style={{ flex: 8 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={fList}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    </PageLayout>
  );
};

export default ConfirmEntranceScreen;
