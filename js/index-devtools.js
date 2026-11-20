/**
 * Decorative Chrome DevTools Sources panel for the home hero.
 * Visual only — not real developer tools. Source text is scrubbed of secrets.
 */
(function () {
    'use strict';

    var root = document.getElementById('hero-devtools');
    if (!root) return;

    var SOURCES = {"index-grid-float.js":{"path":"eekseye.com/js/index-grid-float.js","lang":"js","text":"/**\n * Home Aesthetic grid: buoyancy, 3D tumble, and cloth-like fabric warp.\n * Damped spring toward a current-driven rest, mouse/scroll/touch nudges,\n * rotateX/Y/Z with perspective, and a per-shirt mesh that billows more\n * at the sleeves and hem. Transforms only on wrappers so buy clicks work.\n * Index only. Pauses off-screen and freezes for reduced motion.\n */\n(function () {\n    'use strict';\n\n    var grid = document.getElementById('index-explore-grid');\n    if (!grid) return;\n\n    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);\n    if (reduced) return;\n\n    var shirts = [];\n    var rafId = 0;\n    var running = false;\n    var lastTime = 0;\n    var inView = true;\n    var pageHidden = document.visibilityState === 'hidden';\n    var lastScrollY = window.scrollY || 0;\n    var scrollImpulse = 0;\n    var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;\n    var pointer = {\n        x: 0, y: 0, on: false, vx: 0, vy: 0,\n        lastX: 0, lastY: 0, lastT: 0\n    };\n\n    var SPRING = 2.0;\n    var DAMPING = 4.6;\n    var ANG_SPRING = 1.8;\n    var ANG_DAMPING = 3.8;\n    var PUSH_ACCEL = 180;\n    var WAKE = 0.07;\n    var SCROLL_FORCE = 4.8;\n    var MAX_X = 14;\n    var MAX_Y = 14;\n    var MAX_RX = 10;\n    var MAX_RY = 10;\n    var MAX_RZ = 6;\n    var PUSH_RADIUS = 320;\n    var LIFT_Z = 80;\n\n    function visibleCard(el) {\n        if (!el || el.hidden || el.getAttribute('hidden') !== null) return false;\n        var cs = window.getComputedStyle(el);\n        return cs.display !== 'none' && cs.visibility !== 'hidden';\n    }\n\n    function hash(n) {\n        var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;\n        return x - Math.floor(x);\n    }\n\n    function ensureWrap(img) {\n        if (img.parentNode && img.parentNode.classList && img.parentNode.classList.contains('index-shirt-cloth')) {\n            return img.parentNode;\n        }\n        var wrap = document.createElement('div');\n        wrap.className = 'index-shirt-cloth';\n        img.parentNode.insertBefore(wrap, img);\n        wrap.appendChild(img);\n        var canvas = document.createElement('canvas');\n        canvas.className = 'index-shirt-cloth-canvas';\n        canvas.setAttribute('aria-hidden', 'true');\n        wrap.appendChild(canvas);\n        return wrap;\n    }\n\n    function collect() {\n        shirts = [];\n        var nodes = grid.querySelectorAll('#exploreProducts > .explore-hero-section, #exploreProducts > .explore-grid-placeholder');\n        Array.prototype.forEach.call(nodes, function (el, i) {\n            if (!visibleCard(el)) return;\n            var img = el.querySelector('.explore-hero-img, .explore-grid-placeholder-img');\n            var info = el.querySelector('.explore-hero-info');\n            if (!img) return;\n            var wrap = ensureWrap(img);\n            var canvas = wrap.querySelector('.index-shirt-cloth-canvas');\n            var s = i + 1.17;\n            shirts.push({\n                el: el,\n                img: img,\n                wrap: wrap,\n                canvas: canvas,\n                info: info,\n                mass: 0.78 + hash(s * 3.1) * 0.7,\n                ampX: 4 + hash(s * 5.2) * 6,\n                ampY: 5 + hash(s * 8.9) * 6,\n                ampRx: 3.2 + hash(s * 1.9) * 4,\n                ampRy: 3.6 + hash(s * 2.7) * 4.4,\n                ampRz: 2 + hash(s * 3.3) * 2.8,\n                w1: 0.10 + hash(s * 2.4) * 0.09,\n                w2: 0.20 + hash(s * 4.7) * 0.13,\n                w3: 0.36 + hash(s * 6.1) * 0.20,\n                wRx: 0.09 + hash(s * 9.1) * 0.09,\n                wRy: 0.07 + hash(s * 7.4) * 0.09,\n                wRz: 0.11 + hash(s * 5.6) * 0.10,\n                p1: hash(s * 1.3) * Math.PI * 2,\n                p2: hash(s * 2.8) * Math.PI * 2,\n                p3: hash(s * 3.9) * Math.PI * 2,\n                p4: hash(s * 4.4) * Math.PI * 2,\n                p5: hash(s * 7.6) * Math.PI * 2,\n                pRx: hash(s * 8.2) * Math.PI * 2,\n                pRy: hash(s * 6.6) * Math.PI * 2,\n                pRz: hash(s * 4.1) * Math.PI * 2,\n                seed: s * 12.9898,\n                waveAmp: 0.032 + hash(s * 11.2) * 0.024,\n                waveSpeed: 0.55 + hash(s * 10.4) * 0.30,\n                x: 0, y: 0, vx: 0, vy: 0,\n                rx: 0, ry: 0, rz: 0,\n                rvx: 0, rvy: 0, rvz: 0,\n                cx: 0, cy: 0, inView: true,\n                texReady: false\n            });\n        });\n    }\n\n    function copyState(from, to) {\n        var keys = ['x','y','vx','vy','rx','ry','rz','rvx','rvy','rvz','ampX','ampY','ampRx','ampRy','ampRz','mass','w1','w2','w3','wRx','wRy','wRz','p1','p2','p3','p4','p5','pRx','pRy','pRz','seed','waveAmp','waveSpeed','tex','texReady'];\n        var i;\n        for (i = 0; i < keys.length; i++) to[keys[i]] = from[keys[i]];\n    }\n\n    function recollect() {\n        var saved = shirts.slice();\n        collect();\n        var i, s, found;\n        for (i = 0; i < shirts.length; i++) {\n            found = null;\n            for (s = 0; s < saved.length; s++) {\n                if (saved[s].el === shirts[i].el) { found = saved[s]; break; }\n            }\n            if (found) copyState(found, shirts[i]);\n        }\n        if (shirts.length) {\n            grid.classList.add('is-float-physics');\n            cacheRects();\n            prepareCloth();\n            start();\n        }\n    }\n\n    function cacheRects() {\n        var i, s, r, img;\n        for (i = 0; i < shirts.length; i++) {\n            s = shirts[i];\n            img = s.wrap || s.img;\n            if (!img) continue;\n            r = img.getBoundingClientRect();\n            s.cx = r.left + r.width * 0.5 - s.x;\n            s.cy = r.top + r.height * 0.5 - s.y;\n            s.inView = r.bottom > -80 && r.top < (window.innerHeight + 80);\n            if (s.wrap) s.wrap.style.willChange = s.inView ? 'transform' : 'auto';\n            if (s.info) s.info.style.willChange = s.inView ? 'transform' : 'auto';\n        }\n    }\n\n    function apply(s) {\n        var shirtTx = 'translate3d(' + s.x.toFixed(3) + 'px, ' + s.y.toFixed(3) + 'px, ' + LIFT_Z + 'px) rotateX(' + s.rx.toFixed(3) + 'deg) rotateY(' + s.ry.toFixed(3) + 'deg) rotateZ(' + s.rz.toFixed(3) + 'deg)';\n        var infoTx = 'translate3d(' + s.x.toFixed(3) + 'px, ' + s.y.toFixed(3) + 'px, 0) rotate(' + (s.rz * 0.28).toFixed(3) + 'deg)';\n        if (s.wrap) s.wrap.style.transform = shirtTx;\n        if (s.info) s.info.style.transform = infoTx;\n    }\n\n    function passwordOpen() {\n        return !!(grid.querySelector && grid.querySelector('.password-overlay.active'));\n    }\n\n    function shouldRun() {\n        return inView && !pageHidden && !passwordOpen();\n    }\n\n    function currents(s, t) {\n        var n = Math.sin(t * 0.15 + s.seed) * Math.sin(t * 0.22 + s.p5) * Math.sin(t * 0.08 + s.seed * 0.4);\n        var flowX = 7 * Math.sin(t * 0.07 + 0.4) + 3.2 * Math.sin(t * 0.17 + s.p1);\n        var flowY = 4 * Math.sin(t * 0.06 + 1.1) + 2 * Math.sin(t * 0.13 + s.p3);\n        return {\n            x: s.ampX * (0.6 * Math.sin(t * s.w1 + s.p1) + 0.26 * Math.sin(t * s.w2 + s.p2) + 0.14 * n) + flowX,\n            y: s.ampY * (0.68 * Math.sin(t * s.w1 * 0.86 + s.p3) + 0.22 * Math.sin(t * s.w2 * 1.07 + s.p4) + 0.12 * n) - s.ampY * 0.06 + flowY * 0.55\n        };\n    }\n\n    function clamp(v, lo, hi) {\n        return v < lo ? lo : (v > hi ? hi : v);\n    }\n\n    function step(s, t, dt) {\n        var rest = currents(s, t);\n        var fx = 0, fy = 0;\n        var mass = s.mass;\n        var dx, dy, d, fall, inv, pushR;\n\n        fx += -SPRING * (s.x - rest.x);\n        fy += -SPRING * (s.y - rest.y);\n        fx += -DAMPING * s.vx;\n        fy += -DAMPING * s.vy;\n\n        if (pointer.on) {\n            dx = s.cx - pointer.x;\n            dy = s.cy - pointer.y;\n            d = Math.sqrt(dx * dx + dy * dy);\n            pushR = PUSH_RADIUS;\n            if (d < pushR && d > 0.001) {\n                fall = 1 - d / pushR;\n                fall *= fall;\n                inv = 1 / d;\n                fx += dx * inv * PUSH_ACCEL * fall;\n                fy += dy * inv * PUSH_ACCEL * fall;\n                fx += pointer.vx * WAKE * fall;\n                fy += pointer.vy * WAKE * fall;\n                s.rvy += (dx * inv) * 16 * fall * dt;\n                s.rvx += (-dy * inv) * 12 * fall * dt;\n            }\n        }\n\n        fy += scrollImpulse * SCROLL_FORCE;\n        s.rvx += scrollImpulse * 2.4 * dt;\n\n        s.vx += (fx / mass) * dt;\n        s.vy += (fy / mass) * dt;\n        s.x += s.vx * dt;\n        s.y += s.vy * dt;\n        s.x = clamp(s.x, -MAX_X, MAX_X);\n        s.y = clamp(s.y, -MAX_Y, MAX_Y);\n\n        var restRx = s.ampRx * Math.sin(t * s.wRx + s.pRx) + s.vy * 0.06;\n        var restRy = s.ampRy * Math.sin(t * s.wRy + s.pRy) + s.vx * 0.08;\n        var restRz = s.ampRz * Math.sin(t * s.wRz + s.pRz) + s.vx * 0.06;\n        s.rvx += ((restRx - s.rx) * ANG_SPRING - s.rvx * ANG_DAMPING) * dt;\n        s.rvy += ((restRy - s.ry) * ANG_SPRING - s.rvy * ANG_DAMPING) * dt;\n        s.rvz += ((restRz - s.rz) * ANG_SPRING - s.rvz * ANG_DAMPING) * dt;\n        s.rx = clamp(s.rx + s.rvx * dt, -MAX_RX, MAX_RX);\n        s.ry = clamp(s.ry + s.rvy * dt, -MAX_RY, MAX_RY);\n        s.rz = clamp(s.rz + s.rvz * dt, -MAX_RZ, MAX_RZ);\n    }\n\n    /* ---------- cloth renderer (shared WebGL, blit to per-shirt canvas) ---------- */\n    var glCanvas = null;\n    var gl = null;\n    var glProg = null;\n    var glBuf = null;\n    var glIdx = null;\n    var glIdxCount = 0;\n    var glUniforms = {};\n    var glAuv = -1;\n    var useGL = false;\n    var meshCols = isMobile ? 8 : 14;\n    var meshRows = isMobile ? 10 : 16;\n    var CLOTH_PAD = 0.18;\n    var PIXEL_CSS = 6; /* CSS pixels per texel — stable mosaic across DPR. */\n\n    function compile(type, src) {\n        var sh = gl.createShader(type);\n        gl.shaderSource(sh, src);\n        gl.compileShader(sh);\n        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {\n            console.warn('cloth shader', gl.getShaderInfoLog(sh));\n            return null;\n        }\n        return sh;\n    }\n\n    function initGL() {\n        glCanvas = document.createElement('canvas');\n        try {\n            gl = glCanvas.getContext('webgl', {\n                alpha: true,\n                premultipliedAlpha: true,\n                antialias: false,\n                preserveDrawingBuffer: true\n            });\n        } catch (err) {\n            gl = null;\n        }\n        if (!gl) return false;\n\n        var vs = compile(gl.VERTEX_SHADER, [\n            'attribute vec2 a_uv;',\n            'uniform float u_time, u_amp, u_speed, u_phase, u_pad;',\n            'uniform vec2 u_push;',\n            'varying vec2 v_uv;',\n            'void main() {',\n            '  float u = a_uv.x;',\n            '  float v = a_uv.y;',\n            '  float hem = smoothstep(0.42, 1.0, v);',\n            '  float sleeve = pow(abs(u - 0.5) * 2.0, 1.35) * (1.0 - abs(v - 0.42) * 1.15);',\n            '  sleeve = clamp(sleeve, 0.0, 1.0);',\n            '  float edge = max(hem, sleeve);',\n            '  float wgt = 0.22 + 0.78 * edge;',\n            '  float t = u_time * u_speed + u_phase;',\n            '  float w1 = sin(u * 8.2 + v * 3.4 + t * 1.55);',\n            '  float w2 = sin(u * 5.1 - v * 6.6 + t * 2.15 + 1.7);',\n            '  float w3 = sin((u + v) * 11.0 + t * 1.05 + 0.6);',\n            '  float w4 = sin(u * 3.2 + v * 2.1 + t * 0.85 + 2.1);',\n            '  float flutter = sin(u * 12.0 + t * 2.35 + 0.8) * 0.22 + sin(v * 9.5 - t * 1.85) * 0.18;',\n            '  vec2 disp = vec2(',\n            '    w1 * 0.45 + w2 * 0.25 + w3 * 0.14 + w4 * 0.28 + flutter * 0.55 * edge,',\n            '    w1 * 0.28 + w3 * 0.32 + w2 * 0.18 + w4 * 0.30 + flutter * 0.45 * edge',\n            '  ) * u_amp * wgt + u_push * wgt;',\n            '  float billow = 1.0 + (w2 * 0.40 + w1 * 0.28 + w4 * 0.42) * u_amp * 2.8 * edge + flutter * u_amp * 1.15 * edge;',\n            '  float scale = 1.0 / (1.0 + 2.0 * u_pad);',\n            '  vec2 p = (a_uv + disp - 0.5) * billow * scale;',\n            /* p is already centered in ~[-0.5,0.5]; +Y in clip space is the top of the canvas. */\n            '  gl_Position = vec4(p.x * 2.0, -p.y * 2.0, 0.0, 1.0);',\n            '  v_uv = a_uv;',\n            '}'\n        ].join('\\n'));\n        var fs = compile(gl.FRAGMENT_SHADER, [\n            'precision mediump float;',\n            'uniform sampler2D u_tex;',\n            'uniform vec2 u_pix;',\n            'varying vec2 v_uv;',\n            'void main() {',\n            '  vec2 cell = max(u_pix, vec2(1.0));',\n            '  vec2 uv = (floor(v_uv * cell) + 0.5) / cell;',\n            '  gl_FragColor = texture2D(u_tex, uv);',\n            '}'\n        ].join('\\n'));\n        if (!vs || !fs) return false;\n        glProg = gl.createProgram();\n        gl.attachShader(glProg, vs);\n        gl.attachShader(glProg, fs);\n        gl.linkProgram(glProg);\n        if (!gl.getProgramParameter(glProg, gl.LINK_STATUS)) {\n            console.warn('cloth program', gl.getProgramInfoLog(glProg));\n            return false;\n        }\n        gl.useProgram(glProg);\n        glAuv = gl.getAttribLocation(glProg, 'a_uv');\n        glUniforms.time = gl.getUniformLocation(glProg, 'u_time');\n        glUniforms.amp = gl.getUniformLocation(glProg, 'u_amp');\n        glUniforms.speed = gl.getUniformLocation(glProg, 'u_speed');\n        glUniforms.phase = gl.getUniformLocation(glProg, 'u_phase');\n        glUniforms.pad = gl.getUniformLocation(glProg, 'u_pad');\n        glUniforms.push = gl.getUniformLocation(glProg, 'u_push');\n        glUniforms.tex = gl.getUniformLocation(glProg, 'u_tex');\n        glUniforms.pix = gl.getUniformLocation(glProg, 'u_pix');\n\n        var cols = meshCols, rows = meshRows;\n        var verts = [];\n        var idx = [];\n        var y, x, i;\n        for (y = 0; y <= rows; y++) {\n            for (x = 0; x <= cols; x++) {\n                verts.push(x / cols, y / rows);\n            }\n        }\n        for (y = 0; y < rows; y++) {\n            for (x = 0; x < cols; x++) {\n                i = y * (cols + 1) + x;\n                idx.push(i, i + 1, i + cols + 1, i + 1, i + cols + 2, i + cols + 1);\n            }\n        }\n        glBuf = gl.createBuffer();\n        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);\n        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);\n        glIdx = gl.createBuffer();\n        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIdx);\n        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);\n        glIdxCount = idx.length;\n        gl.enable(gl.BLEND);\n        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);\n        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);\n        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);\n        useGL = true;\n        glCanvas.addEventListener('webglcontextlost', function (e) {\n            e.preventDefault();\n            useGL = false;\n            gl = null;\n            var i;\n            for (i = 0; i < shirts.length; i++) {\n                shirts[i].tex = null;\n                shirts[i].texReady = false;\n                shirts[i].usingFallback = false;\n                showImgFallback(shirts[i]);\n            }\n        }, false);\n        glCanvas.addEventListener('webglcontextrestored', function () {\n            var i;\n            gl = null;\n            useGL = false;\n            if (!initGL()) {\n                for (i = 0; i < shirts.length; i++) showImgFallback(shirts[i]);\n                return;\n            }\n            for (i = 0; i < shirts.length; i++) {\n                shirts[i].tex = null;\n                shirts[i].texReady = false;\n                shirts[i].usingFallback = false;\n                bindTexture(shirts[i]);\n                if (!shirts[i].texReady) showImgFallback(shirts[i]);\n            }\n        }, false);\n        return true;\n    }\n\n    function showImgFallback(s) {\n        if (s.wrap) s.wrap.classList.remove('is-cloth-live');\n        if (s.img) s.img.style.opacity = '1';\n        if (s.canvas) s.canvas.style.opacity = '0';\n        s.usingFallback = true;\n        s.clothLive = false;\n    }\n\n    function hideImgFallback(s) {\n        s.usingFallback = false;\n        if (s.wrap) s.wrap.classList.add('is-cloth-live');\n        if (s.img) s.img.style.opacity = '';\n        if (s.canvas) s.canvas.style.opacity = '';\n        s.clothLive = true;\n    }\n\n    var inkProbe = document.createElement('canvas');\n    inkProbe.width = 48;\n    inkProbe.height = 48;\n    var inkProbeCtx = inkProbe.getContext('2d', { willReadFrequently: true });\n\n    function canvasHasInk(s) {\n        if (!s.ctx2d || !s.canvas || s.canvas.width < 4) return false;\n        try {\n            inkProbeCtx.clearRect(0, 0, 48, 48);\n            inkProbeCtx.drawImage(s.canvas, 0, 0, 48, 48);\n            var data = inkProbeCtx.getImageData(0, 0, 48, 48).data;\n            var i, hits = 0;\n            for (i = 3; i < data.length; i += 4) {\n                if (data[i] > 12) hits++;\n            }\n            return hits > 20;\n        } catch (err) {\n            return false;\n        }\n    }\n\n    function bindTexture(s) {\n        if (!s.img || !s.img.naturalWidth) return false;\n        if (!useGL) return false;\n        if (!s.tex) s.tex = gl.createTexture();\n        gl.bindTexture(gl.TEXTURE_2D, s.tex);\n        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);\n        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);\n        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);\n        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);\n        try {\n            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.img);\n            s.texReady = true;\n            return true;\n        } catch (err) {\n            s.texReady = false;\n            return false;\n        }\n    }\n\n    function watchImage(s) {\n        function ready() {\n            sizeCloth(s);\n            if (!bindTexture(s) && !useGL) hideImgFallback(s);\n            if (!s.texReady && useGL && !(s.img.complete && s.img.naturalWidth)) return;\n            if (!s.texReady && s.img.complete && s.img.naturalWidth && useGL) {\n                /* WebGL upload failed — keep the original sharp image visible. */\n                showImgFallback(s);\n            }\n        }\n        if (s.img.complete && s.img.naturalWidth) {\n            ready();\n            return;\n        }\n        s.img.addEventListener('load', ready, { once: true });\n        s.img.addEventListener('error', function () { showImgFallback(s); }, { once: true });\n        if (s.img.decode) {\n            s.img.decode().then(ready).catch(function () {});\n        }\n    }\n\n    function prepareCloth() {\n        if (!useGL && gl === null) initGL();\n        var i, s;\n        for (i = 0; i < shirts.length; i++) {\n            s = shirts[i];\n            if (!s.canvas) continue;\n            if (!s.ctx2d) s.ctx2d = s.canvas.getContext('2d');\n            watchImage(s);\n            sizeCloth(s);\n        }\n    }\n\n    function sizeCloth(s) {\n        if (!s.canvas || !s.img) return;\n        /* Layout size, not the 3D-projected bounding box — otherwise the canvas\n           bakes in foreshortening and the parent rotateX flattens the shirt twice. */\n        var w0 = s.img.offsetWidth || (s.wrap && s.wrap.offsetWidth) || 0;\n        var h0 = s.img.offsetHeight || (s.wrap && s.wrap.offsetHeight) || 0;\n        if (w0 < 2 || h0 < 2) return;\n        var dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);\n        var scale = 1 + 2 * CLOTH_PAD;\n        var w = Math.max(2, Math.round(w0 * scale * dpr));\n        var h = Math.max(2, Math.round(h0 * scale * dpr));\n        if (s.canvas.width !== w || s.canvas.height !== h) {\n            s.canvas.width = w;\n            s.canvas.height = h;\n        }\n        s.pixX = Math.max(16, Math.round(w0 / PIXEL_CSS));\n        s.pixY = Math.max(16, Math.round(h0 / PIXEL_CSS));\n    }\n\n    function renderClothGL(s, t) {\n        var w = s.canvas.width, h = s.canvas.height;\n        if (w < 2 || h < 2 || !s.texReady) return;\n        if (glCanvas.width !== w || glCanvas.height !== h) {\n            glCanvas.width = w;\n            glCanvas.height = h;\n        }\n        gl.viewport(0, 0, w, h);\n        gl.clearColor(0, 0, 0, 0);\n        gl.clear(gl.COLOR_BUFFER_BIT);\n        gl.useProgram(glProg);\n        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);\n        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIdx);\n        gl.enableVertexAttribArray(glAuv);\n        gl.vertexAttribPointer(glAuv, 2, gl.FLOAT, false, 0, 0);\n        gl.activeTexture(gl.TEXTURE0);\n        gl.bindTexture(gl.TEXTURE_2D, s.tex);\n        gl.uniform1i(glUniforms.tex, 0);\n        gl.uniform1f(glUniforms.time, t);\n        gl.uniform1f(glUniforms.amp, s.waveAmp);\n        var push = clothPush(s);\n        gl.uniform1f(glUniforms.speed, s.waveSpeed);\n        gl.uniform1f(glUniforms.phase, s.p5);\n        gl.uniform1f(glUniforms.pad, CLOTH_PAD);\n        gl.uniform2f(glUniforms.push, push.x, push.y);\n        gl.uniform2f(glUniforms.pix, s.pixX || 64, s.pixY || 64);\n        gl.drawElements(gl.TRIANGLES, glIdxCount, gl.UNSIGNED_SHORT, 0);\n        try {\n            s.ctx2d.imageSmoothingEnabled = false;\n            s.ctx2d.clearRect(0, 0, w, h);\n            s.ctx2d.drawImage(glCanvas, 0, 0);\n            return true;\n        } catch (err) {\n            return false;\n        }\n    }\n\n    function clothPush(s) {\n        var px = 0, py = 0, dx, dy, d, fall, inv;\n        if (pointer.on) {\n            dx = s.cx - pointer.x;\n            dy = s.cy - pointer.y;\n            d = Math.sqrt(dx * dx + dy * dy);\n            if (d < PUSH_RADIUS && d > 0.001) {\n                fall = 1 - d / PUSH_RADIUS;\n                fall *= fall;\n                inv = 1 / d;\n                px += dx * inv * 0.038 * fall + pointer.vx * 0.00007 * fall;\n                py += dy * inv * 0.038 * fall + pointer.vy * 0.00007 * fall;\n            }\n        }\n        py += clamp(scrollImpulse * 0.004, -0.03, 0.03);\n        px = clamp(px, -0.06, 0.06);\n        py = clamp(py, -0.06, 0.06);\n        return { x: px, y: py };\n    }\n\n    function warp2d(s, u, v, t) {\n        var hem = v < 0.42 ? 0 : (v - 0.42) / 0.58;\n        var sleeve = Math.pow(Math.abs(u - 0.5) * 2, 1.35) * (1 - Math.abs(v - 0.42) * 1.15);\n        if (sleeve < 0) sleeve = 0;\n        if (sleeve > 1) sleeve = 1;\n        var edge = hem > sleeve ? hem : sleeve;\n        var wgt = 0.22 + 0.78 * edge;\n        var tm = t * s.waveSpeed + s.p5;\n        var w1 = Math.sin(u * 8.2 + v * 3.4 + tm * 1.55);\n        var w2 = Math.sin(u * 5.1 - v * 6.6 + tm * 2.15 + 1.7);\n        var w3 = Math.sin((u + v) * 11.0 + tm * 1.05 + 0.6);\n        var w4 = Math.sin(u * 3.2 + v * 2.1 + tm * 0.85 + 2.1);\n        var flutter = Math.sin(u * 12.0 + tm * 2.35 + 0.8) * 0.22 + Math.sin(v * 9.5 - tm * 1.85) * 0.18;\n        var amp = s.waveAmp * wgt;\n        var push = clothPush(s);\n        return {\n            x: (w1 * 0.45 + w2 * 0.25 + w3 * 0.14 + w4 * 0.28 + flutter * 0.55 * edge) * amp + push.x * wgt,\n            y: (w1 * 0.28 + w3 * 0.32 + w2 * 0.18 + w4 * 0.30 + flutter * 0.45 * edge) * amp + push.y * wgt\n        };\n    }\n\n    function ensurePixSource(s) {\n        var cx = s.pixX || 64, cy = s.pixY || 64;\n        if (!s.img.naturalWidth) return null;\n        if (!s.pixSrc) {\n            s.pixSrc = document.createElement('canvas');\n            s.pixSrcCtx = s.pixSrc.getContext('2d');\n        }\n        if (s.pixSrc.width !== cx || s.pixSrc.height !== cy) {\n            s.pixSrc.width = cx;\n            s.pixSrc.height = cy;\n            s.pixSrcCtx.imageSmoothingEnabled = false;\n            s.pixSrcCtx.drawImage(s.img, 0, 0, cx, cy);\n        }\n        return s.pixSrc;\n    }\n\n    function renderCloth2d(s, t) {\n        var ctx = s.ctx2d;\n        var w = s.canvas.width, h = s.canvas.height;\n        if (!s.img.naturalWidth || w < 2) return;\n        var src = ensurePixSource(s) || s.img;\n        var rows = isMobile ? 10 : 16;\n        var imgW = src.width || s.img.naturalWidth, imgH = src.height || s.img.naturalHeight;\n        var innerW = w / (1 + 2 * CLOTH_PAD);\n        var innerH = h / (1 + 2 * CLOTH_PAD);\n        var ox = (w - innerW) / 2;\n        var oy = (h - innerH) / 2;\n        var sh = imgH / rows;\n        var dh = innerH / rows;\n        var y, v, d, dx;\n        ctx.clearRect(0, 0, w, h);\n        for (y = 0; y < rows; y++) {\n            v = (y + 0.5) / rows;\n            d = warp2d(s, 0.5, v, t);\n            dx = d.x * innerW;\n            ctx.imageSmoothingEnabled = false;\n            ctx.drawImage(src, 0, y * sh, imgW, sh + 1, ox + dx, oy + y * dh + d.y * innerH, innerW, dh + 1);\n        }\n    }\n\n    function renderCloth(s, t) {\n        if (!s.inView || !s.canvas || !s.ctx2d) {\n            if (s.inView && s.img && s.img.naturalWidth) showImgFallback(s);\n            return;\n        }\n        if (s.canvas.width < 4 || s.canvas.height < 4) {\n            sizeCloth(s);\n        }\n        if (useGL && gl && gl.isContextLost && gl.isContextLost()) {\n            useGL = false;\n            showImgFallback(s);\n            return;\n        }\n        if (useGL && !s.texReady && s.img.complete && s.img.naturalWidth) {\n            bindTexture(s);\n        }\n        var drew = false;\n        if (useGL && s.texReady) drew = renderClothGL(s, t);\n        else if (s.img.naturalWidth) {\n            renderCloth2d(s, t);\n            drew = true;\n        }\n        if (drew && canvasHasInk(s)) hideImgFallback(s);\n        else showImgFallback(s);\n    }\n\n    function frame(now) {\n        rafId = 0;\n        if (!shouldRun()) {\n            running = false;\n            lastTime = 0;\n            return;\n        }\n        if (!lastTime) lastTime = now;\n        var dt = (now - lastTime) / 1000;\n        lastTime = now;\n        if (dt > 0.05) dt = 0.05;\n        if (dt < 0.001) dt = 0.001;\n        var t = now / 1000;\n        scrollImpulse *= Math.pow(0.08, dt);\n        if (Math.abs(scrollImpulse) < 0.001) scrollImpulse = 0;\n        pointer.vx *= Math.pow(0.12, dt);\n        pointer.vy *= Math.pow(0.12, dt);\n\n        var i, s;\n        for (i = 0; i < shirts.length; i++) {\n            s = shirts[i];\n            step(s, t, dt);\n            apply(s);\n            if (s.inView) renderCloth(s, t);\n        }\n        running = true;\n        rafId = window.requestAnimationFrame(frame);\n    }\n\n    function start() {\n        if (running || !shouldRun()) return;\n        cacheRects();\n        lastTime = 0;\n        running = true;\n        rafId = window.requestAnimationFrame(frame);\n    }\n\n    function stop() {\n        running = false;\n        lastTime = 0;\n        if (rafId) {\n            window.cancelAnimationFrame(rafId);\n            rafId = 0;\n        }\n    }\n\n    function sync() {\n        if (shouldRun()) start();\n        else stop();\n    }\n\n    if (typeof IntersectionObserver === 'function') {\n        var io = new IntersectionObserver(function (entries) {\n            inView = !!(entries[0] && entries[0].isIntersecting);\n            sync();\n        }, { root: null, threshold: 0.05 });\n        io.observe(grid);\n    }\n\n    document.addEventListener('visibilitychange', function () {\n        pageHidden = document.visibilityState === 'hidden';\n        sync();\n    });\n\n    window.addEventListener('scroll', function () {\n        var y = window.scrollY || 0;\n        var dy = y - lastScrollY;\n        lastScrollY = y;\n        scrollImpulse += dy * 0.09;\n        if (scrollImpulse > 22) scrollImpulse = 22;\n        if (scrollImpulse < -22) scrollImpulse = -22;\n        cacheRects();\n    }, { passive: true });\n\n    window.addEventListener('resize', function () {\n        isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;\n        window.setTimeout(function () {\n            recollect();\n            var i;\n            for (i = 0; i < shirts.length; i++) sizeCloth(shirts[i]);\n        }, 60);\n    });\n\n    function onPointer(e) {\n        var now = performance.now();\n        var dt = pointer.lastT ? (now - pointer.lastT) / 1000 : 0.016;\n        if (dt < 0.001) dt = 0.001;\n        if (pointer.on) {\n            pointer.vx = (e.clientX - pointer.lastX) / dt;\n            pointer.vy = (e.clientY - pointer.lastY) / dt;\n        }\n        pointer.x = e.clientX;\n        pointer.y = e.clientY;\n        pointer.lastX = e.clientX;\n        pointer.lastY = e.clientY;\n        pointer.lastT = now;\n        pointer.on = true;\n    }\n\n    window.addEventListener('pointermove', onPointer, { passive: true });\n    window.addEventListener('pointerdown', onPointer, { passive: true });\n    window.addEventListener('pointerup', function (e) {\n        if (e.pointerType === 'touch' || e.pointerType === 'pen') pointer.on = false;\n        pointer.vx = 0;\n        pointer.vy = 0;\n    }, { passive: true });\n    window.addEventListener('pointercancel', function () {\n        pointer.on = false;\n        pointer.vx = 0;\n        pointer.vy = 0;\n    }, { passive: true });\n    document.addEventListener('mouseleave', function () {\n        pointer.on = false;\n    });\n    document.addEventListener('click', function () {\n        window.setTimeout(sync, 0);\n    }, true);\n\n    function boot() { recollect(); }\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', boot);\n    } else {\n        boot();\n    }\n    window.setTimeout(recollect, 0);\n    window.setTimeout(recollect, 250);\n\n    var products = document.getElementById('exploreProducts');\n    if (products && typeof MutationObserver === 'function') {\n        var mo = new MutationObserver(function () { recollect(); });\n        mo.observe(products, { childList: true });\n    }\n})();\n"},"index-scroll-fade.js":{"path":"eekseye.com/js/index-scroll-fade.js","lang":"js","text":"/**\n * Home page only: scroll-linked black fade between the mannequin hero\n * and the shirt grid. As you scroll down the hero eases out to #000 and\n * the shirts ease in from #000; the reverse on the way up. Driven by\n * scroll position, updated on rAF. Index only.\n */\n(function () {\n    'use strict';\n\n    if (!document.body || !document.body.classList.contains('index-page')) return;\n\n    var hero = document.querySelector('.hero-section');\n    var grid = document.getElementById('index-explore-grid');\n    if (!hero || !grid) return;\n\n    var heroVeil = hero.querySelector('.hero-scroll-veil');\n    var gridVeil = grid.querySelector('.index-grid-scroll-veil');\n    if (!heroVeil || !gridVeil) return;\n\n    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);\n    if (reduced) {\n        heroVeil.style.opacity = '0';\n        gridVeil.style.opacity = '0';\n        return;\n    }\n\n    var products = document.getElementById('exploreProducts') || grid;\n    var rafId = 0;\n\n    function clamp(v, lo, hi) {\n        return v < lo ? lo : (v > hi ? hi : v);\n    }\n\n    function ease(t) {\n        t = clamp(t, 0, 1);\n        return t * t * (3 - 2 * t);\n    }\n\n    function update() {\n        rafId = 0;\n        var vh = window.innerHeight || 1;\n        if (vh < 1) vh = 1;\n\n        var heroBottom = hero.getBoundingClientRect().bottom;\n        /* Fully clear near the top of the page; ease to black as the hero\n           leaves, done once only a sliver remains at the top. */\n        var heroT = (heroBottom - vh * 0.20) / (vh * 0.55);\n        var heroOp = 1 - ease(heroT);\n\n        var shirtsTop = products.getBoundingClientRect().top;\n        /* Start revealing as soon as the shirts enter, and be fully clear\n           once a good portion of the row is on screen. */\n        var gridT = (vh * 0.95 - shirtsTop) / (vh * 0.35);\n        var gridOp = 1 - ease(gridT);\n\n        heroVeil.style.opacity = clamp(heroOp, 0, 1).toFixed(4);\n        gridVeil.style.opacity = clamp(gridOp, 0, 1).toFixed(4);\n    }\n\n    function requestTick() {\n        if (!rafId) rafId = window.requestAnimationFrame(update);\n    }\n\n    window.addEventListener('scroll', requestTick, { passive: true });\n    window.addEventListener('resize', requestTick);\n    window.addEventListener('pageshow', requestTick);\n    update();\n})();\n"},"index-hero-reflection.js":{"path":"eekseye.com/js/index-hero-reflection.js","lang":"js","text":"/**\n * Home hero water reflection: a flipped, darkened copy of the mannequin\n * is painted onto a 1x canvas under a faint horizon, with a light ripple.\n * Pauses when the tab is hidden or the hero is off-screen. Reduced motion\n * keeps a still reflection (no ripple animation).\n */\n(function () {\n    'use strict';\n\n    var canvas = document.getElementById('hero-reflection-canvas');\n    var water = canvas && canvas.closest('.hero-water');\n    var hero = document.querySelector('.hero-section');\n    if (!canvas || !water || !hero) return;\n\n    var ctx = canvas.getContext('2d');\n    if (!ctx) return;\n\n    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);\n    var rafId = 0;\n    var paintUntil = 0;\n    var inView = true;\n    var pageHidden = false;\n\n    if (reduced) {\n        var anim = document.querySelector('#heroWaterTurbulence animate');\n        if (anim) anim.remove();\n        var disp = document.querySelector('#heroWaterRipple feDisplacementMap');\n        if (disp) disp.setAttribute('scale', '0');\n    }\n\n    function cssNumber(el, prop) {\n        var v = parseFloat((window.getComputedStyle(el)[prop] || '0').toString());\n        return isFinite(v) ? v : 0;\n    }\n\n    function shouldPaint() {\n        return inView && !pageHidden;\n    }\n\n    function paint() {\n        rafId = 0;\n        if (!shouldPaint()) return;\n\n        var wr = water.getBoundingClientRect();\n        var hr = hero.getBoundingClientRect();\n        if (wr.width < 2 || wr.height < 2) return;\n\n        var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);\n        var dpr = window.devicePixelRatio || 1;\n        if (coarse) dpr = Math.min(dpr, 1.25);\n        else dpr = Math.min(dpr, 2);\n        var scale = coarse ? 0.7 : 1;\n        var bw = Math.max(1, Math.floor(wr.width * dpr * scale));\n        var bh = Math.max(1, Math.floor(wr.height * dpr * scale));\n        if (canvas.width !== bw || canvas.height !== bh) {\n            canvas.width = bw;\n            canvas.height = bh;\n        }\n\n        ctx.setTransform(1, 0, 0, 1, 0, 0);\n        ctx.clearRect(0, 0, bw, bh);\n        var sx = bw / wr.width;\n        var sy = bh / wr.height;\n        ctx.setTransform(sx, 0, 0, sy, 0, 0);\n\n        var imgs = hero.querySelectorAll('.hero-mannequin-air .hero-gone-image');\n        var i, img, op, r, destX, destY;\n\n        ctx.save();\n        ctx.imageSmoothingEnabled = true;\n        ctx.imageSmoothingQuality = coarse ? 'low' : 'medium';\n        // Flip around the horizon (y = 0 in water space) so the figure\n        // meets the water line feet-to-feet and reads upside down.\n        ctx.scale(1, -1);\n\n        for (i = 0; i < imgs.length; i++) {\n            img = imgs[i];\n            if (!img.complete || img.naturalWidth < 1) continue;\n            op = cssNumber(img, 'opacity');\n            if (op < 0.04) continue;\n            r = img.getBoundingClientRect();\n            if (r.width < 2 || r.height < 2) continue;\n            destX = r.left - wr.left;\n            destY = r.top - wr.top;\n            ctx.globalAlpha = op * 0.95;\n            /* Past asset is darker; apply the same lift as the on-page figure\n               before the reflection's own dim/tint. */\n            ctx.filter = (img.classList.contains('hero-gone-image-1')\n                ? 'brightness(2.7) contrast(1.1) '\n                : '') + 'brightness(0.8) saturate(0.8) hue-rotate(196deg)';\n            try {\n                ctx.drawImage(img, destX, destY, r.width, r.height);\n            } catch (err) {}\n        }\n\n        ctx.restore();\n\n        /* Fade the flipped figure itself: brightest at the feet (y = 0),\n           smoothly gone by the bottom. Same soft look as the visible\n           fading feet, stretched over the whole reflected body. */\n        ctx.setTransform(1, 0, 0, 1, 0, 0);\n        var fade = ctx.createLinearGradient(0, 0, 0, bh);\n        fade.addColorStop(0, 'rgba(0,0,0,1)');\n        fade.addColorStop(0.18, 'rgba(0,0,0,0.88)');\n        fade.addColorStop(0.48, 'rgba(0,0,0,0.58)');\n        fade.addColorStop(0.78, 'rgba(0,0,0,0.22)');\n        fade.addColorStop(1, 'rgba(0,0,0,0)');\n        ctx.globalCompositeOperation = 'destination-in';\n        ctx.fillStyle = fade;\n        ctx.fillRect(0, 0, bw, bh);\n        ctx.globalCompositeOperation = 'source-over';\n\n        if (Date.now() < paintUntil && shouldPaint()) {\n            rafId = window.requestAnimationFrame(paint);\n        }\n    }\n\n    function requestPaint(durationMs) {\n        if (durationMs) paintUntil = Math.max(paintUntil, Date.now() + durationMs);\n        if (rafId) return;\n        rafId = window.requestAnimationFrame(paint);\n    }\n\n    function onSourceChange() {\n        // Cover the 2.5s clip/fade plus a short tail.\n        requestPaint(2800);\n    }\n\n    var sources = hero.querySelectorAll('.hero-mannequin-air .hero-gone-image');\n    sources.forEach(function (img) {\n        if (!img.complete) img.addEventListener('load', function () { requestPaint(0); }, { once: true });\n        if (typeof MutationObserver === 'function') {\n            var mo = new MutationObserver(onSourceChange);\n            mo.observe(img, { attributes: true, attributeFilter: ['class', 'style'] });\n        }\n    });\n\n    window.addEventListener('resize', function () { requestPaint(0); });\n    window.addEventListener('orientationchange', function () { requestPaint(200); });\n\n    document.addEventListener('visibilitychange', function () {\n        pageHidden = document.visibilityState === 'hidden';\n        if (!pageHidden) requestPaint(0);\n    });\n\n    if (typeof IntersectionObserver === 'function') {\n        var io = new IntersectionObserver(function (entries) {\n            inView = !!(entries[0] && entries[0].isIntersecting);\n            if (inView) requestPaint(0);\n        }, { root: null, threshold: 0.05 });\n        io.observe(hero);\n    }\n\n    if (document.readyState === 'complete') requestPaint(0);\n    else window.addEventListener('load', function () { requestPaint(400); });\n    requestPaint(0);\n})();\n"},"index-grid-underwater.css":{"path":"eekseye.com/css/index-grid-underwater.css","lang":"css","text":"/* Home page only: underwater motion on a pure-black Aesthetic grid.\n   No teal/blue tint or depth color. Shirts stay sharp and slowly drift, clickable. */\n\nbody.index-page .hero-section {\n    position: relative;\n    z-index: 2;\n    background: #000;\n}\n\n/*\n * The hard edge was the slightly-gray hero bottom (reflection + 55% veil)\n * cutting off against the grid's pure black. The hero's last stretch is\n * solid #000 (no horizon line). Scroll-linked veils handle fade in/out.\n */\nbody.index-page .hero-horizon {\n    opacity: 0;\n    background: none;\n    box-shadow: none;\n}\n\nbody.index-page .hero-bottom-fade {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: var(--hero-horizon);\n    bottom: 0;\n    height: auto;\n    pointer-events: none;\n    z-index: 6;\n    background: linear-gradient(\n        to bottom,\n        transparent 0%,\n        transparent 55%,\n        rgba(0, 0, 0, 0.35) 82%,\n        #000 100%\n    );\n}\n\n/* Keep a light black veil on the water, without a blue tint or\n   early crush, so the canvas fade can show the full reflected body. */\nbody.index-page .hero-water-tint {\n    background: linear-gradient(\n        to bottom,\n        rgba(0, 0, 0, 0.06) 0%,\n        rgba(0, 0, 0, 0.14) 50%,\n        rgba(0, 0, 0, 0.28) 100%\n    );\n}\n\nbody.index-page .hero-scroll-veil,\nbody.index-page .index-grid-scroll-veil {\n    position: absolute;\n    inset: 0;\n    background: #000;\n    pointer-events: none;\n}\n\nbody.index-page .hero-scroll-veil {\n    z-index: 8;\n    opacity: 0;\n}\n\nbody.index-page .index-grid-scroll-veil {\n    z-index: 12;\n    opacity: 0;\n}\n\n/* Extra dissolve inside the water layer, in case anything peeks under the veil. */\nbody.index-page .hero-water::after {\n    content: \"\";\n    position: absolute;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    height: 28%;\n    pointer-events: none;\n    z-index: 5;\n    background: linear-gradient(\n        to bottom,\n        transparent 0%,\n        rgba(0, 0, 0, 0.25) 50%,\n        #000 100%\n    );\n}\n\nbody.index-page #index-explore-grid {\n    position: relative;\n    overflow: visible;\n    isolation: isolate;\n    background: #000;\n    margin-top: -8vh;\n    padding-top: 10vh;\n}\n\n/* Short black cap over the hero overlap so the seam cannot go gray. */\nbody.index-page #index-explore-grid::before {\n    content: \"\";\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 0;\n    height: 10vh;\n    z-index: 8;\n    pointer-events: none;\n    background: linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%);\n}\n\n@media (max-width: 768px) {\n    body.index-page #index-explore-grid {\n        margin-top: -8vh;\n        padding-top: 10vh;\n    }\n    body.index-page #index-explore-grid::before {\n        height: 10vh;\n    }\n    body.index-page .hero-bottom-fade {\n        height: auto;\n    }\n}\n\nbody.index-page #index-explore-grid .explore-products,\nbody.index-page #exploreProducts,\nbody.index-page #index-explore-grid .explore-hero-section,\nbody.index-page #index-explore-grid .explore-hero-section:hover,\nbody.index-page #index-explore-grid .explore-grid-placeholder {\n    background-color: #000;\n    background: #000;\n}\n\nbody.index-page #index-explore-grid .explore-products,\nbody.index-page #exploreProducts {\n    position: relative;\n    z-index: 1;\n}\n\n/* No dream blur on the home grid — shirts, cards, and text stay sharp. */\nbody.index-page #index-explore-grid .explore-hero-section,\nbody.index-page #index-explore-grid .explore-grid-placeholder,\nbody.index-page #index-explore-grid .explore-hero-section:hover,\nbody.index-page #index-explore-grid .explore-grid-placeholder:hover,\nbody.index-page #index-explore-grid .explore-hero-section.is-dream-focus,\nbody.index-page #index-explore-grid .explore-grid-placeholder.is-dream-focus {\n    filter: none;\n    will-change: auto;\n}\n\n/* Weightless, slow-motion drift — shirts hang in the water, not on a rigid grid. */\nbody.index-page #index-explore-grid .explore-hero-section,\nbody.index-page #index-explore-grid .explore-grid-placeholder {\n    --float-dur: 36s;\n    --float-delay: 0s;\n}\nbody.index-page #index-explore-grid #first-product { --float-dur: 34s; --float-delay: -6s; }\nbody.index-page #index-explore-grid #second-product { --float-dur: 40s; --float-delay: -18s; }\nbody.index-page #index-explore-grid #third-product { --float-dur: 36s; --float-delay: -10s; }\nbody.index-page #index-explore-grid #fourth-product { --float-dur: 42s; --float-delay: -24s; }\nbody.index-page #index-explore-grid #fifth-product { --float-dur: 35s; --float-delay: -3s; }\nbody.index-page #index-explore-grid .explore-grid-placeholder { --float-dur: 38s; --float-delay: -16s; }\n\nbody.index-page #index-explore-grid .explore-hero-img,\nbody.index-page #index-explore-grid .explore-grid-placeholder-img,\nbody.index-page #index-explore-grid .explore-hero-info {\n    animation: index-grid-float var(--float-dur, 14s) var(--float-delay, 0s) ease-in-out infinite;\n    animation-play-state: paused;\n    will-change: transform;\n}\n\nbody.index-page #index-explore-grid.is-water-active .explore-hero-img,\nbody.index-page #index-explore-grid.is-water-active .explore-grid-placeholder-img,\nbody.index-page #index-explore-grid.is-water-active .explore-hero-info {\n    animation-play-state: running;\n}\n\nbody.index-page #index-explore-grid:has(.password-overlay.active) .explore-hero-img,\nbody.index-page #index-explore-grid:has(.password-overlay.active) .explore-grid-placeholder-img,\nbody.index-page #index-explore-grid:has(.password-overlay.active) .explore-hero-info {\n    animation-play-state: paused;\n}\n\n/* JS buoyancy owns the transform. Keep the CSS drift only as a no-JS fallback. */\nbody.index-page #index-explore-grid.is-float-physics .explore-hero-img,\nbody.index-page #index-explore-grid.is-float-physics .explore-grid-placeholder-img,\nbody.index-page #index-explore-grid.is-float-physics .explore-hero-info {\n    animation: none;\n}\n\n@keyframes index-grid-float {\n    0%, 100% { transform: translate3d(0, 0, 0) rotate(-0.12deg); }\n    25% { transform: translate3d(2px, -5px, 0) rotate(0.16deg); }\n    50% { transform: translate3d(-1.5px, -2.5px, 0) rotate(-0.08deg); }\n    75% { transform: translate3d(-2.5px, -6px, 0) rotate(0.12deg); }\n}\n\n.index-grid-water {\n    position: absolute;\n    inset: 0;\n    pointer-events: none;\n    z-index: 0;\n    overflow: hidden;\n}\n\n.index-grid-water-svg {\n    position: absolute;\n    width: 0;\n    height: 0;\n    overflow: hidden;\n}\n\n.index-grid-water-back,\n.index-grid-water-front {\n    position: absolute;\n    inset: 0;\n}\n\n.index-grid-water-back {\n    z-index: 0;\n}\n\n.index-grid-water-front {\n    z-index: 6;\n}\n\n#index-explore-grid:has(.password-overlay.active) .index-grid-water-front {\n    opacity: 0;\n    visibility: hidden;\n}\n\n/* No color wash — the black canvas stays black. */\n.index-grid-water-tint {\n    display: none;\n}\n\n\n/* Neutralize the layers that were lifting the seam to dark gray.\n   Markup stays in place; the area between hero and shirts stays #000. */\nbody.index-page .index-grid-water-surface,\nbody.index-page .index-grid-water-caustics,\nbody.index-page .index-grid-water-rays {\n    opacity: 0;\n    visibility: hidden;\n    animation: none;\n}\n\n/* Soft light falling from the surface above the shirts. Neutral / warm-white only. */\n.index-grid-water-surface {\n    position: absolute;\n    left: -8%;\n    right: -8%;\n    top: 0;\n    height: 78%;\n    pointer-events: none;\n    mix-blend-mode: screen;\n    opacity: 0.85;\n    background:\n        radial-gradient(ellipse 70% 42% at 50% 0%, rgba(255, 250, 240, 0.2), transparent 68%),\n        radial-gradient(ellipse 36% 28% at 28% 8%, rgba(255, 252, 245, 0.1), transparent 70%),\n        radial-gradient(ellipse 32% 24% at 74% 6%, rgba(255, 248, 235, 0.08), transparent 72%),\n        linear-gradient(to bottom, rgba(255, 250, 240, 0.07) 0%, rgba(255, 250, 240, 0.03) 36%, transparent 72%);\n}\n\n.index-grid-water-caustics {\n    position: absolute;\n    left: -12%;\n    right: -12%;\n    top: -8%;\n    height: 85%;\n    opacity: 0.16;\n    mix-blend-mode: screen;\n    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.35) 14%, rgba(0, 0, 0, 0.8) 34%, rgba(0, 0, 0, 0.4) 72%, transparent 100%);\n    mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.35) 14%, rgba(0, 0, 0, 0.8) 34%, rgba(0, 0, 0, 0.4) 72%, transparent 100%);\n    background-image:\n        radial-gradient(ellipse 42% 22% at 18% 8%, rgba(255, 252, 245, 0.4), transparent 62%),\n        radial-gradient(ellipse 34% 18% at 72% 4%, rgba(255, 250, 240, 0.3), transparent 60%),\n        radial-gradient(ellipse 50% 26% at 48% 22%, rgba(255, 250, 240, 0.18), transparent 70%),\n        radial-gradient(ellipse 28% 16% at 86% 30%, rgba(255, 250, 240, 0.18), transparent 64%),\n        radial-gradient(ellipse 36% 20% at 30% 40%, rgba(255, 248, 235, 0.14), transparent 68%);\n    background-repeat: no-repeat;\n    filter: blur(18px);\n    transform: translate3d(0, 0, 0);\n    animation: index-grid-caustics 22s ease-in-out infinite alternate;\n    animation-play-state: paused;\n}\n\n.index-grid-water-caustics--sheen {\n    height: 100%;\n    opacity: 0.06;\n    filter: blur(22px);\n    animation-duration: 28s;\n    animation-direction: alternate-reverse;\n}\n\n.index-grid-water-rays {\n    position: absolute;\n    inset: 0;\n    opacity: 0.42;\n    mix-blend-mode: screen;\n    background:\n        repeating-linear-gradient(\n            106deg,\n            transparent 0,\n            transparent 46px,\n            rgba(255, 250, 240, 0.03) 54px,\n            rgba(255, 252, 245, 0.09) 66px,\n            rgba(255, 250, 240, 0.035) 80px,\n            transparent 108px,\n            transparent 150px\n        ),\n        repeating-linear-gradient(\n            98deg,\n            transparent 0,\n            transparent 90px,\n            rgba(255, 248, 235, 0.025) 102px,\n            rgba(255, 252, 245, 0.07) 114px,\n            rgba(255, 250, 240, 0.02) 128px,\n            transparent 160px,\n            transparent 210px\n        );\n    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.62) 18%, rgba(0, 0, 0, 0.32) 58%, transparent 90%);\n    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.62) 18%, rgba(0, 0, 0, 0.32) 58%, transparent 90%);\n    animation: index-grid-rays 32s linear infinite;\n    animation-play-state: paused;\n}\n\n.index-grid-water-bubbles span {\n    position: absolute;\n    bottom: -8%;\n    left: var(--x, 50%);\n    width: var(--size, 6px);\n    height: var(--size, 6px);\n    border-radius: 50%;\n    background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.14) 46%, transparent 72%);\n    box-shadow: 0 0 8px rgba(255, 250, 240, 0.18);\n    animation: index-grid-bubble var(--dur, 16s) var(--delay, 0s) linear infinite;\n    animation-play-state: paused;\n    will-change: transform, opacity;\n}\n\n.index-grid-water-sparkles span {\n    position: absolute;\n    left: var(--x, 50%);\n    top: var(--y, 50%);\n    width: var(--size, 2px);\n    height: var(--size, 2px);\n    border-radius: 50%;\n    background: rgba(255, 252, 245, 0.95);\n    box-shadow: 0 0 6px 1px rgba(255, 250, 240, 0.65), 0 0 1px rgba(255, 255, 255, 0.9);\n    animation: index-grid-glint var(--dur, 6s) var(--delay, 0s) ease-in-out infinite;\n    animation-play-state: paused;\n    opacity: 0;\n    will-change: transform, opacity;\n    pointer-events: none;\n}\n\n#index-explore-grid.is-water-active .index-grid-water-caustics,\n#index-explore-grid.is-water-active .index-grid-water-rays,\n#index-explore-grid.is-water-active .index-grid-water-bubbles span,\n#index-explore-grid.is-water-active .index-grid-water-sparkles span {\n    animation-play-state: running;\n}\n\n@keyframes index-grid-caustics {\n    from { transform: translate3d(-2.5%, 0, 0) scale(1); }\n    to { transform: translate3d(3%, 2%, 0) scale(1.06); }\n}\n\n@keyframes index-grid-rays {\n    from { transform: translate3d(0, 0, 0); }\n    to { transform: translate3d(-90px, 0, 0); }\n}\n\n@keyframes index-grid-bubble {\n    0% {\n        transform: translate3d(0, 0, 0) scale(0.65);\n        opacity: 0;\n    }\n    8% { opacity: 0.65; }\n    75% { opacity: 0.35; }\n    100% {\n        transform: translate3d(var(--drift, 12px), -125vh, 0) scale(1.05);\n        opacity: 0;\n    }\n}\n\n@keyframes index-grid-glint {\n    0%, 100% {\n        opacity: 0;\n        transform: translate3d(0, 0, 0) scale(0.45);\n    }\n    18% {\n        opacity: 0.95;\n        transform: translate3d(calc(var(--drift, 8px) * 0.25), -8px, 0) scale(1);\n    }\n    42% {\n        opacity: 0.12;\n        transform: translate3d(calc(var(--drift, 8px) * 0.55), -16px, 0) scale(0.6);\n    }\n    68% {\n        opacity: 0.8;\n        transform: translate3d(var(--drift, 8px), -26px, 0) scale(1.2);\n    }\n    88% {\n        opacity: 0.05;\n        transform: translate3d(calc(var(--drift, 8px) * 1.15), -34px, 0) scale(0.4);\n    }\n}\n\n/* Gentle ripple on shirts and glitch text — same SVG turbulence idea as the hero water. */\nbody.index-page #index-explore-grid .explore-hero-img,\nbody.index-page #index-explore-grid .explore-grid-placeholder-img {\n    filter: none;\n}\n\nbody.index-page #index-explore-grid .explore-hero-text-fill {\n    filter: url(#indexGridWaterRipple);\n}\n\n@media (max-width: 768px) {\n    body.index-page #index-explore-grid .explore-hero-img,\n    body.index-page #index-explore-grid .explore-grid-placeholder-img {\n        filter: none;\n    }\n    body.index-page #index-explore-grid .explore-hero-text-fill {\n        filter: none;\n    }\n    .index-grid-water-caustics {\n        opacity: 0.12;\n        filter: blur(20px);\n        animation-duration: 30s;\n    }\n    .index-grid-water-caustics--sheen {\n        display: none;\n    }\n    .index-grid-water-rays {\n        opacity: 0.3;\n        animation-duration: 48s;\n    }\n    .index-grid-water-bubbles span:nth-child(n+6) {\n        display: none;\n    }\n    .index-grid-water-sparkles span:nth-child(n+10) {\n        display: none;\n    }\n    body.index-page #index-explore-grid .explore-hero-img,\n    body.index-page #index-explore-grid .explore-grid-placeholder-img,\n    body.index-page #index-explore-grid .explore-hero-info {\n        animation-name: index-grid-float-mobile;\n    }\n    @keyframes index-grid-float-mobile {\n        0%, 100% { transform: translate3d(0, 0, 0) rotate(-0.1deg); }\n        25% { transform: translate3d(1.5px, -4px, 0) rotate(0.12deg); }\n        50% { transform: translate3d(-1px, -2px, 0) rotate(-0.06deg); }\n        75% { transform: translate3d(-2px, -5px, 0) rotate(0.1deg); }\n    }\n}\n\n@media (prefers-reduced-motion: reduce) {\n    .index-grid-water-caustics,\n    .index-grid-water-caustics--sheen,\n    .index-grid-water-rays,\n    .index-grid-water-bubbles span,\n    .index-grid-water-sparkles span,\n    body.index-page #index-explore-grid .explore-hero-img,\n    body.index-page #index-explore-grid .explore-grid-placeholder-img,\n    body.index-page #index-explore-grid .explore-hero-info {\n        animation: none !important;\n    }\n    .index-grid-water-bubbles,\n    .index-grid-water-sparkles {\n        display: none;\n    }\n    body.index-page #index-explore-grid .explore-hero-img,\n    body.index-page #index-explore-grid .explore-grid-placeholder-img {\n        filter: none;\n    }\n    body.index-page #index-explore-grid .explore-hero-text-fill {\n        filter: none;\n    }\n}\n\n\n/* Hide glitch lines and product name/RUNWAY labels on the home grid only.\n   Markup and the Aesthetic page stay intact. Clicks still hit the card. */\nbody.index-page #index-explore-grid .explore-hero-text-fill,\nbody.index-page #index-explore-grid .explore-hero-info {\n    display: none;\n}\n\n/* 3D tumble + cloth canvas overlay (JS wraps each shirt image).\n   Perspective stays on the card, but we flatten (no preserve-3d) so a\n   rotated shirt is composited as a 2D layer and cannot slip behind the\n   card's black background. The wrap sits above the glitch text. */\nbody.index-page #index-explore-grid .explore-hero-section,\nbody.index-page #index-explore-grid .explore-grid-placeholder {\n    perspective: 1100px;\n    transform-style: flat;\n    overflow: visible;\n}\n\nbody.index-page #index-explore-grid .index-shirt-cloth {\n    position: relative;\n    z-index: 2;\n    display: inline-block;\n    max-width: 100%;\n    line-height: 0;\n    transform-origin: 50% 55%;\n    backface-visibility: visible;\n}\n\n/* Keep the original <img> visible until the cloth canvas has a real frame.\n   No glow or rim — shirts sit on pure black. */\nbody.index-page #index-explore-grid .index-shirt-cloth .explore-hero-img,\nbody.index-page #index-explore-grid .index-shirt-cloth .explore-grid-placeholder-img {\n    opacity: 1;\n    filter: none;\n    image-rendering: -moz-crisp-edges;\n    image-rendering: crisp-edges;\n    image-rendering: pixelated;\n}\n\nbody.index-page #index-explore-grid .index-shirt-cloth-canvas {\n    position: absolute;\n    left: -18%;\n    top: -18%;\n    width: 136%;\n    height: 136%;\n    display: block;\n    pointer-events: none;\n    opacity: 0;\n    backface-visibility: visible;\n    filter: none;\n    image-rendering: -moz-crisp-edges;\n    image-rendering: crisp-edges;\n    image-rendering: pixelated;\n}\n\nbody.index-page #index-explore-grid .index-shirt-cloth.is-cloth-live .explore-hero-img,\nbody.index-page #index-explore-grid .index-shirt-cloth.is-cloth-live .explore-grid-placeholder-img {\n    opacity: 0;\n    filter: none;\n}\n\nbody.index-page #index-explore-grid .index-shirt-cloth.is-cloth-live .index-shirt-cloth-canvas {\n    opacity: 1;\n}\n\n@media (max-width: 768px) {\n    body.index-page #index-explore-grid .index-shirt-cloth .explore-hero-img,\n    body.index-page #index-explore-grid .index-shirt-cloth .explore-grid-placeholder-img,\n    body.index-page #index-explore-grid .index-shirt-cloth-canvas {\n        filter: none;\n    }\n}\n\n@media (prefers-reduced-motion: reduce) {\n    body.index-page #index-explore-grid .index-shirt-cloth .explore-hero-img,\n    body.index-page #index-explore-grid .index-shirt-cloth .explore-grid-placeholder-img {\n        opacity: 1;\n    }\n    body.index-page #index-explore-grid .index-shirt-cloth-canvas {\n        display: none;\n    }\n}\n\n/* Corner box: white Present mannequin, frame, zoom icon, and scroll arrows.\n   The box itself is scaled down in index.html (~67% of the previous size). */\nbody.index-page .hero-gone-mini-wrapper {\n    background: #000;\n    overflow-y: scroll;\n}\nbody.index-page .hero-gone-mini-wrapper .hero-gone-extra-image-button,\nbody.index-page .hero-gone-mini-wrapper .hero-gone-mini-stage {\n    height: 100%;\n    overflow: hidden;\n}\nbody.index-page .hero-gone-mini-wrapper .hero-gone-extra-image {\n    visibility: visible;\n    position: absolute;\n    /* Crop the 4000² art so the body (11.4%–85%) fills the square. */\n    width: 136%;\n    height: 136%;\n    max-width: none;\n    left: 50%;\n    top: -13.5%;\n    transform: translateX(-50%);\n    object-fit: cover;\n    aspect-ratio: 1 / 1;\n    filter: none;\n}\nbody.index-page .hero-gone-mini-wrapper .hero-gone-image-mini {\n    visibility: visible;\n    object-fit: cover;\n    object-position: center 48%;\n    transform: scale(1.36);\n    filter: none;\n}\nbody.index-page .hero-gone-mini-wrapper .hero-gone-image-mini-1 {\n    filter: brightness(2.7) contrast(1.1);\n}\nbody.index-page .hero-gone-mini-wrapper .hero-gone-zoom-icon {\n    opacity: 1;\n    background: transparent;\n    inset: auto 6px 6px auto;\n    width: 28px;\n    height: 28px;\n    font-size: 0.85rem;\n}\n@media (max-width: 768px) {\n    body.index-page .hero-gone-mini-wrapper .hero-gone-extra-image-button,\n    body.index-page .hero-gone-mini-wrapper .hero-gone-mini-stage {\n        height: 100%;\n    }\n}\n\n/* Hidden for now (Past/Present buttons and the corner box).\n   Markup and styles stay in place so these can be restored. */\nbody.index-page .hero-gone-nav,\nbody.index-page .hero-gone-mini-wrapper,\nbody.index-page .hero-gone-image-modal {\n    display: none !important;\n}\n"},"environment.ts":{"path":"eekseye.com/environment.ts","lang":"ts","text":"export const environment = {\n  production: true,\n  siteName: 'EEKSEYE',\n  origin: 'https://eekseye.com',\n  theme: 'dark',\n  hero: {\n    background: '#000000',\n    figureHeight: '80vh',\n    alignment: 'left',\n    reflection: 'soft-fade'\n  },\n  grid: {\n    pixelSize: 6,\n    cloth: true\n  }\n};\n"}};

    var FILES = [
        { id: 'index-grid-float.js', label: 'index-grid-float.js', icon: 'js' },
        { id: 'index-scroll-fade.js', label: 'index-scroll-fade.js', icon: 'js' },
        { id: 'index-hero-reflection.js', label: 'index-hero-reflection.js', icon: 'js' },
        { id: 'index-grid-underwater.css', label: 'index-grid-underwater.css', icon: 'css' },
        { id: 'environment.ts', label: 'environment.ts', icon: 'ts' }
    ];

    var DEFAULT = 'index-grid-float.js';
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var activeId = DEFAULT;
    var currentLine = 0;
    var htmlCache = {};
    var scrollTimer = 0;
    var scrollDir = 1;

    function svg(inner, view) {
        return '<svg viewBox="' + (view || '0 0 16 16') + '" aria-hidden="true">' + inner + '</svg>';
    }
    var ICO = {
        inspect: svg('<path d="M3 2.5h4v1H4v8h8v-3h1v4H3z"/><path d="M9 2l5 5-1.2.3-1.5 3.2-1.5-1.5 3.2-1.5z"/>'),
        device: svg('<path d="M4 2.5h8A1.5 1.5 0 0 1 13.5 4v8A1.5 1.5 0 0 1 12 13.5H4A1.5 1.5 0 0 1 2.5 12V4A1.5 1.5 0 0 1 4 2.5zm.5 1.5v8h7V4z"/>'),
        gear: svg('<path d="M8 10.2A2.2 2.2 0 1 0 8 5.8a2.2 2.2 0 0 0 0 4.4zM6.3 1.5h3.4l.3 1.6 1.3.6 1.5-.7 1.7 1.7-.7 1.5.6 1.3 1.6.3v3.4l-1.6.3-.6 1.3.7 1.5-1.7 1.7-1.5-.7-1.3.6-.3 1.6H6.3l-.3-1.6-1.3-.6-1.5.7-1.7-1.7.7-1.5-.6-1.3L1.5 9.7V6.3l1.6-.3.6-1.3-.7-1.5 1.7-1.7 1.5.7 1.3-.6z"/>'),
        kebab: svg('<circle cx="8" cy="3.2" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="12.8" r="1.2"/>'),
        close: svg('<path d="M4.2 3.5 8 7.3l3.8-3.8.7.7L8.7 8l3.8 3.8-.7.7L8 8.7l-3.8 3.8-.7-.7L7.3 8 3.5 4.2z"/>'),
        split: svg('<path d="M2.5 3.5h11v9h-11zm1 1v7h4.2V4.5zm5.2 0v7h4.8V4.5z"/>'),
        more: svg('<path d="M3 7h10v1.4H3zM3 4h10v1.4H3zM3 10h7v1.4H3z"/>'),
        pause: svg('<path d="M5 3.5h2.2v9H5zm3.8 0H11v9H8.8z"/>'),
        stepover: svg('<path d="M4 8.5a4 4 0 1 1 4 4v-1.3a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0-2.7 2.7H7L4 11.2 1 8.5z"/>'),
        stepinto: svg('<path d="M7.2 2.5h1.6v6.2l2.4-2.4.9.9L8 11.3 3.9 7.2l.9-.9 2.4 2.4z"/>'),
        stepout: svg('<path d="M7.2 13.5h1.6V7.3l2.4 2.4.9-.9L8 4.7 3.9 8.8l.9.9 2.4-2.4z"/>'),
        deactivate: svg('<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 12 12 4"/>'),
        brackets: svg('<path d="M5 3.2h-.8v9.6H5V14H2.6V2H5zm6 0h.8v9.6H11V14h2.4V2H11z" fill="currentColor"/>'),
        chev: svg('<path d="M4.5 6.2 8 9.7l3.5-3.5.8.8L8 11.3 3.7 7z"/>'),
        caretRight: svg('<path d="M6 4.2 10.5 8 6 11.8z" fill="currentColor"/>'),
        caretDown: svg('<path d="M4.2 6 8 10.5 11.8 6z" fill="currentColor"/>'),
        cloud: svg('<path fill="#9aa0a6" d="M12.7 10.7H4.2a2.4 2.4 0 0 1-.2-4.8 3.6 3.6 0 0 1 6.9-1.1 2.7 2.7 0 0 1 1.8 5.9z"/>'),
        folder: svg('<path fill="#dcb67a" d="M2.2 4.2h4.1l1.1 1.2h6.4v7.2H2.2z"/>'),
        fileJs: svg('<path fill="#e8ab53" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="5.4" font-family="Segoe UI,sans-serif" font-weight="700" fill="#2a1a00">JS</text>'),
        fileCss: svg('<path fill="#c586c0" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="4.4" font-family="Segoe UI,sans-serif" font-weight="700" fill="#2a0a22">CSS</text>'),
        fileTs: svg('<path fill="#62a8e8" d="M3.2 2.2h7.2L12.8 4.6v9.2H3.2z"/><text x="8" y="11.2" text-anchor="middle" font-size="4.6" font-family="Segoe UI,sans-serif" font-weight="700" fill="#071828">TS</text>'),
        pages: svg('<path fill="#9aa0a6" d="M3.2 3.2h7.2v9.6H3.2zm1.2 1.2v7.2h4.8V4.4zm7.2 1.2h1.2v8.4H6.8V13H12.8z"/>')
    };

    function fileIcon(kind) {
        if (kind === 'css') return ICO.fileCss;
        if (kind === 'ts') return ICO.fileTs;
        return ICO.fileJs;
    }

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    var KW_RE = /^(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|of|static|get|set|from|as|interface|type|enum|implements|package|public|private|protected|readonly|undefined|null|true|false)$/;

    function highlightJS(src) {
        var out = '';
        var i = 0, n = src.length;
        function take(len, cls) {
            var chunk = esc(src.slice(i, i + len));
            out += cls ? ('<span class="' + cls + '">' + chunk + '</span>') : chunk;
            i += len;
        }
        while (i < n) {
            var ch = src[i];
            var two = src.slice(i, i + 2);
            if (two === '//') {
                var e = src.indexOf('\n', i);
                if (e < 0) e = n;
                take(e - i, 'dt-tok-com');
                continue;
            }
            if (two === '/*') {
                var e2 = src.indexOf('*/', i + 2);
                take((e2 < 0 ? n : e2 + 2) - i, 'dt-tok-com');
                continue;
            }
            if (ch === "'" || ch === '"' || ch === '`') {
                var q = ch, j = i + 1;
                while (j < n) {
                    if (src[j] === '\\') { j += 2; continue; }
                    if (src[j] === q) { j += 1; break; }
                    if (ch !== '`' && src[j] === '\n') break;
                    j += 1;
                }
                take(j - i, 'dt-tok-str');
                continue;
            }
            if (/[0-9]/.test(ch) && (i === 0 || /[^\w$]/.test(src[i - 1]))) {
                var k = i;
                if (src.slice(i, i + 2).toLowerCase() === '0x') k += 2;
                while (k < n && /[0-9a-fA-FeE._]/.test(src[k])) k += 1;
                take(k - i, 'dt-tok-num');
                continue;
            }
            if (/[A-Za-z_$]/.test(ch)) {
                var k2 = i + 1;
                while (k2 < n && /[\w$]/.test(src[k2])) k2 += 1;
                var word = src.slice(i, k2);
                var after = src.slice(k2).match(/^\s*/);
                var sp = after ? after[0].length : 0;
                if (KW_RE.test(word)) take(k2 - i, 'dt-tok-kw');
                else if (src[k2 + sp] === '(') take(k2 - i, 'dt-tok-fn');
                else if (i > 0 && src[i - 1] === '.') take(k2 - i, 'dt-tok-prop');
                else take(k2 - i, 'dt-tok-prop');
                continue;
            }
            out += esc(ch);
            i += 1;
        }
        return out;
    }

    function highlightCSS(src) {
        var out = '';
        var i = 0, n = src.length;
        function take(len, cls) {
            var chunk = esc(src.slice(i, i + len));
            out += cls ? ('<span class="' + cls + '">' + chunk + '</span>') : chunk;
            i += len;
        }
        while (i < n) {
            var two = src.slice(i, i + 2);
            if (two === '/*') {
                var e = src.indexOf('*/', i + 2);
                take((e < 0 ? n : e + 2) - i, 'dt-tok-com');
                continue;
            }
            var ch = src[i];
            if (ch === "'" || ch === '"') {
                var q = ch, j = i + 1;
                while (j < n && src[j] !== q) {
                    if (src[j] === '\\') j += 2;
                    else j += 1;
                }
                take((j < n ? j + 1 : n) - i, 'dt-tok-str');
                continue;
            }
            if (ch === '#') {
                var k = i + 1;
                while (k < n && /[0-9A-Fa-f]/.test(src[k])) k += 1;
                if (k - i === 4 || k - i === 7 || k - i === 9) { take(k - i, 'dt-tok-str'); continue; }
            }
            if (/[0-9]/.test(ch) && (i === 0 || /[^\w-]/.test(src[i - 1]))) {
                var k2 = i;
                while (k2 < n && /[0-9.%]/.test(src[k2])) k2 += 1;
                take(k2 - i, 'dt-tok-num');
                continue;
            }
            if (/[A-Za-z_-]/.test(ch)) {
                var k3 = i + 1;
                while (k3 < n && /[\w-]/.test(src[k3])) k3 += 1;
                var word = src.slice(i, k3);
                var rest = src.slice(k3);
                if (/^\s*:/.test(rest) && src.slice(0, i).lastIndexOf('{') > src.slice(0, i).lastIndexOf('}')) {
                    take(k3 - i, 'dt-tok-prop');
                } else if (word === 'from' || word === 'to' || word === 'important') {
                    take(k3 - i, 'dt-tok-kw');
                } else {
                    take(k3 - i, 'dt-tok-fn');
                }
                continue;
            }
            out += esc(ch);
            i += 1;
        }
        return out;
    }

    function highlighted(id) {
        if (htmlCache[id]) return htmlCache[id];
        var src = SOURCES[id];
        if (!src) return '';
        var html = src.lang === 'css' ? highlightCSS(src.text) : highlightJS(src.text);
        htmlCache[id] = html;
        return html;
    }

    function renderCode(id) {
        var src = SOURCES[id];
        if (!src) return;
        var html = highlighted(id);
        var lines = html.split('\n');
        if (lines.length && lines[lines.length - 1] === '') lines.pop();
        var buf = [];
        var i;
        for (i = 0; i < lines.length; i++) {
            var caret = (i === 0) ? '<span class="dt-caret-blink" aria-hidden="true"></span>' : '';
            buf.push(
                '<div class="dt-code-row' + (i === 0 ? ' is-current' : '') + '" data-line="' + (i + 1) + '">' +
                '<span class="dt-ln">-</span>' +
                '<span class="dt-line">' + (lines[i] || '') + caret + '</span>' +
                '</div>'
            );
        }
        var sc = root.querySelector('.dt-code-scroll');
        sc.innerHTML = buf.join('');
        sc.scrollTop = 0;
        currentLine = 1;
        updateStatus(1, 1);
        activeId = id;
        syncActive();
    }

    function colAtScroll() {
        // Calm, decorative column — slowly drift a little as we scroll.
        var sc = root.querySelector('.dt-code-scroll');
        var y = sc ? sc.scrollTop : 0;
        return 1 + Math.floor(y / 40) % 24;
    }

    function updateStatus(line, col) {
        var el = root.querySelector('.dt-status-pos-text');
        if (el) el.textContent = 'Line ' + line + ', column ' + col;
    }

    function syncActive() {
        var nodes = root.querySelectorAll('[data-file]');
        var i;
        for (i = 0; i < nodes.length; i++) {
            nodes[i].classList.toggle('is-active', nodes[i].getAttribute('data-file') === activeId);
        }
    }

    function openFile(id) {
        if (!SOURCES[id] || id === activeId) {
            if (SOURCES[id]) syncActive();
            return;
        }
        renderCode(id);
    }

    function filetabsHtml() {
        return FILES.map(function (f, i) {
            var x = (i === 0) ? '<span class="dt-filetab-x" aria-hidden="true">×</span>' : '';
            return '<button type="button" class="dt-filetab' + (f.id === DEFAULT ? ' is-active' : '') + '" data-file="' + f.id + '">' +
                f.label + x + '</button>';
        }).join('');
    }

    function row(opts) {
        var pad = opts.depth || 0;
        var caret = opts.leaf
            ? '<span class="dt-caret is-empty"></span>'
            : '<span class="dt-caret">' + (opts.open ? ICO.caretDown : ICO.caretRight) + '</span>';
        var fileAttr = opts.file ? ' data-file="' + opts.file + '"' : '';
        var toggle = opts.leaf ? '' : ' data-toggle="' + (opts.key || '') + '"';
        var active = opts.file === DEFAULT ? ' is-active' : '';
        return '<div class="dt-tree-row' + active + '"' + fileAttr + toggle +
            ' style="padding-left:' + (4 + pad * 12) + 'px">' +
            caret +
            '<span class="dt-tree-icon">' + opts.icon + '</span>' +
            '<span class="dt-tree-label">' + opts.label + '</span>' +
            '</div>';
    }

    function treeHtml() {
        return [
            row({ depth: 0, open: true, icon: ICO.pages, label: 'top', key: 'top' }),
            '<div class="dt-tree-children is-open" data-branch="top">',
                row({ depth: 1, open: true, icon: ICO.cloud, label: 'eekseye.com', key: 'eek' }),
                '<div class="dt-tree-children is-open" data-branch="eek">',
                    row({ depth: 2, open: true, icon: ICO.folder, label: 'js', key: 'js' }),
                    '<div class="dt-tree-children is-open" data-branch="js">',
                        row({ depth: 3, leaf: true, icon: fileIcon('js'), label: 'index-grid-float.js', file: 'index-grid-float.js' }),
                        row({ depth: 3, leaf: true, icon: fileIcon('js'), label: 'index-scroll-fade.js', file: 'index-scroll-fade.js' }),
                        row({ depth: 3, leaf: true, icon: fileIcon('js'), label: 'index-hero-reflection.js', file: 'index-hero-reflection.js' }),
                    '</div>',
                    row({ depth: 2, open: true, icon: ICO.folder, label: 'css', key: 'css' }),
                    '<div class="dt-tree-children is-open" data-branch="css">',
                        row({ depth: 3, leaf: true, icon: fileIcon('css'), label: 'index-grid-underwater.css', file: 'index-grid-underwater.css' }),
                    '</div>',
                    row({ depth: 2, leaf: true, icon: fileIcon('ts'), label: 'environment.ts', file: 'environment.ts' }),
                '</div>',
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'cdn.jsdelivr.net', key: 'cdnjsd' }),
                '<div class="dt-tree-children" data-branch="cdnjsd">',
                    row({ depth: 2, open: false, icon: ICO.folder, label: 'npm', key: 'npm' }),
                    '<div class="dt-tree-children" data-branch="npm">',
                        row({ depth: 3, open: false, icon: ICO.folder, label: '@emailjs/browser@3/dist', key: 'email' }),
                        '<div class="dt-tree-children" data-branch="email">',
                            row({ depth: 4, leaf: true, icon: fileIcon('js'), label: 'email.min.js', file: '' }),
                        '</div>',
                        row({ depth: 3, open: false, icon: ICO.folder, label: 'three@0.160.0/build', key: 'three' }),
                    '</div>',
                '</div>',
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'cdnjs.cloudflare.com', key: 'cdnjs' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'fonts.cdnfonts.com', key: 'cdnfonts' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'fonts.googleapis.com', key: 'gfonts' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'fonts.gstatic.com', key: 'gstaticfonts' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'localhost', key: 'local' }),
                row({ depth: 1, open: false, icon: ICO.cloud, label: 'www.gstatic.com', key: 'gstatic' }),
            '</div>'
        ].join('');
    }

    var MAIN_TABS = ['Elements', 'Console', 'Sources', 'Network', 'Performance', 'Memory', 'Application', 'Security', 'Lighthouse', 'Recorder'];

    function markup() {
        var tabs = MAIN_TABS.map(function (name) {
            var on = name === 'Sources' ? ' is-active' : '';
            return '<span class="dt-tab' + on + '">' + name + '</span>';
        }).join('');
        return (
            '<div class="dt-tabbar">' +
                '<div class="dt-tabbar-left">' +
                    '<span class="dt-ico">' + ICO.inspect + '</span>' +
                    '<span class="dt-ico">' + ICO.device + '</span>' +
                '</div>' +
                '<div class="dt-tabs">' + tabs + '</div>' +
                '<div class="dt-tabbar-right">' +
                    '<span class="dt-badge is-error"><span class="dt-badge-dot"></span>2</span>' +
                    '<span class="dt-badge is-warn"><span class="dt-badge-dot"></span>2</span>' +
                    '<span class="dt-ico">' + ICO.gear + '</span>' +
                    '<span class="dt-ico">' + ICO.kebab + '</span>' +
                    '<span class="dt-ico">' + ICO.close + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="dt-subbar">' +
                '<div class="dt-tree-tabs">' +
                    '<span class="dt-tree-tab is-active">Page</span>' +
                    '<span class="dt-tree-tab">Workspace</span>' +
                    '<span class="dt-tree-tab">Overrides</span>' +
                    '<span class="dt-tree-tab">≫</span>' +
                '</div>' +
                '<div class="dt-filetabs">' + filetabsHtml() +
                    '<div class="dt-filetabs-end"><span class="dt-ico">' + ICO.split + '</span><span class="dt-ico">' + ICO.more + '</span></div>' +
                '</div>' +
                '<div class="dt-side-tools">' +
                    '<span class="dt-ico">' + ICO.pause + '</span>' +
                    '<span class="dt-ico">' + ICO.stepover + '</span>' +
                    '<span class="dt-ico">' + ICO.stepinto + '</span>' +
                    '<span class="dt-ico">' + ICO.stepout + '</span>' +
                    '<span class="dt-ico">' + ICO.deactivate + '</span>' +
                '</div>' +
            '</div>' +
            '<div class="dt-panes">' +
                '<div class="dt-tree">' +
                    '<div class="dt-tree-scroll">' + treeHtml() + '</div>' +
                '</div>' +
                '<div class="dt-editor">' +
                    '<div class="dt-code-scroll" tabindex="0"></div>' +
                    '<div class="dt-status">' +
                        '<div class="dt-status-left">' +
                            '<span class="dt-ico" style="width:16px;height:16px">' + ICO.chev + '</span>' +
                            '<span class="dt-status-pos">' +
                                '<span class="dt-ico" style="width:14px;height:14px">' + ICO.brackets + '</span>' +
                                '<span class="dt-status-pos-text">Line 1, column 1</span>' +
                            '</span>' +
                        '</div>' +
                        '<div class="dt-status-right">Coverage: N/A</div>' +
                    '</div>' +
                '</div>' +
                '<aside class="dt-side" aria-hidden="true">' +
                    '<div class="dt-side-scroll">' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Watch</div></div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Breakpoints</div>' +
                            '<div class="dt-sec-body">' +
                                '<label class="dt-check"><input type="checkbox" tabindex="-1"> Pause on uncaught exceptions</label>' +
                                '<label class="dt-check"><input type="checkbox" checked tabindex="-1"> Pause on caught exceptions</label>' +
                            '</div>' +
                        '</div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Scope</div>' +
                            '<div class="dt-paused">Not paused</div>' +
                        '</div>' +
                        '<div class="dt-sec">' +
                            '<div class="dt-sec-h"><span class="dt-caret">' + ICO.caretDown + '</span>Call Stack</div>' +
                            '<div class="dt-paused">Not paused</div>' +
                        '</div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>XHR/fetch breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>DOM breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Global listeners</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>Event listener breakpoints</div></div>' +
                        '<div class="dt-sec"><div class="dt-sec-h"><span class="dt-caret">' + ICO.caretRight + '</span>CSP violation breakpoints</div></div>' +
                    '</div>' +
                '</aside>' +
            '</div>'
        );
    }

    function bind() {
        root.addEventListener('click', function (e) {
            var tab = e.target.closest('.dt-filetab, .dt-tree-row[data-file]');
            if (tab && tab.getAttribute('data-file')) {
                e.preventDefault();
                openFile(tab.getAttribute('data-file'));
                return;
            }
            var tog = e.target.closest('[data-toggle]');
            if (tog && tog.getAttribute('data-toggle')) {
                var key = tog.getAttribute('data-toggle');
                var branch = root.querySelector('[data-branch="' + key + '"]');
                if (branch) {
                    var open = !branch.classList.contains('is-open');
                    branch.classList.toggle('is-open', open);
                    var caret = tog.querySelector('.dt-caret');
                    if (caret) caret.innerHTML = open ? ICO.caretDown : ICO.caretRight;
                }
            }
        });
        var sc = root.querySelector('.dt-code-scroll');
        sc.addEventListener('scroll', function () {
            var line = Math.max(1, Math.floor(sc.scrollTop / 16) + 1);
            currentLine = line;
            updateStatus(line, colAtScroll());
            var rows = sc.querySelectorAll('.dt-code-row');
            var idx = Math.min(rows.length - 1, line - 1);
            var i;
            for (i = 0; i < rows.length; i++) rows[i].classList.toggle('is-current', i === idx);
        }, { passive: true });
    }

    function startAutoScroll() {
        if (reduced) return;
        var sc = root.querySelector('.dt-code-scroll');
        var acc = 0;
        var started = 0;
        function tick(now) {
            if (!sc || !root.isConnected) return;
            if (!started) started = now;
            if (now - started < 1800) {
                scrollTimer = window.requestAnimationFrame(tick);
                return;
            }
            var max = sc.scrollHeight - sc.clientHeight;
            if (max > 8) {
                acc += 0.28 * scrollDir;
                if (acc >= 1 || acc <= -1) {
                    sc.scrollTop += acc;
                    acc = acc - (acc >= 1 ? Math.floor(acc) : Math.ceil(acc));
                }
                if (sc.scrollTop >= max - 0.5) scrollDir = -1;
                if (sc.scrollTop <= 0) scrollDir = 1;
            }
            scrollTimer = window.requestAnimationFrame(tick);
        }
        scrollTimer = window.requestAnimationFrame(tick);
    }

    function pinToScroll() {
        if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
            root.style.transform = '';
            return;
        }
        root.style.transform = 'translateY(' + (-(window.scrollY || 0)) + 'px)';
    }

    root.innerHTML = markup();
    renderCode(DEFAULT);
    bind();
    pinToScroll();
    window.addEventListener('scroll', pinToScroll, { passive: true });
    window.addEventListener('resize', pinToScroll);
    startAutoScroll();
})();
