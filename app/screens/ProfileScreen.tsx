import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useMemo, useRef, useState } from "react"
import {
  Image,
  ImageStyle,
  Dimensions,
  TextInput,
  TextStyle,
  ViewStyle,
  View,
  Alert,
} from "react-native"
import * as Keychain from "react-native-keychain"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { colors, spacing } from "../theme"

import { useHeader } from "../utils/useHeader" // @demo remove-current-line
interface ProfileScreenProps extends AppStackScreenProps<"Profile"> {}

const ACCESS_CONTROL_OPTIONS = ["None", "Passcode", "Password"]
const ACCESS_CONTROL_OPTIONS_ANDROID = ["None"]
const ACCESS_CONTROL_MAP = [
  null,
  Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
  Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD,
  Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
]
const ACCESS_CONTROL_MAP_ANDROID = [null, Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET]
const SECURITY_LEVEL_OPTIONS = ["Any", "Software", "Hardware"]
const SECURITY_LEVEL_MAP = [
  Keychain.SECURITY_LEVEL.ANY,
  Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
  Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
]

const SECURITY_STORAGE_OPTIONS = ["Best", "FB", "AES", "RSA"]
const SECURITY_STORAGE_MAP = [
  null,
  Keychain.STORAGE_TYPE.FB,
  Keychain.STORAGE_TYPE.AES,
  Keychain.STORAGE_TYPE.RSA,
]

export const ProfileScreen: FC<ProfileScreenProps> = observer(function ProfileScreen(_props) {
  const { navigation } = _props
  const authPasswordInput = useRef<TextInput>()
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const {
    authenticationStore: {
      authEmail,
      accName,
      authPassword,
      privKey,
      pubKey,
      authPasswordConfirm,
      setAuthEmail,
      setAuthPassword,
      setAuthPasswordConfirm,
      setaccName,
      logout,
      validationErrors,
    },
  } = useStores()

  useHeader({
    rightTx: "common.logOut",
    titleTx: "profileScreen.googlesignin",
    onLeftPress: logout,
  })

  const errors: typeof validationErrors = isSubmitted ? validationErrors : ({} as any)

  const next = async () => {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)
    const username = accName
    const password = authPassword
    // Store the credentials if its first time
    !isSaved && (await Keychain.setGenericPassword(privKey, password))
    try {
      // Retreive the credentials
      const credentials = await Keychain.getGenericPassword()

      if (credentials) {
        if (credentials.password === authPassword) {
          navigation.navigate("Welcome")
          console.log("MATCHED")
        } else {
          Alert.alert("", "Please enter a valid password for decrytion process")
        }
      } else {
        console.log("No credentials stored")
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error)
    }

    //if (authPassword == authPasswordConfirm) navigation.navigate("Welcome")
  }

  const PasswordRightAccessory = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden],
  )

  useEffect(() => {
    const get = async () => {
      try {
        // Retreive the credentials
        const credentials = await Keychain.getGenericPassword()

        if (credentials) {
          console.log("Credentials " + JSON.stringify(credentials))
          setIsSaved(true)
        } else {
          console.log("No credentials stored")
        }
      } catch (error) {
        console.log("Keychain couldn't be accessed!", error)
      }
    }
    get()
  }, [])
  useEffect(() => {
    return () => {
      // setAuthPassword("")
      setAuthEmail("")
    }
  }, [])

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      {!isSaved && (
        <TextField
          value={accName}
          onChangeText={setaccName}
          containerStyle={$textField}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          labelTx="profileScreen.AccountNameFieldLabel"
          placeholderTx="profileScreen.AccountNameFieldPlaceholder"
          onSubmitEditing={() => authPasswordInput.current?.focus()}
        />
      )}

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="profileScreen.passwordFieldLabel"
        placeholderTx="profileScreen.passwordFieldPlaceholder"
        helper={errors?.authPassword}
        status={errors?.authPassword ? "error" : undefined}
        onSubmitEditing={next}
        RightAccessory={PasswordRightAccessory}
      />
      {!isSaved && (
        <TextField
          ref={authPasswordInput}
          value={authPasswordConfirm}
          onChangeText={setAuthPasswordConfirm}
          containerStyle={$textField}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          secureTextEntry={isAuthPasswordHidden}
          labelTx="profileScreen.passwordConfirmFieldLabel"
          placeholderTx="profileScreen.passwordConfirmFieldPlaceholder"
          helper={errors?.authPassword}
          status={errors?.authPassword ? "error" : undefined}
          onSubmitEditing={next}
          RightAccessory={PasswordRightAccessory}
        />
      )}

      <Button
        testID="next-button"
        tx="profileScreen.next"
        style={$nextButton}
        preset="reversed"
        onPress={next}
      />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.huge,
  paddingHorizontal: spacing.large,
}

const $signIn: TextStyle = {
  marginBottom: spacing.small,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.large,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.medium,
}

const $textField: ViewStyle = {
  marginBottom: spacing.large,
}

// @demo remove-file
const win = Dimensions.get("window")
const $signButton: ViewStyle = {
  marginTop: win.height * 0.2,
  backgroundColor: colors.signbackground,
  borderColor: colors.buttonborder,
  borderWidth: 2,
  borderRadius: 10,
  marginLeft: "5%",
  width: "90%",
}
const $nextButton: ViewStyle = {
  marginTop: win.height * 0.25,
  backgroundColor: colors.nextbackground,
}
