<?php
//nuevo
header('Content-Type: application/json');
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_tarea = isset($data['id_tarea']) ? (int)$data['id_tarea'] : 0;

if (!$id_tarea) {
    echo json_encode(['success' => false, 'message' => 'ID de tarea no proporcionado']);
    exit;
}

try {
    $conexion->begin_transaction();

    $id_publicacion = 'TA-' . $id_tarea;

    // Obtener archivos relacionados y borrarlos
    $sqlArch = "SELECT aa.id_archivo, aa.ruta_archivo FROM archivos_publicacion ap JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo WHERE ap.id_publicacion = ?";
    $stmtArch = $conexion->prepare($sqlArch);
    $stmtArch->bind_param('s', $id_publicacion);
    $stmtArch->execute();
    $resArch = $stmtArch->get_result();
    $archivoIds = [];
    while ($a = $resArch->fetch_assoc()) {
        $archivoIds[] = $a['id_archivo'];
        $ruta = __DIR__ . '/../' . $a['ruta_archivo'];
        if (file_exists($ruta)) @unlink($ruta);
    }
    $stmtArch->close();

    if (count($archivoIds) > 0) {
        $stmtDelRel = $conexion->prepare("DELETE FROM archivos_publicacion WHERE id_publicacion = ?");
        $stmtDelRel->bind_param('s', $id_publicacion);
        $stmtDelRel->execute();
        $stmtDelRel->close();

        $idsList = implode(',', array_map('intval', $archivoIds));
        $sqlDelFiles = "DELETE FROM archivos_adjuntos WHERE id_archivo IN ($idsList)";
        $conexion->query($sqlDelFiles);
    }
    // Eliminar entregas asociadas a esta tarea (id_publicacion = 'TA-<id>')
    $id_publicacion = 'TA-' . $id_tarea;
    $stmtDelEnt = $conexion->prepare("DELETE FROM entregas WHERE id_publicacion = ?");
    $stmtDelEnt->bind_param('s', $id_publicacion);
    $stmtDelEnt->execute();
    $stmtDelEnt->close();

    $stmtDel = $conexion->prepare("DELETE FROM tarea WHERE id_tarea = ?");
    $stmtDel->bind_param('i', $id_tarea);
    $stmtDel->execute();
    $affected = $stmtDel->affected_rows;
    $stmtDel->close();

    $conexion->commit();

    if ($affected > 0) {
        echo json_encode(['success' => true, 'message' => 'Tarea eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró la tarea especificada']);
    }
} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al eliminar tarea: ' . $e->getMessage()]);
}

$conexion->close();

?>
