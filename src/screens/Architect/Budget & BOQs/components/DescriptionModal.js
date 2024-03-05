import { View, Text } from "react-native";
import React from "react";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { useEffect } from "react";
import { useState } from "react";
import { Styles } from "../../../../styles/styles";

const DescriptionModal = ({ open, setOpen, desc, setDesc }) => {
  const [state, setState] = useState("");

  useEffect(() => {
    if (open) {
      setState(desc);
    } else {
      setState("");
    }
  }, [open]);
  return (
    <Portal>
      <Dialog visible={open} dismissable={false}>
        <Dialog.Title style={{ color: "#45916b" }}>
          Edit Description
        </Dialog.Title>
        <Dialog.Content style={{ maxHeight: 300 }}>
          <TextInput
            mode="outlined"
            multiline={true}
            numberOfLines={5}
            value={state}
            onChangeText={setState}
          />
        </Dialog.Content>
        <Dialog.Actions style={[Styles.padding16]}>
          <Button
            mode="outlined"
            onPress={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
          <Button
            style={[Styles.marginStart12]}
            mode="contained"
            onPress={() => setDesc(state)}
          >
            Confirm
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DescriptionModal;
