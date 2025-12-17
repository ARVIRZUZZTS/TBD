<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_maestro = $_GET['id_maestro'] ?? '';

if (empty($id_maestro)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de maestro no proporcionado']);
    exit;
}

try {
    // Obtener todas las entregas de los cursos del maestro
    $sql = "SELECT 
                e.id_entrega,
                e.id_user,
                u.nombre,
                u.apellido,
                e.id_publicacion,
                -- nuevo: tipo y titulo de la publicacion (tarea/evaluacion)
                CASE 
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'TA-' THEN 'TA'
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'EV-' THEN 'EV'
                    ELSE NULL
                END AS tipo_publicacion,
                CASE
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'TA-' THEN (
                        SELECT t.titulo FROM tarea t WHERE t.id_tarea = CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) LIMIT 1
                    )
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'EV-' THEN (
                        SELECT ev.titulo FROM evaluacion ev WHERE ev.id_evaluacion = CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) LIMIT 1
                    )
                    ELSE NULL
                END AS titulo_publicacion,
                -- nuevo: fecha de emisión de la publicación (tarea/evaluación) para ordenar por fecha de emisión
                CASE
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'TA-' THEN (
                        SELECT t.fecha_emision FROM tarea t WHERE t.id_tarea = CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) LIMIT 1
                    )
                    WHEN SUBSTRING(e.id_publicacion,1,3) = 'EV-' THEN (
                        SELECT ev.fecha_emision FROM evaluacion ev WHERE ev.id_evaluacion = CAST(SUBSTRING(e.id_publicacion,4) AS UNSIGNED) LIMIT 1
                    )
                    ELSE NULL
                END AS fecha_publicacion,
                e.nota,
                e.fecha_entrega,
                e.hora_entrega,
                pc.id_periodo_curso,
                c.titulo as nombre_curso
            FROM entregas e
            INNER JOIN usuario u ON e.id_user = u.id_user
            INNER JOIN periodo_curso pc ON 
                (
                    (SUBSTRING(e.id_publicacion, 1, 3) = 'TA-' AND 
                     CAST(SUBSTRING(e.id_publicacion, 4) AS UNSIGNED) IN (
                        SELECT id_tarea FROM tarea WHERE id_modulo IN (
                            SELECT id_modulo FROM modulo WHERE id_periodo_curso = pc.id_periodo_curso
                        )
                     ))
                    OR
                    (SUBSTRING(e.id_publicacion, 1, 3) = 'EV-' AND 
                     CAST(SUBSTRING(e.id_publicacion, 4) AS UNSIGNED) IN (
                        SELECT id_evaluacion FROM evaluacion WHERE id_modulo IN (
                            SELECT id_modulo FROM modulo WHERE id_periodo_curso = pc.id_periodo_curso
                        )
                     ))
                )
            INNER JOIN curso c ON pc.id_curso = c.id_curso
            WHERE pc.id_maestro = ?
            -- nuevo: ordenar por fecha de emisión de la publicación (las evaluaciones más viejas primero)
            ORDER BY pc.id_periodo_curso DESC,
                     fecha_publicacion ASC,
                     e.fecha_entrega DESC";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_maestro);
    $stmt->execute();
    $result = $stmt->get_result();

    $entregas = [];
    while ($row = $result->fetch_assoc()) {
        // Convertir nota a número (float)
        $row['nota'] = $row['nota'] ? (float)$row['nota'] : null;
        $entregas[] = $row;
    }

    echo json_encode([
        'exito' => true,
        'entregas' => $entregas,
        'total' => count($entregas)
    ]);

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>
