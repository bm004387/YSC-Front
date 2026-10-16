import {StyleSheet} from 'react-native';

import colors from './colors';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.48)',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFrame: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 76,
    height: 76,
    backgroundColor: 'transparent',
  },
  title: {
    color: colors.gray900,
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    width: 156,
    height: 4,
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: 'rgba(17, 17, 17, 0.12)',
  },
  progressFill: {
    width: 52,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
  compactContainer: {
    flex: 1,
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  compactLogoFrame: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  compactLogo: {
    width: 21,
    height: 21,
    backgroundColor: 'transparent',
  },
  compactContent: {
    width: 126,
  },
  compactLabel: {
    marginBottom: 5,
    color: colors.gray500,
    fontSize: 10,
  },
  compactProgressTrack: {
    width: 126,
    height: 3,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: colors.gray200,
  },
  compactProgressFill: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.black,
  },
});

export default styles;
