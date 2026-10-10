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

  loginContent: {
    paddingVertical: 16,
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

  loginLogo: {
    width: 88,
    height: 88,
    resizeMode: 'contain',
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

  required: {
    color: colors.error,
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

  inputFocused: {
    borderColor: colors.black,
    backgroundColor: colors.white,
  },

  inputDisabled: {
    backgroundColor: colors.gray200,
    color: colors.gray500,
  },

  inputError: {
    borderColor: colors.error,
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.error,
  },

  availableText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.success,
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

  phoneInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  phoneInput: {
    flex: 1,
    marginRight: 8,
  },

  smsButton: {
    width: 90,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smsButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  verifyInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  verifyInput: {
    flex: 1,
  },

  verifyButton: {
    width: 90,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  adressInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  adressInput: {
    flex: 1,
  },

  adressButton: {
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  adressButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  subInput: {
    marginTop: 8,
  },

  modalContainer: {
    flex: 1,
  },

  modalHeader: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },

  modalClose: {
    fontSize: 14,
    color: colors.gray700,
  },

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
