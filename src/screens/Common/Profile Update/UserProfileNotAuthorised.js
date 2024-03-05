import {useEffect, useRef, useState} from 'react';
import {
  View,
  LogBox,
  Dimensions,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import {
  ActivityIndicator,
  Title,
  Button,
  List,
  Card,
  HelperText,
  Searchbar,
  Checkbox,
  Snackbar,
  Subheading,
  Switch,
  FAB,
  TextInput,
  Text,
} from 'react-native-paper';
import {TabBar, TabView} from 'react-native-tab-view';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import {communication} from '../../../utils/communication';
import {AWSImagePath} from '../../../utils/paths';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {NullOrEmpty} from '../../../utils/validations';
import RBSheet from 'react-native-raw-bottom-sheet';
import {SwipeListView} from 'react-native-swipe-list-view';
import {RenderHiddenItems} from '../../../components/ListActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NoItems from '../../../components/NoItems';
import {APIConverter} from '../../../utils/apiconverter';
import Search from '../../../components/Search';
import uuid from 'react-native-uuid';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
let userID = 0,
  companyID = 0,
  // branchID=0,
  groupID = 0;

const windowWidth = Dimensions.get('window').width;
// let userID = 0,

//   groupID = 0;

let st_ID = 0,
  ct_ID = 0;

const UserProfileNotAuthorised = ({route, navigation}) => {
  //#endregion
  return (
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Basic Details" isDrawer="false" />
      <View style={[Styles.padding16]}>
        <Text style={[Styles.errorColor, Styles.fontBold]}>
          You are not authorized access this page
        </Text>
      </View>
    </View>
  );
};

export default UserProfileNotAuthorised;
