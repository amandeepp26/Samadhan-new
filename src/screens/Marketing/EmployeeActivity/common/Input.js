import { View, Text } from "react-native";
import React from "react";
import { Checkbox, TextInput } from "react-native-paper";
import { Styles } from "../../../../styles/styles";
import Dropdown from "../../../../components/Dropdown";
import { theme } from "../../../../theme/apptheme";
import { PaperSelect } from "react-native-paper-select";

const FormInput = ({
  onChangeText,
  label,
  value,
  style,
  type = "input",
  data = [],
  keyboardType,
  error,
  phone,
  disabled,
  selectedList,
}) => {
  return (
    <View style={[Styles.marginTop8]}>
      {type !== "check-box" && (
        <Text style={{ color: error ? theme.colors.error : "black" }}>
          {label}
        </Text>
      )}

      {type === "multi-select" ? (
        <PaperSelect
          multiEnable={true}
          label={""}
          textInputMode="outlined"
          underlineColor={error ? theme.colors.error : "black"}
          errorStyle={{ color: theme.colors.error }}
          // value={value.map((obj) => obj.value)?.join(",")}
          arrayList={data.map((obj) => {
            return {
              _id: obj.vendor_supplier_user_refno,
              value: obj.vendor_supplier_user_company_name,
            };
          })}
          value={value.text || ""}
          selectAllEnable={true}
          selectedArrayList={selectedList || []}
          hideSearchBox={true}
          onSelection={(e) => {
            onChangeText(e);
          }}
        />
      ) : (
        <></>
      )}
      {type === "input" ? (
        <TextInput
          onChangeText={(text) => {
            if (phone) {
              if (new RegExp(/^\d+$/).test(text) && text.length < 11)
                onChangeText(text);
            } else onChangeText(text);
          }}
          style={{ ...style }}
          mode="outlined"
          value={value}
          error={error}
          disabled={disabled}
          keyboardType={keyboardType}
        />
      ) : type === "dropdown" ? (
        <Dropdown
          data={data}
          forceDisable={disabled}
          style={{ ...style }}
          isError={error}
          onSelected={onChangeText}
          selectedItem={value}
        />
      ) : type === "check-box" ? (
        <Checkbox.Item
          disabled={disabled}
          label={label}
          color={theme.colors.primary}
          position="leading"
          labelStyle={{ textAlign: "left", paddingLeft: 8 }}
          status={value == "1" ? "checked" : "unchecked"}
          onPress={() => {
            onChangeText();
          }}
        />
      ) : type === "textarea" ? (
        <TextInput
          disabled={disabled}
          onChangeText={onChangeText}
          style={{ ...style }}
          mode="outlined"
          value={value}
          error={error}
          multiline={true}
          numberOfLines={5}
          keyboardType={keyboardType}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default FormInput;
