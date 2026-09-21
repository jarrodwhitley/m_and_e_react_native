import { useCallback, useEffect, useRef } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

export type WheelPickerOption<T extends string | number> = {
  value: T;
  label: string;
};

type WheelPickerProps<T extends string | number> = {
  options: WheelPickerOption<T>[];
  selectedValue: T | null;
  onChange: (value: T) => void;
  textColor: string;
  highlightColor: string;
};

export function WheelPicker<T extends string | number>({
  options,
  selectedValue,
  onChange,
  textColor,
  highlightColor,
}: WheelPickerProps<T>) {
  const listRef = useRef<FlatList<WheelPickerOption<T>>>(null);
  const isSettling = useRef(false);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue),
  );

  // Keep the wheel in sync when the option list changes underneath us (e.g. month switch),
  // without fighting the user's own in-progress scroll gesture.
  useEffect(() => {
    if (isSettling.current) {
      return;
    }
    listRef.current?.scrollToOffset({ offset: selectedIndex * ITEM_HEIGHT, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const commitIndex = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), options.length - 1);
      const option = options[clamped];
      if (option && option.value !== selectedValue) {
        onChange(option.value);
      }
    },
    [options, selectedValue, onChange],
  );

  const handleMomentumEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      isSettling.current = false;
      const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      commitIndex(index);
    },
    [commitIndex],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WheelPickerOption<T>>) => {
      const isSelected = item.value === selectedValue;
      return (
        <View style={styles.item}>
          <Text style={[styles.itemText, { color: isSelected ? textColor : `${textColor}88` }]}>{item.label}</Text>
        </View>
      );
    },
    [selectedValue, textColor],
  );

  return (
    <View style={[styles.container, { height: CONTAINER_HEIGHT }]}>
      <View pointerEvents="none" style={[styles.highlight, { top: PADDING, borderColor: highlightColor }]} />
      <FlatList
        ref={listRef}
        data={options}
        keyExtractor={(option) => String(option.value)}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        initialScrollIndex={selectedIndex}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PADDING }}
        onScrollBeginDrag={() => {
          isSettling.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={(event) => {
          // Covers the case where the user drags slowly enough that no momentum phase fires.
          if (!isSettling.current) {
            return;
          }
          handleMomentumEnd(event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 17,
  },
});
