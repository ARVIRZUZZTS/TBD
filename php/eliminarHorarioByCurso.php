<?php
// eliminarHorarioByCUrso.php
// Elimina por completo el horario (todas las entradas) asociado a un id_periodo_curso

header('Content-Type: application/json');
require_once 'conexion.php';

$input = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // aceptar JSON o form
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    if ($json && isset($json['id_periodo_curso'])) {
        $input = intval($json['id_periodo_curso']);
    } elseif (isset($_POST['id_periodo_curso'])) {
        $input = intval($_POST['id_periodo_curso']);
    }
}

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'id_periodo_curso no proporcionado']);
    exit;
}

$id_periodo = $input;

try {
    $conexion->begin_transaction();

    // Obtener todos los id_dia_clase vinculados a este periodo
    $stmt = $conexion->prepare("SELECT id_dia_clase FROM horario WHERE id_periodo_clase = ?");
    $stmt->bind_param('i', $id_periodo);
    $stmt->execute();
    $res = $stmt->get_result();

    $ids_dia = [];
    while ($row = $res->fetch_assoc()) {
        $ids_dia[] = $row['id_dia_clase'];
    }

    // Eliminar filas en horario
    $stmtDel = $conexion->prepare("DELETE FROM horario WHERE id_periodo_clase = ?");
    $stmtDel->bind_param('i', $id_periodo);
    $stmtDel->execute();

    // Si hay dias asociados, eliminarlos también
    if (!empty($ids_dia)) {
        $placeholders = implode(',', array_fill(0, count($ids_dia), '?'));
        $types = str_repeat('i', count($ids_dia));
        $query = "DELETE FROM dia_horario WHERE id_dia_clase IN ($placeholders)";
        $stmt2 = $conexion->prepare($query);

        // bind_param requires references
        $bind_names[] = $types;
        for ($i = 0; $i < count($ids_dia); $i++) {
            $bind_name = 'b' . $i;
            $$bind_name = $ids_dia[$i];
            $bind_names[] = &$$bind_name;
        }
        call_user_func_array([$stmt2, 'bind_param'], $bind_names);
        $stmt2->execute();
    }

    $conexion->commit();

    echo json_encode(['success' => true, 'message' => 'Horario eliminado correctamente']);

} catch (Exception $e) {
    $conexion->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al eliminar horario: ' . $e->getMessage()]);
}

$conexion->close();
?>