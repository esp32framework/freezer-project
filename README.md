# Proyecto: Control de unidades de refrigeracion

# Descripcion del poryecto:
Desarrollado a modo de validación del [ESPFRAMEWORK](https://github.com/esp32framework/esp32framework), se posee el siguiente trabajo desarrollado con el mismo.  
Se plantea la necesidad de una empresa frigorífica de llevar un monitoreo sobre distintas variables relativas a las tres unidades refrigerantes que poseen. Debido a las características de las mismas, no es posible hacer una instalación que las vincule con el inmueble por lo que se plantea llevar a cabo dicho monitoreo mediante una página web que muestre los datos recolectados por un conjunto de micro-controladores.  
Dichos micro-controladores serán los encargados de recolectar y enviar los datos al servidor web. Dichos datos contendrán informacion referente a la temperatura, humedad, presión atmosférica y el estado de las unidades. Este estado mencionado, simboliza una situación en la cual se deberá realizar un llamado de atención con motivo de que la puerta de la unidad permaneció abierta por más tiempo del permitido.
Por su parte, la plataforma web será la encargada de almacenar y mostrar los datos de manera que sea útil para su análisis.  
A continuación se profundiza la tarea de cada una de las secciones así como también su funcionamiento:

# Especificaciones del proceso de recoleccion de datos:
El proyecto está diseñado para funcionar con al menos dos micro-controladores ESP32-C6. Sin embargo se encuentra configurado para trabajar con cuatro de ellos, uno actuando como "ESP-servidor" y el resto como sus "clientes".  

Cada uno de los "clientes" usa un sensor BME280 para la obtención de los datos de temperatura, humedad y presión de su respectiva unidad refrigerante. Así mismo, deberán llevar un control respecto al estado de la puerta con el fin de monitorizar si la misma permanece demasiado tiempo en estado abierto y así poder enviar el aviso e iniciar un sonido de alarma. Sumado a esto, en todo momento que la misma permanezca abierta, se deberá encender una luz de forma titilante con el fin de resaltar dicho estado a los trabajadores.  
Por su parte, el "ESP-server" recibirá los datos de sus clientes para luego enviar dicha información hacia la plataforma web.

Para más detalles respecto a la implementación y el funcionamiento de los micro-controladores, se recomienda la lectura del archivo [readme.md](/esp32-logic/freezer-project/readme.md)  

# Diseño de plataforma web:
Con el fin de poder visualizar los datos de manera conveniente, en pagina principal se encuentra el gráfico donde podemos comparar la temperatura, humedad y presión de cada uno de los ESP instalados. Además en la parte inferior se muestran más en detalle algunas estadísticas sobre cada medición, ya sea el promedio de la misma o la tendencia que tiene.  
Además, en la sección de promedios, se le notifica de manera visual al usuario mediante un signo de exclamación sobre el ESP cuando la puerta relacionada al mismo permanece abierta por una cantidad de minutos mayor a la configurada.  
Como pantalla secundaria, encontramos una tabla con el historial de valores provenientes de cada ESP, los cuales fueron utilizados para calcular las estadísticas. Aquí el usuario tiene la posibilidad de ver más en detalle cada uno de los valores recibidos, aplicarles un filtro por columna como se observa en la imagen 36 o incluso descargar la tabla como archivo CSV.

# Especificaciones de plataforma web:
En lo que respecta a la implementación de la página web, se decidió utilizar el stack tecnológico compuesto por React con NextJS y Typescript. Como servicio de host de la plataforma en la nube, optamos por Vercel por su simplicidad y velocidad a la hora de configurar y desplegar el sitio. Sumado a esto la plataforma ofrece un servicio de base de datos integrado, gracias a este soporte y debido al previo conocimiento de los integrantes se optó por utilizar PostgreSQL.