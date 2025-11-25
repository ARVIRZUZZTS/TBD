<?php
// inscribirCurso.php - VERSIÓN CORREGIDA
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_periodo_curso = $_POST['id_periodo_curso'] ?? '';

if (empty($id_estudiante) || empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Iniciar transacción
$conexion->begin_transaction();

try {
    // 1. Verificar que el estudiante existe
    $sql_verificar_estudiante = "SELECT id_user FROM usuario WHERE id_user = ? ";
    $stmt_verificar_estudiante = $conexion->prepare($sql_verificar_estudiante);
    $stmt_verificar_estudiante->bind_param("i", $id_estudiante);
    $stmt_verificar_estudiante->execute();
    $result_verificar_estudiante = $stmt_verificar_estudiante->get_result();

    if ($result_verificar_estudiante->num_rows === 0) {
        throw new Exception('Estudiante no encontrado');
    }

    // 2. Verificar que el curso existe y tiene cupos
    $sql_verificar_curso = "
        SELECT cupos, cupos_ocupados, costo, estado_periodo
        FROM periodo_curso 
        WHERE id_periodo_curso = ? 
        AND estado_periodo = 'Inscripciones'
        AND cupos_ocupados < cupos
        FOR UPDATE
    ";
    $stmt_verificar_curso = $conexion->prepare($sql_verificar_curso);
    $stmt_verificar_curso->bind_param("i", $id_periodo_curso);
    $stmt_verificar_curso->execute();
    $result_verificar_curso = $stmt_verificar_curso->get_result();

    if ($result_verificar_curso->num_rows === 0) {
        // Verificar específicamente qué falló
        $sql_verificar_estado = "SELECT cupos, cupos_ocupados, estado_periodo FROM periodo_curso WHERE id_periodo_curso = ?";
        $stmt_verificar_estado = $conexion->prepare($sql_verificar_estado);
        $stmt_verificar_estado->bind_param("i", $id_periodo_curso);
        $stmt_verificar_estado->execute();
        $result_verificar_estado = $stmt_verificar_estado->get_result();
        
        if ($result_verificar_estado->num_rows === 0) {
            throw new Exception('Curso no encontrado');
        }
        
        $curso_estado = $result_verificar_estado->fetch_assoc();
        if ($curso_estado['estado_periodo'] !== 'Inscripciones') {
            throw new Exception('El curso no está en periodo de inscripciones. Estado actual: ' . $curso_estado['estado_periodo']);
        }
        if ($curso_estado['cupos_ocupados'] >= $curso_estado['cupos']) {
            throw new Exception('No hay cupos disponibles');
        }
        
        throw new Exception('Curso no disponible para inscripción');
    }

    $curso = $result_verificar_curso->fetch_assoc();

    // 3. Verificar que no está ya inscrito
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

    // 4. Insertar en la tabla INSCRIPCION
    $id_tipo_pago = 1; // Pago simulado
    $id_descuento = NULL;
    
    $sql_inscripcion = "
        INSERT INTO inscripcion (id_tipo_pago, id_user, id_periodo_curso, id_descuento, fecha_inscripcion)
        VALUES (?, ?, ?, ?, NOW())
    ";
    $stmt_inscripcion = $conexion->prepare($sql_inscripcion);
    $stmt_inscripcion->bind_param("iiii", $id_tipo_pago, $id_estudiante, $id_periodo_curso, $id_descuento);
    
    if (!$stmt_inscripcion->execute()) {
        throw new Exception('Error al guardar en inscripcion: ' . $stmt_inscripcion->error);
    }

    $id_inscripcion = $conexion->insert_id;

    // 5. Insertar en CURSO_ESTUDIANTE
    $sql_curso_estudiante = "
        INSERT INTO curso_estudiante (id_estudiante, id_periodo_curso, estado, nota, asistencia, deskPoints, rankingPoints)
        VALUES (?, ?, 'Inscrito', 0, 0, 0, 0)
    ";
    $stmt_curso_estudiante = $conexion->prepare($sql_curso_estudiante);
    $stmt_curso_estudiante->bind_param("ii", $id_estudiante, $id_periodo_curso);
    
    if (!$stmt_curso_estudiante->execute()) {
        throw new Exception('Error al guardar en curso_estudiante: ' . $stmt_curso_estudiante->error);
    }

    // 6. Actualizar cupos ocupados
    $sql_actualizar_cupos = "
        UPDATE periodo_curso 
        SET cupos_ocupados = cupos_ocupados + 1 
        WHERE id_periodo_curso = ?
    ";
    $stmt_cupos = $conexion->prepare($sql_actualizar_cupos);
    $stmt_cupos->bind_param("i", $id_periodo_curso);
    
    if (!$stmt_cupos->execute()) {
        throw new Exception('Error al actualizar cupos: ' . $stmt_cupos->error);
    }

    // Confirmar transacción
    $conexion->commit();
    
    echo json_encode([
        'exito' => true, 
        'mensaje' => 'Inscripción exitosa',
        'id_inscripcion' => $id_inscripcion
    ]);

} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conexion->rollback();
    echo json_encode(['exito' => false, 'mensaje' => $e->getMessage()]);
}

// Cerrar conexiones
if (isset($stmt_verificar_estudiante)) $stmt_verificar_estudiante->close();
if (isset($stmt_verificar_curso)) $stmt_verificar_curso->close();
if (isset($stmt_verificar_estado)) $stmt_verificar_estado->close();
if (isset($stmt_verificar_inscripcion)) $stmt_verificar_inscripcion->close();
if (isset($stmt_inscripcion)) $stmt_inscripcion->close();
if (isset($stmt_curso_estudiante)) $stmt_curso_estudiante->close();
if (isset($stmt_cupos)) $stmt_cupos->close();
$conexion->close();
?>