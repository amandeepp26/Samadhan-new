import { View, Text, RefreshControl, ScrollView } from "react-native";
import React, { useState } from "react";
import { Button } from "react-native-paper";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import Provider from "../../../api/Provider";
import { SwipeListView } from "react-native-swipe-list-view";

const RenderItems = (data, navigation, index, setIndex) => {
  return (
    <View
      style={[
        Styles.backgroundColor,
        Styles.paddingHorizontal16,
        Styles.flexJustifyCenter,
        {
          borderWidth: 1.3,
          marginBottom: 10,
          borderRadius: 8,
          padding: 15,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <View>
        <Text
          style={[
            { fontWeight: "bold", fontSize: 20, marginBottom: "1%" },
            Styles.primaryColor,
          ]}
        >
          Budget No : {data.item.budget_no}
        </Text>
        <Text>Project Name : {data.item.project_name}</Text>

        <Text>
          Contact Person & Name : {data.item.contact_person} &{" "}
          {data.item.contact_mobile_no}
        </Text>
        <Text>Budget Unit : {data.item.quot_unit_type_name}</Text>
      </View>
      <View
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          flexDirection: "row",
        }}
      >
        <Button
          mode="outlined"
          onPress={() => {
            navigation.navigate("Budget Preview", {
              data: data.item,
              index,
              setIndex,
            });
          }}
          style={{
            borderColor: theme.colors.primary,
            borderWidth: 1.2,
          }}
        >
          View Budget
        </Button>

        {data.item.boq_action_button.includes("View Generated BOQ's") && (
          <Button
            mode="outlined"
            onPress={() => {
              navigation.navigate("BOQ", { data: data.item });
            }}
            style={{
              borderColor: theme.colors.primary,
              borderWidth: 1.2,
            }}
          >
            View BOQ's
          </Button>
        )}
      </View>
    </View>
  );
};
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
const Approved = ({ index, navigation, setIndex }) => {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const getUserData = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData !== null) {
      Sess_UserRefno = JSON.parse(userData).UserID;
      Sess_branch_refno = JSON.parse(userData).Sess_branch_refno;
      Sess_company_refno = JSON.parse(userData).Sess_company_refno;
      await fetchPending();
      setRefreshing(false);
    }
  };
  const fetchPending = () => {
    Provider.createDFArchitect(
      Provider.API_URLS.architect_budgetboq_approved_list,
      { data: { Sess_UserRefno, Sess_company_refno, Sess_branch_refno } }
    ).then((res) => {
      console.log(res.data);

      if (res.data.data) {
        setData(res.data.data);
      }
    });
  };
  useEffect(() => {
    if (index === 3) getUserData();
    else {
      setData([]);
    }
  }, [index]);
  return (
    <View>
      <ScrollView>
        <View style={[Styles.flex1, Styles.padding16]}>
          <SwipeListView
            previewDuration={1000}
            previewOpenValue={-160}
            previewRowKey="1"
            previewOpenDelay={1000}
            refreshControl={
              <RefreshControl
                colors={[theme.colors.primary]}
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  getUserData();
                }}
              />
            }
            data={data}
            useFlatList={true}
            disableRightSwipe={true}
            rightOpenValue={-160}
            renderItem={(data) =>
              RenderItems(data, navigation, index, setIndex)
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Approved;
