import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    position: 'relative'
  },
  content: {
    flex: 1,
    marginBottom: 80,
    padding: 20,
    width: '100%'
  },
  itemBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12,
    width: '100%'
  },
  itemLabel: {
    color: '#999',
    fontSize: 16,
    marginRight: 10
  },
  itemValue: {
    flex: 1,
    fontSize: 18
  },
  confirmBtn: {
    alignItems: 'center',
    backgroundColor: 'rgb(208, 68, 40)',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    position: 'absolute'
  },
  confirmBtnText: {
    color: 'white',
    fontSize: 20
  }
});
