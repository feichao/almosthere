import Constants from '../constants';

export default {
  getSettings() {
    return storage.load({
      key: Constants.Common.STORAGE.SETTINGS
    }).then(setting => {
      return setting;
    }).catch(error => {
      return {};
    });
  },
  saveSettings(setting) {
    return storage.save({
      key: Constants.Common.STORAGE.SETTINGS,
      data: setting
    });
  }
}