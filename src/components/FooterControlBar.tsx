import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AppTheme } from '../theme/theme';
import { useTheme } from '../theme/ThemeProvider';
import { MaterialIcon } from './icons/MaterialIcon';

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
  const effectivePeriod = useAppStore((state) => state.effectivePeriod());
  const togglePeriod = useAppStore((state) => state.togglePeriod);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSecondary,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + 6,
        },
      ]}
    >
      <FooterButton icon="search" label="Search" theme={theme} onPress={onOpenSearch} />
      <FooterButton icon="calendar-month" label="Date" theme={theme} onPress={onOpenDatePicker} />
      <FooterButton
        icon={effectivePeriod === 'am' ? 'light-mode' : 'dark-mode'}
        label={effectivePeriod === 'am' ? 'Morning' : 'Evening'}
        theme={theme}
        onPress={togglePeriod}
      />
      <FooterButton icon="settings" label="Settings" theme={theme} onPress={onOpenSettings} />
      <FooterButton icon="bookmark" label="Saved" theme={theme} onPress={onOpenBookmarks} />
    </View>
  );
}

function FooterButton({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: Parameters<typeof MaterialIcon>[0]['name'];
  label: string;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <MaterialIcon name={icon} size={24} color={theme.textSecondary} />
      <Text style={[styles.buttonText, { color: theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
