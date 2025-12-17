<?php
header("Content-Type: application/json");
include "conexion.php";

$sql = "
    SELECT 
        pc.id_periodo_curso,
        c.titulo,
        pc.cupos,
        pc.cupos_ocupados,
        pc.fecha_inicio,
        pc.fecha_fin
    FROM PERIODO_CURSO pc
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    WHERE pc.estado_periodo = 'Inscripciones'
    ORDER BY pc.fecha_inicio ASC
";

$res = $conexion->query($sql);

if (!$res) {
    echo json_encode([
        "exito" => false,
        "mensaje" => "Error al obtener los periodos",
        "error" => $conexion->error
    ]);
    exit;
}

$periodos = [];
while ($row = $res->fetch_assoc()) {
    $row["cupos_libres"] = intval($row["cupos"]) - intval($row["cupos_ocupados"]);
    $periodos[] = [
        "id_periodo_curso" => $row["id_periodo_curso"],
        "titulo" => $row["titulo"],
        "cupos_libres" => $row["cupos_libres"],
        "fecha_inicio" => $row["fecha_inicio"],
        "fecha_fin" => $row["fecha_fin"]
    ];
}

echo json_encode([
    "exito" => true,
    "periodos" => $periodos
]);

$conexion->close();
?>
