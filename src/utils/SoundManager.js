import { Audio } from 'expo-av';

class SoundManager {
  static sounds = {};

  static async loadSounds() {
    try {
      // We'll use system sounds since we don't have custom audio files
      // For now, we'll create sounds programmatically
      this.sounds = {
        slice: null,
        bomb: null,
        knifeHit: null,
        knifeMiss: null,
        gameOver: null,
      };
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  static async playSliceSound() {
    try {
      // Create a sharp slice sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,' },
        { shouldPlay: true, volume: 0.5 }
      );
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing slice sound:', error);
    }
  }

  static async playBombSound() {
    try {
      // Create a explosion sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,' },
        { shouldPlay: true, volume: 0.6 }
      );
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing bomb sound:', error);
    }
  }

  static async playKnifeHitSound() {
    try {
      // Create a knife hitting wood sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,' },
        { shouldPlay: true, volume: 0.5 }
      );
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing knife hit sound:', error);
    }
  }

  static async playKnifeMissSound() {
    try {
      // Create a knife missing sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,' },
        { shouldPlay: true, volume: 0.4 }
      );
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing knife miss sound:', error);
    }
  }

  static async playGameOverSound() {
    try {
      // Create a game over sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,' },
        { shouldPlay: true, volume: 0.6 }
      );
      await sound.unloadAsync();
    } catch (error) {
      console.error('Error playing game over sound:', error);
    }
  }
}

export default SoundManager;

