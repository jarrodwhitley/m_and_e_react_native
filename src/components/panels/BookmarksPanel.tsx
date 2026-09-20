import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BookmarkedDevotional, computeBookmarkedDevotionals, useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Period } from '../../types/devotional';
import { PanelSheet } from './PanelSheet';

type BookmarksPanelProps = {
  onSelectBookmark: (date: string, time: Period) => void;
};

export const BookmarksPanel = forwardRef<BottomSheetModal, BookmarksPanelProps>(function BookmarksPanel(
  { onSelectBookmark },
  ref,
) {
  const { theme } = useTheme();
  const rawBookmarks = useAppStore((state) => state.bookmarks);
  const bookmarks = useMemo(() => computeBookmarkedDevotionals(rawBookmarks), [rawBookmarks]);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);

  return (
    <PanelSheet ref={ref} title="Bookmarks">
      <BottomSheetFlatList<BookmarkedDevotional>
        data={bookmarks}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No bookmarks saved yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Pressable
              style={styles.rowContent}
              onPress={() => onSelectBookmark(item.date, item.time as Period)}
            >
              <Text style={[styles.verse, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.keyverse}
              </Text>
              <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.preview}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.removeButton, { backgroundColor: theme.buttonSecondaryBackground }]}
              onPress={() => toggleBookmark(item.date, item.time)}
            >
              <Text style={[styles.removeButtonText, { color: theme.buttonSecondaryText }]}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowContent: {
    marginBottom: 8,
  },
  verse: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
});
