import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    View,
    RefreshControl,
    LogBox,
    ScrollView,
    Platform,
    Dimensions,
    StyleSheet,
    Text,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import {
    FAB,
    List,
    Searchbar,
    Snackbar,
    Title,
    Button,
} from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import RBSheet from 'react-native-raw-bottom-sheet';
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
import HDividerSmall from '../../Marketing/EmployeeActivity/common/HDividerSmall';
import Search from '../../../components/Search';

//import FullScreenLoader from "../../../components/FullScreenLoader";

LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
]);
let userID = 0,
    groupID = 0,
    companyID = 0,
    branchID = 0;

const CardComponent = ({
    data,
    fetchData,
    setSnackbarColor,
    setSnackbarText,
    setSnackbarVisible,
    navigation,
    ViewDetails,
}) => {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isButtonDisabled2, setIsButtonDisabled2] = useState(false);

    return (
        <View
            style={[
                {
                    backgroundColor: '#eee',
                    borderRadius: 8,
                    elevation: 5,
                },
                Styles.paddingHorizontal8,
                Styles.paddingVertical12,
            ]}>
            <View style={[Styles.flex1, Styles.flexRow]}>
                <View style={[Styles.flex1]}>
                    <LabelInput label="Month & Year" value={data.month_year} />
                </View>
                <View style={[Styles.flex1, Styles.flexJustifyEnd]}>
                    <LabelInput
                        label="Total Present Days"
                        value={data.total_presentdays}
                    />
                </View>
            </View>
            <HDivider />
            <View style={[Styles.flex1, Styles.flexRow]}>
                <View style={[Styles.flex1]}>
                    <LabelInput
                        label="Salary"
                        value={data.this_month_salary}
                    />
                </View>
                <View style={[Styles.flex1, Styles.flexJustifyEnd]}>
                    <LabelInput label="Adv. Amount" value={data.total_advance_amount} />
                </View>
                <View style={[Styles.flex1, Styles.flexJustifyEnd]}>
                    <LabelInput label="Net Salary" value={data.net_salary} />
                </View>
            </View>
            <HDivider />

            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Button
                        mode="outlined"
                        disabled={isButtonDisabled}
                        loading={isButtonDisabled}
                        labelStyle={[Styles.fontSize10]}
                        onPress={ViewDetails}
                        style={{
                            borderWidth: 2,
                            borderRadius: 4,
                            borderColor: theme.colors.greenBorder,
                        }}>
                        View Details
                    </Button>
                </View>
            </View>
        </View>
    );
};

