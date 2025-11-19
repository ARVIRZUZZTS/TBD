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
