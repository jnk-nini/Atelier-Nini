// The hero portrait is redrawn on a WebGL canvas so it can react to the
// pointer: the image drags and settles like fabric being brushed by a hand.
// If WebGL is missing the plain <img> simply stays.

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D uImage;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform vec2 uCover;
uniform float uTime;
uniform float uPower;
varying vec2 vUv;

void main() {
  float reach = smoothstep(0.55, 0.0, distance(vUv, uPointer));
  vec2 drag = uVelocity * reach;

  // A slow ripple that only shows while the cloth is disturbed.
  float wave = sin(vUv.y * 14.0 + uTime * 2.2) * 0.004 * uPower * reach;
  vec2 uv = vUv - drag + vec2(wave, 0.0);

  // Same crop as object-fit: cover with the focus slightly above centre.
  vec2 st = (uv - vec2(0.5, 0.8)) * uCover + vec2(0.5, 0.8);

  float split = length(drag) * 0.35;
  float r = texture2D(uImage, st + drag * split).r;
  float g = texture2D(uImage, st).g;
  float b = texture2D(uImage, st - drag * split).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function initPortrait() {
  const frame = document.querySelector('[data-portrait]');
  const img = frame?.querySelector('img');
  if (!frame || !img) return;

  const start = () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const uniform = (name) => gl.getUniformLocation(program, name);
    const uPointer = uniform('uPointer');
    const uVelocity = uniform('uVelocity');
    const uCover = uniform('uCover');
    const uTime = uniform('uTime');
    const uPower = uniform('uPower');

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = frame.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);

      const box = width / height;
      const image = img.naturalWidth / img.naturalHeight;
      gl.uniform2f(uCover, box < image ? box / image : 1, box < image ? 1 : image / box);
    };

    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };
    const velocity = { x: 0, y: 0 };
    let running = false;
    let inside = false;

    const draw = (now) => {
      const px = eased.x;
      const py = eased.y;
      eased.x += (pointer.x - eased.x) * 0.12;
      eased.y += (pointer.y - eased.y) * 0.12;

      // Velocity chases the pointer's movement and decays on its own.
      velocity.x += ((eased.x - px) * 4.5 - velocity.x) * 0.18;
      velocity.y += ((eased.y - py) * 4.5 - velocity.y) * 0.18;
      const power = Math.min(Math.hypot(velocity.x, velocity.y) * 14, 1);

      gl.uniform2f(uPointer, eased.x, eased.y);
      gl.uniform2f(uVelocity, velocity.x, velocity.y);
      gl.uniform1f(uTime, now / 1000);
      gl.uniform1f(uPower, power);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (inside || power > 0.002) requestAnimationFrame(draw);
      else running = false;
    };

    const wake = () => {
      if (running) return;
      running = true;
      requestAnimationFrame(draw);
    };

    frame.addEventListener('pointermove', (event) => {
      const box = frame.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width;
      pointer.y = 1 - (event.clientY - box.top) / box.height;
      inside = true;
      wake();
    });
    frame.addEventListener('pointerleave', () => {
      inside = false;
    });

    new ResizeObserver(() => {
      resize();
      wake();
    }).observe(frame);

    resize();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    frame.append(canvas);
    frame.classList.add('has-canvas');
    wake();
  };

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
}
