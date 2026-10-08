import React, {useState} from 'react';

import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import myInfoStyles from '../styles/myInfo';

interface MyInfoScreenProps {
  onBack: () => void;
}

type ModalType = 'password' | 'adress' | null;

function MyInfoScreen({
  onBack,
}: MyInfoScreenProps) {

  const [modalType, setModalType] =
    useState<ModalType>(null);

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <View style={myInfoStyles.container}>

      {/* Header */}
      <View style={myInfoStyles.header}>

        <Pressable
          style={myInfoStyles.backButton}
          onPress={onBack}>

          <Text style={myInfoStyles.backButtonText}>
            ‹
          </Text>

        </Pressable>

        <Text style={myInfoStyles.headerTitle}>
          내 정보
        </Text>

      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}>

        <View style={myInfoStyles.content}>

          {/* Profile */}
          <View style={myInfoStyles.profileArea}>

            <View style={myInfoStyles.profileImage}>

              <Text style={myInfoStyles.profileText}>
                Y
              </Text>

            </View>

            <Pressable
              style={myInfoStyles.profileButton}
              onPress={() => {}}>

              <Text style={myInfoStyles.profileButtonText}>
                프로필 사진 변경
              </Text>

            </Pressable>

          </View>

          {/* 기본 정보 */}
          <View style={myInfoStyles.section}>

            <Text style={myInfoStyles.sectionTitle}>
              기본 정보
            </Text>

            <View style={myInfoStyles.infoCard}>

              <View style={myInfoStyles.infoRow}>

                <Text style={myInfoStyles.infoLabel}>
                  아이디
                </Text>

                <Text style={myInfoStyles.infoValue}>
                  -
                </Text>

              </View>

              <View style={myInfoStyles.infoRow}>

                <Text style={myInfoStyles.infoLabel}>
                  이름
                </Text>

                <Text style={myInfoStyles.infoValue}>
                  -
                </Text>

              </View>

              <View
                style={[
                  myInfoStyles.infoRow,
                  myInfoStyles.infoRowLast,
                ]}>

                <Text style={myInfoStyles.infoLabel}>
                  휴대폰
                </Text>

                <Text style={myInfoStyles.infoValue}>
                  -
                </Text>

              </View>

            </View>

          </View>

          {/* 계정 설정 */}
          <View style={myInfoStyles.section}>

            <Text style={myInfoStyles.sectionTitle}>
              계정 설정
            </Text>

            <View style={myInfoStyles.settingCard}>

              {/* 비밀번호 */}
              <Pressable
                style={myInfoStyles.settingRow}
                onPress={() =>
                  setModalType('password')
                }>

                <Text style={myInfoStyles.settingTitle}>
                  비밀번호 변경
                </Text>

                <Text style={myInfoStyles.settingArrow}>
                  ›
                </Text>

              </Pressable>

              {/* 주소 */}
              <Pressable
                style={[
                  myInfoStyles.settingRow,
                  myInfoStyles.settingRowLast,
                ]}
                onPress={() =>
                  setModalType('adress')
                }>

                <Text style={myInfoStyles.settingTitle}>
                  주소 변경
                </Text>

                <Text style={myInfoStyles.settingArrow}>
                  ›
                </Text>

              </Pressable>

            </View>

          </View>

        </View>

      </ScrollView>

      {/* 비밀번호 변경 */}
      <Modal
        visible={modalType === 'password'}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>

        <View style={myInfoStyles.modalOverlay}>

          <View style={myInfoStyles.modalContent}>

            <Text style={myInfoStyles.modalTitle}>
              비밀번호 변경
            </Text>

            <TextInput
              style={myInfoStyles.input}
              placeholder="현재 비밀번호"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <TextInput
              style={myInfoStyles.input}
              placeholder="새 비밀번호"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <TextInput
              style={myInfoStyles.input}
              placeholder="새 비밀번호 확인"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Pressable
              style={myInfoStyles.modalButton}
              onPress={closeModal}>

              <Text style={myInfoStyles.modalButtonText}>
                변경하기
              </Text>

            </Pressable>

            <Pressable
              style={myInfoStyles.cancelButton}
              onPress={closeModal}>

              <Text style={myInfoStyles.cancelButtonText}>
                취소
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

      {/* 주소 변경 */}
      <Modal
        visible={modalType === 'adress'}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>

        <View style={myInfoStyles.modalOverlay}>

          <View style={myInfoStyles.modalContent}>

            <Text style={myInfoStyles.modalTitle}>
              주소 변경
            </Text>

            <TextInput
              style={myInfoStyles.input}
              placeholder="주소"
              placeholderTextColor="#A0A0A0"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <TextInput
              style={myInfoStyles.input}
              placeholder="상세 주소"
              placeholderTextColor="#A0A0A0"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Pressable
              style={myInfoStyles.modalButton}
              onPress={closeModal}>

              <Text style={myInfoStyles.modalButtonText}>
                변경하기
              </Text>

            </Pressable>

            <Pressable
              style={myInfoStyles.cancelButton}
              onPress={closeModal}>

              <Text style={myInfoStyles.cancelButtonText}>
                취소
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </View>
  );
}

export default MyInfoScreen;
