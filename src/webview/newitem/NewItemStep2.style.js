import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    marginBottom: 36,
    padding: 20,
    width: '100%'
  },
  itemContainer: {
    marginBottom: 20
  },
  itemBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12,
    width: '100%'
  },
  itemLabel: {
    color: '#666',
    fontSize: 16,
    marginRight: 10
  },
  itemValue: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 16
  },
  itemTime: {
    backgroundColor: 'rgb(208, 68, 40)',
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  itemTimeValue: {
    color: 'white',
    flex: 1,
    flexDirection: 'row',
    fontSize: 16
  },
  itemDesc: {
    color: '#aaa',
    fontSize: 14,
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
    fontSize: 20,
    lineHeight: 36
  }
});
