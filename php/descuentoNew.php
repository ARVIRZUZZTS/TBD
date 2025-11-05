<?php
header("Content-Type: application/json");
include "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_periodo_curso = $data["id_periodo_curso"] ?? null;
$costo_canje = $data["costo_canje"] ?? null;
$fecha_fin = $data["fecha_fin"] ?? null;
$porcentaje_descuento = $data["porcentaje_descuento"] ?? null;

if (!$id_periodo_curso || !$costo_canje || !$fecha_fin || !$porcentaje_descuento) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan datos obligatorios."]);
    exit;
}

try {
    $sqlLast = "SELECT id_descuento FROM DESCUENTO ORDER BY CAST(SUBSTRING(id_descuento, 4) AS UNSIGNED) DESC LIMIT 1";
    $resLast = $conexion->query($sqlLast);

    $nuevoNumero = 1; 
    if ($resLast && $resLast->num_rows > 0) {
        $row = $resLast->fetch_assoc();
        $ultimoId = $row["id_descuento"];
        $numero = intval(substr($ultimoId, 3));
        $nuevoNumero = $numero + 1;
    }

    $nuevoId = "RD-" . $nuevoNumero;

    $sqlInsert = "
        INSERT INTO DESCUENTO (id_descuento, id_periodo_curso, costo_canje, fecha_fin, porcentaje_descuento)
        VALUES (?, ?, ?, ?, ?)
    ";

    $stmt = $conexion->prepare($sqlInsert);
    $stmt->bind_param("sidsd", $nuevoId, $id_periodo_curso, $costo_canje, $fecha_fin, $porcentaje_descuento);

    if ($stmt->execute()) {
        echo json_encode([
            "exito" => true,
            "mensaje" => "Descuento registrado correctamente.",
            "id_descuento" => $nuevoId
        ]);
    } else {
        echo json_encode([
            "exito" => false,
            "mensaje" => "Error al insertar el descuento.",
            "error" => $stmt->error
        ]);
    }

    $stmt->close();
    $conexion->close();

} catch (Exception $e) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error interno del servidor.",
        "error" => $e->getMessage()
    ]);
}
?>
