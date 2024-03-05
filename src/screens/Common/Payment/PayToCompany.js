import uuid from "react-native-uuid";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, Image, View, LogBox } from "react-native";
import {
    Button,
    Card,
    Checkbox,
    HelperText,
    Snackbar,
    Subheading,
    Text,
    RadioButton,
    TextInput,
    DataTable,
} from "react-native-paper";
import Provider from "../../../api/Provider";
import { Styles } from "../../../styles/styles";
import { theme } from "../../../theme/apptheme";
import { communication } from "../../../utils/communication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIConverter } from "../../../utils/apiconverter";
import {
    projectVariables,
    projectLoginTypes,
    projectFixedDesignations,
} from "../../../utils/credentials";

let userID = 0,
    groupID = 0,
    groupExtraID = 0,
    companyID = 0,
    branchID = 0,
    _pktEntryTypeID = 0,
    designID = 0,
    companyAdminID = 0;

LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
    "Material-UI: The `css` function is deprecated. Use the `styleFunctionSx` instead",
    "source.uri should not be an empty string",
    `VirtualizedLists should never be nested inside plain ScrollViews with the 
  same orientation because it can break windowing and other functionality - 
  use another VirtualizedList-backed container instead`,
]);


const PayToCompany = ({ route, navigation }) => {

    const [isButtonLoading, setIsButtonLoading] = React.useState(false);

    //#region Variables

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");
    const [snackbarColor, setSnackbarColor] = useState(theme.colors.success);

    const [buttonStatus, setButtonStatus] = React.useState(true);
    const [amountError, setAmountError] = React.useState(false);
    const [amount, settAmount] = React.useState("");
    const [amountInvalidBalance, setAmountInvalidBalance] = React.useState(
        "Amount can not be more then balance amount"
    );

    const [collectedAmount, setcollectedAmount] = React.useState("");
    const [paidAmount, setpaidAmount] = React.useState("");
    const [balanceAmount, setbalanceAmount] = React.useState("");

    //#endregion


    //#region Functions

    useEffect(() => {
        GetUserID();
    }, []);

    const GetUserID = async () => {
        const userData = await AsyncStorage.getItem("user");

        if (userData !== null) {
            userID = JSON.parse(userData).UserID;
            groupID = JSON.parse(userData).Sess_group_refno;
            groupExtraID = JSON.parse(userData).Sess_group_refno_extra_1;
            companyID = JSON.parse(userData).Sess_company_refno;
            branchID = JSON.parse(userData).Sess_branch_refno;
            designID = JSON.parse(userData).Sess_designation_refno;
            companyAdminID = JSON.parse(userData).Sess_CompanyAdmin_UserRefno;
            FetchPayToCompanyData(route.params.data.transactionID);
        }
    };

    const FetchPayToCompanyData = (transactionID) => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                pck_trans_refno: transactionID,
                Sess_company_refno: companyID.toString(),
                Sess_branch_refno: branchID.toString(),
                pck_transtype_refno:
                    route.params.type === "edit"
                        ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
                        : route.params.type === "verify"
                            ? projectVariables.DEF_PCKDIARY_TRANSTYPE_EXPENSES_REFNO
                            : route.params.type ===
                                projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText
                                ? projectVariables.DEF_PCKDIARY_TRANSTYPE_SOURCE_REFNO
                                : 0,
                pck_entrytype_refno:
                    projectVariables.DEF_PCKDIARY_ENTRYTYPE_COMPANY_REFNO,
            },
        };
        Provider.createDFPocketDairy(Provider.API_URLS.pcktransrefnocheck, params)
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {

                        setpaidAmount(response.data.data[0].TotalPaidAmount);
                        setbalanceAmount(response.data.data[0].BalanceUnPaidPayment);
                        setcollectedAmount(response.data.data[0].Collected_ActualAmount);
                    }
                } else {
                    setSnackbarText("No Company data found");
                    setSnackbarColor(theme.colors.error);
                    setSnackbarVisible(true);
                }
            })
            .catch((e) => {
                setIsLoading(false);
                setSnackbarText(e.message);
                setSnackbarColor(theme.colors.error);
                setSnackbarVisible(true);
                setRefreshing(false);
            });
    };

    const onAmount = (text) => {
        const numericOnly = text.replace(/[^0-9]/g, '');
        settAmount(text);
        setAmountError(false);
    };

    const onAmountBlur = (text) => {

        if (amount != null && amount != "" && amount != "0") {

            if (parseFloat(amount) > 0) {
                setButtonStatus(false);
            }
            else {
                setButtonStatus(true);
            }

            if (parseFloat(amount) > parseFloat(balanceAmount)) {
                settAmount("0");
                setAmountError(true);
                setAmountInvalidBalance("You can enter less then or equal to Balance amount.");
            }
        }
        else {
            setButtonStatus(true);
        }
    };

    const UpdateData = () => {
        setButtonStatus(true);
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID.toString(),
                Sess_branch_refno: branchID.toString(),
                Sess_designation_refno: designID.toString(),
                amount: amount,
                pck_trans_refno: route.params.data.transactionID,
            }
        };

        Provider.createDFPocketDairy(Provider.API_URLS.pckcompanysource_paytocompany_update, params)
            .then((response) => {
                console.log('resp:', response.data.data);
                setButtonStatus(false);
                setIsButtonLoading(false);
                if (response.data && response.data.code === 200 && response.data.data.Updated == 1) {
                    route.params.fetchData("update");
                    navigation.goBack();
                } else if (response.data && response.data.code === 200 && response.data.data.Updated == 0) {
                    setSnackbarText("Amount Update Failed");
                    setSnackbarVisible(true);
                    setSnackbarColor(theme.colors.error);
                }
                else if (response.data.code === 304) {
                    setSnackbarText(communication.AlreadyExists);
                    setSnackbarVisible(true);
                } else {
                    setSnackbarText(communication.UpdateError);
                    setSnackbarVisible(true);
                }
            })
            .catch((e) => {
                setIsButtonLoading(false);
                console.log(e);
                setSnackbarText(communication.NetworkError);
                setSnackbarVisible(true);
            });
    };

    const ValidateData = () => {

        let isValid = true;

        if (amount.trim() == "0" || amount.trim() == "") {
            setAmountError(true);
            isValid = false;
            setAmountInvalidBalance("Please enter a valid amount");
        }

        if (amount.trim() == "0" || amount.trim() == "") {

            if (parseFloat(amount) > parseFloat(balanceAmount)) {
                setAmountError(true);
                isValid = false;
                setAmountInvalidBalance("You can enter less then or equal to Balance amount.");
            }
        }

        if (isValid) {
            setIsButtonLoading(true);
            UpdateData();
        } else {
            setSnackbarText("Please fill all mandatory fields");
            setSnackbarColor(theme.colors.error);
            setSnackbarVisible(true);
        }
    };

    //#endregion


    const onCompanyNameSelected = (selectedItem) => {
        setCompanyName(selectedItem);
        setCONError(false);
        FetchOtherClients(selectedItem, "company");
    };

    const onMobileNumberSelected = (selectedItem) => {
        setMobileNo(selectedItem);
        setMNError(false);
        FetchOtherClients(selectedItem, "mobile");
    };

    const SearchClient = () => {
        setIsButtonDisabled(true);
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                company_name_s: companyName,
                mobile_no_s: mobileno,
            },
        };
        Provider.createDFCommon(Provider.API_URLS.ClientSearch, params)
            .then((response) => {
                setIsButtonDisabled(false);
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        setOtherClients(response.data.data);
                    }
                } else {
                    setOtherClients([]);
                }
            })
            .catch((e) => {
                setIsButtonDisabled(false);
                setOtherClients([]);
            });
    };

    const InsertOtherClient = (selectedID) => {
        const params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                Sess_branch_refno: branchID,
                client_user_refno: selectedID,
                search_client_role_refnos: ["8"], // for client TBD
            },
        };
        Provider.createDFCommon(Provider.API_URLS.ClientAdd, params)
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    refRBSheet.current.close();
                    if (rb_clientType == "2") {
                        FetchMKTClientList();
                    } else {
                        FetchClientList();
                    }
                } else {
                    setSnackbarText(communication.InsertError);
                    setSnackbarColor(theme.colors.error);
                    setSnackbarVisible(true);
                }
            })
            .catch((e) => {
                console.log(e);
                setSnackbarText(communication.NetworkError);
                setSnackbarColor(theme.colors.error);
                setSnackbarVisible(true);
            });
    };

    const FetchOtherClients = (selectedItem, type) => {
        let params = {
            data: {
                Sess_UserRefno: userID,
                Sess_company_refno: companyID,
                company_name: selectedItem,
            },
        };
        if (type === "company") {
            params.data.company_name = selectedItem;
        } else {
            params.data.mobile_no = selectedItem;
        }
        Provider.createDFCommon(
            type === "company"
                ? Provider.API_URLS.CompanyNameAutocompleteClientSearch
                : Provider.API_URLS.MobileNoAutocompleteClientSearch,
            params
        )
            .then((response) => {
                if (response.data && response.data.code === 200) {
                    if (response.data.data) {
                        let clientData = [];
                        response.data.data.map((data, i) => {
                            clientData.push({
                                id: i,
                                title:
                                    type === "company"
                                        ? data.companyname_Result
                                        : data.mobile_no_Result,
                            });
                        });
                        if (type === "company") {
                            setCompanyData(clientData);
                        } else {
                            setMobileNoData(clientData);
                        }
                    }
                } else {
                    setCompanyData([]);
                    setMobileNoData([]);
                }
            })
            .catch((e) => {
                setCompanyData([]);
                setMobileNoData([]);
            });
    };
    //#endregion

    return (
        <View style={[Styles.flex1]}>
            <ScrollView
                style={[Styles.flex1, Styles.backgroundColor, { marginBottom: 64 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[Styles.padding16]}>

                    <TextInput
                        mode="outlined"
                        label="Amount"
                        value={amount}
                        returnKeyType="next"
                        keyboardType="number-pad"
                        onSubmitEditing={() => ref_input2.current.focus()}
                        onChangeText={onAmount}
                        onBlur={onAmountBlur}
                        style={{ backgroundColor: "white" }}
                        error={amountError}
                    />
                    <HelperText type="error" visible={amountError}>
                        {amountInvalidBalance}
                    </HelperText>

                    {route.params.type ===
                        projectVariables.DEF_PCKDIARY_Dynamic_Expense_ClientAmountGivenToCompany_FlagText && (
                            <>
                                <View style={[Styles.padding16]}>
                                    <DataTable
                                        style={[
                                            Styles.backgroundSecondaryColor,
                                            Styles.borderRadius4,
                                            Styles.flexJustifyCenter,
                                            Styles.bordergray,
                                            Styles.fontBold,
                                        ]}
                                    >
                                        <DataTable.Header>
                                            <DataTable.Title
                                                style={[{ flex: 1, justifyContent: "center" }]}
                                            >
                                                Collected
                                            </DataTable.Title>
                                            <DataTable.Title
                                                style={[
                                                    Styles.borderLeft1,
                                                    { flex: 1, justifyContent: "center" },
                                                ]}
                                                numeric
                                            >
                                                Paid
                                            </DataTable.Title>
                                            <DataTable.Title
                                                style={[
                                                    Styles.borderLeft1,
                                                    { flex: 1, justifyContent: "center" },
                                                ]}
                                                numeric
                                            >
                                                Balance
                                            </DataTable.Title>
                                        </DataTable.Header>

                                        <DataTable.Row style={[Styles.backgroundColor]}>
                                            <DataTable.Cell
                                                style={[{ flex: 1, justifyContent: "center" }]}
                                            >
                                                {collectedAmount}
                                            </DataTable.Cell>
                                            <DataTable.Cell
                                                style={[
                                                    Styles.borderLeft1,
                                                    { flex: 1, justifyContent: "center" },
                                                ]}
                                            >
                                                {paidAmount}
                                            </DataTable.Cell>
                                            <DataTable.Cell
                                                style={[
                                                    Styles.borderLeft1,
                                                    { flex: 1, justifyContent: "center" },
                                                ]}
                                            >
                                                {balanceAmount}
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    </DataTable>
                                </View>
                            </>
                        )}

                </View>
            </ScrollView>
            <View
                style={[
                    Styles.backgroundColor,
                    Styles.width100per,
                    Styles.marginTop32,
                    Styles.padding16,
                    { position: "absolute", bottom: 0, elevation: 3 },
                ]}
            >
                <Card.Content>
                    <Button
                        mode="contained"
                        disabled={isButtonLoading ? isButtonLoading : buttonStatus}
                        onPress={ValidateData}
                        loading={isButtonLoading}
                    >
                        Submit
                    </Button>
                </Card.Content>
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ backgroundColor: snackbarColor }}
            >
                {snackbarText}
            </Snackbar>
        </View>
    );
};

export default PayToCompany;
