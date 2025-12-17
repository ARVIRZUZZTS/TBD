<?php
header("Content-Type: application/json");
include 'conexion.php';
include 'badge_helper.php';

$id_estudiante = $_POST['id_estudiante'] ?? '';
$id_periodo_curso = $_POST['id_periodo_curso'] ?? '';
$id_descuento = $_POST['id_descuento'] ?? null;

if (empty($id_estudiante) || empty($id_periodo_curso)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Datos incompletos']);
    exit;
}

// Iniciar transacción
$conexion->begin_transaction();

// Log: record intent to inscribir (append-only)
$logLine = sprintf("%s | START inscripcion: estudiante=%s periodo=%s via=%s\n", date('Y-m-d H:i:s'), $id_estudiante, $id_periodo_curso, $_SERVER['REMOTE_ADDR'] ?? 'cli');
@file_put_contents(__DIR__ . '/../logs/inscribir.log', $logLine, FILE_APPEND);

try {
    // 1. Verificar que el estudiante existe (mantener igual)
    $sql_verificar_estudiante = "SELECT id_user FROM usuario WHERE id_user = ?";
    $stmt_verificar_estudiante = $conexion->prepare($sql_verificar_estudiante);
    $stmt_verificar_estudiante->bind_param("i", $id_estudiante);
    $stmt_verificar_estudiante->execute();
    $result_verificar_estudiante = $stmt_verificar_estudiante->get_result();

    if ($result_verificar_estudiante->num_rows === 0) {
        throw new Exception('Estudiante no encontrado');
    }

    // 2. Verificar descuento si se proporcionó (ADAPTADO)
    if ($id_descuento) {
        $sql_verificar_descuento = "
            SELECT 1 FROM recompensa_canjeada 
            WHERE id_estudiante = ? 
            AND recompensa = ? 
            AND NOT EXISTS (
                SELECT 1 FROM inscripcion i 
                WHERE i.id_user = recompensa_canjeada.id_estudiante 
                AND i.id_descuento = recompensa_canjeada.recompensa
            )
        ";
        $stmt_verificar_descuento = $conexion->prepare($sql_verificar_descuento);
        $stmt_verificar_descuento->bind_param("ii", $id_estudiante, $id_descuento);
        $stmt_verificar_descuento->execute();
        $result_verificar_descuento = $stmt_verificar_descuento->get_result();
        
        if ($result_verificar_descuento->num_rows === 0) {
            throw new Exception('Descuento no válido o ya utilizado');
        }
    }

    // 3. Verificar que el curso existe y tiene cupos (mantener igual)
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
        // Verificar específicamente qué falló (mantener igual)
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

    // 4. Verificar que no está ya inscrito (mantener igual)
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

    // 5. Insertar en la tabla INSCRIPCION con el descuento
    $id_tipo_pago = 1; // Pago simulado
    
    $sql_inscripcion = "
        INSERT INTO inscripcion (id_tipo_pago, id_user, id_periodo_curso, id_descuento, fecha_inscripcion)
        VALUES (?, ?, ?, ?, NOW())
    ";
    $stmt_inscripcion = $conexion->prepare($sql_inscripcion);
    
    // Si no hay descuento, usar NULL
    if ($id_descuento) {
        $stmt_inscripcion->bind_param("iiii", $id_tipo_pago, $id_estudiante, $id_periodo_curso, $id_descuento);
    } else {
        $stmt_inscripcion->bind_param("iiii", $id_tipo_pago, $id_estudiante, $id_periodo_curso, $id_descuento);
    }
    
    if (!$stmt_inscripcion->execute()) {
        throw new Exception('Error al guardar en inscripcion: ' . $stmt_inscripcion->error);
    }

    $id_inscripcion = $conexion->insert_id;

    // 6. Insertar en CURSO_ESTUDIANTE (mantener igual)
    $sql_curso_estudiante = "
        INSERT INTO curso_estudiante (id_estudiante, id_periodo_curso, estado, nota, asistencia, deskPoints, rankingPoints)
        VALUES (?, ?, 'Inscrito', 0, 0, 0, 0)
    ";
    $stmt_curso_estudiante = $conexion->prepare($sql_curso_estudiante);
    $stmt_curso_estudiante->bind_param("ii", $id_estudiante, $id_periodo_curso);
    
    if (!$stmt_curso_estudiante->execute()) {
        throw new Exception('Error al guardar en curso_estudiante: ' . $stmt_curso_estudiante->error);
    }

    // 7. Actualizar cupos ocupados (mantener igual)
    $sql_actualizar_cupos = "
        UPDATE periodo_curso 
        SET cupos_ocupados = cupos_ocupados + 1 
        WHERE id_periodo_curso = ?
    ";
    $stmt_cupos = $conexion->prepare($sql_actualizar_cupos);
    $stmt_cupos->bind_param("i", $id_periodo_curso);
    
    if (!$stmt_cupos->execute()) {
        // Log failure
        @file_put_contents(__DIR__ . '/../logs/inscribir.log', date('Y-m-d H:i:s') . " | ERROR updating cupos for periodo {$id_periodo_curso}: " . $stmt_cupos->error . "\n", FILE_APPEND);
        throw new Exception('Error al actualizar cupos: ' . $stmt_cupos->error);
    }

    // --- LÓGICA DE INSIGNIAS ---
    // Verificar si es el primer curso del estudiante
    $sqlCountInscripciones = "SELECT COUNT(*) as total FROM inscripcion WHERE id_user = ?";
    $stmtCount = $conexion->prepare($sqlCountInscripciones);
    $stmtCount->bind_param("i", $id_estudiante);
    $stmtCount->execute();
    $resCount = $stmtCount->get_result();
    $rowCount = $resCount->fetch_assoc();
    $totalInscripciones = $rowCount['total'];
    $stmtCount->close();

    // Si es la primera inscripción (o la acabamos de hacer y es 1)
    // Nota: Acabamos de insertar, así que si era la primera, ahora COUNT es 1.
    if ($totalInscripciones == 1) {
        // Otorgar insignia ID 1: "Primer Curso"
        $resultadoInsignia = otorgarInsignia($conexion, $id_estudiante, 1);
        
        if ($resultadoInsignia['exito']) {
             @file_put_contents(__DIR__ . '/../logs/inscribir.log', date('Y-m-d H:i:s') . " | BADGE AWARDED: estudiante={$id_estudiante} badge=1\n", FILE_APPEND);
        }
    }
    // ---------------------------

// Log success and new cupo value (try to read current value)
try {
    $s = $conexion->prepare('SELECT cupos_ocupados FROM periodo_curso WHERE id_periodo_curso = ?');
    $s->bind_param('i', $id_periodo_curso);
    $s->execute();
    $r = $s->get_result();
    $row = $r->fetch_assoc();
    $current = $row['cupos_ocupados'] ?? 'unknown';
    @file_put_contents(__DIR__ . '/../logs/inscribir.log', date('Y-m-d H:i:s') . " | OK inscripcion: estudiante={$id_estudiante} periodo={$id_periodo_curso} cupos_ocupados={$current}\n", FILE_APPEND);
    $s->close();
} catch (Exception $ex) {
    @file_put_contents(__DIR__ . '/../logs/inscribir.log', date('Y-m-d H:i:s') . " | OK inscripcion but failed read cupos: " . $ex->getMessage() . "\n", FILE_APPEND);
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

// Cerrar conexiones...
if (isset($stmt_verificar_estudiante)) $stmt_verificar_estudiante->close();
if (isset($stmt_verificar_curso)) $stmt_verificar_curso->close();
if (isset($stmt_verificar_estado)) $stmt_verificar_estado->close();
if (isset($stmt_verificar_inscripcion)) $stmt_verificar_inscripcion->close();
if (isset($stmt_inscripcion)) $stmt_inscripcion->close();
if (isset($stmt_curso_estudiante)) $stmt_curso_estudiante->close();
if (isset($stmt_cupos)) $stmt_cupos->close();
?>