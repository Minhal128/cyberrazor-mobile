import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { AuthProvider } from "./src/store/AuthContext";
export default function App() {

  useEffect(() => {
    // Try to auto-configure MCP host so physical devices can reach the dev machine.
    // Priority:
    // 1) If running under Expo in development, read debuggerHost from Constants and set global.MCP_HOST
    // 2) You can manually set `global.MCP_HOST = 'http://192.168.x.y:3333'` here (uncomment) for APKs
    try {
      const Constants = require("expo-constants");
      const manifest = Constants.manifest || Constants.expoConfig || {};
      const dbg =
        manifest.debuggerHost ||
        (manifest.packagerOpts && manifest.packagerOpts.packagerHost) ||
        manifest.hostUri;
      if (dbg && typeof dbg === "string") {
        const ip = dbg.split(":")[0];
        if (ip && ip !== "localhost" && ip !== "127.0.0.1") {
          global.MCP_HOST = `http://${ip}:3333`;
          console.log(
            "[App] Set global.MCP_HOST from Expo debuggerHost ->",
            global.MCP_HOST,
          );
        }
      }
    } catch (err) {
      // expo-constants not available or not running under expo; leave global.MCP_HOST for manual override.
    }

    // If you're running a standalone APK on a device, you can hardcode your dev machine IP here:
    // global.MCP_HOST = 'http://192.168.1.5:3333'; // <-- replace with your PC LAN IP
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SafeAreaView style={styles.appContainer}>
            <RootNavigator />
            <StatusBar style="light" />
          </SafeAreaView>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
});
