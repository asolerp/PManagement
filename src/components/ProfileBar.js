import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  getFirestore,
  collection,
  doc
} from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { Colors } from '../Theme/Variables';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { capitalizeText } from '../utils/capitalize';
import { openScreenWithPush } from '../Router/utils/actions';
import { PROFILE_SCREEN_KEY } from '../Router/utils/routerKeys';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useSelector } from 'react-redux';
import { userSelector } from '../Store/User/userSlice';
import { DEFAULT_IMAGE } from '../constants/general';

const ProfileBar = () => {
  const user = useSelector(userSelector);
  const today = format(new Date(), 'iii d MMMM yyyy', { locale: es });

  const firestoreQuery = useMemo(() => {
    const db = getFirestore();
    return doc(collection(db, 'users'), user?.id);
  }, [user?.id]);

  const [userProfile] = useDocumentData(firestoreQuery, {
    idField: 'id'
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.profileBar}>
        {/* Left side: Greeting and Date */}
        <View style={styles.infoContainer}>
          <Text style={styles.greeting}>
            Hola, {userProfile?.firstName || ''}
          </Text>
          <View style={styles.dateContainer}>
            <Icon
              name="calendar-today"
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.date}>{capitalizeText(today)}</Text>
          </View>
          {userProfile?.role && (
            <View style={styles.roleBadge}>
              <Icon
                name={
                  userProfile.role === 'admin'
                    ? 'admin-panel-settings'
                    : 'person'
                }
                size={12}
                color="#55A5AD"
              />
              <Text style={styles.roleText}>
                {userProfile.role === 'admin' ? 'Administrador' : 'Trabajador'}
              </Text>
            </View>
          )}
        </View>

        {/* Right side: Avatar */}
        <Pressable
          onPress={() =>
            userProfile?.role === 'admin' &&
            openScreenWithPush(PROFILE_SCREEN_KEY, {
              mode: 'admin',
              user: userProfile
            })
          }
          style={({ pressed }) => [
            styles.avatarContainer,
            pressed && styles.avatarPressed
          ]}
        >
          <FastImage
            style={styles.avatar}
            source={{
              uri: userProfile?.profileImage?.original || DEFAULT_IMAGE
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.avatarBorder} />
          {userProfile?.role === 'admin' && (
            <View style={styles.editIndicator}>
              <Icon name="edit" size={14} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 32,
    height: 64,
    width: 64
  },
  avatarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 32,
    borderWidth: 2
  },
  avatarContainer: {
    position: 'relative'
  },
  avatarPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }]
  },
  container: {
    minHeight: 160,
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
    position: 'relative'
  },
  date: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6
  },
  editIndicator: {
    alignItems: 'center',
    backgroundColor: '#55A5AD',
    borderColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  profileBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between'
  },
  roleBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  roleText: {
    color: '#55A5AD',
    fontSize: 11,
    fontWeight: '700'
  }
});

export default ProfileBar;
