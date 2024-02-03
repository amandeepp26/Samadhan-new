import {
  View,
  Image,
  ScrollView,
  Keyboard,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
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
import { ValidateMobile } from '../utils/validations';

const Forgetpassword = ({route, navigation}) => {
  //#region Variables
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState(false);

  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isMobileNumberInvalid, setIsMobileNumberInvalid] =
    React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState('');

  const [isOTPInvalid, setIsOTPInvalid] = React.useState(false);
  const [isotploading,setisotploading] = React.useState(false);

  const [otpButtonDisabled, setOTPButtonDisabled] = React.useState(false);

  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const [isConfirmPasswordInvalid, setIsConfirmPasswordInvalid] =
    React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');

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

  //#region Events
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

  //#region Api calling

    const GETOTP = () => {
      setisotploading(true);
      const params = {
        data: {
          Mobileno: mobileNumber,
        },
      };
      Provider.createDFCommon(Provider.API_URLS.ForgotMobileNoCheck, params)
        .then(response => {
          if (response.data && response.data.code === 200) {
            let otp = response.data.data.OTP_No;
            if (otp !== undefined && otp !== null) {
              setOtp(otp.toString());
              setIsOTPInvalid(false)
            }
          } else {
            setSnackbarText(communication.InvalidMobileNotExists);
            setIsSnackbarVisible(true);
          }
          setisotploading(false);
        })
        .catch(e => {
          console.log(e);
          setSnackbarText(e.message);
          setIsSnackbarVisible(true);
          setisotploading(false);
        });
    };
    const VerifyUser = () => {
      console.log('change');
      setIsButtonLoading(true);
      const params = {
        data: {
          Mobileno: mobileNumber,
          otpno: otp,
        },
      };
      Provider.createDFCommon(Provider.API_URLS.ForgotPasswordCheck, params)
        .then(response => {
          if (response.data && response.data.code === 200) {
            UpdateUser(response.data.data.user_refno);
          } else {
            setSnackbarText(communication.InvalidMobileNotExists);
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
    const UpdateUser = userid => {
      setIsButtonLoading(true);
      const params = {
        data: {
          user_refno: userid,
          Mobileno: mobileNumber,
          auth: password,
          confirm_password: password,
        },
      };
      Provider.createDFCommon(Provider.API_URLS.AlterPasswordCheck, params)
        .then(response => {
          if (response.data && response.data.code === 200) {
            navigation.goBack();
          } else {
            setSnackbarText(communication.InvalidMobileNotExists);
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
    const ValidateForgotPassword = () => {
      Keyboard.dismiss();
      let isValid = true;
      if (mobileNumber.length === 0 || !ValidateMobile(mobileNumber)) {
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
          VerifyUser();
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
              height: '75%',
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
                paddingBottom: 30,
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
              Forgot Password
            </Title>

            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput, {marginTop: 5}]}
              dense
              placeholder="Mobile number"
              autoComplete="username"
              maxLength={10}
              value={mobileNumber}
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
              placeholder="New Password"
              value={password}
              onChangeText={onPasswordChanged}
              error={isPasswordInvalid}
            />
            {isPasswordInvalid && (
              <HelperText
                style={{marginLeft: 10, marginBottom: -10}}
                type="error"
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
              isButtonLoading={isButtonLoading}
              onPress={ValidateForgotPassword}
            />
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

export default Forgetpassword;

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
