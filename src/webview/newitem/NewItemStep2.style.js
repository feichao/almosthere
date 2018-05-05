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
    marginBottom: 18
  },
  itemBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
    width: '100%'
  },
  itemLabel: {
    color: '#666',
    fontSize: 16,
    width: 100
  },
  itemValue: {
    flex: 1,
    flexDirection: 'row',
    fontSize: 16,
    marginHorizontal: -4,
    marginVertical: -8
  },
  itemSwitch: {
    marginLeft: -4
  },
  itemTime: {
    backgroundColor: 'rgb(208, 68, 40)',
    borderRadius: 2,
    elevation: 2,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: 'rgba(208, 68, 40, .8)',
    shadowOffset: {
      height: 2,
      width: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
    marginLeft: 100
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
