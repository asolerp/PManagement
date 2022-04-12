import React from 'react';
import {View, Text, FlatList, Pressable} from 'react-native';

import useUploadImageCheck from '../../hooks/useUploadImage';

import ItemCheck from '../../components/ItemCheck';

import {CHECKLISTS} from '../../utils/firebaseKeys';

import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';
import Badge from '../Elements/Badge';
import {useState} from 'react';

const ListOfChecks = ({checkId, disabled, checks, isCheckFinished}) => {
  const {Layout, Fonts, Gutters} = useTheme();
  const [noFinishFilter, setNoFinishFilter] = useState(false);
  const {t} = useTranslation();

  const listOfChecks = noFinishFilter ? checks?.filter((c) => !c.done) : checks;

  const togleFilter = () => {
    setNoFinishFilter(!noFinishFilter);
  };

  const renderItem = ({item}) => (
    <ItemCheck
      disabled={disabled}
      key={item.id}
      check={item}
      checklistId={checkId}
      isCheckFinished={isCheckFinished}
    />
  );

  return (
    <View style={[Layout.fill]}>
      <View
        style={[
          Layout.row,
          Layout.justifyContentSpaceBetween,
          Gutters.smallBMargin,
        ]}>
        <Text style={[Fonts.textTitle, Gutters.smallBPadding]}>
          {t('checklists.checkPage.jobs')}
        </Text>
        <Pressable onPress={togleFilter}>
          <Badge
            text={!noFinishFilter ? 'Sin completar' : 'Todo'}
            variant={!noFinishFilter ? 'danger' : 'pm'}
          />
        </Pressable>
      </View>
      <FlatList
        data={listOfChecks}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default ListOfChecks;
