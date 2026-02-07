import React, {useEffect, useState} from 'react';

// UI
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import CustomButton from '../../components/Elements/CustomButton';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';

import {DateSelectorModal} from '../../components/Forms/DateSelectorModal';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNewQuadrant} from './hooks/useNewQuadrant';
import FastImage from 'react-native-fast-image';
import {ScrollView} from 'react-native-gesture-handler';
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_JOB_QUADRANT_SCREEN_KEY} from '../NewJobQuadrant';
import {useDispatch, useSelector} from 'react-redux';
import {
  quadrantSelector,
  setQuadrant,
} from '../../Store/QuadrantForm/quadrantFormSlice';
import {Colors} from '../../Theme/Variables';

export const NewQuadrantScreen = ({route}) => {
  const quadrantToEdit = route?.params?.quadrantToEdit;
  const quadrantId = route?.params?.quadrantId;

  const [date, setDate] = useState(new Date());
  const dispatch = useDispatch();
  const quadrant = useSelector(quadrantSelector);
  const {houses, handlePressNewQuadrant, handleEditQuadrant} = useNewQuadrant();

  useEffect(() => {
    if (quadrantToEdit) {
      dispatch(setQuadrant({quadrant: quadrantToEdit}));
    }
  }, [quadrantToEdit, dispatch]);

  const hasHouseJobs = (houseId) => quadrant?.[houseId]?.length;

  return (
    <PageLayout safe backButton>
      <View style={[theme.flexGrow]}>
        <ScreenHeader
          title={quadrantToEdit ? 'Editar cuadrante' : 'Nuevo cuadrante'}
        />
        <View style={[theme.mT10]} />
        <DateSelectorModal date={date} setter={(date) => setDate(date)} />
        <View style={[theme.mT6]} />
        <Text style={[theme.fontSans, theme.textXl]}>
          Asignar trabajadordes
        </Text>
        <View style={[theme.flex1, theme.mT5]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View>
              {houses?.map((house) => {
                return (
                  <View
                    key={house.id}
                    style={[
                      theme.flexRow,
                      theme.border0_5,
                      theme.borderGray300,
                      theme.roundedSm,
                      theme.mB2,
                      theme.p2,
                      hasHouseJobs(house.id) && {backgroundColor: Colors.primary},
                    ]}>
                    <View style={[theme.flexRow, theme.itemsCenter]}>
                      <FastImage
                        source={{
                          uri: house.houseImage.small,
                          priority: FastImage.priority.normal,
                        }}
                        style={[
                          theme.mR2,
                          theme.border0_5,
                          theme.borderWhite,
                          {width: 50, height: 50, borderRadius: 25},
                        ]}
                      />
                      <Text
                        style={[
                          theme.w16,
                          theme.fontSansBold,
                          hasHouseJobs(house.id)
                            ? theme.textWhite
                            : theme.textGray900,
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail">
                        {house.houseName}
                      </Text>
                    </View>
                    <View
                      style={[
                        theme.flexGrow,
                        theme.itemsEnd,
                        theme.justifyCenter,
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          openScreenWithPush(NEW_JOB_QUADRANT_SCREEN_KEY, {
                            date,
                            house,
                            jobsToEdit: quadrant?.[house.id],
                          });
                        }}>
                        {hasHouseJobs(house.id) ? (
                          <Text
                            style={[
                              theme.mR3,
                              theme.textWhite,
                              theme.fontSansBold,
                            ]}>
                            Editar
                          </Text>
                        ) : (
                          <Text
                            style={[
                              theme.mR3,
                              theme.textGray600,
                              theme.fontSansBold,
                            ]}>
                            Configurar
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <View style={[theme.pT2]}>
            <CustomButton
              styled="rounded"
              title={quadrantToEdit ? 'Editar cuadrante' : 'Nuevo cuadrante'}
              onPress={() =>
                quadrantToEdit
                  ? handleEditQuadrant({date, quadrant, quadrantId})
                  : handlePressNewQuadrant({date, quadrant})
              }
            />
          </View>
        </View>
      </View>
    </PageLayout>
  );
};
