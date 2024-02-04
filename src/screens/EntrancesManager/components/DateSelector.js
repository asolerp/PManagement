import {TouchableOpacity, View, Text} from 'react-native';
import theme from '../../../Theme/Theme';
import {format, isSameDay} from 'date-fns';
import {es} from 'date-fns/locale';

export const DateSelector = ({goBackOneDay, goForwardOneDay, selectedDate}) => {
  const isToday = isSameDay(selectedDate, new Date());

  console.log(isToday);

  return (
    <View
      style={[
        theme.pX4,
        theme.absolute,
        theme.z40,
        theme.top28,
        theme.wFull,
        theme.flexRow,
        theme.itemsCenter,
        theme.justifyBetween,
      ]}>
      <TouchableOpacity
        onPress={() => goBackOneDay()}
        style={[theme.p2, theme.roundedSm, theme.bgSecondary]}>
        <Text style={[theme.fontSansBold, theme.textWhite]}>Dia anterior</Text>
      </TouchableOpacity>
      <Text style={[theme.fontSansBold]}>
        {format(selectedDate, 'dd MMMM yyyy', {locale: es})}
      </Text>
      <TouchableOpacity
        disabled={isToday}
        onPress={() => goForwardOneDay()}
        style={[
          theme.p2,
          theme.roundedSm,
          theme.bgSecondary,
          isToday && theme.opacity20,
        ]}>
        <Text style={[theme.fontSansBold, theme.textWhite]}>Dia siguiente</Text>
      </TouchableOpacity>
    </View>
  );
};
