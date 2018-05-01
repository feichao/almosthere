import React, { Component } from 'react';
import {
  Platform,
  TextInput,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  ToastAndroid
} from 'react-native';
import Styles from './NewItemStep2.style';

import Constants from '../../constants';
import { Locations } from '../../model';

const DEFAULT_DISTANCE = '800';
export default class NewItemStep2 extends Component {
  constructor(props) {
    super(props);
    this.confirm = this.confirm.bind(this);

    this.state = {
      name: '',
      description: '',
      enable: false,
      distance: DEFAULT_DISTANCE,
      longitude: undefined,
      latitude: undefined,
      period: Constants.Commom.ALERT_PERIOD.ONCE,
      startTime: 0,
      stopTime: 0,
      disableZThis: false,
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
      enable = false
    } = this.props.navigation.state.params;
    this.setState({
      id,
      name,
      address,
      description: description || `距离${address} ${distance}m 时提醒`,
      longitude,
      latitude,
      distance,
      enable
    });
  }
  isAlertPeriod(period) {
    return period === Constants.Commom.ALERT_PERIOD.PERIOD;
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
      Locations.saveLocation(this.state).then(() => {
        const { popToTop } = this.props.navigation;
        popToTop();

        ToastAndroid.show('保存成功', ToastAndroid.SHORT);
      });
    }
  }
  render() {
    const { name, description, enable, distance, address, period, startTime, stopTime } = this.state;
    return (
      <View style={Styles.container}>
        <ScrollView style={Styles.content}>
          <View style={Styles.itemBlock}>
            <Text style={Styles.itemLabel} >记录名称:</Text>
            <TextInput style={Styles.itemValue} placeholder='为记录起个名字' onChangeText={(name) => this.setState({ name })} value={name} />
          </View>
          <View style={Styles.itemBlock}>
            <Text style={Styles.itemLabel} keyboardType='numeric'>提醒阈值:</Text>
            <TextInput style={Styles.itemValue} placeholder='当距离小于多少米时开始提醒' onChangeText={
              (distance) => {
                this.setState({ 
                  distance,
                  description: `距离${address} ${distance}m 时提醒`
                });
              }} value={distance} />
          </View>
          <View style={Styles.itemBlock}>
            <Text style={Styles.itemLabel} >默认开启:</Text>
            <Switch onValueChange={(enable) => this.setState({ enable })} value={enable}></Switch>
          </View>
          <View style={Styles.itemBlock}>
            <Text style={Styles.itemLabel} >描述信息:</Text>
            <TextInput style={Styles.itemValue} placeholder='基本描述信息' multiline={true} onChangeText={
              (description) => {
                this.setState({ 
                  description: `距离${address} ${distance}m 时提醒`
                });
              }} value={description} />
          </View>
        </ScrollView>
        <TouchableOpacity style={Styles.confirmBtn} activeOpacity={0.75} onPress={this.confirm}>
          <Text style={Styles.confirmBtnText}>保存</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
