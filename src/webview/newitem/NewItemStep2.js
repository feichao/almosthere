import React, { Component } from 'react';
import {
  Platform,
  TextInput,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  TimePickerAndroid
} from 'react-native';
import Styles from './NewItemStep2.style';

import Utils from '../../utils';
import Constants from '../../constants';
import { Locations } from '../../model';

const DEFAULT_DISTANCE = '500';
export default class NewItemStep2 extends Component {
  constructor(props) {
    super(props);
    this.selectTime = this.selectTime.bind(this);
    this.confirm = this.confirm.bind(this);


    this.state = {
      name: '',
      description: '',
      enable: true,
      distance: DEFAULT_DISTANCE,
      longitude: undefined,
      latitude: undefined,
      period: Constants.Common.ALERT_PERIOD.ONCE,
      startOff: [8, 30, 0],
      arrived: [9, 30, 0],
      address: ''
    };
  }
  componentDidMount() {
    const {
      id,
      name,
      address,
      description,
      longitude,
      latitude,
      distance = DEFAULT_DISTANCE,
      enable = true,
      startOff = [8, 30, 0],
      arrived = [9, 30, 0]
    } = this.props.navigation.state.params;
    this.setState({
      id,
      name,
      address,
      description: description || `距离${address} ${distance}m 时提醒`,
      longitude,
      latitude,
      distance,
      enable,
      startOff,
      arrived
    });
  }
  isAlertPeriod(period) {
    return period === Constants.Common.ALERT_PERIOD.PERIOD;
  }
  selectTime(isStart, time) {
    return async () => {
      try {
        const {action, hour, minute, second = 0} = await TimePickerAndroid.open({
          hour: time[0],
          minute: time[1],
          second: time[2],
          is24Hour: true,
        });
        if (action !== TimePickerAndroid.dismissedAction) {
          if (isStart) {
            this.setState({
              startOff: [hour, minute, second]
            });
          } else {
            this.setState({
              arrived: [hour, minute, second]
            });
          }
        }
      } catch ({code, message}) {
        console.error('Cannot open time picker', message);
      }
    }
  }
  confirm() {
    const { name, description, enable, distance } = this.state;
    if (!name) {
      ToastAndroid.show('请输入记录名称', ToastAndroid.SHORT);
    } else if (!description) {
      ToastAndroid.show('请输入描述信息', ToastAndroid.SHORT);
    } else if (!distance) {
      ToastAndroid.show('请输入提醒阈值', ToastAndroid.SHORT);
    } else if (!+distance) {
      ToastAndroid.show('提醒阈值应该是数字', ToastAndroid.SHORT);
    } else {
      Locations.saveLocation({...this.state, alartLater: false, alertTomorrow: false}).then(() => {
        const { popToTop } = this.props.navigation;
        popToTop();

        ToastAndroid.show('保存成功', ToastAndroid.SHORT);
      });
    }
  }
  render() {
    const { name, description, enable, distance, address, period, startOff, arrived } = this.state;
    return (
      <View style={Styles.container}>
        <ScrollView style={Styles.content}>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel} >记录名称</Text>
              <TextInput style={Styles.itemValue} placeholder='为记录起个名字' onChangeText={(name) => this.setState({ name })} value={name} />
            </View>
          </View>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel}>提醒阈值</Text>
              <TextInput style={Styles.itemValue} keyboardType='numeric' placeholder='当距离小于多少米时开始提醒' onChangeText={
                (distance) => {
                  this.setState({
                    distance,
                    description: `距离${address} ${distance}m 时提醒`
                  });
                }} value={distance} />
                <Text>米</Text>
            </View>
            <Text style={Styles.itemDesc} >比如回家时, 当距离家 500 米时开始提醒</Text>
          </View>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel} >默认开启</Text>
              <Switch style={Styles.itemSwitch} onValueChange={(enable) => this.setState({ enable })} value={enable}></Switch>
            </View>
          </View>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel} >出发时间</Text>
              <TouchableOpacity style={Styles.itemTime} activeOpacity={1} onPress={this.selectTime(true, startOff)}>
                <Text style={Styles.itemTimeValue}>
                  {startOff.map(Utils.getTimeStr).join(':')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={Styles.itemDesc} >比如每天早上大概 8:30 出门坐车</Text>
          </View>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel} >到达时间</Text>
              <TouchableOpacity style={Styles.itemTime} activeOpacity={1} onPress={this.selectTime(false, arrived)}>
                <Text style={Styles.itemTimeValue}>
                  {arrived.map(Utils.getTimeStr).join(':')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={Styles.itemDesc} >比如每天早上大概 9:30 前肯定会到公司</Text>
          </View>
          <View style={Styles.itemContainer}>
            <View style={Styles.itemBlock}>
              <Text style={Styles.itemLabel} >描述信息</Text>
              <TextInput style={Styles.itemValue} placeholder='基本描述信息' multiline={true} onChangeText={
                (description) => {
                  this.setState({
                    description: `距离${address} ${distance}m 时提醒`
                  });
                }} value={description} />
            </View>
          </View>
          <View style={{height: 50}}></View>
        </ScrollView>
        <TouchableOpacity style={Styles.confirmBtn} activeOpacity={0.75} onPress={this.confirm}>
          <Text style={Styles.confirmBtnText}>保存</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
