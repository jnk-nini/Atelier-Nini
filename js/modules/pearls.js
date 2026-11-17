// Hero 3D: a strand of pearls that drapes behind the portrait, a few loose
// pearls and small gold stars. Everything sways and leans away from the pointer.
// Three.js is only fetched here, after the page is already usable.

function loadThree() {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'vendor/three.min.js';
    script.onload = () => resolve(window.THREE);
    script.onerror = reject;
    document.head.append(script);
  });
}

// A tiny photo studio (soft sky plus three light cards) baked into a
// reflection map, so the glossy pearls have something real to reflect.
function makeStudio(THREE, renderer, dark) {
  const scene = new THREE.Scene();
  const dome = new THREE.SphereGeometry(30, 32, 16);
  const points = dome.attributes.position;
  const top = new THREE.Color(dark ? 0x4a1a22 : 0xfff3ec);
  const bottom = new THREE.Color(dark ? 0x120406 : 0xd8b4ae);
  const colours = [];
  const mix = new THREE.Color();
  for (let i = 0; i < points.count; i += 1) {
    mix.copy(bottom).lerp(top, points.getY(i) / 60 + 0.5);
    colours.push(mix.r, mix.g, mix.b);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

  const card = (x, y, z, w, h, hex, power) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  };
  card(6, 13, 10, 14, 10, 0xffffff, dark ? 5 : 3.5); // big soft light above
  card(-15, 2, 5, 6, 16, 0xffb3c4, dark ? 3 : 2); // pink strip on the left
  card(11, -7, -9, 10, 6, 0xdfe2b0, 1.4); // sage bounce from below

  const generator = new THREE.PMREMGenerator(renderer);
  const texture = generator.fromScene(scene, 0.03).texture;
  generator.dispose();
  return texture;
}

// Layout numbers are fractions of the visible width and height, so the
// arrangement holds at any screen size.
const LOOSE = [[-1.04, -0.5, 0, 0.5, 0], [1.02, 0.5, -1, 0.6, 0], [0.5, 0.94, -5, 0.5, 1], [0.98, -0.6, -3, 0.45, 3], [0.02, 0.86, -3, 0.3, 2], [0.3, 0.3, -8, 0.5, 1]];
const STARS = [[0.86, 0.15, 2, 0.24], [0.38, -0.62, 2.5, 0.26], [0.1, 0.62, 0, 0.16]];
const PATH_WIDE = [[1.25, 0.95, -1], [0.82, 0.6, 0], [0.34, 0.2, 1], [0.26, -0.4, 1.5], [0.46, -0.8, 0.5], [0.9, -1.2, -1]];
const PATH_NARROW = [[1.3, 0.86, -1], [0.7, 0.76, 0], [0.1, 0.62, 1], [-0.5, 0.5, 1], [-0.9, 0.36, 0], [-1.4, 0.24, -1]];

