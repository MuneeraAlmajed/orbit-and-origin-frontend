import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { get3DTerrain } from "../../services/api";
import "./Terrain3D.css";

const HEIGHT_SCALE = 20;

function TerrainSurface({ terrain }) {
  const geometry = useMemo(() => {
    const { rows, columns, data } = terrain;
    const positions = [];
    const indices = [];

    const validElevations = data
      .map((cell) => cell.elevation)
      .filter((value) => value !== null);

    const minElevation = Math.min(...validElevations);
    const maxElevation = Math.max(...validElevations);
    const elevationRange = maxElevation - minElevation || 1;

    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const cellRow = Math.min(row, rows - 1);
        const cellCol = Math.min(col, columns - 1);
        const cell = data[cellRow * columns + cellCol];

        positions.push(
          col - columns / 2,
          cell.elevation === null
            ? 0
            : ((cell.elevation - minElevation) / elevationRange) * HEIGHT_SCALE,
          row - rows / 2,
        );
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = data[row * columns + col];

        if (cell.elevation === null) continue;

        const nextCell = data[row * columns + col + 1];
        const lowerCell = data[(row + 1) * columns + col];
        const diagonalCell = data[(row + 1) * columns + col + 1];

        if (
          !nextCell ||
          !lowerCell ||
          !diagonalCell ||
          nextCell.elevation === null ||
          lowerCell.elevation === null ||
          diagonalCell.elevation === null
        ) {
          continue;
        }

        const a = row * (columns + 1) + col;
        const b = a + columns + 1;

        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }

    return {
      positions: new Float32Array(positions),
      indices: new Uint32Array(indices),
      minElevation,
      maxElevation,
    };
  }, [terrain]);

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[geometry.positions, 3]}
        />
        <bufferAttribute attach="index" args={[geometry.indices, 1]} />
      </bufferGeometry>

      <meshStandardMaterial color="#b86f45" roughness={1} side={2} />
    </mesh>
  );
}

function TerrainRoute({ terrain, route }) {
  const routeLines = useMemo(() => {
    if (!route?.waypoints?.length || !terrain?.data?.length) {
      return [];
    }

    const { rows, columns, data } = terrain;

    const south = Math.min(...data.map((cell) => cell.bounds[0][0]));
    const north = Math.max(...data.map((cell) => cell.bounds[1][0]));
    const west = Math.min(...data.map((cell) => cell.bounds[0][1]));
    const east = Math.max(...data.map((cell) => cell.bounds[1][1]));

    const elevations = data
      .map((cell) => cell.elevation)
      .filter((value) => value !== null);

    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);
    const elevationRange = maxElevation - minElevation || 1;

    const samples = [];

    for (let i = 0; i < route.waypoints.length - 1; i++) {
      const start = route.waypoints[i];
      const end = route.waypoints[i + 1];

      for (let step = 0; step < 30; step++) {
        const t = step / 30;

        samples.push({
          lat: Number(start.lat) + (Number(end.lat) - Number(start.lat)) * t,
          lon: Number(start.lon) + (Number(end.lon) - Number(start.lon)) * t,
        });
      }
    }

    samples.push(route.waypoints[route.waypoints.length - 1]);

    const lines = [];
    let currentLine = [];

    samples.forEach((point) => {
      const lat = Number(point.lat);
      const lon = Number(point.lon);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        lat < south ||
        lat > north ||
        lon < west ||
        lon > east
      ) {
        if (currentLine.length > 1) lines.push(currentLine);
        currentLine = [];
        return;
      }

      const row = Math.min(
        rows - 1,
        Math.max(0, Math.floor(((north - lat) / (north - south)) * rows)),
      );

      const col = Math.min(
        columns - 1,
        Math.max(0, Math.floor(((lon - west) / (east - west)) * columns)),
      );

      let nearestCell = null;
      let nearestRow = row;
      let nearestCol = col;
      let nearestDistance = Infinity;

      // Look nearby when the exact grid cell has missing elevation.
      for (
        let r = Math.max(0, row - 3);
        r <= Math.min(rows - 1, row + 3);
        r++
      ) {
        for (
          let c = Math.max(0, col - 3);
          c <= Math.min(columns - 1, col + 3);
          c++
        ) {
          const cell = data[r * columns + c];

          if (cell?.elevation == null) continue;

          const distance = (r - row) ** 2 + (c - col) ** 2;

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCell = cell;
            nearestRow = r;
            nearestCol = c;
          }
        }
      }

      if (!nearestCell || nearestDistance > 18) {
        if (currentLine.length > 1) lines.push(currentLine);
        currentLine = [];
        return;
      }

      const x = ((lon - west) / (east - west)) * columns - columns / 2;

      const z = ((north - lat) / (north - south)) * rows - rows / 2;

      const y =
        ((nearestCell.elevation - minElevation) / elevationRange) *
          HEIGHT_SCALE +
        0.8;

      currentLine.push([x, y, z]);
    });

    if (currentLine.length > 1) lines.push(currentLine);

    return lines;
  }, [terrain, route]);

  return (
    <>
      {routeLines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#00ffff"
          lineWidth={6}
          depthTest={false}
          renderOrder={10}
        />
      ))}

      {routeLines.length > 0 && (
        <>
          <mesh position={routeLines[0][0]} renderOrder={11}>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshBasicMaterial color="#37c9a9" depthTest={false} />
          </mesh>

          <mesh
            position={routeLines[routeLines.length - 1].at(-1)}
            renderOrder={11}
          >
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshBasicMaterial color="#ef9869" depthTest={false} />
          </mesh>
        </>
      )}
    </>
  );
}

function Terrain3D({ route, terrainReport, hazardReport, analysis }) {
  const [terrain, setTerrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    get3DTerrain()
      .then(setTerrain)
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading HiRISE 3D terrain...</p>;
  }

  if (error || !terrain) {
    return <p>{error || "No terrain data available."}</p>;
  }

  return (
    <section className="terrain-3d">
      <div className="terrain-3d-header">
        <h2>Jezero Crater – 3D Terrain</h2>
        <p>USGS/NASA HiRISE Digital Terrain Model</p>
      </div>

      <div className="terrain-3d-view">
        <Canvas camera={{ position: [0, 12, 25], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 15, 10]} intensity={2} />
          <TerrainSurface terrain={terrain} />
          <TerrainRoute terrain={terrain} route={route} />
          <OrbitControls enableDamping />
        </Canvas>
      </div>

      {route && (
        <div className="terrain-3d-route-info">
          <h3>Generated Route #{route.id}</h3>
          <p>
            Distance: {route.distance ?? route.distance_km ?? "Unavailable"} km
          </p>
          <p>
            Cyan line: route sections with available HiRISE elevation coverage.
          </p>
          {terrainReport && <p>Terrain report available.</p>}
          {hazardReport && <p>Hazard report available.</p>}
          {analysis && <p>Safety analysis available.</p>}
          <p>
            Sections outside the available elevation coverage are not drawn.
          </p>
        </div>
      )}

      <p className="terrain-3d-help">
        Elevation vertically exaggerated for visibility. Drag to rotate · Scroll
        to zoom · Right-click to move.
      </p>

      <p className="terrain-3d-help">
        Source: USGS/NASA HiRISE DTM · 1 m original resolution. The displayed
        terrain grid is downsampled.
      </p>
    </section>
  );
}

export default Terrain3D;
