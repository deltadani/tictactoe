import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ReactConfetti from 'react-confetti';
import './TicTacToe3D.css';

type SquareValue = 'X' | 'O' | null;
type CubeValue = SquareValue[][][];
type CellArray = THREE.Mesh[][][];

export const calculateWinner = (cube: CubeValue): { winner: SquareValue; line: number[][] | null } => {
  const directions = [
    // Straight lines
    { dx: 1, dy: 0, dz: 0 }, // X-axis
    { dx: 0, dy: 1, dz: 0 }, // Y-axis
    { dx: 0, dy: 0, dz: 1 }, // Z-axis

    // Diagonals within planes
    { dx: 1, dy: 1, dz: 0 }, // XY-plane
    { dx: 1, dy: -1, dz: 0 }, // XY-plane (anti-diagonal)
    { dx: 1, dy: 0, dz: 1 }, // XZ-plane
    { dx: 0, dy: 1, dz: 1 }, // YZ-plane

    // Diagonals across layers
    { dx: 1, dy: 1, dz: 1 }, // XYZ diagonal
    { dx: 1, dy: -1, dz: 1 }, // XYZ anti-diagonal
  ];

  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = 0; z < 4; z++) {
        const currentValue = cube[x][y][z];
        if (!currentValue) continue; // Skip empty cells

        for (const { dx, dy, dz } of directions) {
          const line = [[x, y, z]];
          let isWinningLine = true;

          for (let step = 1; step < 4; step++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            const nz = z + dz * step;

            // Check bounds and value consistency
            if (
              nx < 0 || nx >= 4 ||
              ny < 0 || ny >= 4 ||
              nz < 0 || nz >= 4 ||
              cube[nx][ny][nz] !== currentValue
            ) {
              isWinningLine = false;
              break;
            }

            line.push([nx, ny, nz]);
          }

          if (isWinningLine && line.length === 4) { // Ensure the line has exactly 4 cells
            return { winner: currentValue, line };
          }
        }
      }
    }
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
  const [cube, setCube] = useState<CubeValue>(Array(4).fill(null).map(() => 
    Array(4).fill(null).map(() => Array(4).fill(null))
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
    sceneRef.current = scene; // Assign the scene to sceneRef.current
    scene.background = new THREE.Color(0x1a1d23);

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight || 1, // Fallback to 1 if dimensions are 0
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(5, 5, 5); // Ensure the camera is positioned to see the cube
    camera.lookAt(0, 0, 0); // Look at the center of the scene
    console.log('Camera position:', camera.position);

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      canvas: mountRef.current
    });
    rendererRef.current = renderer;

    // Ensure the canvas has proper dimensions
    const resizeCanvas = () => {
      const parent = mountRef.current?.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      console.log('Canvas resized to:', width, height);
    };

    resizeCanvas(); // Initial resize
    window.addEventListener('resize', resizeCanvas);

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
    controls.update();

    // Set up raycaster and mouse
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster;
    const mouse = new THREE.Vector2();
    mouseRef.current = mouse;

    // Create cube geometry
    const cellSize = 1;
    const xyGap = 0.1; // Smaller gap for cells within each layer
    const zGap = 1.5; // Larger gap for separation between layers
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

    // Create cells
    const cells: CellArray = Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => Array(4).fill(null))
    );
    cellsRef.current = cells;

    for (let x = 0; x < 4; x++) {
      for (let z = 0; z < 4; z++) { // Switch z and y
        for (let y = 0; y < 4; y++) { // Switch z and y
          const cell = new THREE.Mesh(geometry, materialsRef.current.default.clone());
          cell.position.set(
            (x - 1.5) * (cellSize + xyGap), // Smaller gap for x-axis
            (y - 1.5) * (cellSize + zGap),  // Larger gap for y-axis (was z)
            (z - 1.5) * (cellSize + xyGap)  // Smaller gap for z-axis (was y)
          );
          cell.castShadow = true;
          cell.receiveShadow = true;
          cell.userData = { x, y, z, type: 'cube' }; // Ensure type is set to 'cube'
          scene.add(cell);
          cells[x][z][y] = cell; // Update the cell array to match the new axes
          console.log(`Added cell at position: (${cell.position.x}, ${cell.position.y}, ${cell.position.z})`);
        }
      }
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    console.log('Added ambient light.');

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    console.log('Added directional light at position:', directionalLight.position);

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
      window.removeEventListener('resize', resizeCanvas);
      renderer.dispose();
    };
  }, []); // Empty dependency array - scene setup runs only once

  useEffect(() => {
    if (!sceneRef.current) return; // Ensure sceneRef.current is initialized

    const scene = sceneRef.current; // Access the scene from sceneRef.current
    const cellSize = 1;
    const xyGap = 0.1; // Smaller gap for cells within each layer
    const zGap = 1.5; // Larger gap for separation between layers
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

    // Create cells
    const cells: CellArray = Array(4)
      .fill(null)
      .map(() =>
        Array(4)
          .fill(null)
          .map(() => Array(4).fill(null))
      );
    cellsRef.current = cells;

    for (let x = 0; x < 4; x++) {
      for (let z = 0; z < 4; z++) { // Switch z and y
        for (let y = 0; y < 4; y++) { // Switch z and y
          const cell = new THREE.Mesh(geometry, materialsRef.current.default.clone());
          cell.position.set(
            (x - 1.5) * (cellSize + xyGap), // Smaller gap for x-axis
            (y - 1.5) * (cellSize + zGap),  // Larger gap for y-axis (was z)
            (z - 1.5) * (cellSize + xyGap)  // Smaller gap for z-axis (was y)
          );
          cell.castShadow = true;
          cell.receiveShadow = true;
          cell.userData = { x, y, z }; // Update userData to reflect the new axes
          scene.add(cell);
          cells[x][z][y] = cell; // Update the cell array to match the new axes
        }
      }
    }
  }, []);

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

    let lastHoveredCell: THREE.Mesh | null = null; // Track the last hovered cell

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
        const { x, y, z, type } = cell.userData;

        if (type === 'cube' && !cube[x][y][z]) { // Ensure type is 'cube' and cell is not already played
          // Update game state
          const newCube = cube.map(l => l.map(r => [...r]));
          newCube[x][y][z] = xIsNext ? 'X' : 'O';
          setCube(newCube);
          setXIsNext(!xIsNext);

          // Apply the correct material for the clicked cell
          const material = materialsRef.current[xIsNext ? 'x' : 'o'];
          cell.material = material.clone(); // Clone to avoid shared state issues
          cell.material.transparent = false; // Ensure no opacity is applied
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

      // Reset the material of the last hovered cell
      if (lastHoveredCell && !cube[lastHoveredCell.userData.x][lastHoveredCell.userData.y][lastHoveredCell.userData.z]) {
        lastHoveredCell.material = materialsRef.current.default.clone();
      }

      // Apply hover material to the currently intersected cell
      if (intersects.length > 0) {
        const cell = intersects[0].object as THREE.Mesh;
        const { x, y, z } = cell.userData;
        if (!cube[x][y][z]) { // Only apply hover effect to non-played cells
          cell.material = materialsRef.current.hover.clone();
          lastHoveredCell = cell; // Update the last hovered cell
        } else {
          lastHoveredCell = null; // Reset if the cell is already played
        }
      } else {
        lastHoveredCell = null; // Reset if no cell is hovered
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
    const { winner: newWinner, line } = calculateWinner(cube);
    if (newWinner && !winner) {
      setWinner(newWinner);
      playVictorySound();

      // Highlight the winning cells
      if (line && cellsRef.current) {
        line.forEach(([x, y, z]) => {
          const cell = cellsRef.current?.[x]?.[z]?.[y]; // Corrected the coordinate mapping
          if (cell) {
            cell.material = new THREE.MeshStandardMaterial({
              color: 0xffd700, // Gold color for highlighting
              emissive: 0xffa500, // Subtle glow effect
              metalness: 0.8,
              roughness: 0.2,
            });
            cell.scale.set(1.4, 1.4, 1.4); // Slightly scale up the winning cells
          }
        });
      }
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
    setCube(Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => Array(4).fill(null))
    ));
    setXIsNext(true);
    setWinner(null);

    // Reset all cell materials and scales
    if (cellsRef.current) {
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
          for (let z = 0; z < 4; z++) {
            const cell = cellsRef.current?.[x]?.[y]?.[z];
            if (cell) {
              cell.material = materialsRef.current.default.clone();
              cell.scale.set(1, 1, 1); // Reset scale
            }
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
      <h1>Qubic (4x4x4 Tic Tac Toe)</h1>
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