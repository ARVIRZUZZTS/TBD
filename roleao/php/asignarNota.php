<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_entrega = $_POST['id_entrega'] ?? '';
$nota = $_POST['nota'] ?? '';
$id_maestro = $_POST['id_maestro'] ?? '';

if (empty($id_entrega) || empty($nota) || empty($id_maestro)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Validar que la nota sea numérica y esté entre 0 y 100
$nota = floatval($nota);
if ($nota < 0 || $nota > 100) {
    echo json_encode(['exito' => false, 'mensaje' => 'La nota debe estar entre 0 y 100']);
    exit;
}

try {
    // Verificar que el maestro sea dueño de este curso
    $sql_verify = "SELECT e.id_entrega FROM entregas e
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
                   WHERE e.id_entrega = ? AND pc.id_maestro = ?";
    
    $stmt_verify = $conexion->prepare($sql_verify);
    $stmt_verify->bind_param("ii", $id_entrega, $id_maestro);
    $stmt_verify->execute();
    $result_verify = $stmt_verify->get_result();

    if ($result_verify->num_rows === 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'No tienes permiso para calificar esta entrega']);
        exit;
    }

    // Actualizar la nota
    $sql_update = "UPDATE entregas SET nota = ? WHERE id_entrega = ?";
    $stmt_update = $conexion->prepare($sql_update);
    $stmt_update->bind_param("di", $nota, $id_entrega);
    
    if ($stmt_update->execute()) {
        echo json_encode([
            'exito' => true,
            'mensaje' => 'Nota asignada correctamente',
            'nota' => $nota
        ]);
    } else {
        throw new Exception('Error al guardar la nota: ' . $stmt_update->error);
    }

} catch (Exception $e) {
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

$conexion->close();
?>
