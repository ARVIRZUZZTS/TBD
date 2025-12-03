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
-- Estructura de tabla para la tabla `archivos_publicacion`
--

CREATE TABLE `archivos_publicacion` (
  `id_archivo` int(11) NOT NULL,
  `id_publicacion` varchar(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id_publicacion` varchar(11) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `nota` decimal(10,2) DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `fecha_entrega` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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