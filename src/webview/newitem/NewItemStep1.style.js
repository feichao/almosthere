import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    position: 'relative'
  },
  searchContainer: {
    alignItems: 'flex-start',
    height: 54,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 99
  },
  searchInnerContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 54,
    paddingHorizontal: 10,

    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
  },
  searchBtn: {
    backgroundColor: 'rgb(208, 68, 40)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchBtnText: {
    color: 'white'
  },
  suggestions: {
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 54,
    zIndex: 999
  },
  itemBlock: {
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    borderStyle: 'solid',
    padding: 10
  },
  itemName: {
    fontSize: 16
  },
  itemAddress: {
    color: '#999',
    fontSize: 14,
    marginTop: 6,
  },
  map: {
    marginTop: 54,
    flex: 1,
    width: '100%'
  },
  nextStepBtn: {
    backgroundColor: 'rgb(208, 68, 40)',
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
    width: '100%',
    zIndex: 100
  },
  nextStepBtnText: {
    color: 'white',
    fontSize: 20
  }
});
