import { ToastAndroid } from 'react-native';

import PushNotification from 'react-native-push-notification';
import BackgroundJob from 'react-native-background-job';

import Constants from '../constants';
import { Utils } from 'react-native-amap3d';
import { AMapLocation } from '../modules';
import { Locations, Settings } from '../model';

const locationErrorTimes = 0;
const lastDis = Infinity;
const notify = () => {
	return Promise.all([Locations.getLocations(), Settings.getSettings()]).then(data => {
		const locations = data[0];
		const settings = data[1];
		const _locations = locations.filter(l => !l.deleted && l.enable);
		if (_locations.length > 0) {
			return AMapLocation.getLocation({
				locationMode: settings.enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING,
				allowsBackgroundLocationUpdates: true
			}).then(position => {
				// 初始化定位失败次数
				locationErrorTimes = 0;

				const { longitude, latitude } = position.coordinate;
				_locations.forEach(lo => {
					Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
						if (dis < +lo.distance) {
							// 提醒模式: 
							//	 当前距离 > 500m 时, 每隔 100m 提醒一次
							//	 当前距离 < 500m 时, 每隔 50m 提醒一次
							//   当前距离 < 300m 时, 每隔 20m 提醒一次
							//   当前距离 < 100m 时, 每隔 5s 提醒一次
							if (dis >= 500 && lastDis - dis > 100) {
								PushNotification.localNotification({
									title: '到这儿',
									message: `请注意, 距离${lo.name}还有 ${Math.floor(dis)}m, 当前精度 ${position.accuracy}m`,
									bigText: `请注意, 距离${lo.name}还有 ${Math.floor(dis)}m`,
									playSound: settings.enableSound === undefined ? true : !!settings.enableSound,
									vibrate: settings.enableVibration === undefined ? true : !!settings.enableVibration,
									vibration: 1000,
									soundName: 'default',
									actions: '["关闭提醒"]',
									locationId: lo.id
								});
							} else if (dis < 500 && dis >= 300 && lastDis - dis > 50) {
								PushNotification.localNotification({
									title: '到这儿',
									message: `请注意, 距离${lo.name}仅剩 ${Math.floor(dis)}m, 当前精度 ${position.accuracy}m`,
									bigText: `请注意, 距离${lo.name}仅剩 ${Math.floor(dis)}m`,
									playSound: settings.enableSound === undefined ? true : !!settings.enableSound,
									vibrate: settings.enableVibration === undefined ? true : !!settings.enableVibration,
									vibration: 2000,
									soundName: 'default',
									actions: '["关闭提醒"]',
									locationId: lo.id
								});
							} else if (dis < 300 && lastDis - dis > 20) {
								PushNotification.localNotification({
									title: '到这儿',
									message: `紧急, 距离${lo.name}仅剩 ${Math.floor(dis)}m, 当前精度 ${position.accuracy}m`,
									bigText: `紧急, 距离${lo.name}仅剩 ${Math.floor(dis)}m`,
									playSound: settings.enableSound === undefined ? true : !!settings.enableSound,
									vibrate: settings.enableVibration === undefined ? true : !!settings.enableVibration,
									vibration: 2000,
									soundName: 'default',
									actions: '["关闭提醒"]',
									locationId: lo.id
								});
							} else if (dis < 100) {
								PushNotification.localNotification({
									title: '到这儿',
									message: `紧急紧急紧急, 距离${lo.name}仅剩 ${Math.floor(dis)}m, 当前精度 ${position.accuracy}m`,
									bigText: `紧急紧急紧急, 距离${lo.name}仅剩 ${Math.floor(dis)}m`,
									playSound: settings.enableSound === undefined ? true : !!settings.enableSound,
									vibrate: settings.enableVibration === undefined ? true : !!settings.enableVibration,
									vibration: 2000,
									soundName: 'default',
									actions: '["关闭提醒"]',
									locationId: lo.id
								});
							}
							lastDis = dis;
						}
					});
				});
			}).catch(() => {
				locationErrorTimes++;
				// 连续定位失败超过 12 次 (1min), 而且用户没有禁止定位失败提醒, 则提醒用户定位失败
				if (locationErrorTimes > 12 && !settings.stopLocationErrorNotify) {
					locationErrorTimes = 0;
					PushNotification.localNotification({
						title: '到这儿',
						message: '持续定位失败, 可能是手机信号不好, 正在重试...',
						bigText: '定位失败',
						playSound: settings.enableSound === undefined ? true : !!settings.enableSound,
						vibrate: settings.enableVibration === undefined ? true : !!settings.enableVibration,
						vibration: 2000,
						soundName: 'default',
						actions: '["此后不再提醒"]',
					});
				}
			});
		}
		return Promise.reject(false);
	});
};

const watchNotify = () => {
	
	PushNotification.localNotification({
		title: '到这儿',
		message: '持续定位失败, 可能是手机信号不好, 正在重试...',
		bigText: '定位失败',
		vibration: 2000,
		soundName: 'default',
		actions: '["此后不再提醒"]',
	});

	notify().finally(() => {});
};

// APP 运行时, 前台任务
const FORE_LOCATION_JOB_KEY = 'foreLocationJob';

// APP 关闭退出后, 后台任务
const BACK_LOCATION_JOB_KEY = 'backLocationJob';

BackgroundJob.register({
	jobKey: FORE_LOCATION_JOB_KEY,
	job: () => watchNotify()
});

BackgroundJob.register({
	jobKey: BACK_LOCATION_JOB_KEY,
	job: () => watchNotify()
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