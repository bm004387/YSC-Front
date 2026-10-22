import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import styles from '../../styles/community';

interface CommunityZoomImageProps {
  uri: string;
  headers: Record<string, string>;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

interface TouchPoint {
  locationX: number;
  locationY: number;
}

interface ZoomGestureState {
  mode: 'pinch' | 'pan';
  startDistance: number;
  startScale: number;
  startTranslateX: number;
  startTranslateY: number;
  startCenterX: number;
  startCenterY: number;
  startPanDx: number;
  startPanDy: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function getTouches(event: {
  nativeEvent: { touches: readonly TouchPoint[] };
}) {
  return event.nativeEvent.touches;
}

function getDistance(first: TouchPoint, second: TouchPoint) {
  const deltaX = second.locationX - first.locationX;
  const deltaY = second.locationY - first.locationY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getCenter(first: TouchPoint, second: TouchPoint) {
  return {
    x: (first.locationX + second.locationX) / 2,
    y: (first.locationY + second.locationY) / 2,
  };
}

function CommunityZoomImage({
  uri,
  headers,
  accessibilityLabel,
  style,
}: CommunityZoomImageProps) {
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(MIN_SCALE);
  const translateXValue = useRef(0);
  const translateYValue = useRef(0);
  const viewportSize = useRef({ width: 0, height: 0 });
  const gesture = useRef<ZoomGestureState | null>(null);

  const setZoom = useCallback(
    (nextScale: number, nextX: number, nextY: number) => {
      const boundedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      const { width, height } = viewportSize.current;
      const maxX = (width * (boundedScale - MIN_SCALE)) / 2;
      const maxY = (height * (boundedScale - MIN_SCALE)) / 2;
      const boundedX = Math.min(maxX, Math.max(-maxX, nextX));
      const boundedY = Math.min(maxY, Math.max(-maxY, nextY));

      scaleValue.current = boundedScale;
      translateXValue.current = boundedX;
      translateYValue.current = boundedY;
      scale.setValue(boundedScale);
      translateX.setValue(boundedX);
      translateY.setValue(boundedY);
    },
    [scale, translateX, translateY],
  );

  const resetZoom = useCallback(() => {
    scaleValue.current = MIN_SCALE;
    translateXValue.current = 0;
    translateYValue.current = 0;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: MIN_SCALE,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0,
      }),
    ]).start();
  }, [scale, translateX, translateY]);

  useEffect(() => {
    resetZoom();
  }, [resetZoom, uri]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: event =>
        getTouches(event).length >= 2 || scaleValue.current > MIN_SCALE,
      onMoveShouldSetPanResponderCapture: event =>
        getTouches(event).length >= 2 || scaleValue.current > MIN_SCALE,
      onPanResponderGrant: event => {
        const touches = getTouches(event);
        if (touches.length >= 2) {
          const center = getCenter(touches[0], touches[1]);
          gesture.current = {
            mode: 'pinch',
            startDistance: Math.max(1, getDistance(touches[0], touches[1])),
            startScale: scaleValue.current,
            startTranslateX: translateXValue.current,
            startTranslateY: translateYValue.current,
            startCenterX: center.x,
            startCenterY: center.y,
            startPanDx: 0,
            startPanDy: 0,
          };
          return;
        }

        gesture.current = {
          mode: 'pan',
          startDistance: 0,
          startScale: scaleValue.current,
          startTranslateX: translateXValue.current,
          startTranslateY: translateYValue.current,
          startCenterX: 0,
          startCenterY: 0,
          startPanDx: 0,
          startPanDy: 0,
        };
      },
      onPanResponderMove: (event, state) => {
        const touches = getTouches(event);
        const currentGesture = gesture.current;

        if (touches.length >= 2) {
          if (!currentGesture || currentGesture.mode !== 'pinch') {
            const center = getCenter(touches[0], touches[1]);
            gesture.current = {
              mode: 'pinch',
              startDistance: Math.max(1, getDistance(touches[0], touches[1])),
              startScale: scaleValue.current,
              startTranslateX: translateXValue.current,
              startTranslateY: translateYValue.current,
              startCenterX: center.x,
              startCenterY: center.y,
              startPanDx: 0,
              startPanDy: 0,
            };
            return;
          }

          const center = getCenter(touches[0], touches[1]);
          const nextScale = Math.min(
            MAX_SCALE,
            Math.max(
              MIN_SCALE,
              currentGesture.startScale *
                (getDistance(touches[0], touches[1]) /
                  currentGesture.startDistance),
            ),
          );
          const scaleRatio = nextScale / currentGesture.startScale;
          const nextX =
            center.x -
            (currentGesture.startCenterX - currentGesture.startTranslateX) *
              scaleRatio;
          const nextY =
            center.y -
            (currentGesture.startCenterY - currentGesture.startTranslateY) *
              scaleRatio;
          setZoom(nextScale, nextX, nextY);
          return;
        }

        if (scaleValue.current <= MIN_SCALE || !currentGesture) return;
        if (currentGesture.mode === 'pinch') {
          gesture.current = {
            ...currentGesture,
            mode: 'pan',
            startScale: scaleValue.current,
            startTranslateX: translateXValue.current,
            startTranslateY: translateYValue.current,
            startPanDx: state.dx,
            startPanDy: state.dy,
          };
          return;
        }

        setZoom(
          currentGesture.startScale,
          currentGesture.startTranslateX + state.dx - currentGesture.startPanDx,
          currentGesture.startTranslateY + state.dy - currentGesture.startPanDy,
        );
      },
      onPanResponderRelease: () => {
        gesture.current = null;
        if (scaleValue.current < 1.03) resetZoom();
      },
      onPanResponderTerminate: () => {
        gesture.current = null;
        if (scaleValue.current < 1.03) resetZoom();
      },
      onPanResponderTerminationRequest: event =>
        getTouches(event).length < 2 &&
        gesture.current?.mode !== 'pinch' &&
        scaleValue.current <= MIN_SCALE,
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.zoomImageViewport, style]}
      onLayout={({ nativeEvent }) => {
        viewportSize.current = {
          width: nativeEvent.layout.width,
          height: nativeEvent.layout.height,
        };
      }}
      {...responder.panHandlers}
    >
      <Animated.Image
        source={{ uri, headers }}
        style={[
          styles.zoomImage,
          {
            transform: [{ translateX }, { translateY }, { scale }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

export default CommunityZoomImage;
