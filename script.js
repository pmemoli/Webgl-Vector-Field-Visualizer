// TODO: Agregar modo congruencia, y dar UI.
const hideParametersHtmlSource = 
`<button id="showParam">Show Parameters</button>`

const parameterHtmlSource = 
`<span>Vector Field Parameters:</span><br>

<form id="parameters">
    <label for="X">X Component</label>
    <input id="xComp" value="x">
    <label for="Y">Y Component</label>
    <input id="yComp" value="50.0 * sin(x*x + y*y)">
    <label for="Y">Particle Amount</label>
    <input id="partAmount" value="400000">
    <label for="Y">Particle Size</label>
    <input id="partSize" value="1">
    <label for="Y">X screen amplitude</label>
    <input id="xAmp" value="50">
    <label for="Y">Y screen amplitude</label>
    <input id="yAmp" value="25">
    <label for="Y">Min. Colored Speed</label>
    <input id="minColSpeed" value="1">
</form>

<span>Restart:</span>
<input type="radio" id="congruence" name="restartType" value="congruence">
<label for="congruence">Congruence</label>
<input type="radio" id="randomPos" name="randomPos" value="randomPos" checked>
<label for="restart">Random Pos.</label>
<input type="radio" id="noRestart" name="noRestart" value="noRestart">
<label for="noRestart">No restart</label><br>

<button id="start">Start</button>
<button id="help">Help</button>
<button id="hideParam">Hide Parameters</button>
<span>Particle Color:</span>
<input type="color" id="color" name="color" value="#e66465">`

function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [((c>>16)&255) / 255, ((c>>8)&255) / 255, (c&255) / 255, 1];
    }
    throw new Error('Bad Hex');
}


const paramBox = document.getElementById("paramBox");

function runField() {
    const xComponent = document.getElementById("xComp").value;
    const yComponent = document.getElementById("yComp").value;
    const xAmplitude = document.getElementById("xAmp").value;
    const yAmplitude = document.getElementById("yAmp").value;
    const pointSize = document.getElementById("partSize").value;
    const particleAmount = document.getElementById("partAmount").value;
    const minSpeed = document.getElementById("minColSpeed").value;

    const color = hexToRgbA(document.getElementById("color").value); // convert to rgba
    
    const restartPos = document.getElementById("randomPos");
    const moduloPos = document.getElementById("congruence");
    const noRestartPos = document.getElementById("noRestart");

    let mode = "";
    if (restartPos.checked) {
        mode = "restart";
    }
    else if (moduloPos.checked) {
        mode = "modulo";
    }
    else {
        mode = "noRestart";
    }

    main(xComponent, yComponent, [xAmplitude, yAmplitude], mode, pointSize, color, particleAmount, minSpeed);
}

function hiddenParameterManagement() {
    paramBox.innerHTML = '';
    paramBox.insertAdjacentHTML('beforeend', hideParametersHtmlSource);
    let button = document.getElementById("showParam");
    button.addEventListener("click", showParameterManagement);
    
}

function showParameterManagement() {
    paramBox.innerHTML = '';
    paramBox.insertAdjacentHTML('beforeend', parameterHtmlSource);
    let hideButton = document.getElementById("hideParam");
    let startButton = document.getElementById("start");
    hideButton.addEventListener("click", hiddenParameterManagement);
    startButton.addEventListener("click", runField);
}

showParameterManagement();