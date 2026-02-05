import React, {useContext, useMemo} from 'react';

import { getFirestore, collection, doc } from '@react-native-firebase/firestore';
import {useDocumentData} from 'react-firebase-hooks/firestore';

// UI
import ChatButtonWithMessagesCounter from '../../components/ChatButtonWithMessagesCounter';
import {Info} from '../../components/Job';

import PageLayout from '../../components/PageLayout';
import CustomButton from '../../components/Elements/CustomButton';
import updateJobStatus from '../../Services/updateJobStatus';
import {JOBS} from '../../utils/firebaseKeys';
import {View} from 'react-native';
import {popScreen} from '../../Router/utils/actions';
import {JOBS_SCREEN_KEY} from '../../Router/utils/routerKeys';

import {useTheme} from '../../Theme';

import {finishJob, openJob} from '../../components/Alerts/jobs';
import {useTranslation} from 'react-i18next';
import {PageOptionsScreen} from '../PageOptions';
import theme from '../../Theme/Theme';
import {useCameraOrLibrary} from '../../hooks/useCamerOrLibrary';
import {imageActions} from '../../utils/imageActions';
import {useUploadFinishPhoto} from './hooks/useUploadFinishPhoto';
import {LoadingModalContext} from '../../context/loadinModalContext';
import {useSelector} from 'react-redux';
import {userSelector} from '../../Store/User/userSlice';

const JobScreen = ({route}) => {
  const {Gutters} = useTheme();
  const {t} = useTranslation();
  const user = useSelector(userSelector);
  const {onImagePress} = useCameraOrLibrary();
  const {setVisible} = useContext(LoadingModalContext);
  const type = 'capture';
  const {jobId} = route.params;
  
  const db = getFirestore();
  const query = useMemo(() => {
    return doc(collection(db, JOBS), jobId);
  }, [jobId, db]);

  const [job] = useDocumentData(query, {
    idField: 'id',
  });

  const {uploadFinishPhoto} = useUploadFinishPhoto();

  const onSubmit = () => {
    if (user.role === 'admin') {
      return updateJobStatus(jobId, {done: !job?.done});
    }
    onImagePress({
      type,
      options: {...imageActions[type], selectionLimit: 1},
      callback: async (imgs) => {
        try {
          setVisible(true);
          const images = imgs.map((image, i) => ({
            fileName: image?.fileName || `image-${i}`,
            fileUri: image?.uri,
            fileType: image?.type,
          }));
          const db = getFirestore();
          const jobRef = doc(collection(db, JOBS), jobId);
          await uploadFinishPhoto(images[0], {
            collectionRef: jobRef,
            cloudinaryFolder: `/PortManagement/${JOBS}/${jobId}/Photos`,
            docId: jobId,
          });
        } catch (err) {
          console.log(err);
        } finally {
          setVisible(false);
          popScreen();
        }
      },
    });
    //
  };

  return (
    <React.Fragment>
      <ChatButtonWithMessagesCounter collection={JOBS} docId={jobId} />
      <PageLayout
        safe
        backButton
        titleProps={{
          subPage: true,
        }}
        titleRightSide={
          <PageOptionsScreen
            backScreen={JOBS_SCREEN_KEY}
            collection={JOBS}
            docId={jobId}
            edit={true}
            showDelete={true}
            duplicate={true}
          />
        }
        footer={
          (user.role === 'admin' || !job?.done) && (
            <CustomButton
              styled="rounded"
              loading={false}
              title={job?.done ? t('job.done') : t('job.no_done')}
              onPress={() =>
                job?.done ? openJob(onSubmit) : finishJob(onSubmit)
              }
            />
          )
        }>
        <View style={[Gutters.smallTMargin, theme.flexGrow]}>
          <Info />
        </View>
      </PageLayout>
    </React.Fragment>
  );
};

export default JobScreen;
