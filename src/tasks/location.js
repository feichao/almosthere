import PushNotification from 'react-native-push-notification';
import BackgroundJob from 'react-native-background-job';
import { Utils } from 'react-native-amap3d';

import Constants from '../constants';
import { AMapLocation } from '../modules';
import { Locations, Settings } from '../model';


let locationErrorTimes = 0; // 记录连续定位失败的次数

const getTimeSeconds = (datetime) => {
	if (datetime instanceof Array) {
		return datetime[0] * 3600 + datetime[1] * 60 + datetime[2];
	}
	return NaN;
};

/**
 * 每天凌晨 2:44 ~ 3:00 期间, 重置 alertTomorrow
 * 假设 2:44 ~ 3:00 期间没有上下班
 */
let isReset = false;
const resetLocation = locations => {
	const now = new Date();
	const nowTime = getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

	if (nowTime > 9840 && nowTime < 10800 && !isReset) {
		isReset = true;

		locations.forEach(lo => lo.alertTomorrow = false);
		return Locations.saveLocations(locations);
	} else if (nowTime > 10800) {
		isReset = false;
	}
	return Promise.resolve(true);
}

const watchForeground = () => {
	Promise.all([Settings.getSettings(), Locations.getLocations()]).then(data => {
		const settings = data[0];
		const enableHighAccuracy = settings.enableHighAccuracy;
		const enableSound = settings.enableSound === undefined ? true : !!settings.enableSound;
		const enableVibration = settings.enableVibration === undefined ? true : !!settings.enableVibration;

		const now = new Date();
		const nowTime = getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

		const allLocations = data[1];
		const validLocations = allLocations.filter(l => !l.deleted && l.enable);

		// 这里 reset 有可能应用一直处于前台运行状态, 没有被杀死
		resetLocation(validLocations).then(() => {
			// 用户可能在通知栏中设置了 不再提醒
			const enableLocations = validLocations.filter(l => !lo.alertTomorrow);
			enableLocations.forEach(lo => {
				if (Math.abs(getTimeSeconds(lo.startOff)) - nowTime < 8 * 60) {
					lo.alertTomorrow = false;
				}
				if (Math.abs(getTimeSeconds(lo.arrived)) < nowTime) {
					lo.alertTomorrow = true;
				}
			});

			const _locations = enableLocations.filter(lo => !lo.alertTomorrow);

			if (_locations.length > 0) {
				return AMapLocation.getLocation({
					locationMode: enableHighAccuracy ? AMapLocation.LOCATION_MODE.HIGHT_ACCURACY : AMapLocation.LOCATION_MODE.BATTERY_SAVING,
					gpsFirst: enableHighAccuracy,
					allowsBackgroundLocationUpdates: true
				}).then(position => {
					const { longitude, latitude } = position.coordinate;
					_locations.forEach(lo => {
						Utils.distance(latitude, longitude, lo.latitude, lo.longitude).then(dis => {
							const _loDis = +lo.distance;
							if (dis < _loDis) {
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
							}
						});
					});

					// 定位成功, 重置定位失败次数
					locationErrorTimes = 0;

				}).catch(() => {
					// 定位失败
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
				});
			} else {
				return Promise.resolve(false);
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
	const nowTime = getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);
	Locations.getLocations().then(_locations => {
		const locations = _locations.filter(l => !l.deleted && l.enable);

		let validLocation = null;
		const shouldStartApp = locations.some(_lo => {
			if (Math.abs(getTimeSeconds(_lo.startOff) - nowTime) < 8 * 60) {
				validLocation = _lo;
				return true;
			}
			return false;
		});
		if (shouldStartApp) {
			PushNotification.localNotification({
				title: '到这儿',
				message: `即将出发前往${validLocation.name}, 请点击此处打开<到这儿>`,
				bigText: '温馨提示: 请将 <到这儿> 置于系统安全软件的白名单中',
				vibration: 2000,
				soundName: 'default'
			});
		}

		resetLocation(locations);
	});
};

// APP 运行时, 前台任务
const FORE_LOCATION_JOB_KEY = 'foregroundLocationJob';

// APP 关闭退出后, 后台任务
const BACK_LOCATION_JOB_KEY = 'backgroungLocationJob';

BackgroundJob.register({
	jobKey: FORE_LOCATION_JOB_KEY,
	job: watchForeground
});

BackgroundJob.register({
	jobKey: BACK_LOCATION_JOB_KEY,
	job: watchBackground
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