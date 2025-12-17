<?php
header("Content-Type: application/json");
include 'conexion.php';

$orden = $_GET["orden"] ?? "activas";

switch ($orden) {
    case "expiradas":
        $where = "WHERE d.fecha_fin < CURDATE()";
        $orderBy = "d.fecha_fin ASC";
        break;
    case "mayor":
        $where = "";
        $orderBy = "d.porcentaje_descuento DESC";
        break;
    case "menor":
        $where = "";
        $orderBy = "d.porcentaje_descuento ASC";
        break;
    default:
        $where = "WHERE d.fecha_fin >= CURDATE()";
        $orderBy = "d.fecha_fin ASC";
        break;
}

$sql = "
    SELECT 
        d.id_descuento,
        d.id_periodo_curso,
        pc.costo AS costo,
        d.costo_canje,
        d.fecha_fin,
        d.porcentaje_descuento,
        c.titulo
    FROM DESCUENTO d
    INNER JOIN PERIODO_CURSO pc ON d.id_periodo_curso = pc.id_periodo_curso
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    $where
    ORDER BY $orderBy
";

$res = $conexion->query($sql);

if (!$res) {
    echo json_encode(["exito" => false, "mensaje" => "Error al obtener descuentos", "error" => $conexion->error]);
    exit;
}

$descuentos = [];
while ($row = $res->fetch_assoc()) {
    $descuentos[] = $row;
}

if (count($descuentos) > 0) {
    echo json_encode(["exito" => true, "descuentos" => $descuentos]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "No se encontraron descuentos"]);
}

$conexion->close();
?>
