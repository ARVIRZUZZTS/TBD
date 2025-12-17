document.addEventListener("DOMContentLoaded", function() {
    // El formulario ya está predefinido para login de maestro
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
            inicioCierre("INICIO", data.id_user);
            window.location = `maestro.html`;
        } else {
            alert(data.mensaje || "Error al iniciar sesión");
        }
    })
    .catch(err => {
        console.error("Error al iniciar sesión:", err);
        alert("Error de conexión");
    });
}

function inicioCierre(accion, id_user) {
    const data = {
        accion: accion.toUpperCase(),
        id_user: id_user
    };

    fetch("php/bitUsuario.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.exito) {
            console.log("Bitácora registrada:", result.mensaje);
        } else {
            console.error("Error al registrar bitácora:", result.mensaje);
        }
    })
    .catch(error => {
        console.error("Error en la conexión con el servidor:", error);
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