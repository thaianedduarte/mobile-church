import { StyleSheet, Text, View } from 'react-native';
import { Svg, Rect, G } from 'react-native-svg';

interface QRCodeProps {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
}

// Simple QR code renderer that creates a random-looking pattern
// In a real app, you would use a proper QR code generation library
export default function QRCode({ 
  value, 
  size,
  color = '#000000', 
  backgroundColor = '#FFFFFF' 
}: QRCodeProps) {
  // Use the value string to seed the pattern generation
  const seed = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Grid size (modules)
  const gridSize = 25;
  const cellSize = size / gridSize;
  
  // Generate pattern based on value
  const generatePattern = () => {
    const pattern = [];
    let seedValue = seed;
    
    // Fixed pattern for finder patterns (corners)
    // Top-left finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          (i === 0 || i === 6 || j === 0 || j === 6) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          pattern.push({
            x: i * cellSize,
            y: j * cellSize,
            size: cellSize,
          });
        }
      }
    }
    
    // Top-right finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          (i === 0 || i === 6 || j === 0 || j === 6) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          pattern.push({
            x: (gridSize - 7 + i) * cellSize,
            y: j * cellSize,
            size: cellSize,
          });
        }
      }
    }
    
    // Bottom-left finder pattern
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          (i === 0 || i === 6 || j === 0 || j === 6) ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          pattern.push({
            x: i * cellSize,
            y: (gridSize - 7 + j) * cellSize,
            size: cellSize,
          });
        }
      }
    }
    
    // Generate data cells (pseudo-random based on the seed)
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Skip areas that are part of the finder patterns
        if (
          (i < 7 && j < 7) || // Top-left
          (i >= gridSize - 7 && j < 7) || // Top-right
          (i < 7 && j >= gridSize - 7) // Bottom-left
        ) {
          continue;
        }
        
        // Use a simple algorithm to determine if a cell should be filled
        seedValue = (seedValue * 1103515245 + 12345) % 2147483647;
        if (seedValue % 3 === 0) {
          pattern.push({
            x: i * cellSize,
            y: j * cellSize,
            size: cellSize,
          });
        }
      }
    }
    
    return pattern;
  };

  const cells = generatePattern();

  return (
    <View style={[
      styles.container,
      { 
        width: size, 
        height: size,
        backgroundColor: backgroundColor 
      }
    ]}>
      <Svg width={size} height={size}>
        {cells.map((cell, index) => (
          <Rect
            key={`cell-${index}`}
            x={cell.x}
            y={cell.y}
            width={cell.size}
            height={cell.size}
            fill={color}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
});