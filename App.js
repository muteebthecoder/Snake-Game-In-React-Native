import { StatusBar, StyleSheet, Text, Image, View, TouchableOpacity, Modal, PanResponder } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
const App = () => {
  const total_rows = 19
  const total_cols = 11
  const INITIAL_SNAKE = [[4, 8], [4, 9]];
  const INITIAL_FOOD = [4, 2];
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState('LEFT');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(400);
  const [modalVisible, setModalVisible] = useState(true);
  const [start, setStart] = useState(false);
  const intervalRef = useRef(null);


  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (start) {
        moveSnake();
      }
    }, speed);
    return () => clearInterval(intervalRef.current)
  }, [snake, direction]);

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = [...newSnake[0]];
    console.log(head)
    switch (direction.toString()) {
      case 'UP':
        head[0] = head[0] - 1;
        break;
      case 'DOWN':
        head[0] = head[0] + 1;
        break;
      case 'LEFT':
        head[1] = head[1] - 1;
        break;
      case 'RIGHT':
        head[1] = head[1] + 1;
        break;
    }
    newSnake.unshift(head);
    // Remove the last segment only if there's no food eaten
    if (head[0] !== food[0] || head[1] !== food[1]) {
      newSnake.pop();
    } else {
      setScore(score + 5)
      if (score == 10) {
        setSpeed(speed - 100)// 400 spped
      }
      else if (score == 20) {
        setSpeed(speed - 100) // 300 speed
      }
      else if (score == 30) {
        setSpeed(speed - 100) // 200 speed
      }
      else if (score == 40) {
        setSpeed(speed - 100) // 100 speed
      }
      else if (score == 50) {
        setSpeed(speed - 100) // 00 speed // max spped
      }

      // Generate new food position
      let newFood;
      do {
        newFood = [
          Math.floor(Math.random() * total_rows - 1) + 1,
          Math.floor(Math.random() * total_cols - 1) + 1,
        ];
        if (newFood[0] == 0) {
          newFood[0] = newFood[0] + 1
          console.log('row is zero')
        }
        if (newFood[1] == 0) {
          newFood[1] = newFood[1] + 1
          console.log('col is zero')
        }
      } while (
        snake.some(
          segment =>
            segment.every(
              (coord, index) => coord === newFood[index]
            )
        )
      );

      setFood(newFood);
      console.log('New Apple at', newFood)
    }
    // Check if the snake hits the boundary
    if (head[0] < 1 || head[0] >= total_rows || head[1] < 1 || head[1] >= total_cols) {
      console.log("snake hit the boundry")
      clearInterval(intervalRef.current);
      setModalVisible(true)
      setStart(false)
      return;
    }
    // Check if the snake hits by itself
    const headExistsInSnake = snake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1]); // true/false
    const collisionSegment = snake.slice(1).find(segment => segment[0] === head[0] && segment[1] === head[1]); // return hit point
    if (headExistsInSnake) {
      console.log("snake hit itself at point", collisionSegment)
      console.log("snake new head", head)
      clearInterval(intervalRef.current);
      setModalVisible(true)
      setStart(false)
      return;
    }

    setSnake(newSnake);
  }
  const createGrid = () => {
    const cells = []
    let flag = true
    for (let i = 1; i < total_rows; i++) {
      flag = !flag
      for (let j = 1; j < total_cols; j++) {
        let color = flag ? '#ADFE00' : '#26CE56'
        flag = !flag
        let p = 1
        if (food[0] == i && food[1] == j) {
          p = 9
        }
        cells.push(
          <View key={`${i}-${j}`} style={[styles.cell, { backgroundColor: color, zIndex: p }]}>
            {food[0] == i && food[1] == j && (
              <Animatable.Image
                animation="pulse"
                iterationCount="infinite"
                duration={400}
                source={require('./src/Images/apple.png')} resizeMode='center' style={styles.food} />
            )}
            {snake.some(segment => segment[0] === i && segment[1] === j) && (
              <View
                style={snake[0][0] === i && snake[0][1] === j ? styles.snakeHead : styles.snake}
              >
                {snake[0][0] === i && snake[0][1] === j && (
                  <>
                    <View style={[styles.eye, styles.eyeLeft]} />
                    <View style={[styles.eye, styles.eyeRight]} />
                  </>
                )}
              </View>
            )}
          </View>
        )
      }
    }
    return (
      <View style={[styles.grid]} {...panResponder.panHandlers}>{cells}</View>
    )
  }

  // PanResponder setup for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        handleSwipe(gestureState);
      },
    })
  ).current;

  const handleSwipe = (gestureState) => {
    const { dx, dy } = gestureState;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > 0) {
        console.log('right')
        setDirection('RIGHT');
      } else if (dx < 0) {
        console.log('left')
        setDirection('LEFT');
      }
    } else {
      // Vertical swipe
      if (dy > 0) {
        console.log('down')
        setDirection('DOWN');
      } else if (dy < 0) {
        console.log('up')
        setDirection('UP');
      }
    }
  };
  const restartGame = () => {
    setModalVisible(false)
    setScore(0)
    setSnake(INITIAL_SNAKE)
    setSpeed(600)
    setDirection('LEFT')
    setStart(true)
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * total_rows - 1) + 1,
        Math.floor(Math.random() * total_cols - 1) + 1,
      ];
      if (newFood[0] == 0) {
        newFood[0] = newFood[0] + 1
        console.log('row is zero')
      }
      if (newFood[1] == 0) {
        newFood[1] = newFood[1] + 1
        console.log('col is zero')
      }
    } while (
      snake.some(
        segment =>
          segment.every(
            (coord, index) => coord === newFood[index]
          )
      )
    );
    setFood(newFood)
  }
  return (
    <View style={{ flexGrow: 1 }}>
      <StatusBar backgroundColor={'#72AA62'}></StatusBar>
      <View style={{ width: '100%', height: '10%', backgroundColor: '#16C60C', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 80 }}>
          <Image source={require('./src/Images/apple.png')} resizeMode='center' style={styles.food}></Image>
          <Text style={{ fontSize: 24, color: '#fff', fontWeight: '500' }}>{score}</Text>
        </View>
        <MIcon onPress={restartGame} name={'restart'} color={'#fff'} size={32}></MIcon>
      </View>
      <View style={{ width: '100%', flex: 1, backgroundColor: 'green', justifyContent: 'center', borderWidth: 0, padding: 0 }}>
        {createGrid()}
      </View>
      <Modal visible={modalVisible} transparent={true} animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: 80 }}>
              <Image source={require('./src/Images/apple.png')} resizeMode='center' style={[styles.food, { width: 100, height: 100 }]}></Image>
              <Text style={{ fontSize: 42, color: '#fff', fontWeight: '500' }}>{score}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={restartGame} style={styles.modalButton}>
            <Text style={[{ textAlign: 'center', fontSize: 20, color: "#fff", fontWeight: '700' }]}>PLAY</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  cell: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 20
  },
  grid: {
    flexWrap: 'wrap', flexDirection: 'row', borderWidth: 0, alignSelf: 'center', justifyContent: 'center', height: 684
  },
  food: {
    width: 50, height: 50, zIndex: 9
  },
  snake: {
    width: 38, height: 38,
    backgroundColor: 'red',
    zIndex: 9, borderRadius: 10
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  snakeHead: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#4370E5',
    zIndex: 9,
    position: 'relative',
  },
  eye: {
    width: 5,
    height: 5,
    backgroundColor: 'white',
    borderRadius: 2.5,
    position: 'absolute',
  },
  eyeLeft: {
    top: 8,
    left: 8,
  },
  eyeRight: {
    top: 8,
    right: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '40%',
    backgroundColor: '#4DC1FA',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center',
  },
  modalButton: {
    width: '90%',
    height: '10%',
    backgroundColor: '#1055CC',
    borderRadius: 20,
    padding: 20, marginTop: 10,
    justifyContent: 'center',
    alignSelf: 'center'
  },
})