import { NativeModules, ToastAndroid, NativeAppEventEmitter, DeviceEventEmitter } from 'react-native';
import PushNotification from 'react-native-push-notification';
import BackgroundJob from 'react-native-background-job';
import { Utils } from 'react-native-amap3d';

import Constants from '../constants';
import Tools from '../utils';
import { AMapLocation } from '../modules';
import { Locations, Settings } from '../model';


let locationErrorTimes = 0; 			// 记录连续定位失败的次数
let subscribeNotificationResult;
let subscribeLocationResult;
let validLocations;
let enableHighAccuracy = false;
let enableSound = false;
let enableVibration = false;

/**
 * 每天凌晨 2:44 ~ 3:00 期间, 重置 alertTomorrow
 * 假设 2:44 ~ 3:00 期间没有上下班
 */
let isReset = false;
const resetLocation = locations => {
	const now = new Date();
	const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

	if (nowTime > 9840 && nowTime < 10800 && !isReset) {
		isReset = true;

		locations.forEach(lo => lo.alertTomorrow = false);
		return Locations.saveLocations(locations);
	} else if (nowTime > 10800) {
		isReset = false;
	}
	return Promise.resolve(true);
}

const unListenNotificationResult = () => {
	if (subscribeNotificationResult && typeof subscribeNotificationResult.remove) {
		subscribeNotificationResult.remove();
	}
};
const listenNotificationResult = () => {
	PushNotification.registerNotificationActions(['稍后提醒', '不再提醒']);
	subscribeNotificationResult = DeviceEventEmitter.addListener('notificationActionReceived', function(action){
		const info = JSON.parse(action.dataJSON);
		const locationId = info.locationId;
		console.log('notify result:', info.action, locationId);
		if (info.action === '稍后提醒' && locationId !== undefined) {
			Locations.saveLocation({
				id: locationId,
				alartLater: true
			});
		} else if ((info.action === '不再提醒') && locationId !== undefined) {
			Locations.saveLocation({
				id: locationId,
				alertTomorrow: true
			});
		}
	});
}

const unListenLocationResult = () => {
	if (subscribeLocationResult && typeof subscribeLocationResult.remove) {
		subscribeLocationResult.remove();
	}
};
const listenLocationResult = () => {
	subscribeLocationResult = NativeAppEventEmitter.addListener(Constants.Common.LOCATION_RESULT, result => {
		if (result.code !== undefined || result.error) {
			console.log('定位失败: ', result);
			locationErrorTimes++;
			// 连续定位失败超过 6 次 (1min), 而且用户没有禁止定位失败提醒, 则提醒用户定位失败
			if (locationErrorTimes > 6) {
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
		} else {
			const { longitude, latitude } = result.coordinate;
			if (Array.isArray(validLocations) && validLocations.length) {
				const { longitude, latitude } = result.coordinate;
				validLocations.forEach(lo => {
					Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
						const _loDis = +lo.distance;
						if (dis < _loDis) {
							PushNotification.localNotification({
								title: '到这儿',
								message: `距离${lo.name}仅剩 ${Math.floor(dis)} 米, 当前精度 ${result.accuracy} 米`,
								bigText: `距离${lo.name}仅剩 ${Math.floor(dis)} 米`,
								playSound: enableSound,
								vibrate: enableVibration,
								vibration: 2000,
								soundName: 'default',
								actions: '["稍后提醒", "不再提醒"]',
								locationId: lo.id
							});
						}
					});
				});

				// 定位成功, 重置定位失败次数
				locationErrorTimes = 0;
			}
		};
	});
}

const watchForeground = () => {
	console.log('watchForeground++++++++++');

	Promise.all([Settings.getSettings(), Locations.getLocations()]).then(data => {
		const settings = data[0];

		enableHighAccuracy = !!settings.enableHighAccuracy;
		enableSound = settings.enableSound === undefined ? true : !!settings.enableSound;
		enableVibration = settings.enableVibration === undefined ? true : !!settings.enableVibration;

		const now = new Date();
		const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

		const allLocations = data[1];
		const enableLocations = allLocations.filter(l => !l.deleted && l.enable);

		// 这里 reset 有可能应用一直处于前台运行状态, 没有被杀死
		resetLocation(enableLocations).then(() => {
			// 用户可能在通知栏中设置了 不再提醒
			const tempLocations = enableLocations.filter(lo => !lo.alertTomorrow);

			tempLocations.forEach(lo => {
				if (Math.abs(Tools.getTimeSeconds(lo.startOff)) - nowTime < 10 * 60) {
					lo.alertTomorrow = false;
				}
				if (Math.abs(Tools.getTimeSeconds(lo.arrived)) < nowTime) {
					lo.alertTomorrow = true;
				}
			});

			validLocations = tempLocations.filter(lo => !lo.alertTomorrow);

			if (enableLocations.length > 0) {
				AMapLocation.getLocation({
					allowsBackgroundLocationUpdates: true,
					gpsFirst: enableHighAccuracy,
					locationMode: enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING,
				})
			}
		});
	}).finally(() => { });
};

