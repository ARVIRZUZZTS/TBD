<?php
header("Content-Type: application/json");
include 'conexion.php';

$orden = $_GET["orden"] ?? "nombre";

switch ($orden) {
    case "curso":
        $orderBy = "cursos_completados DESC";
        break;
    case "ranking":
        $orderBy = "p.rankingPoints DESC";
        break;
    case "promedio":
        $orderBy = "promedio DESC";
        break;
    default:
        $orderBy = "u.nombre ASC";
        break;
}

$sql = "
    SELECT 
        u.id_user,
        u.nombre,
        u.apellido,
        u.username,
        u.edad,
        COALESCE(p.saldo_actual, 0) AS saldo_actual,
        COALESCE(p.rankingPoints, 0) AS rankingPoints,
        COALESCE(AVG(c.nota), 0) AS promedio,
        COUNT(DISTINCT CASE WHEN c.estado = 'completado' THEN c.id_curso_estudiante END) AS cursos_completados,
        'Activo' AS estado
    FROM USUARIO u
    INNER JOIN ROL_USUARIO ru ON u.id_user = ru.id_user
    LEFT JOIN PUNTOS p ON u.id_user = p.id_user
    LEFT JOIN CURSO_ESTUDIANTE c ON u.id_user = c.id_estudiante
    WHERE ru.id_rol = 3
    GROUP BY u.id_user
    ORDER BY $orderBy
";

$res = $conexion->query($sql);

if (!$res) {
    echo json_encode(["exito" => false, "mensaje" => "Error en la consulta", "error" => $conexion->error]);
    exit;
}

$estudiantes = [];
while ($row = $res->fetch_assoc()) {
    $estudiantes[] = $row;
}

echo json_encode([
    "exito" => true,
    "estudiantes" => $estudiantes
]);

$conexion->close();
?>
