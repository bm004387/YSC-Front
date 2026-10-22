import React, { PropsWithChildren, useContext } from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
} from 'react-native-safe-area-context';
import type { Edge, EdgeInsets, Rect } from 'react-native-safe-area-context';

const fallbackInsets: EdgeInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const fallbackFrame: Rect = {
  x: 0,
  y: 0,
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const safeAreaInsets = initialWindowMetrics?.insets ?? fallbackInsets;
const safeAreaFrame = initialWindowMetrics?.frame ?? fallbackFrame;

/** Supplies initial safe-area metrics without mounting the native event-emitting provider. */
export function AppSafeAreaProvider({ children }: PropsWithChildren) {
  return (
    <SafeAreaFrameContext.Provider value={safeAreaFrame}>
      <SafeAreaInsetsContext.Provider value={safeAreaInsets}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </SafeAreaFrameContext.Provider>
  );
}

interface AppSafeAreaViewProps extends ViewProps {
  edges?: Edge[];
}

function resolvePadding(style: ViewStyle | undefined, edge: Edge): number {
  if (!style) return 0;

  const specificPadding = style[`padding${edge[0].toUpperCase()}${edge.slice(1)}` as keyof ViewStyle];
  const axisPadding = edge === 'top' || edge === 'bottom'
    ? style.paddingVertical
    : style.paddingHorizontal;
  const padding = specificPadding ?? axisPadding ?? style.padding;

  return typeof padding === 'number' ? padding : 0;
}

/** Adds device insets to a View while keeping the existing additive SafeAreaView behavior. */
export function AppSafeAreaView({
  children,
  edges = ['top', 'right', 'bottom', 'left'],
  style,
  ...props
}: AppSafeAreaViewProps) {
  const insets = useContext(SafeAreaInsetsContext) ?? safeAreaInsets;
  const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
  const insetStyle: ViewStyle = {
    paddingTop: edges.includes('top')
      ? resolvePadding(flattenedStyle, 'top') + insets.top
      : undefined,
    paddingRight: edges.includes('right')
      ? resolvePadding(flattenedStyle, 'right') + insets.right
      : undefined,
    paddingBottom: edges.includes('bottom')
      ? resolvePadding(flattenedStyle, 'bottom') + insets.bottom
      : undefined,
    paddingLeft: edges.includes('left')
      ? resolvePadding(flattenedStyle, 'left') + insets.left
      : undefined,
  };

  return (
    <View {...props} style={[style as StyleProp<ViewStyle>, insetStyle]}>
      {children}
    </View>
  );
}
