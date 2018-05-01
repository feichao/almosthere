import React, { Component } from 'react';
import {
  TouchableOpacity,
  Switch,
  Text,
  View
} from 'react-native';
import Styles from './Setting.style';

import { Settings } from '../../model';

export default class Setting extends Component {
  constructor(props) {
    super(props);
    this.updateHighAccuracy = this.updateHighAccuracy.bind(this);
    this.updateVibration = this.updateVibration.bind(this);

    this.updateSetting = this.updateSetting.bind(this);

    this.state = {
      settings: {
        enableHighAccuracy: false,
        enableSound: true,
        enableVibration: true,
        vibratingDuration: 1000
      }
    };
  }
  componentDidMount() {
    Settings.getSettings().then(settings => {
      this.setState({
        settings: Object.assign(this.state.settings, settings)
      });
    });
  }
  updateHighAccuracy(enable) {
    this.setState({
      settings: Object.assign(this.state.settings, {
        enableHighAccuracy: enable
      })
    }, () => {
      this.updateSetting();
    });
  }
  updateSound(enable) {
    this.setState({
      settings: Object.assign(this.state.settings, {
        enableSound: enable
      })
    }, () => {
      this.updateSetting();
    });
  }
  updateVibration(enable) {
    this.setState({
      settings: Object.assign(this.state.settings, {
        enableVibration: enable
      })
    }, () => {
      this.updateSetting();
    });
  }
  updateSetting() {
    Settings.saveSettings(this.state.settings);
  }
  render() {
    const { enableHighAccuracy, enableSound, enableVibration, vibratingDuration } = this.state.settings;
    return (
      <View style={Styles.container}>
        <TouchableOpacity style={Styles.settingBlock} activeOpacity={0.8} onPress={() => this.updateHighAccuracy(!enableHighAccuracy)}>
          <View style={Styles.settingContent}>
            <Text style={Styles.settingTitle}>启用高精度模式</Text>
            <Text style={Styles.settingTip}>打开 GPS 定位, 提高定位精度</Text>
          </View>
          <Switch value={enableHighAccuracy} onValueChange={enable => this.updateHighAccuracy(enable)}></Switch>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.settingBlock} activeOpacity={0.8} onPress={() => this.updateSound(!enableSound)}>
          <View style={Styles.settingContent}>
            <Text style={Styles.settingTitle}>启用声音</Text>
            <Text style={Styles.settingTip}>提醒时设备会播放默认提示音</Text>
          </View>
          <Switch value={enableSound} onValueChange={enable => this.updateSound(enable)}></Switch>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.settingBlock} activeOpacity={0.8} onPress={() => this.updateVibration(!enableVibration)}>
          <View style={Styles.settingContent}>
            <Text style={Styles.settingTitle}>启用振动</Text>
            <Text style={Styles.settingTip}>提醒时设备会振动</Text>
          </View>
          <Switch value={enableVibration} onValueChange={enable => this.updateVibration(enable)}></Switch>
        </TouchableOpacity>
      </View>
    );
  }
}
