<?php
header("Content-Type: application/json");
include '../conexion.php';

try {
    $nombre_permiso = 'DarBecas';

    $sql = "INSERT INTO PERMISO (nombre_permiso) VALUES (?)";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "s", $nombre_permiso);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'exito' => true,
            'mensaje' => "Permiso '$nombre_permiso' insertado correctamente."
        ]);
    } else {
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Error al insertar el permiso: ' . mysqli_error($conexion)
        ]);
    }

    mysqli_stmt_close($stmt);

} catch (Exception $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Excepción: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?>
