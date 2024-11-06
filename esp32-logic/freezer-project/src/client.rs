mod setup_bme280;
use std::{cell::RefCell, rc::Rc};

use bme280::Measurements;
use esp32framework::{
    ble::{
        utils::{ble_standard_uuids::StandardCharacteristicId, RemoteCharacteristic},
        BleClient, BleId,
    }, gpio::digital::{DigitalOut, InterruptType}, timer_driver::TimerDriver, Microcontroller
};
use esp_idf_svc::hal::{delay::Delay, gpio::Level};
use setup_bme280::*;

const SERVER_NAME: &str = "FreezzerServer";
const SERVICE_ID: u16 = 0x1000;
const ESP_ID: u16 = 1;

const CHAR_HUMIDITY_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Humidity);
const CHAR_PRESSURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Pressure);
const CHAR_TEMPERATURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Temperature);
const CHAR_DOOR_ID: BleId = 
    BleId::from_standard_characteristic(StandardCharacteristicId::AlertStatus);

struct SensorsCharacteristics {
    humidity: RemoteCharacteristic,
    pressure: RemoteCharacteristic,
    temperature: RemoteCharacteristic,
}

impl SensorsCharacteristics {
    fn write<E>(&mut self, measurements: Measurements<E>) {
        println!("Temperature: {}°C", measurements.temperature);
        println!("Pressure: {}hPa", measurements.pressure);
        println!("Humidity: {}%", measurements.humidity);
        self.humidity
            .write(&measurements.humidity.to_be_bytes())
            .unwrap();
        self.pressure
            .write(&measurements.pressure.to_be_bytes())
            .unwrap();
        self.temperature
            .write(&measurements.temperature.to_be_bytes())
            .unwrap();
    }
}

impl From<Vec<RemoteCharacteristic>> for SensorsCharacteristics {
    fn from(value: Vec<RemoteCharacteristic>) -> Self {
        let mut temperature = None;
        let mut pressure = None;
        let mut humidity = None;

        for characteristic in value {
            match characteristic.id() {
                CHAR_HUMIDITY_ID => humidity = Some(characteristic),
                CHAR_PRESSURE_ID => pressure = Some(characteristic),
                CHAR_TEMPERATURE_ID => temperature = Some(characteristic),
                _ => {}
            }
        }

        SensorsCharacteristics {
            temperature: temperature.unwrap(),
            pressure: pressure.unwrap(),
            humidity: humidity.unwrap(),
        }
    }
}

fn initialize_ble_client(micro: &mut Microcontroller) -> BleClient {
    let mut ble = micro.ble_client().unwrap();
    println!("Attempting connection with server: {SERVER_NAME}");
    let device = ble
        .find_device_of_name(None, SERVER_NAME.to_string())
        .unwrap();

    ble.connect_to_device(device).unwrap();
    println!("Connected to server {SERVER_NAME}");

    ble
}

fn get_server_characteristic(client: &mut BleClient) -> (SensorsCharacteristics, RemoteCharacteristic) {
    let service_id = BleId::FromUuid16(SERVICE_ID + ESP_ID);
    let sensor_characteristics = SensorsCharacteristics::from(client.get_all_characteristics(&service_id).unwrap());
    let door_characteristic = client.get_characteristic(&service_id, &CHAR_DOOR_ID).unwrap();
    (sensor_characteristics, door_characteristic)
}

fn handle_door(opened: Level, led: &mut DigitalOut, alarm: &Rc<RefCell<DigitalOut>>, timer_driver: &mut TimerDriver, door_char: &Rc<RefCell<RemoteCharacteristic>>){
    match opened {
        Level::Low => timer_driver.enable().unwrap(),
        Level::High => {
            timer_driver.disable().unwrap();
            let mut alarm = alarm.borrow_mut();
            if alarm.get_level() == Level::High{
                door_char.borrow_mut().write(&[false as u8]).unwrap();
                alarm.set_low().unwrap();
            }
        },
    }
    led.toggle().unwrap();
}

fn set_alarm(micro: &mut Microcontroller<'static>, door_characteristic: RemoteCharacteristic){
    let mut door = micro.set_pin_as_digital_in(9).unwrap();
    let mut led = micro.set_pin_as_digital_out(3).unwrap();
    let mut timer_driver = micro.get_timer_driver().unwrap();

    let sharable_door_char = Rc::new(RefCell::from(door_characteristic));
    let sharable_door_char_ref = sharable_door_char.clone();
    let sharable_alarm = Rc::new(RefCell::from(micro.set_pin_as_digital_out(7).unwrap()));
    let sharable_alarm_ref = sharable_alarm.clone();
    led.set_high().unwrap();
    door.set_debounce(1_000_000);

    timer_driver.interrupt_after(10 * 1_000_000, move || {
        println!("WIUWIUWIU");
        sharable_door_char.borrow_mut().write(&[true as u8]).unwrap();
        sharable_alarm.borrow_mut().set_high().unwrap();
    });
    door.trigger_on_interrupt(move |level|
        handle_door(level, &mut led, &sharable_alarm_ref, &mut timer_driver, &sharable_door_char_ref),
        InterruptType::AnyEdgeNextEdgeIsNeg).unwrap();
}

fn main() {
    let mut micro = Microcontroller::take();
    
    let mut client = initialize_ble_client(&mut micro);
    let (mut sensor_characteristics, door_characteristic) = get_server_characteristic(&mut client);
    
    set_alarm(&mut micro, door_characteristic);

    let mut sensor = create_bme280(&mut micro, 11, 10);
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);

    loop {
        micro.wait_for_updates(Some(3000));
        let data = sensor.measure(&mut delay).unwrap();
        sensor_characteristics.write(data);
    }
}
