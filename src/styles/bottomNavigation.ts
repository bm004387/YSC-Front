import {StyleSheet} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  item: {
    flex: 1,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 21,
    color: colors.gray500,
  },
  label: {
    fontSize: 11,
    color: colors.gray500,
  },
  activeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    color: colors.gray500,
  },
  retryButton: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default styles;
