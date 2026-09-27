import { Fragment } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

// A custom tabBar, not a fourth Tabs.Screen: the "+" needs to sit between
// budget and reports as its own flex slot, the same width as the three real
// tabs, so it can never overlap the button under it. The default tab bar has
// no way to interleave a non-route button between two routes like that.
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      className="flex-row items-center bg-white px-6 pt-3.5"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        paddingBottom: Math.max(insets.bottom, 20),
        minHeight: 100,
      }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const tabButton = (
          <TouchableOpacity
            key={route.key}
            testID={`tab-button-${route.name}`}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            activeOpacity={1}
            className="flex-1 items-center justify-center">
            {options.tabBarIcon?.({ focused: isFocused, color: '', size: 24 })}
          </TouchableOpacity>
        );

        if (route.name !== 'budget') {
          return tabButton;
        }

        return (
          <Fragment key={`${route.key}-and-add`}>
            {tabButton}
            <View className="flex-1 items-center justify-center">
              <TouchableOpacity
                testID="tab-button-add-expense"
                onPress={() => router.push('/add-expense')}
                accessibilityRole="button"
                accessibilityLabel="Agregar gasto"
                activeOpacity={0.8}
                className="h-10 w-14 items-center justify-center rounded-lg bg-gray-800 shadow-lg">
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}