export async function initPearls({ reducedMotion, finePointer }) {
  const canvas = document.querySelector('[data-pearls]');
  const host = canvas?.parentElement;
  if (!canvas) return;

  let THREE;
  try {
    THREE = await loadThree();
  } catch {
    return; // No 3D, the hero still stands on its own.
  }

  const root = document.documentElement;
  const wide = window.matchMedia('(min-width: 62rem)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, wide ? 1.5 : 1.25));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 16;

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(4, 7, 8);
  const rimLight = new THREE.PointLight(0xff9fb4, 0.9, 40);
  rimLight.position.set(-8, -2, 6);
  const group = new THREE.Group();
  scene.add(keyLight, rimLight, group);

  const linear = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const pearl = (hex) =>
    new THREE.MeshPhysicalMaterial({ color: linear(hex), roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 });
  const pearls = [pearl(0xfff6f0), pearl(0xf4d3d1), pearl(0xf3e7d8), pearl(0xc3c79d)];
  const gold = new THREE.MeshStandardMaterial({ color: linear(0xecbda9), metalness: 1, roughness: 0.2 });
  const ball = new THREE.SphereGeometry(1, 36, 24);

  const outline = new THREE.Shape();
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 ? 0.3 : 1;
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 2;
    outline[i ? 'lineTo' : 'moveTo'](Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  const star = new THREE.ExtrudeGeometry(outline, { depth: 0.16, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 });
  star.center();

  const bodies = [];
  const add = (kind, geometry, material, size, extra) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0.0001);
    group.add(mesh);
    const body = {
      kind, mesh, size, size0: size,
      base: new THREE.Vector3(), ox: 0, oy: 0,
      phase: Math.random() * 6.28, speed: 0.4 + Math.random() * 0.6,
      index: bodies.length, ...extra,
    };
    bodies.push(body);
    return body;
  };

  // The strand: pearls grow toward the middle, with a gold bead every few pearls.
  const count = wide ? 44 : 24;
  const strand = [];
  for (let i = 0; i < count; i += 1) {
    const u = i / (count - 1);
    const bead = i % 6 === 3;
    strand.push(add('strand', ball, bead ? gold : pearls[i % 3], bead ? 0.1 : 0.13 + Math.sin(u * Math.PI) * 0.12, { u }));
  }
  const loose = [
    ...LOOSE.slice(0, wide ? 6 : 3).map((q) => add('loose', ball, pearls[q[4]], q[3] * (wide ? 1 : 0.7), { fx: q[0], fy: q[1], z: q[2] })),
    ...STARS.slice(0, wide ? 3 : 2).map((q) => add('star', star, gold, q[3], { fx: q[0], fy: q[1], z: q[2] })),
  ];

  let W = 8;
  let H = 5.5;
  const layout = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    H = Math.tan((19 * Math.PI) / 180) * 16;
    W = H * camera.aspect;

    const path = (width >= 992 ? PATH_WIDE : PATH_NARROW).map((q) => new THREE.Vector3(q[0] * W, q[1] * H, q[2]));
    const curve = new THREE.CatmullRomCurve3(path);
    const length = curve.getLength();
    const total = strand.reduce((sum, body) => sum + body.size0 * 2, 0);
    const fit = Math.max(0.6, Math.min(1.3, length / total));
    let at = 0;
    strand.forEach((body) => {
      body.size = body.size0 * fit;
      at += body.size;
      body.base.copy(curve.getPointAt(Math.min(1, at / length)));
      at += body.size;
    });
    loose.forEach((body) => body.base.set(body.fx * W, body.fy * H, body.z));
  };
  layout();
  window.addEventListener('resize', layout);

  const pointer = { nx: 0, ny: 0, y: 0, moved: false };
  if (finePointer) {
    window.addEventListener('pointermove', (event) => {
      pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.y = event.clientY;
      pointer.moved = true;
    });
  }

  const backOut = (k) => {
    const c = 1.70158;
    const q = k - 1;
    return 1 + (c + 1) * q * q * q + c * q * q;
  };

  const started = performance.now();
  const reach = 2.6;
  let shownAt = null;

  const draw = (now) => {
    const t = (now - started) / 1000;
    // The pieces pop in one after another once the intro curtain is up.
    if (shownAt === null && (reducedMotion || root.classList.contains('is-ready'))) {
      shownAt = reducedMotion ? -100 : t;
    }

    const push = pointer.moved && !reducedMotion;
    const mx = pointer.nx * W;
    const my = -(((pointer.y + window.scrollY) / host.clientHeight) * 2 - 1) * H - group.position.y;

    bodies.forEach((body) => {
      let { x, y, z } = body.base;
      if (body.kind === 'strand') {
        y += Math.sin(t * 1.1 - body.u * 9) * 0.16;
        z += Math.cos(t * 0.9 - body.u * 7) * 0.25;
      } else {
        y += Math.sin(t * body.speed + body.phase) * 0.4;
        x += Math.cos(t * body.speed * 0.6 + body.phase) * 0.25;
      }

      let tx = 0;
      let ty = 0;
      if (push) {
        const dx = x - mx;
        const dy = y - my;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < reach) {
          const force = (1 - distance / reach) ** 2 * 1.5;
          tx = (dx / distance) * force;
          ty = (dy / distance) * force;
        }
      }
      body.ox += (tx - body.ox) * 0.07;
      body.oy += (ty - body.oy) * 0.07;
      body.mesh.position.set(x + body.ox, y + body.oy, z);

      const grow = shownAt === null ? 0 : Math.max(0, Math.min(1, (t - shownAt - body.index * 0.022) / 0.9));
      body.mesh.scale.setScalar(Math.max(0.0001, body.size * backOut(grow)));
      if (body.kind === 'star') {
        body.mesh.rotation.y = t * body.speed + body.phase;
        body.mesh.rotation.z = Math.sin(t * 0.5 + body.phase) * 0.4;
      }
    });

    group.rotation.y += (pointer.nx * 0.16 - group.rotation.y) * 0.04;
    group.rotation.x += (pointer.ny * 0.1 - group.rotation.x) * 0.04;
    group.position.y = window.scrollY * 0.005;
    renderer.render(scene, camera);
  };

  // Lighting follows the theme: a bright studio in light mode, moodier in dark.
  const relight = () => {
    const dark = root.dataset.theme === 'dark';
    const previous = scene.environment;
    scene.environment = makeStudio(THREE, renderer, dark);
    previous?.dispose();
    renderer.toneMappingExposure = dark ? 0.95 : 1.05;
    if (reducedMotion) draw(started + 2000);
  };
  root.addEventListener('themechange', relight);
  relight();

  if (reducedMotion) return;

  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(host);

  const loop = (now) => {
    if (visible && !document.hidden) draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
