mod setup_bme280;
use std::{cell::RefCell, rc::Rc};

use bme280::Measurements;
use esp32framework::{
    ble::{
        utils::{ble_standard_uuids::StandardCharacteristicId, RemoteCharacteristic},
        BleClient, BleError, BleId,
    },
    esp32_framework_error::Esp32FrameworkError,
    gpio::{analog::AnalogOut, digital::{DigitalOut, InterruptType}},
    timer_driver::TimerDriver,
    Microcontroller,
};
use esp_idf_svc::hal::{delay::Delay, gpio::Level};
use setup_bme280::*;

const SERVER_NAME: &str = "FreezerServer";
const SERVICE_ID: u16 = 0x1000;
const ESP_ID: u16 = 1;
const DOOR_DEBOUNCE: u64 = 200_000;
const ALARM_TIMEOUT: u64 = 10_000_000;
const SEND_RATE: u32 = 5000;

const CHAR_HUMIDITY_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Humidity);
const CHAR_PRESSURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Pressure);
const CHAR_TEMPERATURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Temperature);
const CHAR_DOOR_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::AlertStatus);

const DOOR_PIN: usize = 2;
const LED_PIN: usize = 20;
const ALARM_PIN: usize = 19;
const SENSOR_SDA_PIN: usize = 11;
const SENSOR_SCL_PIN: usize = 10;

struct SensorsCharacteristics {
    humidity: RemoteCharacteristic,
    pressure: RemoteCharacteristic,
    temperature: RemoteCharacteristic,
}

impl SensorsCharacteristics {
    fn write<E>(&mut self, measurements: Measurements<E>) -> Result<(), BleError> {
        println!("Temperature: {}°C", measurements.temperature);
        println!("Pressure: {}hPa", measurements.pressure);
        println!("Humidity: {}%", measurements.humidity);

        self.humidity.write(&measurements.humidity.to_be_bytes())?;
        self.pressure.write(&measurements.pressure.to_be_bytes())?;
        self.temperature
            .write(&measurements.temperature.to_be_bytes())
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

fn initialize_ble_client(micro: &mut Microcontroller) -> Result<BleClient, BleError> {
    let mut ble = micro.ble_client()?;
    let device = ble.find_device_of_name(None, SERVER_NAME.to_string())?;
    ble.connect_to_device(device)?;

    Ok(ble)
}

fn get_server_characteristic(
    client: &mut BleClient,
) -> Result<(SensorsCharacteristics, RemoteCharacteristic), BleError> {
    let service_id = BleId::FromUuid16(SERVICE_ID + ESP_ID);
    let sensor_characteristics =
        SensorsCharacteristics::from(client.get_all_characteristics(&service_id)?);
    let door_characteristic = client.get_characteristic(&service_id, &CHAR_DOOR_ID)?;
    Ok((sensor_characteristics, door_characteristic))
}

fn handle_door(
    opened: Level,
    led: &mut AnalogOut,
    alarm: &Rc<RefCell<DigitalOut>>,
    timer_driver: &mut TimerDriver,
    door_char: &Rc<RefCell<RemoteCharacteristic>>,
)-> Result<(), Esp32FrameworkError> {
    match opened {
        Level::Low => {
            timer_driver.enable()?;
            led.start_increasing_bounce_back(100, 0.05, 0.0, None)?;
        },
        Level::High => {
            timer_driver.disable()?;
            let mut alarm = alarm.borrow_mut();
            if alarm.get_level() == Level::High {
                door_char.borrow_mut().write(&[false as u8])?;
                alarm.set_low()?;
            }
            led.set_low()?;
        }
    }
    Ok(())
}

fn alarm_trigger(door_char: &Rc<RefCell<RemoteCharacteristic>>, alarm: &Rc<RefCell<DigitalOut>>) {
    println!("Alarm triggered");
    _ = door_char.borrow_mut().write(&[true as u8]);
    alarm.borrow_mut().set_high().unwrap();
}

fn set_alarm(
    micro: &mut Microcontroller<'static>,
    door_characteristic: RemoteCharacteristic,
) -> Result<(), Esp32FrameworkError> {
    let mut door = micro.set_pin_as_digital_in(DOOR_PIN)?;
    let mut led = micro.set_pin_as_default_analog_out(LED_PIN)?;
    let mut timer_driver = micro.get_timer_driver()?;
    let alarm = micro.set_pin_as_digital_out(ALARM_PIN)?;

    let sharable_door_char = Rc::new(RefCell::from(door_characteristic));
    let sharable_door_char_ref = sharable_door_char.clone();
    let sharable_alarm = Rc::new(RefCell::from(alarm));
    let sharable_alarm_ref = sharable_alarm.clone();

    led.set_low()?;
    door.set_debounce(DOOR_DEBOUNCE);

    timer_driver.interrupt_after(ALARM_TIMEOUT, move || {
        alarm_trigger(&sharable_door_char, &sharable_alarm)
    });
    door.trigger_on_interrupt(
        move |level| 
            handle_door(
                level,
                &mut led,
                &sharable_alarm_ref,
                &mut timer_driver,
                &sharable_door_char_ref,
            ).unwrap(),
        InterruptType::AnyEdgeNextEdgeIsNeg,
    )?;
    Ok(())
}

fn main()-> Result<(), Esp32FrameworkError>{
    let mut micro = Microcontroller::take();

    let mut client = initialize_ble_client(&mut micro)?;
    let (mut sensor_characteristics, door_characteristic) =
        get_server_characteristic(&mut client)?;

    set_alarm(&mut micro, door_characteristic)?;

    let mut sensor = create_bme280(&mut micro, SENSOR_SDA_PIN, SENSOR_SCL_PIN)?;
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);

    loop {
        micro.wait_for_updates(Some(SEND_RATE));
        if let Ok(data) = sensor.measure(&mut delay) {
            _ = sensor_characteristics.write(data);
        }
    }
}
