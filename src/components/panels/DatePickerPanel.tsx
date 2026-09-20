import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Period } from '../../types/devotional';
import { PanelSheet } from './PanelSheet';

type DatePickerPanelProps = {
  onSelectDate: (date: string, time: Period) => void;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDisplayDate(date: string): string {
  const [month, day] = date.split('-').map(Number);
  if (!month || !day) {
    return date;
  }
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

export const DatePickerPanel = forwardRef<BottomSheetModal, DatePickerPanelProps>(function DatePickerPanel(
  { onSelectDate },
  ref,
) {
  const { theme } = useTheme();
  const availableDates = useAppStore((state) => state.availableDates());
  const effectiveDate = useAppStore((state) => state.effectiveDate());

  return (
    <PanelSheet ref={ref} title="Jump to Date">
      <BottomSheetFlatList
        data={availableDates}
        keyExtractor={(date) => date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: date }) => {
          const isSelected = date === effectiveDate;
          return (
            <View style={[styles.row, { borderColor: theme.border }]}>
              <Text
                style={[
                  styles.dateLabel,
                  { color: isSelected ? theme.selectedText : theme.textPrimary },
                  isSelected && { backgroundColor: theme.selectedBackground },
                ]}
              >
                {formatDisplayDate(date)}
              </Text>
              <View style={styles.periodButtons}>
                <Pressable
                  style={[styles.periodButton, { backgroundColor: theme.buttonSecondaryBackground }]}
                  onPress={() => onSelectDate(date, 'am')}
                >
                  <Text style={[styles.periodButtonText, { color: theme.buttonSecondaryText }]}>AM</Text>
                </Pressable>
                <Pressable
                  style={[styles.periodButton, { backgroundColor: theme.buttonSecondaryBackground }]}
                  onPress={() => onSelectDate(date, 'pm')}
                >
                  <Text style={[styles.periodButtonText, { color: theme.buttonSecondaryText }]}>PM</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateLabel: {
    fontSize: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  periodButtons: {
    flexDirection: 'row',
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
