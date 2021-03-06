import { NativeModules } from 'react-native';

import BackgroundJob from 'react-native-background-job';

import Constants from '../constants';

import foregroundTask, { subscribeLocation } from './_foreground-task';
import backgroundTask from './_background-task';
import subscribeNotificationAction from './_notification-subscribe';
import resetLocations from './_reset-locations';

const LOCATION_JOB_KEY_FORE = 'AlmosthereLocationJobForeground';
const LOCATION_JOB_KEY_BACK = 'AlmosthereLocationJobBackground';

const watchAppState = () => {
	return new Promise((resolve, reject) => {
		NativeModules.AppState.getCurrentAppState((appStateData) => {
			console.log('********* app state: ', appStateData.app_state, ' *********');
			switch (appStateData.app_state) {
				case 'active':
				case 'background':
					resolve(true);
					break;
				case 'uninitialized':
					resolve(false);
					break;
				default: 
					reject('unknow app state')
					break;
			}
		}, () => reject('get app state error'));
	});
};

// 注册前台事件
BackgroundJob.register({
	jobKey: LOCATION_JOB_KEY_FORE,
	job: () => {
		try {
			watchAppState().then(isFore => {
				if (isFore) {
					resetLocations().then(foregroundTask);
				}
			}).catch(error => console.log(error));
		} catch(exception) {
			console.log(exception);
		}
	}
});

// 注册后台事件
BackgroundJob.register({
	jobKey: LOCATION_JOB_KEY_BACK,
	job: () => {
		try {
			watchAppState().then(isFore => {
				if (!isFore) {
					resetLocations().then(backgroundTask);
				}
			}).catch(error => console.log(error));
		} catch(exception) {
			console.log(exception);
		}
	}
});


try {
	// 取消所有的后台任务
	BackgroundJob.cancelAll();

	// 开始订阅通知栏行为事件
	subscribeNotificationAction();

	// 开始订阅位置服务
	subscribeLocation();

	// 开始执行前台任务
	BackgroundJob.schedule({
		jobKey: LOCATION_JOB_KEY_FORE,
		allowExecutionInForeground: true,
		allowWhileIdle: true,
		period: Constants.Common.GET_LOCATION_TIMEOUT,
		exact: true,
		override: true
	});
	
	// 开始执行后台任务
	BackgroundJob.schedule({
		jobKey: LOCATION_JOB_KEY_BACK,
		allowWhileIdle: true,
		period: Constants.Common.GET_LOCATION_TIMEOUT * 6,
		override: true
	});
} catch(exception) {
	console.log(exception);
}
