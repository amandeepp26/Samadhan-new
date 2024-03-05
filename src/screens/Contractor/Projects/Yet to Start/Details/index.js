import { SafeAreaView, View } from "react-native";

import React from "react";
import { TabBar, TabView } from "react-native-tab-view";
import { Styles } from "../../../../../styles/styles";

import { theme } from "../../../../../theme/apptheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import SupervisorSetup from "./SupervisorSetup";
import ClientEstimation from "./ClientEstimation";
import ProjectLocation from "./ProjectLocation";
import { Snackbar } from "react-native-paper";
import MaterialSetup from "./MaterialSetup";
import RetentionSetup from "./RetentionSetup";
const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: theme.colors.primary }}
    style={{ backgroundColor: theme.colors.textLight }}
    inactiveColor={theme.colors.textSecondary}
    activeColor={theme.colors.primary}
    scrollEnabled={true}
    // tabStyle={{ width: windowWidth / 4 }}
    labelStyle={[Styles.fontSize13, Styles.fontBold]}
  />
);
const routes = [
  { key: "client-estimation", title: "Client Estimation" },
  { key: "project-location", title: "Project Location" },
  { key: "material-setup", title: "Material Setup" },
  { key: "retention-setup", title: "Retention Setup" },
  { key: "supervisor-setup", title: "Supervisor Setup" },
];

const Details = ({ navigation, route }) => {
  const params = route.params;
  const [index, setIndex] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [snackbarColor, setSnackbarColor] = React.useState(
    theme.colors.success
  );

  const unload = (msg, color = theme.colors.success) => {
    setSnackbarText(msg);
    setSnackbarColor(color);
    setSnackbarVisible(true);
  };
  const renderScene = ({ route }) => {
    switch (route.key) {
      case "client-estimation":
        return (
          <ClientEstimation
            index={index}
            setIndex={setIndex}
            data={params}
            navigation={navigation}
          />
        );
      case "project-location":
        return (
          <ProjectLocation
            index={index}
            setIndex={setIndex}
            data={params}
            navigation={navigation}
            unload={unload}
          />
        );
      case "material-setup":
        return (
          <MaterialSetup
            index={index}
            setIndex={setIndex}
            data={params}
            navigation={navigation}
            unload={unload}
          />
        );
      case "retention-setup":
        return (
          <RetentionSetup
            index={index}
            setIndex={setIndex}
            data={params}
            navigation={navigation}
            unload={unload}
          />
        );
      case "supervisor-setup":
        return (
          <SupervisorSetup
            index={index}
            setIndex={setIndex}
            data={params}
            navigation={navigation}
            unload={unload}
          />
        );
    }
  };
  return (
    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1, Styles.backgroundColor]}>
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={async (e) => {
          setIndex(e);
          await AsyncStorage.setItem("budget-index", String(e));
        }}
      />
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

export default Details;
