<?php

/**
 * Otorga una insignia a un estudiante si no la tiene ya,
 * y suma los puntos correspondientes a su saldo.
 * 
 * @param mysqli $conexion Conexión a la BD (debe estar iniciada)
 * @param int $id_estudiante ID del estudiante
 * @param int $id_insignia ID de la insignia a otorgar
 * @return array ['exito' => bool, 'mensaje' => string, 'puntos' => int]
 */
function otorgarInsignia($conexion, $id_estudiante, $id_insignia) {
    try {
        // 1. Verificar si ya tiene la insignia
        $sqlCheck = "SELECT 1 FROM insignias_estudiantes WHERE id_estudiante = ? AND id_insignia = ?";
        $stmtCheck = $conexion->prepare($sqlCheck);
        $stmtCheck->bind_param("ii", $id_estudiante, $id_insignia);
        $stmtCheck->execute();
        if ($stmtCheck->get_result()->num_rows > 0) {
            return ['exito' => false, 'mensaje' => 'Ya posee la insignia'];
        }
        $stmtCheck->close();

        // 2. Obtener datos de la insignia (puntos)
        $sqlInsignia = "SELECT puntos_premio, nombre FROM insignias WHERE id_insignia = ?";
        $stmtInsignia = $conexion->prepare($sqlInsignia);
        $stmtInsignia->bind_param("i", $id_insignia);
        $stmtInsignia->execute();
        $resInsignia = $stmtInsignia->get_result();
        
        if ($resInsignia->num_rows === 0) {
            return ['exito' => false, 'mensaje' => 'Insignia no existe'];
        }
        
        $datosInsignia = $resInsignia->fetch_assoc();
        $puntos = $datosInsignia['puntos_premio'];
        $stmtInsignia->close();

        // 3. Insertar en insignias_estudiantes
        $sqlInsert = "INSERT INTO insignias_estudiantes (id_estudiante, id_insignia) VALUES (?, ?)";
        $stmtInsert = $conexion->prepare($sqlInsert);
        $stmtInsert->bind_param("ii", $id_estudiante, $id_insignia);
        if (!$stmtInsert->execute()) {
            throw new Exception("Error al asignar insignia: " . $stmtInsert->error);
        }
        $stmtInsert->close();

        // 4. Actualizar puntos del usuario
        // Verificamos si existe registro en PUNTOS para este usuario
        $sqlCheckPuntos = "SELECT 1 FROM puntos WHERE id_user = ?";
        $stmtCheckPuntos = $conexion->prepare($sqlCheckPuntos);
        $stmtCheckPuntos->bind_param("i", $id_estudiante);
        $stmtCheckPuntos->execute();
        $existePuntos = $stmtCheckPuntos->get_result()->num_rows > 0;
        $stmtCheckPuntos->close();

        if ($existePuntos) {
            $sqlUpdatePuntos = "UPDATE puntos SET 
                saldo_actual = saldo_actual + ?,
                puntos_totales = puntos_totales + ?,
                rankingPoints = rankingPoints + ?
                WHERE id_user = ?";
            $stmtUpdatePuntos = $conexion->prepare($sqlUpdatePuntos);
            $stmtUpdatePuntos->bind_param("iiii", $puntos, $puntos, $puntos, $id_estudiante);
            $stmtUpdatePuntos->execute();
            $stmtUpdatePuntos->close();
        } else {
            // Si no tiene registro de puntos, lo creamos
            $sqlInsertPuntos = "INSERT INTO puntos (id_user, saldo_actual, puntos_totales, puntos_gastados, rankingPoints) VALUES (?, ?, ?, 0, ?)";
            $stmtInsertPuntos = $conexion->prepare($sqlInsertPuntos);
            $stmtInsertPuntos->bind_param("iiii", $id_estudiante, $puntos, $puntos, $puntos);
            $stmtInsertPuntos->execute();
            $stmtInsertPuntos->close();
        }

        return ['exito' => true, 'mensaje' => 'Insignia otorgada', 'puntos' => $puntos];

    } catch (Exception $e) {
        return ['exito' => false, 'mensaje' => $e->getMessage()];
    }
}
?>
