<?php
header("Content-Type: application/json");
include 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_user = trim($data["idMaestro"] ?? '');

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
        g.nombre_grado,
        pc.cupos_ocupados

    FROM periodo_curso pc
    INNER JOIN curso c ON c.id_curso = pc.id_curso
    INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
    INNER JOIN area a ON c.id_area = a.id_area
    INNER JOIN grado g ON c.id_grado = g.id_grado
    WHERE pc.estado_periodo = 'Pendiente' AND pc.id_maestro = $id_user
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
            'periodo' => $inicio_gestion . ' - ' . $fin_gestion,
            'inscritos' => $row['cupos_ocupados'] ?? 0
        ];
    }
    
    echo json_encode([
        'success' => true,
        'cursos' => $cursos
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} else {
    echo json_encode([
        'success' => true,
        'message' => 'No se encontraron cursos en la base de datos',
        'cursos' => []
    ], JSON_PRETTY_PRINT);
}

?>