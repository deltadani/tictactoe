import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ReactConfetti from 'react-confetti';
import './TicTacToe3D.css';

type SquareValue = 'X' | 'O' | null;
type CubeValue = SquareValue[][][];
type CellArray = THREE.Mesh[][][];

const calculateWinner = (cube: CubeValue): { winner: SquareValue; line: number[][] | null } => {
  // Check rows, columns, and layer diagonals
  for (let z = 0; z < 3; z++) {
    // Check rows
    for (let y = 0; y < 3; y++) {
      if (cube[0][y][z] && 
          cube[0][y][z] === cube[1][y][z] && 
          cube[1][y][z] === cube[2][y][z]) {
        return { 
          winner: cube[0][y][z], 
          line: [[0, y, z], [1, y, z], [2, y, z]] 
        };
      }
    }
    // Check columns
    for (let x = 0; x < 3; x++) {
      if (cube[x][0][z] && 
          cube[x][0][z] === cube[x][1][z] && 
          cube[x][1][z] === cube[x][2][z]) {
        return { 
          winner: cube[x][0][z], 
          line: [[x, 0, z], [x, 1, z], [x, 2, z]] 
        };
      }
    }
  }

  // Check diagonals in each layer (z-plane)
  for (let z = 0; z < 3; z++) {
    // Main diagonal (top-left to bottom-right)
    if (cube[0][0][z] && 
        cube[0][0][z] === cube[1][1][z] && 
        cube[1][1][z] === cube[2][2][z]) {
      return { 
        winner: cube[0][0][z], 
        line: [[0, 0, z], [1, 1, z], [2, 2, z]] 
      };
    }
    // Other diagonal (top-right to bottom-left)
    if (cube[2][0][z] && 
        cube[2][0][z] === cube[1][1][z] && 
        cube[1][1][z] === cube[0][2][z]) {
      return { 
        winner: cube[2][0][z], 
        line: [[2, 0, z], [1, 1, z], [0, 2, z]] 
      };
    }
  }

  // Check diagonals in each vertical plane (x-plane)
  for (let x = 0; x < 3; x++) {
    // Main diagonal
    if (cube[x][0][0] && 
        cube[x][0][0] === cube[x][1][1] && 
        cube[x][1][1] === cube[x][2][2]) {
      return { 
        winner: cube[x][0][0], 
        line: [[x, 0, 0], [x, 1, 1], [x, 2, 2]] 
      };
    }
    // Other diagonal
    if (cube[x][2][0] && 
        cube[x][2][0] === cube[x][1][1] && 
        cube[x][1][1] === cube[x][0][2]) {
      return { 
        winner: cube[x][2][0], 
        line: [[x, 2, 0], [x, 1, 1], [x, 0, 2]] 
      };
    }
  }

  // Check diagonals in each side plane (y-plane)
  for (let y = 0; y < 3; y++) {
    // Main diagonal
    if (cube[0][y][0] && 
        cube[0][y][0] === cube[1][y][1] && 
        cube[1][y][1] === cube[2][y][2]) {
      return { 
        winner: cube[0][y][0], 
        line: [[0, y, 0], [1, y, 1], [2, y, 2]] 
      };
    }
    // Other diagonal
    if (cube[2][y][0] && 
        cube[2][y][0] === cube[1][y][1] && 
        cube[1][y][1] === cube[0][y][2]) {
      return { 
        winner: cube[2][y][0], 
        line: [[2, y, 0], [1, y, 1], [0, y, 2]] 
      };
    }
  }

  // Check space diagonals (corner to corner through center)
  // Front-top-left to back-bottom-right
  if (cube[0][0][0] && 
      cube[0][0][0] === cube[1][1][1] && 
      cube[1][1][1] === cube[2][2][2]) {
    return { 
      winner: cube[0][0][0], 
      line: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] 
    };
  }
  // Front-top-right to back-bottom-left
  if (cube[2][0][0] && 
      cube[2][0][0] === cube[1][1][1] && 
      cube[1][1][1] === cube[0][2][2]) {
    return { 
      winner: cube[2][0][0], 
      line: [[2, 0, 0], [1, 1, 1], [0, 2, 2]] 
    };
  }
  // Back-top-left to front-bottom-right
  if (cube[0][0][2] && 
      cube[0][0][2] === cube[1][1][1] && 
      cube[1][1][1] === cube[2][2][0]) {
    return { 
      winner: cube[0][0][2], 
      line: [[0, 0, 2], [1, 1, 1], [2, 2, 0]] 
    };
  }
  // Back-top-right to front-bottom-left
  if (cube[2][0][2] && 
      cube[2][0][2] === cube[1][1][1] && 
      cube[1][1][1] === cube[0][2][0]) {
    return { 
      winner: cube[2][0][2], 
      line: [[2, 0, 2], [1, 1, 1], [0, 2, 0]] 
    };
  }

  return { winner: null, line: null };
};

