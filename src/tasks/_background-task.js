import PushNotification from 'react-native-push-notification';

import Tools from '../utils';
import { Locations } from '../model';

/**
 * 系统杀掉进程时, 后台常驻此服务
 */
const task = () => {
	const now = new Date();
	const nowTime = Tools.getTimeSeconds([now.getHours(), now.getMinutes(), now.getSeconds()]);

	console.log('********* run background task *********');

	return Locations.getLocations().then(_locations => {

		let validLocation = null;
		const locations = _locations.filter(l => !l.deleted && l.enable && !l.stopAlert);

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
				vibration: 1500,
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
				vibration: 1500,
				soundName: 'default',
				actions: '["不再提醒"]',
				locationId: validLocation.id
			});
		}
	});
};

export default task;
