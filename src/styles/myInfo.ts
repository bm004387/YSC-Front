import {StyleSheet} from 'react-native';

import colors from './colors';

const myInfoStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  backButton: {
    width: 50,
    height: 40,
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 26,
    color: colors.gray900,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  profileArea: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray500,
  },

  profileButton: {
    marginTop: 12,
  },

  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },

  message: {
    alignSelf: 'stretch',
    marginTop: 4,
    marginBottom: 8,
    color: '#D93025',
    fontSize: 12,
    textAlign: 'center',
  },

  messageSuccess: {
    color: '#188038',
  },

  modalButtonDisabled: {
    opacity: 0.5,
  },

  loader: {
    flex: 1,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 12,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 14,
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  addressInfoRow: {
    minHeight: 76,
    paddingVertical: 14,
  },

  addressValues: {
    flex: 1,
    marginLeft: 16,
    alignItems: 'flex-end',
  },

  addressDetailValue: {
    marginTop: 3,
    fontSize: 13,
    color: colors.gray500,
    textAlign: 'right',
  },

  infoLabel: {
    fontSize: 14,
    color: colors.gray500,
  },

  infoValue: {
    fontSize: 14,
    color: colors.gray900,
    fontWeight: '500',
  },

  settingCard: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 14,
    overflow: 'hidden',
  },

  settingRow: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  settingRowLast: {
    borderBottomWidth: 0,
  },

  settingTitle: {
    fontSize: 14,
    color: colors.gray900,
    fontWeight: '500',
  },

  settingArrow: {
    fontSize: 18,
    color: colors.gray400,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 20,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.gray900,
    marginBottom: 12,
  },

  modalButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  modalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  cancelButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    color: colors.gray500,
  },

  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 34,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: 'rgba(32, 36, 45, 0.92)',
    zIndex: 10,
    elevation: 6,
  },

  toastText: {color: '#fff', fontSize: 13, fontWeight: '600'},

});

export default myInfoStyles;
