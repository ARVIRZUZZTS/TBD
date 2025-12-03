<?php
include 'conexion.php';

function executeQuery($conn, $sql, $message) {
    if ($conn->query($sql) === TRUE) {
        echo "$message: OK<br>";
    } else {
        echo "$message: Error - " . $conn->error . "<br>";
    }
}

// 1. Add columns to cosmetico
$sql = "ALTER TABLE cosmetico 
        ADD COLUMN nombre VARCHAR(50) DEFAULT NULL, 
        ADD COLUMN valor VARCHAR(50) DEFAULT NULL, 
        ADD COLUMN imagen VARCHAR(100) DEFAULT NULL";
executeQuery($conexion, $sql, "Alter table cosmetico");

// 2. Add column to usuario
$sql = "ALTER TABLE usuario ADD COLUMN id_paleta_activa INT DEFAULT NULL";
executeQuery($conexion, $sql, "Alter table usuario");

// 3. Insert Tipo Cosmetico (Paletas)
$sql = "INSERT INTO tipo_cosmetico (id_tipo_cosmetico, titulo, descripcion, imagen) 
        VALUES (1, 'Paleta de Colores', 'Cambia los colores de la interfaz', 'palette.png')
        ON DUPLICATE KEY UPDATE titulo=titulo"; 
executeQuery($conexion, $sql, "Insert tipo_cosmetico");

// 4. Insert Palettes
// Default (Orange/White) - Maybe not needed as a reward, but good to have as ID 1? 
// Let's add some purchasable ones.

$palettes = [
    [2, 1, 100, 'Noche', 'theme-dark', 'moon.png'],
    [3, 1, 150, 'Océano', 'theme-ocean', 'water.png'],
    [4, 1, 200, 'Bosque', 'theme-forest', 'leaf.png'],
    [5, 1, 500, 'Dorado', 'theme-gold', 'gold.png']
];

foreach ($palettes as $p) {
    $sql = "INSERT INTO cosmetico (id_cosmetico, id_tipo_cosmetico, costo_canje, nombre, valor, imagen) 
            VALUES ($p[0], $p[1], $p[2], '$p[3]', '$p[4]', '$p[5]')
            ON DUPLICATE KEY UPDATE nombre='$p[3]', valor='$p[4]'";
    executeQuery($conexion, $sql, "Insert palette $p[3]");
}

echo "Database setup completed.";
?>
