import React from 'react';
import {View, Text, Pressable} from 'react-native';

import ItemCheck from '../../components/ItemCheck';

import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';
import Badge from '../Elements/Badge';
import {useState} from 'react';

import {useListOfChecks} from './hooks/useListOfChecks';

const ListOfChecks = ({checkId, disabled, checks, isCheckFinished}) => {
  const {Layout, Fonts, Gutters} = useTheme();
  const [noFinishFilter, setNoFinishFilter] = useState(false);

  const {t} = useTranslation();

  const listOfChecks = noFinishFilter ? checks?.filter((c) => !c.done) : checks;

  const {allChecked, handleCheckAll, handleRemoveAllChecks} = useListOfChecks({
    isCheckFinished,
    list: listOfChecks,
    checkId,
  });

  const togleFilter = () => {
    setNoFinishFilter(!noFinishFilter);
  };

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
      <View style={[Layout.row, Gutters.smallBMargin]}>
        <Pressable style={[Gutters.smallRMargin]} onPress={handleCheckAll}>
          <Badge text={'Completar todo'} variant={'pm'} />
        </Pressable>
        <Pressable onPress={handleRemoveAllChecks}>
          <Badge text={'Descompletar'} variant={'warning'} />
        </Pressable>
      </View>
      {listOfChecks?.map((item) => {
        return (
          <ItemCheck
            disabled={disabled}
            key={item.id}
            check={item}
            checklistId={checkId}
            isCheckFinished={isCheckFinished}
          />
        );
      })}
    </View>
  );
};

export default ListOfChecks;
