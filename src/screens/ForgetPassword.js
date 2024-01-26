import {
  View,
  Image,
  ScrollView,
  Keyboard,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import {Snackbar, Title, HelperText, Text} from 'react-native-paper';
import {Styles} from '../styles/styles';
import React from 'react';
import {theme} from '../theme/apptheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import {communication} from '../utils/communication';
import Button from '../components/Button';
import OTPInputView from '@twotalltotems/react-native-otp-input';

const Forgetpassword = ({route, navigation}) => {
  //#region Variables
  const [snackbarText, setSnackbarText] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState(false);
  const [isUsernameInvalid, setIsUsernameInvalid] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState(false);
  const [password, setPassword] = React.useState('');
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

  const onUsernameChanged = text => {
    setUsername(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsUsernameInvalid(false);
    }
  };
  const onPasswordChanged = text => {
    setPassword(text);
    setIsSnackbarVisible(false);
    if (text.length > 0) {
      setIsPasswordInvalid(false);
    }
  };
  //#endregion

  //#region Api calling
  const StoreUserData = async user => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigation.dispatch(StackActions.replace('HomeStack'));
    } catch (error) {}
  };
  //   const CheckLogin = () => {
  //     setIsButtonLoading(true);
  //     let params = {
  //       data: {
  //         uname: username,
  //         auth: password,
  //       },
  //     };
  //     console.log('params:**********', params, '*======================*');
  //     Provider.createDFCommon(Provider.API_URLS.LoginCheck, params)
  //       .then(response => {
  //         console.log(
  //           'resp===========:',
  //           response.data.data,
  //           '=======================',
  //         );
  //         console.log(params);
  //         console.log('resp:', response.data);
  //         if (response.data && response.data.code === 200) {
  //           GetUserDetails(response.data.data.user_refno);
  //         } else {
  //           setSnackbarText(communication.InvalidUserNotExists);
  //           setIsSnackbarVisible(true);
  //         }
  //         setIsButtonLoading(false);
  //       })
  //       .catch(e => {
  //         console.log(e);
  //         setSnackbarText(e.message);
  //         setIsSnackbarVisible(true);
  //         setIsButtonLoading(false);
  //       });
  //   };
  //   const GetUserDetails = user_refno => {
  //     setIsButtonLoading(true);
  //     let params = {
  //       data: {
  //         user_refno: user_refno,
  //       },
  //     };
  //     Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
  //       .then(response => {
  //         if (response.data && response.data.code === 200) {
  //           const user = {
  //             UserID: response.data.data.Sess_UserRefno,
  //             FullName:
  //               response.data.data.Sess_FName === ''
  //                 ? response.data.data.Sess_Username
  //                 : response.data.data.Sess_FName,
  //             RoleID: response.data.data.Sess_group_refno,
  //             RoleName: response.data.data.Sess_Username,
  //             Sess_FName: response.data.data.Sess_FName,
  //             Sess_MobileNo: response.data.data.Sess_MobileNo,
  //             Sess_Username: response.data.data.Sess_Username,
  //             Sess_role_refno: response.data.data.Sess_role_refno,
  //             Sess_group_refno: response.data.data.Sess_group_refno,
  //             Sess_designation_refno: response.data.data.Sess_designation_refno,
  //             Sess_locationtype_refno: response.data.data.Sess_locationtype_refno,
  //             Sess_group_refno_extra_1:
  //               response.data.data.Sess_group_refno_extra_1,
  //             Sess_if_create_brand: response.data.data.Sess_if_create_brand,
  //             Sess_User_All_GroupRefnos:
  //               response.data.data.Sess_User_All_GroupRefnos,
  //             Sess_branch_refno: response.data.data.Sess_branch_refno,
  //             Sess_company_refno: response.data.data.Sess_company_refno,
  //             Sess_CompanyAdmin_UserRefno:
  //               response.data.data.Sess_CompanyAdmin_UserRefno,
  //             Sess_CompanyAdmin_group_refno:
  //               response.data.data.Sess_CompanyAdmin_group_refno,
  //             Sess_RegionalOffice_Branch_Refno:
  //               response.data.data.Sess_RegionalOffice_Branch_Refno,
  //             Sess_menu_refno_list: response.data.data.Sess_menu_refno_list,
  //             Sess_empe_refno: response.data.data.Sess_empe_refno,
  //             Sess_profile_address: response.data.data.Sess_profile_address,
  //           };

  //           StoreUserData(user, navigation);
  //         } else {
  //           setSnackbarText(communication.InvalidUserNotExists);
  //           setIsSnackbarVisible(true);
  //         }
  //         setIsButtonLoading(false);
  //       })
  //       .catch(e => {
  //         setSnackbarText(e.message);
  //         setIsSnackbarVisible(true);
  //         setIsButtonLoading(false);
  //       });
  //   };
  const ValidateLogin = () => {
    Keyboard.dismiss();
    let isValid = true;
    if (username.length === 0) {
      isValid = false;
      setIsUsernameInvalid(true);
    }
    if (password.length < 3) {
      isValid = false;
      setIsPasswordInvalid(true);
    }
    if (isValid) {
      CheckLogin();
    }
  };
  const NewUser = () => {
    setUsername('');
    setPassword('');
    setIsUsernameInvalid(false);
    setIsPasswordInvalid(false);
    navigation.navigate('Signup');
  };
  const ForgotPassword = () => {
    setUsername('');
    setPassword('');
    setIsUsernameInvalid(false);
    setIsPasswordInvalid(false);
    navigation.navigate('ForgotPassword');
  };
  //#endregion

  return (
    <View style={[Styles.flex1, Styles.primaryBgColor]}>
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
                paddingBottom:30,
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
              value={username}
              onChangeText={onUsernameChanged}
              error={isUsernameInvalid}
            />

            <HelperText type="error" visible={isUsernameInvalid}>
              {communication.InvalidMobileNumber}
            </HelperText>
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
                  height: 30,
                  marginBottom: 20,
                }}
                pinCount={4}
                code={otp}
                autoFocusOnLoad
                keyboardType="number-pad"
                onCodeChanged={(e) => setOtp(e)}
                // onCodeFilled={(e) => dispatch(setOTP(e))}
                codeInputFieldStyle={style.underlineStyleBase}
                codeInputHighlightStyle={style.underlineStyleHighLighted}
              />
              <Title
                style={[
                  Styles.padding24,
                  Styles.fontBold,
                  Styles.fontSize13,
                  Styles.primaryColor,
                  {paddingTop: 0, marginLeft: 3},
                ]}>
                GET OTP
              </Title>
            </View>
            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput]}
              dense
              secureTextEntry={true}
              placeholder="New Password"
              value={password}
              onChangeText={onPasswordChanged}
              error={isPasswordInvalid}
            />
            <HelperText type="error" visible={isPasswordInvalid}>
              {communication.InvalidPassowrd}
            </HelperText>
            <TextInput
              underlineColor="transparent"
              style={[Styles.textinput]}
              dense
              secureTextEntry={true}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(e)=>setConfirmPassword(e)
              }
              error={isPasswordInvalid}
            />
            <HelperText type="error" visible={isPasswordInvalid}>
              {communication.InvalidPassowrd}
            </HelperText>

            <Button text={'Submit'} />

          </View>
        </View>
      </ScrollView>
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        style={{backgroundColor: theme.colors.error}}>
        {snackbarText}
      </Snackbar>
    </View>
  );
};

export default Forgetpassword;

const style = StyleSheet.create({
  underlineStyleBase: {
    width: 45,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    borderColor: '#D3DAE6',
    color: 'black',
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: theme.colors.textDark,
    shadowOffset: {
      width: 0, // Keep the width at 0
      height: -5, // Adjust the height to control the shadow position
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    elevation: 2,
  },

  underlineStyleHighLighted: {
    borderColor: '#d3d3d3',
  },
});
