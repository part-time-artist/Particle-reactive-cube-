import * as React from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

/*
 * STANDARD REACT COMPONENT - V11 (Surface Cube)
 */

function PointCloud({ color, pointCount, pointSize, speed, boxSize, gravityRadius, gravityStrength, fogColor, fogNear, fogFar }) {
    const mesh = React.useRef()
    const { raycaster, pointer, camera } = useThree()

    const prevPointer = React.useRef(new THREE.Vector2(0, 0))
    const motionIntensity = React.useRef(0)

    const particles = React.useMemo(() => {
        const temp = []
        const originals = []
        const lives = []
        const lifeSpeeds = []

        for (let i = 0; i < pointCount; i++) {
            // SURFACE DISTRIBUTION
            const face = Math.floor(Math.random() * 6)
            const u = (Math.random() - 0.5) * boxSize
            const v = (Math.random() - 0.5) * boxSize
            const half = boxSize / 2

            let x, y, z
            switch (face) {
                case 0: x = half; y = u; z = v; break;
                case 1: x = -half; y = u; z = v; break;
                case 2: x = u; y = half; z = v; break;
                case 3: x = u; y = -half; z = v; break;
                case 4: x = u; y = v; z = half; break;
                case 5: x = u; y = v; z = -half; break;
                default: x = 0; y = 0; z = 0;
            }

            temp.push(x, y, z)
            originals.push(x, y, z)
            lives.push(Math.random())
            lifeSpeeds.push(0.2 + Math.random() * 0.6)
        }

        return {
            positions: new Float32Array(temp),
            originals: new Float32Array(originals),
            lives: new Float32Array(lives),
            lifeSpeeds: new Float32Array(lifeSpeeds)
        }
    }, [pointCount, boxSize])

    const geometry = React.useRef()

    useFrame((state, delta) => {
        if (!mesh.current || !geometry.current) return

        mesh.current.rotation.x += delta * speed * 0.1
        mesh.current.rotation.y += delta * speed * 0.2

        // Motion Detection
        const distMoved = pointer.distanceTo(prevPointer.current)
        if (distMoved > 0.001) {
            motionIntensity.current = 1.0
        } else {
            motionIntensity.current = THREE.MathUtils.lerp(motionIntensity.current, 0, delta * 2.0)
        }
        prevPointer.current.copy(pointer)
        const effectiveStrength = gravityStrength * motionIntensity.current

        const positions = geometry.current.attributes.position.array
        const lives = geometry.current.attributes.life.array

        raycaster.setFromCamera(pointer, camera)
        const ray = raycaster.ray
        const rayDirWorld = ray.direction.clone()
        const inverseMatrix = new THREE.Matrix4().copy(mesh.current.matrixWorld).invert()
        const localRay = ray.clone().applyMatrix4(inverseMatrix)
        const localRayDir = rayDirWorld.transformDirection(inverseMatrix).normalize()

        for (let i = 0; i < pointCount; i++) {
            const i3 = i * 3

            lives[i] += delta * particles.lifeSpeeds[i]
            if (lives[i] > 1) {
                lives[i] = 0
                positions[i3] = particles.originals[i3]
                positions[i3 + 1] = particles.originals[i3 + 1]
                positions[i3 + 2] = particles.originals[i3 + 2]
            }

            const vec = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2])
            const orig = new THREE.Vector3(particles.originals[i3], particles.originals[i3 + 1], particles.originals[i3 + 2])

            const distSq = localRay.distanceSqToPoint(vec)
            const dist = Math.sqrt(distSq)

            if (dist < gravityRadius && effectiveStrength > 0.01) {
                const closestOnRay = new THREE.Vector3()
                localRay.closestPointToPoint(vec, closestOnRay)

                const radialDir = closestOnRay.clone().sub(vec).normalize()
                const orbitDir = new THREE.Vector3().crossVectors(localRayDir, radialDir).normalize()

                let influence = (1.0 - dist / gravityRadius)
                influence = influence * influence

                vec.add(radialDir.multiplyScalar(delta * effectiveStrength * influence * 8.0))
                vec.add(orbitDir.multiplyScalar(delta * effectiveStrength * influence * 4.0))
            }

            vec.x += (orig.x - vec.x) * delta * 0.8
            vec.y += (orig.y - vec.y) * delta * 0.8
            vec.z += (orig.z - vec.z) * delta * 0.8

            positions[i3] = vec.x
            positions[i3 + 1] = vec.y
            positions[i3 + 2] = vec.z
        }

        geometry.current.attributes.position.needsUpdate = true
        geometry.current.attributes.life.needsUpdate = true
    })

    const shaderArgs = React.useMemo(() => ({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uSize: { value: pointSize * 50 },
            fogColor: { value: new THREE.Color(fogColor) },
            fogNear: { value: fogNear },
            fogFar: { value: fogFar }
        },
        vertexShader: `
            attribute float life;
            varying float vAlpha;
            uniform float uSize;
            varying float vFogDepth;

            void main() {
                vAlpha = sin(life * 3.14159);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = uSize * vAlpha * (10.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
                vFogDepth = -mvPosition.z;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;
            varying float vFogDepth;

            void main() {
                if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
                float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
                float depthFade = 1.0 - fogFactor; 
                gl_FragColor = vec4(uColor, vAlpha * depthFade);
            }
        `,
        transparent: true,
        depthWrite: false
    }), [color, pointSize, fogColor, fogNear, fogFar])

    return (
        <points ref={mesh}>
            <bufferGeometry ref={geometry}>
                <bufferAttribute attach="attributes-position" count={particles.positions.length / 3} array={particles.positions} itemSize={3} />
                <bufferAttribute attach="attributes-life" count={particles.lives.length} array={particles.lives} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial attach="material" args={[shaderArgs]} />
        </points>
    )
}

function FogManager({ color, near, far }) {
    const { scene } = useThree()
    React.useEffect(() => {
        scene.fog = new THREE.Fog(color, near, far)
    }, [scene, color, near, far])
    return null
}

export default function PointCloudCube({
    color = "#0099ff",
    pointCount = 12000,
    pointSize = 0.025,
    speed = 0.2,
    boxSize = 4,
    gravityRadius = 2.5,
    gravityStrength = 0.2,
    enableRotate = true,
    backgroundColor = "#050505",
    fogNear = 4,
    fogFar = 8,
    style = {}
}) {
    return (
        <div style={{ width: "100%", height: "100%", minHeight: "400px", overflow: "hidden", background: backgroundColor, ...style }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }}
                raycaster={{ params: { Points: { threshold: 0.2 } } }}
            >
                <FogManager color={backgroundColor} near={fogNear} far={fogFar} />
                <PointCloud
                    color={color}
                    pointCount={pointCount}
                    pointSize={pointSize}
                    speed={speed}
                    boxSize={boxSize}
                    gravityRadius={gravityRadius}
                    gravityStrength={gravityStrength}
                    fogColor={backgroundColor}
                    fogNear={fogNear}
                    fogFar={fogFar}
                />
                {enableRotate && <OrbitControls enableZoom={false} autoRotate={false} />}
            </Canvas>
        </div>
    )
}
