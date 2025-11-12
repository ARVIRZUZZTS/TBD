<?php
// inscribirCurso.php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_periodo_curso = $_POST['id_periodo_curso'] ?? '';

if (empty($id_estudiante) || empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Iniciar transacción para asegurar que se guarde en ambas tablas
$conexion->begin_transaction();

try {
    // Verificar que el curso existe y tiene cupos
    $sql_verificar = "
        SELECT cupos, cupos_ocupados 
        FROM periodo_curso 
        WHERE id_periodo_curso = ? 
        AND estado_periodo = 'Inscripciones'
        AND cupos_ocupados < cupos
    ";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    $stmt_verificar->bind_param("i", $id_periodo_curso);
    $stmt_verificar->execute();
    $result_verificar = $stmt_verificar->get_result();

    if ($result_verificar->num_rows === 0) {
        throw new Exception('Curso no disponible o sin cupos');
    }

    // Verificar que no está ya inscrito
    $sql_verificar_inscripcion = "
        SELECT 1 FROM curso_estudiante 
        WHERE id_estudiante = ? 
        AND id_periodo_curso = ?
    ";
    $stmt_verificar_inscripcion = $conexion->prepare($sql_verificar_inscripcion);
    $stmt_verificar_inscripcion->bind_param("ii", $id_estudiante, $id_periodo_curso);
    $stmt_verificar_inscripcion->execute();
    $result_verificar_inscripcion = $stmt_verificar_inscripcion->get_result();

    if ($result_verificar_inscripcion->num_rows > 0) {
        throw new Exception('Ya estás inscrito en este curso');
    }

    // 1. Insertar en la tabla INSCRIPCION (pago falso)
    $id_tipo_pago = 1; // Pago simulado
    $id_descuento = NULL; // Por ahora null, luego se puede agregar descuentos
    
    $sql_inscripcion = "
        INSERT INTO inscripcion (id_tipo_pago, id_user, id_periodo_curso, id_descuento, fecha_inscripcion)
        VALUES (?, ?, ?, ?, NOW())
    ";
    $stmt_inscripcion = $conexion->prepare($sql_inscripcion);
    $stmt_inscripcion->bind_param("iiii", $id_tipo_pago, $id_estudiante, $id_periodo_curso, $id_descuento);
    
    if (!$stmt_inscripcion->execute()) {
        throw new Exception('Error al guardar en inscripcion');
    }

    // 2. Insertar en CURSO_ESTUDIANTE
    $sql_curso_estudiante = "
        INSERT INTO curso_estudiante (id_estudiante, id_periodo_curso, estado, nota, asistencia, deskPoints, rankingPoints)
        VALUES (?, ?, 'Inscrito', 0, 0, 0, 0)
    ";
    $stmt_curso_estudiante = $conexion->prepare($sql_curso_estudiante);
    $stmt_curso_estudiante->bind_param("ii", $id_estudiante, $id_periodo_curso);
    
    if (!$stmt_curso_estudiante->execute()) {
        throw new Exception('Error al guardar en curso_estudiante');
    }

    // 3. Actualizar cupos ocupados
    $sql_actualizar_cupos = "
        UPDATE periodo_curso 
        SET cupos_ocupados = cupos_ocupados + 1 
        WHERE id_periodo_curso = ?
    ";
    $stmt_cupos = $conexion->prepare($sql_actualizar_cupos);
    $stmt_cupos->bind_param("i", $id_periodo_curso);
    
    if (!$stmt_cupos->execute()) {
        throw new Exception('Error al actualizar cupos');
    }

    // Confirmar transacción
    $conexion->commit();
    
    echo json_encode([
        'exito' => true, 
        'mensaje' => 'Inscripción exitosa. Pago procesado correctamente.',
        'id_inscripcion' => $conexion->insert_id
    ]);

} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conexion->rollback();
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

// Cerrar conexiones
if (isset($stmt_verificar)) $stmt_verificar->close();
if (isset($stmt_verificar_inscripcion)) $stmt_verificar_inscripcion->close();
if (isset($stmt_inscripcion)) $stmt_inscripcion->close();
if (isset($stmt_curso_estudiante)) $stmt_curso_estudiante->close();
if (isset($stmt_cupos)) $stmt_cupos->close();
$conexion->close();
?>