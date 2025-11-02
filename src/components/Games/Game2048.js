import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GRID_SIZE = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 160) / 4);

export default function Game2048({ onGameComplete }) {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(true);

  useEffect(() => {
    if (!gameStarted) return;
    initializeBoard();
  }, [gameStarted]);

  const initializeBoard = () => {
    const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (currentBoard) => {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    initializeBoard();
  };

  const handleFinish = () => {
    setGameStarted(false);
    onGameComplete({ score });
  };

  const resetGame = () => {
    initializeBoard();
  };

  const move = (direction) => {
    if (gameOver || !gameStarted) return;

    let result;
    
    switch (direction) {
      case 'left':
        result = swipeLeft(board);
        break;
      case 'right':
        result = swipeRight(board);
        break;
      case 'up':
        result = swipeUp(board);
        break;
      case 'down':
        result = swipeDown(board);
        break;
      default:
        return;
    }

    if (result.moved) {
      setBoard(result.board);
      setScore(prev => prev + result.points);
      setBestScore(prev => Math.max(prev, score + result.points));
      
      setTimeout(() => {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(row => [...row]);
          addRandomTile(newBoard);
          
          if (isGameOver(newBoard)) {
            setGameOver(true);
          }
          
          return newBoard;
        });
      }, 150);
    }
  };

  const swipeLeft = (currentBoard) => {
    let newBoard = currentBoard.map(row => [...row]);
    let moved = false;
    let points = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      let row = newBoard[i].filter(val => val !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          points += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      row = row.filter(val => val !== 0);
      
      while (row.length < GRID_SIZE) {
        row.push(0);
      }
      
      if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      newBoard[i] = row;
    }

    return { board: newBoard, moved, points };
  };

  const swipeRight = (currentBoard) => {
    let newBoard = currentBoard.map(row => [...row].reverse());
    let moved = false;
    let points = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      let row = newBoard[i].filter(val => val !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          points += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      row = row.filter(val => val !== 0);
      
      while (row.length < GRID_SIZE) {
        row.push(0);
      }
      
      if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      newBoard[i] = row.reverse();
    }

    return { board: newBoard, moved, points };
  };

  const swipeUp = (currentBoard) => {
    let newBoard = Array(GRID_SIZE).fill(null).map((_, i) => 
      currentBoard.map(row => row[i])
    );
    let moved = false;
    let points = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      let row = newBoard[i].filter(val => val !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          points += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      row = row.filter(val => val !== 0);
      
      while (row.length < GRID_SIZE) {
        row.push(0);
      }
      
      if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      newBoard[i] = row;
    }

    const transposed = Array(GRID_SIZE).fill(null).map((_, i) => 
      newBoard.map(row => row[i])
    );

    return { board: transposed, moved, points };
  };

  const swipeDown = (currentBoard) => {
    let newBoard = Array(GRID_SIZE).fill(null).map((_, i) => 
      currentBoard.map(row => row[i]).reverse()
    );
    let moved = false;
    let points = 0;

    for (let i = 0; i < GRID_SIZE; i++) {
      let row = newBoard[i].filter(val => val !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          points += row[j];
          row[j + 1] = 0;
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      row = row.filter(val => val !== 0);
      
      while (row.length < GRID_SIZE) {
        row.push(0);
      }
      
      if (JSON.stringify(newBoard[i]) !== JSON.stringify(row)) {
        moved = true;
      }
      
      newBoard[i] = row.reverse();
    }

    const transposed = Array(GRID_SIZE).fill(null).map((_, i) => 
      newBoard.map(row => row[i])
    );

    return { board: transposed, moved, points };
  };

  const isGameOver = (currentBoard) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          return false;
        }
      }
    }

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = currentBoard[i][j];
        if (
          (j < GRID_SIZE - 1 && currentBoard[i][j + 1] === current) ||
          (i < GRID_SIZE - 1 && currentBoard[i + 1][j] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const getCellColor = (value) => {
    const colors = {
      0: { bg1: 'rgba(240, 255, 240, 0.5)', bg2: 'rgba(240, 255, 240, 0.5)', text: '#2E8B57' },
      2: { bg1: '#E8F5E9', bg2: '#C8E6C9', text: '#1B5E20' },
      4: { bg1: '#C8E6C9', bg2: '#A5D6A7', text: '#1B5E20' },
      8: { bg1: '#A5D6A7', bg2: '#81C784', text: '#FFF' },
      16: { bg1: '#81C784', bg2: '#66BB6A', text: '#FFF' },
      32: { bg1: '#66BB6A', bg2: '#4CAF50', text: '#FFF' },
      64: { bg1: '#4CAF50', bg2: '#43A047', text: '#FFF' },
      128: { bg1: '#43A047', bg2: '#388E3C', text: '#FFF' },
      256: { bg1: '#388E3C', bg2: '#2E7D32', text: '#FFF' },
      512: { bg1: '#2E7D32', bg2: '#1B5E20', text: '#FFF' },
      1024: { bg1: '#1B5E20', bg2: '#2E8B57', text: '#FFF' },
      2048: { bg1: '#2E8B57', bg2: '#20C997', text: '#FFF' },
    };

    return colors[value] || { bg1: '#1B5E20', bg2: '#0D4B1F', text: '#FFF' };
  };

  const getFontSize = (value) => {
    if (value >= 1024) return 24;
    if (value >= 512) return 28;
    if (value >= 256) return 32;
    if (value >= 128) return 36;
    if (value >= 64) return 40;
    if (value >= 16) return 44;
    return 48;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const SWIPE_THRESHOLD = 30;
        
        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(dy) > SWIPE_THRESHOLD) {
          if (Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? 'right' : 'left');
          } else {
            move(dy > 0 ? 'down' : 'up');
          }
        }
      },
    })
  ).current;

  const renderCell = (row, col, value) => {
    const colors = getCellColor(value);
    const fontSize = getFontSize(value);
    const key = `${row}-${col}-${value}`;

    if (value === 0) {
      return (
        <View key={key} style={[styles.cell, styles.emptyCell]}>
          <View style={styles.emptyInner} />
        </View>
      );
    }

    return (
      <View key={key} style={styles.cell}>
        <LinearGradient
          colors={[colors.bg1, colors.bg2]}
          style={styles.cellGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0)']}
            style={styles.cellHighlight}
          />
          <Text style={[styles.cellText, { color: colors.text, fontSize }]}>
            {value}
          </Text>
          <View style={styles.cellGlow} />
        </LinearGradient>
      </View>
    );
  };

  const renderRow = (row, rowIdx) => {
    return (
      <View key={rowIdx} style={styles.row}>
        {row.map((cell, colIdx) => renderCell(rowIdx, colIdx, cell))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>2048</Text>
        </View>
        <View style={styles.scores}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Best</Text>
            <Text style={styles.scoreValue}>{bestScore}</Text>
          </View>
        </View>
      </View>

      {!gameStarted ? (
        <View style={styles.startContainer}>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.startButtonGradient}>
              <Ionicons name="play" size={24} color="#FFF" />
              <Text style={styles.startButtonText}>Start Game</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {won && (
            <View style={styles.winOverlay}>
              <Text style={styles.winText}>🎉 You Won!</Text>
              <TouchableOpacity onPress={() => setWon(false)} style={styles.continueButton}>
                <Text style={styles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {gameOver && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverText}>Game Over!</Text>
              <TouchableOpacity onPress={resetGame} style={styles.restartButton}>
                <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.restartButtonGradient}>
                  <Ionicons name="refresh" size={20} color="#FFF" />
                  <Text style={styles.restartButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              👆 Swipe to move tiles 👈 👉 👇
            </Text>
            <Text style={styles.subInstructionText}>
              Merge same numbers to reach 2048
            </Text>
          </View>

          <View style={styles.gameAndControlsContainer}>
            <View style={styles.gameWrapper} {...panResponder.panHandlers}>
              <View style={styles.gameContainer}>
                <View style={styles.grid}>
                  {board.length > 0 && board.map((row, rowIdx) => renderRow(row, rowIdx))}
                </View>
              </View>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.arrowButton} onPress={() => move('up')} activeOpacity={0.7}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.arrowButtonGradient}>
                  <Ionicons name="arrow-up" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.horizontalArrows}>
                <TouchableOpacity style={styles.arrowButton} onPress={() => move('left')} activeOpacity={0.7}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.arrowButtonGradient}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.arrowButton} onPress={() => move('right')} activeOpacity={0.7}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.arrowButtonGradient}>
                    <Ionicons name="arrow-forward" size={24} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.arrowButton} onPress={() => move('down')} activeOpacity={0.7}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.arrowButtonGradient}>
                  <Ionicons name="arrow-down" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
            <LinearGradient colors={['#17A085', '#20C997']} style={styles.doneButtonGradient}>
              <Text style={styles.doneButtonText}>Finish</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 5,
    paddingTop: 2,
    width: '100%',
    backgroundColor: '#F8FFF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E8B57',
    letterSpacing: 1,
  },
  scores: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreBox: {
    backgroundColor: '#2E8B57',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 60,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#EEE4DA',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 2,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gameAndControlsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gameWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gameContainer: {
    width: CELL_SIZE * GRID_SIZE + 24,
    height: CELL_SIZE * GRID_SIZE + 24,
    touchAction: 'pan-y pan-x',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    gap: 4,
  },
  horizontalArrows: {
    flexDirection: 'row',
    gap: 6,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  arrowButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    backgroundColor: 'rgba(46, 139, 87, 0.12)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(46, 139, 87, 0.2)',
    width: CELL_SIZE * GRID_SIZE + 16,
    height: CELL_SIZE * GRID_SIZE + 16,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    margin: 2,
  },
  emptyCell: {
    overflow: 'hidden',
  },
  emptyInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(46, 139, 87, 0.12)',
  },
  cellGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  cellHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '25%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cellGlow: {
    position: 'absolute',
    bottom: '15%',
    left: '20%',
    width: '60%',
    height: '25%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
  },
  cellText: {
    fontWeight: 'bold',
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionContainer: {
    marginVertical: 4,
    padding: 8,
    backgroundColor: 'rgba(46, 139, 87, 0.08)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 139, 87, 0.25)',
    width: '95%',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 15,
    color: '#2E8B57',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  subInstructionText: {
    fontSize: 11,
    color: '#2E8B57',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.85,
  },
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 3,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  doneButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  winOverlay: {
    position: 'absolute',
    top: 100,
    left: '50%',
    transform: [{ translateX: -150 }],
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: 300,
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  winText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  continueButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  continueText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 100,
    left: '50%',
    transform: [{ translateX: -150 }],
    backgroundColor: 'rgba(102, 126, 234, 0.95)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: 300,
    zIndex: 10,
  },
  gameOverText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  restartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
