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

struct SensorsCharacteristics {
    humidity: RemoteCharacteristic,
    pressure: RemoteCharacteristic,
    temperature: RemoteCharacteristic,
}

impl SensorsCharacteristics {
    fn write<E>(&mut self, measurements: Measurements<E>) {
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

fn get_server_characteristic(client: &mut BleClient) -> SensorsCharacteristics {
    let service_id = BleId::FromUuid16(SERVICE_ID + ESP_ID);
    SensorsCharacteristics::from(client.get_all_characteristics(&service_id).unwrap())
}

fn handle_door(opened: Level, led: &mut DigitalOut, alarm: &Rc<RefCell<DigitalOut>>, timer_driver: &mut TimerDriver){
    match opened {
        Level::Low => timer_driver.enable().unwrap(),
        Level::High => {
            timer_driver.disable().unwrap();
            alarm.borrow_mut().set_low().unwrap();
        },
    }
    led.toggle().unwrap();
}

fn set_alarm(micro: &mut Microcontroller<'static>){
    let mut door = micro.set_pin_as_digital_in(9).unwrap();
    let mut led = micro.set_pin_as_digital_out(3).unwrap();
    let mut timer_driver = micro.get_timer_driver().unwrap();

    let sharable_alarm = Rc::new(RefCell::from(micro.set_pin_as_digital_out(7).unwrap()));
    let sharable_alarm_ref = sharable_alarm.clone();
    led.set_high().unwrap();
    door.set_debounce(1_000_000);


    timer_driver.interrupt_after(10 * 1_000_000, move || {
        println!("WIUWIUWIU");
        sharable_alarm.borrow_mut().set_high().unwrap();
    });
    // door._trigger_on_interrupt(user_callback, callback, interrupt_type) //TODO sacar de pub 
    door.trigger_on_interrupt(move |level|{
        handle_door(level, &mut led, &sharable_alarm_ref, &mut timer_driver);
    }, InterruptType::AnyEdgeNextEdgeIsNeg).unwrap();
}

fn main() {
    let mut micro = Microcontroller::take();
    set_alarm(&mut micro);
    
    let mut client = initialize_ble_client(&mut micro);
    let mut characteristics = get_server_characteristic(&mut client);
    
    let mut sensor = create_bme280(&mut micro, 11, 10);
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);

    loop {
        micro.wait_for_updates(Some(3000));
        let data = sensor.measure(&mut delay).unwrap();
        println!("Temperature: {}°C", data.temperature);
        println!("Pressure: {}hPa", data.pressure);
        println!("Humidity: {}%", data.humidity);
        characteristics.write(data);
    }
}
