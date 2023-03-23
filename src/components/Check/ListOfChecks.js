import React from 'react';
import {View, Text, Pressable} from 'react-native';

import ItemCheck from '../../components/ItemCheck';

import {useTheme} from '../../Theme';
import {useTranslation} from 'react-i18next';
import Badge from '../Elements/Badge';
import {useState} from 'react';

import {useListOfChecks} from './hooks/useListOfChecks';
import theme from '../../Theme/Theme';

const ListOfChecks = ({checkId, disabled, checks, isCheckFinished}) => {
  const {Layout, Fonts, Gutters} = useTheme();
  const [noFinishFilter, setNoFinishFilter] = useState(false);

  const {t} = useTranslation();

  const listOfChecks = noFinishFilter ? checks?.filter((c) => !c.done) : checks;

  const {handleCheckAll, handleRemoveAllChecks} = useListOfChecks({
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

        <Badge
          text={!noFinishFilter ? 'Sin completar' : 'Todo'}
          variant={!noFinishFilter ? 'danger' : 'pm'}
          onPress={togleFilter}
        />
      </View>
      <View style={[Layout.row, Gutters.smallBMargin]}>
        <Badge
          text={'Completar todo'}
          variant={'pm'}
          onPress={handleCheckAll}
        />
        <View style={[theme.mR2]} />
        <Badge
          text={'Descompletar'}
          variant={'warning'}
          onPress={handleRemoveAllChecks}
        />
      </View>
      {listOfChecks
        ?.sort((a, b) => a.locale.es.localeCompare(b.locale.es))
        ?.map((item) => {
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
