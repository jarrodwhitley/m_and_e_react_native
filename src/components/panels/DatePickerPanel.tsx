import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { Period } from '../../types/devotional';
import { WheelPicker } from '../WheelPicker';
import { PanelSheet } from './PanelSheet';

type DatePickerPanelProps = {
  onSelectDate: (date: string, time: Period) => void;
  onGoToday: () => void;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildMonthToDaysMap(availableDates: string[]): Map<number, number[]> {
  const map = new Map<number, number[]>();

  for (const rawDate of availableDates) {
    const [rawMonth, rawDay] = rawDate.split('-');
    const month = Number(rawMonth);
    const day = Number(rawDay);
    if (!month || !day) {
      continue;
    }

    const days = map.get(month) ?? [];
    if (!days.includes(day)) {
      days.push(day);
      days.sort((a, b) => a - b);
    }
    map.set(month, days);
  }

  return map;
}

export const DatePickerPanel = forwardRef<BottomSheetModal, DatePickerPanelProps>(function DatePickerPanel(
  { onSelectDate, onGoToday },
  ref,
) {
  const { theme } = useTheme();
  const availableDates = useAppStore((state) => state.availableDates());
  const currentDate = useAppStore((state) => state.effectiveDate());
  const currentPeriod = useAppStore((state) => state.effectivePeriod());

  const monthToDaysMap = useMemo(() => buildMonthToDaysMap(availableDates), [availableDates]);
  const monthOptions = useMemo(() => [...monthToDaysMap.keys()].sort((a, b) => a - b), [monthToDaysMap]);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('am');

  useEffect(() => {
    const [rawMonth, rawDay] = currentDate.split('-');
    const month = Number(rawMonth);
    const day = Number(rawDay);

    if (month && day && monthToDaysMap.get(month)?.includes(day)) {
      setSelectedMonth(String(month));
      setSelectedDay(String(day));
    } else {
      const firstMonth = monthOptions[0] ?? null;
      const firstDay = firstMonth ? (monthToDaysMap.get(firstMonth)?.[0] ?? null) : null;
      setSelectedMonth(firstMonth ? String(firstMonth) : null);
      setSelectedDay(firstDay ? String(firstDay) : null);
    }

    setSelectedPeriod(currentPeriod);
    // Only re-initialize when the panel's underlying data changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthToDaysMap]);

  const dayOptions = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }
    return monthToDaysMap.get(Number(selectedMonth)) ?? [];
  }, [monthToDaysMap, selectedMonth]);

  useEffect(() => {
    if (!dayOptions.length) {
      setSelectedDay(null);
      return;
    }
    if (!selectedDay || !dayOptions.includes(Number(selectedDay))) {
      setSelectedDay(String(dayOptions[0]));
    }
    // Only re-run when the available day list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOptions]);

  function handleJumpToDate() {
    if (!selectedMonth || !selectedDay) {
      return;
    }
    onSelectDate(`${Number(selectedMonth)}-${Number(selectedDay)}`, selectedPeriod);
  }

  return (
    <PanelSheet ref={ref} title="Date" snapPoints={['48%']} enableContentPanningGesture={false}>
      <View style={styles.content}>
        <View style={styles.pickerRow}>
          <View style={styles.monthPicker}>
            <WheelPicker
              options={monthOptions.map((month) => ({ value: String(month), label: MONTH_NAMES[month - 1] }))}
              selectedValue={selectedMonth}
              onChange={setSelectedMonth}
              textColor={theme.textPrimary}
              highlightColor={theme.border}
            />
          </View>
          <View style={styles.dayPicker}>
            <WheelPicker
              options={dayOptions.map((day) => ({ value: String(day), label: String(day) }))}
              selectedValue={selectedDay}
              onChange={setSelectedDay}
              textColor={theme.textPrimary}
              highlightColor={theme.border}
            />
          </View>
        </View>

        <View style={[styles.periodRow, { backgroundColor: theme.segmentedBackground }]}>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === 'am' && { backgroundColor: theme.buttonPrimary },
            ]}
            onPress={() => setSelectedPeriod('am')}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: selectedPeriod === 'am' ? theme.buttonPrimaryText : theme.segmentedText },
              ]}
            >
              Morning
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.periodButton,
              selectedPeriod === 'pm' && { backgroundColor: theme.buttonPrimary },
            ]}
            onPress={() => setSelectedPeriod('pm')}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: selectedPeriod === 'pm' ? theme.buttonPrimaryText : theme.segmentedText },
              ]}
            >
              Evening
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.buttonPrimary }]}
          onPress={handleJumpToDate}
        >
          <Text style={[styles.primaryButtonText, { color: theme.buttonPrimaryText }]}>Jump To Date</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, { backgroundColor: theme.buttonSecondaryBackground }]}
          onPress={onGoToday}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.buttonSecondaryText }]}>Go To Today</Text>
        </Pressable>
      </View>
    </PanelSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  monthPicker: {
    flex: 1.2,
  },
  dayPicker: {
    flex: 0.8,
  },
  periodRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
