import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  header: {height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E7E7E7'},
  backButton: {width: 42, height: 44, justifyContent: 'center'},
  backText: {fontSize: 30, color: '#111'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: '#111'},
  content: {paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40},
  tabs: {height: 48, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E7E7E7'},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent'},
  activeTab: {borderBottomColor: '#111'},
  tabText: {fontSize: 14, color: '#888'},
  activeTabText: {fontWeight: '700', color: '#111'},
  description: {fontSize: 14, color: '#666', lineHeight: 21, marginTop: 22, marginBottom: 24},
  resultCard: {marginTop: 12, padding: 18, borderRadius: 14, backgroundColor: '#F6F6F6', alignItems: 'center'},
  resultLabel: {fontSize: 13, color: '#777'},
  resultValue: {fontSize: 20, fontWeight: '700', color: '#111', marginTop: 8},
  disabled: {opacity: 0.6},
  completeArea: {marginTop: 34},
  completeText: {fontSize: 15, color: '#188038', textAlign: 'center', marginBottom: 22},
});

export default styles;
