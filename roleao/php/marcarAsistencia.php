<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_periodo_curso = $_POST['id_periodo_curso'] ?? null;

if (!$id_estudiante || !$id_periodo_curso) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan parámetros: id_estudiante o id_periodo_curso"]);
    exit;
}

$id_estudiante = (int)$id_estudiante;
$id_periodo_curso = (int)$id_periodo_curso;

// Umbral de 2 horas (en segundos)
$threshold = 2 * 60 * 60;
$sessionKey = "last_asistencia_{$id_estudiante}_{$id_periodo_curso}";
$now = time();

// Verificar historial en sesión para evitar spam
if (isset($_SESSION[$sessionKey])) {
    $last = (int)$_SESSION[$sessionKey];
    $elapsed = $now - $last;
    if ($elapsed < $threshold) {
        $remaining = $threshold - $elapsed;
        echo json_encode([
            "exito" => false,
            "mensaje" => "Ya marcaste asistencia recientemente. Espera ' . gmdate('H:i:s', $remaining) . '",
            "segundos_restantes" => $remaining
        ]);
        exit;
    }
}

// Comprobar que el registro existe y su estado
$sql = "SELECT asistencia, estado FROM curso_estudiante WHERE id_periodo_curso = ? AND id_estudiante = ? LIMIT 1";
if ($stmt = $conexion->prepare($sql)) {
    $stmt->bind_param('ii', $id_periodo_curso, $id_estudiante);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $estado = $row['estado'];
        $asistencia_actual = (int)$row['asistencia'];

        if (strcmp($estado, 'En Clase') !== 0) {
            echo json_encode(["exito" => false, "mensaje" => "No se puede actualizar asistencia cuando el estado no es 'En Clase'."]);
            exit;
        }

        // Intentar actualizar (doble-check en la cláusula WHERE)
        $upd = "UPDATE curso_estudiante SET asistencia = asistencia + 1 WHERE id_periodo_curso = ? AND id_estudiante = ? AND estado = 'En Clase'";
        if ($ustmt = $conexion->prepare($upd)) {
            $ustmt->bind_param('ii', $id_periodo_curso, $id_estudiante);
            $ustmt->execute();

            if ($ustmt->affected_rows > 0) {
                // Obtener nuevo valor de asistencia
                $q = "SELECT asistencia FROM curso_estudiante WHERE id_periodo_curso = ? AND id_estudiante = ? LIMIT 1";
                if ($qstmt = $conexion->prepare($q)) {
                    $qstmt->bind_param('ii', $id_periodo_curso, $id_estudiante);
                    $qstmt->execute();
                    $res = $qstmt->get_result();
                    $newRow = $res->fetch_assoc();
                    $nueva_asistencia = (int)$newRow['asistencia'];

                    // Guardar timestamp en sesión para prevenir spam
                    $_SESSION[$sessionKey] = $now;

                    echo json_encode([
                        "exito" => true,
                        "mensaje" => "Asistencia registrada",
                        "asistencia" => $nueva_asistencia
                    ]);
                    exit;
                }
            } else {
                echo json_encode(["exito" => false, "mensaje" => "No se actualizó la asistencia (posible cambio de estado)."]);
                exit;
            }
        } else {
            echo json_encode(["exito" => false, "mensaje" => "Error preparando la actualización: " . $conexion->error]);
            exit;
        }

    } else {
        echo json_encode(["exito" => false, "mensaje" => "Registro de curso_estudiante no encontrado."]);
        exit;
    }
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error preparando la consulta: " . $conexion->error]);
    exit;
}

?>
