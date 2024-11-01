use bme280::Measurements;
use esp32framework::{ble::{utils::{ble_standard_uuids::{StandardServiceId, StandardCharacteristicId}, RemoteCharacteristic}, BleClient, BleId}, Microcontroller};
use esp_idf_svc::hal::{delay::Delay,i2c::I2cError};
use super::bme280::*;
use std::time::Duration;

const SERVER_NAME: &str = "FreezzerServer";
const SERVICE_ID:u16 = 0x1000;
const ESP_ID: u16 = 1;

struct SensorsCharacteristics{
    humidity: RemoteCharacteristic,
    pressure: RemoteCharacteristic,
    temperature: RemoteCharacteristic,
}

impl SensorsCharacteristics{
    fn write(&mut self,measurements: Measurements<I2cError> ){
        self.humidity.write(&measurements.humidity.to_be_bytes());
        self.pressure.write(&measurements.pressure.to_be_bytes());
        self.temperature.write(&measurements.temperature.to_be_bytes());
    }
}

impl From<Vec<RemoteCharacteristic>> for SensorsCharacteristics{
    fn from(value: Vec<RemoteCharacteristic>) -> Self {
        let mut temperature = None;
        let mut pressure = None;
        let mut humidity = None;
        
        for characteristic in value{
            if BleId::from_standard_characteristic(StandardCharacteristicId::Humidity) == characteristic.id(){
                humidity = Some(characteristic)
            }
            else if BleId::from_standard_characteristic(StandardCharacteristicId::Pressure) == characteristic.id(){
                pressure = Some(characteristic)
            }
            else if BleId::from_standard_characteristic(StandardCharacteristicId::Temperature) == characteristic.id(){
                temperature = Some(characteristic)
            }
        }

        SensorsCharacteristics{temperature: temperature.unwrap(),pressure: pressure.unwrap(),humidity: humidity.unwrap()}
    }
}

fn initialize_ble_client(micro: &mut Microcontroller) -> BleClient{
    let mut ble = micro.ble_client().unwrap();
    println!("Attempting connection with server: {SERVER_NAME}");
    let device = ble.find_device_of_name(None, SERVER_NAME.to_string()).unwrap();

    ble.connect_to_device(device).unwrap();
    println!("Connected to server {SERVER_NAME}");
    
    ble
}

fn get_server_characteristic(client: &mut BleClient) -> SensorsCharacteristics {
    let service_id = BleId::FromUuid16(SERVICE_ID + ESP_ID);
    SensorsCharacteristics::from(client.get_all_characteristics(&service_id).unwrap())
}


pub fn client_main() {
    let mut micro = Microcontroller::take();

    let mut client = initialize_ble_client(&mut micro);
    let mut characteristics = get_server_characteristic(&mut client);
    
    let mut sensor = create_bme280(&mut micro, 11,10);
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);
    loop {
        let data = sensor.measure(&mut delay).unwrap();
        println!("Temperature: {}°C", data.temperature);
        println!("Pressure: {}hPa", data.pressure);
        println!("Humidity: {}%", data.humidity);
        characteristics.write(data);
        micro.wait_for_updates(Some(3000));
    }

}