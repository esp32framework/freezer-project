use bme280::i2c::BME280;
use bme280::{Configuration as Bme280_Config, Oversampling};
use esp32framework::esp32_framework_error::Esp32FrameworkError;
use esp32framework::external_peripheral::*;
use esp32framework::serial::i2c::I2CError;
use esp32framework::{external_peripheral::Peripheral, Microcontroller};
use esp_idf_svc::hal::{
    delay::Delay,
    i2c::{I2cConfig, I2cDriver},
};
use std::time::Duration;

const GLOBAL_OVERSAMPLING: Oversampling = Oversampling::Oversampling2X;
pub const MEASUREMENT_DELAY: Duration = Duration::from_secs(1);

pub fn create_bme280(
    micro: &mut Microcontroller,
    sda_num: usize,
    scl_num: usize,
) -> Result<BME280<I2cDriver<'static>>, Esp32FrameworkError> {
    let used_peripherals: Vec<Peripheral> = vec![
        Peripheral::Pin(sda_num as u8),
        Peripheral::Pin(scl_num as u8),
        Peripheral::I2C,
    ];

    let mut used_peripherals = micro.register_external_peripherals_use(used_peripherals);

    let sda_pin = used_peripherals.remove(0).into_any_io_pin()?;
    let scl_pin = used_peripherals.remove(0).into_any_io_pin()?;
    let i2c_bus = used_peripherals.remove(0).into_i2c0()?;
    let i2c_driver = I2cDriver::new(i2c_bus, sda_pin, scl_pin, &I2cConfig::new())
        .map_err(|_| I2CError::DriverError)?;

    let mut bme280 = BME280::new_primary(i2c_driver);
    let config = create_bme280_config();
    let mut delay = Delay::new(MEASUREMENT_DELAY.as_millis() as u32);
    bme280
        .init_with_config(&mut delay, config)
        .map_err(|_| I2CError::InvalidArg)?;
    Ok(bme280)
}

fn create_bme280_config() -> Bme280_Config {
    Bme280_Config::default()
        .with_humidity_oversampling(GLOBAL_OVERSAMPLING)
        .with_pressure_oversampling(GLOBAL_OVERSAMPLING)
        .with_temperature_oversampling(GLOBAL_OVERSAMPLING)
}
