import React, {useState} from 'react';

// UI
import PageLayout from '../../components/PageLayout';
import theme from '../../Theme/Theme';
import CustomButton from '../../components/Elements/CustomButton';
import {ScreenHeader} from '../../components/Layout/ScreenHeader';
import {NormalModal} from '../../components/Modals/NormalModal';

import {DateSelectorModal} from '../../components/Forms/DateSelectorModal';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNewQuadrant} from './hooks/useNewQuadrant';
import FastImage from 'react-native-fast-image';
import {ScrollView} from 'react-native-gesture-handler';
import {openScreenWithPush} from '../../Router/utils/actions';
import {NEW_JOB_QUADRANT_SCREEN_KEY} from '../NewJobQuadrant';

export const NewQuadrantScreen = ({route}) => {
  const docId = route?.params?.docId;
  const [date, setDate] = useState(new Date());

  const {houses} = useNewQuadrant();

  return (
    <PageLayout safe backButton>
      <View style={[theme.flexGrow]}>
        <ScreenHeader title={docId ? 'Editar cuadrante' : 'Nuevo cuadrante'} />
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
                    style={[
                      theme.flexRow,
                      theme.border0_5,
                      theme.borderGray300,
                      theme.roundedSm,
                      theme.mB2,
                      theme.p2,
                    ]}>
                    <View style={[theme.itemsStart]}>
                      <FastImage
                        source={{
                          uri: house.houseImage.small,
                          priority: FastImage.priority.normal,
                        }}
                        style={[
                          theme.mB2,
                          {width: 50, height: 50, borderRadius: 25},
                        ]}
                      />
                      <Text>{house.houseName}</Text>
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
                            house,
                          });
                        }}>
                        <Text
                          style={[
                            theme.mR3,
                            theme.textGray600,
                            theme.fontSansBold,
                          ]}>
                          Configurar
                        </Text>
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
              title={docId ? 'Editar cuadrante' : 'Nuevo cuadrante'}
            />
          </View>
        </View>
      </View>
    </PageLayout>
  );
};
