# Freezer Proyect
 Este proyecto utiliza el [Esp32framework](https://github.com/esp32framework/esp32framework) para tomar datos, manejar recursos y realizar la comunicación a través de distintos protocolos de comunicación tanto con sensores como con un conjunto de microcontroladores ESP32-C6 de manera sencilla. Este proyecto fue creado usando como template a [Esp32framework-template](https://github.com/esp32framework/Esp32framework-template).


## Server
El servidor tendrá el nombre "FreezerServer" y publicitara 1 servicio BLE por cada cliente (actualmente configurado en 3). Dentro de dichos servicios se encontraran 4 características en las cuales los clientes enviaran la información de temperatura, humedad, presión atmosférica, y el estado de una puerta. El servidor periódicamente tomara todos estos datos y los enviara por wifi utilizando el protocolo HTTP para ser guardado en una base de datos hosteada en Vercel.

Para realizar el build y flash al esp servidor se debe ejceutar 
```
cargo run --bin server
```

## Client
El cliente por su lado leerá datos y los enviara al servidor BLE periódicamente. Por un lado se comunicara mediante I2C con un sensor BME280 y tomara la temperatura, humedad y presión atmosférica de la unidad refrigerante asociada. Además, utilizando un pin como entrada digital se verifica que una puerta no esté abierta, y si lo está prende y apaga un led utilizando otro pin como salida analógica. Si tras 10 segundos la puerta continua abierta se prende una alarma mediante una salida digital y se envía al servidor este evento.


Para realizar el build y flash de los clientes se debe ejceutar, actualizando la constante ESP_ID
```
cargo run --bin client
```