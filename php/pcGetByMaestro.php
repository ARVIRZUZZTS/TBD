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
        pc.fecha_inicio,
        pc.fecha_fin,
        cat.nombre_categoria,
        a.nombre_area,
        g.nombre_grado,
        pc.cupos_ocupados,
        pc.id_periodo_curso,
        pc.estado_periodo

    FROM periodo_curso pc
    INNER JOIN curso c ON c.id_curso = pc.id_curso
    INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
    INNER JOIN area a ON c.id_area = a.id_area
    INNER JOIN grado g ON c.id_grado = g.id_grado
    WHERE pc.id_maestro = $id_user AND pc.estado_periodo != 'Rechazado'
";

$result = mysqli_query($conexion, $sql);

if ($result && mysqli_num_rows($result) > 0) {
    $cursos = [];
    
    while($row = mysqli_fetch_assoc($result)) {

        $fecha_inicio = $row['fecha_inicio'];
        $fecha_fin = $row['fecha_fin'];
        
        $inicio_gestion = 'No definido';
        $fin_gestion = 'No definido';
        
        if ($fecha_inicio === '0000-00-00') {
            $inicio_gestion = '0000/00/00';
        } elseif ($fecha_inicio) {
            $inicio_gestion = date('d/m/Y', strtotime($fecha_inicio));
        }
        
        if ($fecha_fin === '0000-00-00') {
            $fin_gestion = '0000/00/00';
        } elseif ($fecha_fin) {
            $fin_gestion = date('d/m/Y', strtotime($fecha_fin));
        }
        
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
            'id_periodo_curso' => $row['id_periodo_curso'],
            'titulo' => $row['titulo'] ?? 'Sin título',
            'duracion' => ($row['duracion'] ?? 0) . ' horas',
            'modalidad' => $modalidad_completa,
            'categoria' => $row['nombre_categoria'] ?? 'No asignada',
            'area' => $row['nombre_area'] ?? 'No asignada',
            'grado' => $row['nombre_grado'] ?? 'No asignado',
            'periodo' => $inicio_gestion . ' - ' . $fin_gestion,
            'inscritos' => $row['cupos_ocupados'] ?? 0,
            'estado' => $row['estado_periodo'] ?? 'Pendiente'
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