// Create materials at component level
const createMaterials = () => ({
  default: new THREE.MeshStandardMaterial({ 
    color: 0x666666,
    transparent: true,
    opacity: 0.8,
    metalness: 0.5,
    roughness: 0.5
  }),
  hover: new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.5,
    metalness: 0.3,
    roughness: 0.7,
    emissive: 0x444444
  }),
  x: new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    transparent: false,
    metalness: 0.5,
    roughness: 0.5
  }),
  o: new THREE.MeshStandardMaterial({ 
    color: 0x0000ff,
    transparent: false,
    metalness: 0.5,
    roughness: 0.5
  }),
});

const TicTacToe3D: React.FC = () => {
  const [cube, setCube] = useState<CubeValue>(Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => Array(3).fill(null))
  ));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<SquareValue>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [hoveredCube, setHoveredCube] = useState<{x: number, y: number, z: number} | null>(null);

  // Three.js refs
  const mountRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const mouseRef = useRef<THREE.Vector2 | null>(null);
  const cellsRef = useRef<CellArray | null>(null);
  const materialsRef = useRef(createMaterials());

  // Scene setup effect - runs only once
  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1d23);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      canvas: mountRef.current
    });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x1a1d23, 1);

    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.update();

    // Set up raycaster and mouse
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;
    const mouse = new THREE.Vector2();
    mouseRef.current = mouse;

    // Create cube geometry
    const cellSize = 1;
    const gap = 0.1;
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

    // Create cells
    const cells: CellArray = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => Array(3).fill(null))
    );
    cellsRef.current = cells;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const cell = new THREE.Mesh(geometry, materialsRef.current.default.clone());
          cell.position.set(
            (x - 1) * (cellSize + gap),
            (y - 1) * (cellSize + gap),
            (z - 1) * (cellSize + gap)
          );
          cell.castShadow = true;
          cell.receiveShadow = true;
          cell.userData = { x, y, z };
          scene.add(cell);
          cells[x][y][z] = cell;
        }
      }
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Store mountRef.current in a variable for cleanup
    const mountElement = mountRef.current;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []); // Empty dependency array - scene setup runs only once

  // Animation and interaction effect
  useEffect(() => {
    if (!cameraRef.current || !raycasterRef.current || !mouseRef.current || !cellsRef.current || !rendererRef.current || !sceneRef.current || !controlsRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    const mouse = mouseRef.current;
    const raycaster = raycasterRef.current;
    const cells = cellsRef.current;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Start the animation loop
    animate();

    // Handle mouse click
    const handleClick = (event: MouseEvent) => {
      if (!camera || !raycaster || !mouse || winner || !cells) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const cell = intersects[0].object as THREE.Mesh;
        const { x, y, z } = cell.userData;

        if (!cube[x][y][z]) {
          // Update game state
          const newCube = cube.map(l => l.map(r => [...r]));
          newCube[x][y][z] = xIsNext ? 'X' : 'O';
          setCube(newCube);
          setXIsNext(!xIsNext);
          
          // Update cell material immediately
          const material = materialsRef.current[xIsNext ? 'x' : 'o'].clone();
          cell.material = material;
          
          // Add a more noticeable scale animation
          cell.scale.set(1.2, 1.2, 1.2);
          setTimeout(() => {
            cell.scale.set(1, 1, 1);
          }, 300);
        }
      }
    };

    // Handle mouse move for hover effect
    const handleMouseMove = (event: MouseEvent) => {
      if (!camera || !raycaster || !mouse || !cells) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      // Reset all cells to their original material
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            const cell = cells[x][y][z];
            if (!cube[x][y][z]) { // Only reset non-played cells
              cell.material = materialsRef.current.default.clone();
            }
          }
        }
      }

      // Apply hover material to intersected cell
      if (intersects.length > 0) {
        const cell = intersects[0].object as THREE.Mesh;
        const { x, y, z } = cell.userData;
        if (!cube[x][y][z]) { // Only apply hover effect to non-played cells
          cell.material = materialsRef.current.hover.clone();
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cube, xIsNext, winner]); // This effect handles game state changes

  // Check for winner effect
  useEffect(() => {
    const { winner: newWinner } = calculateWinner(cube);
    if (newWinner && !winner) {
      setWinner(newWinner);
      playVictorySound();
    }
  }, [cube, winner]);

  const playVictorySound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    const notes = [880, 1108.73, 1318.51, 1760];
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
    });

    oscillator.start();
    oscillator.stop(audioContext.currentTime + notes.length * 0.1);
  };

  const resetGame = () => {
    setCube(Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => Array(3).fill(null))
    ));
    setXIsNext(true);
    setWinner(null);

    // Reset all cell materials
    if (cellsRef.current) {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 3; z++) {
            cellsRef.current[x][y][z].material = materialsRef.current.default.clone();
            cellsRef.current[x][y][z].scale.set(1, 1, 1);
          }
        }
      }
    }
  };

  const status = winner
    ? (
      <div>
        Winner: <span className={`player-indicator player-${winner.toLowerCase()}`}></span>
      </div>
    )
    : (
      <div>
        Next player: <span className={`player-indicator player-${xIsNext ? 'x' : 'o'}`}></span>
      </div>
    );

  useEffect(() => {
    if (!mountRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current || !mouseRef.current || !raycasterRef.current) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    const mouse = mouseRef.current;
    const raycaster = raycasterRef.current;

    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current || !scene || !camera || !renderer || !controls || !mouse || !raycaster) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        const userData = object.userData;
        if (userData.type === 'cube' && userData.x !== undefined) {
          setHoveredCube({ x: userData.x, y: userData.y, z: userData.z });
        } else {
          setHoveredCube(null);
        }
      } else {
        setHoveredCube(null);
      }
    };

    const mountElement = mountRef.current;
    mountElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      mountElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array since we're using refs

  useEffect(() => {
    if (!sceneRef.current) return;

    // Update cube materials based on hover state
    sceneRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.type === 'cube') {
        const { x, y, z } = child.userData;
        const isHovered = hoveredCube && 
          hoveredCube.x === x && 
          hoveredCube.y === y && 
          hoveredCube.z === z;
        
        if (isHovered) {
          (child.material as THREE.MeshPhongMaterial).emissive.setHex(0x333333);
        } else {
          (child.material as THREE.MeshPhongMaterial).emissive.setHex(0x000000);
        }
      }
    });
  }, [hoveredCube]); // Only depend on hoveredCube

  return (
    <div className="App">
      {winner && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#61dafb', '#ffffff', '#ffd700', '#ff69b4', '#98fb98']}
          confettiSource={{
            x: windowSize.width / 2,
            y: windowSize.height / 2,
            w: 0,
            h: 0
          }}
          initialVelocityX={15}
          initialVelocityY={15}
        />
      )}
      <h1>3D Tic Tac Toe</h1>
      <div className="game-info">
        <div className={winner ? 'winner' : ''}>{status}</div>
      </div>
      <div className="game-board-3d">
        <canvas ref={mountRef} />
      </div>
    </div>
  );
};

export default TicTacToe3D; 