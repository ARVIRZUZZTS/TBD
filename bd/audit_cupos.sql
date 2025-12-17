-- Audit table and trigger to log changes to periodo_curso.cupos_ocupados
-- Run this SQL in your MySQL server to enable auditing:

CREATE TABLE IF NOT EXISTS audit_periodo_curso_cupos (
    id_audit INT AUTO_INCREMENT PRIMARY KEY,
    id_periodo_curso INT NOT NULL,
    old_cupos_ocupados INT DEFAULT NULL,
    new_cupos_ocupados INT DEFAULT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(128) DEFAULT NULL,
    note TEXT DEFAULT NULL
);

DELIMITER $$
CREATE TRIGGER tr_periodo_curso_cupos_up AFTER UPDATE ON periodo_curso
FOR EACH ROW
BEGIN
    IF OLD.cupos_ocupados <> NEW.cupos_ocupados THEN
        INSERT INTO audit_periodo_curso_cupos (id_periodo_curso, old_cupos_ocupados, new_cupos_ocupados, changed_at, changed_by, note)
        VALUES (NEW.id_periodo_curso, OLD.cupos_ocupados, NEW.cupos_ocupados, NOW(), USER(), CONCAT('Trigger detected change on periodo_curso: ', NEW.id_periodo_curso));
    END IF;
END
$$
DELIMITER ;

-- After running, audit_periodo_curso_cupos will contain a record every time cupos_ocupados changes
