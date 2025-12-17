<?php
//nuevo
header('Content-Type: application/json');
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_modulo = isset($data['id_modulo']) ? (int)$data['id_modulo'] : 0;

if (!$id_modulo) {
    echo json_encode(['success' => false, 'message' => 'ID de módulo no proporcionado']);
    exit;
}

try {
    $conexion->begin_transaction();

    // Eliminar archivos relacionados a temas (TE-), tareas (TA-) y evaluaciones (EV-)
    $prefixes = ['TE' => 'temas', 'TA' => 'tarea', 'EV' => 'evaluacion'];

    foreach ($prefixes as $pref => $table) {
        // Obtener ids de la entidad relacionada
        $sqlIds = "SELECT id_{$table} as id FROM {$table} WHERE id_modulo = ?";
        $stmtIds = $conexion->prepare($sqlIds);
        $stmtIds->bind_param('i', $id_modulo);
        $stmtIds->execute();
        $resIds = $stmtIds->get_result();
        $ids = [];
        while ($r = $resIds->fetch_assoc()) {
            $ids[] = $r['id'];
        }
        $stmtIds->close();

        foreach ($ids as $entityId) {
            $id_publicacion = $pref . '-' . $entityId;
            // obtener archivos relacionados
            $sqlArch = "SELECT aa.id_archivo, aa.ruta_archivo FROM archivos_publicacion ap JOIN archivos_adjuntos aa ON ap.id_archivo = aa.id_archivo WHERE ap.id_publicacion = ?";
            $stmtArch = $conexion->prepare($sqlArch);
            $stmtArch->bind_param('s', $id_publicacion);
            $stmtArch->execute();
            $resArch = $stmtArch->get_result();
            $archivoIds = [];
            while ($a = $resArch->fetch_assoc()) {
                $archivoIds[] = $a['id_archivo'];
                // intentar borrar archivo físico si existe
                $ruta = __DIR__ . '/../' . $a['ruta_archivo'];
                if (file_exists($ruta)) {
                    @unlink($ruta);
                }
            }
            $stmtArch->close();

            if (count($archivoIds) > 0) {
                // borrar entradas en archivos_publicacion
                $sqlDelRel = "DELETE FROM archivos_publicacion WHERE id_publicacion = ?";
                $stmtDelRel = $conexion->prepare($sqlDelRel);
                $stmtDelRel->bind_param('s', $id_publicacion);
                $stmtDelRel->execute();
                $stmtDelRel->close();

                // borrar archivos_adjuntos con lista segura de ids (ya vienen de la BD)
                $idsList = implode(',', array_map('intval', $archivoIds));
                $sqlDelFiles = "DELETE FROM archivos_adjuntos WHERE id_archivo IN ($idsList)";
                $conexion->query($sqlDelFiles);
            }

            // Además, eliminar entregas asociadas a esta publicación (TA-/EV-)
            $stmtDelEnt = $conexion->prepare("DELETE FROM entregas WHERE id_publicacion = ?");
            $stmtDelEnt->bind_param('s', $id_publicacion);
            $stmtDelEnt->execute();
            $stmtDelEnt->close();
        }
        }
    }

    // Borrar temas, tareas y evaluaciones del módulo
    $conexion->query("DELETE FROM temas WHERE id_modulo = " . intval($id_modulo));
    $conexion->query("DELETE FROM tarea WHERE id_modulo = " . intval($id_modulo));
    $conexion->query("DELETE FROM evaluacion WHERE id_modulo = " . intval($id_modulo));

    // Finalmente borrar el módulo
    $stmtDelModulo = $conexion->prepare("DELETE FROM modulo WHERE id_modulo = ?");
    $stmtDelModulo->bind_param('i', $id_modulo);
    $stmtDelModulo->execute();
    $affected = $stmtDelModulo->affected_rows;
    $stmtDelModulo->close();

    $conexion->commit();

    if ($affected > 0) {
        echo json_encode(['success' => true, 'message' => 'Módulo eliminado correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró el módulo especificado']);
    }
} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al eliminar módulo: ' . $e->getMessage()]);
}

$conexion->close();

?>
