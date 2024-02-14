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
import ButtonComponent from "../../../components/Button";

LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
]);
let userID = 0, compID = 0, branchID = 0, designID = 0, Sess_group_refno_extra_1 = 0;

const UserActivityScreen = ({ navigation, route }) => {
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

    const [executiveFullData, setExecutiveFullData] = React.useState([]);
    const [executiveData, setExecutiveData] = React.useState([]);
    const [executiveName, setExecutiveName] = React.useState("");
    const [errorEx, setExError] = React.useState(false);
    const [fromDtErr, setFromDtErr] = React.useState(false);
    const activityDDRef = useRef({});

    const [fromDt, setFromDt] = useState(new Date());
    const [toDt, setToDt] = useState(new Date());

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
            Sess_group_refno_extra_1 = JSON.parse(userData).Sess_group_refno_extra_1;
            FetchExecutive();
        }
    };

    const FetchExecutive = () => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: compID,
                Sess_branch_refno: branchID,
                Sess_designation_refno: designID,
                Sess_group_refno_extra_1: Sess_group_refno_extra_1,
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
                Sess_UserRefno: executiveFullData.find((el) => el.displayName === executiveName)
                    .employee_user_refno,
                Sess_company_refno: compID,
                from_date: moment(fromDt).format("DD-MM-YYYY"),
                to_date: moment(toDt).format("DD-MM-YYYY")
            },
        };
        Provider.createDFEmployee(Provider.API_URLS.employee_gprs_markactivity_list, params)
            .then((response) => {
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
                        Activity Name
                    </Subheading>
                    <Text>{data.item.activity_name}</Text>
                    <Divider />
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        Activity Date Time
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
                        Location
                    </Subheading>
                    <Text>{data.item.location_name}</Text>
                    <Divider />

                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        Kilometers
                    </Subheading>
                    <Text>{data.item.kilometer == "" ? "0" : data.item.kilometer}</Text>
                    <Divider />
                    <Subheading
                        style={[
                            Styles.fontSize12,
                            Styles.textSecondaryColor,
                            Styles.marginTop6,
                            { height: 20 },
                        ]}
                    >
                        Remarks
                    </Subheading>
                    <Text>{data.item.activity_remarks}</Text>
                    <Divider />

                </View>
            </View>
        );
    };

    const ValidateData = () => {
        let isValid = true;
        if (executiveName.length === 0) {
            setExError(true);
            isValid = false;
        }
        if (isValid) {
            setIsButtonLoading(true);
            FetchData();
        }
    };

    //#endregion

    return (
        <View style={[Styles.flex1]}>
            <Header navigation={navigation} title="USER ACTIVITY" />
            <ScrollView style={[Styles.flex1, Styles.backgroundColor]} keyboardShouldPersistTaps="handled">
                <View style={[
                    Styles.padding16,
                    Styles.backgroundColorFullWhite,
                ]}>
                    <Dropdown label="Executive Name" data={executiveData} isError={errorEx}
                        selectedItem={executiveName} reference={activityDDRef} onSelected={onExecutiveSelected} />
                    <HelperText type="error" visible={errorEx}>
                        Please select executive
                    </HelperText>
                    <View>
                        <DateTimePicker
                            style={Styles.backgroundColorWhite}
                            label="Activity From Date"
                            type="date"
                            value={fromDt}
                            onChangeDate={setFromDt}
                        />
                    </View>
                    <HelperText type="error" visible={fromDtErr}>
                        Please select from date
                    </HelperText>
                    <View>
                        <DateTimePicker
                            style={Styles.backgroundColorWhite}
                            label="Activity Till Date"
                            type="date"
                            value={toDt}
                            onChangeDate={setToDt}
                        />
                    </View>
                    <View style={[Styles.marginTop16]}>
                        <ButtonComponent mode="contained" onPress={ValidateData} text="GET ACTIVITY" loader={isButtonLoading} />
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
                                "activity_remarks",
                                "kilometer",
                                "location_name",
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

export default UserActivityScreen;
