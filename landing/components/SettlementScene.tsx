"use client";

import { useEffect, useRef } from "react";

type SettlementSceneProps = { onReady: () => void };

export function SettlementScene({ onReady }: SettlementSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;
      const container = canvas.parentElement;
      if (!container) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-6, 6, 2.8, -2.8, 0.1, 30);
      camera.position.set(0, 0, 10);

      const route = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.5, 0, 0),
        new THREE.Vector3(-2.2, 0.55, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2.2, -0.55, 0),
        new THREE.Vector3(4.5, 0, 0),
      ]);
      const routeGeometry = new THREE.BufferGeometry().setFromPoints(route.getPoints(80));
      const routeLine = new THREE.Line(
        routeGeometry,
        new THREE.LineBasicMaterial({ color: 0x8d958f, transparent: true, opacity: 0.44 }),
      );
      scene.add(routeLine);

      const nodeGeometry = new THREE.SphereGeometry(0.31, 20, 20);
      const outerGeometry = new THREE.RingGeometry(0.48, 0.52, 32);
      const nodePositions = [-4.5, 0, 4.5] as const;
      const nodeColors = [0x303a36, 0xe86642, 0xa7371e] as const;
      const nodes = nodePositions.map((x, index) => {
        const node = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: nodeColors[index] }));
        node.position.x = x;
        const ring = new THREE.Mesh(outerGeometry, new THREE.MeshBasicMaterial({ color: nodeColors[index], transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
        ring.position.x = x;
        scene.add(node, ring);
        return { node, ring };
      });

      const particleGeometry = new THREE.SphereGeometry(0.075, 10, 10);
      const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xe86642 });
      const particles = Array.from({ length: 7 }, () => {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.visible = false;
        scene.add(particle);
        return particle;
      });

      let isVisible = false;
      let raf = 0;
      let animationStart = 0;
      let pulseStrength = 1;
      const duration = 1_650;

      const resize = () => {
        const rect = container.getBoundingClientRect();
        const width = Math.max(1, Math.round(rect.width));
        const height = Math.max(1, Math.round(rect.height));
        renderer.setSize(width, height, false);
        camera.left = -6;
        camera.right = 6;
        camera.top = 6 * (height / width);
        camera.bottom = -camera.top;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };

      const draw = (time: number) => {
        raf = 0;
        const progress = animationStart ? Math.min(1, (time - animationStart) / duration) : 1;
        particles.forEach((particle, index) => {
          const position = progress * 1.22 - index * 0.09;
          particle.visible = position >= 0 && position <= 1;
          if (particle.visible) particle.position.copy(route.getPoint(position));
        });
        const pulse = 1 + Math.sin(progress * Math.PI) * 0.18 * pulseStrength;
        nodes[1]?.ring.scale.setScalar(pulse);
        renderer.render(scene, camera);
        if (progress < 1 && isVisible && !document.hidden) raf = window.requestAnimationFrame(draw);
      };

      const start = () => {
        if (!raf && isVisible && !document.hidden) raf = window.requestAnimationFrame(draw);
      };

      const onQuote = (event: Event) => {
        const amount = (event as CustomEvent<{ amountAedMinor?: number }>).detail?.amountAedMinor ?? 1;
        pulseStrength = Math.min(1.8, Math.max(0.7, Math.log10(amount + 10) / 5));
        animationStart = performance.now();
        start();
      };

      const intersectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible) start();
        else if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      }, { rootMargin: "80px" });
      const resizeObserver = new ResizeObserver(resize);
      const onVisibility = () => { if (document.hidden && raf) { window.cancelAnimationFrame(raf); raf = 0; } else start(); };

      intersectionObserver.observe(container);
      resizeObserver.observe(container);
      window.addEventListener("setula:quote", onQuote);
      document.addEventListener("visibilitychange", onVisibility);
      resize();
      onReady();

      cleanup = () => {
        intersectionObserver.disconnect();
        resizeObserver.disconnect();
        window.removeEventListener("setula:quote", onQuote);
        document.removeEventListener("visibilitychange", onVisibility);
        if (raf) window.cancelAnimationFrame(raf);
        renderer.dispose();
        routeGeometry.dispose();
        nodeGeometry.dispose();
        outerGeometry.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
      };
    }).catch(() => {
      // The static settlement route remains visible if Three.js cannot initialize.
    });

    return () => { disposed = true; cleanup(); };
  }, [onReady]);

  return <canvas className="settlement-canvas" ref={canvasRef} aria-hidden="true" />;
}
