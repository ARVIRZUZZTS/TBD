<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verificar si es una petición con FormData (archivos)
    if (isset($_POST['id_modulo'])) {
        // Procesar datos de FormData (con archivo)
        $id_modulo = $_POST['id_modulo'];
        $titulo = trim($_POST['titulo']);
        $descripcion = isset($_POST['descripcion']) ? trim($_POST['descripcion']) : '';
        $fecha_emision = $_POST['fecha_emision'];
        $hora_emision = $_POST['hora_emision'];
        $fecha_entrega = $_POST['fecha_entrega'];
        $hora_entrega = $_POST['hora_entrega'];
        
        // Verificar si el módulo existe
        $checkModuloSql = "SELECT id_modulo FROM modulo WHERE id_modulo = ?";
        $checkModuloStmt = $conexion->prepare($checkModuloSql);
        $checkModuloStmt->bind_param("i", $id_modulo);
        $checkModuloStmt->execute();
        $checkModuloResult = $checkModuloStmt->get_result();
        
        if ($checkModuloResult->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'El módulo no existe']);
            exit;
        }
        
        // Iniciar transacción para asegurar que todo se guarde o nada
        $conexion->begin_transaction();
        
        try {
            // Insertar nueva tarea
            $sqlTarea = "INSERT INTO tarea (id_modulo, titulo, descripcion, fecha_emision, hora_emision, fecha_entrega, hora_entrega) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmtTarea = $conexion->prepare($sqlTarea);
            $stmtTarea->bind_param("issssss", $id_modulo, $titulo, $descripcion, $fecha_emision, $hora_emision, $fecha_entrega, $hora_entrega);
            
            if (!$stmtTarea->execute()) {
                throw new Exception('Error al crear la tarea: ' . $stmtTarea->error);
            }
            
            $id_tarea = $conexion->insert_id;
            $archivo_subido = false;
            
            // Procesar archivo si fue subido
            if (isset($_FILES['archivo']) && $_FILES['archivo']['error'] === UPLOAD_ERR_OK) {
                $archivo = $_FILES['archivo'];
                
                // Validar tipo de archivo
                $allowedTypes = [
                    'application/pdf',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/png',
                    'image/jpeg',
                    'image/jpg'
                ];
                
                if (!in_array($archivo['type'], $allowedTypes)) {
                    throw new Exception('Tipo de archivo no permitido. Use PDF, PPT, DOC, PNG o JPG.');
                }
                
                // Validar tamaño (10MB máximo)
                if ($archivo['size'] > 10 * 1024 * 1024) {
                    throw new Exception('El archivo es demasiado grande. Máximo 10MB permitido.');
                }
                
                // Crear directorio si no existe
                $uploadDir = '../uploads/tareas/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                
                // Generar nombre único para el archivo
                $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
                $nombreArchivo = uniqid() . '_' . time() . '.' . $extension;
                $rutaDestino = $uploadDir . $nombreArchivo;
                
                if (move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
                    // Insertar en archivos_adjuntos
                    $sqlArchivo = "INSERT INTO archivos_adjuntos (titulo, tipo, ruta_archivo, fecha_subida) 
                                  VALUES (?, ?, ?, NOW())";
                    $stmtArchivo = $conexion->prepare($sqlArchivo);
                    $tituloArchivo = $archivo['name'];
                    $tipoArchivo = $archivo['type'];
                    $rutaRelativa = 'uploads/tareas/' . $nombreArchivo;
                    
                    $stmtArchivo->bind_param("sss", $tituloArchivo, $tipoArchivo, $rutaRelativa);
                    
                    if (!$stmtArchivo->execute()) {
                        throw new Exception('Error al guardar el archivo: ' . $stmtArchivo->error);
                    }
                    
                    $id_archivo = $conexion->insert_id;
                    
                    // Relacionar archivo con la tarea en archivos_publicacion (USANDO PREFIJO)
                    $sqlRelacion = "INSERT INTO archivos_publicacion (id_archivo, id_publicacion) VALUES (?, ?)";
                    $stmtRelacion = $conexion->prepare($sqlRelacion);
                    $id_publicacion_con_prefijo = 'TA-' . $id_tarea;
                    $stmtRelacion->bind_param("is", $id_archivo, $id_publicacion_con_prefijo);
                    
                    if (!$stmtRelacion->execute()) {
                        throw new Exception('Error al relacionar el archivo: ' . $stmtRelacion->error);
                    }
                    
                    $archivo_subido = true;
                } else {
                    throw new Exception('Error al subir el archivo.');
                }
            }
            
            // Confirmar transacción
            $conexion->commit();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Tarea creada exitosamente' . ($archivo_subido ? ' con archivo adjunto' : ''),
                'id_tarea' => $id_tarea,
                'id_publicacion' => 'TA-' . $id_tarea,
                'con_archivo' => $archivo_subido
            ]);
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $conexion->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        
        // Cerrar statements
        if (isset($stmtTarea)) $stmtTarea->close();
        if (isset($stmtArchivo)) $stmtArchivo->close();
        if (isset($stmtRelacion)) $stmtRelacion->close();
        $checkModuloStmt->close();
        
    } else {
        // Procesar datos JSON (sin archivo - compatibilidad con versión anterior)
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['id_modulo']) && isset($data['titulo']) && 
            isset($data['fecha_emision']) && isset($data['hora_emision']) &&
            isset($data['fecha_entrega']) && isset($data['hora_entrega'])) {
            
            $id_modulo = $data['id_modulo'];
            $titulo = trim($data['titulo']);
            $descripcion = isset($data['descripcion']) ? trim($data['descripcion']) : '';
            $fecha_emision = $data['fecha_emision'];
            $hora_emision = $data['hora_emision'];
            $fecha_entrega = $data['fecha_entrega'];
            $hora_entrega = $data['hora_entrega'];
            
            // Verificar si el módulo existe
            $checkModuloSql = "SELECT id_modulo FROM modulo WHERE id_modulo = ?";
            $checkModuloStmt = $conexion->prepare($checkModuloSql);
            $checkModuloStmt->bind_param("i", $id_modulo);
            $checkModuloStmt->execute();
            $checkModuloResult = $checkModuloStmt->get_result();
            
            if ($checkModuloResult->num_rows === 0) {
                echo json_encode(['success' => false, 'message' => 'El módulo no existe']);
                exit;
            }
            
            // Insertar tarea sin archivo
            $sql = "INSERT INTO tarea (id_modulo, titulo, descripcion, fecha_emision, hora_emision, fecha_entrega, hora_entrega) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("issssss", $id_modulo, $titulo, $descripcion, $fecha_emision, $hora_emision, $fecha_entrega, $hora_entrega);
            
            if ($stmt->execute()) {
                $id_tarea = $conexion->insert_id;
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Tarea creada exitosamente',
                    'id_tarea' => $id_tarea,
                    'id_publicacion' => 'TA-' . $id_tarea,
                    'con_archivo' => false
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al crear la tarea: ' . $stmt->error]);
            }
            
            $stmt->close();
            $checkModuloStmt->close();
            
        } else {
            echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        }
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

$conexion->close();
?>