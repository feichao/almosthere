import { DeviceEventEmitter } from 'react-native';
import PushNotification from 'react-native-push-notification';

import { Locations } from '../model';

let subscription = null;

const actions = ['稍后提醒', '不再提醒'];
const unsubscribeNotification = () => {
	if (subscription && typeof subscription.remove) {
		subscription.remove();
	}
};

const subscribeNotification = () => {
  // 注册通知行为
  PushNotification.registerNotificationActions(actions);
  
  // 取消订阅
  unsubscribeNotification();

  // 订阅通知
	subscription = DeviceEventEmitter.addListener('notificationActionReceived', action => {
		const info = JSON.parse(action.dataJSON);
    const locationId = info.locationId;
    if (locationId !== undefined) {
      switch(info.action) {
        case actions[0]:
          break;
        case actions[1]:
          Locations.saveLocation({
            id: locationId,
            stopAlert: true
          });
          break;
        default: break;
      }
    }
	});
};

export default subscribeNotification;