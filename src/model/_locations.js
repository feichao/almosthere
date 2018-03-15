import Constants from '../constants';

export default {
  getLocations() {
    return storage.load({
      key: Constants.Commom.STORAGE.LOCATIONS
    }).then(_locations => {
      return _locations;
    }).catch(error => {
      console.log(error);
      return [];
    });
  },
  saveLocations(locations) {
    return storage.save({
      key: Constants.Commom.STORAGE.LOCATIONS,
      data: locations
    });
  },
  saveLocation(location = {}) {
    return this.getLocations().then(_locations => {
      if (location.id === undefined) {
        _locations.push(Object.assign({
          deleted: false,
          createAt: +new Date()
        }, location, {id: _locations.length}));
      } else {
        for(let i = 0; i < _locations.length; i++) {
          if (_locations[i].id === location.id) {
            _locations[i] = Object.assign(_locations[i], location);
            break;
          }
        }
      }
      return storage.save({
        key: Constants.Commom.STORAGE.LOCATIONS,
        data: _locations
      });
    });
  }
};
