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