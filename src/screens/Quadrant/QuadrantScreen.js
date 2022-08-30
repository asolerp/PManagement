import React, {useEffect} from 'react';

// UI
import PageLayout from '../../components/PageLayout';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {capitalizeText} from '../../utils/capitalize';
import {today} from '../../utils/dates';
import {useQuadrant} from './hooks/useQuadrant';
import {ScrollView, Text, View} from 'react-native';
import theme from '../../Theme/Theme';
import CustomButton from '../../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';

import {openScreenWithPush} from '../../Router/utils/actions';
import {Row} from '../../components/Quadrant/Row';
import {NormalModal} from '../../components/Modals/NormalModal';
import {Colors} from '../../Theme/Variables';
import {NEW_QUADRANT_SCREEN_KEY} from '../NewQuadrant';

const CELL_WIDTH = 120;
const CELL_HEIGHT = 40;

const cellStyle = [
  theme.p2,
  theme.bgGray100,
  theme.itemsCenter,
  theme.justifyCenter,
  theme.borderR0_5,
  theme.borderGray200,
];

const QuadrantScreen = () => {
  const {houses, jobs, isModalVisible, setIsModalVisible} = useQuadrant();
  // const [orientationIsLandscape, setOrientation] = useState(true);

  // async function changeScreenOrientation() {
  //   if (orientationIsLandscape === true) {
  //     ScreenOrientation.lockAsync(
  //       ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
  //     );
  //   } else if (orientationIsLandscape === false) {
  //     ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  //   }
  // }

  // useEffect(() => {
  //   const toggleOrientation = () => {
  //     setOrientation(!orientationIsLandscape);
  //     changeScreenOrientation();
  //   };
  //   toggleOrientation();
  // }, []);

  return (
    <React.Fragment>
      <NormalModal isVisible={isModalVisible}>
        <View style={[theme.flexGrow]}>
          <View>
            <Text style={[theme.textCenter, theme.fontSansBold, theme.textXl]}>
              Configuración de cuadrante
            </Text>
            <Text
              style={[
                theme.textCenter,
                theme.fontSans,
                theme.mT2,
                theme.textGray600,
              ]}>
              No se ha configurado el cuadrante para hoy. Apreta en configurar
              para organizar a tus trabajadordes
            </Text>
          </View>
          <View
            style={[
              theme.flexGrow,
              theme.mY4,
              theme.justifyCenter,
              theme.itemsCenter,
            ]}>
            <Icon name={'grid'} size={40} color={Colors.pm} />
          </View>
          <View style={[theme.flexGrow, theme.justifyEnd]}>
            <CustomButton
              title="Configurar"
              onPress={() => {
                setIsModalVisible(false);
                openScreenWithPush(NEW_QUADRANT_SCREEN_KEY);
              }}
            />
          </View>
        </View>
      </NormalModal>
      <PageLayout safe>
        <ScreenHeader
          title={'Cuadrante del día'}
          subtitle={capitalizeText(today)}
        />
        <View style={[theme.mB4]} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[theme.flexGrow]}>
          <ScrollView
            style={[theme.flexGrow]}
            horizontal
            showsHorizontalScrollIndicator={false}>
            <View>
              <View style={[theme.flexRow]}>
                <View
                  style={[
                    ...cellStyle,
                    theme.roundedTlLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>CASA / HORA</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>08:00 - 09:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>09:00 - 10:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>10:00 - 11:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>11:00 - 12:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>12:00 - 13:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>13:00 - 14:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>14:00 - 15:00</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    theme.borderR0,
                    theme.roundedTrLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text>15:00 - 16:00</Text>
                </View>
              </View>
              {houses?.map((house) => (
                <Row house={house} jobs={jobs?.[house.id]} />
              ))}
              <View
                style={[theme.flexRow, theme.borderT0_5, theme.borderGray200]}>
                <View
                  style={[
                    ...cellStyle,
                    theme.roundedBlLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
                <View
                  style={[
                    ...cellStyle,
                    theme.borderR0,
                    theme.roundedBrLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT / 2},
                  ]}
                />
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      </PageLayout>
    </React.Fragment>
  );
};

export default QuadrantScreen;
