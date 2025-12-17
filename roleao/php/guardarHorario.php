<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Leer los datos JSON del request
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Datos JSON inválidos']);
    exit;
}

// Validar datos requeridos
if (!isset($input['courseId']) || !isset($input['modalidad']) || !isset($input['horarios'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

// Verificar si la conexión existe y funciona
if (!isset($conexion) || !$conexion) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']);
    exit;
}

$courseId = $input['courseId'];
$modalidad = $input['modalidad'];
$aula = isset($input['aula']) ? $input['aula'] : null;
$horarios = $input['horarios'];

try {
    // Iniciar transacción
    $conexion->begin_transaction();

    // 1. Obtener o crear el aula
    $id_aula = null;
    if ($modalidad === 'presencial' && $aula) {
        // Buscar si el aula ya existe
        $stmt = $conexion->prepare("SELECT id_aula FROM aula WHERE capacidad IS NOT NULL LIMIT 1");
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $id_aula = $row['id_aula'];
        } else {
            // Crear un aula por defecto (capacidad 30)
            $stmt = $conexion->prepare("INSERT INTO aula (capacidad) VALUES (30)");
            $stmt->execute();
            $id_aula = $conexion->insert_id;
        }
        $stmt->close();
    }

    // 2. Insertar cada día-horario
    $ids_dia_clase = [];
    
    foreach ($horarios as $horario) {
        $dia = $horario['dia'];
        $hora_inicio = $horario['horaInicio'];
        $hora_fin = $horario['horaFin'];
        
        // Convertir número de día a nombre
        $nombre_dia = convertirNumeroADia($dia);
        
        // Insertar en dia_horario
        $stmt = $conexion->prepare("INSERT INTO dia_horario (dia, hora_inicio, hora_fin, id_aula) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $nombre_dia, $hora_inicio, $hora_fin, $id_aula);
        $stmt->execute();
        
        $ids_dia_clase[] = $conexion->insert_id;
        $stmt->close();
    }

    // 3. Insertar en la tabla horario (relación periodo_curso - dia_horario)
    foreach ($ids_dia_clase as $id_dia_clase) {
        $stmt = $conexion->prepare("INSERT INTO horario (id_periodo_clase, id_dia_clase) VALUES (?, ?)");
        $stmt->bind_param("ii", $courseId, $id_dia_clase);
        $stmt->execute();
        $stmt->close();
    }

    // 4. Actualizar la modalidad en la tabla curso (si es necesario)
    // Primero necesitamos obtener el id_curso desde periodo_curso
    $stmt = $conexion->prepare("SELECT id_curso FROM periodo_curso WHERE id_periodo_curso = ?");
    $stmt->bind_param("i", $courseId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $id_curso = $row['id_curso'];
        
        // Actualizar modalidad en curso
        $modalidad_db = $modalidad === 'presencial' ? 'P' : 'V';
        $stmt_update = $conexion->prepare("UPDATE curso SET modalidad = ? WHERE id_curso = ?");
        $stmt_update->bind_param("si", $modalidad_db, $id_curso);
        $stmt_update->execute();
        $stmt_update->close();
    }
    $stmt->close();

    // Confirmar transacción
    $conexion->commit();

    echo json_encode([
        'success' => true, 
        'message' => 'Horario guardado exitosamente',
        'dias_guardados' => count($horarios),
        'modalidad' => $modalidad
    ]);

} catch (Exception $e) {
    // Revertir transacción en caso de error
    if (isset($conexion)) {
        $conexion->rollback();
    }
    
    echo json_encode([
        'success' => false, 
        'message' => 'Error al guardar el horario: ' . $e->getMessage()
    ]);
}

$conexion->close();

// Función para convertir número de día a nombre
function convertirNumeroADia($numero) {
    $dias = [
        0 => 'Domingo',
        1 => 'Lunes', 
        2 => 'Martes',
        3 => 'Miércoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sábado'
    ];
    
    return isset($dias[$numero]) ? $dias[$numero] : 'Desconocido';
}
?>