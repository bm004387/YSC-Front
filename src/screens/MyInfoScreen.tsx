import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AddressInput from '../components/address/AddressInput';
import {
  changeMyAddress,
  changeMyPassword,
  getMyProfile,
  saveMyProfileImage,
  verifyCurrentPassword,
  UserProfile,
} from '../api/userApi';
import {getAuthCredentials} from '../storage/tokenStorage';
import myInfoStyles from '../styles/myInfo';
import useMsg from '../hooks/useMsg';

interface MyInfoScreenProps {
  onBack: () => void;
}

type ModalType = 'password' | 'address' | null;
const emptyProfile: UserProfile = {
  usrId: '', usrNm: '', hpNo: '', adr: '', dtlAdr: '', profileImageUrl: null,
};
const BASE_URL = 'https://ysc-dev.duckdns.org';

function MyInfoScreen({onBack}: MyInfoScreenProps) {
  const {getMsg} = useMsg();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [profileImageVersion, setProfileImageVersion] = useState(() => Date.now());
  const [accessToken, setAccessToken] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageMessage, setPageMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordStatus, setCurrentPasswordStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [currentPasswordMessage, setCurrentPasswordMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const profileMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordVerificationRequest = useRef(0);

  useEffect(() => () => {
    if (profileMessageTimer.current) clearTimeout(profileMessageTimer.current);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const credentials = await getAuthCredentials();
      if (!credentials) throw new Error(getMsg('MYINFO', '009'));
      setAccessToken(credentials.password);
      setProfile(await getMyProfile(credentials.password));
      setProfileImageVersion(Date.now());
      setPageMessage('');
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : getMsg('MYINFO', '010'));
    } finally {
      setLoading(false);
    }
  }, [getMsg]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const openModal = (type: Exclude<ModalType, null>) => {
    setModalMessage('');
    if (type === 'password') {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setCurrentPasswordStatus('idle'); setCurrentPasswordMessage('');
    } else {
      setAddress(profile.adr); setDetailAddress(profile.dtlAdr);
    }
    setModalType(type);
  };

  const closeModal = () => {
    if (saving) return;
    passwordVerificationRequest.current += 1;
    setModalType(null);
    setModalMessage('');
  };

  const verifyCurrentPasswordOnBlur = async () => {
    const requestId = ++passwordVerificationRequest.current;
    setModalMessage('');
    setCurrentPasswordMessage('');
    if (!currentPassword) {
      setCurrentPasswordStatus('invalid');
      setCurrentPasswordMessage(getMsg('COMMON', '002'));
      return;
    }

    setCurrentPasswordStatus('checking');
    try {
      const credentials = await getAuthCredentials();
      if (!credentials) throw new Error(getMsg('MYINFO', '009'));
      const result = await verifyCurrentPassword(credentials.password, currentPassword);
      if (requestId !== passwordVerificationRequest.current) return;
      setCurrentPasswordStatus(result.valid ? 'valid' : 'invalid');
      setCurrentPasswordMessage(result.message);
    } catch (error) {
      if (requestId !== passwordVerificationRequest.current) return;
      setCurrentPasswordStatus('invalid');
      setCurrentPasswordMessage(error instanceof Error ? error.message : getMsg('MYINFO', '010'));
    }
  };

  const submitPassword = async () => {
    setModalMessage('');
    if (currentPasswordStatus !== 'valid') {
      if (!currentPasswordMessage) setCurrentPasswordMessage(getMsg('MYINFO', '001'));
      setCurrentPasswordStatus('invalid');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalMessage(getMsg('COMMON', '002')); return;
    }
    if (newPassword.length < 8) {
      setModalMessage(getMsg('MYINFO', '002')); return;
    }
    if (newPassword !== confirmPassword) {
      setModalMessage(getMsg('COMMON', '003')); return;
    }
    setSaving(true);
    try {
      const credentials = await getAuthCredentials();
      if (!credentials) throw new Error(getMsg('MYINFO', '009'));
      const result = await changeMyPassword(credentials.password, currentPassword, newPassword, confirmPassword);
      if (!result.success) {
        setCurrentPasswordStatus('invalid');
        setCurrentPasswordMessage(result.message);
        return;
      }
      setModalMessage(getMsg('MYINFO', '003'));
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setCurrentPasswordStatus('idle'); setCurrentPasswordMessage('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : getMsg('MYINFO', '008');
      const currentPasswordMismatchMessages = [
        getMsg('MYINFO', '001'),
        'MYINFO_001',
        'MYINFO:001',
        '현재 비밀번호가 일치하지 않습니다.',
      ];
      if (currentPasswordMismatchMessages.includes(errorMessage)) {
        setCurrentPasswordStatus('invalid');
        setCurrentPasswordMessage(errorMessage);
      } else {
        setModalMessage(errorMessage);
      }
    } finally { setSaving(false); }
  };

  const submitAddress = async () => {
    setModalMessage('');
    if (!address.trim()) { setModalMessage(getMsg('COMMON', '007')); return; }
    setSaving(true);
    try {
      const credentials = await getAuthCredentials();
      if (!credentials) throw new Error(getMsg('MYINFO', '009'));
      await changeMyAddress(credentials.password, address.trim(), detailAddress.trim());
      setProfile(current => ({...current, adr: address.trim(), dtlAdr: detailAddress.trim()}));
      setModalMessage(getMsg('MYINFO', '004'));
    } catch (error) {
      setModalMessage(error instanceof Error ? error.message : getMsg('MYINFO', '010'));
    } finally { setSaving(false); }
  };

  const chooseProfileImage = async () => {
    if (profileMessageTimer.current) clearTimeout(profileMessageTimer.current);
    setPageMessage('');
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo', selectionLimit: 1,
        maxWidth: 640, maxHeight: 640, quality: 0.7, includeExtra: true,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage ?? getMsg('MYINFO', '006'));
      }
      const asset = result.assets?.[0];
      if (!asset?.uri || !asset.type?.startsWith('image/')) {
        throw new Error(getMsg('MYINFO', '007'));
      }
      setSaving(true);
      const credentials = await getAuthCredentials();
      if (!credentials) throw new Error(getMsg('MYINFO', '009'));
      setAccessToken(credentials.password);
      const response = await saveMyProfileImage(credentials.password, {
        uri: asset.uri,
        name: uploadFilename(asset.fileName, asset.originalPath, asset.type),
        type: asset.type,
      });
      setProfile(current => ({...current, profileImageUrl: response.profileImageUrl}));
      setProfileImageVersion(Date.now());
      setPageMessage(getMsg('MYINFO', '005'));
      profileMessageTimer.current = setTimeout(() => setPageMessage(''), 3000);
    } catch (error) {
      setPageMessage(error instanceof Error ? error.message : getMsg('MYINFO', '008'));
    } finally { setSaving(false); }
  };

  const renderMessage = (message: string) => message ? (
    <Text style={myInfoStyles.message}>{message}</Text>
  ) : null;

  return (
    <View style={myInfoStyles.container}>
      <View style={myInfoStyles.header}>
        <Pressable style={myInfoStyles.backButton} onPress={onBack}>
          <Text style={myInfoStyles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={myInfoStyles.headerTitle}>내 정보</Text>
      </View>

      {loading ? <ActivityIndicator style={myInfoStyles.loader} color="#3867D6" /> : (
        <ScrollView contentContainerStyle={{paddingBottom: 40}}>
          <View style={myInfoStyles.content}>
            <View style={myInfoStyles.profileArea}>
              {profile.profileImageUrl ? (
                <Image
                  source={{uri: `${BASE_URL}${profile.profileImageUrl}?v=${profileImageVersion}`, headers: {Authorization: `Bearer ${accessToken}`}, cache: 'reload'}}
                  style={myInfoStyles.profileImage}
                />
              ) : (
                <View style={myInfoStyles.profileImage}>
                  <Text style={myInfoStyles.profileText}>{profile.usrNm.slice(0, 1) || 'Y'}</Text>
                </View>
              )}
              <Pressable style={myInfoStyles.profileButton} onPress={() => void chooseProfileImage()} disabled={saving}>
                <Text style={myInfoStyles.profileButtonText}>{saving ? '저장 중...' : '프로필 사진 변경'}</Text>
              </Pressable>
              {renderMessage(pageMessage)}
            </View>

            <View style={myInfoStyles.section}>
              <Text style={myInfoStyles.sectionTitle}>기본 정보</Text>
              <View style={myInfoStyles.infoCard}>
                <InfoRow label="아이디" value={profile.usrId} />
                <InfoRow label="이름" value={profile.usrNm} />
                <InfoRow label="휴대폰" value={profile.hpNo} last />
                <View style={[myInfoStyles.infoRow, myInfoStyles.infoRowLast, myInfoStyles.addressInfoRow]}>
                  <Text style={myInfoStyles.infoLabel}>주소</Text>
                  <View style={myInfoStyles.addressValues}>
                    <Text style={myInfoStyles.infoValue}>{profile.adr || '-'}</Text>
                    {profile.dtlAdr ? <Text style={myInfoStyles.addressDetailValue}>{profile.dtlAdr}</Text> : null}
                  </View>
                </View>
              </View>
            </View>

            <View style={myInfoStyles.section}>
              <Text style={myInfoStyles.sectionTitle}>계정 설정</Text>
              <View style={myInfoStyles.settingCard}>
                <Pressable style={myInfoStyles.settingRow} onPress={() => openModal('password')}>
                  <Text style={myInfoStyles.settingTitle}>비밀번호 변경</Text><Text style={myInfoStyles.settingArrow}>›</Text>
                </Pressable>
                <Pressable style={[myInfoStyles.settingRow, myInfoStyles.settingRowLast]} onPress={() => openModal('address')}>
                  <Text style={myInfoStyles.settingTitle}>주소 변경</Text><Text style={myInfoStyles.settingArrow}>›</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal visible={modalType === 'password'} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={myInfoStyles.modalOverlay}><View style={myInfoStyles.modalContent}>
          <Text style={myInfoStyles.modalTitle}>비밀번호 변경</Text>
          <TextInput style={myInfoStyles.input} placeholder="현재 비밀번호" placeholderTextColor="#A0A0A0" value={currentPassword} onChangeText={value => {passwordVerificationRequest.current += 1; setCurrentPassword(value); setCurrentPasswordStatus('idle'); setCurrentPasswordMessage('');}} onBlur={() => void verifyCurrentPasswordOnBlur()} secureTextEntry autoComplete="off" textContentType="none" importantForAutofill="no" autoCorrect={false} spellCheck={false} />
          {currentPasswordMessage ? <Text style={[myInfoStyles.message, currentPasswordStatus === 'valid' && myInfoStyles.messageSuccess]}>{currentPasswordMessage}</Text> : null}
          <TextInput style={myInfoStyles.input} placeholder="새 비밀번호 (8자 이상)" placeholderTextColor="#A0A0A0" value={newPassword} onChangeText={setNewPassword} secureTextEntry autoComplete="off" textContentType="none" importantForAutofill="no" autoCorrect={false} spellCheck={false} />
          <TextInput style={myInfoStyles.input} placeholder="새 비밀번호 확인" placeholderTextColor="#A0A0A0" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="off" textContentType="none" importantForAutofill="no" autoCorrect={false} spellCheck={false} />
          {renderMessage(modalMessage)}
          <Pressable style={[myInfoStyles.modalButton, (saving || currentPasswordStatus !== 'valid') && myInfoStyles.modalButtonDisabled]} onPress={() => void submitPassword()} disabled={saving || currentPasswordStatus !== 'valid'}><Text style={myInfoStyles.modalButtonText}>{saving ? '변경 중...' : '변경하기'}</Text></Pressable>
          <Pressable style={myInfoStyles.cancelButton} onPress={closeModal}><Text style={myInfoStyles.cancelButtonText}>취소</Text></Pressable>
        </View></View>
      </Modal>

      <Modal visible={modalType === 'address'} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={myInfoStyles.modalOverlay}><View style={myInfoStyles.modalContent}>
          <Text style={myInfoStyles.modalTitle}>주소 변경</Text>
          <AddressInput value={address} detailValue={detailAddress} onChangeText={setAddress} onDetailChangeText={setDetailAddress} />
          {renderMessage(modalMessage)}
          <Pressable style={myInfoStyles.modalButton} onPress={() => void submitAddress()} disabled={saving}><Text style={myInfoStyles.modalButtonText}>{saving ? '변경 중...' : '변경하기'}</Text></Pressable>
          <Pressable style={myInfoStyles.cancelButton} onPress={closeModal}><Text style={myInfoStyles.cancelButtonText}>취소</Text></Pressable>
        </View></View>
      </Modal>
    </View>
  );
}

function uploadFilename(fileName?: string, originalPath?: string, contentType?: string) {
  const pathName = originalPath?.split(/[\\/]/).pop();
  const sourceName = fileName || pathName;
  const uuidFilename = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\.[^.]+)?$/i;
  if (sourceName && !uuidFilename.test(sourceName)) return sourceName;

  const fileExtension = contentType?.split('/')[1]?.toLowerCase() === 'jpeg'
    ? 'jpg'
    : contentType?.split('/')[1]?.toLowerCase() ?? 'jpg';
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `profile_${timestamp}.${fileExtension}`;
}

function InfoRow({label, value, last = false}: {label: string; value: string; last?: boolean}) {
  return <View style={[myInfoStyles.infoRow, last && myInfoStyles.infoRowLast]}>
    <Text style={myInfoStyles.infoLabel}>{label}</Text>
    <Text style={myInfoStyles.infoValue}>{value || '-'}</Text>
  </View>;
}

export default MyInfoScreen;
