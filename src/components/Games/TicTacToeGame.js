import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const GRID_SIZE = 3;

export default function TicTacToeGame({ onGameComplete }) {
  const [board, setBoard] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(true); // Auto-start the game
  const [difficulty, setDifficulty] = useState('hard'); // Auto-set to hard

  useEffect(() => {
    if (gameStarted && !winner && !xIsNext) {
      // Computer's turn
      const timeout = setTimeout(() => {
        const computerMove = getComputerMove();
        handleCellClick(computerMove, false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, winner, gameStarted, board]);

  // Auto-start with hard difficulty
  useEffect(() => {
    // Initialize board when component mounts
    setBoard(Array(GRID_SIZE * GRID_SIZE).fill(null));
  }, []);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (!squares.includes(null)) {
      return 'draw';
    }

    return null;
  };

  const getComputerMove = () => {
    const squares = [...board];

    if (difficulty === 'hard') {
      // Check if computer can win
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          if (calculateWinner(squares) === 'O') {
            return i;
          }
          squares[i] = null;
        }
      }

      // Check if player can win and block
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          if (calculateWinner(squares) === 'X') {
            return i;
          }
          squares[i] = null;
        }
      }
    }

    // Take center if available
    if (!squares[4]) {
      return 4;
    }

    if (difficulty === 'medium' || difficulty === 'hard') {
      // Take corners or edges
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(i => !squares[i]);
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }

    // Random move
    const availableMoves = squares
      .map((cell, index) => (!cell ? index : null))
      .filter(cell => cell !== null);
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handleCellClick = (index, isHuman = true) => {
    if (board[index] || winner || (!isHuman && xIsNext) || (isHuman && !xIsNext)) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      if (gameWinner === 'X') {
        setScore(prev => prev + 10);
        setWinner('You Win! 🎉');
      } else if (gameWinner === 'O') {
        setWinner('Computer Wins! 💻');
      } else {
        setWinner("It's a Draw! 🤝");
      }
    } else {
      setXIsNext(!xIsNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(GRID_SIZE * GRID_SIZE).fill(null));
    setXIsNext(true);
    setWinner(null);
  };

  const startGame = () => {
    setGameStarted(true);
    setBoard(Array(GRID_SIZE * GRID_SIZE).fill(null));
    setXIsNext(true);
    setWinner(null);
    setScore(0);
  };

  const handleFinish = () => {
    setGameStarted(false);
    onGameComplete({ score });
  };

  const renderCell = (index) => {
    const value = board[index];
    const isWinningCell = winner && value && calculateWinner(board) === value;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.cell, isWinningCell && styles.winningCell]}
        onPress={() => handleCellClick(index)}
        disabled={!!value || !!winner}
        activeOpacity={0.7}
      >
        {value === 'X' ? (
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.cellGradient}>
            <Text style={styles.cellText}>✕</Text>
          </LinearGradient>
        ) : value === 'O' ? (
          <LinearGradient colors={['#20C997', '#17A085']} style={styles.cellGradient}>
            <Text style={styles.cellText}>○</Text>
          </LinearGradient>
        ) : (
          <View style={styles.emptyCell} />
        )}
      </TouchableOpacity>
    );
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>Choose Difficulty:</Text>
          <View style={styles.difficultyButtons}>
            <TouchableOpacity
              style={[styles.difficultyButton, difficulty === 'easy' && styles.difficultyButtonActive]}
              onPress={() => setDifficulty('easy')}
            >
              <Text style={styles.difficultyButtonText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.difficultyButton, difficulty === 'medium' && styles.difficultyButtonActive]}
              onPress={() => setDifficulty('medium')}
            >
              <Text style={styles.difficultyButtonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.difficultyButton, difficulty === 'hard' && styles.difficultyButtonActive]}
              onPress={() => setDifficulty('hard')}
            >
              <Text style={styles.difficultyButtonText}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.startButtonGradient}>
            <Ionicons name="play" size={20} color="#FFF" />
            <Text style={styles.startButtonText}>Start Game</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Turn</Text>
          <Text style={styles.scoreValue}>{xIsNext ? 'You' : 'PC'}</Text>
        </View>
      </View>

      {winner && (
        <View style={styles.winnerContainer}>
          <Text style={styles.winnerText}>{winner}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={resetGame}>
            <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.restartButtonGradient}>
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.restartButtonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.board}>
        <View style={styles.row}>
          {renderCell(0)}
          {renderCell(1)}
          {renderCell(2)}
        </View>
        <View style={styles.row}>
          {renderCell(3)}
          {renderCell(4)}
          {renderCell(5)}
        </View>
        <View style={styles.row}>
          {renderCell(6)}
          {renderCell(7)}
          {renderCell(8)}
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
        <LinearGradient colors={['#17A085', '#20C997']} style={styles.doneButtonGradient}>
          <Text style={styles.doneButtonText}>Finish</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  difficultyContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  difficultyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 15,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  scoreBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  winnerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 15,
  },
  board: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: '#667eea',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 91.33,
    height: 91.33,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: '#F8F9FF',
  },
  winningCell: {
    backgroundColor: '#FFF5CC',
  },
  cellGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyCell: {
    width: '100%',
    height: '100%',
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  restartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 30,
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
  },
});

