export const studio = {
  ambient: 0.35,
  environmentIntensity: 0.4,
  key: {
    position: [2.4, 4.2, 3.1] as const,
    intensity: 12,
    angle: 0.32,
    penumbra: 0.85,
    color: '#fff6ee',
  },
  fill: {
    position: [-3.2, 1.6, 2.2] as const,
    intensity: 3.5,
    angle: 0.6,
    penumbra: 1,
    color: '#d5e2ff',
  },
  rim: {
    position: [0.2, 2.4, -3.4] as const,
    intensity: 6,
    angle: 0.55,
    penumbra: 1,
    color: '#ffffff',
  },
}

export function StudioLights() {
  return (
    <>
      <ambientLight intensity={studio.ambient} />
      <spotLight
        position={studio.key.position}
        intensity={studio.key.intensity}
        angle={studio.key.angle}
        penumbra={studio.key.penumbra}
        color={studio.key.color}
        castShadow={false}
      />
      <spotLight
        position={studio.fill.position}
        intensity={studio.fill.intensity}
        angle={studio.fill.angle}
        penumbra={studio.fill.penumbra}
        color={studio.fill.color}
        castShadow={false}
      />
      <spotLight
        position={studio.rim.position}
        intensity={studio.rim.intensity}
        angle={studio.rim.angle}
        penumbra={studio.rim.penumbra}
        color={studio.rim.color}
        castShadow={false}
      />
    </>
  )
}
