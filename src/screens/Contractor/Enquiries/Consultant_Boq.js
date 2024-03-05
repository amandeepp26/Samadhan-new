import { Dimensions, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Snackbar } from "react-native-paper";
import { Styles } from "../../../styles/styles";
import Header from "../../../components/Header";
import { useEffect, useState } from "react";
import { TabBar, TabView } from "react-native-tab-view";
import { theme } from "../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Provider from "../../../api/Provider";
import ConsultantBoqTabs from "./ConsultantBoqTabs";

let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;

const windowWidth = Dimensions.get("window").width;

const routes = [
  { key: "new", title: "New" },
  { key: "approved", title: "Accepted" },
  { key: "rejected", title: "Rejected" },
];

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: theme.colors.primary }}
    style={{ backgroundColor: theme.colors.textLight }}
    inactiveColor={theme.colors.textSecondary}
    activeColor={theme.colors.primary}
    scrollEnabled={true}
    tabStyle={{ width: windowWidth / 3 }}
    labelStyle={[Styles.fontSize13, Styles.fontBold]}
  />
);

const ConsultantBoq = ({ navigation, route }) => {
  const [index, setIndex] = useState(route?.params?.index || 0);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingData, setPendingData] = useState([]);
  const [pendingSearchData, setPendingSearchData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  const [approvedSearchData, setApprovedSearchData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const [rejectedSearchData, setRejectedSearchData] = useState([]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

  const unload = (msg) => {
    setIsLoading(false);
    setSnackbarText(msg);
    setSnackbarColor(theme.colors.error);
    setSnackbarVisible(true);
  };

  const GetUserID = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      Sess_UserRefno = JSON.parse(userData).UserID;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;

      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      FetchData();
    }
  };

  const FetchData = async (toPending, text) => {
    let params = {
      data: {
        Sess_UserRefno,
        Sess_branch_refno,
        Sess_company_refno,
      },
    };

    try {
      const data = await Provider.getConsultantBOQList(params, () =>
        setIsLoading(false)
      );
      console.log(data);
      setPendingData(data.newBoq);
      setPendingSearchData(data.newBoq);
      setApprovedData(data.approvedBoq);
      setApprovedSearchData(data.approvedBoq);
      setRejectedData(data.rejectedBoq);
      setRejectedSearchData(data.rejectedBoq);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      setSnackbarText(e.message);
      setSnackbarColor(theme.colors.error);
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
      if (toPending !== undefined) {
        setIndex(toPending);
        setSnackbarText(text);
        setSnackbarColor(theme.colors.success);
        setSnackbarVisible(true);
      }
    }
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "new":
        return (
          <ScrollView
            style={[Styles.flex1, Styles.backgroundColor]}
            contentContainerStyle={[Styles.height100per]}
          >
            <ConsultantBoqTabs
              set={setIsLoading}
              unload={unload}
              listData2={pendingData}
              listSearchData2={pendingSearchData}
              fetch={FetchData}
              type={"new"}
            />
          </ScrollView>
        );
      case "approved":
        return (
          <ScrollView
            style={[Styles.flex1, Styles.backgroundColor]}
            contentContainerStyle={[Styles.height100per]}
          >
            <ConsultantBoqTabs
              set={setIsLoading}
              unload={unload}
              listData2={approvedData}
              listSearchData2={approvedSearchData}
              fetch={FetchData}
              type={"approved"}
            />
          </ScrollView>
        );
      case "rejected":
        return (
          <ScrollView
            style={[Styles.flex1, Styles.backgroundColor]}
            contentContainerStyle={[Styles.height100per]}
          >
            <ConsultantBoqTabs
              set={setIsLoading}
              unload={unload}
              listData2={rejectedData}
              listSearchData2={rejectedSearchData}
              fetch={FetchData}
              type={"rejected"}
            />
          </ScrollView>
        );
    }
  };

  useEffect(() => {
    console.log(route);
    GetUserID();
  }, []);

  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <Header navigation={navigation} title="Architect & Consultant-Boq" />
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
      ) : (
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      )}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: snackbarColor }}
      >
        {snackbarText}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

export default ConsultantBoq;
