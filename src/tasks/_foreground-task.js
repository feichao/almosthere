import { NativeAppEventEmitter } from 'react-native';
import { Utils } from 'react-native-amap3d';
import PushNotification from 'react-native-push-notification';

import Constants from '../constants';
import Tools from '../utils';
import { AMapLocation } from '../modules';
import { Locations, Settings } from '../model';

let lastDis = Infinity;
let subscription;
let validLocations;
let enableHighAccuracy = false;
let enableSound = false;
let enableVibration = false;

const unsubscribeLocation = () => {
	if (subscription && typeof subscription.remove) {
		subscription.remove();
	}
};

const subscribeLocation = () => {
	// 取消订阅
	unsubscribeLocation();

	subscription = NativeAppEventEmitter.addListener(Constants.Common.LOCATION_RESULT, result => {
		if (result.code !== undefined || result.error) {
			console.log('定位失败: ', result);
		} else {
			const { longitude, latitude } = result.coordinate;
			if (Array.isArray(validLocations) && validLocations.length) {
				const { longitude, latitude } = result.coordinate;
				validLocations.forEach(lo => {
					Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
						const _loDis = +lo.distance;
						if (dis < _loDis && lastDis - dis > 100) {
							PushNotification.localNotification({
								title: '到这儿',
								message: `距离${lo.name}仅剩 ${Math.floor(dis)} 米`,
								bigText: `距离${lo.name}仅剩 ${Math.floor(dis)} 米, 当前精度 ${result.accuracy} 米`,
								playSound: enableSound,
								vibrate: enableVibration,
								vibration: 1000,
								soundName: 'default',
								actions: '["稍后提醒", "不再提醒"]',
								locationId: lo.id
							});
						}

						lastDis = dis;
					});
				});
			}
		};
	});
}

const task = () => {
	console.log('********* run foreground task *********');

	Promise.all([Settings.getSettings(), Locations.getLocations()]).then(data => {
		const settings = data[0];

		enableHighAccuracy = !!settings.enableHighAccuracy;
		enableSound = settings.enableSound === undefined ? true : !!settings.enableSound;
		enableVibration = settings.enableVibration === undefined ? true : !!settings.enableVibration;

		const allLocations = data[1];
		const enableLocations = allLocations.filter(l => !l.deleted && l.enable);

		const now = new Date();
		const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

		validLocations = enableLocations.filter(lo => !lo.stopAlert).filter(lo => {
			const startOff = Tools.getTimeSeconds(lo.startOff);
			const arrived = Tools.getTimeSeconds(lo.arrived);
			return startOff <= nowTime && arrived >= nowTime;
		});

		if (allLocations.length <= 0 || enableLocations.length > 0) {
			AMapLocation.getLocation({
				allowsBackgroundLocationUpdates: true,
				gpsFirst: enableHighAccuracy,
				locationMode: enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING,
			});
		}

	}).finally(() => { });
};

export { subscribeLocation, unsubscribeLocation };
export default task;