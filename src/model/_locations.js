import Constants from '../constants';

/**
 * location: {
 *  id: num 位置 ID, 唯一
 *  name: string 位置名字
 *  description: string 位置描述
 *  enable: bool 是否启用
 *  distance: num 提醒阈值
 *  deleted: bool 是否删除
 *  startOff: array[hour: num, minute: num, second: num] 开始提醒时间
 *  arrived: array[hour: num, minute: num, second: num] 结束提醒时间
 *  stopAlert: startOff ~ arrived 时间段内不再提醒
 * }
 */
export default {
  getLocations() {
    return storage.load({
      key: Constants.Common.STORAGE.LOCATIONS
    }).then(_locations => {
      return _locations;
    }).catch(error => {
      return [];
    });
  },
  saveLocations(locations) {
    return storage.save({
      key: Constants.Common.STORAGE.LOCATIONS,
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
        key: Constants.Common.STORAGE.LOCATIONS,
        data: _locations
      });
    });
  }
};
