import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../Theme';
import theme from '../../../Theme/Theme';
import { Colors } from '../../../Theme/Variables';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Elements/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DEFAULT_IMAGE } from '../../../constants/general';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const EntranceListItem = ({ item, onPress }) => {
  const { Layout, Fonts } = useTheme();
  const statusColor = item.action === 'exit' ? Colors.danger : Colors.success;

  return (
    <TouchableOpacity
      style={[styles.container, theme.bgWhite, theme.mX3, theme.mB3]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Barra de estado lateral */}
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={[Layout.row, styles.content]}>
        {/* Avatar del trabajador */}
        <View style={styles.avatarContainer}>
          <Avatar
            uri={item.worker?.profileImage?.small || DEFAULT_IMAGE}
            size="big"
          />
        </View>

        {/* Información principal */}
        <View style={[Layout.grow, styles.infoContainer]}>
          {/* Header: Nombre y Estado */}
          <View
            style={[
              Layout.row,
              Layout.itemsStart,
              Layout.justifyBetween,
              styles.headerRow
            ]}
          >
            <View style={[Layout.grow, styles.nameContainer]}>
              <Text
                style={[Fonts.textBold, Fonts.textRegular, styles.workerName]}
              >
                {item.worker?.firstName} {item.worker?.secondName}
              </Text>
              <Text
                style={[Fonts.textSmall, theme.textGray500, styles.dateText]}
              >
                {format(
                  item?.date?.seconds * 1000 +
                    item?.date?.nanoseconds / 1000000,
                  'dd MMMM yyyy',
                  { locale: es }
                )}
              </Text>
            </View>
            <View style={styles.badgeContainer}>
              <Badge
                type="outline"
                variant={item.action === 'exit' ? 'danger' : 'success'}
                text={item.action === 'exit' ? 'Finalizado' : 'En curso'}
              />
            </View>
          </View>

          {/* Casa (si existe) */}
          {item.house && (
            <View style={[Layout.row, Layout.itemsCenter, styles.houseRow]}>
              <Icon name="home" size={16} color={Colors.purple} />
              <View style={styles.iconSpacing} />
              <Badge
                type="outline"
                variant="purple"
                text={item.house.houseName}
              />
            </View>
          )}

          {/* Horarios */}
          <View
            style={[
              Layout.row,
              Layout.itemsCenter,
              Layout.flexWrap,
              styles.timeRow
            ]}
          >
            <View style={[Layout.row, Layout.itemsCenter, styles.timeItem]}>
              <Icon name="schedule" size={16} color={Colors.success} />
              <View style={styles.iconSpacing} />
              <Text
                style={[Fonts.textSmall, theme.textGray700, styles.timeLabel]}
              >
                Entrada:
              </Text>
              <View style={styles.badgeWrapper}>
                <Badge
                  variant="success"
                  type="outline"
                  text={format(
                    item?.date?.seconds * 1000 +
                      item?.date?.nanoseconds / 1000000,
                    'HH:mm'
                  )}
                />
              </View>
            </View>

            {item.action === 'exit' && item.exitDate && (
              <View style={[Layout.row, Layout.itemsCenter, styles.timeItem]}>
                <Icon name="schedule" size={16} color={Colors.danger} />
                <View style={styles.iconSpacing} />
                <Text
                  style={[Fonts.textSmall, theme.textGray700, styles.timeLabel]}
                >
                  Salida:
                </Text>
                <View style={styles.badgeWrapper}>
                  <Badge
                    type="outline"
                    variant="danger"
                    text={format(
                      item?.exitDate?.seconds * 1000 +
                        item?.exitDate?.nanoseconds / 1000000,
                      'HH:mm'
                    )}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Icono de flecha */}
        <View style={styles.arrowContainer}>
          <Icon name="chevron-right" size={24} color={Colors.gray400} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  avatarContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: 12,
    paddingTop: 2
  },
  badgeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginLeft: 8
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    borderColor: Colors.gray200,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  content: {
    minHeight: 100,
    padding: 16
  },
  dateText: {
    marginTop: 4
  },
  headerRow: {
    marginBottom: 12
  },
  houseRow: {
    marginBottom: 8,
    marginTop: 4
  },
  iconSpacing: {
    marginLeft: 6,
    marginRight: 4
  },
  infoContainer: {
    flex: 1
  },
  nameContainer: {
    flex: 1,
    marginRight: 8
  },
  statusBar: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 4
  },
  timeItem: {
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4
  },
  timeLabel: {
    alignSelf: 'center',
    marginRight: 6
  },
  timeRow: {
    marginTop: 8
  },
  workerName: {
    color: Colors.gray900,
    fontSize: 16,
    lineHeight: 20
  }
});
