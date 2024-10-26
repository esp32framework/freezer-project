type Measurement = {
    time: Date;
    temperature: number;
    humidity: number;
    pressure: number;
    espid: number;
}
  
type ApiResponse = {
    measurements: Measurement[];
};