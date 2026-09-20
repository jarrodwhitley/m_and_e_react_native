import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { ThemePreference } from '../../types/devotional';
import { PanelSheet } from './PanelSheet';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const MIN_FONT_SIZE = 13;
const MAX_FONT_SIZE = 24;

export const SettingsPanel = forwardRef<BottomSheetModal>(function SettingsPanel(_props, ref) {
  const { theme } = useTheme();
  const themePreference = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);
  const resetSettings = useAppStore((state) => state.resetSettings);
  const clearBookmarks = useAppStore((state) => state.clearBookmarks);

  return (
    <PanelSheet ref={ref} title="Settings">
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Appearance</Text>
        <View style={[styles.segmented, { backgroundColor: theme.segmentedBackground }]}>
          {THEME_OPTIONS.map((option) => {
            const isActive = option.value === themePreference;
            return (
              <Pressable
                key={option.value}
                style={[styles.segmentedOption, isActive && { backgroundColor: theme.buttonPrimary }]}
                onPress={() => setTheme(option.value)}
              >
                <Text
                  style={[
                    styles.segmentedText,
                    { color: isActive ? theme.buttonPrimaryText : theme.segmentedText },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 24 }]}>Text Size</Text>
        <View style={styles.fontSizeRow}>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: theme.buttonSecondaryBackground }]}
            onPress={() => setFontSize(Math.max(MIN_FONT_SIZE, fontSize - 1))}
          >
            <Text style={[styles.stepperText, { color: theme.buttonSecondaryText }]}>−</Text>
          </Pressable>
          <View style={[styles.fontSizeBadge, { backgroundColor: theme.textSizeBadgeBackground }]}>
            <Text style={[styles.fontSizeBadgeText, { color: theme.textSizeBadgeText }]}>{fontSize}</Text>
          </View>
          <Pressable
            style={[styles.stepperButton, { backgroundColor: theme.buttonSecondaryBackground }]}
            onPress={() => setFontSize(Math.min(MAX_FONT_SIZE, fontSize + 1))}
          >
            <Text style={[styles.stepperText, { color: theme.buttonSecondaryText }]}>+</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.supportRow, { backgroundColor: theme.supportRowBackground, borderColor: theme.supportRowBorder }]}
          onPress={resetSettings}
        >
          <Text style={[styles.supportRowText, { color: theme.supportRowText }]}>Reset text size</Text>
        </Pressable>

        <Pressable
          style={[styles.supportRow, { backgroundColor: theme.supportRowBackground, borderColor: theme.supportRowBorder }]}
          onPress={clearBookmarks}
        >
          <Text style={[styles.supportRowText, { color: theme.supportRowText }]}>Clear all bookmarks</Text>
        </Pressable>
      </BottomSheetScrollView>
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 20,
    fontWeight: '600',
  },
  fontSizeBadge: {
    marginHorizontal: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  fontSizeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportRow: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  supportRowText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
