<?php
header("Content-Type: application/json");
include 'conexion.php';

// Verificar si hay error de conexión
if (!$conexion) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos: ' . mysqli_connect_error(),
        'total_cursos' => 0,
        'cursos' => []
    ]);
    exit;
}

$sql = "
    SELECT 
        c.id_curso,
        c.titulo,
        c.duracion,
        c.modalidad,
        c.inicio_gestion,
        c.fin_gestion,
        cat.nombre_categoria,
        a.nombre_area,
        g.nombre_grado
    FROM curso c
    LEFT JOIN categoria cat ON c.id_categoria = cat.id_categoria
    LEFT JOIN area a ON c.id_area = a.id_area
    LEFT JOIN grado g ON c.id_grado = g.id_grado
    ORDER BY c.id_curso
";

$result = mysqli_query($conexion, $sql);

if ($result && mysqli_num_rows($result) > 0) {
    $cursos = [];
    
    while($row = mysqli_fetch_assoc($result)) {
        // Formatear fechas
        $inicio_gestion = $row['inicio_gestion'] ? date('d/m/Y', strtotime($row['inicio_gestion'])) : 'No definido';
        $fin_gestion = $row['fin_gestion'] ? date('d/m/Y', strtotime($row['fin_gestion'])) : 'No definido';
        
        // Determinar modalidad completa
        $modalidad_completa = '';
        switch($row['modalidad']) {
            case 'P':
                $modalidad_completa = 'Presencial';
                break;
            case 'V':
                $modalidad_completa = 'Virtual';
                break;
            default:
                $modalidad_completa = $row['modalidad'] ?? 'No definida';
        }
        
        $cursos[] = [
            'id_curso' => $row['id_curso'],
            'titulo' => $row['titulo'] ?? 'Sin título',
            'duracion' => ($row['duracion'] ?? 0) . ' horas',
            'modalidad' => $modalidad_completa,
            'categoria' => $row['nombre_categoria'] ?? 'No asignada',
            'area' => $row['nombre_area'] ?? 'No asignada',
            'grado' => $row['nombre_grado'] ?? 'No asignado',
            'periodo' => $inicio_gestion . ' - ' . $fin_gestion
        ];
    }
    
    // Devolver resultados en JSON
    echo json_encode([
        'success' => true,
        'total_cursos' => count($cursos),
        'cursos' => $cursos
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} else {
    echo json_encode([
        'success' => true,
        'message' => 'No se encontraron cursos en la base de datos',
        'total_cursos' => 0,
        'cursos' => []
    ], JSON_PRETTY_PRINT);
}

mysqli_close($conexion);
?>