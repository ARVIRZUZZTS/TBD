<?php
include 'conexion.php';

echo "<h2>Tipo Cosmetico</h2>";
$sql = "SELECT * FROM tipo_cosmetico";
$result = $conexion->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id_tipo_cosmetico"]. " - Titulo: " . $row["titulo"]. " - Desc: " . $row["descripcion"]. "<br>";
    }
} else {
    echo "0 results";
}

echo "<h2>Cosmetico</h2>";
$sql = "SELECT * FROM cosmetico";
$result = $conexion->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id_cosmetico"]. " - Tipo ID: " . $row["id_tipo_cosmetico"]. " - Costo: " . $row["costo_canje"]. "<br>";
    }
} else {
    echo "0 results";
}
?>
