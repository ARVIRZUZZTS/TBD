-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 01:30:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tbd`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `estado_clase_cont` ()   BEGIN
    DECLARE hora_actual TIME;
    DECLARE dia_actual VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur_id_pc INT;
    DECLARE cur_id_dc INT;
    DECLARE cur_hini TIME;
    DECLARE cur_hfin TIME;
    DECLARE dia_ingles VARCHAR(20);
    
    DECLARE cur_clases CURSOR FOR
    SELECT DISTINCT
        h.id_periodo_clase,
        dh.id_dia_clase,
        dh.hora_inicio,
        dh.hora_fin
    FROM dia_horario dh
    JOIN horario h ON dh.id_dia_clase = h.id_dia_clase
    JOIN periodo_curso pc ON h.id_periodo_clase = pc.id_periodo_curso
    WHERE dh.dia = dia_actual  -- Usar el día en español
      AND pc.estado_periodo = 'En Curso';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET hora_actual = CURRENT_TIME();
    
    SET dia_ingles = DAYNAME(CURDATE());
    
    SET dia_actual = CASE dia_ingles
        WHEN 'Monday' THEN 'Lunes'
        WHEN 'Tuesday' THEN 'Martes'
        WHEN 'Wednesday' THEN 'Miércoles'
        WHEN 'Thursday' THEN 'Jueves'
        WHEN 'Friday' THEN 'Viernes'
        WHEN 'Saturday' THEN 'Sábado'
        WHEN 'Sunday' THEN 'Domingo'
        ELSE dia_ingles
    END;
    
    OPEN cur_clases;
    
    read_loop: LOOP
        FETCH cur_clases INTO cur_id_pc, cur_id_dc, cur_hini, cur_hfin;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        IF hora_actual >= cur_hini AND hora_actual <= cur_hfin THEN
            UPDATE curso_estudiante ce
            JOIN periodo_curso pc ON ce.id_periodo_curso = pc.id_periodo_curso
            SET ce.estado = 'En Clase'
            WHERE ce.id_periodo_curso = cur_id_pc
              AND pc.estado_periodo = 'En Curso'
              AND ce.estado = 'En Curso';
              
        ELSEIF hora_actual > cur_hfin THEN
            UPDATE curso_estudiante
            SET estado = 'En Curso'
            WHERE id_periodo_curso = cur_id_pc
              AND estado = 'En Clase';
        END IF;
        
    END LOOP;
    
    CLOSE cur_clases;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_adjuntos`
--

