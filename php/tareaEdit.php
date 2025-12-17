<?php
//nuevo
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';

// Espera form-data: id_tarea, titulo, descripcion, fecha_entrega, hora_entrega
$id_tarea = isset($_POST['id_tarea']) ? (int)$_POST['id_tarea'] : 0;
$titulo = isset($_POST['titulo']) ? trim($_POST['titulo']) : '';
$descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : null;
$fecha_entrega = isset($_POST['fecha_entrega']) ? trim($_POST['fecha_entrega']) : null;
$hora_entrega = isset($_POST['hora_entrega']) ? trim($_POST['hora_entrega']) : null;

if (!$id_tarea || !$titulo) {
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros']);
    exit;
}

// Obtener fecha/hora de emisión para validar que la entrega sea posterior si es necesario
$sqlSel = "SELECT fecha_emision, hora_emision FROM tarea WHERE id_tarea = ? LIMIT 1";
$fecha_emision = null; $hora_emision = null;
if ($s = $conexion->prepare($sqlSel)) {
    $s->bind_param('i', $id_tarea);
    $s->execute();
    $r = $s->get_result();
    if ($row = $r->fetch_assoc()) {
        $fecha_emision = $row['fecha_emision'];
        $hora_emision = $row['hora_emision'];
    }
    $s->close();
}

// Validación: si se envía fecha/hora entrega y existe fecha_emision/hora_emision, comprobar que entrega > emision
if ($fecha_entrega && $hora_entrega && $fecha_emision && $hora_emision) {
    $start = strtotime($fecha_emision . ' ' . $hora_emision);
    $end = strtotime($fecha_entrega . ' ' . $hora_entrega);
    if ($end <= $start) {
        echo json_encode(['success' => false, 'message' => 'La fecha/hora de entrega debe ser mayor a la de emisión']);
        exit;
    }
}

$sqlUpd = "UPDATE tarea SET titulo = ?, descripcion = ?, fecha_entrega = ?, hora_entrega = ? WHERE id_tarea = ?";
if ($u = $conexion->prepare($sqlUpd)) {
    $u->bind_param('ssssi', $titulo, $descripcion, $fecha_entrega, $hora_entrega, $id_tarea);
    if ($u->execute()) {
        echo json_encode(['success' => true, 'message' => 'Tarea actualizada']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error actualizando tarea: ' . $u->error]);
    }
    $u->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Error preparando actualización']);
}
exit;
?>