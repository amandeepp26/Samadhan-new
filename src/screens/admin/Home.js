import { View ,Text, StyleSheet, Image, TextInput, ScrollView, Pressable, TouchableOpacity, SafeAreaView} from "react-native";
import ButtonComponent from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../../styles/styles";
import { Icon } from "react-native-elements";
import { theme } from "../../theme/apptheme";
import { ActivityIndicator, Title } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Provider from "../../api/Provider";
import { useEffect, useState } from "react";
import { projectLoginTypes } from "../../utils/credentials";

function HomeScreen({ loginUser}) {

  const navigation =useNavigation();
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);
  const [userRoleName, setUserRoleName] = useState('');
  const [userName, setUserName] = useState('');
  const [userRoleID, setUserRoleID] = useState('');
   const [profileIcon, setProfileIcon] = useState(null);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState('');
  const [menuData,setMenuData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [userCountData,setUserCountData] = useState([]);
  const [isLoading,setIsLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const itemsToShow = showAll ? menuData : menuData.slice(0, 7);
  useEffect(()=>{
    getMenuList();
    GetUserData();
    GetUserDetails();
    GetUserCount();
  },[])

  const getMenuList = async()=>{
    const data = JSON.parse(await AsyncStorage.getItem('user'));
    Sess_UserRefno = data.UserID;
    Sess_group_refno = data.Sess_group_refno;
    Sess_group_refno_extra_1 = data.Sess_group_refno_extra_1;
    Sess_locationtype_refno = data.Sess_locationtype_refno;
    Sess_menu_refno_list = data.Sess_menu_refno_list;
     const params = {
       data: {
         Sess_UserRefno: Sess_UserRefno,
         Sess_group_refno: Sess_group_refno,
         Sess_group_refno_extra_1: Sess_group_refno_extra_1,
         Sess_locationtype_refno: Sess_locationtype_refno,
         Sess_menu_refno_list: Sess_menu_refno_list
       }
     };
     console.log('params--->',params)
     Provider.createDFCommon(Provider.API_URLS.get_leftside_menulist, params)
       .then(response => {
         if (response.data && response.data.code === 200) {
              setMenuData(response.data.data);
         } else if (response.data.code === 304) {
          //  setSnackbarText(communication.AlreadyExists);
          //  setIsSnackbarVisible(true);
         } else {
          //  setSnackbarText(communication.NoData);
          //  setIsSnackbarVisible(true);
         }
         setMenuLoading(false);
       })
       .catch(e => {
        //  setSnackbarText(e.message);
        //  setIsSnackbarVisible(true);
         setMenuLoading(false);
       });
  }

  useEffect(() => {
    AsyncStorage.setItem('profilePic', profileIcon);
  }, []);

    const GetUserData = async () => {
      const login = await AsyncStorage.getItem('loggedIn');
      if (login !== null) {
        const loginData = JSON.parse(login);
        if (loginData.isLogin) {
          // setIsLoggedIn(true);
        }
      }

      const userData = await AsyncStorage.getItem('user');
      if (userData !== null) {
        // setSingleLoad(1);
        const userDataParsed = JSON.parse(userData);
        GetUserProfileIcon(userDataParsed.UserID);
        roleID = userDataParsed.RoleID;
        userID = userDataParsed.UserID;
        groupRefNo = userDataParsed.Sess_group_refno;
        groupRefExtraNo = userDataParsed.Sess_group_refno_extra_1;
        designID = userDataParsed.Sess_designation_refno;
        companyAdminGroupID = userDataParsed.Sess_CompanyAdmin_group_refno;
        locationType = userDataParsed.Sess_locationtype_refno;
        companyID = userDataParsed.Sess_company_refno;
        branchID = userDataParsed.Sess_branch_refno;

        if (
          (userDataParsed.RoleID == projectLoginTypes.DEF_DEALER_GROUP_REFNO ||
            userDataParsed.RoleID ==
              projectLoginTypes.DEF_CONTRACTOR_GROUP_REFNO ||
            userDataParsed.RoleID ==
              projectLoginTypes.DEF_ARCHITECTCONSULTANT_GROUP_REFNO) &&
          userDataParsed.Sess_company_refno == 0
        ) {
          redirectToProfileFlag = 1;
        } else {
          redirectToProfileFlag = 0;
        }

        if (
          userDataParsed.RoleID == 3 &&
          userDataParsed.Sess_profile_address == 0
        ) {
          profileAddressFlag = 1;
        } else {
          profileAddressFlag = 0;
        }

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
        }
        setUserRoleID(roleID);
        setUserRoleName(roleName);
        // AsyncStorage.setItem('userRole',roleName)
        GetUserCount(userID, groupRefNo);
        if (roleID == 3) {
          FillUserRoles();
        } else if (roleID == 7) {
          // FetchManufactoringData();
        }
      }
    };
  // Get user cound
    const GetUserCount = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('user'));
      Sess_UserRefno = data.UserID;
      Sess_group_refno = data.Sess_group_refno;
      let params = {
        data: {
          Sess_UserRefno: Sess_UserRefno,
          Sess_group_refno: Sess_group_refno,
        },
      };
      Provider.createDFDashboard(
        Provider.API_URLS.GetdashboardTotaluser,
        params,
      )
        .then(response => {
          if (response.data && response.data.code === 200) {
              console.warn('response->',response.data);
            // setTotalUsers(response.data.data[0].TotalUsers);
            let usr_data = [
              {
                roleID: 0,
                roleName: 'Dealer',
                screen: '',
                roleCount: response.data.data[0].TotalDealer,
              },
              {
                roleID: 1,
                roleName: 'Contractor',
                screen: '',
                roleCount: response.data.data[0].TotalContractor,
              },
              {
                roleID: 2,
                roleName: 'General User',
                screen: 'General ',
                roleCount: response.data.data[0].TotalGeneralUser,
              },
              {
                roleID: 3,
                roleName: 'Architect',
                screen: '',
                roleCount: response.data.data[0].TotalArchitect,
              },
              {
                roleID: 4,
                roleName: 'Client',
                screen: '',
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

      const GetUserDetails = async () => {
        const data = JSON.parse(await AsyncStorage.getItem('user'));
        let params = {
          data: {
            user_refno: data.UserID,
          },
        };
        Provider.createDFCommon(Provider.API_URLS.UserFromRefNo, params)
          .then(response => {
            if (response.data && response.data.code === 200) {
              console.warn(
                'userdetails------->',
                response.data.data.Sess_FName,
              );
              setUserName(response.data.data.Sess_FName);
              AsyncStorage.setItem('userName', response.data.data.Sess_FName);
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
                Sess_designation_refno:
                  response.data.data.Sess_designation_refno,
                Sess_locationtype_refno:
                  response.data.data.Sess_locationtype_refno,
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
              AsyncStorage.setItem('user', JSON.stringify(user));
              console.warn('user is-------->',user);
            } else {
              setSnackbarColor(theme.colors.error);
              setSnackbarText(communication.InvalidUserNotExists);
              setIsSnackbarVisible(true);
            }
          })
          .catch(e => {
            setSnackbarColor(theme.colors.error);
            setSnackbarText(e.message);
            setIsSnackbarVisible(true);
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
                AsyncStorage.setItem('profilePic', response.data.data.Sess_photo);
              } else {
                setProfileIcon(null);
              }
            }
          })
          .catch(e => {
            setSnackbarColor(theme.colors.error);
            setSnackbarText(e.message);
            setIsSnackbarVisible(true);
          });
      };
  return (
    <SafeAreaView style={[{flex: 1, backgroundColor: '#f7f7f8'}]}>
      {/* Header */}
      <View style={[style.header, Styles.BottomShadow]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              src={
                profileIcon
                  ? profileIcon
                  : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D'
              }
              style={{width: 50, height: 50, borderRadius: 50}}
            />
            <View
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 50,
                padding: 2,
                width: 22,
                height: 22,
                justifyContent: 'center',
                position: 'absolute',
                bottom: -5,
                right: -5,
              }}>
              <Icon
                name="menu-outline"
                type="ionicon"
                color={'white'}
                size={15}
              />
            </View>
          </TouchableOpacity>
          <View style={Styles.marginHorizontal12}>
            <Text
              style={[Styles.fontBold, Styles.fontSize20, Styles.primaryColor]}>
              {userName}
            </Text>
            <Text>{userRoleName}</Text>
          </View>
        </View>
        <View style={[Styles.flexRow, Styles.SpaceEvenly]}>
          <Icon
            name="notifications"
            type="ionicon"
            size={27}
            color={'#FFDB58'}
          />
          <TouchableOpacity
            onPress={() => {
              AsyncStorage.removeItem('user'),
                AsyncStorage.removeItem('profilePic');
              loginUser();
            }}
            style={{marginLeft: 10}}>
            <Icon
              name="log-out-outline"
              type="ionicon"
              size={27}
              color={'#000'}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        {/* Body */}
        <View
          style={{
            backgroundColor: '#f7f7f8',
            flex: 1,
            paddingTop: 10,
            elevation: 3,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            // marginHorizontal: -20,
            // paddingHorizontal:20
          }}>
          {/* <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d3d3d3',
              backgroundColor: '#fff',
              color: '#000',
              width: '90%',
              alignSelf: 'center',
              borderRadius: 20,
              paddingLeft: 20,
            }}
            placeholder="Search"
          />
          <Icon
            name="search"
            type="ionicon"
            color={'#000'}
            style={{
              position: 'absolute',
              top: 28, // Adjust the top position to align the icon vertically
              left: 15, // Adjust the left position to align the icon horizontally
            }}
          /> */}
          {/* Users box */}

          <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Users
            </Title>
            {isLoading ? (
              <View
                style={[
                  Styles.flex1,
                  Styles.flexGrow,
                  Styles.flexJustifyCenter,
                  Styles.flexAlignCenter,
                  {
                    paddingBottom: 20,
                  },
                ]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  paddingVertical: 10,
                }}>
                {userCountData?.map((item, index) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('Approved', {role: item.roleName})
                    }
                    style={{alignItems: 'center'}}>
                    <View
                      style={{
                        backgroundColor: theme.colors.primaryLight,
                        borderRadius: 50,
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          Styles.fontBold,
                          Styles.textColorWhite,
                          Styles.fontSize18,
                        ]}>
                        {item.roleCount}
                      </Text>
                    </View>
                    <Text
                      style={[
                        Styles.textColorDark,
                        Styles.marginTop8,
                        {fontWeight: '600', fontSize: 11},
                      ]}>
                      {' '}
                      {item.roleName}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={style.borderBox}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginVertical: 15,
              }}>
              <Pressable
                onPress={() => navigation.navigate('Approved')}
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/8622/8622624.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Approve
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Pending')}
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/6520/6520475.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Pending
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Declined')}
                style={{
                  alignItems: 'center',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/128/458/458594.png"
                  style={{width: 50, height: 50}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Decline
                </Text>
              </Pressable>
            </View>
          </View>

          {/* <View style={style.borderBox}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginVertical: 15,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 10,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/7787/7787144.png"
                  style={{width: 40, height: 40}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    {fontWeight: '600', fontSize: 14, marginLeft: 10},
                  ]}>
                  {' '}
                  General Enquiry
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  borderColor: '#d3d3d3',
                }}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/8883/8883183.png"
                  style={{width: 40, height: 40}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    {fontWeight: '600', fontSize: 16, marginLeft: 10},
                  ]}>
                  {' '}
                  BOQ Enquiry
                </Text>
              </View>
            </View>
          </View> */}

          {/* Serviec catlague */}
          {/* <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Service Catalouge
            </Title>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingVertical: 10,
              }}>
              <View style={{alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: theme.colors.primaryLight,
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    src="https://cdn-icons-png.flaticon.com/512/3769/3769455.png"
                    style={{width: 35, height: 35}}
                  />
                </View>
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Floor
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1527/1527531.png"
                  style={{width: 55, height: 55}}
                />

                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Work Location
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/1225/1225959.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Design Type
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Image
                  src="https://cdn-icons-png.flaticon.com/512/10703/10703134.png"
                  style={{width: 55, height: 55}}
                />
                <Text
                  style={[
                    Styles.textColorDark,
                    Styles.marginTop8,
                    {fontWeight: '600', fontSize: 13},
                  ]}>
                  {' '}
                  Add more
                </Text>
              </View>
            </View>
          </View> */}

          {/* Menu Section */}
          <View style={style.borderBox}>
            <Title
              style={[
                Styles.marginTop16,
                Styles.fontBold,
                Styles.fontSize20,
                {marginLeft: 10},
                Styles.fontBold,
              ]}>
              Menu
            </Title>
            {menuLoading ? (
              <View
                style={[
                  Styles.flex1,
                  Styles.flexGrow,
                  Styles.flexJustifyCenter,
                  Styles.flexAlignCenter,
                  {
                    paddingBottom: 20,
                  },
                ]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}>
                {itemsToShow.map((item, index) => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Menu', {data: menuData, item: item})
                    }
                    key={item.id}
                    style={{
                      width: '24%',
                      marginBottom: 12,
                      alignItems: 'center',
                    }}>
                    <Image
                      resizeMode="contain"
                      source={{
                        uri: item.icon,
                      }}
                      style={{width: '43%', height: 37, borderRadius: 8}}
                    />
                    <Text
                      style={[
                        Styles.textColorDark,
                        Styles.marginTop8,
                        {
                          fontWeight: '500',
                          fontSize: 11.5,
                          textAlign: 'center',
                        },
                      ]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}

                {menuData.length > 7 && !showAll && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Menu', {data: menuData})
                    }
                    style={{
                      width: '24%',
                      marginBottom: 16,
                      alignItems: 'center',
                      marginTop: 5,
                    }}>
                    <Icon
                      name="grid"
                      type="ionicon"
                      size={30}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        Styles.textColorDark,
                        Styles.marginTop8,
                        {fontWeight: '500', fontSize: 12, textAlign: 'center'},
                      ]}>
                      View More →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen


const style = StyleSheet.create({
    header:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingVertical:20,
        paddingHorizontal:20,
        backgroundColor:'#fff'
    },
    borderBox:{
        borderWidth:1,
        width:'90%',
        alignSelf:'center',
        marginTop:10,
        borderColor:'#d3d3d3',
        backgroundColor:'#fff',
        borderRadius:10
        
    }
})