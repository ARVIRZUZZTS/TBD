<?php
header("Content-Type: application/json");
include 'conexion.php';

$sql = "
    SELECT c.id_curso_estudiante, c.id_estudiante, c.id_periodo_curso, c.estado,
            c.nota, c.asistencias, c.deskPoints, c.rankingPoints
    FROM curso_estudiante c
    WHERE c.id_estudiante = ?
    ";
?>