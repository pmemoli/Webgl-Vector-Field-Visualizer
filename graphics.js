const updateShaderSourceBeforeSpeed =
`#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_visAmplitude;
uniform bool u_restartPos;
out vec2 v_outPos;

highp float rand(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = (zeroToOne * 2.0 - 1.0) * vec2(u_visAmplitude.x, u_visAmplitude.y);

    float x = clipSpace.x;
    float y = clipSpace.y;
`

const updateShaderSourceAfterSpeed = 
    `if (!u_restartPos || ((0.0 <= a_position.x) && (a_position.x <= u_resolution.x) &&
    (0.0 <= a_position.y) && (a_position.y <= u_resolution.y) && distance(vec2(0.0, 0.0), velocity) > 1.0)) {
        v_outPos = a_position + velocity * (0.01666666);  // Assumes 60fps
    }
    else {
        vec2 newPos = vec2(rand(a_position) * u_resolution.x, rand(vec2(a_position.x + 10.0, a_position.y + 17.0)) * u_resolution.y);
        v_outPos = newPos + velocity * (0.01666666);  // Assumes 60fps
        //v_outPos = a_position + velocity * (0.01666666);
    }
}`;

const drawShaderSource = 
`# version 300 es

in vec2 a_position;
uniform vec2 u_resolution;
uniform float u_pointSize;

void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_PointSize = u_pointSize;
}`;

const fragmentShaderSource = 
`#version 300 es

precision highp float;
out vec4 outColor;
uniform vec4 u_color;

void main() {
    outColor = u_color;
}`;


function main(xComponent, yComponent, visAmplitude, restartPos, pointSize, color, particleAmount) {
    // Create update movement shader
    const velocityString = `vec2 velocity = vec2(${xComponent}, ${yComponent});`
    const updateShaderSource =
    `${updateShaderSourceBeforeSpeed}
    ${velocityString}
    ${updateShaderSourceAfterSpeed}`

    // Initialization
    const canvas = document.querySelector("#c");
    const gl = canvas.getContext("webgl2");
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Programs creation
    const updateShader = createShader(gl, gl.VERTEX_SHADER, updateShaderSource); 
    const drawShader = createShader(gl, gl.VERTEX_SHADER, drawShaderSource);
    const paintShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const updateProgram = createProgram(gl, updateShader, paintShader, ['v_outPos']); 
    const drawProgram = createProgram(gl, drawShader, paintShader);
    
    // Variable locations
    const locations = {
        updatePosLocation: gl.getAttribLocation(updateProgram, "a_position"),
        resolutionUpdateUniformLocation: gl.getUniformLocation(updateProgram, "u_resolution"),
        visAmpUniformLocation: gl.getUniformLocation(updateProgram, "u_visAmplitude"),
        restartPosUniformLocation: gl.getUniformLocation(updateProgram, "u_restartPos"),

        drawPosLocation: gl.getAttribLocation(drawProgram, "a_position"),
        resolutionUniformLocation: gl.getUniformLocation(drawProgram, "u_resolution"),
        pointSizeUniformLoc: gl.getUniformLocation(drawProgram, "u_pointSize"),
        colorUniformLoc: gl.getUniformLocation(drawProgram, "u_color"),
    }

    // Set initial positions and velocities
    const positions = [];
    for (let i = 0; i < particleAmount; i++) {
        positions.push(Math.random() * gl.canvas.width, Math.random() * gl.canvas.width);
    }

    // Set up buffers and transform feedback
    const posBuffer1 = makeBuffer(gl, new Float32Array(positions), gl.DYNAMIC_DRAW);
    const posBuffer2 = makeBuffer(gl, new Float32Array(positions), gl.DYNAMIC_DRAW);
    const tf1 = makeTransformFeedback(gl, posBuffer1, 0);
    const tf2 = makeTransformFeedback(gl, posBuffer2, 0);

    // Set up vertex array objects
    const updatePos1VAO = createVAO(gl, [[posBuffer1, locations.updatePosLocation, 2, gl.FLOAT]]);

    const updatePos2VAO = createVAO(gl, [[posBuffer2, locations.updatePosLocation, 2, gl.FLOAT]]);

    const drawPos1VAO = createVAO(gl, [[posBuffer1, locations.drawPosLocation, 2, gl.FLOAT]]);
    const drawPos2VAO = createVAO(gl, [[posBuffer2, locations.drawPosLocation, 2, gl.FLOAT]]);

    let currentState = {
        updateVAO: updatePos1VAO,  // Updates pos1
        tf: tf2,  // Saves update pos1 to pos2
        drawVAO: drawPos2VAO,  // Draws with pos2
    };

    let nextState = {
        updateVAO: updatePos2VAO,  // Updates pos2
        tf: tf1,  // Saves updated pos2 to pos1
        drawVAO: drawPos1VAO,  // Draws with pos1
    };

    // Unbind whatever is left
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

    // Animate and draw movement
    let initialTime = performance.now();
    let deltaTime = 0;
    function render() {
        // Time management so that fps = 60
        let finalTime = performance.now();
        deltaTime = deltaTime + finalTime - initialTime;
        initialTime = finalTime;

        if (deltaTime > (1000 / 60)) { 
            // Reset delta time
            deltaTime = 0;

            // Canvas size setup
            gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
            gl.clearColor(0, 0, 0, 1);

            // Update new Positions
            gl.useProgram(updateProgram);
            gl.bindVertexArray(currentState.updateVAO);

            gl.enable(gl.RASTERIZER_DISCARD); // Don't run fragment shader
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, currentState.tf);
            gl.beginTransformFeedback(gl.POINTS);

            gl.uniform2f(locations.resolutionUpdateUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform2f(locations.visAmpUniformLocation, visAmplitude[0], visAmplitude[1]);
            gl.uniform1f(locations.restartPosUniformLocation, restartPos);
            gl.drawArrays(gl.POINTS, 0, particleAmount);
            
            gl.endTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
            gl.disable(gl.RASTERIZER_DISCARD);

            // Draw the particles
            gl.useProgram(drawProgram);
            gl.bindVertexArray(currentState.drawVAO);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.uniform2f(locations.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform4f(locations.colorUniformLoc, color[0], color[1], color[2], color[3]);
            gl.uniform1f(locations.pointSize, pointSize);
            gl.drawArrays(gl.POINTS, 0, particleAmount);

            // Switch states
            const temp = currentState;
            currentState = nextState;
            nextState = temp;
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}   

main("x / sqrt(x * x)", "10.0 * sin(x * x + y * y)", [50, 25], true, 1, [1, 1, 0.5, 1], 600000);
