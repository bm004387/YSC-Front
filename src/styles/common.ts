import {StyleSheet} from 'react-native';

import colors from './colors';

const commonStyles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    color: colors.gray500,
    lineHeight: 22,
    marginBottom: 36,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },

  // 필수값 *
  required: {
    color: '#E53935',
    fontWeight: '700',
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.black,
    backgroundColor: colors.gray50,
  },

  inputError: {
    borderColor: '#E53935',
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#E53935',
  },

  // 사용 가능한 아이디
  availableText: {
    marginTop: 6,
    fontSize: 12,
    color: '#2E7D32',
  },

  primaryButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // 회원가입 버튼 비활성화
  disabledButton: {
    backgroundColor: colors.gray200,
  },

  disabledButtonText: {
    color: colors.gray400,
  },

  bottomArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },

  bottomText: {
    fontSize: 14,
    color: colors.gray400,
  },

  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },

  backButton: {
    marginBottom: 28,
  },

  backText: {
    fontSize: 15,
    color: colors.gray700,
  },

  // 아이디
  idInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  idInput: {
    flex: 1,
  },

  checkButton: {
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // 주소
  addressInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  addressInput: {
    flex: 1,
  },

  addressButton: {
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addressButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // 메인 화면
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: colors.background,
  },

  mainTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 20,
  },

  mainMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 8,
  },

  mainSubMessage: {
    fontSize: 15,
    color: colors.gray500,
  },

});

export default commonStyles;