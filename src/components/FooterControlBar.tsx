import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';

type FooterControlBarProps = {
  onOpenSearch: () => void;
  onOpenDatePicker: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
};

export function FooterControlBar({
  onOpenSearch,
  onOpenDatePicker,
  onOpenBookmarks,
  onOpenSettings,
}: FooterControlBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const effectiveDate = useAppStore((state) => state.effectiveDate());
  const effectivePeriod = useAppStore((state) => state.effectivePeriod());
  const togglePeriod = useAppStore((state) => state.togglePeriod);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const isBookmarked = useAppStore((state) => state.isBookmarked(effectiveDate, effectivePeriod));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + 10,
        },
      ]}
    >
      <FooterButton label="Search" theme={theme} onPress={onOpenSearch} />
      <FooterButton label="Date" theme={theme} onPress={onOpenDatePicker} />
      <FooterButton
        label={effectivePeriod === 'am' ? 'AM' : 'PM'}
        theme={theme}
        onPress={togglePeriod}
      />
      <FooterButton
        label={isBookmarked ? 'Saved' : 'Save'}
        theme={theme}
        onPress={() => toggleBookmark(effectiveDate, effectivePeriod)}
      />
      <FooterButton label="Bookmarks" theme={theme} onPress={onOpenBookmarks} />
      <FooterButton label="Menu" theme={theme} onPress={onOpenSettings} />
    </View>
  );
}

function FooterButton({
  label,
  theme,
  onPress,
}: {
  label: string;
  theme: { buttonSecondaryBackground: string; buttonSecondaryText: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, { backgroundColor: theme.buttonSecondaryBackground }]}
    >
      <Text style={[styles.buttonText, { color: theme.buttonSecondaryText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
