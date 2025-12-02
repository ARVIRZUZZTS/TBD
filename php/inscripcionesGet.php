<?php
header("Content-Type: application/json");
include 'conexion.php';

$id_estudiante = $_GET['id_estudiante'] ?? '';

if (empty($id_estudiante)) {
    echo json_encode(['exito' => false, 'mensaje' => 'ID de estudiante no proporcionado']);
    exit;
}

try {
    $sql_grado = "SELECT grado FROM usuario WHERE id_user = ?";
    $stmt_grado = $conexion->prepare($sql_grado);
    $stmt_grado->bind_param("i", $id_estudiante);
    $stmt_grado->execute();
    $result_grado = $stmt_grado->get_result();

    if ($result_grado->num_rows === 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'Estudiante no encontrado']);
        exit;
    }

    $estudiante = $result_grado->fetch_assoc();
    $grado_estudiante = intval($estudiante['grado']);

    // CONSULTA ADAPTADA para la estructura actual de recompensa_canjeada
    $sql_descuentos = "
        SELECT d.id_descuento, d.id_periodo_curso, d.porcentaje_descuento
        FROM recompensa_canjeada rc
        INNER JOIN descuento d ON rc.recompensa = d.id_descuento  
        WHERE rc.id_estudiante = ?
        AND d.fecha_fin >= CURDATE()
        AND NOT EXISTS (
            SELECT 1 FROM inscripcion i 
            WHERE i.id_user = rc.id_estudiante 
            AND i.id_descuento = d.id_descuento
        )
    ";
    
    $stmt_descuentos = $conexion->prepare($sql_descuentos);
    $stmt_descuentos->bind_param("i", $id_estudiante);
    $stmt_descuentos->execute();
    $result_descuentos = $stmt_descuentos->get_result();

    $descuentosCanjeados = [];
    while ($row = $result_descuentos->fetch_assoc()) {
        $descuentosCanjeados[$row['id_periodo_curso']] = [
            'id_descuento' => $row['id_descuento'],
            'porcentaje' => $row['porcentaje_descuento']
        ];
    }

    // Consulta de cursos disponibles (mantener igual)
    $sql = "
        SELECT 
            pc.id_periodo_curso,
            c.titulo as nombre_curso,
            c.duracion,
            c.modalidad,
            u.nombre as nombre_profesor,
            u.apellido as apellido_profesor,
            pc.fecha_inicio,
            pc.fecha_fin,
            pc.cupos,
            pc.cupos_ocupados,
            pc.costo,
            g.nombre_grado,
            cat.nombre_categoria
        FROM periodo_curso pc
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        INNER JOIN usuario u ON pc.id_maestro = u.id_user
        INNER JOIN grado g ON c.id_grado = g.id_grado
        INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
        WHERE c.id_grado = ? 
        AND pc.estado_periodo = 'Inscripciones'
        AND pc.cupos_ocupados < pc.cupos
        AND NOT EXISTS (
            SELECT 1 FROM curso_estudiante ce 
            WHERE ce.id_estudiante = ? 
            AND ce.id_periodo_curso = pc.id_periodo_curso
        )
        ORDER BY pc.fecha_inicio
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ii", $grado_estudiante, $id_estudiante);
    $stmt->execute();
    $result = $stmt->get_result();

    $cursos = [];
    while ($row = $result->fetch_assoc()) {
        // Verificar si hay descuento para este curso
        $descuentoInfo = $descuentosCanjeados[$row['id_periodo_curso']] ?? null;
        $descuentoAplicado = $descuentoInfo ? $descuentoInfo['porcentaje'] : null;
        $idDescuento = $descuentoInfo ? $descuentoInfo['id_descuento'] : null;
        $precioFinal = $row['costo'];
        
        if ($descuentoAplicado) {
            $precioFinal = $row['costo'] * (1 - $descuentoAplicado / 100);
        }
        
        $cursos[] = [
            'id_periodo_curso' => $row['id_periodo_curso'],
            'nombre_curso' => $row['nombre_curso'],
            'duracion' => $row['duracion'],
            'modalidad' => $row['modalidad'],
            'nombre_profesor' => $row['nombre_profesor'],
            'apellido_profesor' => $row['apellido_profesor'],
            'fecha_inicio' => $row['fecha_inicio'],
            'fecha_fin' => $row['fecha_fin'],
            'cupos' => $row['cupos'],
            'cupos_ocupados' => $row['cupos_ocupados'],
            'costo' => $row['costo'],
            'nombre_grado' => $row['nombre_grado'],
            'nombre_categoria' => $row['nombre_categoria'],
            'descuento_aplicado' => $descuentoAplicado,
            'id_descuento' => $idDescuento,
            'precio_final' => $precioFinal
        ];
    }

    echo json_encode([
        'exito' => true,
        'grado_estudiante' => $grado_estudiante,
        'cursos' => $cursos
    ]);

} catch (Exception $e) {
    echo json_encode([
        'exito' => false, 
        'mensaje' => 'Error en el servidor: ' . $e->getMessage()
    ]);
}

// Cerrar conexiones...
if (isset($stmt_grado)) $stmt_grado->close();
if (isset($stmt_descuentos)) $stmt_descuentos->close();
if (isset($stmt)) $stmt->close();
if (isset($conexion)) $conexion->close();
?>