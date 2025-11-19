-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-11-2025 a las 21:45:58
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
-- Volcado de datos para la tabla `archivos_adjuntos`
--

INSERT INTO `archivos_adjuntos` (`id_archivo`, `titulo`, `tipo`, `ruta_archivo`, `fecha_subida`) VALUES
(1, 'Captura de pantalla 2025-11-08 022931.png', 'image/png', 'uploads/evaluaciones/6914e23ec513c_1762976318.png', '2025-11-12 15:38:38');

--
-- Disparadores `archivos_adjuntos`
--
DELIMITER $$
CREATE TRIGGER `tr_DEL_archivos_adjuntos` AFTER DELETE ON `archivos_adjuntos` FOR EACH ROW BEGIN
  INSERT INTO xb_DEL_archivos_adjuntos (accion, fecha)
  VALUES ('DELETE', NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_IN_archivos_adjuntos` AFTER INSERT ON `archivos_adjuntos` FOR EACH ROW BEGIN
  INSERT INTO xb_IN_archivos_adjuntos (accion, fecha)
  VALUES ('INSERT', NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_UP_archivos_adjuntos` AFTER UPDATE ON `archivos_adjuntos` FOR EACH ROW BEGIN
  INSERT INTO xb_UP_archivos_adjuntos (accion, antes, despues, fecha)
  VALUES (
    'UPDATE',
    CONCAT(
      'id_archivo=', OLD.id_archivo, ', ',
      'titulo=', OLD.titulo, ', ',
      'tipo=', OLD.tipo, ', ',
      'ruta_archivo=', OLD.ruta_archivo, ', ',
      'fecha_subida=', OLD.fecha_subida
    ),
    CONCAT(
      'id_archivo=', NEW.id_archivo, ', ',
      'titulo=', NEW.titulo, ', ',
      'tipo=', NEW.tipo, ', ',
      'ruta_archivo=', NEW.ruta_archivo, ', ',
      'fecha_subida=', NEW.fecha_subida
    ),
    NOW()
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos_publicacion`
--

CREATE TABLE `archivos_publicacion` (
  `id_archivo` int(11) NOT NULL,
  `id_publicacion` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `archivos_publicacion`
--

INSERT INTO `archivos_publicacion` (`id_archivo`, `id_publicacion`) VALUES
(1, 2);

--
-- Disparadores `archivos_publicacion`
--
DELIMITER $$
CREATE TRIGGER `tr_DEL_archivos_publicacion` AFTER DELETE ON `archivos_publicacion` FOR EACH ROW BEGIN
  INSERT INTO xb_DEL_archivos_publicacion (accion, fecha)
  VALUES ('DELETE', NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_IN_archivos_publicacion` AFTER INSERT ON `archivos_publicacion` FOR EACH ROW BEGIN
  INSERT INTO xb_IN_archivos_publicacion (accion, fecha)
  VALUES ('INSERT', NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_UP_archivos_publicacion` AFTER UPDATE ON `archivos_publicacion` FOR EACH ROW BEGIN
  INSERT INTO xb_UP_archivos_publicacion (accion, antes, despues, fecha)
  VALUES (
    'UPDATE',
    CONCAT(
      'id_archivo=', OLD.id_archivo, ', ',
      'id_publicacion=', OLD.id_publicacion
    ),
    CONCAT(
      'id_archivo=', NEW.id_archivo, ', ',
      'id_publicacion=', NEW.id_publicacion
    ),
    NOW()
  );
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aula`
--

CREATE TABLE `aula` (
  `id_aula` int(11) NOT NULL,
  `capacidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Volcado de datos para la tabla `beca`
--

INSERT INTO `beca` (`id_beca`, `id_estudiante`, `id_admin`, `id_area`, `porcentaje`, `estado_beca`, `fecha_inicio`, `fecha_fin`) VALUES
(2, 29, 1, 1, 20, 'Pendiente', '2025-10-01', '2025-11-08'),
(3, 33, 1, 1, 70, 'Pendiente', '2025-11-06', '2025-11-13'),
(4, 27, 1, 1, 70, 'Aceptada', '2025-11-06', '2026-01-01'),
(5, 33, 1, 6, 80, 'Pendiente', '2025-10-29', '2025-11-29');

--
-- Disparadores `beca`
--
DELIMITER $$
CREATE TRIGGER `trg_validar_fechas_beca` BEFORE INSERT ON `beca` FOR EACH ROW BEGIN
    IF NEW.fecha_fin < NEW.fecha_inicio THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
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

--
-- Volcado de datos para la tabla `bitacora_inscripcion_estudiante`
--

INSERT INTO `bitacora_inscripcion_estudiante` (`id_bitInscripcionEstudiante`, `accion`, `fecha`, `descripcion`) VALUES
(1, 'INSERT', '2025-11-11 23:15:44', NULL),
(2, 'INSERT', '2025-11-11 23:16:51', NULL),
(3, 'INSERT', '2025-11-11 23:17:54', NULL),
(4, 'INSERT', '2025-11-12 12:12:16', NULL),
(5, 'INSERT', '2025-11-12 12:20:32', NULL),
(6, 'INSERT', '2025-11-12 12:24:06', '8 - 3 : Est: 31, Costo: 0.00 $, Descuento: 0.00%, TOTAL: 0.00 $'),
(7, 'INSERT', '2025-11-12 12:56:57', '9 - 2 : Est: 31, Costo: 0.00 $, Descuento: 0.00%, TOTAL: 0.00 $'),
(8, 'INSERT', '2025-11-12 13:18:21', 'C: 8 - PC: 3 : Est: 29, Costo: 10.00 $, Descuento: 0.00%, TOTAL: 10.00 $'),
(9, 'INSERT', '2025-11-12 13:22:46', 'C: 9 - PC: 2 : Est: 29, Costo: 20.00 $, Descuento: 50.00%, TOTAL: 10.00 $'),
(10, 'INSERT', '2025-11-12 15:51:40', 'C: 9 - PC: 8 : Est: 27, Costo: 0.00 $, Descuento: 0.00%, TOTAL: 0.00 $'),
(11, 'INSERT', '2025-11-19 16:10:56', 'C: 11 - PC: 9 : Est: 33, Costo: 10.00 $, Descuento: 0.00%, TOTAL: 10.00 $');

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

CREATE TABLE `comentario` (
  `id_comentario` int(11) NOT NULL,
  `id_publicacion` int(11) DEFAULT NULL,
  `mensaje` varchar(1001) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Volcado de datos para la tabla `curso`
--

INSERT INTO `curso` (`id_curso`, `id_categoria`, `id_area`, `id_grado`, `duracion`, `titulo`, `modalidad`, `inicio_gestion`, `fin_gestion`) VALUES
(7, 3, 1, 5, 120, 'Algebra II', 'V', '2025-10-15', '2025-11-09'),
(8, 4, 1, 6, 140, 'Calculo II', 'V', '2025-10-02', '2025-12-13'),
(9, 4, 5, 6, 120, 'Curso Python', 'V', '2025-11-15', '2026-02-21'),
(10, 4, 5, 1, 300, 'Suma', 'V', '2025-11-14', '2026-01-02'),
(11, 4, 5, 6, 100, 'JAVA avanzado', 'V', '2025-06-04', '2025-08-23');

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
-- Volcado de datos para la tabla `curso_estudiante`
--

INSERT INTO `curso_estudiante` (`id_curso_estudiante`, `id_estudiante`, `id_periodo_curso`, `estado`, `nota`, `asistencia`, `deskPoints`, `rankingPoints`) VALUES
(1, 33, 3, 'Inscrito', 53, 0, 0, 0),
(2, 33, 3, 'Inscrito', 99, 0, 0, 0),
(3, 27, 3, 'Inscrito', 0, 0, 0, 0),
(4, 27, 2, 'Inscrito', 0, 0, 0, 0),
(5, 33, 2, 'Inscrito', 0, 0, 0, 0),
(6, 32, 3, 'Inscrito', 0, 0, 0, 0),
(7, 32, 2, 'Inscrito', 0, 0, 0, 0),
(8, 31, 3, 'Inscrito', 0, 0, 0, 0),
(9, 31, 2, 'Inscrito', 0, 0, 0, 0),
(10, 29, 3, 'Inscrito', 0, 0, 0, 0),
(11, 29, 2, 'Inscrito', 0, 0, 0, 0),
(12, 27, 8, 'Inscrito', 0, 0, 0, 0),
(13, 33, 9, 'Aprobado', 80, 8, 30, 104);

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
-- Volcado de datos para la tabla `datos_maestro`
--

INSERT INTO `datos_maestro` (`id_dato`, `id_user`, `titulo`, `sueldo`) VALUES
(1, 24, 'ing informatica', 70),
(2, 25, 'ING ELECTRONICA', 70),
(3, 26, 'fasd', 3);

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
-- Volcado de datos para la tabla `descuento`
--

INSERT INTO `descuento` (`id_descuento`, `id_periodo_curso`, `costo_canje`, `fecha_fin`, `porcentaje_descuento`) VALUES
('RD-1', 2, 500, '2025-12-20', 40),
('RD-2', 3, 5, '2026-01-29', 20),
('RD-3', 2, 5, '2025-12-20', 50);

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas`
--

CREATE TABLE `entregas` (
  `id_entrega` int(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `nota` decimal(10,2) DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entregas`
--

INSERT INTO `entregas` (`id_entrega`, `id_user`, `nota`, `hora_entrega`, `fecha_entrega`) VALUES
(1, 27, 80.00, '15:00:00', '2025-12-23'),
(2, 33, 60.00, '18:00:00', '2025-12-23'),
(3, 33, 100.00, '18:00:00', '2025-12-23');

--
-- Disparadores `entregas`
--
DELIMITER $$
CREATE TRIGGER `actualizar_puntos_nota` AFTER UPDATE ON `entregas` FOR EACH ROW BEGIN
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

--
-- Volcado de datos para la tabla `evaluacion`
--

INSERT INTO `evaluacion` (`id_evaluacion`, `id_modulo`, `titulo`, `descripcion`, `hora_emision`, `fecha_emision`, `hora_inicio`, `fecha_inicio`, `hora_entrega`, `fecha_entrega`, `deskPoints`) VALUES
(1, 1, 'PP', 'dafdjafjasdklfjaskl', '15:57:00', '2025-11-08', '03:59:00', '2025-10-28', '19:02:00', '2025-11-08', 100),
(2, 4, 'aga', 'fasdf', '15:38:00', '2025-11-12', '16:38:00', '2025-11-28', '17:40:00', '2026-01-29', 50);

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
-- Volcado de datos para la tabla `inscripcion`
--

INSERT INTO `inscripcion` (`id_inscripcion`, `id_tipo_pago`, `id_user`, `id_periodo_curso`, `id_descuento`, `fecha_inscripcion`) VALUES
(1, 1, 32, 3, NULL, '2025-11-12 12:12:16'),
(2, 1, 32, 2, NULL, '2025-11-12 12:20:32'),
(3, 1, 31, 3, NULL, '2025-11-12 12:24:06'),
(4, 1, 31, 2, NULL, '2025-11-12 12:56:57'),
(5, 1, 29, 3, NULL, '2025-11-12 13:18:21'),
(6, 1, 29, 2, NULL, '2025-11-12 13:22:46'),
(7, 1, 27, 8, NULL, '2025-11-12 15:51:40'),
(8, 1, 33, 9, NULL, '2025-11-19 16:10:56');

--
-- Disparadores `inscripcion`
--
DELIMITER $$
CREATE TRIGGER `trg_update_cupos` AFTER INSERT ON `inscripcion` FOR EACH ROW BEGIN
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

--
-- Volcado de datos para la tabla `modulo`
--

INSERT INTO `modulo` (`id_modulo`, `id_periodo_curso`, `titulo`, `orden`) VALUES
(1, 1, 'Kushew modi', 1),
(2, 1, 'shale', 2),
(3, 1, 'mariamod', 3),
(4, 2, 'ga', 1);

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

--
-- Volcado de datos para la tabla `periodo_curso`
--

INSERT INTO `periodo_curso` (`id_periodo_curso`, `id_curso`, `id_maestro`, `fecha_inicio`, `fecha_fin`, `cupos`, `cupos_ocupados`, `solicitudes_totales`, `costo`, `recaudado`, `estado_periodo`) VALUES
(1, 7, 2, '0000-00-00', '0000-00-00', 0, 0, 0, 0, 0, 'Pendiente'),
(2, 9, 3, '2025-11-20', '2025-12-20', 50, 9, 3, 20, 60, 'Inscripciones'),
(3, 8, 25, '2025-11-19', '2026-01-29', 70, 16, 10, 10, 100, 'Inscripciones'),
(4, 10, 2, '0000-00-00', '0000-00-00', 0, 0, 0, 0, 0, 'Pendiente'),
(5, 8, 25, '0000-00-00', '0000-00-00', 0, 0, 0, 0, 0, 'Pendiente'),
(6, 10, 3, '2025-12-13', '2026-02-04', 50, 0, 0, 0, 0, 'Inscripciones'),
(7, 7, 3, '2025-11-12', '2025-11-27', 30, 0, 0, 0, 0, 'Inscripciones'),
(8, 9, 3, '2025-11-12', '2025-11-28', 500, 2, 0, 0, 0, 'Inscripciones'),
(9, 11, 2, '2025-06-05', '2025-10-22', 100, 91, 89, 10, 890, 'Finalizado');

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

--
-- Volcado de datos para la tabla `puntos`
--

INSERT INTO `puntos` (`id_puntos`, `id_user`, `puntos_totales`, `puntos_gastados`, `saldo_actual`, `rankingPoints`) VALUES
(1, 27, 24.00, 10.00, 14.00, 100),
(2, 28, 0.00, 0.00, 0.00, 2584),
(3, 29, 0.00, 5.00, -5.00, 8192),
(4, 30, 30.00, 5.00, 25.00, 0),
(5, 31, 0.00, 0.00, 0.00, 0),
(6, 32, 0.00, 0.00, 0.00, 0),
(7, 33, 48.00, 0.00, 48.00, 160);

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
-- Volcado de datos para la tabla `recompensa_canjeada`
--

INSERT INTO `recompensa_canjeada` (`id_recompensa_canjeada`, `recompensa`, `id_estudiante`, `fecha_recompensa`, `hora_recompensa`) VALUES
(2, 'RD-2', 30, '2025-11-11', '17:09:00'),
(3, 'RD-3', 29, '2025-11-12', '12:22:00'),
(4, 'RD-2', 27, '2025-11-12', '15:45:15'),
(5, 'RD-3', 27, '2025-11-12', '15:46:18');

--
-- Disparadores `recompensa_canjeada`
--
DELIMITER $$
CREATE TRIGGER `resta_recompensa_canjeada` AFTER INSERT ON `recompensa_canjeada` FOR EACH ROW BEGIN
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
(3, 'Estudiante'),
(11, 'Contador'),
(12, 'Estadista'),
(13, 'Conserje'),
(18, 'Becario');

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
(1, 1),
(2, 2),
(3, 2),
(24, 2),
(25, 2),
(27, 3),
(28, 3),
(29, 3),
(30, 3),
(31, 3),
(32, 3),
(33, 3);

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

--
-- Volcado de datos para la tabla `tarea`
--

INSERT INTO `tarea` (`id_tarea`, `id_modulo`, `titulo`, `descripcion`, `hora_emision`, `fecha_emision`, `hora_entrega`, `fecha_entrega`) VALUES
(1, 1, 'tar_mod _oficioanl', 'kljklba8hgiohnwkr3', '16:02:00', '2025-10-31', '18:01:00', '2025-11-06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temas`
--

CREATE TABLE `temas` (
  `id_tema` int(11) NOT NULL,
  `id_modulo` int(11) DEFAULT NULL,
  `titulo` varchar(51) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `temas`
--

INSERT INTO `temas` (`id_tema`, `id_modulo`, `titulo`) VALUES
(1, 1, 'Cumbia'),
(2, 1, 'aa'),
(3, 1, 'tar_mod'),
(4, 3, 'algebra');

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
(1, 'David Eduardo', 'Chavez Totora', 'Arvi', '231222', '9513465', '67231718', 'virzuzz12345@gmail.com', '21', 'Activo', ''),
(2, 'Maria', 'Santos', 'Maria', '231222', '9518434', '67789790', 'mariasantos@gmail.com', '20', 'Activo', ''),
(3, 'Cesar', 'Ochoa', 'Cesi', '231222', '111111', '1234', 'cesal@gmail.com', '23', 'Activo', ''),
(24, 'sergio', 'maldonado', 'sergi', '231222', '8231838', '8237813', 'sergi@gmaril.com', '21', 'Activo', ''),
(25, 'JUAN', 'MORALES', 'JUAN', '231222', '3237283', '87663636', 'JUAN@GMAIL.COM', '23', 'Activo', ''),
(26, 'a', 'a', 'a', '23', '23', 'fas', 'fas@gmail.com', '21', 'Activo', ''),
(27, 'est', 'est', 'est', '231222', '1234567', '1234567', 'est@gmail.com', '21', 'Activo', '6'),
(28, 'juan', 'juan', 'juan', '231222', '12938481', '38473838', 'juan@gmail.com', '23', 'Activo', ''),
(29, 'david eduardo', 'chavez totora', 'arvirzuzzts', '231222', '9613293', '8342718', 'david@gmail.com', '34', 'Activo', '6'),
(30, 'andres', 'mendoza', 'dalala', '231222', '9238848', '367781822', 'a@g.com', '22', 'Activo', '4'),
(31, 'prueba1', 'pruebaApellido', 'prueba1', '231222', '85382900', '38218389', 'g@3.com', '53', 'Activo', '6'),
(32, 'abdul', 'fjdaklj', 'abduli', '231222', '2231533125', '25463635', '8@2f.com', '42', 'Activo', '6'),
(33, 'ema', 'mejia', 'ema', 'ema123', '78945363', '74673975', 'emamejia@gamil.com', '19', 'Activo', '6');

--
-- Disparadores `usuario`
--
DELIMITER $$
CREATE TRIGGER `trg_backup_usuario` BEFORE DELETE ON `usuario` FOR EACH ROW BEGIN
    INSERT INTO usuarios_backup
    VALUES (
        OLD.id_user, OLD.nombre, OLD.apellido, OLD.username, OLD.contrasenna,
        OLD.ci, OLD.telefono, OLD.correo, OLD.edad, OLD.estado
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_delete_maestro_data` AFTER DELETE ON `usuario` FOR EACH ROW BEGIN
    -- Eliminar registros relacionados en ROL_USUARIO
    DELETE FROM ROL_USUARIO WHERE id_user = OLD.id_user;

    -- Eliminar registros relacionados en DATOS_MAESTRO
    DELETE FROM DATOS_MAESTRO WHERE id_user = OLD.id_user;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_backup`
--

CREATE TABLE `usuarios_backup` (
  `id_user` int(11) NOT NULL,
  `nombre` varchar(31) DEFAULT NULL,
  `apellido` varchar(31) DEFAULT NULL,
  `username` varchar(16) DEFAULT NULL,
  `contrasenna` varchar(31) NOT NULL,
  `ci` varchar(11) DEFAULT NULL,
  `telefono` varchar(16) DEFAULT NULL,
  `correo` varchar(101) DEFAULT NULL,
  `edad` varchar(4) DEFAULT NULL,
  `estado` varchar(11) NOT NULL DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_del_archivos_adjuntos`
--

CREATE TABLE `xb_del_archivos_adjuntos` (
  `idxb_archivos_adjuntos` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_del_archivos_publicacion`
--

CREATE TABLE `xb_del_archivos_publicacion` (
  `idxb_archivos_publicacion` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_in_archivos_adjuntos`
--

CREATE TABLE `xb_in_archivos_adjuntos` (
  `idxb_archivos_adjuntos` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `xb_in_archivos_adjuntos`
--

INSERT INTO `xb_in_archivos_adjuntos` (`idxb_archivos_adjuntos`, `accion`, `fecha`) VALUES
(1, 'INSERT', '2025-11-12 15:38:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_in_archivos_publicacion`
--

CREATE TABLE `xb_in_archivos_publicacion` (
  `idxb_archivos_publicacion` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `xb_in_archivos_publicacion`
--

INSERT INTO `xb_in_archivos_publicacion` (`idxb_archivos_publicacion`, `accion`, `fecha`) VALUES
(1, 'INSERT', '2025-11-12 15:38:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_up_archivos_adjuntos`
--

CREATE TABLE `xb_up_archivos_adjuntos` (
  `idxb_archivos_adjuntos` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `antes` text DEFAULT NULL,
  `despues` text DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `xb_up_archivos_publicacion`
--

CREATE TABLE `xb_up_archivos_publicacion` (
  `idxb_archivos_publicacion` int(11) NOT NULL,
  `accion` varchar(10) DEFAULT NULL,
  `antes` text DEFAULT NULL,
  `despues` text DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
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
-- Indices de la tabla `usuarios_backup`
--
ALTER TABLE `usuarios_backup`
  ADD PRIMARY KEY (`id_user`);

--
-- Indices de la tabla `xb_del_archivos_adjuntos`
--
ALTER TABLE `xb_del_archivos_adjuntos`
  ADD PRIMARY KEY (`idxb_archivos_adjuntos`);

--
-- Indices de la tabla `xb_del_archivos_publicacion`
--
ALTER TABLE `xb_del_archivos_publicacion`
  ADD PRIMARY KEY (`idxb_archivos_publicacion`);

--
-- Indices de la tabla `xb_in_archivos_adjuntos`
--
ALTER TABLE `xb_in_archivos_adjuntos`
  ADD PRIMARY KEY (`idxb_archivos_adjuntos`);

--
-- Indices de la tabla `xb_in_archivos_publicacion`
--
ALTER TABLE `xb_in_archivos_publicacion`
  ADD PRIMARY KEY (`idxb_archivos_publicacion`);

--
-- Indices de la tabla `xb_up_archivos_adjuntos`
--
ALTER TABLE `xb_up_archivos_adjuntos`
  ADD PRIMARY KEY (`idxb_archivos_adjuntos`);

--
-- Indices de la tabla `xb_up_archivos_publicacion`
--
ALTER TABLE `xb_up_archivos_publicacion`
  ADD PRIMARY KEY (`idxb_archivos_publicacion`);

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
  MODIFY `id_dia_clase` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `entregas`
--
ALTER TABLE `entregas`
  MODIFY `id_entrega` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `evaluacion`
--
ALTER TABLE `evaluacion`
  MODIFY `id_evaluacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id_recompensa_canjeada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- AUTO_INCREMENT de la tabla `usuarios_backup`
--
ALTER TABLE `usuarios_backup`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_del_archivos_adjuntos`
--
ALTER TABLE `xb_del_archivos_adjuntos`
  MODIFY `idxb_archivos_adjuntos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_del_archivos_publicacion`
--
ALTER TABLE `xb_del_archivos_publicacion`
  MODIFY `idxb_archivos_publicacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_in_archivos_adjuntos`
--
ALTER TABLE `xb_in_archivos_adjuntos`
  MODIFY `idxb_archivos_adjuntos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `xb_in_archivos_publicacion`
--
ALTER TABLE `xb_in_archivos_publicacion`
  MODIFY `idxb_archivos_publicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `xb_up_archivos_adjuntos`
--
ALTER TABLE `xb_up_archivos_adjuntos`
  MODIFY `idxb_archivos_adjuntos` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `xb_up_archivos_publicacion`
--
ALTER TABLE `xb_up_archivos_publicacion`
  MODIFY `idxb_archivos_publicacion` int(11) NOT NULL AUTO_INCREMENT;

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
-- Filtros para la tabla `dia_horario`
--
ALTER TABLE `dia_horario`
  ADD CONSTRAINT `dia_horario_ibfk_1` FOREIGN KEY (`id_aula`) REFERENCES `aula` (`id_aula`) ON DELETE CASCADE ON UPDATE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
