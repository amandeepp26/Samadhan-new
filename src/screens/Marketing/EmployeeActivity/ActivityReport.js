import { View, Text, ScrollView } from "react-native";
import React from "react";
import LabelInput from "./common/LabelInput";
import HDivider from "./common/HDivider";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import DisplayButton from "./common/DisplayButton";
import { TextInput, Title, List, HelperText, Subheading, Divider, Button, Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useState, useRef } from "react";
import Provider from "../../../api/Provider";
import RBSheet from "react-native-raw-bottom-sheet";
import Dropdown from "../../../components/Dropdown";
import DFButton from "../../../components/Button";
import {
  projectFixedDesignations,

} from "../../../utils/credentials";
import Header from "../../../components/Header";
import ButtonComponent from "../../../components/Button";

const ActivityCard = ({
  name,
  date,
  supportPerson,
  companyName,
  expensesAmount,
  salesAmount,
  receivedAmount,
  navigation,
  OpenRBSheet,
}) => (
  <View
    style={[
      {
        backgroundColor: "#eee",
        borderRadius: 8,
      },
      Styles.padding16,
      Styles.marginVertical8,
    ]}
  >
    <LabelInput label="Activity Name" value={name} lg />
    <HDivider />
    <LabelInput label="Company Name" value={companyName} />
    <HDivider />
    <LabelInput label="Date" value={date} />
    <HDivider />
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        // textAlignVertical: "top",
      }}
    >
      <LabelInput label="Expenses Amount" value={expensesAmount} />
      <LabelInput label="Sales Amount" value={salesAmount} />

    </View>
    <HDivider />
    <LabelInput label="Received Amount" value={receivedAmount} />
    <HDivider />

    <LabelInput label="Support Person" value={supportPerson} />
    <HDivider />

    <DisplayButton
      text="View More Details"
      width="100%"
      isGreen
      onPress={OpenRBSheet}
    />
  </View>
);
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_group_refno = 0;
let designID = 0;
let Sess_group_refno_extra_1 = 0;
const ActivityReport = ({ navigation }) => {
  const refRBSheet = useRef();
  const EmployeeDetailsRBSheet = useRef();

  const isFocused = useIsFocused();
  const [tableValues, setTableValues] = useState([
    { label: "Expenses Amount", value: 0 },
    { label: "Sales Amount", value: 0 },
    { label: "Received Amount", value: 0 },
  ]);

  const [targetOfSalesAmount, setTargetOfSalesAmount] = useState("0");
  const [data, setData] = useState([]);

  const [logoutFromLocation, setLogoutFromLocation] = React.useState("");
  const [logoutToLocation, setLogoutToLocation] = React.useState("");
  const [logoutKilometers, setLogoutKilometers] = React.useState("");

  const [empName, setEmpName] = React.useState("");
  const [empCode, setEmpCode] = React.useState("");
  const [mobileNo, setMobileNo] = React.useState("");
  const [targetSales, setTargetSales] = React.useState("");
  const [achievementSales, setAchievementSales] = React.useState("");
  const [achievementReceived, setAchievementReceived] = React.useState("");

  const [activityType, setActivityType] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [contactNo, setContactNo] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [monthFullData, setMonthFullData] = React.useState([]);
  const [monthData, setMonthData] = React.useState([]);
  const [monthName, setMonthName] = React.useState("");
  const [errorM, setMError] = React.useState(false);

  const [yearFullData, setYearFullData] = React.useState([]);
  const [yearData, setYearData] = React.useState([]);
  const [yearName, setYearName] = React.useState("");
  const [errorY, setYError] = React.useState(false);

  const [executiveFullData, setExecutiveFullData] = React.useState([]);
  const [executiveData, setExecutiveData] = React.useState([]);
  const [executiveName, setExecutiveName] = React.useState("");
  const [errorEx, setExError] = React.useState(false);

  const [showExecutiveStatus, setShowExecutiveStatus] = React.useState(false);

  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const activityDDRef = useRef({});

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = data.UserID;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    Sess_group_refno = data.Sess_group_refno;
    designID = data.Sess_designation_refno;
    Sess_group_refno_extra_1 = data.Sess_group_refno_extra_1;

    if (designID == projectFixedDesignations.DEF_COMPANYADMIN_DESIGNATION_REFNO ||
      designID == projectFixedDesignations.DEF_BRANCHADMIN_DESIGNATION_REFNO) {
      setShowExecutiveStatus(true);
      FetchExecutive();
    }

    FetchMonthYear();
  };
  const fetchData = () => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_group_refno: Sess_group_refno,
        month_refno: monthFullData.find((el) => el.month_name === monthName)
          .month_refno,
        year_refno: yearFullData.find((el) => el.year_name === yearName)
          .year_refno,
        post_employee_user_refno: showExecutiveStatus ? executiveFullData.find((el) => el.displayName === executiveName)
          .employee_user_refno : Sess_UserRefno
      }
    };
    Provider.createDFEmployee(Provider.API_URLS.employee_overall_activity_report_viewbyadmin, params).then((res) => {
      if (res.data.otherdata != null && res.data.otherdata != []) {
        setEmpName(res.data?.otherdata?.employee_data.employee_name);
        setEmpCode(res.data?.otherdata?.employee_data.common_employee_code);
        setMobileNo(res.data?.otherdata?.employee_data.employee_mobile_no);
        setTargetSales(res.data?.otherdata?.employee_sales_target_data.target_of_sales_amount);
        setAchievementSales(res.data?.otherdata?.employee_sales_target_data.achievement_sales_amount_perc);
        setAchievementReceived(res.data?.otherdata?.employee_sales_target_data.achievement_received_amount_perc);
        setTargetOfSalesAmount(res.data?.otherdata?.employee_sales_target_data.target_of_sales_amount == undefined ? "0" : res.data?.otherdata?.employee_sales_target_data.target_of_sales_amount);
      }
      else {
        setEmpName("");
        setEmpCode("");
        setMobileNo("");
        setTargetSales("");
        setAchievementSales("");
        setAchievementReceived("");
        setTargetOfSalesAmount("0");
      }

      if (res.data.data != null) {
        setIsButtonLoading(false);
        setData(res.data.data);
        setTableValues([
          {
            label: "Expenses Amount",
            value: res.data.data.reduce((a, b) => {
              if (!isNaN(b.expenses_amount)) {
                return a + Number(b.expenses_amount);
              }
              return a;
            }, 0),
          },
          {
            label: "Sales Amount",
            value: res.data.data.reduce((a, b) => {
              if (!isNaN(b.sales_amount)) {
                return a + Number(b.sales_amount);
              }
              return a;
            }, 0),
          },
          {
            label: "Received Amount",
            value: res.data.data.reduce((a, b) => {
              if (!isNaN(b.received_amount)) {
                return a + Number(b.received_amount);
              }
              return a;
            }, 0),
          },
        ]);
      }
      else {
        setData([]);
        setTableValues([
          { label: "Expenses Amount", value: 0 },
          { label: "Sales Amount", value: 0 },
          { label: "Received Amount", value: 0 },
        ]);

        setIsButtonLoading(false);
        setSnackbarText("No Data Found");
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);

      }

    });
  };

  const FetchMonthYear = () => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_group_refno: Sess_group_refno,
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
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
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

  const ValidateData = () => {

    let isValid = true;

    if (showExecutiveStatus && executiveName == "") {
      isValid = false;
      setExError(true);
    }

    if (monthName == "") {
      isValid = false;
      setMError(true);
    }

    if (yearName == "") {
      isValid = false;
      setYError(true);
    }

    if (isValid) {
      setIsButtonLoading(true);
      fetchData();
    }
  };

  const openSheet = (data) => {
    refRBSheet.current.open();
    setContactName(data.activity_details["Contact Name"]);
    setContactNo(data.activity_details["Contact No"]);
    setLocation(data.activity_details["Location"]);
    setStatus(data.activity_details["Status"]);
    setNotes(data.notes);

    setActivityType(data.activity_refno);
    setLogoutFromLocation(data.activity_details["From Location"]);
    setLogoutToLocation(data.activity_details["To Location"]);
    setLogoutKilometers(data.activity_details["Total KMS"]);
  };

  useEffect(() => {
    if (isFocused) fetchUser();
  }, [isFocused]);

  return (
    <View style={[Styles.flex1, { backgroundColor: "#fff" }, Styles.padding16]}>
      <Header title='Activity Report' navigation={navigation} />
      <ScrollView keyboardShouldPersistTaps="handled">
        {showExecutiveStatus && <>
          <View style={[Styles.marginTop4]}>
            <Dropdown label="Executive Name" data={executiveData} isError={errorEx}
              selectedItem={executiveName} reference={activityDDRef} onSelected={onExecutiveSelected} />
            <HelperText type="error" visible={errorEx}>
              Please select executive
            </HelperText>
          </View>
        </>}
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
          <ButtonComponent mode="contained" onPress={ValidateData} text="GET ACTIVITY" isButtonLoading={isButtonLoading} />
        </View>
        <View style={[Styles.paddingVertical8]}>
          <View
            style={{
              alignSelf: "center",
              flexDirection: "row",
              justifyContent: "space-around",
            }}

          >
            <Text
              style={[
                Styles.width50per,
                Styles.paddingVertical8,
                Styles.margin2,
                Styles.textCenter,
                {
                  backgroundColor: "#a9a9a9",
                },
              ]}
            >
              Target of Sales Amount
            </Text>
            <Text
              style={[
                Styles.width50per,
                Styles.paddingVertical8,
                Styles.margin2,
                Styles.textCenter,
                { backgroundColor: "#eee", marginLeft: "2%" },
              ]}
            >
              {targetOfSalesAmount}
            </Text>
          </View>
          {tableValues.map((t, i) => (
            <View
              style={{
                alignSelf: "center",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
              key={i}
            >
              <Text
                style={[
                  Styles.width50per,
                  Styles.paddingVertical8,
                  Styles.margin2,
                  Styles.textCenter,
                  {
                    backgroundColor: "#a9a9a9",
                  },
                ]}
              >
                {t.label}
              </Text>
              <Text
                style={[
                  Styles.width50per,
                  Styles.paddingVertical8,
                  Styles.margin2,
                  Styles.textCenter,
                  { backgroundColor: "#eee", marginLeft: "2%" },
                ]}
              >
                {t.value}
              </Text>
            </View>
          ))}
        </View>
        <View style={[Styles.marginVertical8, Styles.flexSpaceBetween, Styles.flexAlignCenter, Styles.flexRow]}>
          <View >
            <Text onPress={() => {
              EmployeeDetailsRBSheet.current.open();
            }} style={[Styles.fontSize14, Styles.fontBold, Styles.primaryLightColor, { textDecorationLine: "underline" }]} >Employee Details & Target</Text>
          </View>
        </View>

        <View style={[Styles.flex1, { background: "#fff" }]}>
          {data != null && data.map((com, i) => (
            <ActivityCard
              key={i}
              name={com.activity_name}
              date={com.activity_date}
              supportPerson={com.activity_details["Contact Name"]}
              companyName={com.activity_details["Company Name"]}
              expensesAmount={com.expenses_amount}
              salesAmount={com.sales_amount}
              receivedAmount={com.received_amount}
              navigation={navigation}
              OpenRBSheet={() => {
                openSheet(com)
              }}
            />
          ))}
        </View>
      </ScrollView>
      <RBSheet ref={refRBSheet} closeOnDragDown={true} closeOnPressMask={true} dragFromTopOnly={true}
        height={380} animationType="fade"
        customStyles={{ wrapper: { backgroundColor: "rgba(0,0,0,0.5)" }, draggableIcon: { backgroundColor: "#000" } }}>
        <View>
          <Title style={[Styles.paddingHorizontal16]}>{contactName}</Title>
          <ScrollView style={{ marginBottom: 64 }}>
            <List.Item title="contact No" description={contactNo} />
            <List.Item title="Location" description={location} />
            <List.Item title="Status" description={status} />
            <List.Item title="Notes" description={notes} />

            {activityType == -2 &&
              <>
                <View style={[Styles.marginHorizontal16, Styles.marginBottom8, Styles.marginTop8, Styles.borderred, Styles.padding4,
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
                  <Text>{logoutFromLocation}</Text>
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
                  <Text>{logoutToLocation}</Text>
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
                  <Text>{logoutKilometers}</Text>
                </View>
              </>}
          </ScrollView>
        </View>
      </RBSheet>

      <RBSheet ref={EmployeeDetailsRBSheet} closeOnDragDown={true} closeOnPressMask={true} dragFromTopOnly={true}
        height={480} animationType="fade"
        customStyles={{ wrapper: { backgroundColor: "rgba(0,0,0,0.5)" }, draggableIcon: { backgroundColor: "#000" } }}>

        <ScrollView style={{ marginBottom: 32 }}>
          <List.Item title="Employee Name:" description={empName} />
          <List.Item title="Employee Code:" description={empCode} />
          <List.Item title="Mobile No:" description={mobileNo} />

          <List.Item title="Target of Sales Amount:" description={targetSales} />
          <List.Item title="Achievement of Sales Amount:" description={achievementSales} />
          <List.Item title="Achievement of Received Amount:" description={achievementReceived} />
        </ScrollView>
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
  );
};

export default ActivityReport;
