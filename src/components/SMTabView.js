import React, { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
    Button, Subheading, Text, TextInput, IconButton
} from "react-native-paper";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { theme } from "../theme/apptheme";
import { Styles } from '../styles/styles';
import Dropdown from "../components/Dropdown";


const SMTabView = (props) => {

    const [lengthFeet, setLengthFeet] = React.useState("1");
    const [lengthInches, setLengthInches] = React.useState("0");

    const [widthFeet, setWidthFeet] = React.useState("1");
    const [widthInches, setWidthInches] = React.useState("0");
    const [totalArea, setTotalArea] = React.useState("");
    const [TALength, setTALength] = React.useState("");
    const [TAWidthHeight, setTAWidthHeight] = React.useState("");

    const layout = useWindowDimensions();

    const renderTabBar = (props) => <TabBar {...props} indicatorStyle={{ backgroundColor: "#FFF89A" }}
        style={[Styles.borderTopRadius4, { backgroundColor: theme.colors.primary }]} activeColor={"#F5CB44"} inactiveColor={"#F4F4F4"} />;

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: "length", title: "Length / Width" },
        { key: "total", title: "Total Area" },
    ]);

    const onLengthFeetSelected = (selectedItem) => {
        setLengthFeet(selectedItem);
        ResetTotalArea();
        //CalculateSqFt(selectedItem, lengthInches, widthFeet, widthInches, "lw");// on another page
        props.onChange(selectedItem, lengthInches, widthFeet, widthInches, "lw");
    };

    const onLengthInchesSelected = (selectedItem) => {
        setLengthInches(selectedItem);
        ResetTotalArea();
        //CalculateSqFt(lengthFeet, selectedItem, widthFeet, widthInches, "lw");// on another page
        props.onChange(lengthFeet, selectedItem, widthFeet, widthInches, "lw");
    };

    const onWidthFeetSelected = (selectedItem) => {
        setWidthFeet(selectedItem);
        ResetTotalArea();
        //CalculateSqFt(lengthFeet, lengthInches, selectedItem, widthInches, "lw");// on another page
        props.onChange(lengthFeet, lengthInches, selectedItem, widthInches, "lw");// on another page
    };

    const onWidthInchesSelected = (selectedItem) => {
        setWidthInches(selectedItem);
        ResetTotalArea();
        //CalculateSqFt(lengthFeet, lengthInches, widthFeet, selectedItem, "lw");// on another page
        props.onChange(lengthFeet, lengthInches, widthFeet, selectedItem, "lw");// on another page
    };

    const onTotalAreaChanged = (text) => {
        ResetLengthWidth();
        setTotalArea(text);

        if (text != "" && text != "0") {
            if (parseFloat(text) > 0) {
                var squareRoot = Math.sqrt(text);
                setTALength(squareRoot.toFixed(2));
                setTAWidthHeight(squareRoot.toFixed(2));
            }
            else {
                setTALength("");
                setTAWidthHeight("");
            }
        }
        else {
            setTALength("");
            setTAWidthHeight("");
        }

        props.onChange(0, 0, 0, 0, "ta", text, true);// on another page
    };

    const ResetLengthWidth = () => {
        setWidthFeet("1");
        setLengthFeet("1");
        setLengthInches("0");
        setWidthInches("0");
    };


    const ResetTotalArea = () => {
        setTotalArea("");
        setTALength("");
        setTAWidthHeight("");
    };

    const renderScene = ({ route }) => {
        switch (route.key) {
            case "length":
                return (
                    <View style={[Styles.height250, Styles.border1, Styles.borderBottomRadius4]}>
                        <View style={[Styles.flexAlignSelfStart]}>
                            <IconButton icon="gesture-swipe-left" color={theme.colors.textfield} size={22} />
                        </View>
                        <View style={Styles.paddingHorizontal16}>
                            <Subheading>Length</Subheading>
                            <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                                <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex5]}>
                                    <Dropdown label="Feet" data={CreateNumberDropdown(1, 50)} onSelected={onLengthFeetSelected} selectedItem={lengthFeet} />
                                </View>
                                <Text style={[Styles.flex1, Styles.paddingStart4]}>ft</Text>
                                <View style={[Styles.paddingStart8, Styles.paddingEnd0, Styles.flex5]}>
                                    <Dropdown label="Inches" data={CreateNumberDropdown(0, 11)} onSelected={onLengthInchesSelected} selectedItem={lengthInches} />
                                </View>
                                <Text style={[Styles.flex1_5, Styles.paddingStart4]}>inch</Text>
                            </View>
                            <Subheading style={[Styles.marginTop32]}>Width / Height</Subheading>
                            <View style={[Styles.flexRow, Styles.flexAlignCenter, Styles.marginBottom32]}>
                                <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex5]}>
                                    <Dropdown label="Feet" data={CreateNumberDropdown(1, 50)} onSelected={onWidthFeetSelected} selectedItem={widthFeet} />
                                </View>
                                <Text style={[Styles.flex1, Styles.paddingStart4]}>ft</Text>
                                <View style={[Styles.paddingStart8, Styles.paddingEnd0, Styles.flex5]}>
                                    <Dropdown label="Inches" data={CreateNumberDropdown(0, 11)} onSelected={onWidthInchesSelected} selectedItem={widthInches} />
                                </View>
                                <Text style={[Styles.flex1_5, Styles.paddingStart4]}>inch</Text>
                            </View>
                        </View>
                    </View>
                );
            case "total":
                return (
                    <View style={[Styles.height250, Styles.border1, Styles.borderBottomRadius4]}>
                        <View style={[Styles.flexAlignSelfEnd]}>
                            <IconButton icon="gesture-swipe-right" color={theme.colors.textfield} size={22} />
                        </View>
                        <View style={[Styles.paddingHorizontal16, Styles.flexJustifyCenter]}>
                            <Subheading style={[Styles.marginTop8, Styles.flexJustifyCenter, Styles.textCenter]}>Add Total Area (Sq.Ft)</Subheading>
                            <View style={[Styles.flexRow, Styles.flexAlignCenter, Styles.flexJustifyCenter, Styles.marginBottom8]}>
                                <TextInput mode="outlined" keyboardType="number-pad" label="Total Sq.Ft" maxLength={10} value={totalArea}
                                    returnKeyType="done" dense onChangeText={onTotalAreaChanged} style={[Styles.width50per, { backgroundColor: "white" }]} />
                            </View>

                            <View style={[Styles.flexRow, Styles.flexAlignCenter, Styles.flexJustifyCenter]}>
                                <Text style={[Styles.textCenter, Styles.fontBold, Styles.fontSize24]}>=</Text>
                            </View>

                            <View style={Styles.paddingHorizontal16}>
                                <View style={[Styles.flexRow, Styles.flexAlignCenter]}>
                                    <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex5]}>
                                        <TextInput mode="outlined" editable={false} keyboardType="number-pad" label="Length" maxLength={10} value={TALength}
                                            returnKeyType="done" dense style={[Styles.width100per, { backgroundColor: "white" }]} />
                                    </View>
                                    <View style={[Styles.paddingStart0, Styles.paddingEnd8, Styles.flex1]}>
                                        <Text style={[Styles.textCenter, Styles.fontBold, Styles.fontSize24]}>X</Text>
                                    </View>
                                    <View style={[Styles.paddingStart8, Styles.paddingEnd0, Styles.flex5]}>
                                        <TextInput mode="outlined" editable={false} keyboardType="number-pad" label="Width/Height" maxLength={10} value={TAWidthHeight}
                                            returnKeyType="done" dense style={[Styles.width100per, { backgroundColor: "white" }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                );

            default:
                return <View />;
        }
    };

    const CreateNumberDropdown = (startCount, endCount) => {
        let arrNumbers = [];
        for (var i = startCount; i <= endCount; i++) {
            arrNumbers.push(i.toString());
        }
        return arrNumbers;
    };

    return (

        <TabView renderTabBar={renderTabBar} navigationState={{ index, routes }}
            renderScene={renderScene} onIndexChange={setIndex}
            initialLayout={{ width: layout.width }} />
    );

};

export default SMTabView;
