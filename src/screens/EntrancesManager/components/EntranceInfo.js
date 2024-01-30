import React, {useState} from 'react';

import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {BottomModal} from '../../../components/BottomModal';
import theme from '../../../Theme/Theme';
import {format} from 'date-fns';
import FastImage from 'react-native-fast-image';
import Badge from '../../../components/Elements/Badge';
import {HDivider} from '../../../components/UI/HDivider';
import ImageView from 'react-native-image-viewing';
import {timeout} from '../../../utils/timeout';

export const EntranceInfo = ({isModalInfoOpened, closeModal, entranceInfo}) => {
  const [imageViewModal, setImageViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState();

  return (
    <>
      <View>
        <ImageView
          visible={imageViewModal}
          imageIndex={0}
          images={selectedImage}
          onRequestClose={() => setImageViewModal(false)}
        />
      </View>
      <BottomModal
        isVisible={isModalInfoOpened}
        onBackdropPress={closeModal}
        style={styles.modal}>
        <Text
          style={[
            theme.textCenter,
            theme.pY4,
            theme.textXl,
            theme.fontSansBold,
          ]}>
          Trabajos en casas{' '}
        </Text>
        {entranceInfo && (
          <ScrollView style={[theme.p4]}>
            {entranceInfo.map((entrance) => (
              <View key={entrance.id}>
                <View style={[theme.pB3, theme.flexRow, theme.justifyBetween]}>
                  <View>
                    <View>
                      <Badge
                        type="outline"
                        variant={
                          entrance.action === 'exit' ? 'danger' : 'success'
                        }
                        text={
                          entrance.action === 'exit' ? 'Finalizado' : 'En curso'
                        }
                      />
                      <View style={[theme.h1]} />
                      <Badge
                        type="outline"
                        variant="purple"
                        text={entrance.house.houseName}
                      />
                    </View>
                    <View style={[theme.flexRow, theme.itemsCenter, theme.mT2]}>
                      <Text>🕒 Entrada: </Text>
                      <Badge
                        variant="success"
                        type="outline"
                        text={
                          format(
                            entrance?.date?.seconds * 1000 +
                              entrance?.date?.nanoseconds / 1000000,
                            'HH:mm',
                          ) + 'h'
                        }
                      />
                    </View>
                    {entrance.action === 'exit' && (
                      <View
                        style={[theme.flexRow, theme.itemsCenter, theme.mT2]}>
                        <Text>🕒 Salida: </Text>
                        <Badge
                          type="outline"
                          variant="danger"
                          text={
                            format(
                              entrance?.exitDate?.seconds * 1000 +
                                entrance?.exitDate?.nanoseconds / 1000000,
                              'HH:mm',
                            ) + 'h'
                          }
                        />
                      </View>
                    )}
                  </View>
                  <View style={[theme.flexRow]}>
                    <View style={[theme.pX2, theme.itemsCenter]}>
                      <Text style={[theme.mB2]}>Entrada</Text>
                      <TouchableOpacity
                        onPress={async () => {
                          setSelectedImage([{uri: entrance.photos?.[0]}]);
                          closeModal();
                          await timeout(1000);
                          setImageViewModal(true);
                        }}>
                        <FastImage
                          style={[theme.w12, theme.h12, theme.rounded]}
                          source={{
                            uri: entrance.photos?.[0],
                            priority: FastImage.priority.normal,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      </TouchableOpacity>
                    </View>
                    {entrance.action === 'exit' && (
                      <View style={[theme.pX2, theme.itemsCenter]}>
                        <Text style={[theme.mB2]}>Salida</Text>
                        <TouchableOpacity
                          onPress={async () => {
                            setSelectedImage([{uri: entrance.photos?.[0]}]);
                            closeModal();
                            await timeout(1000);
                            setImageViewModal(true);
                          }}>
                          <FastImage
                            style={[theme.w12, theme.h12, theme.rounded]}
                            source={{
                              uri: entrance.photos?.[0],
                              priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <HDivider />
              </View>
            ))}
          </ScrollView>
        )}
      </BottomModal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
  },
  closeContainer: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 10,
    marginVertical: 20,
  },
});
