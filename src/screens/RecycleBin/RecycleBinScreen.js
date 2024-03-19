import React from "react"
import PageLayout from "../../components/PageLayout"
import theme from "../../Theme/Theme"
import { useCollectionData } from "react-firebase-hooks/firestore"
import firestore from '@react-native-firebase/firestore';
import DashboardSectionSkeleton from "../../components/Skeleton/DashboardSectionSkeleton";
import { useTranslation } from "react-i18next";
import CheckItem from "../../components/Lists/CheckItem";
import { restoreOrDeleteChecklist } from "../../components/Alerts/restoreOrdeleteChecklist";
import useRecursiveDelete from "../../utils/useRecursiveDelete";
import { CHECKLISTS, RECYCLEBIN } from "../../utils/firebaseKeys";
import useRestoreChecklist from "../../utils/useRestoreChecklist";

const { View, FlatList, Text, Pressable } = require("react-native")

const RecycleBinScreen = () => {

    const {t} = useTranslation();

    const {recursiveDelete} = useRecursiveDelete();
    const {restoreChecklist} = useRestoreChecklist()

    let firestoreQuery;

    firestoreQuery = firestore()
    .collection('recycleBin')

    const [checklists, loadinChecklists] = useCollectionData(
        firestoreQuery,
        {
          idField: 'id',
        },
      );

    const renderItem = ({item}) => {
        return (
          <Pressable
            onPress={() => restoreOrDeleteChecklist(() => restoreChecklist(item.id), () => recursiveDelete({
                path: `recycleBin/${item.id}`,
                docId: item.id,
                collection: RECYCLEBIN,
              }))}
            style={[theme.mX4]}>
            <CheckItem item={item} fullWidth />
          </Pressable>
        );
    };

    return (
        <React.Fragment>
            <PageLayout
                safe
                backButton
                withTitle
                titleLefSide={<Text style={[theme.textBlack, theme.h5]}>Papelera de reciclaje</Text>}
            >
                <View style={[theme.flexGrow]}>
                <Text style={[theme.textBlack, theme.fontSansBold, theme.text3xl, theme.mT3, theme.mB2]}>
                    Papelera de reciclaje
                </Text>
                {loadinChecklists && <DashboardSectionSkeleton />}
                <FlatList
                    scrollEnabled={true}
                    ListEmptyComponent={
                    <Text style={[theme.textBlack]}>{t('checklists.empty')}</Text>
                    }
                    showsVerticalScrollIndicator={false}
                    contentInset={{bottom: 150}}
                    data={checklists}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    style={[theme.mT3]}
                    contentContainerStyle={{paddingBottom: 50}}
                />
                </View>
            </PageLayout>
        </React.Fragment>
    )
}

export default RecycleBinScreen