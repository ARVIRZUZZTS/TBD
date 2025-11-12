estudianteRegistrar.php
//corregir grado no da xd
maestroNew.php
//modificar para que cada rol que no es maestro estudiante ni admin tenga los table:datos_maestro <- no se para que es esto -chamo
administrador.js
163: // img guardar y cancelar
119: //img en editar y eliminar

hay que agregar las funcionalidades de la lectura de la bd a la parte de estudiantes 

CORRER :TBD/php/test/crear_areas.php


maestro.js 
// incluir el nomnbre dinamicamente del maestro en lugar de Juan Perez
// cambiar el uso de getParams a localStorageadministrador linea 1072 falta la ruta para guardar el maestro al curso
// falta añadir funcionalidad al boton editar para que se pueda editar el titulo de los contenidos del curso
// falta añadir materiales (pdf, powerpoints) para subir a temas y tambien para subir a evaluaciones y tareas
--Arvi-NOtes
-añadir en fecha emision y hora emision automaticamente no se puede mover
-puntos es una funcion de f(nig)=nota*0.3

administrador linea 1072 falta la ruta para guardar el maestro al curso

//SQL
modificar USUARIO añadiendo Grado
modificar MATERIAL con fecha emision y hora emision 

corregir vista admin 
corregir desplegable cursos // Sergio

entre gestiones
1 semana despues del now()

urgente-----------------------------------agregar rol a lista de trabajadores
--Cambio necesario a decimal para aplicar la formula

TRIGGERS ACTIVOS (de la imagen)
    - I,II actualizacion automaticamente de puntos canje y rankingPoints
        - en el php solo seria colocar en entrega el update de la nota desde el maestro con el id_estudiante y el nuevo valor de la nota que cambiara el 0.00
        - el trigger manda [nota*0.3 + anterior] y ya menos en rankingPoints es solo [nota + anterior]
    - III actualiza los puntos cuando un estudainte compra una recompensa tanto un descuento como un cosmetico
        - el php solo debe agregar en recompensa_canjeada lo necesario de ESA tabla
    - IV ya esta en un php/inscribirCurso.php 
    - V 