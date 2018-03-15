import { AsyncStorage, DeviceEventEmitter } from 'react-native';
import Storage from 'react-native-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationAndroid from 'react-native-push-notification';

import { Locations, Settings } from './src/model';

/**
 * Storage
 */
const storage = new Storage({
  size: 1000,
  storageBackend: AsyncStorage,
  defaultExpires: null,
  enableCache: true,
});

global.storage = storage;

/**
 * PushNotification
 */
PushNotificationAndroid.registerNotificationActions(['关闭提醒']);
DeviceEventEmitter.addListener('notificationActionReceived', function(action){
  const info = JSON.parse(action.dataJSON);
  const locationId = info.locationId;
  if (info.action === '关闭提醒' && locationId !== undefined) {
    Locations.getLocations().then(locations => {
      for (let i = 0; i < locations.length; i++) {
        if (locations[i].id === locationId) {
          locations[i].enable = false;
          Locations.saveLocation(locations[i]);
          return;
        }
      }
    });
  }
  if (info.action === '此后不再提醒') {
    Settings.getSettings().then(settings => {
      Settings.saveSettings(Object.assign({}, settings, {
        stopLocationErrorNotify: true
      }));
    });
  }
});
PushNotification.configure({
  onRegister: function (token) {
  },
  onNotification: function (notification) {
  },
});