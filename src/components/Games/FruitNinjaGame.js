import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const GAME_WIDTH = Dimensions.get('window').width - 80;
const GAME_HEIGHT = 500;

const FRUIT_TYPES = {
  apple: { color: '#ff4757', points: 10 },
  banana: { color: '#ffa502', points: 15 },
  orange: { color: '#ff6348', points: 20 },
  bomb: { color: '#2f3542', points: -10 },
};

export default function FruitNinjaGame({ onGameComplete }) {
  const [fruits, setFruits] = useState([]);
  const [rockets, setRockets] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(true); // Auto-start
  const [combo, setCombo] = useState(0);
  const gameLoopRef = useRef(null);
  const comboTimeoutRef = useRef(null);
  const fruitIdRef = useRef(0);
  const rocketIdRef = useRef(0);
  const fruitsRef = useRef([]);
  const rocketsRef = useRef([]);
  
  useEffect(() => {
    fruitsRef.current = fruits;
  }, [fruits]);
  
  useEffect(() => {
    rocketsRef.current = rockets;
  }, [rockets]);

  // Auto-start when component mounts
  useEffect(() => {
    if (gameStarted) {
      startGame();
    }
  }, []);

  const spawnFruit = () => {
    const types = ['apple', 'banana', 'orange', 'bomb'];
    const type = Math.random() < 0.8 ? types[Math.floor(Math.random() * 3)] : 'bomb';
    const x = Math.random() * (GAME_WIDTH - 80);
    const fruit = {
      id: fruitIdRef.current++,
      x,
      y: -80,
      type,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 1 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    };
    setFruits(prev => [...prev, fruit]);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setFruits([]);
    setRockets([]);
    setScore(0);
    setLives(3);
    setCombo(0);
    fruitIdRef.current = 0;
    rocketIdRef.current = 0;
  };

  const shootRocketAtFruit = async (fruit) => {
    if (!gameStarted || gameOver) return;

    const cannonX = GAME_WIDTH / 2;
    const cannonY = GAME_HEIGHT - 80;
    const fruitCenterX = fruit.x + 30;
    const fruitCenterY = fruit.y + 30;

    // Calculate direction to fruit
    const dx = fruitCenterX - cannonX;
    const dy = fruitCenterY - cannonY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * 10;
    const vy = (dy / distance) * 10;

    // Create rocket
    setRockets(prev => [...prev, {
      id: rocketIdRef.current++,
      x: cannonX,
      y: cannonY,
      vx,
      vy,
      targetFruit: fruit.id,
      progress: 0,
    }]);

    // Play shoot sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/shoot.mp3'),
        { shouldPlay: true, volume: 0.5 }
      );
      await sound.unloadAsync();
    } catch (e) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    }
  };

  const handleSlice = async (fruit, explosion) => {
    let newCombo = combo + 1;
    
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setCombo(0), 2000);
    setCombo(newCombo);

    // Handle score and lives
    if (fruit.type === 'bomb') {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/bomb.mp3'),
          { shouldPlay: true, volume: 0.7 }
        );
        await sound.unloadAsync();
      } catch (e) {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      }
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setGameOver(true);
          setGameStarted(false);
          setTimeout(() => onGameComplete({ score }), 1500);
        }
        return newLives;
      });
    } else {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/slice.mp3'),
          { shouldPlay: true, volume: 0.5 }
        );
        await sound.unloadAsync();
      } catch (e) {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      }
      const bonus = newCombo > 1 ? newCombo * 5 : 0;
      setScore(prev => prev + FRUIT_TYPES[fruit.type].points + bonus);
    }

    setFruits(prev => prev.filter(f => f.id !== fruit.id));
  };

  const checkMissedFruits = async () => {
    setFruits(prev => {
      const missedFruits = prev.filter(f => f.y > GAME_HEIGHT && f.type !== 'bomb');
      if (missedFruits.length > 0) {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        setLives(l => {
          const newLives = l - missedFruits.length;
          if (newLives <= 0) {
            setGameOver(true);
            setGameStarted(false);
            setTimeout(() => onGameComplete({ score }), 1500);
          }
          return newLives;
        });
      }
      return prev.filter(f => f.y <= GAME_HEIGHT || f.type === 'bomb');
    });
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const spawnInterval = setInterval(() => {
        if (Math.random() < 0.6) spawnFruit();
      }, 1000);

      gameLoopRef.current = setInterval(() => {
        setFruits(prev => prev.map(fruit => ({
          ...fruit,
          x: fruit.x + fruit.vx,
          y: fruit.y + fruit.vy,
          rotation: fruit.rotation + fruit.rotationSpeed,
        })));
        
        setRockets(prev => {
          const newRockets = [];
          const hitFruits = [];
          
          prev.forEach(rocket => {
            const newRocket = {
              ...rocket,
              x: rocket.x + rocket.vx,
              y: rocket.y + rocket.vy,
              progress: rocket.progress + 1,
            };
            
            // Check collision with ANY fruit in path (not just target)
            let hit = false;
            const allFruits = fruitsRef.current;
            
            allFruits.forEach(fruit => {
              if (!hit) {
                const dx = newRocket.x - (fruit.x + 30);
                const dy = newRocket.y - (fruit.y + 30);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 35) {
                  hitFruits.push(fruit);
                  hit = true;
                }
              }
            });
            
            // Keep rocket if no hit and within bounds
            if (!hit && newRocket.x > -50 && newRocket.x < GAME_WIDTH + 50 && 
                newRocket.y > -50 && newRocket.y < GAME_HEIGHT + 50 && 
                newRocket.progress < 150) {
              newRockets.push(newRocket);
            }
          });
          
          // Handle hit fruits
          hitFruits.forEach(fruit => {
            handleSlice(fruit, true);
          });
          
          return newRockets;
        });
        
        checkMissedFruits();
      }, 50);

      return () => {
        clearInterval(spawnInterval);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver]);

  const handleFinish = () => {
    setGameStarted(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    onGameComplete({ score });
  };

  const renderFruit = (fruit) => {
    const fruitInfo = FRUIT_TYPES[fruit.type];
    
    return (
      <Animated.View
        key={fruit.id}
        style={[
          styles.fruit,
          {
            left: fruit.x,
            top: fruit.y,
            transform: [{ rotate: `${fruit.rotation}deg` }],
          },
        ]}
      >
        <LinearGradient
          colors={[fruitInfo.color, fruitInfo.color + 'CC']}
          style={styles.fruitGradient}
        >
          {fruit.type === 'bomb' ? (
            <View style={styles.bombIcon}>
              <View style={[styles.bombCircle, { backgroundColor: fruitInfo.color }]} />
              <View style={styles.bombWick}>
                <View style={styles.bombSpark} />
              </View>
            </View>
          ) : (
            <View style={styles.fruitIconContainer}>
              <View style={[styles.fruitMainCircle, { backgroundColor: fruitInfo.color }]} />
              <View style={[styles.fruitHighlight, { backgroundColor: fruitInfo.color }]} />
              {fruit.type === 'apple' && <View style={styles.appleStem} />}
              {fruit.type === 'banana' && <View style={styles.bananaCurve} />}
              {fruit.type === 'orange' && <View style={styles.orangeSegment} />}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderRocket = (rocket) => {
    return (
      <Animated.View
        key={rocket.id}
        style={[
          styles.rocket,
          {
            left: rocket.x - 15,
            top: rocket.y - 25,
            transform: [{ rotate: `${Math.atan2(rocket.vy, rocket.vx) * 180 / Math.PI + 90}deg` }],
          },
        ]}
      >
        {/* Flame trail */}
        <LinearGradient 
          colors={['rgba(255,255,0,0)', '#FFD700', '#FF8C00', '#FF4500']} 
          style={styles.rocketFlame}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Rocket body */}
        <View style={styles.rocketBody}>
          <LinearGradient 
            colors={['#FF6B6B', '#FF4757', '#C44569']} 
            style={styles.rocketBodyGradient}
          >
            {/* Rocket nose */}
            <View style={styles.rocketNose} />
          </LinearGradient>
          
          {/* Rocket fins */}
          <View style={styles.rocketFin} />
          <View style={[styles.rocketFin, { right: 0 }]} />
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Lives</Text>
            <Text style={styles.scoreValue}>{'❤️'.repeat(lives)}</Text>
          </View>
        </View>

        {combo > 1 && (
          <View style={styles.comboContainer}>
            <Text style={styles.comboText}>COMBO x{combo}! 🔥</Text>
          </View>
        )}

        <View style={styles.gameArea}>
          <LinearGradient colors={['#ffeaa7', '#fab1a0', '#fecfef']} style={styles.gameGradient}>
            {fruits.map(fruit => (
              <TouchableOpacity
                key={fruit.id}
                activeOpacity={0.7}
                onPress={() => shootRocketAtFruit(fruit)}
                style={[
                  styles.fruit,
                  {
                    left: fruit.x,
                    top: fruit.y,
                    transform: [{ rotate: `${fruit.rotation}deg` }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[FRUIT_TYPES[fruit.type].color, FRUIT_TYPES[fruit.type].color + 'CC']}
                  style={styles.fruitGradient}
                >
                  {fruit.type === 'bomb' ? (
                    <View style={styles.bombIcon}>
                      <View style={[styles.bombCircle, { backgroundColor: FRUIT_TYPES[fruit.type].color }]} />
                      <View style={styles.bombWick}>
                        <View style={styles.bombSpark} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fruitIconContainer}>
                      <View style={[styles.fruitMainCircle, { backgroundColor: FRUIT_TYPES[fruit.type].color }]} />
                      <View style={[styles.fruitHighlight, { backgroundColor: FRUIT_TYPES[fruit.type].color }]} />
                      {fruit.type === 'apple' && <View style={styles.appleStem} />}
                      {fruit.type === 'banana' && <View style={styles.bananaCurve} />}
                      {fruit.type === 'orange' && <View style={styles.orangeSegment} />}
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* Rockets */}
            {rockets.map(rocket => renderRocket(rocket))}

            {/* Cannon at bottom */}
            {gameStarted && !gameOver && (
              <View style={styles.cannon}>
                <LinearGradient colors={['#4A5568', '#2D3748', '#4A5568']} style={styles.cannonBody}>
                  {/* Main cannon body */}
                  <View style={styles.cannonMain} />
                  {/* Barrel extending up and forward */}
                  <View style={styles.cannonBarrel} />
                  {/* Wheels */}
                  <View style={styles.cannonWheel} />
                  <View style={[styles.cannonWheel, { right: 15 }]} />
                  {/* Cannon tip */}
                  <View style={styles.cannonTip} />
                </LinearGradient>
              </View>
            )}
            
            {gameOver && (
              <View style={styles.gameOverOverlay}>
                <Text style={styles.gameOverText}>GAME OVER</Text>
                <Text style={styles.finalScore}>Final Score: {score}</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {!gameStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <LinearGradient colors={['#ff4757', '#ff6b7a']} style={styles.startButtonGradient}>
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={styles.startButtonText}>{gameOver ? 'Play Again' : 'Start Game'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
            <LinearGradient colors={['#17A085', '#20C997']} style={styles.doneButtonGradient}>
              <Text style={styles.doneButtonText}>Finish</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    padding: 8,
    paddingBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
    color: '#ff4757',
  },
  comboContainer: {
    backgroundColor: '#ff4757',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  comboText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    borderWidth: 4,
    borderColor: '#ff4757',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  gameGradient: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fruit: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fruitGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fruitIconContainer: {
    width: 50,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fruitMainCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fruitHighlight: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    opacity: 0.3,
  },
  appleStem: {
    position: 'absolute',
    top: -8,
    left: 28,
    width: 2,
    height: 8,
    backgroundColor: '#8B4513',
  },
  bananaCurve: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  orangeSegment: {
    position: 'absolute',
    top: 8,
    width: 35,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  bombIcon: {
    width: 50,
    height: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bombCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bombWick: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 10,
    backgroundColor: '#34495e',
    borderRadius: 2,
  },
  bombSpark: {
    position: 'absolute',
    top: -5,
    left: -2,
    width: 8,
    height: 8,
    backgroundColor: '#ffd700',
    borderRadius: 4,
  },
  rocket: {
    position: 'absolute',
    width: 30,
    height: 50,
    zIndex: 100,
  },
  rocketFlame: {
    position: 'absolute',
    bottom: -20,
    left: 10,
    width: 10,
    height: 25,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  rocketBody: {
    width: 30,
    height: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  rocketBodyGradient: {
    width: 12,
    height: 40,
    borderRadius: 6,
    position: 'relative',
  },
  rocketNose: {
    position: 'absolute',
    top: -8,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: '#E63946',
  },
  rocketFin: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: '#9B2030',
  },
  cannon: {
    position: 'absolute',
    bottom: 20,
    left: (GAME_WIDTH - 80) / 2,
    width: 80,
    height: 70,
  },
  cannonBody: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cannonMain: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 35,
    height: 30,
    backgroundColor: '#5D6D7E',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2D3748',
  },
  cannonBarrel: {
    position: 'absolute',
    top: 8,
    left: 42,
    width: 40,
    height: 14,
    backgroundColor: '#5D6D7E',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  cannonWheel: {
    position: 'absolute',
    bottom: 3,
    left: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2D3748',
    borderWidth: 3,
    borderColor: '#1A202C',
  },
  cannonTip: {
    position: 'absolute',
    top: 10,
    left: 78,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: '#2D3748',
    borderTopWidth: 10,
    borderTopColor: 'transparent',
    borderBottomWidth: 10,
    borderBottomColor: 'transparent',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -60 }],
    backgroundColor: 'rgba(255,71,87,0.95)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    width: 280,
  },
  gameOverText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScore: {
    color: '#fff',
    fontSize: 18,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  doneButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
