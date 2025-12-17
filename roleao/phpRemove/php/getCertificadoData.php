<?php
include "conexion.php";
header("Content-Type: application/json");

$id_estudiante = $_GET["id_estudiante"];
$id_periodo = $_GET["id_periodo_curso"];

$sql = "
    SELECT
        ce.nota,
        ce.id_estudiante,
        u.nombre AS est_nombre,
        u.apellido AS est_apellido,

        pc.id_maestro,
        um.nombre AS mae_nombre,
        um.apellido AS mae_apellido,

        c.titulo
    FROM CURSO_ESTUDIANTE ce
    INNER JOIN USUARIO u ON ce.id_estudiante = u.id_user
    INNER JOIN PERIODO_CURSO pc ON ce.id_periodo_curso = pc.id_periodo_curso
    INNER JOIN USUARIO um ON pc.id_maestro = um.id_user
    INNER JOIN CURSO c ON pc.id_curso = c.id_curso
    WHERE ce.id_estudiante = $id_estudiante
    AND ce.id_periodo_curso = $id_periodo
";

$res = $conexion->query($sql);

if ($res && $res->num_rows > 0) {
    echo json_encode(['success' => true, 'data' => $res->fetch_assoc()]);
} else {
    echo json_encode(['success' => false, 'message' => 'No se encontró información']);
}

$conexion->close();
?>
