import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {alignItems: 'center', width: '100%'},
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 22, marginVertical: 28},
  dot: {width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#222', backgroundColor: 'transparent'},
  dotFilled: {backgroundColor: '#111'},
  keypad: {width: '100%', maxWidth: 330, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  key: {width: '33.333%', height: 66, alignItems: 'center', justifyContent: 'center'},
  keyText: {fontSize: 27, fontWeight: '400', color: '#111'},
});

export default styles;
