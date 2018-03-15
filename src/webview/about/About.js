import React, { Component } from 'react';
import {
  Platform,
  Image,
  Text,
  View
} from 'react-native';
import Styles from './About.style';
import LogoBG from '../../assets/imgs/logo-bg.png';
export default class About extends Component {
  render() {
    return (
      <View style={Styles.container}>
        <Image style={Styles.logoBg} source={LogoBG}></Image>
        <Text style={Styles.welcome}>
          到这儿 1.0
        </Text>
        <Text style={Styles.instructions}>
          For Darling Kaier
        </Text>
        <Text style={Styles.powerby}>
          @2018 Powered by Frank Wan
        </Text>
      </View>
    );
  }
}
