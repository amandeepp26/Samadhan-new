import { View, Text } from "react-native";
import React from "react";
import { Styles } from "../../../../styles/styles";

const LabelInput = ({ label, lg, value, white }) => {
  const isLg = lg ? Styles.fontSize16 : Styles.fontSize14;
  return (
    <View>
      <Text
        style={[
          Styles.marginBottom4,
          Styles.fontSize10,
          Styles.textSecondaryColor,
          { height: 14 },
          white ? { color: "white" } : {},
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          isLg,
          Styles.marginTop2,
          { color: "#5a5a5a" },
          white ? { color: "white" } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

export default LabelInput;
