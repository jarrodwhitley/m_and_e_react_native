import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';

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
  const effectiveDate = useAppStore((state) => state.effectiveDate());
  const effectivePeriod = useAppStore((state) => state.effectivePeriod());

  return (
    <View style={[styles.container, { backgroundColor: theme.headerGradientStart, borderBottomColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Morning &amp; Evening</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {formatDisplayDate(effectiveDate)} · {effectivePeriod === 'am' ? 'Morning' : 'Evening'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
