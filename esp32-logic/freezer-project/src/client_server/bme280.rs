use bme280::{Oversampling,SensorMode,Configuration as Bme280_Config};
use std::time::Duration;
use bme280::i2c::BME280;
use esp32framework::{Microcontroller, external_peripheral::Peripheral};
use esp32framework::external_peripheral::*;
use esp_idf_svc::hal::{i2c::{I2cConfig,I2cDriver},delay::{Delay, FreeRtos},prelude::Peripherals};

// Oversampling mode
// TODO, varias de estas variables estan al dope;
static GLOBAL_OVERSAMPLING: Oversampling = Oversampling::Oversampling2X;
pub static MEASUREMENT_DELAY_SECONDS: u64 = 1;
pub static MEASUREMENT_DELAY_MILLIS: u32 = 0;
pub static MEASUREMENT_DELAY: Duration = Duration::new(MEASUREMENT_DELAY_SECONDS, MEASUREMENT_DELAY_MILLIS);

pub fn create_bme280 (micro: &mut Microcontroller,sda_num: u8, scl_num: u8) -> BME280<I2cDriver<'static>> {
    // TODO: View errors
    let used_peripherals: Vec<Peripheral> = vec![Peripheral::Pin(sda_num),Peripheral::Pin(scl_num),Peripheral::I2C];
    let mut used_peripherals = micro.register_external_peripherals_use(used_peripherals);
    
    let sda_pin = used_peripherals.remove(0).into_any_io_pin().unwrap();
    let scl_pin = used_peripherals.remove(0).into_any_io_pin().unwrap();
    let i2c_bus = used_peripherals.remove(0).into_i2c0().unwrap();
    let i2c_driver = I2cDriver::new(i2c_bus,sda_pin, scl_pin, &I2cConfig::new()).unwrap();
    
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


pub fn print_measurement(bme280: &mut BME280<I2cDriver>, mut delay: Delay){
    let measurements = bme280.measure(&mut delay).unwrap();
    println!("Temperature: {}°C", measurements.temperature);
    println!("Pressure: {}hPa", measurements.pressure);
    println!("Humidity: {}%", measurements.humidity);
}
