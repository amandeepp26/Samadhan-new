import { View ,Text, StyleSheet, Image, TextInput, ScrollView, Pressable, TouchableOpacity} from "react-native";
import ButtonComponent from "../../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Styles } from "../../styles/styles";
import { Icon } from "react-native-elements";
import { theme } from "../../theme/apptheme";
import { ActivityIndicator, Title } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Provider from "../../api/Provider";
import { useEffect, useState } from "react";

function HomeScreen({ loginUser}) {

  const navigation =useNavigation();
  const [menuData,setMenuData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [userCountData,setUserCountData] = useState([]);
  const [isLoading,setIsLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const itemsToShow = showAll ? menuData : menuData.slice(0, 7);
  useEffect(()=>{
    getMenuList();
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
        console.warn('resp---->',response.data)
         if (response.data && response.data.code === 200) {
              setMenuData(response.data.data);
              console.warn('data is---->',menuData)
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
                roleName: 'Client',
                screen: '',
                roleCount: response.data.data[0].TotalClient,
              },
            ];

            _user_count = usr_data;
            setUserCountData(usr_data);
            console.warn('users are---->',userCountData)
          }
          setIsLoading(false);
        })
        .catch(e => {
          setIsLoading(false);
        });
    };
  return (
    <View style={[{flex: 1, backgroundColor: '#f7f7f8'}]}>
      {/* Header */}
      <View style={style.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
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
              Hey Abdul
            </Text>
            <Text>Admin</Text>
          </View>
        </View>
        <Icon name="notifications" type="ionicon" size={27} color={'#FFDB58'} />
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
                        {fontWeight: '600', fontSize: 13},
                      ]}>
                      {' '}
                      {item.roleName}
                    </Text>
                  </View>
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
              <View
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
              </View>
              <View
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
              </View>
              <View
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
              </View>
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
                      navigation.navigate('Menu', {data: menuData})
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
                      style={{width: '42%', height: 35, borderRadius: 8}}
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
    </View>
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