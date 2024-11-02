use esp32framework::{
    ble::{
        utils::{ble_standard_uuids::StandardCharacteristicId, Characteristic, Service},
        BleId, BleServer,
    },
    wifi::{
        http::{Http, HttpsClient},
        WifiDriver,
    },
    Microcontroller,
};

const ADVERTISING_NAME: &str = "FreezzerServer";
const SSID: &str = "WIFI_SSID";
const PASSWORD: &str = "WIFI_PASS";
const URI: &str = "https://freezer-project.vercel.app/api/esp-data/post";

const SERVICE_ID: u16 = 0x1000;
const AMOUNT_OF_CLIENTS: u16 = 3;

// CHARACTERISTIC IDs //
const CHAR_HUMIDITY_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Humidity);
const CHAR_PRESSURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Pressure);
const CHAR_TEMPERATURE_ID: BleId =
    BleId::from_standard_characteristic(StandardCharacteristicId::Temperature);

struct ClientData {
    id: u16,
    humidity: f32,
    pressure: f32,
    temperature: f32,
}

impl ClientData {
    fn from(client_id: u16, characteristics_data: Vec<(BleId, Vec<u8>)>) -> Option<Self> {
        let mut temperature = None;
        let mut pressure = None;
        let mut humidity = None;

        for (c_id, data) in characteristics_data {
            match c_id {
                CHAR_HUMIDITY_ID => humidity = Some(f32::from_be_bytes(data.try_into().ok()?)),
                CHAR_PRESSURE_ID => pressure = Some(f32::from_be_bytes(data.try_into().ok()?)),
                CHAR_TEMPERATURE_ID => {
                    temperature = Some(f32::from_be_bytes(data.try_into().ok()?))
                }
                _ => {}
            }
        }

        Some(ClientData {
            id: client_id,
            temperature: temperature?,
            pressure: pressure?,
            humidity: humidity?,
        })
    }

    fn print(&self) {
        println!(
            "[ESP_{}] Humidity: {}  |  Pressure: {}  |  Temperature: {} ",
            self.id, self.humidity, self.pressure, self.temperature
        );
    }

    fn send(&self, https_client: &mut HttpsClient) {
        let send_data = format!(
            "{}?id={}&hum={}&press={}&temp={}",
            URI, self.id, self.humidity, self.pressure, self.temperature
        );
        self.print();
        https_client.get(&send_data, vec![]).unwrap();
        https_client.wait_for_response(&mut []).unwrap();
    }
}

fn create_service_for_client(client_id: u16) -> Service {
    let service_id = BleId::FromUuid16(SERVICE_ID + client_id);
    let service = Service::new(&service_id, Vec::new()).unwrap();

    service.add_characteristics(&vec![
        Characteristic::new(&CHAR_HUMIDITY_ID, vec![]).writable(true),
        Characteristic::new(&CHAR_PRESSURE_ID, vec![]).writable(true),
        Characteristic::new(&CHAR_TEMPERATURE_ID, vec![]).writable(true),
    ])
}

fn create_services() -> Vec<Service> {
    let mut services = Vec::new();
    for i in 0..AMOUNT_OF_CLIENTS {
        services.push(create_service_for_client(i));
    }
    services
}

fn initialize_ble_server<'a>(micro: &mut Microcontroller<'a>) -> BleServer<'a> {
    let services = create_services();
    micro
        .ble_server(ADVERTISING_NAME.to_string(), &services)
        .unwrap()
}

fn initialize_wifi_connection<'a>(
    micro: &mut Microcontroller<'a>,
) -> (WifiDriver<'a>, HttpsClient) {
    let mut wifi = micro.get_wifi_driver().unwrap();
    micro
        .block_on(wifi.connect(SSID, Some(PASSWORD.to_string())))
        .unwrap(); // TODO implementar version no async, y ver tema timeout

    let https_client = wifi.get_https_client().unwrap();
    //let http_client = wifi.get_http_client().unwrap();

    println!("wifi_connected");
    (wifi, https_client) // TODO que los http clients, tengan algun lifetime dependiendo del wifi
}

/// Gathers data from the connected devices
fn gather_data(server: &BleServer) -> Vec<ClientData> {
    let mut client_datas = Vec::new();
    for client_id in 0..AMOUNT_OF_CLIENTS {
        let s_id = BleId::FromUuid16(SERVICE_ID + client_id);
        let characteristics_values = server.get_all_service_characteristics_data(&s_id).unwrap();
        if let Some(client_data) = ClientData::from(client_id, characteristics_values) {
            client_datas.push(client_data);
        }
    }
    client_datas
}

/// Sends the collected data of the devices to the web application
/// so they can be shown to the users
fn send_all_data(https_client: &mut HttpsClient, data: Vec<ClientData>) {
    for client_data in data {
        client_data.send(https_client)
    }
}

pub fn main() {
    let mut micro = Microcontroller::take();
    let mut server = initialize_ble_server(&mut micro);
    // TODO: WifiDriver variable is not being used. If wifi connection is failing check if this is the reason.
    let (_wifi, mut https_client) = initialize_wifi_connection(&mut micro);

    server.start().unwrap();

    loop {
        micro.wait_for_updates(Some(5000));

        let data = gather_data(&server);
        data.iter().for_each(|d| d.print());
        send_all_data(&mut https_client, data);
    }
}
