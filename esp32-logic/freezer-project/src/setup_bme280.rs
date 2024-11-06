use bme280::i2c::BME280;
use bme280::{Configuration as Bme280_Config, Oversampling};
use esp32framework::external_peripheral::*;
use esp32framework::{external_peripheral::Peripheral, Microcontroller};
use esp_idf_svc::hal::{
    delay::Delay,
    i2c::{I2cConfig, I2cDriver},
};
use std::time::Duration;

// Oversampling mode
// TODO, varias de estas variables estan al dope;
static GLOBAL_OVERSAMPLING: Oversampling = Oversampling::Oversampling2X;
pub static MEASUREMENT_DELAY_SECONDS: u64 = 1;
pub static MEASUREMENT_DELAY_MILLIS: u32 = 0;
pub static MEASUREMENT_DELAY: Duration =
    Duration::new(MEASUREMENT_DELAY_SECONDS, MEASUREMENT_DELAY_MILLIS);

pub fn create_bme280(
    micro: &mut Microcontroller,
    sda_num: usize,
    scl_num: usize,
) -> BME280<I2cDriver<'static>> {
    // TODO: View errors
    let used_peripherals: Vec<Peripheral> = vec![
        Peripheral::Pin(sda_num as u8),
        Peripheral::Pin(scl_num as u8),
        Peripheral::I2C,
    ];
    let mut used_peripherals = micro.register_external_peripherals_use(used_peripherals);

    let sda_pin = used_peripherals.remove(0).into_any_io_pin().unwrap();
    let scl_pin = used_peripherals.remove(0).into_any_io_pin().unwrap();
    let i2c_bus = used_peripherals.remove(0).into_i2c0().unwrap();
    let i2c_driver = I2cDriver::new(i2c_bus, sda_pin, scl_pin, &I2cConfig::new()).unwrap();

    let mut bme280 = BME280::new_primary(i2c_driver);
    let config = create_bme280_config();
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);
    bme280.init_with_config(&mut delay, config).unwrap();

    bme280
}

fn create_bme280_config() -> Bme280_Config {
    Bme280_Config::default()
        .with_humidity_oversampling(GLOBAL_OVERSAMPLING)
        .with_pressure_oversampling(GLOBAL_OVERSAMPLING)
        .with_temperature_oversampling(GLOBAL_OVERSAMPLING)
}
