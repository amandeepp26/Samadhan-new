import {useEffect, useRef, useState} from 'react';
import {
  View,
  LogBox,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Button, Snackbar, HelperText, Text, Divider} from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import {SwipeListView} from 'react-native-swipe-list-view';
import Provider from '../../../api/Provider';
import Header from '../../../components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NoItems from '../../../components/NoItems';
import {Styles} from '../../../styles/styles';
import {theme} from '../../../theme/apptheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {projectVariables} from '../../../utils/credentials';
import {useIsFocused} from '@react-navigation/native';
import {DateTimePicker} from '@hashiprobr/react-native-paper-datetimepicker';
import moment from 'moment';
import {TransactionListItem} from './TransactionListItem';
import Search from '../../../components/Search';
let userID = 0,
  companyID = 0,
  branchID = 0;
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const PocketTransactionGeneralUserScreen = ({route, navigation}) => {
  //#region Variables

  const [isLoading, setIsLoading] = useState(true);

  const [listData_Self, setListData_Self] = useState([]);
  const [listSearchData_Self, setListSearchData_Self] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const [date, setDate] = useState(new Date());
  const [dateInvalid, setDateInvalid] = useState('');
  const dateRef = useRef({});

  const [fromDate, setFromDate] = useState(new Date());
  const [fromDateInvalid, setFromDateInvalid] = useState('');
  const [fromDateError, setFromDateError] = useState(false);
  const fromDateRef = useRef({});

  const [toDate, setToDate] = useState(new Date());
  const [toDateInvalid, setToDateInvalid] = useState('');
  const [toDateError, setToDateError] = useState(false);
  const toDateRef = useRef({});

  // const [transactionID, setTransactionID] = useState("");
  // const [entryType, setEntryType] = useState("");
  // const [categoryName, setCategoryName] = useState("");
  // const [subCategoryName, setSubCategoryName] = useState("");
  // const [receiptMode, setReceiptMode] = useState("");
  // const [amount, setAmount] = useState("");
  // const [attachment, setAttachment] = useState("");
  // const [display, setDisplay] = useState("");
  // const [depositType, setDepositType] = useState("");

  const [selfCashBalance, setSelfCashBalance] = useState('0');

  const refRBSheet = useRef();
  //#endregion

  //#region Functions

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData !== null) {
      userID = JSON.parse(userData).UserID;
      companyID = JSON.parse(userData).Sess_company_refno;
      branchID = JSON.parse(userData).Sess_branch_refno;
      FetchPocketCashDetails();
      FetchData_Self(
        moment(new Date()).format('DD-MM-YYYY'),
        moment(new Date()).format('DD-MM-YYYY'),
      );
    }
  };

  const FetchPocketCashDetails = () => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckdashboard_cashinpocket_details,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            setSelfCashBalance(response.data.data[0].TotalCashinHand);
          }
        }
      })
      .catch(e => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const FetchData_Self = (fromDate, toDate) => {
    let params = {
      data: {
        Sess_UserRefno: userID,
        Sess_company_refno: companyID.toString(),
        Sess_branch_refno: branchID.toString(),
        pck_entrytype_refno: projectVariables.DEF_PCKDIARY_ENTRYTYPE_SELF_REFNO,
        from_date: fromDate,
        to_date: toDate,
      },
    };
    Provider.createDFPocketDairy(
      Provider.API_URLS.pckdashboard_cashinpocket_gridlist,
      params,
    )
      .then(response => {
        if (response.data && response.data.code === 200) {
          if (response.data.data) {
            const lisData = [...response.data.data];
            lisData.map((k, i) => {
              k.key = (parseInt(i) + 1).toString();
            });
            setListData_Self(response.data.data);
            setListSearchData_Self(response.data.data);
          }
        } else {
          setListData_Self([]);
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

  useEffect(() => {
    GetUserID();
  }, []);

  const RenderItems = data => {
    return (
      <View
        style={[
          Styles.backgroundColor,
          Styles.flexJustifyCenter,
          Styles.paddingHorizontal4,
          Styles.paddingHorizontal16,
          {height: 92},
        ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            Styles.paddingVertical8,
            Styles.paddingHorizontal8,
            Styles.flexRow,
            Styles.borderRadius8,
            Styles.backgroundSecondaryLightColor,
            {elevation: 4},
          ]}>
          <TransactionListItem current={data} type="fin-list" />
        </TouchableOpacity>

        {/* <TouchableOpacity activeOpacity={1}
                    // onPress={() => {
                    //     refRBSheet.current.open();
                    //     setCategoryName(data.item.categoryName);
                    //     setSubCategoryName(data.item.pck_sub_category_name);
                    //     setTransactionTypeName(data.item.transTypeName);
                    //     setAmount(data.item.amount);
                    //     setCurrentBalance(data.item.current_balance);
                    //     setNotes(data.item.notes);
                    //     setTransactionDate(data.item.pck_trans_date);

                    // }}
                    style={[Styles.paddingVertical8, Styles.paddingHorizontal8, Styles.flexRow, Styles.borderRadius8,
                    Styles.backgroundSecondaryLightColor, { elevation: 4 }]}>
                    <View style={[Styles.width50per, Styles.flexColumn]}>
                        <View style={[Styles.width100per, Styles.flexRow, Styles.flexJustifyStart, Styles.flexAlignCenter]}>
                            <Text>{data.item.pck_category_name}</Text>
                        </View>
                        <View style={[Styles.width100per, Styles.flexRow, Styles.flexJustifyStart,
                        Styles.flexAlignCenter, Styles.marginTop4]}>
                            <Text>{data.item.pck_sub_category_name}</Text>
                        </View>
                        <View style={[Styles.width100per, Styles.marginTop4]}>
                            <Text style={[Styles.textLeft]}>{data.item.pck_trans_date}</Text>
                        </View>
                    </View>
                    <View style={[Styles.width50per, Styles.flexColumn, Styles.flexSpaceBetween]}>
                        <View style={[Styles.width100per, Styles.flexRow, Styles.flexJustifyEnd, Styles.flexAlignCenter]}>
                            <Icon name="currency-inr" size={14} /><Text>{data.item.amount}</Text><Icon style={[Styles.marginStart4]} color={data.item.pck_transtype_refno == projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO ? theme.multicolors.green : theme.multicolors.red} name={data.item.pck_transtype_refno == projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO ? "plus-circle" : "minus-circle"} size={14} />
                        </View>
                        <View style={[Styles.width100per,]}>
                            <Text style={[Styles.textRight]}>Balance: <Icon name="currency-inr" size={14} />{data.item.current_balance}</Text>
                        </View>
                    </View>
                </TouchableOpacity> */}
      </View>
    );
  };

  const AddCallback = () => {
    navigation.navigate('AddSource', {
      type: 'add',
      fetchData: FetchData_Self,
    });
  };

  const ValidateSelfData = () => {
    let isValid = true;
    if (fromDate == '') {
      isValid = false;
      setFromDateError(true);
    }

    if (toDate == '') {
      isValid = false;
      setToDateError(true);
    }

    if (isValid) {
      FetchData_Self(
        fromDate == '' ? '' : moment(fromDate).format('DD-MM-YYYY'),
        toDate == '' ? '' : moment(toDate).format('DD-MM-YYYY'),
      );
    }
  };

  //#endregion

  return (
    <View style={[Styles.flex1]}>
      {/* <Header navigation={navigation} title="" /> */}
      <View style={[Styles.flex1]}>
        <ScrollView
          style={[Styles.flex1, Styles.backgroundColor]}
          keyboardShouldPersistTaps="handled">
          <View style={[Styles.padding16]}>
            <View>
              <Text
                style={[
                  Styles.fontSize24,
                  Styles.fontBold,
                  Styles.textCenter,
                  {color: 'green', width: '100%'},
                  Styles.paddingBottom12,
                ]}>
                Balance:
                <Icon name="currency-inr" size={24} />
                {selfCashBalance}
              </Text>
              <Divider />
            </View>

            <View
              style={[
                Styles.bordergray,
                Styles.padding8,
                Styles.borderRadius4,
              ]}>
              <View style={[Styles.marginTop8]}>
                <Text
                  style={[
                    Styles.fontSize18,
                    {color: 'green', width: '100%'},
                    Styles.paddingBottom12,
                  ]}>
                  Check Datewise Result
                </Text>
                <Divider />
              </View>

              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChangeDate={setFromDate}
                />
                <HelperText type="error" visible={fromDateError}>
                  Please enter a valid date
                </HelperText>
              </View>
              <View>
                <DateTimePicker
                  style={Styles.backgroundColorWhite}
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChangeDate={setToDate}
                />
                <HelperText type="error" visible={toDateError}>
                  Please enter a valid date
                </HelperText>
              </View>
              <View style={[Styles.backgroundColor, Styles.width100per]}>
                <Button mode="contained" onPress={ValidateSelfData}>
                  Submit
                </Button>
              </View>
            </View>
          </View>
          <View style={[Styles.paddingHorizontal16, Styles.paddingTop16]}>
            <Text
              style={[
                Styles.fontSize18,
                {color: 'green', width: '100%'},
                Styles.paddingBottom12,
              ]}>
              Search Result
            </Text>
            <Divider />
          </View>
          <View>
            {listData_Self?.length > 0 ? (
              <View
                style={[
                  Styles.flex1,
                  Styles.flexColumn,
                  Styles.backgroundColor,
                ]}>
                <Search
                  data={listData_Self}
                  setData={setListSearchData_Self}
                  filterFunction={['categoryName']}
                />
                {listSearchData_Self?.length > 0 ? (
                  <SwipeListView
                    previewDuration={1000}
                    previewOpenValue={-72}
                    previewRowKey="1"
                    previewOpenDelay={1000}
                    refreshControl={
                      <RefreshControl
                        colors={[theme.colors.primary]}
                        refreshing={refreshing}
                        onRefresh={() => {
                          FetchData_Self();
                        }}
                      />
                    }
                    data={listSearchData_Self}
                    disableRightSwipe={true}
                    rightOpenValue={-72}
                    renderItem={data => RenderItems(data)}
                  />
                ) : (
                  <NoItems
                    icon="format-list-bulleted"
                    text="No records found for your query"
                  />
                )}
              </View>
            ) : (
              <NoItems icon="format-list-bulleted" text="No records found." />
            )}
          </View>
        </ScrollView>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{backgroundColor: snackbarColor}}>
        {snackbarText}
      </Snackbar>
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={720}
        animationType="fade"
        customStyles={{
          wrapper: {backgroundColor: 'rgba(0,0,0,0.5)'},
          draggableIcon: {backgroundColor: '#000'},
        }}>
        <View>
          {/* <Title style={[Styles.paddingHorizontal16]}>{entryType}</Title>
                    <ScrollView>
                        <List.Item title="Date" description={date} />
                        <List.Item title="Entry Type " description={entryType} />
                        <List.Item title="Category Name" description={categoryName} />
                        <List.Item title="Sub Category Name" description={subCategoryName} />
                        <List.Item title="Receipt Mode Type" description={receiptMode} />
                        <List.Item title="Amount" description={amount} />
                        <List.Item title="Display" description={display} />
                    </ScrollView> */}
        </View>
      </RBSheet>
    </View>
  );
};

export default PocketTransactionGeneralUserScreen;
