import { View, Text, ActivityIndicator, RefreshControl, Image, ScrollView } from "react-native";
import React from "react";
import LabelInput from "../../Marketing/EmployeeActivity/common/LabelInput";
import HDivider from "../../Marketing/EmployeeActivity/common/HDivider";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import DisplayButton from "../../Marketing/EmployeeActivity/common/DisplayButton";
import { TextInput, Title, List, HelperText, Subheading, Divider, Button, Snackbar, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useState, useRef } from "react";
import Provider from "../../../api/Provider";
import RBSheet from "react-native-raw-bottom-sheet";
import Dropdown from "../../../components/Dropdown";
import DFButton from "../../../components/Button";
import Header from "../../../components/Header";
import Search from "../../../components/Search";
import { Calendar, Agenda } from 'react-native-calendars';
import { SwipeListView } from "react-native-swipe-list-view";
import NoItems from "../../../components/NoItems";
import {
    projectFixedDesignations,

} from "../../../utils/credentials";
import ButtonComponent from "../../../components/Button";


let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_group_refno = 0;
let designID = 0;

const AdminAttendanceReport = ({ navigation }) => {
    const refRBSheet = useRef();

    const isFocused = useIsFocused();

    const [contactName, setContactName] = React.useState("");
    const [contactNo, setContactNo] = React.useState("");
    const [designation, setDesignation] = React.useState("");
    const [calenderData, setCalenderData] = React.useState("");
    const [currentMonth, setCurrentMonth] = React.useState("");

    const [monthFullData, setMonthFullData] = React.useState([]);
    const [monthData, setMonthData] = React.useState([]);
    const [monthName, setMonthName] = React.useState("");
    const [errorM, setMError] = React.useState(false);

    const [yearFullData, setYearFullData] = React.useState([]);
    const [yearData, setYearData] = React.useState([]);
    const [yearName, setYearName] = React.useState("");
    const [errorY, setYError] = React.useState(false);

    const [branchFullData, setBranchFullData] = React.useState([]);
    const [branchData, setBranchData] = React.useState([]);
    const [branchName, setBranchName] = React.useState("");

    const [designationFullData, setDesignationFullData] = React.useState([]);
    const [designationData, setDesignationData] = React.useState([]);
    const [designationName, setDesignationName] = React.useState("");

    const [employeeFullData, setEmployeeFullData] = React.useState([]);
    const [employeeData, setEmployeeData] = React.useState([]);
    const [employeeName, setEmployeeName] = React.useState("");

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");
    const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

    const [searchFullData, setSearchFullData] = React.useState([]);

    const [listData, setListData] = useState([]);
    const [listSearchData, setListSearchData] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [items, setItems] = useState({
        '2024-01-20': [{ name: 'Meeting at 10 AM' }],
        '2024-01-21': [{ name: 'Lunch with Client' }, { name: 'Project Review' }],
        // Add more items for different dates as needed
    });

    const activityDDRef = useRef({});

    const fetchUser = async () => {
        const data = JSON.parse(await AsyncStorage.getItem("user"));
        Sess_UserRefno = data.UserID;
        Sess_company_refno = data.Sess_company_refno;
        Sess_branch_refno = data.Sess_branch_refno;
        Sess_group_refno = data.Sess_group_refno;
        designID = data.Sess_designation_refno;

        FetchMonth();
        FetchYear();
        FetchBranch();
        FetchDesignation();
        FetchEmployee();
    };
    const fetchData = () => {

        let branch_data = branchFullData.find((el) => el.branch_name === branchName);
        let designation_data = designationFullData.find((el) => el.designation_name === designationName);
        let emp_data = employeeFullData.find((el) => el.employee_display_name === employeeName);
        let branch_refno = 0, designation_refno = 0;
        let emp_refno = "all";
        console.log('***emp data:', emp_data, "***********************");
        if (branch_data != undefined) {
            branch_refno = branch_data.branch_refno;
        }

        if (designation_data != undefined) {
            designation_refno = designation_data.designation_refno;
        }
        console.log('step 0');
        if (emp_data != undefined) {
            console.log('step 1');
            emp_refno = emp_data.employee_user_refno;
        }

        let month = monthFullData.find((el) => el.month_name === monthName).month_refno;
        let year = yearFullData.find((el) => el.year_name === yearName).year_refno;

        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
                Sess_company_refno: Sess_company_refno,
                Sess_branch_refno: Sess_branch_refno,
                branch_refno: branch_refno,
                designation_refno: designation_refno,
                employee_user_refno: emp_refno,
                month_refno: month,
                year_refno: year,

            }
        };
        console.log('params:**********', params, "*======================*");
        Provider.createDFCommon(Provider.API_URLS.searchresult_branchwise_attendancereport, params)
            .then((response) => {
                console.log('search resp===========:', response.data.data, "=======================");
                setIsButtonLoading(false);
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {

                        setSearchFullData(response.data.data);
                        let lisData = [];

                        if (emp_refno == "all") {
                            console.log('step 1');
                            lisData = [...response.data.data[0].employee_data];
                        }
                        else {
                            console.log('step 2');
                            lisData = [...response.data.data];
                        }

                        console.log('step 3');
                        lisData.map((k, i) => {
                            k.key = (parseInt(i) + 1).toString();
                        });
                        setListData(lisData);
                        setListSearchData(lisData);

                    }
                    else {
                        setListData([]);
                    }
                }
                else {
                    setListData([]);
                }

                setIsLoading(false);
                setRefreshing(false);

                // if (response.data.data != null) {
                //     setIsButtonLoading(false);
                // }
                // else {

                //     setIsButtonLoading(false);
                //     setSnackbarText("No Data Found");
                //     setSnackbarColor(theme.colors.error);
                //     setSnackbarVisible(true);
                // }

            });
    };

    const FetchMonth = () => {

        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.getmonth_branchwise_attendancereport,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setMonthFullData(response.data.data);
                        const month = response.data.data.map(
                            (data) => data.month_name
                        );

                        setMonthData(month);
                        const today = new Date();
                        const currentMonth = today.getMonth() + 1;
                        const curr_month = response.data.data.find((el) => {
                            return el.month_refno == currentMonth;
                        }).month_name;

                        setMonthName(curr_month);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchYear = () => {
        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.getyear_branchwise_attendancereport,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setYearFullData(response.data.data);
                        const year = response.data.data.map(
                            (data) => data.year_name
                        );
                        setYearData(year);
                        const today = new Date();
                        const currentYear = today.getFullYear();
                        const curr_year = response.data.data.find((el) => {
                            return el.year_refno == currentYear;
                        }).year_name;

                        setYearName(curr_year);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchBranch = () => {
        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
                Sess_company_refno: Sess_company_refno,
                Sess_branch_refno: Sess_branch_refno,
                Sess_designation_refno: designID,
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.getbranchname_branchwise_attendancereport,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        if (response.data.data.length > 1) {
                            const newValue = {
                                branch_name: "ALL",
                                branch_refno: "0"
                            };
                            response.data.data.unshift(newValue);
                        }

                        setBranchFullData(response.data.data);
                        const branch = response.data.data.map(
                            (data) => data.branch_name
                        );
                        setBranchData(branch);

                        const Branch = response.data.data.find((el, idx) => {
                            return idx == "0";
                        });

                        setBranchName(Branch.branch_name);

                        if (response.data.data.length == 1) {

                            FetchEmployee(Branch.branch_refno, "0");
                        }
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchDesignation = () => {
        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
                Sess_company_refno: Sess_company_refno
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.getdesignationname_branchwise_attendancereport,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {

                        const newValue = {
                            designation_name: "ALL",
                            designation_refno: "0"
                        };
                        response.data.data.unshift(newValue);
                        setDesignationFullData(response.data.data);
                        const designation = response.data.data.map(
                            (data) => data.designation_name
                        );
                        setDesignationData(designation);
                        const selectedDesignation = response.data.data.find((el) => {
                            return el.designation_refno == "0";
                        }).designation_name;

                        setDesignationName(selectedDesignation);
                    }
                }
            })
            .catch((e) => { });
    };

    const FetchEmployee = (branch_refno, designation_refno) => {
        let params = {
            data: {
                Sess_UserRefno: Sess_UserRefno,
                Sess_company_refno: Sess_company_refno,
                branch_refno: branch_refno,
                designation_refno: designation_refno,
            },
        };
        Provider.createDFCommon(
            Provider.API_URLS.getemployeenamelist_branchwise_attendancereport,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        const newValue = {
                            "employee_user_refno": "all",
                            "employee_name": "ALL",
                            "common_employee_code": "",
                            "employee_mobile_no": "",
                            "employee_display_name": "ALL"
                        };
                        response.data.data.unshift(newValue);
                        let exData = [];
                        response.data.data.map((data) => {
                            exData.push({
                                employee_user_refno: data.employee_user_refno,
                                employee_name: data.employee_name,
                                common_employee_code: data.common_employee_code,
                                employee_mobile_no: data.employee_mobile_no,
                                employee_display_name: data.employee_user_refno == "all" ? data.employee_display_name : `${data.employee_name} / ${data.common_employee_code}`,
                            });
                        });
                        setEmployeeFullData(exData);
                        const executive = exData.map(
                            (data) => data.employee_display_name
                        );
                        setEmployeeData(executive);

                        const selectedEmployee = response.data.data.find((el) => {
                            return el.employee_user_refno == "all";
                        }).employee_display_name;

                        setEmployeeName(selectedEmployee);
                    }
                    else {
                        const empData = [
                            {
                                "employee_user_refno": "all",
                                "employee_name": "ALL",
                                "common_employee_code": "",
                                "employee_mobile_no": "",
                                "employee_display_name": "ALL"
                            }
                        ]

                        setEmployeeFullData(empData);
                        const emp = empData.map(
                            (data) => data.employee_display_name
                        );
                        setEmployeeData(emp);

                        setEmployeeName("ALL");
                    }
                }
                else {
                    const empData = [
                        {
                            "employee_user_refno": "all",
                            "employee_name": "ALL",
                            "common_employee_code": "",
                            "employee_mobile_no": "",
                            "employee_display_name": "ALL"
                        }
                    ]

                    setEmployeeFullData(empData);
                    const emp = empData.map(
                        (data) => data.employee_display_name
                    );
                    setEmployeeData(emp);
                    setEmployeeName("ALL");
                }
            })
            .catch((e) => { });
    };

    const onMonthSelected = (selectedItem) => {
        setMonthName(selectedItem);
        setMError(false);
    };

    const onYearSelected = (selectedItem) => {
        setYearName(selectedItem);
        setYError(false);
    };

    const onBranchSelected = (selectedItem) => {
        setBranchName(selectedItem);
        let branch_data = branchFullData.find((el) => el.branch_name === selectedItem);
        let designation_data = designationFullData.find((el) => el.designation_name === designationName);
        let branch_refno = 0, designation_refno = 0;

        if (branch_data != undefined) {
            branch_refno = branch_data.branch_refno;
        }

        if (designation_data != undefined) {
            designation_refno = designation_data.designation_refno;
        }

        FetchEmployee(branch_refno, designation_refno);
    };

    const onDesignationSelected = (selectedItem) => {
        setDesignationName(selectedItem);

        let branch_data = branchFullData.find((el) => el.branch_name === branchName);
        let designation_data = designationFullData.find((el) => el.designation_name === selectedItem);
        let branch_refno = 0, designation_refno = 0;

        if (branch_data != undefined) {
            branch_refno = branch_data.branch_refno;
        }

        if (designation_data != undefined) {
            designation_refno = designation_data.designation_refno;
        }

        FetchEmployee(branch_refno, designation_refno);
    };

    const onEmployeeSelected = (selectedItem) => {
        setEmployeeName(selectedItem);
    };

    const ValidateData = () => {

        let isValid = true;

        // if (showExecutiveStatus && executiveName == "") {
        //     isValid = false;
        //     setExError(true);
        // }

        // if (monthName == "") {
        //     isValid = false;
        //     setMError(true);
        // }

        // if (yearName == "") {
        //     isValid = false;
        //     setYError(true);
        // }

        if (isValid) {
            setIsButtonLoading(true);
            fetchData();
        }
    };

    const openSheet = (data) => {
        let month = monthFullData.find((el) => el.month_name === monthName).month_refno;
        let year = yearFullData.find((el) => el.year_name === yearName).year_refno;

        var modifiedAttendanceData = {};

        for (var day in data.attendance_data) {
            if (data.attendance_data.hasOwnProperty(day)) {
                // Convert the day to a two-digit string with leading zeros
                var dayWithLeadingZeros = day.padStart(2, "0");

                // Create the formatted date with year, month, and day
                var formattedDate = year + "-" + month.toString().padStart(2, "0") + "-" + dayWithLeadingZeros;
                // Add the value to the new object with the formatted date as the key
                modifiedAttendanceData[formattedDate] = isNaN(data.attendance_data[day]) ? { selected: false } : data.attendance_data[day] == null ? { selected: false } : { selected: true };
            }
        }

        setCalenderData(modifiedAttendanceData);
        var selectedMonthDate = year + "-" + month.toString().padStart(2, "0") + "-01";
        setCurrentMonth(new Date(selectedMonthDate));
        setContactName(data.employee_name);
        setContactNo(data.employee_mobile_no);
        setDesignation(data.designation_name);

        refRBSheet.current.open();
    };

    const RenderItems = (data) => {
        return (
            <View
                style={[
                    Styles.backgroundColor,
                    Styles.paddingHorizontal16,
                    Styles.flexJustifyCenter,
                    Styles.flex1,
                    Styles.marginBottom12,
                ]}
            >
                <View
                    style={[
                        {
                            backgroundColor: "#eee",
                            borderRadius: 8,
                            elevation: 5,
                        },
                        Styles.paddingHorizontal8,
                        Styles.paddingVertical12,
                        Styles.flexRow,
                    ]}
                >
                    <View style={[Styles.flex1]}>
                        <View style={[Styles.flex1, Styles.flexRow,]}>
                            <View style={[Styles.flexColumn, Styles.flex1]}>
                                <View style={[Styles.flex1, Styles.flexRow,]}>
                                    <View style={[Styles.flex1]}>
                                        {data.item.profile_photo_url != "" ? (
                                            <Image source={{ uri: data.item.profile_photo_url }} style={[Styles.flex1, { width: 48, height: 48 }]} resizeMode="cover" />
                                        ) : (
                                            <Image source={require("../../../../assets/defaultIcon.png")} style={[Styles.flex1, { width: 48, height: 48 }]} resizeMode="cover" />
                                        )}
                                    </View>
                                    <View style={[Styles.flexColumn, Styles.flex2_5]}>
                                        <Text style={[Styles.fontSize12]}>{data.item.employee_name}</Text>
                                        <Text style={[Styles.fontSize10, Styles.blueFontColor]}>{data.item.common_employee_code}</Text>
                                        <View
                                            style={[
                                                Styles.width100per,
                                                Styles.marginVertical4,
                                                { backgroundColor: "#d3d3d3", height: 1 },
                                            ]}
                                        ></View>
                                        <Text style={[Styles.fontSize10]}>{data.item.designation_name}</Text>

                                    </View>
                                    <View style={[Styles.flex1]}>
                                        <IconButton
                                            icon="calendar-month-outline"
                                            iconColor={theme.colors.primary}
                                            size={34}
                                            onPress={() => {

                                                let month = monthFullData.find((el) => el.month_name === monthName).month_refno;
                                                let year = yearFullData.find((el) => el.year_name === yearName).year_refno;

                                                //openSheet(data.item)
                                                //console.log('data:', data.item);
                                                navigation.navigate("SingleEmployeeReport", {
                                                    type: "status",
                                                    headerTitle: data.item.employee_name,
                                                    employeeID: data.item.employee_user_refno,
                                                    year: year,
                                                    month: month,
                                                });


                                            }

                                            }
                                        />
                                    </View>
                                </View>
                                <View style={[Styles.flex1, Styles.flexRow, Styles.flexSpaceAround]}>
                                    <View style={[Styles.flex1]}>
                                        <Text style={[Styles.fontSize12, Styles.fontBold, Styles.marginTop8, Styles.primaryColor]}>Present Days: {data.item.total_present_days}</Text>
                                    </View>
                                    <View style={[Styles.flex1]}>
                                        <Text style={[Styles.fontSize12, Styles.fontBold, Styles.marginTop8, Styles.primaryColor, Styles.textRight]}>Net Salary: {data.item.net_salary_status}</Text>
                                    </View>

                                </View>
                            </View>

                        </View>

                    </View>

                </View>
            </View>
        );
    };

    useEffect(() => {
        if (isFocused) fetchUser();
    }, [isFocused]);

    return (
        <View style={[Styles.flex1]}>
            <Header navigation={navigation} title="BRANCH- ATTENDANCE REPORT" />
            <View style={[Styles.flex1, { backgroundColor: "#fff" }, Styles.padding16]}>

                <ScrollView keyboardShouldPersistTaps="handled">

                    <View style={[Styles.marginTop4]}>
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

                    <View style={[Styles.marginTop16]}>
                        <Dropdown label="Branch Name" data={branchData}
                            selectedItem={branchName} reference={activityDDRef} onSelected={onBranchSelected} />
                    </View>

                    <View style={[Styles.marginTop16]}>
                        <Dropdown label="Designation Name" data={designationData}
                            selectedItem={designationName} reference={activityDDRef} onSelected={onDesignationSelected} />
                    </View>

                    <View style={[Styles.marginTop16]}>
                        <Dropdown label="Employee" data={employeeData}
                            selectedItem={employeeName} reference={activityDDRef} onSelected={onEmployeeSelected} />
                    </View>

                    <View style={[Styles.marginTop16]}>
                        <ButtonComponent mode="contained" onPress={ValidateData} text="Search" isButtonLoading={isButtonLoading} />
                    </View>
                    <View style={[Styles.paddingVertical8]}>
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
                        ) : listData.length > 0 ? (
                            <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
                                <Search
                                    data={listData}
                                    setData={setListSearchData}
                                    filterFunction={[
                                        "employee_name",
                                        "common_employee_code",
                                        "employee_mobile_no",
                                        "designation_name",
                                        "total_present_days",
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
                                                    fetchData();
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
                            <NoItems
                                icon="format-list-bulleted"
                                text="No records found."
                            />
                        )}
                    </View>

                </ScrollView>
                <RBSheet ref={refRBSheet} closeOnDragDown={true} closeOnPressMask={true} dragFromTopOnly={true}
                    height={580} animationType="fade"
                    customStyles={{ wrapper: { backgroundColor: "rgba(0,0,0,0.5)" }, draggableIcon: { backgroundColor: "#000" } }}>
                    <View>
                        <Title style={[Styles.paddingHorizontal16]}>{contactName}</Title>
                        <ScrollView style={{ marginBottom: 64 }}>

                            <Calendar
                                current={currentMonth}
                                disableMonthChange={true}
                                disableArrowLeft={true}
                                disableArrowRight={true}
                                markingType={''}
                                markedDates={calenderData}
                                theme={{
                                    selectedDayBackgroundColor: '#00adf5',
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: '#00adf5',
                                    dayTextColor: '#2d4150',
                                }}
                            />

                        </ScrollView>
                    </View>
                </RBSheet>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{ backgroundColor: snackbarColor }}
                >
                    {snackbarText}
                </Snackbar>
            </View>
        </View>

    );
};

export default AdminAttendanceReport;
