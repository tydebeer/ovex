import { View, StyleSheet } from 'react-native';

export const SearchIcon = ({ color = '#666', size = 16 }: { color?: string; size?: number }) => (
  <View style={[styles.container, { width: size, height: size }]}>
    <View 
      style={[
        styles.circle, 
        { 
          borderColor: color,
          width: size * 0.7,
          height: size * 0.7,
          borderWidth: size * 0.1,
        }
      ]} 
    />
    <View 
      style={[
        styles.handle, 
        { 
          backgroundColor: color,
          width: size * 0.1,
          height: size * 0.4,
          right: size * 0.1,
          bottom: size * 0.1,
          transform: [{ rotate: '45deg' }],
        }
      ]} 
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  circle: {
    borderRadius: 100,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  handle: {
    position: 'absolute',
    borderRadius: 100,
  },
}); 