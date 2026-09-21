import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SearchResult, useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Period } from '../../types/devotional';
import { PanelSheet } from './PanelSheet';

type SearchPanelProps = {
  onSelectResult: (date: string, time: Period) => void;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDatePeriod(date: string, time: string): string {
  const [rawMonth, rawDay] = date.split('-');
  const month = Number(rawMonth);
  const day = Number(rawDay);
  const monthLabel = month >= 1 && month <= 12 ? MONTH_NAMES[month - 1] : date;
  const period = time.toLowerCase() === 'pm' ? 'Evening' : 'Morning';
  return `${monthLabel} ${day} — ${period}`;
}

function quoteVerse(text: string): string {
  const normalized = String(text || '').trim().replace(/^"+|"+$/g, '');
  return normalized ? `"${normalized}"` : '';
}

export const SearchPanel = forwardRef<BottomSheetModal, SearchPanelProps>(function SearchPanel(
  { onSelectResult },
  ref,
) {
  const { theme } = useTheme();
  const searchQuery = useAppStore((state) => state.searchQuery);
  const searchResults = useAppStore((state) => state.searchResults);
  const runSearch = useAppStore((state) => state.runSearch);

  return (
    <PanelSheet ref={ref} title="Search Devotionals" hasTextInput>
      <View style={styles.searchInputWrapper}>
        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={runSearch}
          placeholder="Search by keyword"
          placeholderTextColor={theme.textMuted ?? theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border },
          ]}
        />
      </View>

      <BottomSheetFlatList<SearchResult>
        data={searchResults}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            {searchQuery.trim()
              ? 'No devotionals found for this keyword.'
              : 'Type a keyword to search by verse or devotional body text.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.resultItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onSelectResult(item.date, item.time as Period)}
          >
            <Text style={[styles.resultDate, { color: theme.textSecondary }]}>
              {formatDatePeriod(item.date, item.time)}
            </Text>
            <Text style={[styles.resultVerse, { color: theme.textPrimary }]}>{quoteVerse(item.keyverse)}</Text>
            {item.verseRef ? (
              <Text style={[styles.resultRef, { color: theme.textMuted ?? theme.textSecondary }]}>
                {item.verseRef}
              </Text>
            ) : null}
            {item.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {item.tags.map((tag) => (
                  <View
                    key={`${item.key}-${tag}`}
                    style={[
                      styles.tagPill,
                      { backgroundColor: theme.supportRowBackground, borderColor: theme.supportRowBorder },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: theme.supportRowText }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  searchInputWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  resultItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 10,
    gap: 3,
  },
  resultDate: {
    fontSize: 11,
  },
  resultVerse: {
    fontSize: 14,
  },
  resultRef: {
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  hint: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
