import {View, Image, ScrollView, Keyboard,TextInput, Pressable, StyleSheet, SafeAreaView} from 'react-native';
import {Snackbar, Title, HelperText, Text, ActivityIndicator} from 'react-native-paper';
import {Styles} from '../styles/styles';
import React from 'react';
import {theme} from '../theme/apptheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import {communication} from '../utils/communication';
import Button from '../components/Button';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Provider from '../api/Provider';
import { ValidateFullName, ValidateMobile } from '../utils/validations';

const Signup = ({route, navigation}) => {
  //#region Variables
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState(false);

  const [isFullNameInvalid, setIsFullNameInvalid] = React.useState(false);
  const [fullName, setFullName] = React.useState('');

  const [isMobileNumberInvalid, setIsMobileNumberInvalid] =
    React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [isotploading, setisotploading] = React.useState(false);

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isConfirmPasswordInvalid, setIsConfirmPasswordInvalid] =
    React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [isOTPInvalid, setIsOTPInvalid] = React.useState(false);

  const [otpButtonDisabled, setOTPButtonDisabled] = React.useState(false);

  //#endregion

  React.useEffect(() => {
    if (route.params?.mobile) {
      setUsername(route.params?.mobile);
    }

    const unsubscribe = navigation.addListener('blur', e => {
      route.params.setUserFunc();
    });
    return unsubscribe;
  }, [navigation, route.params?.mobile]);

  //#region Events

  const onFullNameChanged = text => {
    setFullName(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsFullNameInvalid(false);
    }
  };
  const onMobileNumberChanged = text => {
    setMobileNumber(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsMobileNumberInvalid(false);
    } else {
      setOtp('');
      setOTPButtonDisabled(false);
    }
  };
  const onOtpChange = text => {
    setOtp(text);
    if (text.length > 0) {
      setIsOTPInvalid(false);
    }
  };
  const onPasswordChanged = text => {
    setPassword(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsPasswordInvalid(false);
    }
  };
  const onConfirmPasswordChanged = text => {
    setConfirmPassword(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsConfirmPasswordInvalid(false);
    }
  };
  //#endregion

  //#region API calling
  const GETOTP = () => {
    setisotploading(true);
    const params = {
      data: {
        Mobileno: mobileNumber,
        EntryFrom: 1,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.MobileCheck, params)
      .then(response => {
        console.log('otp is---->',response.data)
        if (response.data && response.data.code === 200) {
          let otp = response.data.data.OTP_No;
          if (otp !== undefined && otp !== null) {
            setOtp(otp.toString());
            setisotploading(false)
          }
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setIsSnackbarVisible(true);
        } else {
          setSnackbarText(response.data.message);
          setIsSnackbarVisible(true);
        }
        setisotploading(false);
      })
      .catch(e => {
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setisotploading(false);
      });
  };
  const InsertNewUser = () => {
    setIsButtonLoading(true);
    const params = {
      data: {
        Mobileno: mobileNumber,
        firstname: fullName,
        auth: password,
        confirm_password: password,
        EntryFrom: 'App',
      },
    };
    Provider.createDFCommon(Provider.API_URLS.NewUserProfile, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          navigation.navigate('Login', {mobile: mobileNumber});
        } else if (response.data.code === 304) {
          setSnackbarText(communication.AlreadyExists);
          setIsSnackbarVisible(true);
        } else {
          setSnackbarText(communication.NoData);
          setIsSnackbarVisible(true);
        }
        setIsButtonLoading(false);
      })
      .catch(e => {
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };
  const ValidateSignup = () => {
    Keyboard.dismiss();
    let isValid = true;
    if (fullName.length === 0 || !ValidateFullName(fullName)) {
      isValid = false;
      setIsFullNameInvalid(true);
    }
    if (
      mobileNumber.length === 0 ||
      !ValidateMobile(mobileNumber) ||
      mobileNumber.length != 10
    ) {
      isValid = false;
      setIsMobileNumberInvalid(true);
    }
    if (
      otp.length === 0
    ) {
      isValid = false;
      setIsOTPInvalid(true);
    }
    if (password.length < 3) {
      isValid = false;
      setIsPasswordInvalid(true);
    }
    if (confirmPassword.length < 3) {
      isValid = false;
      setIsConfirmPasswordInvalid(true);
    }
    if (isValid) {
      if (password !== confirmPassword) {
        setIsConfirmPasswordInvalid(true);
        setSnackbarText(communication.InvalidPasswordsMatch);
        setIsSnackbarVisible(true);
      } else {
        InsertNewUser();
      }
    }
  };
  //#endregion

  return (
    <SafeAreaView style={[Styles.flex1, Styles.primaryBgColor]}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View
          style={[
            Styles.padding32,
            {
              paddingTop: 50,
              backgroundColor: '#f5f5f5',
              height: '70%',
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            },
          ]}>
          <Image
            source={require('../../assets/logo.png')}
            style={[{height: 170, width: 170, alignSelf: 'center'}]}
          />
          <View
            style={[
              Styles.backgroundColorWhite,
              {
                elevation: 4,
                paddingHorizontal: 10,
                marginTop: 50,
                borderRadius: 20,
                flex: 1,
              },
            ]}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize16,
                Styles.textCenter,
              ]}>
              Create New Account
            </Title>

            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput]}
              dense
              placeholder="Mobile number"
              autoComplete="username"
              keyboardType="numeric"
              value={mobileNumber}
              maxLength={10}
              onChangeText={onMobileNumberChanged}
              error={isMobileNumberInvalid}
            />
            {isMobileNumberInvalid && (
              <HelperText
                type="error"
                style={{marginLeft: 10, marginBottom: -10}}
                visible={isMobileNumberInvalid}>
                {communication.InvalidMobileNumber}
              </HelperText>
            )}
            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput]}
              dense
              placeholder="Full name"
              autoComplete="username"
              value={fullName}
              onChangeText={onFullNameChanged}
              error={isFullNameInvalid}
            />
            {isFullNameInvalid && (
              <HelperText
                type="error"
                style={{marginLeft: 10, marginBottom: -10}}
                visible={isFullNameInvalid}>
                {communication.InvalidFullname}
              </HelperText>
            )}
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                alignSelf: 'center',
                width: '85%',
              }}>
              <OTPInputView
                style={{
                  width: '72%',
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 10,
                }}
                pinCount={4}
                code={otp}
                autoFocusOnLoad
                keyboardType="number-pad"
                error={isOTPInvalid}
                onCodeChanged={onOtpChange}
                // onCodeFilled={(e) => dispatch(setOTP(e))}
                codeInputFieldStyle={style.underlineStyleBase}
                codeInputHighlightStyle={style.underlineStyleHighLighted}
              />
              <Title
                onPress={() => GETOTP()}
                disabled={otpButtonDisabled}
                style={[
                  Styles.padding24,
                  Styles.fontBold,
                  Styles.fontSize13,
                  Styles.primaryColor,
                  Styles.textCenter,
                  {marginLeft: 3},
                ]}>
                {isotploading ? (
                  <ActivityIndicator
                    size={'small'}
                    color={theme.colors.primary}
                  />
                ) : (
                  'GET OTP'
                )}
              </Title>
            </View>
            {isOTPInvalid && (
              <HelperText
                type="error"
                style={{marginLeft: 10, marginTop: -15, marginBottom: 5}}
                visible={isOTPInvalid}>
                {communication.InvalidOTP}
              </HelperText>
            )}
            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput, {marginTop: 0}]}
              dense
              secureTextEntry={true}
              placeholder="Create Password"
              value={password}
              onChangeText={onPasswordChanged}
              error={isPasswordInvalid}
            />
            {isPasswordInvalid && (
              <HelperText
                type="error"
                style={{marginLeft: 10, marginBottom: -10}}
                visible={isPasswordInvalid}>
                {communication.InvalidPassowrd}
              </HelperText>
            )}
            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput]}
              dense
              secureTextEntry={true}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={onConfirmPasswordChanged}
              error={isConfirmPasswordInvalid}
            />
            {isConfirmPasswordInvalid && (
              <HelperText
                type="error"
                style={{marginLeft: 10, marginBottom: -10}}
                visible={isConfirmPasswordInvalid}>
                {communication.InvalidConfirmPassowrd}
              </HelperText>
            )}

            <Button
              text={'Submit'}
              onPress={ValidateSignup}
              isButtonLoading={isButtonLoading}
            />
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: -5,
                alignSelf: 'center',
                marginTop: -20,
              }}>
              <Title
                style={[
                  Styles.padding24,
                  Styles.fontBold,
                  Styles.fontSize13,
                  Styles.textColorDark,
                  Styles.textCenter,
                  {paddingRight: 5},
                ]}>
                Note:
              </Title>
              <Title
                style={[
                  Styles.padding24,
                  Styles.fontBold,
                  Styles.fontSize13,
                  Styles.primaryColor,
                  Styles.textCenter,
                  {paddingLeft: 0},
                ]}>
                Your mobile number is your username
              </Title>
            </View>
          </View>
        </View>
      </ScrollView>
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
    </SafeAreaView>
  );
};

export default Signup;

const style = StyleSheet.create({
  underlineStyleBase: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    borderColor: '#D3DAE6',
    color: 'black',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: theme.colors.textDark,
    shadowOffset: {
      width: 0, // Keep the width at 0
      height: -5, // Adjust the height to control the shadow position
    },
    shadowOpacity: 0.01,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    elevation: 2,
  },

  underlineStyleHighLighted: {
    borderColor: '#d3d3d3',
  },
});