import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import spurgeonIcon from '../assets/images/spurgeon_icon.png';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';
import { MaterialIcon } from './icons/MaterialIcon';

function formatDisplayDate(date: string): string {
  const [month, day] = date.split('-').map(Number);
  if (!month || !day) {
    return '';
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return `${monthNames[month - 1]} ${day}`;
}

export function Header() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const effectiveDate = useAppStore((state) => state.effectiveDate());
  const effectivePeriod = useAppStore((state) => state.effectivePeriod());
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const isBookmarked = useAppStore((state) => state.isBookmarked(effectiveDate, effectivePeriod));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.headerGradientStart, borderBottomColor: theme.border, paddingTop: insets.top + 12 },
      ]}
    >
      <Image source={spurgeonIcon} style={styles.logo} resizeMode="contain" />

      <View style={styles.titleWrapper}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Morning &amp; Evening</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {formatDisplayDate(effectiveDate)} · {effectivePeriod === 'am' ? 'Morning' : 'Evening'}
        </Text>
      </View>

      <Pressable
        style={styles.bookmarkButton}
        onPress={() => toggleBookmark(effectiveDate, effectivePeriod)}
        hitSlop={8}
      >
        <MaterialIcon
          name={isBookmarked ? 'bookmark-remove' : 'bookmark-add'}
          size={26}
          color={isBookmarked ? theme.accentPrimary : theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    width: 36,
    height: 36,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
