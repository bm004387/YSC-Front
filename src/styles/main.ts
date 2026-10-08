import {StyleSheet} from 'react-native';

import colors from './colors';

const mainStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    height: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
  },

  menuButton: {
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: colors.gray500,
    lineHeight: 22,
    marginBottom: 32,
  },

  welcomeCard: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: colors.gray50,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 8,
  },

  cardText: {
    fontSize: 14,
    color: colors.gray500,
    lineHeight: 21,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },

});

export default mainStyles;
