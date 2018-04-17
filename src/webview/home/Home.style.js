import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  setting: {
    height: 20,
    marginRight: 20,
    width: 20,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    position: 'relative'
  },
  mainView: {
    flex: 1,
    width: '100%'
  },
  mainScrollView: {
    padding: 10
  },
  itemBlock: {
    // backgroundColor: '#f7f7f7',
    // borderLeftColor: 'rgb(208, 68, 40)',
    // borderLeftWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    color: 'black',
    fontSize: 18,
  },
  itemDesc: {
    fontSize: 14,
    lineHeight: 16,
    marginTop: 8
  },
  itemValidTip: {
    color: 'rgb(208, 68, 40)',
    fontSize: 14,
    marginTop: 5
  },
  itemInvalidTip: {
    color: '#999',
    fontSize: 14,
    marginTop: 5
  },
  emptyTip: {
    color: '#bbb',
    fontSize: 16,
    position: 'absolute',
    textAlign: 'center',
    top: '40%',
    width: '100%'
  },
  opeContainer: {
    backgroundColor: 'white',
    borderRadius: 2,
    elevation: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    top: '30%',
    width: '72%'
  },
  opeBtn1: {
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    paddingHorizontal: 24,
    paddingVertical: 8
  },
  opeBtn2: {
    paddingHorizontal: 24,
    paddingVertical: 8
  },
  opeBtnText: {
    fontSize: 18,
    lineHeight: 40
  },
  addBtn: {
    alignItems: 'center',
    backgroundColor: 'rgb(208, 68, 40)',
    borderRadius: 54,
    bottom: 30,
    height: 54,
    position: 'absolute',
    width: 54
  },
  addBtnText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '100',
    lineHeight: 50
  }
});
