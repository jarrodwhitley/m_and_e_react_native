import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Body } from './src/components/Body';
import { FooterControlBar } from './src/components/FooterControlBar';
import { Header } from './src/components/Header';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { BookmarksPanel } from './src/components/panels/BookmarksPanel';
import { DatePickerPanel } from './src/components/panels/DatePickerPanel';
import { SearchPanel } from './src/components/panels/SearchPanel';
import { SettingsPanel } from './src/components/panels/SettingsPanel';
import { useAppStore } from './src/store/useAppStore';
import { Period } from './src/types/devotional';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

const DATE_REFRESH_INTERVAL_MS = 60000;

function AppContent() {
  const { theme, themeName } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const initializeDateContext = useAppStore((state) => state.initializeDateContext);
  const loadBookmarksFromStorage = useAppStore((state) => state.loadBookmarksFromStorage);
  const openDevotional = useAppStore((state) => state.openDevotional);

  const searchSheetRef = useRef<BottomSheetModal>(null);
  const dateSheetRef = useRef<BottomSheetModal>(null);
  const bookmarksSheetRef = useRef<BottomSheetModal>(null);
  const settingsSheetRef = useRef<BottomSheetModal>(null);

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

  const handleSelectDevotional = useCallback(
    (date: string, time: Period) => {
      openDevotional(date, time);
      searchSheetRef.current?.dismiss();
      dateSheetRef.current?.dismiss();
      bookmarksSheetRef.current?.dismiss();
    },
    [openDevotional],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={themeName === 'morning' ? 'dark' : 'light'} />
      <Header />
      <Body />
      <FooterControlBar
        onOpenSearch={() => searchSheetRef.current?.present()}
        onOpenDatePicker={() => dateSheetRef.current?.present()}
        onOpenBookmarks={() => bookmarksSheetRef.current?.present()}
        onOpenSettings={() => settingsSheetRef.current?.present()}
      />
      {isLoading && <LoadingOverlay />}

      <SearchPanel ref={searchSheetRef} onSelectResult={handleSelectDevotional} />
      <DatePickerPanel ref={dateSheetRef} onSelectDate={handleSelectDevotional} />
      <BookmarksPanel ref={bookmarksSheetRef} onSelectBookmark={handleSelectDevotional} />
      <SettingsPanel ref={settingsSheetRef} />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <AppContent />
          </BottomSheetModalProvider>
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