/**
 * 系统杀掉进程时, 后台常驻此服务
 * 	如果当前时间位于某个位置的提醒时间的 15 分钟区间内 (Android 系统限制), 则提示用户打开 APP
 */
const watchBackground = () => {
	const now = new Date();
	const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

	console.log('watchBackground----------');

	return Locations.getLocations().then(_locations => {
		// 重置下次提醒功能
		resetLocation(_locations);

		let validLocation = null;
		const locations = _locations.filter(l => !l.deleted && l.enable && !l.alertTomorrow);

		// 应用被清理, 监测有没有正在监测的位置信息, 优先提醒此信息
		const shouldAlertUser = locations.some(_lo => {
			if (Tools.getTimeSeconds(_lo.startOff) < nowTime && Tools.getTimeSeconds(_lo.arrived) > nowTime) {
				validLocation = _lo;
				return true;
			}
			return false;
		});

		if (shouldAlertUser) {
			return PushNotification.localNotification({
				title: '到这儿',
				message: `正在监测离${validLocation.name}的距离, 但是 <到这儿> 已被系统清理, 请点击此处重新打开 <到这儿>.`,
				bigText: `正在监测离${validLocation.name}的距离, 但是 <到这儿> 已被系统清理, 无法提供定位服务. 请点击此处重新打开 <到这儿>, 以便 <到这儿> 继续为您提供服务.`,
				vibration: 2000,
				soundName: 'default',
				actions: '["不再提醒"]',
				locationId: validLocation.id
			});
		}

		// 应用被清理, 监测有没有即将开始的提醒
		const shouldStartApp = locations.some(_lo => {
			if (Math.abs(Tools.getTimeSeconds(_lo.startOff) - nowTime) < 10 * 60) {
				validLocation = _lo;
				return true;
			}
			return false;
		});

		if (shouldStartApp) {
			return PushNotification.localNotification({
				title: '到这儿',
				message: `即将出发前往${validLocation.name}, 请点击此处打开 <到这儿>`,
				bigText: `即将出发前往${validLocation.name}, 请点击此处打开 <到这儿>.`,
				vibration: 2000,
				soundName: 'default',
				actions: '["不再提醒"]',
				locationId: validLocation.id
			});
		}
	});
};

const LOCATION_JOB_KEY_FORE = 'AlmosthereLocationJobForeground';
const LOCATION_JOB_KEY_BACK = 'AlmosthereLocationJobBackground';

BackgroundJob.cancelAll();

unListenNotificationResult();
listenNotificationResult();

BackgroundJob.register({
	jobKey: LOCATION_JOB_KEY_FORE,
	job: () => {
		NativeModules.AppState.getCurrentAppState((appStateData) => {
			console.log('fore app state: ', appStateData.app_state);
			switch (appStateData.app_state) {
				case 'active':
				case 'background':
					unListenLocationResult();
					listenLocationResult();
					watchForeground();
					break;
				case 'uninitialized':
					break;
				default: break;
			}
		}, () => { });
	}
});

BackgroundJob.register({
	jobKey: LOCATION_JOB_KEY_BACK,
	job: () => {
		NativeModules.AppState.getCurrentAppState((appStateData) => {
			console.log('back app state: ', appStateData.app_state);
			switch (appStateData.app_state) {
				case 'active':
				case 'background':
					break;
				case 'uninitialized':
					unListenLocationResult();
					watchBackground();
					break;
				default: break;
			}
		}, () => { });
	}
});

BackgroundJob.schedule({
	jobKey: LOCATION_JOB_KEY_FORE,
	allowExecutionInForeground: true,
	allowWhileIdle: true,
	period: Constants.Common.GET_LOCATION_TIMEOUT,
	exact: true,
	override: true
});

BackgroundJob.schedule({
	jobKey: LOCATION_JOB_KEY_BACK,
	allowWhileIdle: true,
	period: Constants.Common.GET_LOCATION_TIMEOUT,
	override: true
});