const SingleEmployeeAttendanceReport = ({ route, navigation }) => {
    //#region Variables

    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [snackbarVisible, setSnackbarVisible] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState('');
    const [snackbarColor, setSnackbarColor] = React.useState(
        theme.colors.success,
    );
    const [listData, setListData] = useState([]);
    const [listSearchData, setListSearchData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);

    const [popupData, setPopUpData] = useState([]);
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

    const [yearFullData, setYearFullData] = React.useState([]);
    const [yearData, setYearData] = React.useState([]);
    const [yearName, setYearName] = React.useState("");
    const [yearID, setYearID] = React.useState(0);


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
        navigation.setOptions({ headerTitle: route.params.headerTitle });
    }, []);

    const GetUserID = async () => {
        const userData = await AsyncStorage.getItem('user');
        if (userData !== null) {
            const userDataParsed = JSON.parse(userData);
            userID = route.params.employeeID;
            companyID = userDataParsed.Sess_company_refno;
            groupID = userDataParsed.Sess_group_refno;
            branchID = userDataParsed.Sess_branch_refno;
            FetchAttendanceStatus();
            console.log('check year param:', route.params?.year);
            if(route.params?.year != undefined) {
                console.log('step 1');
                FetchData(route.params?.year);
            }
            else {
                console.log('step 2');
                FetchYear();
            }
        }
    };

    const FetchAttendanceStatus = () => {
        let params = {
            data: {
                Sess_UserRefno: route.params.employeeID,
                Sess_company_refno: companyID,
            },
        };
        console.log('params:**********', params, "*======================*");
        Provider.createDFEmployee(
            Provider.API_URLS.employee_overall_cumulative_attendance_status,
            params,
        )
            .then(response => {
                console.log('resp===========:', response.data.data, "=======================");
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setAttendanceData(response.data.data)
                    }
                } else {
                    setAttendanceData([]);
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

    const FetchYear = () => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
            },
        };
        Provider.createDFEmployee(
            Provider.API_URLS.employee_attendance_getyear,
            params,
        )
            .then(response => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setYearFullData(response.data.data)
                        const yearData = response.data.data.map((data) => data.year);
                        setYearData(yearData);
                        let year = response.data.data.find((el) => {
                            return el.year == new Date().getFullYear();
                        }).year;
                        setYearName(year);
                        FetchData(year);
                    }
                } else {
                    setYearData([]);
                }
            })
            .catch(e => {
                setSnackbarText(e.message);
                setSnackbarColor(theme.colors.error);
                setSnackbarVisible(true);
            });
    };

    const FetchData = (year) => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                year: year == undefined ? yearName : year
            },
        };
        console.log('Single params:**********', params, "*======================*");
        Provider.createDFEmployee(
            Provider.API_URLS.employee_yearwise_attendancesalary_gridlist,
            params,
        )
            .then(response => {
                console.log('Single resp===========:', response.data.data, "=======================");
                if (response && response.data) {
                    if (response.data.data) {

                        const listData = [...response.data.data];
                        listData.map((k, i) => {
                            k.key = (parseInt(i) + 1).toString();
                        });

                        setListData(listData);
                        setListSearchData(listData);

                    } else {
                        // Invalid data format, handle it accordingly
                        setListData([]);
                        setListSearchData([]);
                    }
                } else {
                    // Handle other error cases if needed
                    setListData([]);
                    setListSearchData([]);
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

    const FetchDetails = pass_parameter => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                Sess_branch_refno: branchID,
                pass_parameter: pass_parameter,
            },
        };
        Provider.createDFEmployee(
            Provider.API_URLS.employee_monthwise_attendance_viewdetails,
            params,
        )
            .then(response => {
                console.log('EMP resp===========:', response.data.data, "=======================");
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        let new_data = [];
                        response.data.data.map((data, idx) => {
                            new_data.push({
                                id: data.sno,
                                day: data.date,
                                month: data.month_shortname,
                                fullDate: data.attendance_date_dmy,
                                attendanceby: data.attendance_and_project_data?.attendanceby_name,
                                advanceAmount: data?.day_advance_amount,
                                presentDayCount: data.daywise_present_count_total,
                                projectName: data.attendance_and_project_data?.project_name
                            });
                        });
                        setPopUpData(new_data);
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

    const RenderItems = data => {
        return (
            <View
                style={[
                    Styles.backgroundColor,
                    Styles.flexJustifyCenter,
                    Styles.flex1,
                    Styles.marginBottom12,
                ]}>
                <CardComponent
                    key={data.item.key}
                    data={data.item}
                    onPrintFile={print}
                    setSnackbarColor={setSnackbarColor}
                    setSnackbarText={setSnackbarText}
                    setSnackbarVisible={setSnackbarVisible}
                    selectedPrinter={selectedPrinter}
                    fetchData={FetchData}
                    loader={isButtonLoading}
                    navigation={navigation}
                    ViewDetails={() => {
                        ViewDetails(data.item);
                    }}
                />
            </View>
        );
    };

    const onYearSelected = (selectedItem) => {
        setYearName(selectedItem);
        FetchData(selectedItem);

    };

    const ViewDetails = data => {
        FetchDetails(data.pass_parameter);
        refRBSheet.current.open();
    };

    const stylesJ = StyleSheet.create({
        container: {
            backgroundColor: '#DCDCDC',
        },
        eventList: {
            marginTop: 20,
        },
        eventBox: {
            padding: 10,
            marginTop: 2,
            marginBottom: 2,
            flexDirection: 'row',
        },
        eventDate: {
            flexDirection: 'column',
        },
        eventDay: {
            fontSize: 34,
            color: '#0099FF',
            fontWeight: '600',
        },
        eventMonth: {
            fontSize: 16,
            color: '#0099FF',
            fontWeight: '600',
        },
        eventContent: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginLeft: 10,
            backgroundColor: '#FFFFFF',
            padding: 8,
            borderRadius: 10,
        },
        description: {
            fontSize: 15,
            color: '#646464',
        },
        eventTime: {
            fontSize: 2,
            color: '#646464',
        },
        userName: {
            fontSize: 10,
            color: '#151515',
        },
        titleFont: { fontSize: 10 },
    });

    //#endregion

    return (
        <View style={[Styles.flex1]}>
            <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
                <ScrollView style={[Styles.flex1, Styles.backgroundColor]} keyboardShouldPersistTaps="handled">
                    <View style={[Styles.paddingHorizontal16]}>
                        <View
                            style={[
                                Styles.marginTop16,
                                Styles.flexSpaceBetween,
                                Styles.flexRow,
                            ]}>
                            <TouchableOpacity
                                style={[
                                    Styles.height80,
                                    Styles.borderRadius8,
                                    Styles.backgroundGreen,
                                    Styles.padding14,
                                    Styles.boxElevation,
                                    { width: 156 },
                                ]}>
                                <Icon
                                    name="account-cash"
                                    size={24}
                                    color={theme.colors.textLight}
                                />
                                <Text
                                    style={[
                                        Styles.fontSize12,
                                        {
                                            color: '#fff',
                                            width: '100%',
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            bottom: 14,
                                            left: 14,
                                        },
                                    ]}>
                                    TOTAL PRESENT DAYS
                                </Text>
                                <View
                                    style={[
                                        Styles.width50per,
                                        Styles.height32,
                                        Styles.flexRow,
                                        Styles.flexAlignEnd,
                                        Styles.flexAlignStart,
                                        { position: 'absolute', right: 20, top: 10 },
                                    ]}>
                                    <Text
                                        style={[
                                            Styles.fontSize20,
                                            Styles.textLeft,
                                            { color: '#fff', fontWeight: 'bold' },
                                        ]}>
                                        {attendanceData[0]?.overall_total_presentdays}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    Styles.height80,
                                    Styles.borderRadius8,
                                    Styles.backgroundGreen,
                                    Styles.padding14,
                                    Styles.boxElevation,
                                    { width: 156 },
                                ]}>
                                <Icon
                                    name="account-cash"
                                    size={24}
                                    color={theme.colors.textLight}
                                />
                                <Text
                                    style={[
                                        Styles.fontSize12,
                                        {
                                            color: '#fff',
                                            width: '100%',
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            bottom: 14,
                                            left: 14,
                                        },
                                    ]}>
                                    TOTAL SALARY
                                </Text>
                                <View
                                    style={[
                                        Styles.width50per,
                                        Styles.height32,
                                        Styles.flexRow,
                                        Styles.flexAlignEnd,
                                        Styles.flexAlignStart,
                                        { position: 'absolute', right: 20, top: 10, alignItems: 'center' },
                                    ]}>
                                    <Icon
                                        name="currency-inr"
                                        size={16}
                                        color={theme.colors.textLight}
                                    />
                                    <Text
                                        style={[
                                            Styles.fontSize18,
                                            Styles.textLeft,
                                            { color: '#fff', fontWeight: 'bold' },
                                        ]}>
                                        {attendanceData[0]?.overall_total_salary}
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
                                style={[
                                    Styles.height80,
                                    Styles.borderRadius8,
                                    Styles.backgroundGreen,
                                    Styles.padding14,
                                    Styles.boxElevation,
                                    { width: 156 },
                                ]}>
                                <Icon
                                    name="account-cash"
                                    size={24}
                                    color={theme.colors.textLight}
                                />
                                <Text
                                    style={[
                                        Styles.fontSize12,
                                        {
                                            color: '#fff',
                                            width: '100%',
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            bottom: 14,
                                            left: 14,
                                        },
                                    ]}>
                                    TOTAL ADVANCE
                                </Text>
                                <View
                                    style={[
                                        Styles.width50per,
                                        Styles.height32,
                                        Styles.flexRow,
                                        Styles.flexAlignEnd,
                                        Styles.flexAlignStart,
                                        { position: 'absolute', right: 20, top: 10, alignItems: 'center' },
                                    ]}>
                                    <Icon
                                        name="currency-inr"
                                        size={16}
                                        color={theme.colors.textLight}
                                    />
                                    <Text
                                        style={[
                                            Styles.fontSize18,
                                            Styles.textLeft,
                                            { color: '#fff', fontWeight: 'bold' },
                                        ]}>
                                        {attendanceData[0]?.overall_advance_amount}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    Styles.height80,
                                    Styles.borderRadius8,
                                    Styles.backgroundGreen,
                                    Styles.padding14,
                                    Styles.boxElevation,
                                    { width: 156 },
                                ]}>
                                <Icon name="bank" size={24} color={theme.colors.textLight} />
                                <Text
                                    style={[
                                        Styles.fontSize12,
                                        {
                                            color: '#fff',
                                            width: '100%',
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            bottom: 14,
                                            left: 14,
                                        },
                                    ]}>
                                    NET SALARY
                                </Text>
                                <View
                                    style={[
                                        Styles.width50per,
                                        Styles.height32,
                                        Styles.flexRow,
                                        Styles.flexAlignEnd,
                                        Styles.flexAlignStart,
                                        { position: 'absolute', right: 20, top: 10, alignItems: 'center' },
                                    ]}>
                                    <Icon
                                        name="currency-inr"
                                        size={16}
                                        color={theme.colors.textLight}
                                    />
                                    <Text
                                        style={[
                                            Styles.fontSize18,
                                            Styles.textLeft,
                                            { color: '#fff', fontWeight: 'bold' },
                                        ]}>
                                        {attendanceData[0]?.overall_net_salary}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[Styles.paddingHorizontal16, Styles.paddingVertical16]}>
                    <Dropdown label="Year" data={yearData} onSelected={onYearSelected} selectedItem={yearName} />
                        
                        <>
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

                                <>
                                    <Search
                                        data={listData}
                                        setData={setListSearchData}
                                        filterFunction={[
                                            'month_year',
                                            'net_salary',
                                            'this_month_salary',
                                            'monthyear_name',
                                            'total_advance_amount',
                                            'total_presentdays',
                                        ]}
                                    />

                                    {listSearchData?.length > 0 ? (
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
                                                        FetchData();
                                                    }}
                                                />
                                            }
                                            data={listSearchData}
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
                                </>

                            ) : (
                                <NoItems icon="format-list-bulleted" text="No records found" />
                            )}

                        </>
                    </View>
                </ScrollView>
            </View>

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
                        <View style={stylesJ.container}>
                            <FlatList
                                enableEmptySections={true}
                                style={stylesJ.eventList}
                                data={popupData}
                                keyExtractor={item => {
                                    return item.id;
                                }}
                                renderItem={({ item }) => {
                                    return (
                                        <View style={stylesJ.eventBox}>
                                            <View style={[Styles.flexColumn, Styles.flexAlignCenter, Styles.flexJustifyCenter]}>
                                                <Text style={stylesJ.eventDay}>{item.day}</Text>
                                                <Text style={stylesJ.eventMonth}>{item.month}</Text>
                                            </View>
                                            <View style={stylesJ.eventContent}>
                                                <Text style={[Styles.fontSize10, Styles.fontBold]}>
                                                    Project Name
                                                </Text>
                                                <Text style={stylesJ.userName}>
                                                    {item.projectName}
                                                </Text>
                                                <HDividerSmall />
                                                <Text style={[Styles.fontSize10, Styles.fontBold]}>
                                                    Present Day Count
                                                </Text>
                                                <Text style={stylesJ.userName}>
                                                    {item.presentDayCount}
                                                </Text>
                                                <HDividerSmall />
                                                <Text style={[Styles.fontSize10, Styles.fontBold]}>
                                                    Attendance By
                                                </Text>
                                                <Text style={stylesJ.userName}>
                                                    {item.attendanceby}
                                                </Text>
                                                <HDividerSmall />
                                                <Text style={[Styles.fontSize10, Styles.fontBold]}>
                                                    Advance Amount
                                                </Text>
                                                <Text style={stylesJ.userName}>
                                                    {item.advanceAmount}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    </ScrollView>
                </View>
            </RBSheet>
        </View>
    );
};

export default SingleEmployeeAttendanceReport;
