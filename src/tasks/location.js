import { ToastAndroid } from 'react-native';

import PushNotification from 'react-native-push-notification';
import BackgroundJob from 'react-native-background-job';

import Constants from '../constants';
import { Utils } from 'react-native-amap3d';
import { AMapLocation } from '../modules';
import { Locations, Settings } from '../model';

let lastDis = Infinity;
const locationErrorTimes = 0;
const notify = () => {
	return Promise.all([Settings.getSettings(), Locations.getLocations()]).then(data => {
		const settings = data[0];
		const enableHighAccuracy = settings.enableHighAccuracy;
		const enableSound = settings.enableSound === undefined ? true : !!settings.enableSound;
		const enableVibration = settings.enableVibration === undefined ? true : !!settings.enableVibration;

		const locations = data[1];
		const _locations = locations.filter(l => !l.deleted && l.enable);
		if (_locations.length > 0) {
			AMapLocation.setOptions({
				locationMode: enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING,
				gpsFirst: enableHighAccuracy,
				interval: 1,
				onceLocation: false,
				allowsBackgroundLocationUpdates: true
			});
			return AMapLocation.startUpdatingLocation().then(position => {
				// 初始化定位失败次数
				locationErrorTimes = 0;

				const { longitude, latitude } = position.coordinate;
				_locations.forEach(lo => {
					Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
						const _loDis = +lo.distance;
						if (dis < _loDis) {
							// 用户设置本次不再提醒
							if (lo.alertTomorrow) {
								// noop
							} else {
								// 用户设置稍后提醒, 则当距离减少量大于 100 米时提醒用户
								// if (!lo.alertLater || (lo.alertLater && lastDis - dis > 100)) {
								PushNotification.localNotification({
									title: '到这儿',
									message: `距离${lo.name}仅剩 ${Math.floor(dis)} 米, 当前精度 ${position.accuracy} 米`,
									bigText: `距离${lo.name}仅剩 ${Math.floor(dis)} 米`,
									playSound: enableSound,
									vibrate: enableVibration,
									vibration: 2000,
									soundName: 'default',
									actions: '["稍后提醒", "不再提醒"]',
									locationId: lo.id
								});
								// }
							}
						}

						// 如果当前距离大于 设置的距离 + 精度 * 2, 则重置不再提醒功能
						if (dis > (position.accuracy * 2 + _loDis)) {
							lo.alertTomorrow = false;
						}

						lastDis = dis;
					});
				});
			}).catch(() => {
				locationErrorTimes++;
				// 连续定位失败超过 12 次 (1min), 而且用户没有禁止定位失败提醒, 则提醒用户定位失败
				if (locationErrorTimes > 12) {
					locationErrorTimes = 0;
					PushNotification.localNotification({
						title: '到这儿',
						message: '定位失败, 可能是手机信号不好, 正在重试...',
						bigText: '定位失败',
						playSound: enableSound,
						vibrate: enableVibration,
						vibration: 2000,
						soundName: 'default'
					});
				}
			});
		}
		return Promise.resolve(false);
	});
};

const watchNotify = () => {
	return notify().finally(() => {
		// PushNotification.localNotification({
		// 	title: '到这儿',
		// 	message: '定位失败, 可能是手机信号不好, 正在重试...',
		// 	bigText: '定位失败',
		// 	vibration: 2000,
		// 	soundName: 'default'
		// });
	});
};

// APP 运行时, 前台任务
const FORE_LOCATION_JOB_KEY = 'foreLocationJob';

// APP 关闭退出后, 后台任务
const BACK_LOCATION_JOB_KEY = 'backLocationJob';

BackgroundJob.register({
	jobKey: FORE_LOCATION_JOB_KEY,
	job: async () => await watchNotify()
});

BackgroundJob.register({
	jobKey: BACK_LOCATION_JOB_KEY,
	job: async () => await watchNotify()
});

BackgroundJob.schedule({
	jobKey: FORE_LOCATION_JOB_KEY,
	override: true,
	allowWhileIdle: true,
	allowExecutionInForeground: true,
	period: Constants.Commom.GET_LOCATION_TIMEOUT,
	exact: true
});

BackgroundJob.schedule({
	jobKey: BACK_LOCATION_JOB_KEY,
	override: true,
	allowWhileIdle: true,
	period: Constants.Commom.GET_LOCATION_TIMEOUT
});