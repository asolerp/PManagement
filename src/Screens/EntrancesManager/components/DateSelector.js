import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import theme from '../../../Theme/Theme';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Colors } from '../../../Theme/Variables';
import { useTheme } from '../../../Theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const DateSelector = ({
  goBackOneDay,
  goForwardOneDay,
  selectedDate
}) => {
  const { Gutters } = useTheme();
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <View
      style={[
        styles.container,
        theme.bgWhite,
        theme.pY3,
        theme.pX4,
        theme.shadowMd
      ]}
    >
      <View
        style={[
          theme.flexRow,
          theme.itemsCenter,
          theme.justifyBetween,
          theme.wFull
        ]}
      >
        <TouchableOpacity
          onPress={() => goBackOneDay()}
          style={[styles.button, styles.buttonLeft]}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={20} color={Colors.primary} />
          <Text style={[theme.fontSansBold, styles.buttonText]}>Anterior</Text>
        </TouchableOpacity>

        <View style={[theme.flex1, theme.itemsCenter, Gutters.smallHMargin]}>
          <Text style={[theme.fontSansBold, styles.dateText]}>
            {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
          </Text>
        </View>

        <TouchableOpacity
          disabled={isToday}
          onPress={() => goForwardOneDay()}
          style={[
            styles.button,
            styles.buttonRight,
            isToday && styles.buttonDisabled
          ]}
          activeOpacity={0.7}
        >
          <Text style={[theme.fontSansBold, styles.buttonText]}>Siguiente</Text>
          <Icon
            name="chevron-right"
            size={20}
            color={isToday ? Colors.gray400 : Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200
  },
  buttonLeft: {
    marginRight: 8
  },
  buttonRight: {
    marginLeft: 8
  },
  buttonDisabled: {
    opacity: 0.4
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 14,
    marginHorizontal: 4
  },
  dateText: {
    color: Colors.gray900,
    fontSize: 16,
    textTransform: 'capitalize'
  }
});
