const params = new URLSearchParams(window.location.search);
let est = params.get("est");

document.addEventListener("DOMContentLoaded", function(){
    setTipo();
});

function setTipo() {
    if (est == "i") {
        const ini = document.getElementById("ini");
        const reg = document.getElementById("reg");
        const bots = document.getElementById("bots");
        ini.classList.remove("back");
        ini.classList.add("shiny");
        reg.classList.remove("shiny");
        reg.classList.add("back");
        bots.style.height = "6.5vh";
        bots.innerHTML = "";
        bots.innerHTML = `
            <div>
                <input id="getUs" type="text" placeholder="Usuario" maxlength="30" autocomplete="off">
                <input id="getPass" type="password" placeholder="Contraseña" maxlength="30" autocomplete="off">
            </div>
        `;
    } else if (est == "r") {
        const ini = document.getElementById("ini");
        const reg = document.getElementById("reg");
        const bots = document.getElementById("bots");
        reg.classList.remove("back");
        reg.classList.add("shiny");
        ini.classList.remove("shiny");
        ini.classList.add("back");
        bots.style.height = "28.5vh";
        bots.innerHTML = "";
        bots.innerHTML = `
            <div>
                <input id="setNm" type="text" placeholder="Nombres" maxlength="30" autocomplete="off">
                <input id="setAp" type="text" placeholder="Apellidos" maxlength="30" autocomplete="off">
            </div>
            <div>
                <input id="setUs" type="text" placeholder="Nombre de Usuario" maxlength="15" autocomplete="off">
                <input id="setCi" type="number" placeholder="Carnet de Idetidad" maxlength="10" autocomplete="off">
            </div>
            <div>
                <input id="setTl" type="number" placeholder="Telefono" maxlength="15" autocomplete="off">
                <input id="setCo" type="email" placeholder="Correo" maxlength="100" autocomplete="off">
            </div>
            <div>
                <input id="setEd" type="number" placeholder="Edad" maxlength="3" autocomplete="off">
                <input id="setGe" type="text" placeholder="Grado Educativo" maxlength="30" autocomplete="off">
            </div>
            <div>
                <input id="setPass" type="password" placeholder="Contraseña" maxlength="30" autocomplete="off">
                <input id="setPass2" type="password" placeholder="Confirmar Contraseña" maxlength="30" autocomplete="off">
            </div>
        `;        
    } else {
        window.location = "inicio.html";
    }
}
function inics() {
    est = "i";
    setTipo();
}
function regcs() {
    est = "r";
    setTipo();
}
function estu() {
    if (est == "i") {
        iniciar();
    } else if (est == "r") {
        registrar();
    } else {
        window.location = "inicio.html";
    }
    window.location = "estudiante.html";
}
function registrar() {
    let setNm = document.getElementById("setNm");
    let setAp = document.getElementById("setAp");
    let setUs = document.getElementById("setUs");
    let setCi = document.getElementById("setCi");
    let setTl = document.getElementById("setTl");
    let setCo = document.getElementById("setCo");
    let setEd = document.getElementById("setEd");
    let setGe = document.getElementById("setGe");
    let setPass = document.getElementById("setPass");
    let setPass2 = document.getElementById("setPass2");
    window.location = "estudiante.html";
}
function iniciar() {
    let getUs = document.getElementById("getUs");
    let getPass = document.getElementById("getPass");
    window.location = "estudiante.html";
}
function back() {
    window.location = "inicio.html";
}
const pressedKeys = new Set();
document.addEventListener("keydown", function(event){
    if(event.ctrlKey && event.altKey) {
        pressedKeys.add(event.key.toLowerCase());
        if (pressedKeys.has("a") && pressedKeys.has("d") && pressedKeys.has("m")) {
            admin();
        }
    }
});
document.addEventListener("keyup", function(event) {
    pressedKeys.delete(event.key.toLowerCase());
});
function admin() {
    window.location = "admin.html";
}
function home() {
    window.location = "inicio.html";
}
function mae() {
    window.location = "maestro.html";
}