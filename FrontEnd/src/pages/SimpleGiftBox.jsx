// SimpleGiftBox.jsx
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Create a global registry to store scene instances to avoid recreating them
const sceneRegistry = {};

const SimpleGiftBox = ({
    color = '#ff4970',
    size = 250,
    isOpening = false,
    onOpenComplete,
    giftContent = null,
    giftId = null,
}) => {
    // Refs for Three.js objects
    const mountRef = useRef(null);
    const instanceIdRef = useRef(`gift-${giftId}-${Math.random().toString(36).substring(2, 9)}`);
    const [showContent, setShowContent] = useState(false);

    // Effect to create and manage the Three.js scene
    useEffect(() => {
        if (!mountRef.current) return;

        const instanceId = instanceIdRef.current;

        // Check if we already have a scene for this component instance
        let sceneData = sceneRegistry[instanceId];

        // If no existing scene, create one
        if (!sceneData) {
            console.log(`Creating new Three.js scene for gift ID:${giftId}, instance:${instanceId}`);

            // Initialize scene objects
            const scene = new THREE.Scene();
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(size, size);
            renderer.setClearColor(0x000000, 0);

            const clock = new THREE.Clock();
            clock.start();

            // Set up camera
            const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
            camera.position.z = 2.8;

            // Create gift group
            const giftGroup = new THREE.Group();

            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 1.2);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            // Create box
            const boxGeometry = new THREE.BoxGeometry(1.2, 1, 1.2);
            const boxMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                metalness: 0.4,
                roughness: 0.6,
                transparent: true,
                opacity: 1.0,
            });

            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.y = -0.1;
            giftGroup.add(box);

            // Create lid
            const lidGeometry = new THREE.BoxGeometry(1.3, 0.25, 1.3);
            const lidMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color),
                metalness: 0.4,
                roughness: 0.6,
            });

            const lid = new THREE.Mesh(lidGeometry, lidMaterial);
            lid.position.y = 0.5;
            giftGroup.add(lid);

            scene.add(giftGroup);
            giftGroup.position.y = -0.2;

            // Store all objects in registry
            sceneData = {
                scene,
                renderer,
                camera,
                clock,
                box,
                lid,
                giftGroup,
                animationProgress: 0,
                isAnimating: false,
                animationFrameId: null,
                mountCount: 0,
                color
            };

            sceneRegistry[instanceId] = sceneData;
        } else {
            console.log(`Reusing existing Three.js scene for gift ID:${giftId}, instance:${instanceId}`);
            // Update color if it has changed
            if (sceneData.color !== color) {
                if (sceneData.box && sceneData.box.material) {
                    sceneData.box.material.color = new THREE.Color(color);
                }
                if (sceneData.lid && sceneData.lid.material) {
                    sceneData.lid.material.color = new THREE.Color(color);
                }
                sceneData.color = color;
            }
        }

        // Increment mount counter
        sceneData.mountCount++;

        // Add renderer to DOM
        mountRef.current.appendChild(sceneData.renderer.domElement);

        // Animation function
        const animate = () => {
            const { scene, renderer, camera, clock, box, lid, giftGroup, isAnimating } = sceneData;

            const delta = clock.getDelta();

            if (sceneData.isAnimating) {
                // Animation logic for opening
                sceneData.animationProgress += delta * 0.5;

                if (sceneData.animationProgress >= 0.8 && !showContent) {
                    setShowContent(true);
                }

                if (sceneData.animationProgress >= 1) {
                    sceneData.animationProgress = 1;

                    setTimeout(() => {
                        if (onOpenComplete) {
                            onOpenComplete();
                        }
                        sceneData.isAnimating = false;
                    }, 500);
                }

                // Update lid position/rotation
                if (lid) {
                    lid.position.y = 0.5 + sceneData.animationProgress * 1.8;
                    lid.rotation.x = sceneData.animationProgress * Math.PI / 2.5;
                }

                // Make box transparent
                if (box && box.material) {
                    if (sceneData.animationProgress > 0.5) {
                        const opacity = 1 - ((sceneData.animationProgress - 0.5) * 2);
                        box.material.opacity = Math.max(0.2, opacity);
                    }
                }
            } else {
                // Standard rotation when closed and not animating
                if (giftGroup) {
                    giftGroup.rotation.y += delta * 0.5;
                }
            }

            renderer.render(scene, camera);
            sceneData.animationFrameId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Start opening animation if needed
        if (isOpening && !sceneData.isAnimating) {
            console.log(`Starting animation for gift ID:${giftId}, instance:${instanceId}`);
            sceneData.animationProgress = 0;
            sceneData.isAnimating = true;
            setShowContent(false);
        }

        // Cleanup function
        return () => {
            // Decrement mount counter
            sceneData.mountCount--;

            // Cancel animation frame
            if (sceneData.animationFrameId) {
                cancelAnimationFrame(sceneData.animationFrameId);
                sceneData.animationFrameId = null;
            }

            // Remove DOM element if it exists
            if (mountRef.current && mountRef.current.contains(sceneData.renderer.domElement)) {
                mountRef.current.removeChild(sceneData.renderer.domElement);
            }

            // If this is the last instance, clean up resources after a short delay
            // to allow for StrictMode re-mounting
            if (sceneData.mountCount <= 0) {
                setTimeout(() => {
                    if (sceneData.mountCount <= 0) {
                        console.log(`Fully disposing scene for gift ID:${giftId}, instance:${instanceId}`);
                        sceneData.scene.clear();
                        sceneData.renderer.dispose();
                        delete sceneRegistry[instanceId];
                    }
                }, 1000);
            }
        };
    }, [giftId, color, size, isOpening, onOpenComplete, showContent]);

    // Effect to handle isOpening changes separately
    useEffect(() => {
        const instanceId = instanceIdRef.current;
        const sceneData = sceneRegistry[instanceId];

        if (!sceneData) return;

        if (isOpening && !sceneData.isAnimating) {
            console.log(`Starting animation for gift ID:${giftId}, instance:${instanceId} (from isOpening effect)`);
            sceneData.animationProgress = 0;
            sceneData.isAnimating = true;
            setShowContent(false);
        }
    }, [isOpening, giftId]);

    return (
        <div className="relative" style={{ width: size, height: size, zIndex: 0 }}>
            <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
            {showContent && giftContent && (
                <div className="absolute inset-0 flex items-center justify-center z-50 animate-pop">
                    <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
                        {giftContent}
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(SimpleGiftBox);