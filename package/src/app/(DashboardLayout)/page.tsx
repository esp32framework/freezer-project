"use client";
import { useState, useEffect } from "react";
import { Grid, Box, Typography, Select, MenuItem } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import GeneralValues from "@/app/(DashboardLayout)/components/dashboard/GeneralValues";
import AvgTemperature from "@/app/(DashboardLayout)/components/dashboard/AvgMeasurements";

export const dynamic = "force-dynamic";

const INTERVAL_OPTIONS = {
  1: 10, // 10 segundos
  2: 60, // 1 minuto
  3: 300, // 5 minutos
};

async function fetchMeasurements(): Promise<MeasurementsResponse> {
  try {
    const response = await fetch("/api/esp-data/get", { cache: "no-store" });
    if (!response.ok) throw new Error("Error fetching data");
    const data = await response.json();

    const measurements: Measurement[] = data.measurements.rows.map(
      (row: any) => ({
        time: new Date(row.time),
        temperature: parseFloat(row.temperature),
        humidity: parseFloat(row.humidity),
        pressure: parseFloat(row.pressure),
        espid: parseInt(row.espid),
      })
    );

    return { measurements };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

async function fetchDoorsData(): Promise<DoorsDataResponse> {
  try {
    const response = await fetch("/api/door/get", { cache: "no-store" });
    if (!response.ok) throw new Error("Error fetching data");
    const data = await response.json();

    const doors_data: DoorData[] = data.doors_data.rows.map(
      (row: any) => ({
        time: new Date(row.time),
        espid: parseInt(row.espid),
        is_open: row.is_open,
      })
    );

    return { doors_data };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

const Dashboard = () => {
  const [measurementsData, setMeasurementsData] = useState<MeasurementsResponse | null>(null);
  const [doorsData, setDoorsData] = useState<DoorsDataResponse | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(3); // Valor inicial: 5 minutos

  useEffect(() => {
    const updateData = async () => {
      try {
        console.log("Haciendo el fetch");
        const newMeasurementsData = await fetchMeasurements();
        const newDoorsData = await fetchDoorsData();
        console.log("measurements: ", newMeasurementsData);
        console.log("doors data: ", newDoorsData);
        setMeasurementsData(newMeasurementsData);
        setDoorsData(newDoorsData);
      } catch (error) {
        console.error("Error actualizando los datos:", error);
      }
    };

    updateData();

    // Configura el intervalo según la selección
    const intervalId = setInterval(
      updateData,
      INTERVAL_OPTIONS[selectedInterval as keyof typeof INTERVAL_OPTIONS] * 1000
    );

    // Limpia el intervalo al desmontar o al cambiar el intervalo
    return () => clearInterval(intervalId);
  }, [selectedInterval]);

  return (
    <PageContainer title="Proyecto Freezer" description="this is Dashboard">
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="h1">Panel General</Typography>
          </Box>
          <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
          >
            <Typography variant="h4">Refresh rate: </Typography>
            <Select
              labelId="month-dd"
              id="month-dd"
              size="small"
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(Number(e.target.value))}
            >
              <MenuItem value={1}>10 segundos</MenuItem>
              <MenuItem value={2}>1 minuto</MenuItem>
              <MenuItem value={3}>5 minutos</MenuItem>
            </Select>
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            {measurementsData && <GeneralValues lastValues={measurementsData} />}
          </Grid>
          <Grid item xs={4}>
            {measurementsData && <AvgTemperature lastValues={measurementsData} doorsDataResponse={doorsData} espid="0" />}
          </Grid>
          <Grid item xs={4}>
            {measurementsData && <AvgTemperature lastValues={measurementsData} doorsDataResponse={doorsData} espid="1" />}
          </Grid>
          <Grid item xs={4}>
            {measurementsData && <AvgTemperature lastValues={measurementsData} doorsDataResponse={doorsData} espid="2" />}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
