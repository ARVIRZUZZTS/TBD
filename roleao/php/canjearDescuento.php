<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'conexion.php';

$id_estudiante = $_POST['id_estudiante'] ?? null;
$id_descuento = $_POST['id_descuento'] ?? null;

if (!$id_estudiante || !$id_descuento) {
    echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
    exit;
}

// NO convertir a int - mantener como string
$id_estudiante = (int)$id_estudiante; // Este sí es int
// $id_descuento se mantiene como string

error_log("Canjear descuento - ID Estudiante: $id_estudiante, ID Descuento: $id_descuento");

$conexion->begin_transaction();

try {
    // 1. Verificar que el descuento existe y obtener datos
    $sql_descuento = "
        SELECT d.costo_canje, d.id_periodo_curso, pc.costo, c.titulo as nombre_curso
        FROM descuento d
        INNER JOIN periodo_curso pc ON d.id_periodo_curso = pc.id_periodo_curso  
        INNER JOIN curso c ON pc.id_curso = c.id_curso
        WHERE d.id_descuento = ? 
        AND d.fecha_fin >= CURDATE()
        AND pc.estado_periodo = 'Inscripciones'
    ";
    $stmt = $conexion->prepare($sql_descuento);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta descuento: " . $conexion->error);
    }
    
    // IMPORTANTE: Bind como string
    $stmt->bind_param("s", $id_descuento);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta descuento: " . $stmt->error);
    }
    
    $descuento = $stmt->get_result()->fetch_assoc();
    
    if (!$descuento) {
        throw new Exception("Descuento no disponible, expirado o el curso no está en inscripciones");
    }
    
    $costo_canje = (float)$descuento['costo_canje'];
    $id_periodo_curso = $descuento['id_periodo_curso'];
    $nombre_curso = $descuento['nombre_curso'];
    
    error_log("Descuento encontrado - Curso: $nombre_curso, Costo: $costo_canje, Periodo Curso: $id_periodo_curso");
    
    // 2. Verificar que el estudiante no ha canjeado este descuento antes
    $sql_verificar = "
        SELECT 1 FROM recompensa_canjeada 
        WHERE recompensa = ? 
        AND id_estudiante = ?
    ";
    $stmt = $conexion->prepare($sql_verificar);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta verificación: " . $conexion->error);
    }
    
    // Ambos como strings
    $stmt->bind_param("si", $id_descuento, $id_estudiante);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta verificación: " . $stmt->error);
    }
    
    $result_verificar = $stmt->get_result();
    
    if ($result_verificar->num_rows > 0) {
        throw new Exception("Ya has canjeado este descuento anteriormente");
    }
    
    // 3. Verificar puntos del estudiante (solo para validación, el trigger hace la resta)
    $sql_puntos = "SELECT id_user, saldo_actual FROM puntos WHERE id_user = ?";
    $stmt = $conexion->prepare($sql_puntos);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta puntos: " . $conexion->error);
    }
    
    $stmt->bind_param("i", $id_estudiante);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando consulta puntos: " . $stmt->error);
    }
    
    $result_puntos = $stmt->get_result();
    $puntos = $result_puntos->fetch_assoc();
    
    if (!$puntos) {
        throw new Exception("No se encontró registro de puntos para el estudiante");
    }
    
    $saldo_actual = (float)$puntos['saldo_actual'];
    
    error_log("Saldo actual: $saldo_actual, Costo canje: $costo_canje");
    
    if ($saldo_actual < $costo_canje) {
        throw new Exception("Puntos insuficientes. Tienes $saldo_actual pero necesitas $costo_canje");
    }
    
    // 4. Registrar canje en recompensa_canjeada (AMBOS CAMPOS COINCIDEN COMO VARCHAR)
    // EL TRIGGER SE ENCARGA DE RESTAR LOS PUNTOS AUTOMÁTICAMENTE
    $sql_registrar = "
        INSERT INTO recompensa_canjeada (recompensa, id_estudiante, fecha_recompensa, hora_recompensa)
        VALUES (?, ?, CURDATE(), CURTIME())
    ";
    $stmt = $conexion->prepare($sql_registrar);
    
    if (!$stmt) {
        throw new Exception("Error preparando inserción: " . $conexion->error);
    }
    
    $stmt->bind_param("si", $id_descuento, $id_estudiante);
    
    if (!$stmt->execute()) {
        throw new Exception("Error ejecutando inserción: " . $stmt->error);
    }
    
    $conexion->commit();
    
    echo json_encode([
        "exito" => true, 
        "mensaje" => "Descuento canjeado exitosamente",
        "id_periodo_curso" => $id_periodo_curso,
        "curso" => $nombre_curso,
        "puntos_restados" => $costo_canje
    ]);
    
} catch (Exception $e) {
    $conexion->rollback();
    error_log("ERROR en canjearDescuento: " . $e->getMessage());
    echo json_encode(["exito" => false, "mensaje" => $e->getMessage()]);
}

$conexion->close();
?>