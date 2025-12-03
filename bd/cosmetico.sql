-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 20:05:05
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
-- Estructura de tabla para la tabla `cosmetico`
--

CREATE TABLE `cosmetico` (
  `id_cosmetico` int(11) NOT NULL,
  `id_tipo_cosmetico` int(11) DEFAULT NULL,
  `costo_canje` int(11) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `valor` varchar(50) DEFAULT NULL,
  `imagen` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cosmetico`
--

INSERT INTO `cosmetico` (`id_cosmetico`, `id_tipo_cosmetico`, `costo_canje`, `nombre`, `valor`, `imagen`) VALUES
(2, 1, 100, 'Noche', 'theme-dark', 'moon.png'),
(3, 1, 150, 'Océano', 'theme-ocean', 'water.png'),
(4, 1, 200, 'Bosque', 'theme-forest', 'leaf.png'),
(5, 1, 500, 'Dorado', 'theme-gold', 'gold.png');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  ADD PRIMARY KEY (`id_cosmetico`),
  ADD KEY `id_tipo_cosmetico` (`id_tipo_cosmetico`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  MODIFY `id_cosmetico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cosmetico`
--
ALTER TABLE `cosmetico`
  ADD CONSTRAINT `cosmetico_ibfk_1` FOREIGN KEY (`id_tipo_cosmetico`) REFERENCES `tipo_cosmetico` (`id_tipo_cosmetico`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