CREATE TABLE `archivos_adjuntos` (
  `id_archivo` int(11) NOT NULL,
  `titulo` varchar(61) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `fecha_subida` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `archivos_adjuntos`
--
DELIMITER $$
CREATE TRIGGER `tr_archivos_adjuntos_dl` AFTER DELETE ON `archivos_adjuntos` FOR EACH ROW BEGIN
	INSERT INTO xb_archivos_adjuntos (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_archivo)
	);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_archivos_adjuntos_in` AFTER INSERT ON `archivos_adjuntos` FOR EACH ROW BEGIN
	INSERT INTO xb_archivos_adjuntos (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id: ', NEW.id_archivo)
	);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_archivos_adjuntos_up` AFTER UPDATE ON `archivos_adjuntos` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.titulo <> NEW.titulo THEN
        SET cambios = CONCAT(
            cambios,
            'titulo: ', OLD.titulo, ' -> ', NEW.titulo, '\n'
        );
    END IF;

    IF OLD.tipo <> NEW.tipo THEN
        SET cambios = CONCAT(
            cambios,
            'tipo: ', OLD.tipo, ' -> ', NEW.tipo, '\n'
        );
    END IF;

    IF OLD.ruta_archivo <> NEW.ruta_archivo THEN
        SET cambios = CONCAT(
            cambios,
            'ruta_archivo: ', OLD.ruta_archivo, ' -> ', NEW.ruta_archivo, '\n'
        );
    END IF;

    IF OLD.fecha_subida <> NEW.fecha_subida THEN
        SET cambios = CONCAT(
            cambios,
            'fecha_subida: ', OLD.fecha_subida, ' -> ', NEW.fecha_subida, '\n'
        );
    END IF;

    IF cambios <> '' THEN
        INSERT INTO xB_archivos_adjuntos (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_archivo, '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_publicacion`
--

CREATE TABLE `archivos_publicacion` (
  `id_archivo` int(11) NOT NULL,
  `id_publicacion` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `archivos_publicacion`
--
DELIMITER $$
CREATE TRIGGER `tr_archivos_publicacion_dl` AFTER DELETE ON `archivos_publicacion` FOR EACH ROW BEGIN
	INSERT INTO xb_archivos_publicacion (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_archivo)
	);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_archivos_publicacion_in` AFTER INSERT ON `archivos_publicacion` FOR EACH ROW BEGIN
	INSERT INTO xb_archivos_publicacion (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_archivo)
	);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_archivos_publicacion_up` AFTER UPDATE ON `archivos_publicacion` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_archivo <> NEW.id_archivo THEN
        SET cambios = CONCAT(
            cambios,
            'ID ARCHIVO: ', OLD.id_archivo, ' -> ', NEW.id_archivo , '\n'
        );
    END IF;

    IF OLD.id_publicacion <> NEW.id_publicacion THEN
        SET cambios = CONCAT(
            cambios,
            'ID PUBLICACION: ', OLD.id_publicacion, ' -> ', NEW.id_publicacion, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_archivos_publicacion (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_archivo , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `area`
--

CREATE TABLE `area` (
  `id_area` int(11) NOT NULL,
  `nombre_area` varchar(31) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `area`
--

INSERT INTO `area` (`id_area`, `nombre_area`) VALUES
(1, 'Ciencias Exactas'),
(2, 'Ciencias Sociales'),
(3, 'Humanidades'),
(4, 'Arte y Cultura'),
(5, 'Tecnología'),
(6, 'Salud'),
(7, 'Deportes');

--
-- Disparadores `area`
--
DELIMITER $$
CREATE TRIGGER `tr_area_dl` AFTER DELETE ON `area` FOR EACH ROW BEGIN
    INSERT INTO xb_area (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_area)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_area_in` AFTER INSERT ON `area` FOR EACH ROW BEGIN
    INSERT INTO xb_area (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_area)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_area_up` AFTER UPDATE ON `area` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.nombre_area <> NEW.nombre_area THEN
        SET cambios = CONCAT(
            cambios,
            'NOMBRE AREA: ', OLD.nombre_area, ' -> ', NEW.nombre_area , '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_area (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_area , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula`
--

CREATE TABLE `aula` (
  `id_aula` int(11) NOT NULL,
  `capacidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `aula`
--
DELIMITER $$
CREATE TRIGGER `tr_aula_dl` AFTER DELETE ON `aula` FOR EACH ROW BEGIN
    INSERT INTO xb_aula (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_aula)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_aula_in` AFTER INSERT ON `aula` FOR EACH ROW BEGIN
    INSERT INTO xb_aula (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_aula)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_aula_up` AFTER UPDATE ON `aula` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.capacidad <> NEW.capacidad THEN
        SET cambios = CONCAT(
            cambios,
            'CAPACIDAD: ', OLD.capacidad, ' -> ', NEW.capacidad , '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_aula (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_aula , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `beca`
--

CREATE TABLE `beca` (
  `id_beca` int(11) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `porcentaje` int(11) DEFAULT NULL,
  `estado_beca` varchar(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `beca`
--
DELIMITER $$
CREATE TRIGGER `a_validar_fechas_beca` BEFORE INSERT ON `beca` FOR EACH ROW BEGIN
    IF NEW.fecha_fin < NEW.fecha_inicio THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_beca_dl` AFTER DELETE ON `beca` FOR EACH ROW BEGIN
    INSERT INTO xb_beca (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_beca)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_beca_in` AFTER INSERT ON `beca` FOR EACH ROW BEGIN
    INSERT INTO xb_beca (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_beca)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_beca_up` AFTER UPDATE ON `beca` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_estudiante <> NEW.id_estudiante THEN
        SET cambios = CONCAT(
            cambios,
            'ID ESTUDIANTE: ', OLD.id_estudiante, ' -> ', NEW.id_estudiante , '\n'
        );
    END IF;

    IF OLD.id_area <> NEW.id_area THEN
        SET cambios = CONCAT(
            cambios,
            'ID AREA: ', OLD.id_area, ' -> ', NEW.id_area, '\n'
        );
    END IF;
    
    IF OLD.porcentaje <> NEW.porcentaje THEN
        SET cambios = CONCAT(
            cambios,
            'PORCENTAJE: ', OLD.porcentaje, ' -> ', NEW.porcentaje, '\n'
        );
    END IF;
    
    IF OLD.estado_beca <> NEW.estado_beca THEN
        SET cambios = CONCAT(
            cambios,
            'ESTADO BECA: ', OLD.estado_beca, ' -> ', NEW.estado_beca, '\n'
        );
    END IF;
    
    IF OLD.fecha_inicio <> NEW.fecha_inicio THEN
        SET cambios = CONCAT(
            cambios,
            'FECHA INICIO: ', OLD.fecha_inicio, ' -> ', NEW.fecha_inicio, '\n'
        );
    END IF;
    
    IF OLD.fecha_fin <> NEW.fecha_fin THEN
        SET cambios = CONCAT(
            cambios,
            'FECHA FIN: ', OLD.fecha_fin, ' -> ', NEW.fecha_fin, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_beca (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_beca , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora_inscripcion_estudiante`
--

CREATE TABLE `bitacora_inscripcion_estudiante` (
  `id_bitInscripcionEstudiante` int(11) NOT NULL,
  `accion` varchar(50) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(31) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre_categoria`) VALUES
(1, 'Curso Regular'),
(2, 'Taller'),
(3, 'Seminario'),
(4, 'Curso Certificado'),
(5, 'Foro');

--
-- Disparadores `categoria`
--
DELIMITER $$
CREATE TRIGGER `tr_categoria_dl` AFTER DELETE ON `categoria` FOR EACH ROW BEGIN
    INSERT INTO xb_categoria (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_categoria)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_categoria_in` AFTER INSERT ON `categoria` FOR EACH ROW BEGIN
    INSERT INTO xb_categoria (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_categoria)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_categoria_up` AFTER UPDATE ON `categoria` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.nombre_categoria <> NEW.nombre_categoria THEN
        SET cambios = CONCAT(
            cambios,
            'NOMBRE CATEGORIA: ', OLD.nombre_categoria, ' -> ', NEW.nombre_categoria , '\n'
        );
    END IF;

    IF cambios <> '' THEN
        INSERT INTO xB_categoria (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_categoria , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

CREATE TABLE `comentario` (
  `id_comentario` int(11) NOT NULL,
  `id_periodo_curso` int(11) NOT NULL,
  `id_publicacion` int(11) DEFAULT NULL,
  `mensaje` varchar(1001) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `comentario`
--
DELIMITER $$
CREATE TRIGGER `tr_comentario_dl` AFTER DELETE ON `comentario` FOR EACH ROW BEGIN
    INSERT INTO xb_comentario (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_comentario)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_comentario_in` AFTER INSERT ON `comentario` FOR EACH ROW BEGIN
    INSERT INTO xb_comentario (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_comentario)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_comentario_up` AFTER UPDATE ON `comentario` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_publicacion <> NEW.id_publicacion THEN
        SET cambios = CONCAT(
            cambios,
            'ID PUBLICACION: ', OLD.id_publicacion, ' -> ', NEW.id_publicacion , '\n'
        );
    END IF;

    IF OLD.mensaje <> NEW.mensaje THEN
        SET cambios = CONCAT(
            cambios,
            'MENSAJE: ', OLD.mensaje, ' -> ', NEW.mensaje, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xb_comentario (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_comentario , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cosmetico`
--

CREATE TABLE `cosmetico` (
  `id_cosmetico` int(11) NOT NULL,
  `id_tipo_cosmetico` int(11) DEFAULT NULL,
  `costo_canje` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso`
--

CREATE TABLE `curso` (
  `id_curso` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_area` int(11) DEFAULT NULL,
  `id_grado` int(11) DEFAULT NULL,
  `duracion` int(11) DEFAULT NULL,
  `titulo` varchar(31) DEFAULT NULL,
  `modalidad` varchar(2) DEFAULT NULL,
  `inicio_gestion` date DEFAULT NULL,
  `fin_gestion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `curso`
--
DELIMITER $$
CREATE TRIGGER `tr_curso_dl` AFTER DELETE ON `curso` FOR EACH ROW BEGIN
    INSERT INTO xb_curso (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_curso)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_in` AFTER INSERT ON `curso` FOR EACH ROW BEGIN
    INSERT INTO xb_curso (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_curso)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_up` AFTER UPDATE ON `curso` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_categoria <> NEW.id_categoria THEN
        SET cambios = CONCAT(
            cambios,
            'ID CATEGORIA: ', OLD.id_categoria, ' -> ', NEW.id_categoria , '\n'
        );
    END IF;

    IF OLD.id_area <> NEW.id_area THEN
        SET cambios = CONCAT(
            cambios,
            'ID AREA: ', OLD.id_area, ' -> ', NEW.id_area, '\n'
        );
    END IF;
    
    IF OLD.duracion <> NEW.duracion THEN
        SET cambios = CONCAT(
            cambios,
            'DURACION: ', OLD.duracion, ' -> ', NEW.duracion, '\n'
        );
    END IF;
    
    IF OLD.titulo <> NEW.titulo THEN
        SET cambios = CONCAT(
            cambios,
            'TITULO: ', OLD.titulo, ' -> ', NEW.titulo, '\n'
        );
    END IF;
    
    IF OLD.modalidad <> NEW.modalidad THEN
        SET cambios = CONCAT(
            cambios,
            'MODALIDAD: ', OLD.modalidad, ' -> ', NEW.modalidad, '\n'
        );
    END IF;
    
    IF OLD.inicio_gestion <> NEW.inicio_gestion THEN
        SET cambios = CONCAT(
            cambios,
            'INICIO GESTION: ', OLD.inicio_gestion, ' -> ', NEW.inicio_gestion, '\n'
        );
    END IF;
    
    IF OLD.fin_gestion <> NEW.fin_gestion THEN
        SET cambios = CONCAT(
            cambios,
            'FIN GESTION: ', OLD.fin_gestion, ' -> ', NEW.fin_gestion, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_curso (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_curso , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso_estudiante`
--

CREATE TABLE `curso_estudiante` (
  `id_curso_estudiante` int(11) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `id_periodo_curso` int(11) DEFAULT NULL,
  `estado` varchar(21) DEFAULT NULL,
  `nota` int(11) DEFAULT NULL,
  `asistencia` int(11) DEFAULT NULL,
  `deskPoints` int(11) DEFAULT NULL,
  `rankingPoints` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `curso_estudiante`
--
DELIMITER $$
CREATE TRIGGER `inscripcion_estudiante` AFTER INSERT ON `curso_estudiante` FOR EACH ROW BEGIN
    DECLARE costo DECIMAL(10,2) DEFAULT 0;
    DECLARE descuento DECIMAL(5,2) DEFAULT 0;
    DECLARE total DECIMAL(10,2) DEFAULT 0;
    DECLARE idCurso INT DEFAULT 0;
    DECLARE idDescuento INT DEFAULT 0;

    SELECT IFNULL(pc.costo, 0), IFNULL(pc.id_curso, 0)
    INTO costo, idCurso
    FROM PERIODO_CURSO pc
    WHERE pc.id_periodo_curso = NEW.id_periodo_curso
    LIMIT 1;

    SELECT d.id_descuento, IFNULL(d.porcentaje_descuento, 0)
    INTO idDescuento, descuento
    FROM RECOMPENSA_CANJEADA rc
    JOIN DESCUENTO d ON rc.recompensa = d.id_descuento
    WHERE rc.id_estudiante = NEW.id_estudiante
      AND d.id_periodo_curso = NEW.id_periodo_curso
    ORDER BY rc.fecha_recompensa DESC, rc.hora_recompensa DESC
    LIMIT 1;

    IF idDescuento IS NULL THEN 
        SET idDescuento = 0;
        SET descuento = 0;
    END IF;

    INSERT INTO BITACORA_INSCRIPCION_ESTUDIANTE (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT(
            'C: ', IFNULL(idCurso, 0),
            ' - PC: ', IFNULL(NEW.id_periodo_curso, 0),
            ' : Est: ', IFNULL(NEW.id_estudiante, 0),
            ', Costo: ', FORMAT(IFNULL(costo, 0), 2), ' $',
            ', Descuento: ', FORMAT(IFNULL(descuento, 0), 2), '%',
            ', TOTAL: ', FORMAT(IFNULL(costo - (costo * (descuento / 100)), 0), 2), ' $'
        )
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_estudiante_dl` AFTER DELETE ON `curso_estudiante` FOR EACH ROW BEGIN
    INSERT INTO xb_ (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_curso_estudiante)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_estudiante_in` AFTER INSERT ON `curso_estudiante` FOR EACH ROW BEGIN
    INSERT INTO xb_curso_estudiante (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_curso_estudiante)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_estudiante_up` AFTER UPDATE ON `curso_estudiante` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_estudiante <> NEW.id_estudiante THEN
        SET cambios = CONCAT(
            cambios,
            'ID ESTUDIANTE: ', OLD.id_estudiante, ' -> ', NEW.id_estudiante , '\n'
        );
    END IF;

    IF OLD.id_periodo_curso <> NEW.id_periodo_curso THEN
        SET cambios = CONCAT(
            cambios,
            'ID PERIODO CURSO: ', OLD.id_periodo_curso, ' -> ', NEW.id_periodo_curso, '\n'
        );
    END IF;
    
    IF OLD.estado <> NEW.estado THEN
        SET cambios = CONCAT(
            cambios,
            'ESTADO: ', OLD.estado, ' -> ', NEW.estado, '\n'
        );
    END IF;
    
    IF OLD.nota <> NEW.nota THEN
        SET cambios = CONCAT(
            cambios,
            'NOTA: ', OLD.nota, ' -> ', NEW.nota, '\n'
        );
    END IF;
    
    IF OLD.asistencia <> NEW.asistencia THEN
        SET cambios = CONCAT(
            cambios,
            'ASISTENCIA: ', OLD.asistencia, ' -> ', NEW.asistencia, '\n'
        );
    END IF;
    
    IF OLD.deskPoints <> NEW.deskPoints THEN
        SET cambios = CONCAT(
            cambios,
            'DESKPOINTS: ', OLD.deskPoints, ' -> ', NEW.deskPoints, '\n'
        );
    END IF;
    
    IF OLD.rankingPoints <> NEW.rankingPoints THEN
        SET cambios = CONCAT(
            cambios,
            'RANKINGPOINTS: ', OLD.rankingPoints, ' -> ', NEW.rankingPoints, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xb_curso_estudiante (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_curso_estudiante , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `curso_maestro`
--

CREATE TABLE `curso_maestro` (
  `id_curso_maestro` int(11) NOT NULL,
  `id_maestro` int(11) DEFAULT NULL,
  `id_periodo_curso` int(11) DEFAULT NULL,
  `pago_maestro` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `curso_maestro`
--
DELIMITER $$
CREATE TRIGGER `tr_curso_maestro_dl` AFTER DELETE ON `curso_maestro` FOR EACH ROW BEGIN
    INSERT INTO xb_curso_maestro (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_curso_maestro)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_maestro_in` AFTER INSERT ON `curso_maestro` FOR EACH ROW BEGIN
    INSERT INTO xb_curso_maestro (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_curso_maestro)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_curso_maestro_up` AFTER UPDATE ON `curso_maestro` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_maestro <> NEW.id_maestro THEN
        SET cambios = CONCAT(
            cambios,
            'ID MAESTRO: ', OLD.id_maestro, ' -> ', NEW.id_maestro , '\n'
        );
    END IF;

    IF OLD.id_periodo_curso <> NEW.id_periodo_curso THEN
        SET cambios = CONCAT(
            cambios,
            'ID PERIODO CURSO: ', OLD.id_periodo_curso, ' -> ', NEW.id_periodo_curso, '\n'
        );
    END IF;
    
    IF OLD.pago_maestro <> NEW.pago_maestro THEN
        SET cambios = CONCAT(
            cambios,
            'PAGO MAESTRO: ', OLD.pago_maestro, ' -> ', NEW.pago_maestro, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_curso_maestro (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_curso_maestro , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos_maestro`
--

CREATE TABLE `datos_maestro` (
  `id_dato` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL,
  `sueldo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `datos_maestro`
--
DELIMITER $$
CREATE TRIGGER `tr__dl` AFTER DELETE ON `datos_maestro` FOR EACH ROW BEGIN
    INSERT INTO xb_datos_maestro (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_dato)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_datos_maestro_in` AFTER INSERT ON `datos_maestro` FOR EACH ROW BEGIN
    INSERT INTO xb_datos_maestro (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_dato)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_datos_maestro_up` AFTER UPDATE ON `datos_maestro` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_user <> NEW.id_user THEN
        SET cambios = CONCAT(
            cambios,
            'ID USER: ', OLD.id_user, ' -> ', NEW.id_user , '\n'
        );
    END IF;

    IF OLD.titulo <> NEW.titulo THEN
        SET cambios = CONCAT(
            cambios,
            'TITULO: ', OLD.titulo, ' -> ', NEW.titulo, '\n'
        );
    END IF;
    
    IF OLD.sueldo <> NEW.sueldo THEN
        SET cambios = CONCAT(
            cambios,
            'SUELDO: ', OLD.sueldo, ' -> ', NEW.sueldo, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_datos_maestro (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_dato , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descuento`
--

CREATE TABLE `descuento` (
  `id_descuento` varchar(11) NOT NULL,
  `id_periodo_curso` int(11) DEFAULT NULL,
  `costo_canje` int(11) DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `porcentaje_descuento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `descuento`
--
DELIMITER $$
CREATE TRIGGER `tr_descuento_dl` AFTER DELETE ON `descuento` FOR EACH ROW BEGIN
    INSERT INTO xb_descuento (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_descuento)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_descuento_in` AFTER INSERT ON `descuento` FOR EACH ROW BEGIN
    INSERT INTO xb_descuento (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_descuento)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_descuento_up` AFTER UPDATE ON `descuento` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_periodo_curso <> NEW.id_periodo_curso THEN
        SET cambios = CONCAT(
            cambios,
            'ID PERIODO CURSO: ', OLD.id_periodo_curso, ' -> ', NEW.id_periodo_curso , '\n'
        );
    END IF;

    IF OLD.costo_canje <> NEW.costo_canje THEN
        SET cambios = CONCAT(
            cambios,
            'COSTO CANJE: ', OLD.costo_canje, ' -> ', NEW.costo_canje, '\n'
        );
    END IF;
    
    IF OLD.fecha_fin <> NEW.fecha_fin THEN
        SET cambios = CONCAT(
            cambios,
            'FECHA FIN: ', OLD.fecha_fin, ' -> ', NEW.fecha_fin, '\n'
        );
    END IF;
    
    IF OLD.porcentaje_descuento <> NEW.porcentaje_descuento THEN
        SET cambios = CONCAT(
            cambios,
            'PORCENTAJE DESCUENTO: ', OLD.porcentaje_descuento, ' -> ', NEW.porcentaje_descuento, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_descuento (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_descuento , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dia_horario`
--

CREATE TABLE `dia_horario` (
  `id_dia_clase` int(11) NOT NULL,
  `dia` varchar(10) DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `id_aula` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `dia_horario`
--
DELIMITER $$
CREATE TRIGGER `tr_dia_horario_dl` AFTER DELETE ON `dia_horario` FOR EACH ROW BEGIN
    INSERT INTO xb_dia_horario (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_dia_clase)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_dia_horario_in` AFTER INSERT ON `dia_horario` FOR EACH ROW BEGIN
    INSERT INTO xb_dia_horario (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_dia_clase)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_dia_horario_up` AFTER UPDATE ON `dia_horario` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.dia <> NEW.dia THEN
        SET cambios = CONCAT(
            cambios,
            'DIA: ', OLD.dia, ' -> ', NEW.dia , '\n'
        );
    END IF;

    IF OLD.hora_inicio <> NEW.hora_inicio THEN
        SET cambios = CONCAT(
            cambios,
            'HORA INICIO: ', OLD.hora_inicio, ' -> ', NEW.hora_inicio, '\n'
        );
    END IF;
    
    IF OLD.hora_fin <> NEW.hora_fin THEN
        SET cambios = CONCAT(
            cambios,
            'HORA FIN: ', OLD.hora_fin, ' -> ', NEW.hora_fin, '\n'
        );
    END IF;    
    
    IF OLD.id_aula <> NEW.id_aula THEN
        SET cambios = CONCAT(
            cambios,
            'ID AULA: ', OLD.id_aula, ' -> ', NEW.id_aula, '\n'
        );
    END IF;    
    
    IF cambios <> '' THEN
        INSERT INTO xb_dia_horario (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_dia_clase , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas`
--

CREATE TABLE `entregas` (
  `id_entrega` int(11) NOT NULL,
  `id_publicacion` varchar(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `nota` decimal(10,2) DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `entregas`
--
DELIMITER $$
CREATE TRIGGER `a_ctualizar_puntos_nota` AFTER UPDATE ON `entregas` FOR EACH ROW BEGIN
	IF NEW.nota <> OLD.nota THEN
    	UPDATE puntos
        SET
        	saldo_actual = saldo_actual + (NEW.nota * 0.3),
            puntos_totales = puntos_totales + (NEW.nota *0.3),
            rankingPoints = rankingPoints + NEW.nota
		WHERE id_user = NEW.id_user;
	END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_entregas_dl` AFTER DELETE ON `entregas` FOR EACH ROW BEGIN
    INSERT INTO xb_entregas (accion,fecha,descripcion)
    VALUES (
        'DELETE',
        NOW(),
        CONCAT('Se elimino id: ', OLD.id_entrega)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_entregas_in` AFTER INSERT ON `entregas` FOR EACH ROW BEGIN
    INSERT INTO xb_entregas (accion, fecha, descripcion)
    VALUES (
        'INSERT',
        NOW(),
        CONCAT('Se inserto id:', NEW.id_entrega)
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_entregas_up` AFTER UPDATE ON `entregas` FOR EACH ROW BEGIN
    DECLARE cambios TEXT DEFAULT '';
    IF OLD.id_publicacion <> NEW.id_publicacion THEN
        SET cambios = CONCAT(
            cambios,
            'ID PUBLICACION: ', OLD.id_publicacion, ' -> ', NEW.id_publicacion , '\n'
        );
    END IF;

    IF OLD.id_user <> NEW.id_user THEN
        SET cambios = CONCAT(
            cambios,
            'ID USER: ', OLD.id_user, ' -> ', NEW.id_user, '\n'
        );
    END IF;
    
    IF OLD.nota <> NEW.nota THEN
        SET cambios = CONCAT(
            cambios,
            'NOTA: ', OLD.nota, ' -> ', NEW.nota, '\n'
        );
    END IF;
    
    IF OLD.hora_entrega <> NEW.hora_entrega THEN
        SET cambios = CONCAT(
            cambios,
            'HORA ENTREGA: ', OLD.hora_entrega, ' -> ', NEW.hora_entrega, '\n'
        );
    END IF;    
    
    IF OLD.fecha_entrega <> NEW.fecha_entrega THEN
        SET cambios = CONCAT(
            cambios,
            'FECHA ENTREGA: ', OLD.fecha_entrega, ' -> ', NEW.fecha_entrega, '\n'
        );
    END IF;
    
    IF cambios <> '' THEN
        INSERT INTO xB_entregas (accion, fecha, descripcion)
        VALUES (
            'UPDATE',
            NOW(),
            CONCAT(
                'Se actualizó id: ', NEW.id_entrega , '\n',
                cambios
            )
        );
    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluacion`
--

CREATE TABLE `evaluacion` (
  `id_evaluacion` int(11) NOT NULL,
  `id_modulo` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL,
  `descripcion` varchar(1001) DEFAULT NULL,
  `hora_emision` time DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `deskPoints` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grado`
--

CREATE TABLE `grado` (
  `id_grado` int(11) NOT NULL,
  `nombre_grado` varchar(31) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grado`
--

INSERT INTO `grado` (`id_grado`, `nombre_grado`) VALUES
(1, 'Primaria'),
(2, 'Secundaria'),
(3, 'Bachillerato'),
(4, 'Técnico'),
(5, 'Universitario'),
(6, 'Maestría'),
(7, 'Doctorado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horario`
--

CREATE TABLE `horario` (
  `id_periodo_clase` int(11) NOT NULL,
  `id_dia_clase` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripcion`
--

CREATE TABLE `inscripcion` (
  `id_inscripcion` int(11) NOT NULL,
  `id_tipo_pago` int(11) DEFAULT NULL,
  `id_user` int(11) DEFAULT NULL,
  `id_periodo_curso` int(11) DEFAULT NULL,
  `id_descuento` varchar(11) DEFAULT NULL,
  `fecha_inscripcion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `inscripcion`
--
DELIMITER $$
CREATE TRIGGER `a_update_cupos` AFTER INSERT ON `inscripcion` FOR EACH ROW BEGIN
    UPDATE periodo_curso
    SET cupos_ocupados = cupos_ocupados + 1
    WHERE id_periodo_curso = NEW.id_periodo_curso;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insignias`
--

CREATE TABLE `insignias` (
  `id_insignia` int(11) NOT NULL,
  `nombre` varchar(31) DEFAULT NULL,
  `descripcion` varchar(101) DEFAULT NULL,
  `puntos_premio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insignias_estudiantes`
--

CREATE TABLE `insignias_estudiantes` (
  `id_insignias_estudiantes` int(11) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `id_insignia` int(11) DEFAULT NULL,
  `puntos_premio` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material`
--

CREATE TABLE `material` (
  `id_material` int(11) NOT NULL,
  `id_tema` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL,
  `descripcion` varchar(1001) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modulo`
--

CREATE TABLE `modulo` (
  `id_modulo` int(11) NOT NULL,
  `id_periodo_curso` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodo_curso`
--

CREATE TABLE `periodo_curso` (
  `id_periodo_curso` int(11) NOT NULL,
  `id_curso` int(11) DEFAULT NULL,
  `id_maestro` int(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `cupos` int(11) DEFAULT NULL,
  `cupos_ocupados` int(11) DEFAULT NULL,
  `solicitudes_totales` int(11) DEFAULT NULL,
  `costo` int(11) DEFAULT NULL,
  `recaudado` int(11) DEFAULT NULL,
  `estado_periodo` varchar(21) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permiso`
--

CREATE TABLE `permiso` (
  `id_permiso` int(11) NOT NULL,
  `nombre_permiso` varchar(71) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permiso`
--

INSERT INTO `permiso` (`id_permiso`, `nombre_permiso`) VALUES
(1, 'DarBecas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntos`
--

CREATE TABLE `puntos` (
  `id_puntos` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `puntos_totales` decimal(10,2) DEFAULT NULL,
  `puntos_gastados` decimal(10,2) DEFAULT NULL,
  `saldo_actual` decimal(10,2) DEFAULT NULL,
  `rankingPoints` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ranking`
--

CREATE TABLE `ranking` (
  `ranking` varchar(30) NOT NULL,
  `nombre_ranking` varchar(31) DEFAULT NULL,
  `limite_superior` int(11) DEFAULT NULL,
  `limite_inferior` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ranking`
--

INSERT INTO `ranking` (`ranking`, `nombre_ranking`, `limite_superior`, `limite_inferior`) VALUES
('Bronce I', NULL, 3999, 3500),
('Bronce II', NULL, 3499, 3000),
('Bronce III', NULL, 2999, 2500),
('Bronce IV', NULL, 2499, 2000),
('Challenger', NULL, 9999999, 15000),
('Diamante I', NULL, 13999, 13500),
('Diamante II', NULL, 13499, 13000),
('Diamante III', NULL, 12999, 12500),
('Diamante IV', NULL, 12499, 12000),
('Esmeralda I', NULL, 11999, 11500),
('Esmeralda II', NULL, 11499, 11000),
('Esmeralda III', NULL, 10999, 10500),
('Esmeralda IV', NULL, 10499, 10000),
('Gran Maestro', NULL, 14999, 14500),
('Hierro I', NULL, 1999, 1500),
('Hierro II', NULL, 1499, 1000),
('Hierro III', NULL, 999, 500),
('Hierro IV', NULL, 499, 0),
('Maestro', NULL, 14499, 14000),
('Oro I', NULL, 7999, 7500),
('Oro II', NULL, 7499, 7000),
('Oro III', NULL, 6999, 6500),
('Oro IV', NULL, 6499, 6000),
('Plata I', NULL, 5999, 5500),
('Plata II', NULL, 5499, 5000),
('Plata III', NULL, 4999, 4500),
('Plata IV', NULL, 4499, 4000),
('Platino I', NULL, 9999, 9500),
('Platino II', NULL, 9499, 9000),
('Platino III', NULL, 8999, 8500),
('Platino IV', NULL, 8499, 8000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recompensa_canjeada`
--

CREATE TABLE `recompensa_canjeada` (
  `id_recompensa_canjeada` int(11) NOT NULL,
  `recompensa` varchar(11) NOT NULL,
  `id_estudiante` int(11) DEFAULT NULL,
  `fecha_recompensa` date DEFAULT NULL,
  `hora_recompensa` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `recompensa_canjeada`
--
DELIMITER $$
CREATE TRIGGER `a_resta_recompensa_canjeada` AFTER INSERT ON `recompensa_canjeada` FOR EACH ROW BEGIN
	DECLARE costo DECIMAL(10,2);
    IF LEFT(NEW.recompensa, 3) = 'RC-' THEN
    	SELECT costo_canje INTO costo
        FROM cosmetico
        WHERE id_cosmetico = NEW.recompensa;
	ELSEIF LEFT(NEW.recompensa, 3) = 'RD-' THEN
    	SELECT costo_canje INTO costo
        FROM descuento
        WHERE id_descuento = NEW.recompensa;
	END IF;
    IF costo IS NOT NULL THEN
    	UPDATE puntos
        SET
        	saldo_actual = saldo_actual - costo,
            puntos_gastados = puntos_gastados + costo
		WHERE id_user = NEW.id_estudiante;
     END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(31) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Maestro'),
(3, 'Estudiante');
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permiso`
--

CREATE TABLE `rol_permiso` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_usuario`
--

CREATE TABLE `rol_usuario` (
  `id_user` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_usuario`
--

INSERT INTO `rol_usuario` (`id_user`, `id_rol`) VALUES
(1, 1);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarea`
--

CREATE TABLE `tarea` (
  `id_tarea` int(11) NOT NULL,
  `id_modulo` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL,
  `descripcion` varchar(1001) DEFAULT NULL,
  `hora_emision` time DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL,
  `id_modulo` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_cosmetico`
--

CREATE TABLE `tipo_cosmetico` (
  `id_tipo_cosmetico` int(11) NOT NULL,
  `titulo` varchar(31) DEFAULT NULL,
  `descripcion` varchar(1001) DEFAULT NULL,
  `imagen` varchar(99) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_pago`
--

CREATE TABLE `tipo_pago` (
  `id_tipo_pago` int(11) NOT NULL,
  `tipo_pago` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_pago`
--

INSERT INTO `tipo_pago` (`id_tipo_pago`, `tipo_pago`) VALUES
(1, 'Debito'),
(2, 'Credito'),
(3, 'Qr'),
(4, 'Efectivo'),
(5, 'Binance');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_user` int(11) NOT NULL,
  `nombre` varchar(31) DEFAULT NULL,
  `apellido` varchar(31) DEFAULT NULL,
  `username` varchar(16) DEFAULT NULL,
  `contrasenna` varchar(31) NOT NULL,
  `ci` varchar(11) DEFAULT NULL,
  `telefono` varchar(16) DEFAULT NULL,
  `correo` varchar(101) DEFAULT NULL,
  `edad` varchar(4) DEFAULT NULL,
  `estado` varchar(11) NOT NULL DEFAULT 'Activo',
  `grado` varchar(31) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_user`, `nombre`, `apellido`, `username`, `contrasenna`, `ci`, `telefono`, `correo`, `edad`, `estado`, `grado`) VALUES
(1, 'David Eduardo', 'Chavez Totora', 'Arvi', '231222', '9513465', '67231718', 'virzuzz12345@gmail.com', '21', 'Activo', '');
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_archivos_adjuntos`
--

CREATE TABLE `xb_archivos_adjuntos` (
  `idBit_archivos_adjuntos` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_archivos_publicacion`
--

CREATE TABLE `xb_archivos_publicacion` (
  `idBit_archivos_publicacion` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_area`
--

CREATE TABLE `xb_area` (
  `idBit_area` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_aula`
--

CREATE TABLE `xb_aula` (
  `idBit_aula` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_beca`
--

CREATE TABLE `xb_beca` (
  `idBit_beca` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_categoria`
--

CREATE TABLE `xb_categoria` (
  `idBit_categoria` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_comentario`
--

CREATE TABLE `xb_comentario` (
  `idBit_comentario` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_cosmetico`
--

CREATE TABLE `xb_cosmetico` (
  `idBit_cosmetico` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_curso`
--

CREATE TABLE `xb_curso` (
  `idBit_curso` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_curso_estudiante`
--

CREATE TABLE `xb_curso_estudiante` (
  `idBit_curso_estudiante` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_curso_maestro`
--

CREATE TABLE `xb_curso_maestro` (
  `idBit_curso_maestro` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_datos_maestro`
--

CREATE TABLE `xb_datos_maestro` (
  `idBit_datos_maestro` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_descuento`
--

CREATE TABLE `xb_descuento` (
  `idBit_descuento` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_dia_horario`
--

CREATE TABLE `xb_dia_horario` (
  `idBit_dia_horario` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_entregas`
--

CREATE TABLE `xb_entregas` (
  `idBit_entregas` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_evaluacion`
--

CREATE TABLE `xb_evaluacion` (
  `idBit_evaluacion` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_grado`
--

CREATE TABLE `xb_grado` (
  `idBit_grado` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_horario`
--

CREATE TABLE `xb_horario` (
  `idBit_horario` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_inscripcion`
--

CREATE TABLE `xb_inscripcion` (
  `idBit_inscripcion` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_insignias`
--

CREATE TABLE `xb_insignias` (
  `idBit_insignias` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_insignias_estudiantes`
--

CREATE TABLE `xb_insignias_estudiantes` (
  `idBit_insignias_estudiante` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_material`
--

CREATE TABLE `xb_material` (
  `idBit_material` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_modulo`
--

CREATE TABLE `xb_modulo` (
  `idBit_modulo` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_periodo_curso`
--

CREATE TABLE `xb_periodo_curso` (
  `idBit_periodo_curso` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_permiso`
--

CREATE TABLE `xb_permiso` (
  `idBit_permiso` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_puntos`
--

CREATE TABLE `xb_puntos` (
  `idBit_puntos` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_ranking`
--

CREATE TABLE `xb_ranking` (
  `idBit_ranking` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_recompensa_canjeada`
--

CREATE TABLE `xb_recompensa_canjeada` (
  `idBit_recompensa_canjeada` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_rol`
--

CREATE TABLE `xb_rol` (
  `idBit_rol` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_rol_permiso`
--

CREATE TABLE `xb_rol_permiso` (
  `idBit_rol_permiso` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_rol_usuario`
--

CREATE TABLE `xb_rol_usuario` (
  `idBit_rol_usuario` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_tarea`
--

CREATE TABLE `xb_tarea` (
  `idBit_tarea` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_temas`
--

CREATE TABLE `xb_temas` (
  `idBit_temas` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_tipo_cosmetico`
--

CREATE TABLE `xb_tipo_cosmetico` (
  `idBit_tipo_cosmetico` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_tipo_pago`
--

CREATE TABLE `xb_tipo_pago` (
  `idBit_tipo_pago` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_usuario`
--

CREATE TABLE `xb_usuario` (
  `idBit_usuario` int(11) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `archivos_adjuntos`
--
ALTER TABLE `archivos_adjuntos`
  ADD PRIMARY KEY (`id_archivo`);

--
-- Indices de la tabla `archivos_publicacion`
--
ALTER TABLE `archivos_publicacion`
  ADD PRIMARY KEY (`id_archivo`,`id_publicacion`);

--
-- Indices de la tabla `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id_area`);

--
-- Indices de la tabla `aula`
--
ALTER TABLE `aula`
  ADD PRIMARY KEY (`id_aula`);

--
-- Indices de la tabla `beca`
--
ALTER TABLE `beca`
  ADD PRIMARY KEY (`id_beca`),
  ADD KEY `id_estudiante` (`id_estudiante`),
  ADD KEY `id_admin` (`id_admin`),
  ADD KEY `id_area` (`id_area`);

--
-- Indices de la tabla `bitacora_inscripcion_estudiante`
--
ALTER TABLE `bitacora_inscripcion_estudiante`
  ADD PRIMARY KEY (`id_bitInscripcionEstudiante`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id_comentario`);

--
-- Indices de la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  ADD PRIMARY KEY (`id_cosmetico`),
  ADD KEY `id_tipo_cosmetico` (`id_tipo_cosmetico`);

--
-- Indices de la tabla `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_area` (`id_area`),
  ADD KEY `id_grado` (`id_grado`);

--
-- Indices de la tabla `curso_estudiante`
--
ALTER TABLE `curso_estudiante`
  ADD PRIMARY KEY (`id_curso_estudiante`),
  ADD KEY `id_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `curso_maestro`
--
ALTER TABLE `curso_maestro`
  ADD PRIMARY KEY (`id_curso_maestro`),
  ADD KEY `id_maestro` (`id_maestro`),
  ADD KEY `id_periodo_curso` (`id_periodo_curso`);

--
-- Indices de la tabla `datos_maestro`
--
ALTER TABLE `datos_maestro`
  ADD PRIMARY KEY (`id_dato`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD PRIMARY KEY (`id_descuento`),
  ADD KEY `id_periodo_curso` (`id_periodo_curso`);

--
-- Indices de la tabla `dia_horario`
--
ALTER TABLE `dia_horario`
  ADD PRIMARY KEY (`id_dia_clase`),
  ADD KEY `id_aula` (`id_aula`);

--
-- Indices de la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD PRIMARY KEY (`id_entrega`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  ADD PRIMARY KEY (`id_evaluacion`),
  ADD KEY `id_modulo` (`id_modulo`);

--
-- Indices de la tabla `grado`
--
ALTER TABLE `grado`
  ADD PRIMARY KEY (`id_grado`);

--
-- Indices de la tabla `horario`
--
ALTER TABLE `horario`
  ADD PRIMARY KEY (`id_periodo_clase`,`id_dia_clase`),
  ADD KEY `id_dia_clase` (`id_dia_clase`);

--
-- Indices de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  ADD PRIMARY KEY (`id_inscripcion`),
  ADD KEY `id_tipo_pago` (`id_tipo_pago`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_periodo_curso` (`id_periodo_curso`),
  ADD KEY `id_descuento` (`id_descuento`);

--
-- Indices de la tabla `insignias`
--
ALTER TABLE `insignias`
  ADD PRIMARY KEY (`id_insignia`);

--
-- Indices de la tabla `insignias_estudiantes`
--
ALTER TABLE `insignias_estudiantes`
  ADD PRIMARY KEY (`id_insignias_estudiantes`),
  ADD KEY `id_estudiante` (`id_estudiante`),
  ADD KEY `id_insignia` (`id_insignia`);

--
-- Indices de la tabla `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id_material`),
  ADD KEY `id_tema` (`id_tema`);

--
-- Indices de la tabla `modulo`
--
ALTER TABLE `modulo`
  ADD PRIMARY KEY (`id_modulo`),
  ADD KEY `id_periodo_curso` (`id_periodo_curso`);

--
-- Indices de la tabla `periodo_curso`
--
ALTER TABLE `periodo_curso`
  ADD PRIMARY KEY (`id_periodo_curso`),
  ADD KEY `id_curso` (`id_curso`),
  ADD KEY `id_maestro` (`id_maestro`);

--
-- Indices de la tabla `permiso`
--
ALTER TABLE `permiso`
  ADD PRIMARY KEY (`id_permiso`);

--
-- Indices de la tabla `puntos`
--
ALTER TABLE `puntos`
  ADD PRIMARY KEY (`id_puntos`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `ranking`
--
ALTER TABLE `ranking`
  ADD PRIMARY KEY (`ranking`);

--
-- Indices de la tabla `recompensa_canjeada`
--
ALTER TABLE `recompensa_canjeada`
  ADD PRIMARY KEY (`id_recompensa_canjeada`),
  ADD KEY `id_estudiante` (`id_estudiante`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD PRIMARY KEY (`id_rol`,`id_permiso`),
  ADD KEY `id_permiso` (`id_permiso`);

--
-- Indices de la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD PRIMARY KEY (`id_user`,`id_rol`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `tarea`
--
ALTER TABLE `tarea`
  ADD PRIMARY KEY (`id_tarea`),
  ADD KEY `id_modulo` (`id_modulo`);

--
-- Indices de la tabla `temas`
--
ALTER TABLE `temas`
  ADD PRIMARY KEY (`id_tema`),
  ADD KEY `id_modulo` (`id_modulo`);

--
-- Indices de la tabla `tipo_cosmetico`
--
ALTER TABLE `tipo_cosmetico`
  ADD PRIMARY KEY (`id_tipo_cosmetico`);

--
-- Indices de la tabla `tipo_pago`
--
ALTER TABLE `tipo_pago`
  ADD PRIMARY KEY (`id_tipo_pago`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_user`);

--
-- Indices de la tabla `xb_archivos_adjuntos`
--
ALTER TABLE `xb_archivos_adjuntos`
  ADD PRIMARY KEY (`idBit_archivos_adjuntos`);

--
-- Indices de la tabla `xb_archivos_publicacion`
--
ALTER TABLE `xb_archivos_publicacion`
  ADD PRIMARY KEY (`idBit_archivos_publicacion`);

--
-- Indices de la tabla `xb_area`
--
ALTER TABLE `xb_area`
  ADD PRIMARY KEY (`idBit_area`);

--
-- Indices de la tabla `xb_aula`
--
ALTER TABLE `xb_aula`
  ADD PRIMARY KEY (`idBit_aula`);

--
-- Indices de la tabla `xb_beca`
--
ALTER TABLE `xb_beca`
  ADD PRIMARY KEY (`idBit_beca`);

--
-- Indices de la tabla `xb_categoria`
--
ALTER TABLE `xb_categoria`
  ADD PRIMARY KEY (`idBit_categoria`);

--
-- Indices de la tabla `xb_comentario`
--
ALTER TABLE `xb_comentario`
  ADD PRIMARY KEY (`idBit_comentario`);

--
-- Indices de la tabla `xb_cosmetico`
--
ALTER TABLE `xb_cosmetico`
  ADD PRIMARY KEY (`idBit_cosmetico`);

--
-- Indices de la tabla `xb_curso`
--
ALTER TABLE `xb_curso`
  ADD PRIMARY KEY (`idBit_curso`);

--
-- Indices de la tabla `xb_curso_estudiante`
--
ALTER TABLE `xb_curso_estudiante`
  ADD PRIMARY KEY (`idBit_curso_estudiante`);

--
-- Indices de la tabla `xb_curso_maestro`
--
ALTER TABLE `xb_curso_maestro`
  ADD PRIMARY KEY (`idBit_curso_maestro`);

--
-- Indices de la tabla `xb_datos_maestro`
--
ALTER TABLE `xb_datos_maestro`
  ADD PRIMARY KEY (`idBit_datos_maestro`);

--
-- Indices de la tabla `xb_descuento`
--
ALTER TABLE `xb_descuento`
  ADD PRIMARY KEY (`idBit_descuento`);

--
-- Indices de la tabla `xb_dia_horario`
--
ALTER TABLE `xb_dia_horario`
  ADD PRIMARY KEY (`idBit_dia_horario`);

--
-- Indices de la tabla `xb_entregas`
--
ALTER TABLE `xb_entregas`
  ADD PRIMARY KEY (`idBit_entregas`);

--
-- Indices de la tabla `xb_evaluacion`
--
ALTER TABLE `xb_evaluacion`
  ADD PRIMARY KEY (`idBit_evaluacion`);

--
-- Indices de la tabla `xb_grado`
--
ALTER TABLE `xb_grado`
  ADD PRIMARY KEY (`idBit_grado`);

--
-- Indices de la tabla `xb_horario`
--
ALTER TABLE `xb_horario`
  ADD PRIMARY KEY (`idBit_horario`);

--
-- Indices de la tabla `xb_inscripcion`
--
ALTER TABLE `xb_inscripcion`
  ADD PRIMARY KEY (`idBit_inscripcion`);

--
-- Indices de la tabla `xb_insignias`
--
ALTER TABLE `xb_insignias`
  ADD PRIMARY KEY (`idBit_insignias`);

--
-- Indices de la tabla `xb_insignias_estudiantes`
--
ALTER TABLE `xb_insignias_estudiantes`
  ADD PRIMARY KEY (`idBit_insignias_estudiante`);

--
-- Indices de la tabla `xb_material`
--
ALTER TABLE `xb_material`
  ADD PRIMARY KEY (`idBit_material`);

--
-- Indices de la tabla `xb_modulo`
--
ALTER TABLE `xb_modulo`
  ADD PRIMARY KEY (`idBit_modulo`);

--
-- Indices de la tabla `xb_periodo_curso`
--
ALTER TABLE `xb_periodo_curso`
  ADD PRIMARY KEY (`idBit_periodo_curso`);

--
-- Indices de la tabla `xb_permiso`
--
ALTER TABLE `xb_permiso`
  ADD PRIMARY KEY (`idBit_permiso`);

--
-- Indices de la tabla `xb_puntos`
--
ALTER TABLE `xb_puntos`
  ADD PRIMARY KEY (`idBit_puntos`);

--
-- Indices de la tabla `xb_ranking`
--
ALTER TABLE `xb_ranking`
  ADD PRIMARY KEY (`idBit_ranking`);

--
-- Indices de la tabla `xb_recompensa_canjeada`
--
ALTER TABLE `xb_recompensa_canjeada`
  ADD PRIMARY KEY (`idBit_recompensa_canjeada`);

--
-- Indices de la tabla `xb_rol`
--
ALTER TABLE `xb_rol`
  ADD PRIMARY KEY (`idBit_rol`);

--
-- Indices de la tabla `xb_rol_permiso`
--
ALTER TABLE `xb_rol_permiso`
  ADD PRIMARY KEY (`idBit_rol_permiso`);

--
-- Indices de la tabla `xb_rol_usuario`
--
ALTER TABLE `xb_rol_usuario`
  ADD PRIMARY KEY (`idBit_rol_usuario`);

--
-- Indices de la tabla `xb_tarea`
--
ALTER TABLE `xb_tarea`
  ADD PRIMARY KEY (`idBit_tarea`);

--
-- Indices de la tabla `xb_temas`
--
ALTER TABLE `xb_temas`
  ADD PRIMARY KEY (`idBit_temas`);

--
-- Indices de la tabla `xb_tipo_cosmetico`
--
ALTER TABLE `xb_tipo_cosmetico`
  ADD PRIMARY KEY (`idBit_tipo_cosmetico`);

--
-- Indices de la tabla `xb_tipo_pago`
--
ALTER TABLE `xb_tipo_pago`
  ADD PRIMARY KEY (`idBit_tipo_pago`);

--
-- Indices de la tabla `xb_usuario`
--
ALTER TABLE `xb_usuario`
  ADD PRIMARY KEY (`idBit_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `archivos_adjuntos`
--
ALTER TABLE `archivos_adjuntos`
  MODIFY `id_archivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `area`
--
ALTER TABLE `area`
  MODIFY `id_area` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `aula`
--
ALTER TABLE `aula`
  MODIFY `id_aula` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `beca`
--
ALTER TABLE `beca`
  MODIFY `id_beca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `bitacora_inscripcion_estudiante`
--
ALTER TABLE `bitacora_inscripcion_estudiante`
  MODIFY `id_bitInscripcionEstudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id_comentario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  MODIFY `id_cosmetico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `curso_estudiante`
--
ALTER TABLE `curso_estudiante`
  MODIFY `id_curso_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `curso_maestro`
--
ALTER TABLE `curso_maestro`
  MODIFY `id_curso_maestro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `datos_maestro`
--
ALTER TABLE `datos_maestro`
  MODIFY `id_dato` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `dia_horario`
--
ALTER TABLE `dia_horario`
  MODIFY `id_dia_clase` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `entregas`
--
ALTER TABLE `entregas`
  MODIFY `id_entrega` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  MODIFY `id_evaluacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `grado`
--
ALTER TABLE `grado`
  MODIFY `id_grado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  MODIFY `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `insignias`
--
ALTER TABLE `insignias`
  MODIFY `id_insignia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `insignias_estudiantes`
--
ALTER TABLE `insignias_estudiantes`
  MODIFY `id_insignias_estudiantes` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `modulo`
--
ALTER TABLE `modulo`
  MODIFY `id_modulo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `periodo_curso`
--
ALTER TABLE `periodo_curso`
  MODIFY `id_periodo_curso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `permiso`
--
ALTER TABLE `permiso`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `puntos`
--
ALTER TABLE `puntos`
  MODIFY `id_puntos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `recompensa_canjeada`
--
ALTER TABLE `recompensa_canjeada`
  MODIFY `id_recompensa_canjeada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `tarea`
--
ALTER TABLE `tarea`
  MODIFY `id_tarea` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `temas`
--
ALTER TABLE `temas`
  MODIFY `id_tema` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tipo_cosmetico`
--
ALTER TABLE `tipo_cosmetico`
  MODIFY `id_tipo_cosmetico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_pago`
--
ALTER TABLE `tipo_pago`
  MODIFY `id_tipo_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `xb_archivos_adjuntos`
--
ALTER TABLE `xb_archivos_adjuntos`
  MODIFY `idBit_archivos_adjuntos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_archivos_publicacion`
--
ALTER TABLE `xb_archivos_publicacion`
  MODIFY `idBit_archivos_publicacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_area`
--
ALTER TABLE `xb_area`
  MODIFY `idBit_area` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_aula`
--
ALTER TABLE `xb_aula`
  MODIFY `idBit_aula` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_beca`
--
ALTER TABLE `xb_beca`
  MODIFY `idBit_beca` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_categoria`
--
ALTER TABLE `xb_categoria`
  MODIFY `idBit_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_comentario`
--
ALTER TABLE `xb_comentario`
  MODIFY `idBit_comentario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_cosmetico`
--
ALTER TABLE `xb_cosmetico`
  MODIFY `idBit_cosmetico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_curso`
--
ALTER TABLE `xb_curso`
  MODIFY `idBit_curso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_curso_estudiante`
--
ALTER TABLE `xb_curso_estudiante`
  MODIFY `idBit_curso_estudiante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `xb_curso_maestro`
--
ALTER TABLE `xb_curso_maestro`
  MODIFY `idBit_curso_maestro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_datos_maestro`
--
ALTER TABLE `xb_datos_maestro`
  MODIFY `idBit_datos_maestro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_descuento`
--
ALTER TABLE `xb_descuento`
  MODIFY `idBit_descuento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_dia_horario`
--
ALTER TABLE `xb_dia_horario`
  MODIFY `idBit_dia_horario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `xb_entregas`
--
ALTER TABLE `xb_entregas`
  MODIFY `idBit_entregas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_evaluacion`
--
ALTER TABLE `xb_evaluacion`
  MODIFY `idBit_evaluacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_grado`
--
ALTER TABLE `xb_grado`
  MODIFY `idBit_grado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_horario`
--
ALTER TABLE `xb_horario`
  MODIFY `idBit_horario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_inscripcion`
--
ALTER TABLE `xb_inscripcion`
  MODIFY `idBit_inscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_insignias`
--
ALTER TABLE `xb_insignias`
  MODIFY `idBit_insignias` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_insignias_estudiantes`
--
ALTER TABLE `xb_insignias_estudiantes`
  MODIFY `idBit_insignias_estudiante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_material`
--
ALTER TABLE `xb_material`
  MODIFY `idBit_material` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_modulo`
--
ALTER TABLE `xb_modulo`
  MODIFY `idBit_modulo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_periodo_curso`
--
ALTER TABLE `xb_periodo_curso`
  MODIFY `idBit_periodo_curso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_permiso`
--
ALTER TABLE `xb_permiso`
  MODIFY `idBit_permiso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_puntos`
--
ALTER TABLE `xb_puntos`
  MODIFY `idBit_puntos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_ranking`
--
ALTER TABLE `xb_ranking`
  MODIFY `idBit_ranking` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_recompensa_canjeada`
--
ALTER TABLE `xb_recompensa_canjeada`
  MODIFY `idBit_recompensa_canjeada` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_rol`
--
ALTER TABLE `xb_rol`
  MODIFY `idBit_rol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_rol_permiso`
--
ALTER TABLE `xb_rol_permiso`
  MODIFY `idBit_rol_permiso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_rol_usuario`
--
ALTER TABLE `xb_rol_usuario`
  MODIFY `idBit_rol_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_tarea`
--
ALTER TABLE `xb_tarea`
  MODIFY `idBit_tarea` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_temas`
--
ALTER TABLE `xb_temas`
  MODIFY `idBit_temas` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_tipo_cosmetico`
--
ALTER TABLE `xb_tipo_cosmetico`
  MODIFY `idBit_tipo_cosmetico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_tipo_pago`
--
ALTER TABLE `xb_tipo_pago`
  MODIFY `idBit_tipo_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_usuario`
--
ALTER TABLE `xb_usuario`
  MODIFY `idBit_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `archivos_publicacion`
--
ALTER TABLE `archivos_publicacion`
  ADD CONSTRAINT `archivos_publicacion_ibfk_1` FOREIGN KEY (`id_archivo`) REFERENCES `archivos_adjuntos` (`id_archivo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `beca`
--
ALTER TABLE `beca`
  ADD CONSTRAINT `beca_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `beca_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `beca_ibfk_3` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  ADD CONSTRAINT `cosmetico_ibfk_1` FOREIGN KEY (`id_tipo_cosmetico`) REFERENCES `tipo_cosmetico` (`id_tipo_cosmetico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `curso`
--
ALTER TABLE `curso`
  ADD CONSTRAINT `curso_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `curso_ibfk_2` FOREIGN KEY (`id_area`) REFERENCES `area` (`id_area`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `curso_ibfk_3` FOREIGN KEY (`id_grado`) REFERENCES `grado` (`id_grado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `curso_estudiante`
--
ALTER TABLE `curso_estudiante`
  ADD CONSTRAINT `curso_estudiante_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `curso_maestro`
--
ALTER TABLE `curso_maestro`
  ADD CONSTRAINT `curso_maestro_ibfk_1` FOREIGN KEY (`id_maestro`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `curso_maestro_ibfk_2` FOREIGN KEY (`id_periodo_curso`) REFERENCES `periodo_curso` (`id_periodo_curso`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `datos_maestro`
--
ALTER TABLE `datos_maestro`
  ADD CONSTRAINT `datos_maestro_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD CONSTRAINT `descuento_ibfk_1` FOREIGN KEY (`id_periodo_curso`) REFERENCES `periodo_curso` (`id_periodo_curso`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  ADD CONSTRAINT `evaluacion_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `horario`
--
ALTER TABLE `horario`
  ADD CONSTRAINT `horario_ibfk_1` FOREIGN KEY (`id_periodo_clase`) REFERENCES `periodo_curso` (`id_periodo_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `horario_ibfk_2` FOREIGN KEY (`id_dia_clase`) REFERENCES `dia_horario` (`id_dia_clase`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `inscripcion`
--
ALTER TABLE `inscripcion`
  ADD CONSTRAINT `inscripcion_ibfk_1` FOREIGN KEY (`id_tipo_pago`) REFERENCES `tipo_pago` (`id_tipo_pago`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripcion_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `inscripcion_ibfk_3` FOREIGN KEY (`id_periodo_curso`) REFERENCES `periodo_curso` (`id_periodo_curso`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `insignias_estudiantes`
--
ALTER TABLE `insignias_estudiantes`
  ADD CONSTRAINT `insignias_estudiantes_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `insignias_estudiantes_ibfk_2` FOREIGN KEY (`id_insignia`) REFERENCES `insignias` (`id_insignia`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `material`
--
ALTER TABLE `material`
  ADD CONSTRAINT `material_ibfk_1` FOREIGN KEY (`id_tema`) REFERENCES `temas` (`id_tema`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `modulo`
--
ALTER TABLE `modulo`
  ADD CONSTRAINT `modulo_ibfk_1` FOREIGN KEY (`id_periodo_curso`) REFERENCES `periodo_curso` (`id_periodo_curso`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `periodo_curso`
--
ALTER TABLE `periodo_curso`
  ADD CONSTRAINT `periodo_curso_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `periodo_curso_ibfk_2` FOREIGN KEY (`id_maestro`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `puntos`
--
ALTER TABLE `puntos`
  ADD CONSTRAINT `puntos_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `recompensa_canjeada`
--
ALTER TABLE `recompensa_canjeada`
  ADD CONSTRAINT `recompensa_canjeada_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rol_usuario`
--
ALTER TABLE `rol_usuario`
  ADD CONSTRAINT `rol_usuario_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `usuario` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rol_usuario_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tarea`
--
ALTER TABLE `tarea`
  ADD CONSTRAINT `tarea_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `temas`
--
ALTER TABLE `temas`
  ADD CONSTRAINT `temas_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE ON UPDATE CASCADE;

DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `evento_verificar_clase` ON SCHEDULE EVERY 1 MINUTE STARTS '2025-12-02 17:51:09' ON COMPLETION NOT PRESERVE ENABLE DO CALL estado_clase_cont()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
