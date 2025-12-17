<?php
include 'conexion.php';

echo "COSMETICO:\n";
$sql = "SELECT * FROM cosmetico";
$result = $conexion->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id_cosmetico"]. " Type: " . $row["id_tipo_cosmetico"]. " Name: " . $row["nombre"]. "\n";
    }
} else {
    echo "0 results in cosmetico\n";
}

echo "TIPO_COSMETICO:\n";
$sql = "SELECT * FROM tipo_cosmetico";
$result = $conexion->query($sql);
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id_tipo_cosmetico"]. " Title: " . $row["titulo"]. "\n";
    }
} else {
    echo "0 results in tipo_cosmetico\n";
}
?>
