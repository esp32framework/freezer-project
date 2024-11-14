use esp32framework::{
    ble::{
        utils::{ble_standard_uuids::StandardCharacteristicId, Characteristic, Service},
        BleError, BleId, BleServer,
    }, esp32_framework_error::Esp32FrameworkError, wifi::{
        http::{Http, HttpError, HttpHeader, HttpHeaderType, HttpsClient},
        WifiDriver, WifiError,
    }, Microcontroller
};

const ADVERTISING_NAME: &str = "FreezerServer";
const SSID: &str = "WIFI_SSID";
const PASSWORD: &str = "WIFI_PASS";
const MEASUREMENT_URI: &str = "https://freezer-project.vercel.app/api/esp-data/post";
const ALERT_URI: &str = "https://freezer-project.vercel.app/api/door/post";
const SEND_RATE: u32 = 2000;

const SERVICE_ID: u16 = 0x1000;
const AMOUNT_OF_CLIENTS: u16 = 3;

// CHARACTERISTIC IDs //
const CHAR_HUMIDITY_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Humidity);
const CHAR_PRESSURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Pressure);
const CHAR_TEMPERATURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Temperature);
const CHAR_DOOR_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::AlertStatus);

struct ClientData {
    id: u16,
    humidity: f32,
    pressure: f32,
    temperature: f32,
    door: Option<bool>,
}

impl ClientData {
    fn from(client_id: u16, characteristics_data: Vec<(BleId, Vec<u8>)>) -> Option<Self> {
        let mut temperature = None;
        let mut pressure = None;
        let mut humidity = None;
        let mut door = None;

        for (c_id, data) in characteristics_data {
            match c_id {
                CHAR_HUMIDITY_ID => humidity = Some(f32::from_be_bytes(data.try_into().ok()?)),
                CHAR_PRESSURE_ID => pressure = Some(f32::from_be_bytes(data.try_into().ok()?)),
                CHAR_TEMPERATURE_ID => {
                    temperature = Some(f32::from_be_bytes(data.try_into().ok()?))
                }
                CHAR_DOOR_ID => door = data.first().map(|&value| value != 0),
                _ => {}
            }
        }

        Some(ClientData {
            id: client_id,
            temperature: temperature?,
            pressure: pressure?,
            humidity: humidity?,
            door,
        })
    }

    fn print(&self) {
        println!(
            "[ESP_{}] Humidity: {}  |  Pressure: {}  |  Temperature: {} | Opened: {:?}",
            self.id, self.humidity, self.pressure, self.temperature, self.door
        );
    }

    fn send_http(
        &self,
        https_client: &mut HttpsClient,
        uri: &str,
        data: String,
    ) -> Result<(), HttpError> {
        self.print();
        let content_type_header = HttpHeader::new(
            HttpHeaderType::ContentType,
            String::from("application/json"),
        );
        https_client.post(uri, vec![content_type_header], Some(data))?;
        https_client.wait_for_response(&mut [])?;
        Ok(())
    }

    fn send_sensor_data(&self, https_client: &mut HttpsClient) -> Result<(), HttpError> {
        let send_data = format!(
            "{{\"id\":{}, \"hum\":{}, \"press\":{}, \"temp\":{}}}",
            self.id, self.humidity, self.pressure, self.temperature
        );
        self.send_http(https_client, MEASUREMENT_URI, send_data)?;
        Ok(())
    }

    fn try_send_door_data(&self, https_client: &mut HttpsClient) -> Result<(), HttpError> {
        if let Some(door) = self.door {
            let send_data = format!("{{\"id\":{}, \"is_open\":{}}}", self.id, door);
            self.send_http(https_client, ALERT_URI, send_data)?;
        }
        Ok(())
    }

    fn send(&self, https_client: &mut HttpsClient) -> Result<(), HttpError> {
        self.send_sensor_data(https_client)?;
        self.try_send_door_data(https_client)
    }
}

fn create_service_for_client(client_id: u16) -> Result<Service, BleError> {
    let service_id = BleId::FromUuid16(SERVICE_ID + client_id);
    let service = Service::new(&service_id, Vec::new())?;

    Ok(service.add_characteristics(&vec![
        Characteristic::new(&CHAR_HUMIDITY_ID, vec![]).writable(true),
        Characteristic::new(&CHAR_PRESSURE_ID, vec![]).writable(true),
        Characteristic::new(&CHAR_TEMPERATURE_ID, vec![]).writable(true),
        Characteristic::new(&CHAR_DOOR_ID, vec![]).writable(true),
    ]))
}

fn create_services() -> Result<Vec<Service>, BleError> {
    let mut services = Vec::new();
    for i in 0..AMOUNT_OF_CLIENTS {
        services.push(create_service_for_client(i)?);
    }
    Ok(services)
}

fn initialize_ble_server<'a>(micro: &mut Microcontroller<'a>) -> Result<BleServer<'a>, BleError> {
    let services = create_services()?;
    let mut server = micro.ble_server(ADVERTISING_NAME.to_string(), &services)?;
    server.set_max_concurrent_clients(AMOUNT_OF_CLIENTS as u8)?;
    Ok(server)
}

fn initialize_wifi_connection<'a>(
    micro: &mut Microcontroller<'a>,
) -> Result<(WifiDriver<'a>, HttpsClient), WifiError> {
    let mut wifi = micro.get_wifi_driver()?;
    wifi.connect(SSID, Some(PASSWORD.to_string()), None)?;

    let https_client = wifi.get_https_client()?;

    Ok((wifi, https_client))
}

/// Gathers data from the connected devices
fn gather_data(server: &mut BleServer) -> Result<Vec<ClientData>, BleError> {
    let mut client_datas = Vec::new();
    for client_id in 0..AMOUNT_OF_CLIENTS {
        let s_id = BleId::FromUuid16(SERVICE_ID + client_id);
        let characteristics_values = server.get_all_service_characteristics_data(&s_id)?;
        if let Some(client_data) = ClientData::from(client_id, characteristics_values) {
            server.set_service(&create_service_for_client(client_id)?)?;
            client_datas.push(client_data);
        }
    }
    Ok(client_datas)
}

fn send_all_data(https_client: &mut HttpsClient, data: Vec<ClientData>) -> Result<(), HttpError> {
    for client_data in data {
        client_data.send(https_client)?
    }
    Ok(())
}

pub fn main()->Result<(), Esp32FrameworkError> {
    let mut micro = Microcontroller::take();
    let mut server = initialize_ble_server(&mut micro)?;
    let (_wifi, mut https_client) = initialize_wifi_connection(&mut micro)?;

    server.start()?;

    loop {
        micro.wait_for_updates(Some(SEND_RATE));

        let data = gather_data(&mut server)?;
        data.iter().for_each(|d| d.print());
        send_all_data(&mut https_client, data)?;
    }
}
