function createShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createProgram(gl, vs, fs, varyings) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    if (varyings != null) {
        gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return undefined;
    }
    else {
        return program;
    }
}

function makeBuffer(gl, data, type) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, type);
    return buffer;
}

function makeTransformFeedback(gl, buffer, pos) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, pos, buffer);
    return tf;
}

function setAttribute(gl, buffer, attribLoc, size, type) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribLoc);
    gl.vertexAttribPointer(attribLoc, size, type, false, 0, 0);
}

function createVAO(gl, bufferAttribSizeType) {  // Buffer, attributePos, size and type
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    for (const [buffer, loc, size, type] of bufferAttribSizeType) {
        setAttribute(gl, buffer, loc, size, type);
    }
    return vao;
}