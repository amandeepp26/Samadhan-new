import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  TouchableNativeFeedback,
  View,
  Modal,
  Image,
  ImageBackground,
  LogBox,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Caption,
  Card,
  Dialog,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  Title,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Styles} from '../styles/styles';
import {theme} from '../theme/apptheme';
import {
  createNavigationContainerRef,
  StackActions,
  useFocusEffect,
} from '@react-navigation/native';
import Provider from '../api/Provider';
import {ImageSlider} from 'react-native-image-slider-banner';
import {communication} from '../utils/communication';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CreateSCCards from '../components/SCCards';
import FadeCarousel from 'rn-fade-carousel';
import {APIConverter} from '../utils/apiconverter';
import {Hidden} from '@material-ui/core';
import {LinearGradient} from 'expo-linear-gradient';
import {
  projectFixedDesignations,
  projectFixedLocationTypes,
  projectLoginTypes,
} from '../utils/credentials';

export const navigationRef = createNavigationContainerRef();
let roleID = 0,
  userID = 0,
  groupRefNo = 0,
  groupRefExtraNo = 0,
  designID = 0,
  companyID = 0,
  branchID = 0;
var _user_count = null;

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const PocketDiaryScreen = ({route, navigation}) => {
  //#region Variables
  const [snackbarText, setSnackbarText] = React.useState('');
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success,
  );
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState('');
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [userRoleName, setUserRoleName] = React.useState(
    route.params?.userDetails[0]?.RoleName,
  );
  const [userName, setUserName] = React.useState(
    '',
  );
  const [userRoleID, setUserRoleID] = React.useState('');

  const [imageGalleryData, setImageGalleryData] = React.useState([]);
  const [catalogueCategoryImages, setCatalogueCategoryImages] = React.useState(
    [],
  );
  const [catalogueImagesZoom, setCatalogueImagesZoom] = React.useState([]);
  const [catalogueImagesZoomVisible, setCatalogueImagesZoomVisible] =
    React.useState(false);
  const [catalogueImages, setCatalogueImages] = React.useState([]);

  const [userCountData, setUserCountData] = React.useState([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [roleName, setRoleName] = React.useState('');
  const [switchRoleNames, setSwitchRoleNames] = React.useState([]);
  const [userRoleData, setUserRoleData] = React.useState([]);
  const [errorRole, setErrorRole] = React.useState(false);
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  const [pocketAmount, setPocketAmount] = React.useState('');
  const [bankAmount, setBankAmount] = React.useState('');
  const [branchAmount, setBranchAmount] = React.useState('');

  const [payableAmount, setPayableAmount] = React.useState('0');
  const [receivableAmount, setReceivableAmount] = React.useState('0');
  const [profileIcon, setProfileIcon] = useState(null);

  //#endregion

  //#region Functions

  const slidesTwo = [
    <Image
      source={require('../../assets/dreamone.jpg')}
      style={Styles.flex1}
      resizeMode="cover"
    />,
    <Image
      source={require('../../assets/dreamtwo.jpg')}
      style={Styles.flex1}
      resizeMode="cover"
    />,
    <Image
      source={require('../../assets/dreamthree.jpg')}
      style={Styles.flex1}
      resizeMode="cover"
    />,
    <Image
      source={require('../../assets/dreamfour.jpg')}
      style={Styles.flex1}
      resizeMode="cover"
    />,
  ];

  const LogoutUser = async () => {
    console.log('logout user');
    Alert.alert('Are you sure?', 'Do you want to logout', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await AsyncStorage.setItem('user', '{}');
            navigation.dispatch(StackActions.replace('Login'));
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  };

  const GetUserCount = (userID, groupRefNo) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_group_refno: groupRefNo,
      },
    };
    Provider.createDFDashboard(Provider.API_URLS.GetdashboardTotaluser, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          setTotalUsers(response.data.data[0].TotalUsers);
          let usr_data = [
            {
              roleID: 0,
              roleName: 'Dealer',
              roleCount: response.data.data[0].TotalDealer,
            },
            {
              roleID: 1,
              roleName: 'Contractor',
              roleCount: response.data.data[0].TotalContractor,
            },
            {
              roleID: 2,
              roleName: 'General User',
              roleCount: response.data.data[0].TotalGeneralUser,
            },
            {
              roleID: 3,
              roleName: 'Client',
              roleCount: response.data.data[0].TotalClient,
            },
          ];

          _user_count = usr_data;
          setUserCountData(usr_data);
        }
        setIsLoading(false);
      })
      .catch(e => {
        setIsLoading(false);
      });
  };

  const GetPocketAmount = (userID, companyID, branchID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckdashboard_cashinpocket,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          setPocketAmount(response.data.data[0].TotalCashinHand.toString());
          setPayableAmount(
            response.data.data[0].ToatalPayableAmount.toString(),
          );
          setReceivableAmount(
            response.data.data[0].ToatalReceivableAmount.toString(),
          );
        }
      })
      .catch(e => {});
  };

  const GetBranchAmount = (userID, companyID, branchID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckdashboard_cashinbranch,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          setBranchAmount(response.data.data[0].TotalCashinCompany.toString());
        }
      })
      .catch(e => {});
  };

  const GetBankAmount = (userID, companyID, branchID) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckdashboard_cashinbank,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          setBankAmount(response.data.data[0].TotalCashinBank.toString());
        }
      })
      .catch(e => {});
  };

  React.useEffect(() => {
    GetUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const refreshScreen = () => {
        // Refresh the screen here
        GetUserData();
      };
      refreshScreen();
      return () => {};
    }, [navigationRef]),
  );

  const GetUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      const userDataParsed = JSON.parse(userData);
      GetUserProfileIcon(userDataParsed.UserID);
      setUserRoleName(userDataParsed.Sess_group_name);
      setUserName(userDataParsed.Sess_FName || userDataParsed.Sess_Username);
      roleID = userDataParsed.RoleID;
      userID = userDataParsed.UserID;
      groupRefNo = userDataParsed.Sess_group_refno;
      designID = userDataParsed.Sess_designation_refno;
      groupRefExtraNo = userDataParsed.Sess_group_refno_extra_1;
      companyID = userDataParsed.Sess_company_refno;
      branchID = userDataParsed.Sess_branch_refno;

      let roleName = '';
      switch (roleID) {
        case '1':
          roleName = 'Super Admin';
          break;
        case '2':
          roleName = 'Admin';
          break;
        case '3':
          roleName = 'General User';
          break;
        case '4':
          roleName = 'Dealer';
          break;
        case '5':
          roleName = 'Contractor';
          break;
        case '7':
          if (
            designID ==
            projectFixedDesignations.DEF_MARKETINGEXECUTIVE_DESIGNATION_REFNO
          ) {
            roleName = 'Marketing Executive';
          } else if (
            groupRefExtraNo == projectLoginTypes.DEF_MENUFACTURER_GROUP_REFNO
          ) {
            roleName = 'Menufacturer Incharge';
          } else if (
            designID ==
            projectFixedDesignations.DEF_PROJECTSUPERVISOR_DESIGNATION_REFNO
          ) {
            roleName = 'Supervisor';
          } else if (
            designID ==
            projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO
          ) {
            roleName = 'Branch Admin';
          } else {
            roleName = 'General Employee';
          }
          break;
        case '8':
          roleName = 'Client';
          break;
        case '9':
          roleName = 'Architect And Consultant (PMC)';
          break;
        case '10':
          roleName = 'Project Supervisor';
          break;
        case '11':
          roleName = 'Contractor Branch Admin';
          break;
        case '12':
          roleName = 'Dealer Branch Admin';
          break;
        case '13':
          roleName = 'Supplier';
          break;
        case '14':
          roleName = 'Vendor';
          break;
        default:
          roleName = 'General User';
      }
      setUserRoleID(roleID);
      setUserRoleName(roleName);
      GetUserCount(userID, groupRefNo);
      GetPocketAmount(userID, companyID, branchID);
      GetBankAmount(userID, companyID, branchID);
      GetBranchAmount(userID, companyID, branchID);
    }
  };

  const showDialog = () => setIsDialogVisible(true);
  const hideDialog = () => setIsDialogVisible(false);

  const GetUserDetails = user_refno => {
    setIsButtonLoading(true);
    let params = {
      data: {
        user_refno: user_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          const user = {
            UserID: user_refno,
            FullName:
              response.data.data.Sess_FName === ''
                ? response.data.data.Sess_Username
                : '',
            RoleID: response.data.data.Sess_group_refno,
            RoleName: response.data.data.Sess_Username,
            Sess_FName: response.data.data.Sess_FName,
            Sess_MobileNo: response.data.data.Sess_MobileNo,
            Sess_Username: response.data.data.Sess_Username,
            Sess_role_refno: response.data.data.Sess_role_refno,
            Sess_group_refno: response.data.data.Sess_group_refno,
            Sess_designation_refno: response.data.data.Sess_designation_refno,
            Sess_locationtype_refno: response.data.data.Sess_locationtype_refno,
            Sess_group_refno_extra_1:
              response.data.data.Sess_group_refno_extra_1,
            Sess_User_All_GroupRefnos:
              response.data.data.Sess_User_All_GroupRefnos,
            Sess_branch_refno: response.data.data.Sess_branch_refno,
            Sess_company_refno: response.data.data.Sess_company_refno,
            Sess_CompanyAdmin_UserRefno:
              response.data.data.Sess_CompanyAdmin_UserRefno,
            Sess_CompanyAdmin_group_refno:
              response.data.data.Sess_CompanyAdmin_group_refno,
            Sess_RegionalOffice_Branch_Refno:
              response.data.data.Sess_RegionalOffice_Branch_Refno,
            Sess_menu_refno_list: response.data.data.Sess_menu_refno_list,
            Sess_empe_refno: response.data.data.Sess_empe_refno,
            Sess_profile_address: response.data.data.Sess_profile_address,
          };

          StoreUserData(user);
        } else {
          setSnackbarText(communication.InvalidUserNotExists);
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

  const GetUserProfileIcon = user_refno => {
    let params = {
      data: {
        user_refno: user_refno,
      },
    };
    Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data.Sess_photo != '') {
            setProfileIcon(response.data.data.Sess_photo);
          } else {
            setProfileIcon(null);
          }
        }
      })
      .catch(e => {
        setSnackbarColor(theme.colors.error);
        setSnackbarText(e.message);
        setIsSnackbarVisible(true);
        setIsButtonLoading(false);
      });
  };

  //#endregion
  return (
    <View style={[Styles.flex1, Styles.backgroundSecondaryLightColor]}>
      <View
        style={[
          Styles.width100per,
          Styles.height64,
          Styles.backgroundColorWhite,
          Styles.flexRow,
          Styles.flexAlignCenter,
          Styles.paddingHorizontal16,
          Styles.BottomShadow,
        ]}>
        {/* menu icon */}
        <TouchableNativeFeedback>
          <View
            style={[
              Styles.width48,
              Styles.height48,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}
            onTouchStart={() => {
              console.log('***navigation***', navigation);
              //navigation.openDrawer()
              navigation.goBack();
            }}>
            <Icon name="arrow-left" type='ionicon' size={24} color={theme.colors.text} />
          </View>
        </TouchableNativeFeedback>
        {/* menu icon */}

        <Avatar.Image
          size={40}
          style={[
            Styles.marginEnd16,
            Styles.backgroundSecondaryLightColor,
            Styles.borderCD,
            {overflow: 'hidden'},
          ]}
          source={
            profileIcon != null
              ? {uri: profileIcon}
              : require('../../assets/defaultIcon.png')
          }
        />
        <View style={[Styles.flexColumn, Styles.flexGrow, {maxWidth: 150}]}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              Styles.fontBold,
              Styles.fontSize18,
              Styles.textColorDark,
              {marginTop: -4},
            ]}>
                {userName}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[Styles.textColorDarkSecondary, {marginTop: -4}]}>
            {userRoleName}
          </Text>
        </View>

        <TouchableNativeFeedback>
          <View
            style={[
              Styles.width48,
              Styles.height48,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}>
            <Icon
              name="bell-outline"
              size={24}
              color={theme.colors.iconOutline}
            />
          </View>
        </TouchableNativeFeedback>

        <TouchableNativeFeedback>
          <View
            style={[
              Styles.width48,
              Styles.height48,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}
            onTouchStart={() => LogoutUser()}>
            <Icon name="logout" size={24} color={theme.colors.iconOutline} />
          </View>
        </TouchableNativeFeedback>
      </View>
      <ScrollView>
        <View>
          <View
            style={[
              Styles.paddingTop16,
              Styles.paddingHorizontal16,
              Styles.paddingBottom24,
            ]}>
            <Text style={[Styles.HomeTitle]}>Pocket Dashboard</Text>
            <View
              style={[
                Styles.marginTop16,
                Styles.flexSpaceBetween,
                Styles.flexRow,
              ]}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('PayableList');
                }}
                style={[
                  Styles.height80,
                  Styles.borderRadius8,
                  Styles.backgroundGreen,
                  Styles.padding14,
                  Styles.boxElevation,
                  {width: 156},
                ]}>
                <Icon
                  name="account-cash"
                  size={24}
                  color={theme.colors.textLight}
                />
                <Text
                  style={[
                    Styles.fontSize16,
                    {
                      color: '#fff',
                      width: '100%',
                      fontWeight: 'bold',
                      position: 'absolute',
                      bottom: 14,
                      left: 14,
                    },
                  ]}>
                  Payable
                </Text>
                <View
                  style={[
                    Styles.width50per,
                    Styles.height32,
                    Styles.flexRow,
                    Styles.flexAlignEnd,
                    Styles.flexAlignStart,
                    {position: 'absolute', right: 14, top: 14},
                  ]}>
                  <Icon
                    name="currency-inr"
                    size={20}
                    color={theme.colors.textLight}
                  />
                  <Text
                    style={[
                      Styles.fontSize16,
                      Styles.textLeft,
                      {color: '#fff', fontWeight: 'bold'},
                    ]}>
                    {payableAmount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('ReceivableList');
                }}
                style={[
                  Styles.height80,
                  Styles.borderRadius8,
                  Styles.backgroundGreen,
                  Styles.padding14,
                  Styles.boxElevation,
                  {width: 156},
                ]}>
                <Icon
                  name="account-cash"
                  size={24}
                  color={theme.colors.textLight}
                />
                <Text
                  style={[
                    Styles.fontSize16,
                    {
                      color: '#fff',
                      width: '100%',
                      fontWeight: 'bold',
                      position: 'absolute',
                      bottom: 14,
                      left: 14,
                    },
                  ]}>
                  Receivable
                </Text>
                <View
                  style={[
                    Styles.width50per,
                    Styles.height32,
                    Styles.flexRow,
                    Styles.flexAlignEnd,
                    Styles.flexAlignStart,
                    {position: 'absolute', right: 14, top: 14},
                  ]}>
                  <Icon
                    name="currency-inr"
                    size={20}
                    color={theme.colors.textLight}
                  />
                  <Text
                    style={[
                      Styles.fontSize16,
                      Styles.textLeft,
                      {color: '#fff', fontWeight: 'bold'},
                    ]}>
                    {receivableAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={[
                Styles.marginTop16,
                Styles.flexSpaceBetween,
                Styles.flexRow,
              ]}>
              <TouchableOpacity
                onPress={() => {
                  if (roleID == 3) {
                    navigation.navigate('PocketTransactionGeneralUserScreen');
                  } else {
                    navigation.navigate('PocketTransactionScreen');
                  }
                }}
                style={[
                  Styles.height80,
                  Styles.borderRadius8,
                  Styles.backgroundGreen,
                  Styles.padding14,
                  Styles.boxElevation,
                  {width: 156},
                ]}>
                <Icon
                  name="account-cash"
                  size={24}
                  color={theme.colors.textLight}
                />
                <Text
                  style={[
                    Styles.fontSize16,
                    {
                      color: '#fff',
                      width: '100%',
                      fontWeight: 'bold',
                      position: 'absolute',
                      bottom: 14,
                      left: 14,
                    },
                  ]}>
                  Pocket
                </Text>
                <View
                  style={[
                    Styles.width50per,
                    Styles.height32,
                    Styles.flexRow,
                    Styles.flexAlignEnd,
                    Styles.flexAlignStart,
                    {position: 'absolute', right: 14, top: 14},
                  ]}>
                  <Icon
                    name="currency-inr"
                    size={20}
                    color={theme.colors.textLight}
                  />
                  <Text
                    style={[
                      Styles.fontSize16,
                      Styles.textLeft,
                      {color: '#fff', fontWeight: 'bold'},
                    ]}>
                    {pocketAmount}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('BankTransactionScreen');
                }}
                style={[
                  Styles.height80,
                  Styles.borderRadius8,
                  Styles.backgroundGreen,
                  Styles.padding14,
                  Styles.boxElevation,
                  {width: 156},
                ]}>
                <Icon name="bank" size={24} color={theme.colors.textLight} />
                <Text
                  style={[
                    Styles.fontSize16,
                    {
                      color: '#fff',
                      width: '100%',
                      fontWeight: 'bold',
                      position: 'absolute',
                      bottom: 14,
                      left: 14,
                    },
                  ]}>
                  Bank
                </Text>
                <View
                  style={[
                    Styles.width50per,
                    Styles.height32,
                    Styles.flexRow,
                    Styles.flexAlignEnd,
                    Styles.flexAlignStart,
                    {position: 'absolute', right: 14, top: 14},
                  ]}>
                  <Icon
                    name="currency-inr"
                    size={20}
                    color={theme.colors.textLight}
                  />
                  <Text
                    style={[
                      Styles.fontSize16,
                      Styles.textLeft,
                      {color: '#fff', fontWeight: 'bold'},
                    ]}>
                    {bankAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {(roleID == 4 || roleID == 5 || roleID == 9) && (
              <>
                <View
                  style={[
                    Styles.marginTop16,
                    Styles.flexSpaceBetween,
                    Styles.flexRow,
                    Styles.flexJustifyCenter,
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('BranchWiseTransactionScreen');
                    }}
                    style={[
                      Styles.height80,
                      Styles.borderRadius8,
                      Styles.backgroundGreen,
                      Styles.padding14,
                      Styles.boxElevation,
                      {width: 200},
                    ]}>
                    <Icon
                      name="graph"
                      size={24}
                      color={theme.colors.textLight}
                    />
                    <Text
                      style={[
                        Styles.fontSize16,
                        {
                          color: '#fff',
                          width: '100%',
                          fontWeight: 'bold',
                          position: 'absolute',
                          bottom: 14,
                          left: 14,
                        },
                      ]}>
                      Branch (Pocket/Bank)
                    </Text>
                    <View
                      style={[
                        Styles.width50per,
                        Styles.height32,
                        Styles.flexRow,
                        Styles.flexAlignEnd,
                        Styles.flexAlignStart,
                        {position: 'absolute', right: 14, top: 14},
                      ]}>
                      <Icon
                        name="currency-inr"
                        size={20}
                        color={theme.colors.textLight}
                      />
                      <Text
                        style={[
                          Styles.fontSize16,
                          Styles.textLeft,
                          {color: '#fff', fontWeight: 'bold'},
                        ]}>
                        {branchAmount}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          <View
            style={[
              Styles.width100per,
              Styles.height40,
              Styles.boxTopElevation,
              Styles.borderTopRadius24,
              Styles.paddingTop12,
              Styles.backgroundSecondaryLightColor,
              {elevation: 20},
            ]}>
            <View
              style={[
                Styles.horizontalArrowLineBG,
                Styles.flexAlignSelfCenter,
                Styles.borderRadius16,
                Styles.marginBottom16,
                {width: '20%', height: 6},
              ]}></View>
            <View
              style={[
                Styles.width100per,
                Styles.height40,
                Styles.backgroundSecondaryLightColor,
                {zIndex: 30, position: 'absolute', bottom: -34},
              ]}></View>
          </View>
          <View style={[Styles.width100per, Styles.paddingBottom16]}>
            <View style={[Styles.paddingHorizontal16]}>
              <View>
                <Text style={[Styles.HomeTitle]}>Finance</Text>
                <View
                  style={[
                    Styles.marginTop16,
                    Styles.flexSpaceBetween,
                    Styles.flexRow,
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      if (roleID == 3) {
                        navigation.navigate('SourceListGeneralUserScreen');
                      } else {
                        navigation.navigate('AddSourceList');
                      }
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 156, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.masterIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>Self Entry</Text>
                  </TouchableOpacity>
                  {/* {roleID != 3 && roleID != 8 && ( */}
                  <TouchableOpacity
                    onPress={() => {
                      if (roleID == 3 || roleID == 8) {
                        navigation.navigate('ExpensesListGeneralUserScreen');
                      } else {
                        navigation.navigate('AddExpensesList');
                      }
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 156, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.masterIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>
                      {roleID == 3 || roleID == 8
                        ? 'Expenses Entry'
                        : 'Company Entry'}
                    </Text>
                  </TouchableOpacity>
                  {/* )} */}
                </View>
              </View>
              {(roleID == 4 || roleID == 5 || roleID == 9) && (
                <>
                  {/* Verify Company Source / Expenses */}
                  <View style={[Styles.paddingTop16]}>
                    <Text style={[Styles.HomeTitle]}>
                      Company Finance Verification
                    </Text>
                    <View
                      style={[
                        Styles.marginTop16,
                        Styles.flexSpaceBetween,
                        Styles.flexRow,
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('VerifyCompanySource');
                          // if (roleID == 3) {
                          // navigation.navigate("VerifyCompanySource");
                          // } else {
                          //   navigation.navigate("AddSourceList");
                          // }
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexColumn,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 156, height: 72},
                        ]}>
                        <Icon
                          name="archive-arrow-down"
                          size={22}
                          color={theme.colors.masterIcons}
                        />
                        <Text style={[Styles.buttonIconLabel]}>
                          Verify Company Source
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('VerifyCompanyExpense');
                          // if (roleID == 3) {
                          //   navigation.navigate("ExpensesListGeneralUserScreen");
                          // } else {
                          //   navigation.navigate("AddExpensesList");
                          // }
                        }}
                        style={[
                          Styles.borderRadius8,
                          Styles.homeBox,
                          Styles.flexColumn,
                          Styles.flexJustifyCenter,
                          Styles.flexAlignCenter,
                          Styles.paddingHorizontal12,
                          {width: 156, height: 72},
                        ]}>
                        <Icon
                          name="archive-arrow-down"
                          size={22}
                          color={theme.colors.masterIcons}
                        />
                        <Text style={[Styles.buttonIconLabel]}>
                          Verify Company Expense
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Verify Company Source / Expenses */}
                </>
              )}
              <View style={[Styles.paddingTop16]}>
                <Text style={[Styles.HomeTitle]}>Settings</Text>
                <View
                  style={[
                    Styles.marginTop16,
                    Styles.flexSpaceBetween,
                    Styles.flexRow,
                  ]}>
                  <TouchableOpacity
                    onPress={() => {
                      if (
                        roleID == projectLoginTypes.DEF_GENERALUSER_GROUP_REFNO
                      ) {
                        navigation.navigate('GCategoryNameScreen');
                      } else {
                        navigation.navigate('CategoryNameScreen');
                      }
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 100, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.pocketDiaryIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>Category</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (
                        roleID == projectLoginTypes.DEF_GENERALUSER_GROUP_REFNO
                      ) {
                        navigation.navigate('GSubCategoryNameScreen');
                      } else {
                        navigation.navigate('SubCategoryNameScreen');
                      }
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 100, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.pocketDiaryIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>Sub-Category</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('GMyContactsScreen');
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 100, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.pocketDiaryIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>My Contacts</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {roleID != 3 && (
                <View style={[Styles.paddingTop16]}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('MyPersonalBankScreen');
                    }}
                    style={[
                      Styles.borderRadius8,
                      Styles.homeBox,
                      Styles.flexColumn,
                      Styles.flexJustifyCenter,
                      Styles.flexAlignCenter,
                      Styles.paddingHorizontal12,
                      {width: 150, height: 72},
                    ]}>
                    <Icon
                      name="archive-arrow-down"
                      size={22}
                      color={theme.colors.pocketDiaryIcons}
                    />
                    <Text style={[Styles.buttonIconLabel]}>
                      My Personal Bank
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
      <Modal
        visible={catalogueImagesZoomVisible}
        onRequestClose={() => setCatalogueImagesZoomVisible(false)}
        transparent={true}>
        <View
          style={[
            Styles.flex1,
            {backgroundColor: 'rgba(0,0,0,0.85)', position: 'relative'},
          ]}>
          <Button
            mode="contained"
            style={{position: 'absolute', bottom: 16, zIndex: 20, right: 16}}
            onPress={() => {}}>
            View
          </Button>
          <Button
            mode="outlined"
            style={{
              position: 'absolute',
              bottom: 16,
              zIndex: 20,
              right: 104,
              backgroundColor: 'white',
            }}
            onPress={() => setCatalogueImagesZoomVisible(false)}>
            Close one
          </Button>
          <ImageViewer
            imageUrls={catalogueImagesZoom}
            backgroundColor="transparent"
            style={{height: 1920}}
          />
        </View>
      </Modal>
    </View>
  );
};

export default PocketDiaryScreen;
