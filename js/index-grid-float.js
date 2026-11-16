/**
 * Home Aesthetic grid: buoyancy, 3D tumble, and cloth-like fabric warp.
 * Damped spring toward a current-driven rest, mouse/scroll/touch nudges,
 * rotateX/Y/Z with perspective, and a per-shirt mesh that billows more
 * at the sleeves and hem. Transforms only on wrappers so buy clicks work.
 * Index only. Pauses off-screen and freezes for reduced motion.
 */
(function () {
    'use strict';

    var grid = document.getElementById('index-explore-grid');
    if (!grid) return;

    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduced) return;

    var shirts = [];
    var rafId = 0;
    var running = false;
    var lastTime = 0;
    var inView = true;
    var pageHidden = document.visibilityState === 'hidden';
    var lastScrollY = window.scrollY || 0;
    var scrollImpulse = 0;
    var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    var pointer = {
        x: 0, y: 0, on: false, vx: 0, vy: 0,
        lastX: 0, lastY: 0, lastT: 0
    };

    var SPRING = 4.2;
    var DAMPING = 3.2;
    var ANG_SPRING = 3.4;
    var ANG_DAMPING = 2.3;
    var PUSH_ACCEL = 340;
    var WAKE = 0.12;
    var SCROLL_FORCE = 9.5;
    var MAX_X = 22;
    var MAX_Y = 22;
    var MAX_RX = 14;
    var MAX_RY = 16;
    var MAX_RZ = 8;
    var LIFT_Z = 80;

    function visibleCard(el) {
        if (!el || el.hidden || el.getAttribute('hidden') !== null) return false;
        var cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
    }

    function hash(n) {
        var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    function ensureWrap(img) {
        if (img.parentNode && img.parentNode.classList && img.parentNode.classList.contains('index-shirt-cloth')) {
            return img.parentNode;
        }
        var wrap = document.createElement('div');
        wrap.className = 'index-shirt-cloth';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
        var canvas = document.createElement('canvas');
        canvas.className = 'index-shirt-cloth-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        wrap.appendChild(canvas);
        return wrap;
    }

    function collect() {
        shirts = [];
        var nodes = grid.querySelectorAll('#exploreProducts > .explore-hero-section, #exploreProducts > .explore-grid-placeholder');
        Array.prototype.forEach.call(nodes, function (el, i) {
            if (!visibleCard(el)) return;
            var img = el.querySelector('.explore-hero-img, .explore-grid-placeholder-img');
            var info = el.querySelector('.explore-hero-info');
            if (!img) return;
            var wrap = ensureWrap(img);
            var canvas = wrap.querySelector('.index-shirt-cloth-canvas');
            var s = i + 1.17;
            shirts.push({
                el: el,
                img: img,
                wrap: wrap,
                canvas: canvas,
                info: info,
                mass: 0.78 + hash(s * 3.1) * 0.7,
                ampX: 6 + hash(s * 5.2) * 8,
                ampY: 8 + hash(s * 8.9) * 8,
                ampRx: 5 + hash(s * 1.9) * 6,
                ampRy: 6 + hash(s * 2.7) * 7,
                ampRz: 3 + hash(s * 3.3) * 4,
                w1: 0.22 + hash(s * 2.4) * 0.2,
                w2: 0.48 + hash(s * 4.7) * 0.32,
                w3: 0.9 + hash(s * 6.1) * 0.5,
                wRx: 0.2 + hash(s * 9.1) * 0.22,
                wRy: 0.16 + hash(s * 7.4) * 0.2,
                wRz: 0.28 + hash(s * 5.6) * 0.24,
                p1: hash(s * 1.3) * Math.PI * 2,
                p2: hash(s * 2.8) * Math.PI * 2,
                p3: hash(s * 3.9) * Math.PI * 2,
                p4: hash(s * 4.4) * Math.PI * 2,
                p5: hash(s * 7.6) * Math.PI * 2,
                pRx: hash(s * 8.2) * Math.PI * 2,
                pRy: hash(s * 6.6) * Math.PI * 2,
                pRz: hash(s * 4.1) * Math.PI * 2,
                seed: s * 12.9898,
                waveAmp: 0.05 + hash(s * 11.2) * 0.035,
                waveSpeed: 1.15 + hash(s * 10.4) * 0.7,
                x: 0, y: 0, vx: 0, vy: 0,
                rx: 0, ry: 0, rz: 0,
                rvx: 0, rvy: 0, rvz: 0,
                cx: 0, cy: 0, inView: true,
                texReady: false
            });
        });
    }

    function copyState(from, to) {
        var keys = ['x','y','vx','vy','rx','ry','rz','rvx','rvy','rvz','ampX','ampY','ampRx','ampRy','ampRz','mass','w1','w2','w3','wRx','wRy','wRz','p1','p2','p3','p4','p5','pRx','pRy','pRz','seed','waveAmp','waveSpeed','tex','texReady'];
        var i;
        for (i = 0; i < keys.length; i++) to[keys[i]] = from[keys[i]];
    }

    function recollect() {
        var saved = shirts.slice();
        collect();
        var i, s, found;
        for (i = 0; i < shirts.length; i++) {
            found = null;
            for (s = 0; s < saved.length; s++) {
                if (saved[s].el === shirts[i].el) { found = saved[s]; break; }
            }
            if (found) copyState(found, shirts[i]);
        }
        if (shirts.length) {
            grid.classList.add('is-float-physics');
            cacheRects();
            prepareCloth();
            start();
        }
    }

    function cacheRects() {
        var i, s, r, img;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            img = s.wrap || s.img;
            if (!img) continue;
            r = img.getBoundingClientRect();
            s.cx = r.left + r.width * 0.5 - s.x;
            s.cy = r.top + r.height * 0.5 - s.y;
            s.inView = r.bottom > -80 && r.top < (window.innerHeight + 80);
            if (s.wrap) s.wrap.style.willChange = s.inView ? 'transform' : 'auto';
            if (s.info) s.info.style.willChange = s.inView ? 'transform' : 'auto';
        }
    }

    function apply(s) {
        var shirtTx = 'translate3d(' + s.x.toFixed(3) + 'px, ' + s.y.toFixed(3) + 'px, ' + LIFT_Z + 'px) rotateX(' + s.rx.toFixed(3) + 'deg) rotateY(' + s.ry.toFixed(3) + 'deg) rotateZ(' + s.rz.toFixed(3) + 'deg)';
        var infoTx = 'translate3d(' + s.x.toFixed(3) + 'px, ' + s.y.toFixed(3) + 'px, 0) rotate(' + (s.rz * 0.28).toFixed(3) + 'deg)';
        if (s.wrap) s.wrap.style.transform = shirtTx;
        if (s.info) s.info.style.transform = infoTx;
    }

    function passwordOpen() {
        return !!(grid.querySelector && grid.querySelector('.password-overlay.active'));
    }

    function shouldRun() {
        return inView && !pageHidden && !passwordOpen();
    }

    function currents(s, t) {
        var n = Math.sin(t * 0.31 + s.seed) * Math.sin(t * 0.47 + s.p5) * Math.sin(t * 0.17 + s.seed * 0.4);
        var flowX = 11 * Math.sin(t * 0.15 + 0.4) + 5 * Math.sin(t * 0.37 + s.p1);
        var flowY = 6 * Math.sin(t * 0.12 + 1.1) + 3 * Math.sin(t * 0.29 + s.p3);
        return {
            x: s.ampX * (0.6 * Math.sin(t * s.w1 + s.p1) + 0.26 * Math.sin(t * s.w2 + s.p2) + 0.14 * n) + flowX,
            y: s.ampY * (0.68 * Math.sin(t * s.w1 * 0.86 + s.p3) + 0.22 * Math.sin(t * s.w2 * 1.07 + s.p4) + 0.12 * n) - s.ampY * 0.06 + flowY * 0.55
        };
    }

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function step(s, t, dt) {
        var rest = currents(s, t);
        var fx = 0, fy = 0;
        var mass = s.mass;
        var dx, dy, d, fall, inv, pushR;

        fx += -SPRING * (s.x - rest.x);
        fy += -SPRING * (s.y - rest.y);
        fx += -DAMPING * s.vx;
        fy += -DAMPING * s.vy;

        if (pointer.on) {
            dx = s.cx - pointer.x;
            dy = s.cy - pointer.y;
            d = Math.sqrt(dx * dx + dy * dy);
            pushR = 240;
            if (d < pushR && d > 0.001) {
                fall = 1 - d / pushR;
                fall *= fall;
                inv = 1 / d;
                fx += dx * inv * PUSH_ACCEL * fall;
                fy += dy * inv * PUSH_ACCEL * fall;
                fx += pointer.vx * WAKE * fall;
                fy += pointer.vy * WAKE * fall;
                s.rvy += (dx * inv) * 28 * fall * dt;
                s.rvx += (-dy * inv) * 22 * fall * dt;
            }
        }

        fy += scrollImpulse * SCROLL_FORCE;
        s.rvx += scrollImpulse * 4 * dt;

        s.vx += (fx / mass) * dt;
        s.vy += (fy / mass) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.x = clamp(s.x, -MAX_X, MAX_X);
        s.y = clamp(s.y, -MAX_Y, MAX_Y);

        var restRx = s.ampRx * Math.sin(t * s.wRx + s.pRx) + s.vy * 0.08;
        var restRy = s.ampRy * Math.sin(t * s.wRy + s.pRy) + s.vx * 0.1;
        var restRz = s.ampRz * Math.sin(t * s.wRz + s.pRz) + s.vx * 0.07;
        s.rvx += ((restRx - s.rx) * ANG_SPRING - s.rvx * ANG_DAMPING) * dt;
        s.rvy += ((restRy - s.ry) * ANG_SPRING - s.rvy * ANG_DAMPING) * dt;
        s.rvz += ((restRz - s.rz) * ANG_SPRING - s.rvz * ANG_DAMPING) * dt;
        s.rx = clamp(s.rx + s.rvx * dt, -MAX_RX, MAX_RX);
        s.ry = clamp(s.ry + s.rvy * dt, -MAX_RY, MAX_RY);
        s.rz = clamp(s.rz + s.rvz * dt, -MAX_RZ, MAX_RZ);
    }

    /* ---------- cloth renderer (shared WebGL, blit to per-shirt canvas) ---------- */
    var glCanvas = null;
    var gl = null;
    var glProg = null;
    var glBuf = null;
    var glIdx = null;
    var glIdxCount = 0;
    var glUniforms = {};
    var glAuv = -1;
    var useGL = false;
    var meshCols = isMobile ? 8 : 14;
    var meshRows = isMobile ? 10 : 16;
    var CLOTH_PAD = 0.18;

    function compile(type, src) {
        var sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.warn('cloth shader', gl.getShaderInfoLog(sh));
            return null;
        }
        return sh;
    }

    function initGL() {
        glCanvas = document.createElement('canvas');
        try {
            gl = glCanvas.getContext('webgl', {
                alpha: true,
                premultipliedAlpha: true,
                antialias: false,
                preserveDrawingBuffer: true
            });
        } catch (err) {
            gl = null;
        }
        if (!gl) return false;

        var vs = compile(gl.VERTEX_SHADER, [
            'attribute vec2 a_uv;',
            'uniform float u_time, u_amp, u_speed, u_phase, u_pad;',
            'varying vec2 v_uv;',
            'void main() {',
            '  float u = a_uv.x;',
            '  float v = a_uv.y;',
            '  float hem = smoothstep(0.42, 1.0, v);',
            '  float sleeve = pow(abs(u - 0.5) * 2.0, 1.35) * (1.0 - abs(v - 0.42) * 1.15);',
            '  sleeve = clamp(sleeve, 0.0, 1.0);',
            '  float edge = max(hem, sleeve);',
            '  float wgt = 0.22 + 0.78 * edge;',
            '  float t = u_time * u_speed + u_phase;',
            '  float w1 = sin(u * 8.2 + v * 3.4 + t * 1.55);',
            '  float w2 = sin(u * 5.1 - v * 6.6 + t * 2.15 + 1.7);',
            '  float w3 = sin((u + v) * 11.0 + t * 1.05 + 0.6);',
            '  vec2 disp = vec2(',
            '    w1 * 0.55 + w2 * 0.3 + w3 * 0.15,',
            '    w1 * 0.35 + w3 * 0.4 + w2 * 0.25',
            '  ) * u_amp * wgt;',
            '  float billow = 1.0 + (w2 * 0.55 + w1 * 0.35) * u_amp * 2.4 * edge;',
            '  float scale = 1.0 / (1.0 + 2.0 * u_pad);',
            '  vec2 p = (a_uv + disp - 0.5) * billow * scale;',
            /* p is already centered in ~[-0.5,0.5]; +Y in clip space is the top of the canvas. */
            '  gl_Position = vec4(p.x * 2.0, -p.y * 2.0, 0.0, 1.0);',
            '  v_uv = a_uv;',
            '}'
        ].join('\n'));
        var fs = compile(gl.FRAGMENT_SHADER, [
            'precision mediump float;',
            'uniform sampler2D u_tex;',
            'varying vec2 v_uv;',
            'void main() {',
            '  gl_FragColor = texture2D(u_tex, v_uv);',
            '}'
        ].join('\n'));
        if (!vs || !fs) return false;
        glProg = gl.createProgram();
        gl.attachShader(glProg, vs);
        gl.attachShader(glProg, fs);
        gl.linkProgram(glProg);
        if (!gl.getProgramParameter(glProg, gl.LINK_STATUS)) {
            console.warn('cloth program', gl.getProgramInfoLog(glProg));
            return false;
        }
        gl.useProgram(glProg);
        glAuv = gl.getAttribLocation(glProg, 'a_uv');
        glUniforms.time = gl.getUniformLocation(glProg, 'u_time');
        glUniforms.amp = gl.getUniformLocation(glProg, 'u_amp');
        glUniforms.speed = gl.getUniformLocation(glProg, 'u_speed');
        glUniforms.phase = gl.getUniformLocation(glProg, 'u_phase');
        glUniforms.pad = gl.getUniformLocation(glProg, 'u_pad');
        glUniforms.tex = gl.getUniformLocation(glProg, 'u_tex');

        var cols = meshCols, rows = meshRows;
        var verts = [];
        var idx = [];
        var y, x, i;
        for (y = 0; y <= rows; y++) {
            for (x = 0; x <= cols; x++) {
                verts.push(x / cols, y / rows);
            }
        }
        for (y = 0; y < rows; y++) {
            for (x = 0; x < cols; x++) {
                i = y * (cols + 1) + x;
                idx.push(i, i + 1, i + cols + 1, i + 1, i + cols + 2, i + cols + 1);
            }
        }
        glBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        glIdx = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
        glIdxCount = idx.length;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        useGL = true;
        glCanvas.addEventListener('webglcontextlost', function (e) {
            e.preventDefault();
            useGL = false;
            gl = null;
            var i;
            for (i = 0; i < shirts.length; i++) {
                shirts[i].tex = null;
                shirts[i].texReady = false;
                shirts[i].usingFallback = false;
                showImgFallback(shirts[i]);
            }
        }, false);
        glCanvas.addEventListener('webglcontextrestored', function () {
            var i;
            gl = null;
            useGL = false;
            if (!initGL()) {
                for (i = 0; i < shirts.length; i++) showImgFallback(shirts[i]);
                return;
            }
            for (i = 0; i < shirts.length; i++) {
                shirts[i].tex = null;
                shirts[i].texReady = false;
                shirts[i].usingFallback = false;
                bindTexture(shirts[i]);
                if (!shirts[i].texReady) showImgFallback(shirts[i]);
            }
        }, false);
        return true;
    }

    function showImgFallback(s) {
        if (s.wrap) s.wrap.classList.remove('is-cloth-live');
        if (s.img) s.img.style.opacity = '1';
        if (s.canvas) s.canvas.style.opacity = '0';
        s.usingFallback = true;
        s.clothLive = false;
    }

    function hideImgFallback(s) {
        s.usingFallback = false;
        if (s.wrap) s.wrap.classList.add('is-cloth-live');
        if (s.img) s.img.style.opacity = '';
        if (s.canvas) s.canvas.style.opacity = '';
        s.clothLive = true;
    }

    var inkProbe = document.createElement('canvas');
    inkProbe.width = 48;
    inkProbe.height = 48;
    var inkProbeCtx = inkProbe.getContext('2d', { willReadFrequently: true });

    function canvasHasInk(s) {
        if (!s.ctx2d || !s.canvas || s.canvas.width < 4) return false;
        try {
            inkProbeCtx.clearRect(0, 0, 48, 48);
            inkProbeCtx.drawImage(s.canvas, 0, 0, 48, 48);
            var data = inkProbeCtx.getImageData(0, 0, 48, 48).data;
            var i, hits = 0;
            for (i = 3; i < data.length; i += 4) {
                if (data[i] > 12) hits++;
            }
            return hits > 20;
        } catch (err) {
            return false;
        }
    }

    function bindTexture(s) {
        if (!s.img || !s.img.naturalWidth) return false;
        if (!useGL) return false;
        if (!s.tex) s.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        try {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.img);
            s.texReady = true;
            return true;
        } catch (err) {
            s.texReady = false;
            return false;
        }
    }

    function watchImage(s) {
        function ready() {
            sizeCloth(s);
            if (!bindTexture(s) && !useGL) hideImgFallback(s);
            if (!s.texReady && useGL && !(s.img.complete && s.img.naturalWidth)) return;
            if (!s.texReady && s.img.complete && s.img.naturalWidth && useGL) {
                /* WebGL upload failed — keep the original sharp image visible. */
                showImgFallback(s);
            }
        }
        if (s.img.complete && s.img.naturalWidth) {
            ready();
            return;
        }
        s.img.addEventListener('load', ready, { once: true });
        s.img.addEventListener('error', function () { showImgFallback(s); }, { once: true });
        if (s.img.decode) {
            s.img.decode().then(ready).catch(function () {});
        }
    }

    function prepareCloth() {
        if (!useGL && gl === null) initGL();
        var i, s;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            if (!s.canvas) continue;
            if (!s.ctx2d) s.ctx2d = s.canvas.getContext('2d');
            watchImage(s);
            sizeCloth(s);
        }
    }

    function sizeCloth(s) {
        if (!s.canvas || !s.img) return;
        /* Layout size, not the 3D-projected bounding box — otherwise the canvas
           bakes in foreshortening and the parent rotateX flattens the shirt twice. */
        var w0 = s.img.offsetWidth || (s.wrap && s.wrap.offsetWidth) || 0;
        var h0 = s.img.offsetHeight || (s.wrap && s.wrap.offsetHeight) || 0;
        if (w0 < 2 || h0 < 2) return;
        var dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
        var scale = 1 + 2 * CLOTH_PAD;
        var w = Math.max(2, Math.round(w0 * scale * dpr));
        var h = Math.max(2, Math.round(h0 * scale * dpr));
        if (s.canvas.width !== w || s.canvas.height !== h) {
            s.canvas.width = w;
            s.canvas.height = h;
        }
    }

    function renderClothGL(s, t) {
        var w = s.canvas.width, h = s.canvas.height;
        if (w < 2 || h < 2 || !s.texReady) return;
        if (glCanvas.width !== w || glCanvas.height !== h) {
            glCanvas.width = w;
            glCanvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(glProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIdx);
        gl.enableVertexAttribArray(glAuv);
        gl.vertexAttribPointer(glAuv, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.uniform1i(glUniforms.tex, 0);
        gl.uniform1f(glUniforms.time, t);
        gl.uniform1f(glUniforms.amp, s.waveAmp);
        gl.uniform1f(glUniforms.speed, s.waveSpeed);
        gl.uniform1f(glUniforms.phase, s.p5);
        gl.uniform1f(glUniforms.pad, CLOTH_PAD);
        gl.drawElements(gl.TRIANGLES, glIdxCount, gl.UNSIGNED_SHORT, 0);
        try {
            s.ctx2d.clearRect(0, 0, w, h);
            s.ctx2d.drawImage(glCanvas, 0, 0);
            return true;
        } catch (err) {
            return false;
        }
    }

    function warp2d(s, u, v, t) {
        var hem = v < 0.42 ? 0 : (v - 0.42) / 0.58;
        var sleeve = Math.pow(Math.abs(u - 0.5) * 2, 1.35) * (1 - Math.abs(v - 0.42) * 1.15);
        if (sleeve < 0) sleeve = 0;
        if (sleeve > 1) sleeve = 1;
        var edge = hem > sleeve ? hem : sleeve;
        var wgt = 0.22 + 0.78 * edge;
        var tm = t * s.waveSpeed + s.p5;
        var w1 = Math.sin(u * 8.2 + v * 3.4 + tm * 1.55);
        var w2 = Math.sin(u * 5.1 - v * 6.6 + tm * 2.15 + 1.7);
        var amp = s.waveAmp * wgt;
        return { x: (w1 * 0.55 + w2 * 0.3) * amp, y: (w1 * 0.35 + w2 * 0.25) * amp };
    }

    function renderCloth2d(s, t) {
        var ctx = s.ctx2d;
        var w = s.canvas.width, h = s.canvas.height;
        if (!s.img.naturalWidth || w < 2) return;
        var rows = isMobile ? 10 : 16;
        var imgW = s.img.naturalWidth, imgH = s.img.naturalHeight;
        var innerW = w / (1 + 2 * CLOTH_PAD);
        var innerH = h / (1 + 2 * CLOTH_PAD);
        var ox = (w - innerW) / 2;
        var oy = (h - innerH) / 2;
        var sh = imgH / rows;
        var dh = innerH / rows;
        var y, v, d, dx;
        ctx.clearRect(0, 0, w, h);
        for (y = 0; y < rows; y++) {
            v = (y + 0.5) / rows;
            d = warp2d(s, 0.5, v, t);
            dx = d.x * innerW;
            ctx.drawImage(s.img, 0, y * sh, imgW, sh + 1, ox + dx, oy + y * dh + d.y * innerH, innerW, dh + 1);
        }
    }

    function renderCloth(s, t) {
        if (!s.inView || !s.canvas || !s.ctx2d) {
            if (s.inView && s.img && s.img.naturalWidth) showImgFallback(s);
            return;
        }
        if (s.canvas.width < 4 || s.canvas.height < 4) {
            sizeCloth(s);
        }
        if (useGL && gl && gl.isContextLost && gl.isContextLost()) {
            useGL = false;
            showImgFallback(s);
            return;
        }
        if (useGL && !s.texReady && s.img.complete && s.img.naturalWidth) {
            bindTexture(s);
        }
        var drew = false;
        if (useGL && s.texReady) drew = renderClothGL(s, t);
        else if (s.img.naturalWidth) {
            renderCloth2d(s, t);
            drew = true;
        }
        if (drew && canvasHasInk(s)) hideImgFallback(s);
        else showImgFallback(s);
    }

    function frame(now) {
        rafId = 0;
        if (!shouldRun()) {
            running = false;
            lastTime = 0;
            return;
        }
        if (!lastTime) lastTime = now;
        var dt = (now - lastTime) / 1000;
        lastTime = now;
        if (dt > 0.05) dt = 0.05;
        if (dt < 0.001) dt = 0.001;
        var t = now / 1000;
        scrollImpulse *= Math.pow(0.08, dt);
        if (Math.abs(scrollImpulse) < 0.001) scrollImpulse = 0;
        pointer.vx *= Math.pow(0.12, dt);
        pointer.vy *= Math.pow(0.12, dt);

        var i, s;
        for (i = 0; i < shirts.length; i++) {
            s = shirts[i];
            step(s, t, dt);
            apply(s);
            if (s.inView) renderCloth(s, t);
        }
        running = true;
        rafId = window.requestAnimationFrame(frame);
    }

    function start() {
        if (running || !shouldRun()) return;
        cacheRects();
        lastTime = 0;
        running = true;
        rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        lastTime = 0;
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function sync() {
        if (shouldRun()) start();
        else stop();
    }

    if (typeof IntersectionObserver === 'function') {
        var io = new IntersectionObserver(function (entries) {
            inView = !!(entries[0] && entries[0].isIntersecting);
            sync();
        }, { root: null, threshold: 0.05 });
        io.observe(grid);
    }

    document.addEventListener('visibilitychange', function () {
        pageHidden = document.visibilityState === 'hidden';
        sync();
    });

    window.addEventListener('scroll', function () {
        var y = window.scrollY || 0;
        var dy = y - lastScrollY;
        lastScrollY = y;
        scrollImpulse += dy * 0.065;
        if (scrollImpulse > 18) scrollImpulse = 18;
        if (scrollImpulse < -18) scrollImpulse = -18;
        cacheRects();
    }, { passive: true });

    window.addEventListener('resize', function () {
        isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
        window.setTimeout(function () {
            recollect();
            var i;
            for (i = 0; i < shirts.length; i++) sizeCloth(shirts[i]);
        }, 60);
    });

    function onPointer(e) {
        var now = performance.now();
        var dt = pointer.lastT ? (now - pointer.lastT) / 1000 : 0.016;
        if (dt < 0.001) dt = 0.001;
        if (pointer.on) {
            pointer.vx = (e.clientX - pointer.lastX) / dt;
            pointer.vy = (e.clientY - pointer.lastY) / dt;
        }
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.lastX = e.clientX;
        pointer.lastY = e.clientY;
        pointer.lastT = now;
        pointer.on = true;
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') pointer.on = false;
        pointer.vx = 0;
        pointer.vy = 0;
    }, { passive: true });
    window.addEventListener('pointercancel', function () {
        pointer.on = false;
        pointer.vx = 0;
        pointer.vy = 0;
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
        pointer.on = false;
    });
    document.addEventListener('click', function () {
        window.setTimeout(sync, 0);
    }, true);

    function boot() { recollect(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
    window.setTimeout(recollect, 0);
    window.setTimeout(recollect, 250);

    var products = document.getElementById('exploreProducts');
    if (products && typeof MutationObserver === 'function') {
        var mo = new MutationObserver(function () { recollect(); });
        mo.observe(products, { childList: true });
    }
})();
