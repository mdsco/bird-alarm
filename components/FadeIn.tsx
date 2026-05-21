import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

type Props = ViewProps & {
  delay?: number;
  duration?: number;
  translateYFrom?: number;
};

/** Fade + slight upward slide on mount. Wrap any block of UI you want to enter. */
export function FadeIn({
  delay = 0,
  duration = 380,
  translateYFrom = 8,
  style,
  children,
  ...rest
}: Props) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      delay,
      duration,
      useNativeDriver: true,
    }).start();
  }, [v, delay, duration]);

  const translateY = v.interpolate({
    inputRange: [0, 1],
    outputRange: [translateYFrom, 0],
  });

  return (
    <Animated.View
      style={[{ opacity: v, transform: [{ translateY }] }, style]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
