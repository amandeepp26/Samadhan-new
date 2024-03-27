import { Platform, ToastAndroid, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStorage = (key) => {
  return AsyncStorage.getItem(key).then((data) => {
    return JSON.parse(data);
  }).catch((error) => { console.log(error); });
};
export const setStorage = async (key, item) => {
  try {
    var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
    return jsonOfItem;
  } catch (error) {
    console.log(error);
  }
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
}

export const clearStorageByKey = async (key) => {
  await AsyncStorage.removeItem(key);
}

export const hasValue = (data) => {
  return (data !== undefined) && (data !== null) && (data !== "");
}

const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const IsEmailValid = function (res) { return email.test(res) }

const phone = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const IsNumberValid = (res) => {
  return phone.test(res)
}

export const isAlphabet = (data) => {
  try {
    /* 
   Usernames can only have: 
   - Uppercase Letters (A-Z) 
   - Lowercase Letters (a-z)   
   - Space
 */
    const res = /^[A-Za-z\s]*$/.exec(data);
    const valid = !!res;
    return valid;
  } catch (error) {
    console.log(error);
  }
}

export const MyToast = function (msg) {
  try {
    if (hasValue(msg)) {
      Platform.select({
        ios: () => { Alert.alert('' + msg); },
        android: () => { ToastAndroid.show('' + msg, ToastAndroid.SHORT); }
      })();
    }
  } catch (error) {
    console.log(error);
  }
}

export const MyAlert = function (msg, title) {
  try {
    if (hasValue(msg)) {
      Alert.alert(
        hasValue(title) ? title : '',
        msg,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: true },
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export const isNumericAndDot = function (data) {
  try {
    if (hasValue(data)) {
      var rgx = /^[0-9]*\.?[0-9]*$/;
      return data.match(rgx);
    }
    return false
  } catch (error) {
    console.log(error);
    return false
  }
}

export const uniqueArray = function (a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}
