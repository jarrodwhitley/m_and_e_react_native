import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Body } from './src/components/Body';
import { FooterControlBar } from './src/components/FooterControlBar';
import { Header } from './src/components/Header';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { useAppStore } from './src/store/useAppStore';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

const DATE_REFRESH_INTERVAL_MS = 60000;

function AppContent() {
  const { theme, themeName } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const initializeDateContext = useAppStore((state) => state.initializeDateContext);
  const loadBookmarksFromStorage = useAppStore((state) => state.loadBookmarksFromStorage);

  useEffect(() => {
    initializeDateContext();
    loadBookmarksFromStorage();

    const loadingTimer = setTimeout(() => setIsLoading(false), 800);
    const dateTimer = setInterval(initializeDateContext, DATE_REFRESH_INTERVAL_MS);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(dateTimer);
    };
  }, [initializeDateContext, loadBookmarksFromStorage]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeName === 'morning' ? 'dark' : 'light'} />
      <Header />
      <Body />
      <FooterControlBar
        onOpenSearch={() => {}}
        onOpenDatePicker={() => {}}
        onOpenBookmarks={() => {}}
        onOpenSettings={() => {}}
      />
      {isLoading && <LoadingOverlay />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
