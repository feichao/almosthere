import {
  StackNavigator,
} from 'react-navigation';
import HomePage from './src/webview/home/Home';
import NewItemStep1Page from './src/webview/newitem/NewItemStep1';
import NewItemStep2Page from './src/webview/newitem/NewItemStep2';
import Setting from './src/webview/setting/Setting';
import AboutPage from './src/webview/about/About';

import './src/tasks/location';

export default StackNavigator({
  Home: {screen: HomePage},
  NewItemStep1: {screen: NewItemStep1Page},
  NewItemStep2: {screen: NewItemStep2Page},
  Setting: {screen: Setting},
  About: {screen: AboutPage},
});