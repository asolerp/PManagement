import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import theme from '../../Theme/Theme';
import { Colors } from '../../Theme/Variables';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import ImageView from 'react-native-image-viewing';

export const OwnerChecks = ({
    checklist,
    checksFromChecklist
}) => {

    const [modal, setModal] = React.useState(false);
    const [image, setImage] = React.useState(null);

    return (
        <>
            <ImageView
            visible={modal}
            imageIndex={0}
            images={image}
            onRequestClose={() => setModal(false)}
            />
            <View>
                <View style={[theme.mT4, theme.mB4]}>
                <Text style={[theme.fontSansBold]}>We check:</Text>
                </View>
                <View>
                {checksFromChecklist?.map((check) => (
                    <View
                    style={[
                        theme.mB2,
                        {
                        borderColor: Colors.pm,
                        },
                        theme.border0_5,
                        theme.roundedSm,
                        theme.bgWhite,
                    ]}>
                    <View
                        style={[
                        theme.pY2,
                        theme.pX2,
                        theme.roundedTrSm,
                        theme.roundedTlSm,
                        theme.flexRow,
                        theme.itemsCenter,
                        theme.justifyBetween,
                        {
                            backgroundColor: Colors.pm,
                        },
                        ]}>
                        <Text style={[theme.textWhite, theme.fontSansBold]}>
                        {check.locale.en}
                        </Text>
                        <Icon
                        name="checkmark-circle-sharp"
                        color={Colors.white}
                        size={25}
                        />
                    </View>
                    <View
                        style={[
                        theme.p1,
                        {
                            backgroundColor: Colors.pmLow,
                        },
                        ]}>
                        {check?.photos?.map((photo) => (
                        <TouchableOpacity
                            onPress={() => {
                            setModal(true);
                            setImage([{uri: photo}]);
                            }}>
                            <FastImage
                            source={{
                                uri: photo,
                                priority: FastImage.priority.normal,
                            }}
                            style={[theme.w20, theme.h20, theme.roundedSm]}
                            resizeMode={FastImage.resizeMode.cover}
                            />
                        </TouchableOpacity>
                        ))}
                    </View>
                    </View>
                ))}
                </View>
                <View style={[theme.mT4]}>
                <Text style={[theme.fontSansBold]}>Observaciones:</Text>
                <Text style={[theme.mT2]}>{checklist?.observations || 'No observations'}</Text>
                </View>
            </View>
        </>
    )
}