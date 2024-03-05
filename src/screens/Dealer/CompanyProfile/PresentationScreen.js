import { SafeAreaView, View } from "react-native";
import Header from "../../../components/Header";
import { Styles } from "../../../styles/styles";

const DealerPresentationScreen = ({ navigation }) => {
  return (

    <SafeAreaView style={[Styles.backgroundColorWhite,{flex:1,}]}>
    <View style={[Styles.flex1]}>
      <Header navigation={navigation} title="Presentation" />
    </View>
    </SafeAreaView>
  );
};

export default DealerPresentationScreen;
