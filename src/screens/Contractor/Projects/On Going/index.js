import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import Provider from "../../../../api/Provider";
import { useState } from "react";
import { Row, Table, TableWrapper } from "react-native-table-component";
import { theme } from "../../../../theme/apptheme";
import { Button } from "react-native-paper";
import { Styles } from "../../../../styles/styles";
import HDivider from "../../../Marketing/EmployeeActivity/common/HDivider";
import DisplayButton from "../../../Marketing/EmployeeActivity/common/DisplayButton";
import LabelInput from "../../../Marketing/EmployeeActivity/common/LabelInput";
import Search from "../../../../components/Search";
import Header from "../../../../components/Header";
let Sess_UserRefno = 0;
let Sess_company_refno = 0;
let Sess_branch_refno = 0;
let Sess_CompanyAdmin_UserRefno = 0;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: { height: 80, backgroundColor: theme.colors.primary },
  subheader: { height: 30, backgroundColor: "white" },
  text: { textAlign: "center", fontWeight: "400" },
  headertext: { textAlign: "center", fontWeight: "800", color: "white" },
  dataWrapper: { marginTop: -1 },
  row: { minHeight: 50, backgroundColor: "white" },
});

const Card = ({ data, navigation }) => {
  return (
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
      <LabelInput label="Project Name" value={data.project_name} />
      <HDivider />
      <LabelInput label="Project Type" value={data.project_type_name} />
      <HDivider />
      <LabelInput
        label="Contact Person & Contact"
        value={
          data.project_type === "4"
            ? `${data["Architect_name"]} & ${data["Architect_mobile_no"]}`
            : `${data.project_location_contact_person} & ${data.project_location_contact_mobile_no}`
        }
      />
      <HDivider />
      <LabelInput
        label="Supervisor"
        value={data.supervisordata.map((obj, index) => {
          return (
            <Text style={{ textAlign: "center", marginBottom: 1 }}>
              {index + 1}. {obj}
            </Text>
          );
        })}
      />
      <HDivider />
      <DisplayButton
        onPress={() =>
          navigation.navigate("On Going Project Details", {
            ...data,
          })
        }
        isGreen
        text={"View & Update Assign Supervisor"}
        style={{ fontSize: 13 }}
      />
    </View>
  );
};
const List = ({ navigation }) => {
  const focused = useIsFocused();
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const fetchUser = async () => {
    const data = JSON.parse(await AsyncStorage.getItem("user"));
    Sess_UserRefno = data.UserID;
    Sess_CompanyAdmin_UserRefno = data.Sess_CompanyAdmin_UserRefno;
    Sess_company_refno = data.Sess_company_refno;
    Sess_branch_refno = data.Sess_branch_refno;
    fetchList();
  };

  const fetchList = () => {
    Provider.createDFContractor(
      Provider.API_URLS.contractor_ongoing_projects_list,
      {
        data: {
          Sess_UserRefno,
          Sess_company_refno,
          Sess_branch_refno,
          Sess_CompanyAdmin_UserRefno,
        },
      }
    ).then((res) => {
      console.log(res.data);

      if (res.data.data) {
        setList(res.data.data);
        setFiltered(res.data.data);
      }
    });
  };

  useEffect(() => {
    if (focused) {
      fetchUser();
    }
  }, [focused]);
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <SafeAreaView>
      <Header navigation={navigation} title="On Going" />
    <ScrollView
      contentContainerStyle={{ padding: 16, backgroundColor: "white" }}
    >
      <Search
        data={list}
        setData={setFiltered}
        filterFunction={["project_name", "project_type_name"]}
      />
      {filtered.map((obj, index) => {
        return <Card data={obj} key={index} navigation={navigation} />;
      })}
    </ScrollView>
    </SafeAreaView>
    </SafeAreaView>
  );
};

export default List;
