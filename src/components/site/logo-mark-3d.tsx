'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { PETALS } from './logo-mark';

/** The header's landing place for the mark (site-header.tsx). */
export const MARK_SLOT_ID = 'brand-mark-slot';
/** Space between the landed mark and the wordmark, in px (site-header.tsx). */
const SLOT_GAP = 10;

// three.js starts downloading as soon as this module runs in the browser,
// not after hydration, so the 3D mark is not the last thing on the page.
let threeModule: Promise<typeof import('./three-parts')> | null = null;
const loadThree = () => (threeModule ??= import('./three-parts'));
if (typeof window !== 'undefined') void loadThree();

const smooth = (x: number) => x * x * (3 - 2 * x);
/**
 * The mark does not fly on any screen: tied to the scroll, a flight stopped
 * wherever the reader stopped, half way, over the headline (Jawad, 2026-11-23:
 * a bug, as it read). It stays in the hero, and once it has scrolled past, its
 * live canvas moves into the header and turns in beside the wordmark.
 */
const GROUNDED = 'all';

/**
 * The blades' own turning, as QUL's ring turns its chips (qul.tarteel.ai,
 * shards/renderer.js): over a 50 s tween that runs out and back, each blade
 * turns through 62.832 × w × its own noise radians, w going 0 → 1 → 0, so
 * every blade spins at its own pace (≈0.5–0.8 rad/s) and winds back. The noise
 * values are QUL's first ten; a slow drift keeps the pattern from repeating.
 */
