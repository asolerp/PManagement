import {Dimensions, StyleSheet} from 'react-native';

export default function ({}) {
  return StyleSheet.create({
    fullWidth: {
      width: Dimensions.get('window').width,
    },
    fill: {
      flex: 1,
    },
    grow: {
      flexGrow: 1,
    },
    column: {
      flexDirection: 'column',
    },
    colCenter: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    wrap: {
      flexWrap: 'wrap',
    },
    justifyContentEvenly: {
      justifyContent: 'space-evenly',
    },
    justifyContentStart: {
      justifyContent: 'flex-start',
    },
    justifyContentEnd: {
      justifyContent: 'flex-end',
    },
    justifyContentSpaceAround: {
      justifyContent: 'space-around',
    },
    justifyContentSpaceBetween: {
      justifyContent: 'space-between',
    },
    alignItemsStart: {
      alignItems: 'flex-start',
    },
    alignItemsCenter: {
      alignItems: 'center',
    },
    alignItemsEnd: {
      alignItems: 'flex-end',
    },
    boxShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
  });
}
