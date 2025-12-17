document.addEventListener("DOMContentLoaded", function() {

});

function ingresarMaestro() {
    const username = document.getElementById("getUs").value.trim();
    const password = document.getElementById("getPass").value.trim();

    if (!username || !password) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    fetch("php/maestroIngresar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            localStorage.setItem("id_user", data.id_user);
            localStorage.setItem("rol", "Maestro");
            window.location = `menu.html`;
        } else {
            alert(data.mensaje || "Error al iniciar sesión");
        }
    })
    .catch(err => {
        console.error("Error al iniciar sesión:", err);
        alert("Error de conexión");
    });
}

function back() {
    window.location = "inicio.html";
}

function home() {
    window.location = "inicio.html";
}

function est() {
    window.location = "loggin.html?est=i";
}