import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  RefreshControl,
  LogBox,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  FlatList
} from 'react-native';
import {
  List,
  Searchbar,
  Snackbar,
  Title,
  Button,
  Text,
  Checkbox,
  TextInput,
} from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import moment from 'moment';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import NoItems from '../../../components/NoItems';
import { theme } from '../../../theme/apptheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../../../assets/hotel-design.jpg';
import PrintH from '../../../../assets/print-design-h.png';
import PrintF from '../../../../assets/print-design-f.png';

import { RenderHiddenItems } from '../../../components/ListActions';
import { Styles } from '../../../styles/styles';
import { APIConverter } from '../../../utils/apiconverter';
import LabelInput from '../../Marketing/EmployeeActivity/common/LabelInput';
import HDivider from '../../Marketing/EmployeeActivity/common/HDivider';
import Search from '../../../components/Search';
import * as Print from 'react-native-print';
import { DateTimePicker } from '@hashiprobr/react-native-paper-datetimepicker';
import DFButton from '../../../components/Button';
import { useIsFocused } from '@react-navigation/native';
import { TouchableOpacity } from '../../../components';
import { C } from '../../../commonStyles/style-layout';
//import FullScreenLoader from "../../../components/FullScreenLoader";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0,
  designID = 0;

const MarkAvailabilityScreen = ({ route, navigation }) => {
  //#region Variables

  const isFocused = useIsFocused();
  const [markStatus, setMarkStatus] = useState('');

  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState('');
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success,
  );
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const [companyName, setCompanyName] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [contactMobileNumber, setContactMobileNumber] = React.useState('');
  const [address1, setAddress1] = React.useState('');
  const [stateName, setStateName] = React.useState('');
  const [cityName, setCityName] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [gstNumber, setGstNumber] = React.useState('');
  const [pan, setPan] = React.useState('');
  const [serviceProviderRole, setServiceProviderRole] = React.useState('');
  const [buyerCategoryName, setBuyerCategoryName] = React.useState('');
  const [addedBy, setAddedBy] = React.useState(false);
  const [display, setDisplay] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [updateID, setUpdateID] = React.useState(0);
  const [updateDate, setUpdateDate] = React.useState("");
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const refRBSheet = useRef();
  //#endregion

  //#region Functions
  const [selectedPrinter, setSelectedPrinter] = React.useState();

  const print = sendpricelist_refno => {
    setIsButtonLoading(true);
    const uri = getPrintData(sendpricelist_refno);
    return uri;
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinter(); // iOS only
    setSelectedPrinter(printer);
  };

  useEffect(() => {
    GetUserID();
  }, []);

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      const userDataParsed = JSON.parse(userData);
      userID = userDataParsed.UserID;
      companyID = userDataParsed.Sess_company_refno;
      branchID = userDataParsed.Sess_branch_refno;
      designID = userDataParsed.Sess_designation_refno;
      FetchData();
      if (route.params.type == 'View') {
        setIsButtonDisabled(true);
      }
    }
  };

  const ToggleCheckAll = status => {
    setMarkStatus(status);
    const updatedData = employeeData.map(item => ({
      ...item,
      is_selected: status,
    }));
    setEmployeeData(updatedData);
  };

  const MarkAttendance = () => {
    setIsButtonLoading(true);
    setIsButtonDisabled(true);
    let record = employeeData.find(el => el.is_selected == true);
    if (record) {
      const employee_user_refno = employeeData.filter(
        el => el.is_selected == true,
      );
      const activeEmployee = employee_user_refno.map(
        record => record.employee_user_refno,
      );

      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          employee_user_refno: activeEmployee,
        },
      };

      if (route.params.type == 'add' && updateID == 0) {
        params.data.availability_date = moment(new Date()).format('DD-MM-YYYY');
      } else {
        params.data.availability_refno = updateID == 0 ? route.params.data.id : updateID;
        params.data.availability_date = updateDate;
      }

      Provider.createDFCommon(
        route.params.type == 'add' && updateID == 0
          ? Provider.API_URLS.branchadmin_employee_markavailability_create
          : Provider.API_URLS.branchadmin_employee_markavailability_update,
        params,
      )
        .then(response => {
          if (response.data && response.data.code === 200) {
            if (response.data.data) {
              if (
                response.data.code === 200 &&
                response.data.data.Created == 1
              ) {
                route.params.fetchData('add');
                navigation.goBack();
              } else if (
                response.data.code === 200 &&
                response.data.data.Updated == 1
              ) {
                route.params.fetchData('update');
                navigation.goBack();
              } else if (
                response.data.data.Created === 0 ||
                response.data.data.Updated === 0
              ) {
                setSnackbarColor(theme.colors.error);
                setSnackbarText(response.data.message);
                setSnackbarVisible(true);
              } else {
                setSnackbarText(communication.InsertError);
                setSnackbarVisible(true);
              }
            }
          } else {
            setListData([]);
          }
          setIsButtonLoading(false);
          setIsButtonDisabled(false);
          setIsLoading(false);
          setRefreshing(false);
        })
        .catch(e => {
          setIsButtonLoading(false);
          setIsButtonDisabled(false);
          setIsLoading(false);
          setSnackbarText(e.message);
          setSnackbarColor(theme.colors.error);
          setSnackbarVisible(true);
          setRefreshing(false);
        });
    } else {
      setIsButtonLoading(false);
      setIsButtonDisabled(false);
      setSnackbarText('Please select atleast one employee');
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    }
  };

  const ToggleSingleItem = id => {
    let status = employeeData.find(
      el => el.employee_user_refno === id,
    ).is_selected;
    const updatedData = employeeData.map(item => {
      if (item.employee_user_refno === id) {
        return { ...item, is_selected: !status };
      }
      return item;
    });

    setEmployeeData(updatedData);
    setIsClicked(!isClicked);
  };

  const FetchData = from => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.branchadmin_getemployeelist_markavailability,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            let new_data = [];

            if (response.data.data?.availability_refno > 0) {
              setUpdateID(response.data.data?.availability_refno);
              setUpdateDate(response.data.data.availability_date);
            }

            response.data.data.employee_data.map(data => {
              new_data.push({
                common_employee_code: data.common_employee_code,
                designation_name: data.designation_name,
                employee_name: data.employee_name,
                employee_user_refno: data.employee_user_refno,
                is_selected: response.data.data.checked_employee_user_refnos.includes(data.employee_user_refno) ? true : false,
              });
            });

            const lisData = [...new_data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData(new_data);
            setListSearchData(new_data);
            setEmployeeData(new_data);
          }
        } else {
          setListData([]);
        }
        setIsLoading(false);
        setRefreshing(false);
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const onChangeSearch = query => {
    setSearchQuery(query);
    if (query === '') {
      listSearchData[1](listData[0]);
    } else {
      listSearchData[1](
        listData[0].filter(el => {
          return el.contactPerson
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase());
        }),
      );
    }
  };

  const SearchClient = () => {
    navigation.navigate('SearchClientScreen', {
      type: 'add',
      fetchData: FetchData,
    });
  };

  

  function RenderItems(item, index) {
    const isChecked = employeeData == []
      ? 'unchecked'
      : employeeData.find(
        el =>
          el.employee_user_refno ===
          item.employee_user_refno,
      ) == undefined
        ? 'unchecked'
        : employeeData.find(
          el =>
            el.employee_user_refno ===
            item.employee_user_refno,
        ).is_selected == true
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.paddingHorizontal16,
          Styles.flexJustifyCenter,
          Styles.flex1,
          Styles.marginBottom12,
        ]}>
        <View
          style={[
            {
              backgroundColor: '#eee',
              borderRadius: 8,
              elevation: 5,
            },
            Styles.paddingHorizontal8,
            Styles.paddingVertical12,
            Styles.flexRow,
          ]}>
          <View style={[Styles.flex1]}>
            <Image
              source={require('../../../../assets/defaultIcon.png')}
              style={(Styles.flex1, { width: 48, height: 48 })}
              resizeMode="cover"
            />
          </View>
          <View style={[Styles.flexColumn, Styles.flex3]}>
            <Text style={[Styles.fontSize12]}>{item.employee_name}</Text>
            <Text style={[Styles.fontSize10, Styles.blueFontColor]}>
              {item.common_employee_code}
            </Text>
            <View
              style={[
                Styles.width100per,
                Styles.marginVertical4,
                { backgroundColor: '#d3d3d3', height: 1 },
              ]}></View>
            <Text style={[Styles.fontSize10]}>
              {item.designation_name}
            </Text>
          </View>
          <View style={[Styles.flex1]}>
            {/* <Icon name={isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={30} color={C.colorPrimary} /> */}
            <Checkbox.Item
              style={Styles.marginTop8}
              label=""
              status={
                employeeData == []
                  ? 'unchecked'
                  : employeeData.find(
                    el =>
                      el.employee_user_refno ===
                      item.employee_user_refno,
                  ) == undefined
                    ? 'unchecked'
                    : employeeData.find(
                      el =>
                        el.employee_user_refno ===
                        item.employee_user_refno,
                    ).is_selected == true
                      ? 'checked'
                      : 'unchecked'
              }
              onPress={() => {
                ToggleSingleItem(item.employee_user_refno);
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  
  //#endregion

  return (
    isFocused && (
      <View style={[Styles.flex1]}>
        {isLoading ? (
          <View
            style={[
              Styles.flex1,
              Styles.flexJustifyCenter,
              Styles.flexAlignCenter,
            ]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : listData.length > 0 ? (
          <View
            style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
            <View
              style={[Styles.paddingHorizontal16, Styles.paddingVertical12]}>
              <TextInput
                mode="outlined"
                dense
                label="Date of Availability"
                value={moment(new Date()).format('DD-MM-YYYY')}
                returnKeyType="next"
                editable={false}
                selectTextOnFocus={false}
                style={{ backgroundColor: '#f2f0f0' }}
              />
            </View>

            <View
              style={[
                Styles.flexRow,
                Styles.paddingHorizontal16,
                Styles.flexAlignCenter,
                { justifyContent: 'space-between' },
              ]}>
              <View>
                <Checkbox.Item
                  style={Styles.marginTop8}
                  label="Check All"
                  status={markStatus ? 'checked' : 'unchecked'}
                  onPress={() => {
                    ToggleCheckAll(!markStatus);
                  }}></Checkbox.Item>
              </View>
              <View>
                <Button
                  mode="contained"
                  loading={isButtonLoading}
                  disabled={isButtonDisabled}
                  onPress={MarkAttendance}>
                    {updateID == 0 ? "Mark Availability" : "Update Availability"}
                </Button>
              </View>
            </View>
            <Search
              data={listData}
              setData={setListSearchData}
              filterFunction={[
                'common_employee_code',
                'designation_name',
                'employee_name',
              ]}
            />
            {listSearchData?.length > 0 ? (
              // <SwipeListView
              //   previewDuration={1000}
              //   previewOpenValue={-72}
              //   previewRowKey="1"
              //   previewOpenDelay={1000}
              <FlatList
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => String(index)}
                data={listSearchData}
                renderItem={({ item, index }) => RenderItems(item, index)}
                contentContainerStyle={[{ paddingBottom: 0 }]}
              />
            ) : (
              <NoItems
                icon="format-list-bulleted"
                text="No records found for your query"
              />
            )}
          </View>
        ) : (
          <NoItems
            icon="format-list-bulleted"
            text="No records found."
          />
        )}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: snackbarColor }}>
          {snackbarText}
        </Snackbar>
        <RBSheet
          ref={refRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={true}
          dragFromTopOnly={true}
          height={620}
          animationType="fade"
          customStyles={{
            wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
            draggableIcon: { backgroundColor: '#000' },
          }}>
          <View>
            <Title style={[Styles.paddingHorizontal16]}>{companyName}</Title>
            <ScrollView style={{ marginBottom: 64 }}>
              <List.Item title="Contact Person" description={contactPerson} />
              <List.Item
                title="Contact Mobile No"
                description={contactMobileNumber}
              />
              <List.Item title="Address" description={address1} />
              <List.Item title="State Name" description={stateName} />
              <List.Item title="City Name" description={cityName} />
              <List.Item title="Pincode" description={pincode} />
              <List.Item title="GST" description={gstNumber} />
              <List.Item title="PAN" description={pan} />
              <List.Item
                title="Service Provider Role"
                description={serviceProviderRole}
              />
              {buyerCategoryName != '' && (
                <>
                  <List.Item
                    title="Buyer Category"
                    description={buyerCategoryName}
                  />
                </>
              )}
              <List.Item
                title="Created Or Added"
                description={addedBy == 0 ? 'Add' : 'Create'}
              />
              <List.Item title="Display" description={display ? 'Yes' : 'No'} />
            </ScrollView>
          </View>
        </RBSheet>
      </View>
    )
  );
};

export default MarkAvailabilityScreen;
