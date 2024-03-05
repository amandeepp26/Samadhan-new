import { View, Text, RefreshControl, ActivityIndicator, ScrollView } from "react-native";
import React from "react";
import LabelInput from "./common/LabelInput";
import HDivider from "./common/HDivider";
import DisplayButton from "./common/DisplayButton";
import { Styles } from "../../../styles/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import Provider from "../../../api/Provider";
import { Button, FAB, Snackbar, Searchbar } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import NoItems from '../../../components/NoItems';
import { theme } from "../../../theme/apptheme";
import Header from "../../../components/Header";
import Search from "../../../components/Search";

const PersonCard = ({
  data,
  EditData

}) => (
  <View
    style={[
      {
        backgroundColor: "#eee",
        borderRadius: 8,
        elevation: 5,
      },
      Styles.padding16,
      Styles.marginVertical8,
    ]}
  >
    <LabelInput label="Activity" value={data.activity_name} />
    <HDivider />
    <LabelInput label="Date" value={data.activity_date} />
    <HDivider />
    <LabelInput label="Company / Firm Name" value={data.company_name} />
    <HDivider />
    <LabelInput label="Contact Person" value={data.contact_person} />
    <HDivider />
    <View style={[{ flexDirection: "row", justifyContent: "space-between" }]}>
      <LabelInput label="Mobile" value={data.mobile_no} />
      <LabelInput label="Location" value={data.from_location} />
    </View>
    <HDivider />

    <View style={[{ flexDirection: "row", justifyContent: "space-between" }]}>
      <LabelInput
        label="Activity Status"
        value={
          <DisplayButton
            text={data.activity_status_name}
            width={100}
            isGreen={data.activity_status_name.toLowerCase() == "success" ? true : false}
            onPress={() => { }}
          />
        }
      />

      <LabelInput
        label="Display"
        value={
          <DisplayButton
            text={data.view_status}
            width={12}
            isGreen={data.view_status.toLowerCase() == "yes" ? true : false}
            onPress={() => { }}
          />
        }
      />
    </View>
    <Button
      mode="outlined"
      labelStyle={{
        fontSize: 12,
        color: theme.colors.greenBorder,
      }}
      style={[Styles.width100per,Styles.marginTop12,{borderWidth: 2,
        borderRadius: 6,
        borderColor: theme.colors.greenBorder,
        marginRight: 10,}]}
        onPress={EditData}
    >
      Edit Details
    </Button>
  </View>
);

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_group_refno = 0;

const DailyActivityList = ({ navigation }) => {

  const isFocused = useIsFocused();
  const [data, setData] = useState([]);

  //#region variable
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  // const listData = React.useState([]);
  // const listSearchData = React.useState([]);
  const [listData, setListData] = useState([]);
  const [listSearchData, setListSearchData] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(theme.colors.success);

  //#endregion

  useEffect(() => {
    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = data.UserID;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    Sess_group_refno = data.Sess_group_refno;
    fetchData();
  };

  const fetchData = () => {
    let params = {
      data: {
        Sess_UserRefno: Sess_UserRefno,
        Sess_company_refno: Sess_company_refno,
        Sess_branch_refno: Sess_branch_refno,
        Sess_group_refno: Sess_group_refno,
        myemployee_activity_refno: "all",
      }
    };

    Provider.createDFEmployee(
      Provider.API_URLS.employeeactivity_myemployeeactivityrefnocheck,
      params
    ).then((response) => {
      if (response.data && response.data.code === 200) {
        if (response.data.data) {
          const lisData = [...response.data.data];
          lisData.map((k, i) => {
            k.key = (parseInt(i) + 1).toString();
          });
          // listData[1](response.data.data);
          // listSearchData[1](response.data.data);
          setListData(response.data.data);
            setListSearchData(response.data.data);
        }
      } else {
        setListData([]);
      }
      setIsLoading(false);
      setRefreshing(false);
    })
      .catch((e) => {
        setIsLoading(false);
        setSnackbarText(e.message);
        setSnackbarColor(theme.colors.error);
        setSnackbarVisible(true);
        setRefreshing(false);
      });
  };

  const AddCallback = () => {
    navigation.navigate("DailyActivityForm", { type: "add", fetchData: fetchData });
  };

  const EditData = (data) => {
    navigation.navigate("DailyActivityForm", {
      type: "edit",
      fetchData: fetchData,
     // id: data.myemployee_activity_refno,
      data: data,
    });
  };

  const RenderItems = (data) => {
    return (
      <View style={[Styles.backgroundColor, Styles.paddingHorizontal16,
      Styles.flexJustifyCenter, Styles.flex1]}>
        <PersonCard
          key={data.item.key}
          data={data.item}
          EditData={() => {
            EditData(data.item)
          }}
        />
      </View>
    );
  };

  return (

    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Daily Activity List" />
      {isLoading ? (
        <View style={[Styles.flex1, Styles.flexJustifyCenter, Styles.flexAlignCenter]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : listData.length > 0 ? (
        <View style={[Styles.flex1, Styles.flexColumn, Styles.backgroundColor]}>
          <Search
            data={listData}
            setData={setListSearchData}
            filterFunction={["activity_date", "activity_name", "company_name", "contact_person", "mobile_no", "from_location"]}
          />
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
        </View>
      ) : (
        <NoItems icon="format-list-bulleted" text="No records found. Add records by clicking on plus icon." />
      )}
      <FAB style={[Styles.fabStyle]} icon="plus" onPress={AddCallback} />
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}
        style={{ backgroundColor: snackbarColor }}>
        {snackbarText}
      </Snackbar>

    </View>
    
  );
};

export default DailyActivityList;
