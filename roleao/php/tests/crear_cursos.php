<?php
header("Content-Type: application/json");
include '../conexion.php';

try {
    // Obtener IDs existentes de las tablas relacionadas
    $grados = [];
    $areas = [];
    $categorias = [];
    
    // Obtener grados
    $result = mysqli_query($conexion, "SELECT id_grado FROM grado");
    while ($row = mysqli_fetch_assoc($result)) {
        $grados[] = $row['id_grado'];
    }
    
    // Obtener áreas
    $result = mysqli_query($conexion, "SELECT id_area FROM area");
    while ($row = mysqli_fetch_assoc($result)) {
        $areas[] = $row['id_area'];
    }
    
    // Obtener categorías
    $result = mysqli_query($conexion, "SELECT id_categoria FROM categoria");
    while ($row = mysqli_fetch_assoc($result)) {
        $categorias[] = $row['id_categoria'];
    }
    
    // Definir cursos de ejemplo
    $cursos = [
        [
            'titulo' => 'Matemáticas Básicas',
            'duracion' => 60,
            'modalidad' => 'P',
            'inicio_gestion' => '2024-01-15',
            'fin_gestion' => '2024-06-15'
        ],
        [
            'titulo' => 'Programación Web Avanzada',
            'duracion' => 120,
            'modalidad' => 'V',
            'inicio_gestion' => '2024-02-01',
            'fin_gestion' => '2024-07-01'
        ],
        [
            'titulo' => 'Historia del Arte',
            'duracion' => 45,
            'modalidad' => 'P',
            'inicio_gestion' => '2024-03-10',
            'fin_gestion' => '2024-05-10'
        ],
        [
            'titulo' => 'Inglés Intermedio',
            'duracion' => 90,
            'modalidad' => 'V',
            'inicio_gestion' => '2024-01-20',
            'fin_gestion' => '2024-04-20'
        ],
        [
            'titulo' => 'Introducción a la Medicina',
            'duracion' => 150,
            'modalidad' => 'P',
            'inicio_gestion' => '2024-02-15',
            'fin_gestion' => '2024-08-15'
        ],
        [
            'titulo' => 'Deportes y Salud',
            'duracion' => 30,
            'modalidad' => 'P',
            'inicio_gestion' => '2024-04-01',
            'fin_gestion' => '2024-05-01'
        ]
    ];
    
    $insertados = 0;
    foreach ($cursos as $curso) {
        // Seleccionar IDs aleatorios de las tablas relacionadas
        $id_grado = $grados[array_rand($grados)];
        $id_area = $areas[array_rand($areas)];
        $id_categoria = $categorias[array_rand($categorias)];
        
        $sql = "INSERT INTO curso (id_categoria, id_area, id_grado, duracion, titulo, modalidad, inicio_gestion, fin_gestion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "iiiissss", 
            $id_categoria, $id_area, $id_grado, $curso['duracion'], 
            $curso['titulo'], $curso['modalidad'], $curso['inicio_gestion'], $curso['fin_gestion']);
        
        if (mysqli_stmt_execute($stmt)) {
            $insertados++;
        }
        mysqli_stmt_close($stmt);
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Se insertaron $insertados cursos correctamente",
        'detalle' => 'Los cursos se crearon con relaciones aleatorias a grados, áreas y categorías existentes'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al insertar cursos: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?>