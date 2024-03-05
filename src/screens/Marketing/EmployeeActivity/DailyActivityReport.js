import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    View,
    LogBox,
    RefreshControl,
    ScrollView,
    Text,
} from "react-native";
import {
    List,
    Snackbar,
    Title,
    Card,
    Button,
    Subheading,
    Divider,
    HelperText,
} from "react-native-paper";
import RBSheet from "react-native-raw-bottom-sheet";
import { SwipeListView } from "react-native-swipe-list-view";
import Provider from "../../../api/Provider";
import Header from "../../../components/Header";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import NoItems from "../../../components/NoItems";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { NullOrEmpty } from "../../../utils/validations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DFButton from "../../../components/Button";
import Search from "../../../components/Search";
import Dropdown from "../../../components/Dropdown";
import moment from "moment";
import { DateTimePicker } from "@hashiprobr/react-native-paper-datetimepicker";
import {
    projectFixedDesignations,

} from "../../../utils/credentials";
import ButtonComponent from "../../../components/Button";

LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
]);
let userID = 0, compID = 0, branchID = 0, designID = 0, groupID = 0, Sess_group_refno_extra_1 = 0;

const DailyActivityReport = ({ navigation, route }) => {
    //#region Variables
    const [isLoading, setIsLoading] = useState(false);
    const [listData, setListData] = useState([]);
    const [listSearchData, setListSearchData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");
    const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

    const [companyDetails, setCompanyDetails] = useState("");
    const [company, setCompanyName] = useState("");
    const [mobile, setMobileNo] = useState("");
    const [groupname, setGroupName] = useState("");
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [selectedID, setSelectedID] = useState(0);

    const [reportTypeFullData, setReportTypeFullData] = React.useState([]);
    const [reportTypeData, setReportTypeData] = React.useState([]);
    const [reportTypeName, setReportTypeName] = React.useState("");
    const [errorRT, setRTError] = React.useState(false);

    const [monthFullData, setMonthFullData] = React.useState([]);
    const [monthData, setMonthData] = React.useState([]);
    const [monthName, setMonthName] = React.useState("");
    const [errorM, setMError] = React.useState(false);

    const [yearFullData, setYearFullData] = React.useState([]);
    const [yearData, setYearData] = React.useState([]);
    const [yearName, setYearName] = React.useState("");
    const [errorY, setYError] = React.useState(false);

    const [fromDtErr, setFromDtErr] = React.useState(false);
    const [toDtErr, setToDtErr] = React.useState(false);
    const activityDDRef = useRef({});

    const [executiveFullData, setExecutiveFullData] = React.useState([]);
    const [executiveData, setExecutiveData] = React.useState([]);
    const [executiveName, setExecutiveName] = React.useState("");
    const [errorEx, setExError] = React.useState(false);

    const [fromDt, setFromDt] = useState(new Date());
    const [toDt, setToDt] = useState(new Date());

    const [reportTypeStatus, setReportTypeStatus] = React.useState("");
    const [showExecutiveStatus, setShowExecutiveStatus] = React.useState(false);


    const refRBSheet = useRef();
    //#endregion

    //#region Functions
    useEffect(() => {
        GetUserID();
    }, []);

    const GetUserID = async () => {
        const userData = await AsyncStorage.getItem("user");
        if (userData !== null) {
            userID = JSON.parse(userData).UserID;
            compID = JSON.parse(userData).Sess_company_refno;
            branchID = JSON.parse(userData).Sess_branch_refno;
            designID = JSON.parse(userData).Sess_designation_refno;
            groupID = JSON.parse(userData).Sess_group_refno;
            Sess_group_refno_extra_1 = JSON.parse(userData).Sess_group_refno_extra_1;

            FetchReportType();
            FetchMonthYear();
            if (designID == projectFixedDesignations.DEF_COMPANYADMIN_DESIGNATION_REFNO ||
                designID == projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO) {
                setShowExecutiveStatus(true);
                FetchExecutive();
            }
        }
    };

    const FetchReportType = () => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_group_refno: groupID,
            },
        };
        Provider.createDFEmployee(
            Provider.API_URLS.get_activity_report_type,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setReportTypeFullData(response.data.data);
                        const reportType = response.data.data.map(
                            (data) => data.activity_report_type_name
                        );
                        setReportTypeData(reportType);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchMonthYear = () => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_group_refno: groupID,
            },
        };
        Provider.createDFEmployee(
            Provider.API_URLS.get_activity_month_year,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setMonthFullData(response.data.data.MonthData);
                        const month = response.data.data.MonthData.map(
                            (data) => data.month_name
                        );
                        setMonthData(month);

                        setYearFullData(response.data.data.YearData);
                        const year = response.data.data.YearData.map(
                            (data) => data.year_name
                        );
                        setYearData(year);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchExecutive = () => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: compID,
                Sess_branch_refno: branchID,
                Sess_designation_refno: designID,
                Sess_group_refno_extra_1:Sess_group_refno_extra_1,
                OutputType: "1",
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.myemployeelist,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        let exData = [];
                        response.data.data.map((data) => {
                            exData.push({
                                employee_user_refno: data.employee_user_refno,
                                employee_name: data.employee_name,
                                common_employee_code: data.common_employee_code,
                                employee_mobile_no: data.employee_mobile_no,
                                displayName: `${data.employee_name}-${data.common_employee_code} (${data.employee_mobile_no})`,
                            });
                        });
                        setExecutiveFullData(exData);
                        const executive = exData.map(
                            (data) => data.displayName
                        );
                        setExecutiveData(executive);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchData = () => {
        let params = {
            data: {
                Sess_UserRefno: showExecutiveStatus ? executiveFullData.find((el) => el.displayName === executiveName)
                    .employee_user_refno : userID,
                Sess_company_refno: compID,
                activity_report_type_refno: reportTypeStatus,
                from_date: moment(fromDt).format("DD-MM-YYYY"),
                to_date: moment(toDt).format("DD-MM-YYYY"),
            },
        };

        if (reportTypeStatus == "2") {
            params.data.month_refno = monthFullData.find((el) => el.month_name === monthName)
                .month_refno;
            params.data.year_refno = yearFullData.find((el) => el.year_name === yearName)
                .year_refno;
        }
        else {
            params.data.month_refno = "0";
            params.data.year_refno = "0";
        }
        console.log('params:', params);
        Provider.createDFEmployee(Provider.API_URLS.employee_gprs_daily_markactivity_report, params)
            .then((response) => {
                console.log('resp:', response.data);
                setIsButtonLoading(false);
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        const lisData = [...response.data.data];
                        lisData.map((k, i) => {
                            k.key = (parseInt(i) + 1).toString();
                        });
                        setListData(response.data.data);
                        setListSearchData(response.data.data);
                    }
                } else {
                    setListData([]);
                    setListSearchData([]);
                }
                setIsLoading(false);
                setRefreshing(false);
            })
            .catch((e) => {
                setIsButtonLoading(false);
                setIsLoading(false);
                setSnackbarText(e.message);
                setSnackbarColor(theme.colors.error);
                setSnackbarVisible(true);
                setRefreshing(false);
            });
    };

    const onReportTypeSelected = (selectedItem) => {
        setReportTypeName(selectedItem);
        setRTError(false);

        let id = reportTypeFullData.filter((el) => {
            return el.activity_report_type_name === selectedItem;
        })[0].activity_report_type_refno;

        setReportTypeStatus(id);

    };

    const onMonthSelected = (selectedItem) => {
        setMonthName(selectedItem);
        setMError(false);
    };

    const onYearSelected = (selectedItem) => {
        setYearName(selectedItem);
        setYError(false);
    };

    const onExecutiveSelected = (selectedItem) => {
        setExecutiveName(selectedItem);
        setExError(false);
    };

    //update
    const hideDialog = () => setIsDialogVisible(false);

    const RenderItems = (data) => {
        return (
            <View
                style={[
                    Styles.backgroundColor,
                    Styles.flexJustifyCenter,
                    Styles.marginBottom8,
                    Styles.paddingHorizontal16,
                    Styles.flex1,
                ]}
            >
                <View
                    style={[
                        Styles.bordergray,
                        Styles.borderRadius4,
                        Styles.flex1,
                        Styles.padding8,
                    ]}
                >

                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            { height: 20 },
                        ]}
                    >
                        Date Time
                    </Subheading>
                    <Text>{data.item.activity_date_time}</Text>
                    <Divider />
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        Activity Name
                    </Subheading>
                    <Text>{data.item.activity_name}</Text>
                    {data.item.activity_refno == -2 &&
                        <>
                            <View style={[Styles.marginTop8, Styles.borderred, Styles.padding4,
                            Styles.borderRadius4, Styles.backgroundSecondaryLightColor]}>
                                <Subheading
                                    style={[
                                        Styles.fontSize12,
                                        Styles.textSecondaryColor,
                                        Styles.marginTop6,
                                        { height: 20 },
                                    ]}
                                >
                                    From Location
                                </Subheading>
                                <Text>{data.item.logoutdetails.logout_from_location}</Text>
                                <Divider />
                                <Subheading
                                    style={[
                                        Styles.fontSize12,
                                        Styles.textSecondaryColor,
                                        Styles.marginTop6,
                                        { height: 20 },
                                    ]}
                                >
                                    To Location
                                </Subheading>
                                <Text>{data.item.logoutdetails.logout_to_location}</Text>
                                <Divider />
                                <Subheading
                                    style={[
                                        Styles.fontSize12,
                                        Styles.textSecondaryColor,
                                        Styles.marginTop6,
                                        { height: 20 },
                                    ]}
                                >
                                    Total Kilometers
                                </Subheading>
                                <Text>{data.item.logoutdetails.logout_total_kms}</Text>
                            </View>
                        </>
                    }

                    <Divider />
                    {(data.item.activity_refno >= 0) &&
                        <>

                            <Subheading
                                style={[
                                    Styles.fontSize12,
                                    Styles.textSecondaryColor,
                                    Styles.marginTop6,
                                    { height: 20 },
                                ]}
                            >
                                Company / Firm Name
                            </Subheading>
                            <Text>{data.item.company_name}</Text>
                            <Divider />
                            <Subheading
                                style={[
                                    Styles.fontSize12,
                                    Styles.textSecondaryColor,
                                    Styles.marginTop6,
                                    { height: 20 },
                                ]}
                            >
                                Contact Person
                            </Subheading>
                            <Text>{data.item.contact_person}</Text>
                            <Divider />
                            <Subheading
                                style={[
                                    Styles.fontSize12,
                                    Styles.textSecondaryColor,
                                    Styles.marginTop6,
                                    { height: 20 },
                                ]}
                            >
                                Mobile No
                            </Subheading>
                            <Text>{data.item.mobile_no}</Text>
                            <Divider />
                            <Subheading
                                style={[
                                    Styles.fontSize12,
                                    Styles.textSecondaryColor,
                                    Styles.marginTop6,
                                    { height: 20 },
                                ]}
                            >
                                Visit Location
                            </Subheading>
                            <Text>{data.item.visit_location_name}</Text>
                            <Divider />
                        </>

                    }
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        GPRS Location
                    </Subheading>
                    <Text>{data.item.gprs_location_name}</Text>
                    <Divider />
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        GPRS Kilometers
                    </Subheading>
                    <Text>{data.item.kilometer}</Text>
                    <Divider />
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        Status
                    </Subheading>
                    <Text style={[Styles.fontBold]}>{data.item.activity_status_name}</Text>
                    <Divider />

                </View>
            </View>
        );
    };

    const ValidateData = () => {

        let isValid = true;

        if (showExecutiveStatus && executiveName == "") {
            isValid = false;
            setExError(true);
        }

        if (reportTypeStatus == "") {
            isValid = false;
            setSnackbarText("Please select all mandatory fields");
            setSnackbarColor(theme.colors.error);
            setSnackbarVisible(true);
        }
        else if (reportTypeStatus == "2") {
            if (monthName == "") {
                isValid = false;
                setMError(true);
            }

            if (yearName == "") {
                isValid = false;
                setYError(true);
            }
        }

        if (isValid) {
            setIsButtonLoading(true);
            FetchData();
        }
    };

    //#endregion

    return (
        <View style={[Styles.flex1]}>
            <Header title="Daily Activity Report" navigation={navigation} />
            <ScrollView style={[Styles.flex1, Styles.backgroundColor]} keyboardShouldPersistTaps="handled">
                <View style={[
                    Styles.padding16,
                    Styles.backgroundColorFullWhite,
                ]}>
                    {showExecutiveStatus && <>
                        <Dropdown label="Executive Name" data={executiveData} isError={errorEx}
                            selectedItem={executiveName} reference={activityDDRef} onSelected={onExecutiveSelected} />
                        <HelperText type="error" visible={errorEx}>
                            Please select executive
                        </HelperText>
                    </>}

                    <Dropdown label="Report Type" data={reportTypeData} isError={errorRT}
                        selectedItem={reportTypeName} reference={activityDDRef} onSelected={onReportTypeSelected} />
                    <HelperText type="error" visible={errorRT}>
                        Please select report type
                    </HelperText>

                    {reportTypeStatus == "1" &&
                        <>
                            <View>
                                <DateTimePicker
                                    style={Styles.backgroundColorWhite}
                                    label="From Date"
                                    type="date"
                                    value={fromDt}
                                    onChangeDate={setFromDt}
                                />
                                <HelperText type="error" visible={fromDtErr}>
                                    Please select from date
                                </HelperText>
                            </View>
                            <View>
                                <DateTimePicker
                                    style={Styles.backgroundColorWhite}
                                    label="To Date"
                                    type="date"
                                    value={toDt}
                                    onChangeDate={setToDt}
                                />
                                <HelperText type="error" visible={toDtErr}>
                                    Please select to date
                                </HelperText>
                            </View>
                        </>}

                    {reportTypeStatus == "2" &&
                        <>
                            <View style={[Styles.marginTop16]}>
                                <Dropdown label="Month" data={monthData} isError={errorM}
                                    selectedItem={monthName} reference={activityDDRef} onSelected={onMonthSelected} />
                                <HelperText type="error" visible={errorM}>
                                    Please select month
                                </HelperText>
                            </View>
                            <View style={[Styles.marginTop16]}>
                                <Dropdown label="Year" data={yearData} isError={errorY}
                                    selectedItem={yearName} reference={activityDDRef} onSelected={onYearSelected} />
                                <HelperText type="error" visible={errorY}>
                                    Please select year
                                </HelperText>
                            </View>
                        </>
                    }


                    <View style={[Styles.marginTop16]}>
                        <ButtonComponent mode="contained" onPress={ValidateData} text="GET ACTIVITY" isButtonLoading={isButtonLoading} />
                    </View>
                </View>
                {isLoading ? (
                    <View
                        style={[
                            Styles.flex1,
                            Styles.flexJustifyCenter,
                            Styles.flexAlignCenter,
                        ]}
                    >
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : listData?.length > 0 ? (
                    <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
                        <Search
                            query={route?.params ? route?.params?.role : ""}
                            data={listData}
                            setData={setListSearchData}
                            filterFunction={[
                                "activity_date_time",
                                "activity_name",
                                "company_name",
                                "contact_person",
                                "mobile_no",
                                "visit_location_name",
                                "activity_status_name",
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
                                renderItem={(data) => RenderItems(data)}
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
            </ScrollView>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: snackbarColor }}
            >
                {snackbarText}
            </Snackbar>

        </View>
    );
};

export default DailyActivityReport;
