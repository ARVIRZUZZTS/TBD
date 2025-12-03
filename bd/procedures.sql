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


DELIMITER $$
--
-- Eventos
--
CREATE DEFINER=`root`@`localhost` EVENT `evento_verificar_clase` ON SCHEDULE EVERY 1 MINUTE STARTS '2025-12-02 17:51:09' ON COMPLETION NOT PRESERVE ENABLE DO CALL estado_clase_cont()$$

DELIMITER ;
COMMIT;