use esp32framework::{ble::{utils::{ble_standard_uuids::StandarServiceId, Characteristic, Service}, BleId, BleServer}, wifi::{http::{Http, HttpClient}, WifiDriver}, Microcontroller};

const ADVERTISING_NAME: &str = "Server";
const SSID: &str = "WIFI_SSID";
const PASSWORD: &str = "WIFI_PASS";
const URI: &str = "https://freezer-project.vercel.app/api/esp-data";

// CHARACTERISTIC IDs //
const ESP_1_TEMP_CHAR_ID: u16 = 0x0001;
const ESP_1_HUM_CHAR_ID: u16 = 0x0002;
const ESP_1_PRESS_CHAR_ID: u16 = 0x0003;

const ESP_2_TEMP_CHAR_ID: u16 = 0x0004;
const ESP_2_HUM_CHAR_ID: u16 = 0x0005;
const ESP_2_PRESS_CHAR_ID: u16 = 0x0006;

const ESP_3_TEMP_CHAR_ID: u16 = 0x0007;
const ESP_3_HUM_CHAR_ID: u16 = 0x0008;
const ESP_3_PRESS_CHAR_ID: u16 = 0x0009;

fn create_characteristics() -> Vec<Characteristic> {
    // BleIds for ESP-1 characteristics
    let characteristic_temp_id1 = BleId::FromUuid16(ESP_1_TEMP_CHAR_ID);
    let characteristic_hum_id1 = BleId::FromUuid16(ESP_1_HUM_CHAR_ID);
    let characteristic_press_id1 = BleId::FromUuid16(ESP_1_PRESS_CHAR_ID);
    
    // BleIds for ESP-2 characteristics
    let characteristic_temp_id2 = BleId::FromUuid16(ESP_2_TEMP_CHAR_ID);
    let characteristic_hum_id2 = BleId::FromUuid16(ESP_2_HUM_CHAR_ID);
    let characteristic_press_id2 = BleId::FromUuid16(ESP_2_PRESS_CHAR_ID);
    
    // BleIds for ESP-3 characteristics
    let characteristic_temp_id3 = BleId::FromUuid16(ESP_3_TEMP_CHAR_ID);
    let characteristic_hum_id3 = BleId::FromUuid16(ESP_3_HUM_CHAR_ID);
    let characteristic_press_id3 = BleId::FromUuid16(ESP_3_PRESS_CHAR_ID);
    
    // Characteristics for the ESPs
    let characteristic_temp_1 = Characteristic::new(&characteristic_temp_id1, vec![]);
    let characteristic_hum_1 = Characteristic::new(&characteristic_hum_id1, vec![]);
    let characteristic_press_1 = Characteristic::new(&characteristic_press_id1, vec![]);
    
    let characteristic_temp_2 = Characteristic::new(&characteristic_temp_id2, vec![]);
    let characteristic_hum_2 = Characteristic::new(&characteristic_hum_id2, vec![]);
    let characteristic_press_2 = Characteristic::new(&characteristic_press_id2, vec![]);
    
    let characteristic_temp_3 = Characteristic::new(&characteristic_temp_id3, vec![]);
    let characteristic_hum_3 = Characteristic::new(&characteristic_hum_id3, vec![]);
    let characteristic_press_3 = Characteristic::new(&characteristic_press_id3, vec![]);
    
    // Add all characteristics to a vector
    let mut characteristics = Vec::new();
    characteristics.push(characteristic_temp_1);
    characteristics.push(characteristic_hum_1);
    characteristics.push(characteristic_press_1);
    characteristics.push(characteristic_temp_2);
    characteristics.push(characteristic_hum_2);
    characteristics.push(characteristic_press_2);
    characteristics.push(characteristic_temp_3);
    characteristics.push(characteristic_hum_3);
    characteristics.push(characteristic_press_3);
    
    // Make every characteristic to be writable and readeable
    for characteristic in &mut characteristics {
        characteristic.writable(true).readable(true);
    }

    characteristics
}


fn initialize_ble_server<'a>(micro: &mut Microcontroller<'a>) -> (BleServer<'a>, Vec<Characteristic>, BleId) {
    let characteristics = create_characteristics();
    let service_id = BleId::StandardService(StandarServiceId::EnvironmentalSensing);
    let mut service = Service::new(&service_id, vec![0xAB]).unwrap(); // TODO: fix initial data
    service.add_characteristics(&characteristics);

    let services = vec![service];
    
    let server = micro.ble_server(ADVERTISING_NAME.to_string(), &services).unwrap();
    (server, characteristics, service_id)
}

fn initialize_wifi_connection<'a>(micro: &mut Microcontroller<'a>) -> (WifiDriver<'a>, HttpClient) {
    let mut wifi = micro.get_wifi_driver().unwrap();
    micro
        .block_on(wifi.connect(SSID, Some(PASSWORD.to_string())))
        .unwrap();
    
    let http_client = wifi.get_http_client().unwrap();

    (wifi, http_client)
}

/// Gathers data from the connected devices
fn gather_data(server: &BleServer, characteristics: &Vec<Characteristic>, service_id: &BleId) -> Vec<Vec<u8>> {
    let mut data: Vec<Vec<u8>> = Vec::new();
    for characteristic in characteristics {
        let characteristic_data = server.get_characteristic_data(service_id, &characteristic.id).unwrap();
        data.push(characteristic_data);
    }

    data
}

/// Sends the collected data of the devices to the web application
/// so they can be shown to the users
fn send_data(client: &mut HttpClient, data: Vec<Vec<u8>>) {    
    // Send data of ESP-1
    let esp_1_url_params = format!("{}?id={1}&temp={}&hum={}&press={}", URI, data[0][0], data[1][0], data[2][0]);

    // Send data of ESP-2
    let esp_2_url_params = format!("{}?id={2}&temp={}&hum={}&press={}", URI, data[3][0], data[4][0], data[5][0]);

    // Send data of ESP-3
    let esp_3_url_params = format!("{}?id={3}&temp={}&hum={}&press={}", URI, data[6][0], data[7][0], data[8][0]);

    // Send the data of each ESP to the website's database
    client.post(esp_1_url_params.as_str(), vec![]).unwrap();
    client.post(esp_2_url_params.as_str(), vec![]).unwrap();
    client.post(esp_3_url_params.as_str(), vec![]).unwrap();
}

fn main() {
    let mut micro = Microcontroller::take();
    let (mut server,characteristics, service_id) = initialize_ble_server(&mut micro); // TODO: Discuss if it would be cool to add a function to the BleServer where we can get all the characteristics and one to get the services
    // TODO: WifiDriver variable is not being used. If wifi connection is failing check if this is the reason.
    let (_, mut client) = initialize_wifi_connection(&mut micro);
    
    server.start().unwrap();
    
    loop {
        micro.wait_for_updates(Some(5000));

        let data = gather_data(&server, &characteristics, &service_id);

        send_data(&mut client, data);
    }
}
