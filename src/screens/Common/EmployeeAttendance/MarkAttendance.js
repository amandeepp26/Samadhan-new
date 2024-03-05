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
  RadioButton,
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
//import FullScreenLoader from "../../../components/FullScreenLoader";

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
let userID = 0,
  groupID = 0,
  companyID = 0,
  branchID = 0,
  designID = 0,
  groupExtra = 0;

const MarkAttendanceScreen = ({ route, navigation }) => {
  //#region Variables

  const [markStatus, setMarkStatus] = useState('');
  const [availabilityRefno, setAvailabilityRefno] = useState('');
  const [todayDate, setTodayDate] = useState(new Date());
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
      groupExtra = userDataParsed.Sess_group_refno_extra_1;
      FetchData();
      if (route.params.type == 'View') {
        setIsButtonDisabled(true);
      }
    }
  };

  const MarkAttendance = () => {
    const filteredData = employeeData.filter(record => record.selectedID != '');

    if (filteredData.length > 0) {
      const activeEmployee = filteredData.map(
        record => record.employee_user_refno,
      );
      const attendanceStatus = filteredData.map(record => record.selectedID);
      const remarks = filteredData.map(record => record.remarks);
      const resultObject_attendance = {},
        resultObject_remarks = {};

      activeEmployee.forEach((key, index) => {
        const value = attendanceStatus[index];
        resultObject_attendance[key] = value;
      });

      activeEmployee.forEach((key, index) => {
        const value = remarks[index];
        resultObject_remarks[key] = value;
      });

      let params = {
        data: {
          Sess_UserRefno: userID,
          Sess_company_refno: companyID,
          Sess_branch_refno: branchID,
          employee_user_refno: activeEmployee,
          attendance_status: resultObject_attendance,
          remarks: resultObject_remarks,
        },
      };

      if (route.params.type == 'add' && updateID == 0) {
        params.data.availability_refno = availabilityRefno;
        params.data.attendance_date = moment(todayDate).format('DD-MM-YYYY');
        params.data.availability_date = moment(new Date()).format('DD-MM-YYYY');
      } else {
        params.data.attendance_date = updateDate
        params.data.attendance_refno = updateID == 0 ? route.params.data.id : updateID; 
      }

      Provider.createDFCommon(
        route.params.type == 'add' && updateID == 0
          ? Provider.API_URLS.branchadmin_employee_attendance_create
          : Provider.API_URLS.branchadmin_employee_attendance_update,
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
    } else {
      setSnackbarText('Please enter data for atleast one employee');
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
  };

  const FetchData = from => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID,
        Sess_branch_refno: branchID,
        Sess_designation_refno: designID,
        Sess_group_refno_extra_1: groupExtra,
      },
    };
    Provider.createDFCommon(
      Provider.API_URLS.branchadmin_getemployeelist_attendance,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setAvailabilityRefno(response.data.data.availability_refno);

            if (response.data.data?.attendance_refno > 0) {
              setUpdateID(response.data.data?.attendance_refno);
              setUpdateDate(response.data.data.attendance_date);
            }

            let new_data = [];
            response.data.data.employee_data.map(data => {
              let existingData = response.data.data?.presented_employee_user_refnos.find(item => item.employee_user_refno === data.employee_user_refno);
              
                new_data.push({
                  common_employee_code: data.common_employee_code,
                  designation_name: data.designation_name,
                  employee_name: data.employee_name,
                  employee_user_refno: data.employee_user_refno,
                  attendance_status: data.attendance_status,
                  selectedID: existingData ? existingData.present_attendance_status : '',
                  remarks: existingData ? existingData.remarks : '',
                });
            });

            const lisData = [...new_data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData(lisData);
            setListSearchData(lisData);
            setEmployeeData(lisData);
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

  const onRemarkChanged = (text, id) => {
    const updatedData = employeeData.map(item => {
      if (item.employee_user_refno === id) {
        return { ...item, remarks: text };
      }
      return item;
    });

    setEmployeeData(updatedData);
  };

  const RenderItems = data => {
    const objectArray = Object.keys(data.attendance_status);
    const objectArrayValue = Object.values(data.attendance_status);

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
            <View style={[Styles.flex1, Styles.flexRow]}>
              <View style={[Styles.flex1]}>
                <Image
                  source={require('../../../../assets/defaultIcon.png')}
                  style={(Styles.flex1, { width: 48, height: 48 })}
                  resizeMode="cover"
                />
              </View>
              <View style={[Styles.flexColumn, Styles.flex2_5]}>
                <Text style={[Styles.fontSize12]}>
                  {data.employee_name}
                </Text>
                <Text style={[Styles.fontSize10, Styles.blueFontColor]}>
                  {data.common_employee_code}
                </Text>
                <View
                  style={[
                    Styles.width100per,
                    Styles.marginVertical4,
                    { backgroundColor: '#d3d3d3', height: 1 },
                  ]}></View>
                <Text style={[Styles.fontSize10]}>
                  {data.designation_name}
                </Text>
              </View>
              <View style={[Styles.flex1]}>
                <RadioButton.Group
                  onValueChange={value => {
                    const updatedData = employeeData.map(item => {
                      if (
                        data.employee_user_refno ===
                        item.employee_user_refno
                      ) {
                        return { ...item, selectedID: value.toString() };
                      }
                      return item;
                    });

                    setEmployeeData(updatedData);
                  }}
                  value={
                    employeeData == []
                      ? ''
                      : employeeData.find(
                        el =>
                          el.employee_user_refno ===
                          data.employee_user_refno,
                      ) == undefined
                        ? ''
                        : employeeData.find(
                          el =>
                            el.employee_user_refno ===
                            data.employee_user_refno,
                        ).selectedID
                  }>
                  {objectArray?.map((item, idx) => (
                    <RadioButton.Item
                      key={idx}
                      position="leading"
                      style={[
                        Styles.paddingVertical2,
                        Styles.height32,
                        Styles.width96,
                      ]}
                      labelStyle={[
                        Styles.textLeft,
                        Styles.paddingStart0,
                        Styles.fontSize12,
                      ]}
                      label={objectArrayValue[idx]}
                      value={objectArray[idx]}
                    />
                  ))}
                </RadioButton.Group>
              </View>
            </View>
            <View style={[Styles.flex1]}>
              <View style={[Styles.flexRow]}>
                <TextInput
                  mode="outlined"
                  dense
                  onChangeText={text => {
                    onRemarkChanged(text, data.employee_user_refno);
                  }}
                  multiline={true}
                  label="Remarks"
                  value={
                    employeeData == []
                      ? ''
                      : employeeData.find(
                        el =>
                          el.employee_user_refno ===
                          data.employee_user_refno,
                      ) == undefined
                        ? ''
                        : employeeData.find(
                          el =>
                            el.employee_user_refno ===
                            data.employee_user_refno,
                        ).remarks
                  }
                  selectTextOnFocus={false}
                  style={[Styles.width100per, { backgroundColor: '#fafafa' }]}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  
  //#endregion

  return (
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
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <View style={[Styles.paddingHorizontal16, Styles.paddingVertical12]}>
            <TextInput
              mode="outlined"
              dense
              label="Date of Attendance"
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
              Styles.flexJustifyEnd,
            ]}>
            <View>
              <Button
                mode="contained"
                loading={isButtonLoading}
                disabled={isButtonDisabled}
                onPress={MarkAttendance}>
                {updateID == 0 ? "Mark Attendance" : "Update Attendance"}
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
          text="No records found. Please check first employee availability for today's date."
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
  );
};

export default MarkAttendanceScreen;
