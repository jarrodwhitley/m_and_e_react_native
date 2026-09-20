import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/ThemeProvider';

export function Body() {
  const { theme } = useTheme();
  const devotional = useAppStore((state) => state.activeDevotional());
  const fontSize = useAppStore((state) => state.fontSize);

  if (!devotional) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textSecondary }}>No devotional found for this date.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.keyverse, { color: theme.accentPrimaryDark ?? theme.accentPrimary, fontSize: fontSize + 3 }]}>
        {devotional.keyverse}
      </Text>

      {devotional.body.map((paragraph, index) => (
        <Text
          key={index}
          style={[
            paragraph.type === 'poetry' ? styles.poetry : styles.paragraph,
            { color: theme.textPrimary, fontSize },
          ]}
        >
          {paragraph.content}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  keyverse: {
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 26,
  },
  paragraph: {
    marginBottom: 14,
    lineHeight: 26,
  },
  poetry: {
    marginBottom: 14,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
