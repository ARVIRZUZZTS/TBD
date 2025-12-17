<?php
include 'conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verificar si es una petición con FormData (archivos)
    if (isset($_POST['id_modulo'])) {
        // Procesar datos de FormData (con archivo)
        $id_modulo = $_POST['id_modulo'];
        $titulo = trim($_POST['titulo']);
        
        if (empty($titulo)) {
            echo json_encode(['success' => false, 'message' => 'El título del tema no puede estar vacío']);
            exit;
        }
        
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
            // Insertar nuevo tema (SOLO id_modulo y titulo)
            $sqlTema = "INSERT INTO temas (id_modulo, titulo) VALUES (?, ?)";
            $stmtTema = $conexion->prepare($sqlTema);
            $stmtTema->bind_param("is", $id_modulo, $titulo);
            
            if (!$stmtTema->execute()) {
                throw new Exception('Error al crear el tema: ' . $stmtTema->error);
            }
            
            $id_tema = $conexion->insert_id;
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
                    'image/jpg',
                    'video/mp4',
                    'video/avi',
                    'video/quicktime',
                    'application/zip',
                    'application/x-rar-compressed'
                ];
                
                if (!in_array($archivo['type'], $allowedTypes)) {
                    throw new Exception('Tipo de archivo no permitido. Use PDF, PPT, DOC, PNG, JPG, MP4, AVI, MOV, ZIP o RAR.');
                }
                
                // Validar tamaño (10MB máximo)
                if ($archivo['size'] > 10 * 1024 * 1024) {
                    throw new Exception('El archivo es demasiado grande. Máximo 10MB permitido.');
                }
                
                // Crear directorio si no existe
                $uploadDir = '../uploads/temas/';
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
                    $rutaRelativa = 'uploads/temas/' . $nombreArchivo;
                    
                    $stmtArchivo->bind_param("sss", $tituloArchivo, $tipoArchivo, $rutaRelativa);
                    
                    if (!$stmtArchivo->execute()) {
                        throw new Exception('Error al guardar el archivo: ' . $stmtArchivo->error);
                    }
                    
                    $id_archivo = $conexion->insert_id;
                    
                    // Relacionar archivo con el tema en archivos_publicacion (USANDO PREFIJO)
                    $sqlRelacion = "INSERT INTO archivos_publicacion (id_archivo, id_publicacion) VALUES (?, ?)";
                    $stmtRelacion = $conexion->prepare($sqlRelacion);
                    $id_publicacion_con_prefijo = 'TE-' . $id_tema;
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
                'message' => 'Tema creado exitosamente' . ($archivo_subido ? ' con archivo adjunto' : ''),
                'id_tema' => $id_tema,
                'id_publicacion' => 'TE-' . $id_tema,
                'con_archivo' => $archivo_subido
            ]);
            
        } catch (Exception $e) {
            // Revertir transacción en caso de error
            $conexion->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        
        // Cerrar statements
        if (isset($stmtTema)) $stmtTema->close();
        if (isset($stmtArchivo)) $stmtArchivo->close();
        if (isset($stmtRelacion)) $stmtRelacion->close();
        $checkModuloStmt->close();
        
    } else {
        // Procesar datos JSON (sin archivo - compatibilidad con versión anterior)
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['id_modulo']) && isset($data['titulo'])) {
            $id_modulo = $data['id_modulo'];
            $titulo = trim($data['titulo']);
            
            if (empty($titulo)) {
                echo json_encode(['success' => false, 'message' => 'El título del tema no puede estar vacío']);
                exit;
            }
            
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
            
            // Insertar tema sin archivo (SOLO id_modulo y titulo)
            $sql = "INSERT INTO temas (id_modulo, titulo) VALUES (?, ?)";
            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("is", $id_modulo, $titulo);
            
            if ($stmt->execute()) {
                $id_tema = $conexion->insert_id;
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Tema creado exitosamente',
                    'id_tema' => $id_tema,
                    'id_publicacion' => 'TE-' . $id_tema,
                    'con_archivo' => false
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al crear el tema: ' . $stmt->error]);
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