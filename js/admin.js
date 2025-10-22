function ingresar() {
    const usuario = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("pass").value.trim();
    if (usuario === "" || pass === "") {
        alert("Por favor, todos los campos son Obligatorios");
        return;
    }
    fetch("php/adminIngresar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ usuario, pass})
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            window.location = `administrador.html?usuario=${usuario}`;
        } else {
            alert(data.mensaje);
        }
    })
    .catch(err => console.error("Error:", err));
}
function admin() {
    window.location = "administrador.html";
}
function back() {
    window.location = "inicio.html";
}
function home() {
    window.location = "inicio.html";
}