const TURN_SECONDS = 50;
const TURN_RADIANS = 62.832;
const TURN_NOISE = [
  0.4239, 0.4784, 0.5042, 0.5926, 0.5997, 0.6124, 0.6174, 0.6647, 0.6308, 0.5483,
];
const TURN_DRIFT = 0.02;
const TURN_DRIFT_SPEED = 0.075;
const pingPong = (time: number, seconds: number) => {
  const cycle = (time / seconds) % 2;
  return cycle < 1 ? cycle : 2 - cycle;
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const clamp = (x: number) => Math.min(1, Math.max(-1, x));

/**
 * The «ذكر» mark in real 3D: its ten petals as glossy gold and mint blades,
 * the ring turning and each blade tilting like a fan. It sits in the hero;
 * as the page scrolls it flies up and settles beside the wordmark in the
 * header, where it stays, in 3D, still turning. On a desktop it leans
 * toward the mouse and can be grabbed and spun; it springs back when let go.
 * A still of its first frame shows at once; the live scene takes over. On a
 * phone (see GROUNDED) it stays in the hero, and the header's flat mark
 * slides in once it has scrolled past; with reduced motion it is also still.
 */
export function LogoMark3D({
  label,
  className,
  badge = false,
}: {
  label: string;
  className?: string;
  /**
   * A small mark where it simply sits (the footer, the header of every page but
   * the home): gold, facing forward, turning; it neither flies nor docks.
   */
  badge?: boolean;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const landedRef = useRef(badge);
  const scaleRef = useRef(1);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [grounded, setGrounded] = useState(false);
  useEffect(() => {
    setGrounded(!badge && window.matchMedia(GROUNDED).matches);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set once
  }, []);

  // Grounded: the header's mark comes in once the hero's has scrolled past
  // the bar (globals.css animates it from `data-mark-dock`).
  useEffect(() => {
    if (!mounted || !grounded || badge) return;
    const anchor = anchorRef.current;
    const bar = document.querySelector('.header-shell');
    if (!anchor || !bar) return;
    const root = document.documentElement;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    const update = () => {
      ticking = false;
      const past =
        anchor.getBoundingClientRect().bottom <=
        bar.getBoundingClientRect().bottom;
      root.dataset.markDock = past ? 'in' : 'out';
      // The scene moves its canvas into the header slot (see «dock» below).
      if (!still) landedRef.current = past;
    };
    const request = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      delete root.dataset.markDock;
      landedRef.current = false;
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [mounted, grounded, badge]);

  // The flight: from the hero's anchor to the header slot as the hero scrolls away.
  useEffect(() => {
    if (!mounted || grounded || badge) return;
    const anchor = anchorRef.current;
    const flyer = flyerRef.current;
    const slot = document.getElementById(MARK_SLOT_ID);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!anchor || !flyer || !slot || still) return;

    const root = document.documentElement;
    root.dataset.markFlight = 'on';
    let ticking = false;

    const place = () => {
      ticking = false;
      const from = anchor.getBoundingClientRect();
      // The slot opens as the mark arrives (the wordmark slides aside to make
      // room), so aim for the square it will be once fully open: its height
      // wide, at its start edge (the right in Arabic).
      const box = slot.getBoundingClientRect();
      const side = box.height;
      const rtl = getComputedStyle(slot).direction === 'rtl';
      const to = {
        left: rtl ? box.right - side : box.left,
        top: box.top,
        width: side,
        height: side,
        bottom: box.bottom,
      };
      if (from.width === 0) return;
      // Landed by the time two thirds of the anchor has passed the header.
      const travel = from.top + window.scrollY + from.height * 0.66 - to.bottom;
      const progress = clamp01(window.scrollY / Math.max(1, travel));
      const t = smooth(progress);
      // It shrinks early (ease-out) so it never sits large over the headline.
      const grow = 1 - (1 - progress) ** 3;
      // Centres travel on the eased path; the size follows its own curve.
      const size = from.width + (to.width - from.width) * grow;
      const cx =
        from.left +
        from.width / 2 +
        (to.left + to.width / 2 - (from.left + from.width / 2)) * t;
      const cy =
        from.top +
        from.height / 2 +
        (to.top + to.height / 2 - (from.top + from.height / 2)) * t;
      const x = cx - size / 2;
      const y = cy - size / 2;
      const scale = size / from.width;
      flyer.style.width = `${from.width}px`;
      flyer.style.height = `${from.height}px`;
      flyer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      slot.style.width = `${t * (side + SLOT_GAP)}px`;
      landedRef.current = progress >= 1;
      scaleRef.current = scale;
      // Only at rest in the hero can it be grabbed and spun; in flight and in
      // the header it lets clicks through to the page.
      flyer.style.pointerEvents = progress === 0 ? 'auto' : 'none';
    };
    const request = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(place);
    };
    place();
    // Placed in the scroll event itself, so the mark never trails the page.
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', request);
    const observer = new ResizeObserver(request);
    observer.observe(anchor);
    return () => {
      delete root.dataset.markFlight;
      slot.style.removeProperty('width');
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', request);
      observer.disconnect();
    };
  }, [mounted, grounded, badge]);

  // The scene.
  useEffect(() => {
    if (!mounted) return;
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await loadThree();
      if (disposed) return;

      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      // The room the blades mirror, after QUL's: black, lit only by a few
      // narrow bright strips. Polished surfaces then read as black mirrors
      // with sharp highlights and bright rims, not as satin.
      const studio = new THREE.Scene();
      // A warm grey room, not black: gold seen edge-on still reads as gold.
      studio.background = new THREE.Color(0x000000);
      const panel = (
        color: number,
        power: number,
        position: [number, number, number],
        size: [number, number]
      ) => {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(size[0], size[1]),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(color).multiplyScalar(power),
            side: THREE.DoubleSide,
          })
        );
        mesh.position.set(...position);
        mesh.lookAt(0, 0, 0);
        studio.add(mesh);
      };
      panel(0xffffff, 7, [0, 7, 3], [10, 1.1]);
      panel(0xffffff, 5, [-7, 1, 1], [1.1, 10]);
      panel(0xf2cf86, 4.5, [7, 0, 1], [1.1, 10]);
      panel(0xffffff, 7, [0, 0, -8], [8, 8]);
      // A faint gold glow behind the viewer, so gold facing you is a dark
      // gold mirror, not black.
      panel(0xf2cf86, 1, [0, 1, 10], [12, 8]);
      const environment = pmrem.fromScene(studio, 0.02).texture;
      studio.traverse((object) => {
        const mesh = object as {
          geometry?: { dispose(): void };
          material?: { dispose(): void };
        };
        mesh.geometry?.dispose();
        mesh.material?.dispose();
      });
      scene.environment = environment;
      // Soft fill so the lacquer bodies show their colour on every side.
      scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2418, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(3, 5, 6);
      scene.add(key);
      // Light from behind gives the glass blades their bright rims.
      const rim = new THREE.DirectionalLight(0xffffff, 3);
      rim.position.set(-3, 2, -6);
      scene.add(rim);
      const glow = new THREE.PointLight(0xfff0d0, 18, 12);
      glow.position.set(0, 0, 2.5);
      scene.add(glow);

      // A 45° lens, close in: the depth QUL's ring has.
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 9.6);

      // One petal of the flat mark, centred, tip up, as a rounded slab.
      const shape = new THREE.Shape();
      // Narrow enough that neighbours never touch at any turn: the logo's
      // own proportions.
      shape.moveTo(0, 1.3);
      shape.bezierCurveTo(0.64, 0.46, 0.64, -0.62, 0, -1.3);
      shape.bezierCurveTo(-0.64, -0.62, -0.64, 0.46, 0, 1.3);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.14,
        bevelSize: 0.11,
        bevelSegments: 6,
        curveSegments: 32,
      });
      geometry.center();

      // The white blades shade from soft grey at the hub to white at the tip:
      // depth under the glossy coat, and never a paler gold.
      const tones = [
        new THREE.Color(0xb7babe),
        new THREE.Color(0xeeeeee),
        new THREE.Color(0xffffff),
      ];
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const positions = geometry.getAttribute('position');
      const colors = new Float32Array(positions.count * 3);
      const tone = new THREE.Color();
      for (let index = 0; index < positions.count; index++) {
        const y = positions.getY(index);
        const t = box ? (y - box.min.y) / (box.max.y - box.min.y) : 0.5;
        if (t < 0.5) tone.copy(tones[0]).lerp(tones[1], t / 0.5);
        else tone.copy(tones[1]).lerp(tones[2], (t - 0.5) / 0.5);
        colors.set([tone.r, tone.g, tone.b], index * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const gold = new THREE.MeshPhysicalMaterial({
        // Gold lacquer under a mirror-clear coat, like QUL's coloured blades:
        // the body carries the colour (lit by the lights, shading deep at the
        // hub to bright at the tip), the coat mirrors the black room.
        color: 0xe2ad48,
        vertexColors: true,
        metalness: 0.35,
        roughness: 0.32,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 1.6,
      });
      // White: a white body under a mirror-clear coat. The body stays white
      // (lit by the lights, not tinted by the room); the coat mirrors the
      // black room, so it reads as glossy black glass over white.
      const mint = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        vertexColors: true,
        metalness: 0,
        roughness: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 1.6,
      });

      // The stage leans toward the pointer; the ring inside it turns.
      const stage = new THREE.Group();
      scene.add(stage);
      const ring = new THREE.Group();
      ring.rotation.x = 0;
      stage.add(ring);

      // The mouse anywhere on the page steers it. Across the window, the
      // blades turn on their long axes like slats, from a three-quarter turn
      // to edge-on, never fully flat; the ring leans toward the pointer; and
      // the blades on the pointer's side open a touch wider.
      // Its resting pose, after QUL's: the disc turned to face right (toward
      // the headline), about 35° (QUL turns theirs 59°; ours reads better
      // gentler), at eye level. The mouse leans it from there.
      const BASE_YAW = 0.6;
      const BASE_PITCH = 0;
      const TILT_MAX = 0.22;
      const REST_TWIST = 0.95;
      // Facing forward in the header, its blades open a little more.
      const HEADER_TWIST = 0.55;
      const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const twist = { value: REST_TWIST, target: REST_TWIST };
      const reach = { value: 0, target: 0, angle: 0 };
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        const nx = clamp((event.clientX / window.innerWidth) * 2 - 1);
        const ny = clamp((event.clientY / window.innerHeight) * 2 - 1);
        tilt.targetY = nx * TILT_MAX;
        tilt.targetX = ny * TILT_MAX;
        // Never fully flat: from a three-quarter turn to nearly edge-on.
        twist.target = 0.5 + ((nx + 1) / 2) * 0.85;
        const rect = host.getBoundingClientRect();
        reach.angle = Math.atan2(
          -(event.clientY - (rect.top + rect.height / 2)),
          event.clientX - (rect.left + rect.width / 2)
        );
        reach.target = 0.12;
        if (drag.active && event.pointerId === drag.pointerId) dragTo(event);
      };
      const onMouseOut = (event: MouseEvent) => {
        if (event.relatedTarget) return;
        tilt.targetX = tilt.targetY = 0;
        twist.target = REST_TWIST;
        reach.target = 0;
      };

      // Spin: held, the ring follows the pointer's angle round its centre;
      // let go, it springs back carrying the speed of the throw.
      const drag = { active: false, pointerId: -1, angle: 0, time: 0 };
      let spin = 0;
      let spinVelocity = 0;
      const angleOf = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        // The hub swings wildly for little travel: ignore it.
        if (Math.hypot(dx, dy) < rect.width * 0.08) return null;
        return Math.atan2(dy, dx);
      };
      const dragTo = (event: PointerEvent) => {
        const angle = angleOf(event);
        if (angle === null) return;
        const delta = Math.atan2(
          Math.sin(angle - drag.angle),
          Math.cos(angle - drag.angle)
        );
        const now = event.timeStamp || performance.now();
        const seconds = (now - drag.time) / 1000;
        // Screen angles run clockwise; the ring's z turns the other way.
        spin = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, spin - delta));
        if (seconds > 0.004) {
          spinVelocity = Math.max(-16, Math.min(16, -delta / seconds));
          drag.time = now;
        }
        drag.angle = angle;
      };
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const angle = angleOf(event);
        if (angle === null) return;
        drag.active = true;
        drag.pointerId = event.pointerId;
        drag.angle = angle;
        drag.time = event.timeStamp || performance.now();
        spinVelocity = 0;
        host.style.cursor = 'grabbing';
        try {
          host.setPointerCapture(event.pointerId);
        } catch {
          // Capture is a nicety; the window listener still follows.
        }
      };
      const onPointerUp = (event: PointerEvent) => {
        if (!drag.active || event.pointerId !== drag.pointerId) return;
        drag.active = false;
        host.style.cursor = 'grab';
      };
      // A spring and damper back to rest, at a fixed step so a long frame
      // cannot throw it.
      const stepSpin = (seconds: number) => {
        const h = 1 / 120;
        for (let left = seconds; left > 0; left -= h) {
          spinVelocity += (-26 * spin - 7.5 * spinVelocity) * h;
          spin += spinVelocity * h;
        }
        if (Math.abs(spin) < 1e-4 && Math.abs(spinVelocity) < 1e-3) {
          spin = 0;
          spinVelocity = 0;
        }
      };
      const desktop = window.matchMedia('(pointer: fine)').matches;
      if (desktop && !still) {
        host.style.cursor = 'grab';
        window.addEventListener('pointermove', onPointerMove, {
          passive: true,
        });
        document.addEventListener('mouseout', onMouseOut);
        host.addEventListener('pointerdown', onPointerDown);
        host.addEventListener('pointerup', onPointerUp);
        host.addEventListener('pointercancel', onPointerUp);
      }
      const blades: {
        mesh: InstanceType<typeof THREE.Mesh>;
        phase: number;
        noise: number;
        angle: number;
      }[] = [];
      for (let index = 0; index < PETALS; index++) {
        const arm = new THREE.Group();
        arm.rotation.z = (index / PETALS) * Math.PI * 2;
        const blade = new THREE.Mesh(geometry, index % 2 ? mint : gold);
        blade.position.y = 2.15;
        arm.add(blade);
        ring.add(arm);
        blades.push({
          mesh: blade,
          phase: index * 1.7,
          noise: TURN_NOISE[index % TURN_NOISE.length],
          // The blade's direction from the centre, screen-up at zero.
          angle: Math.PI / 2 + (index / PETALS) * Math.PI * 2,
        });
      }

      // On a phone the mark does not fly: once the hero's has scrolled past,
      // the canvas itself moves into the header slot and goes on turning
      // there at the slot's size. A box in the slot holds it.
      const slot =
        !badge && window.matchMedia(GROUNDED).matches
          ? document.getElementById(MARK_SLOT_ID)
          : null;
      const dock = slot ? document.createElement('span') : null;
      if (slot && dock) {
        dock.className = 'mark-dock';
        slot.append(dock);
      }

      const resize = () => {
        const size = (renderer.domElement.parentElement ?? host).clientWidth;
        if (size > 0) renderer.setSize(size, size, false);
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      if (dock) resizeObserver.observe(dock);

      // The scene's own clock.
      let clock = 0;
      let speed = 1;
      let last = 0;
      let first = true;
      let drawnLanded = false;
      let gilt = 0;
      const white = new THREE.Color(0xffffff);
      const goldTone = new THREE.Color(0xe2ad48);
      // Dark mode reverses the hero to white, so the white blades turn to
      // black lacquer under the same mirror coat; they ease across on a switch.
      const lacquer = new THREE.Color(0x0d0d0e);
      const base = new THREE.Color(0xffffff);
      const root = document.documentElement;
      let night = root.classList.contains('dark') ? 1 : 0;
      const draw = (time: number) => {
        const dt = last ? Math.min(0.05, (time - last) / 1000) : 0;
        last = time;
        const landed = landedRef.current;
        if (landed) {
          tilt.targetX = tilt.targetY = 0;
          twist.target = HEADER_TWIST;
          reach.target = 0;
        }
        // In the header it keeps turning, a little slower, drawn at the size
        // it is shown rather than the hero's.
        if (landed !== drawnLanded) {
          drawnLanded = landed;
          if (dock) {
            // Docked: the canvas itself sits in the header at its own size.
            (landed ? dock : host).append(renderer.domElement);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          } else {
            renderer.setPixelRatio(
              landed
                ? Math.max(
                    0.2,
                    window.devicePixelRatio * scaleRef.current * 1.5
                  )
                : Math.min(window.devicePixelRatio, 2)
            );
          }
          resize();
        }
        speed += ((landed ? 0.6 : 1) - speed) * Math.min(1, dt * 4);
        // In the header the pale blades turn gold as well: one gold mark.
        gilt += ((landed ? 1 : 0) - gilt) * Math.min(1, dt * 4);
        night +=
          ((root.classList.contains('dark') ? 1 : 0) - night) *
          Math.min(1, dt * 6);
        base.lerpColors(white, lacquer, night);
        mint.color.lerpColors(base, goldTone, gilt);
        mint.metalness = 0.35 * gilt;
        mint.roughness = 0.35 - 0.03 * gilt;
        clock += dt * speed;
        const ease = 1 - Math.pow(1 - 0.06, (dt * 1000) / (1000 / 60));
        tilt.x += (tilt.targetX - tilt.x) * ease;
        tilt.y += (tilt.targetY - tilt.y) * ease;
        twist.value += (twist.target - twist.value) * ease;
        reach.value += (reach.target - reach.value) * ease;
        if (!drag.active && (spin || spinVelocity)) stepSpin(dt);
        // In the header it turns to face forward, so the small mark reads.
        stage.rotation.x = BASE_PITCH * (1 - gilt) + tilt.x;
        stage.rotation.y = BASE_YAW * (1 - gilt) + tilt.y;
        ring.rotation.z = -clock * 0.22 + spin;
        ring.rotation.y = Math.sin(clock * 0.35) * 0.18;
        const turn = pingPong(clock, TURN_SECONDS);
        for (const blade of blades) {
          // Each blade turns on its own long axis, like a fan of glass, at its
          // own pace (see TURN_SECONDS).
          // Where it points now, after the ring's own turn.
          const facing = blade.angle + ring.rotation.z;
          blade.mesh.rotation.y =
            twist.value -
            reach.value * Math.cos(facing - reach.angle) +
            TURN_RADIANS *
              turn *
              (blade.noise +
                TURN_DRIFT * Math.sin(TURN_DRIFT_SPEED * clock + blade.phase));
        }
        renderer.render(scene, camera);
        if (first) {
          first = false;
          setReady(true);
        }
      };

      // Off screen (scrolled past, on a phone) it draws nothing.
      let onScreen = true;
      const visibility = new IntersectionObserver(([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
      });
      visibility.observe(host);

      let frame = 0;
      const loop = (time: number) => {
        frame = requestAnimationFrame(loop);
        // Docked in the header it is always in view.
        if (!document.hidden && (onScreen || (dock && landedRef.current))) {
          draw(time);
        }
      };
      // The first frame is drawn at once, not on the browser's next
      // animation frame, so the mark shows as soon as it is ready even where
      // frames are held back (a background tab, a busy page).
      draw(performance.now());
      if (!still) frame = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(frame);
        visibility.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('mouseout', onMouseOut);
        host.removeEventListener('pointerdown', onPointerDown);
        host.removeEventListener('pointerup', onPointerUp);
        host.removeEventListener('pointercancel', onPointerUp);
        resizeObserver.disconnect();
        geometry.dispose();
        gold.dispose();
        mint.dispose();
        environment.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        dock?.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [mounted, badge]);


  // From the first paint the hero shows a still of this very scene's first
  // frame (rendered from it, 28 KB). The live canvas fades in over it once it
  // has drawn, the same pose, so the hand-over cannot be seen.
  const stage = (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/mark-hero.webp"
        alt=""
        aria-hidden="true"
        width={720}
        height={720}
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full transition-opacity delay-300 duration-200 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        ref={hostRef}
        className={`absolute inset-0 transition-opacity duration-300 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );

  // A badge: the scene where it sits, no still behind it (it is small and
  // arrives at once), never an anchor the header or the flight look for.
  if (badge) {
    return (
      <div role="img" aria-label={label} className={`mark-badge ${className ?? ''}`}>
        <div
          ref={hostRef}
          className={`h-full w-full transition-opacity duration-500 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  }

  // Grounded: the scene lives in the hero, nothing flies.
  if (!mounted || grounded) {
    return (
      <div
        ref={anchorRef}
        data-mark-anchor=""
        role="img"
        aria-label={label}
        className={className}
      >
        {stage}
      </div>
    );
  }

  return (
    <>
      <div
        ref={anchorRef}
        data-mark-anchor=""
        role="img"
        aria-label={label}
        className={className}
      />
      {createPortal(
        <div
          ref={flyerRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[60] origin-top-left will-change-transform"
        >
          {stage}
        </div>,
        document.body
      )}
    </>
  );
}
