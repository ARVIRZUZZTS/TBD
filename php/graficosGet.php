<?php
include 'conexion.php';

header('Content-Type: application/json');

$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'estudiantes';

switch($tipo) {
    case 'estudiantes':
        $sql = "SELECT 
                    estado,
                    COUNT(*) as cantidad
                FROM CURSO_ESTUDIANTE 
                GROUP BY estado
                ORDER BY 
                    CASE estado
                        WHEN 'Aprobado' THEN 1
                        WHEN 'En Curso' THEN 2
                        WHEN 'En Clase' THEN 3
                        WHEN 'Reprobado' THEN 4
                        ELSE 5
                    END";
        break;
        
    case 'ranking':
        $sql = "SELECT 
                    r.ranking,
                    COUNT(p.id_puntos) as cantidad
                FROM RANKING r
                LEFT JOIN PUNTOS p ON p.rankingPoints BETWEEN r.limite_inferior AND r.limite_superior
                GROUP BY r.ranking, r.ranking
                ORDER BY r.limite_inferior DESC";
        break;
        
    case 'categorias':
        $sql = "SELECT 
                    c.nombre_categoria,
                    COUNT(pc.id_periodo_curso) as cantidad
                FROM CATEGORIA c
                LEFT JOIN CURSO cu ON c.id_categoria = cu.id_categoria
                LEFT JOIN PERIODO_CURSO pc ON cu.id_curso = pc.id_curso
                GROUP BY c.id_categoria, c.nombre_categoria
                ORDER BY cantidad DESC";
        break;
        
    case 'promedios':
        $sql = "SELECT 
                    CONCAT(FLOOR(ce.nota/10)*10, '-', FLOOR(ce.nota/10)*10 + 9) as rango,
                    COUNT(*) as cantidad
                FROM CURSO_ESTUDIANTE ce
                WHERE ce.nota IS NOT NULL
                GROUP BY FLOOR(ce.nota/10)
                ORDER BY FLOOR(ce.nota/10)";
        break;

    case 'asistencia':
        $sql = "SELECT 
                    c.titulo,
                    SUM(ce.asistencia) as cantidad
                FROM CURSO_ESTUDIANTE ce
                INNER JOIN PERIODO_CURSO pc ON ce.id_periodo_curso = pc.id_periodo_curso
                INNER JOIN CURSO c ON pc.id_curso = c.id_curso
                GROUP BY c.id_curso, c.titulo
                ORDER BY cantidad DESC";
        break;
        
    default:
        echo json_encode(['exito' => false, 'mensaje' => 'Tipo de gráfico no válido']);
        exit;
}

$result = $conexion->query($sql);

if ($result) {
    $datos = [];
    $labels = [];
    $valores = [];
    
    while ($row = $result->fetch_assoc()) {
        $datos[] = $row;
        
        if ($tipo == 'promedios') {
            $rango = $row['rango'];
            $partes = explode('-', $rango);
            if ($partes[1] == 99) {
                $labels[] = '90-100';
            } else {
                $labels[] = $rango;
            }
        } else if ($tipo == 'asistencia') {
            $labels[] = $row['titulo'];
        } else {
            $labels[] = $row[$tipo == 'ranking' ? 'ranking' : ($tipo == 'categorias' ? 'nombre_categoria' : 'estado')];
        }
        
        $valores[] = (int)$row['cantidad'];
    }
    
    if (count($datos) > 0) {
        echo json_encode([
            'exito' => true, 
            'datos' => $datos,
            'labels' => $labels,
            'valores' => $valores,
            'tipo' => $tipo
        ]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontraron datos para el gráfico']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'Error al obtener los datos: ' . $conexion->error]);
}

$conexion->close();
?>