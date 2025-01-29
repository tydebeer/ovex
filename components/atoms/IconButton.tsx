// For the close (✕) and chevron (›) buttons
import { Text, Pressable, StyleSheet } from 'react-native';

export const IconButton = ({ 
  icon, 
  onPress, 
  rotate 
}: { 
  icon: string; 
  onPress: () => void; 
  rotate?: boolean;
}) => (
  <Pressable 
    onPress={onPress} 
    style={[styles.container, rotate && styles.rotated]}
  >
    <Text style={styles.icon}>{icon}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotated: {
    transform: [{ rotate: '90deg' }],
  },
  icon: {
    fontSize: 20,
    color: '#666',
  },
}); 