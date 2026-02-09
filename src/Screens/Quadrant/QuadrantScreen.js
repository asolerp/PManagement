import React, {useCallback, useEffect, useState} from 'react';

// UI
import PageLayout from '../../components/PageLayout';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {capitalizeText} from '../../utils/capitalize';
import {today} from '../../utils/dates';
import {useQuadrant} from './hooks/useQuadrant';
import {RefreshControl, ScrollView, Text, View, useWindowDimensions} from 'react-native';
import theme from '../../Theme/Theme';
import CustomButton from '../../components/Elements/CustomButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {userSelector} from '../../Store/User/userSlice';
import {openScreenWithPush} from '../../Router/utils/actions';
import {Row} from '../../components/Quadrant/Row';
import {NormalModal} from '../../components/Modals/NormalModal';
import {Colors} from '../../Theme/Variables';
import {NEW_QUADRANT_SCREEN_KEY} from '../NewQuadrant';
import Badge from '../../components/Elements/Badge';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

const CELL_WIDTH = 125;
const CELL_HEIGHT = 40;

const cellStyle = [
  theme.p2,
  theme.bgGray100,
  theme.itemsCenter,
  theme.justifyCenter,
  theme.borderR0_5,
  theme.borderGray200,
];

const QuadrantScreen = ({navigation}) => {
  const {
    jobs,
    houses,
    loading,
    quadrantId,
    isModalVisible,
    setIsModalVisible,
    getQuadrantsWithJobs,
  } = useQuadrant();

  const user = useSelector(userSelector);
  const {width, height} = useWindowDimensions();
  const isPortrait = height > width;

  useFocusEffect(
    useCallback(() => {
      getQuadrantsWithJobs();
    }, []),
  );

  return (
    <React.Fragment>
      <NormalModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)}>
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
            <Icon name={'grid'} size={40} color={Colors.primary} />
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
      <PageLayout
        safe
        edges={['top']}
        containerStyles={[!isPortrait && theme.pL5]}>
        {!isPortrait && <View style={[theme.mT2]} />}
        <ScreenHeader
          title={'Cuadrante del día'}
          subtitle={capitalizeText(today)}
        />
        <View style={[isPortrait ? theme.mB14 : theme.mB3]} />
        <View style={[theme.flexRow]}>
          {user.role === 'admin' && (
            <Badge
              containerStyle={[theme.mR2]}
              text={'Editar'}
              onPress={() =>
                openScreenWithPush(NEW_QUADRANT_SCREEN_KEY, {
                  quadrantId,
                  quadrantToEdit: jobs,
                })
              }
            />
          )}
          <Badge
            text="Actualizar"
            variant="danger"
            onPress={getQuadrantsWithJobs}
          />
        </View>
        <View style={[isPortrait ? theme.mB2 : theme.mB3]} />
        <View style={[theme.flex1, theme.flexGrow, theme.pB3]}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={[theme.flexGrow]}>
            <View style={[theme.flexGrow]}>
              <View style={[theme.flexRow]}>
                <View
                  style={[
                    ...cellStyle,
                    theme.roundedTlLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Text style={[theme.fontSansBold]}>CASA / HORA</Text>
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'08:00 - 09:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'09:00 - 10:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'10:00 - 11:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'11:00 - 12:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'12:00 - 13:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'13:00 - 14:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'14:00 - 15:00'} variant="info" />
                </View>
                <View
                  style={[
                    ...cellStyle,
                    theme.borderR0,
                    theme.roundedTrLg,
                    {width: CELL_WIDTH, height: CELL_HEIGHT},
                  ]}>
                  <Badge text={'15:00 - 16:00'} variant="info" />
                </View>
              </View>
              <ScrollView
                style={[theme.flexGrow]}
                showsVerticalScrollIndicator={false}>
                <View>
                  {jobs &&
                    houses?.map((house) => (
                      <Row
                        key={house.id}
                        house={house}
                        jobs={jobs?.[house.id]}
                      />
                    ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

export default QuadrantScreen;
