import { BottomSheetFlatList, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { DevotionalEntry, Period } from '../../types/devotional';
import { PanelSheet } from './PanelSheet';

type SearchPanelProps = {
  onSelectResult: (date: string, time: Period) => void;
};

function firstParagraph(body: DevotionalEntry['body']) {
  const paragraph = body.find((item) => item.type === 'paragraph') || body[0];
  return paragraph?.content ?? '';
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
    <PanelSheet ref={ref} title="Search" hasTextInput>
      <View style={styles.searchInputWrapper}>
        <BottomSheetTextInput
          value={searchQuery}
          onChangeText={runSearch}
          placeholder="Search verses, topics, or text"
          placeholderTextColor={theme.textMuted ?? theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary, borderColor: theme.border },
          ]}
        />
      </View>

      <BottomSheetFlatList
        data={searchResults}
        keyExtractor={(item) => `${item.date}:${item.time}`}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          searchQuery.trim() ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No results found.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.resultRow, { borderColor: theme.border }]}
            onPress={() => onSelectResult(item.date, item.time as Period)}
          >
            <Text style={[styles.resultVerse, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.keyVerseNoRef || item.keyverse}
            </Text>
            <Text style={[styles.resultPreview, { color: theme.textSecondary }]} numberOfLines={2}>
              {firstParagraph(item.body)}
            </Text>
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
  },
  resultRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultVerse: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultPreview: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
