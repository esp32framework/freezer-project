type Measurement = {
    time: Date;
    temperature: number;
    humidity: number;
    pressure: number;
    espid: number;
}

type DoorData = {
    time: Date;
    is_open: boolean;
    espid: number;
}
  
type MeasurementsResponse = {
    measurements: Measurement[];
};

type DoorsDataResponse = {
    doors_data: DoorData[];
};