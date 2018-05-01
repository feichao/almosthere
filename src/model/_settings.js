import Constants from '../constants';

export default {
  getSettings() {
    return storage.load({
      key: Constants.Commom.STORAGE.SETTINGS
    }).then(setting => {
      return setting;
    }).catch(error => {
      return {};
    });
  },
  saveSettings(setting) {
    return storage.save({
      key: Constants.Commom.STORAGE.SETTINGS,
      data: setting
    });
  }
}