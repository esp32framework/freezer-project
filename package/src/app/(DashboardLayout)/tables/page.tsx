"use client";
import { useState, useEffect } from "react";
import { Grid, Box, Typography, Select, MenuItem } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import DataTable from "../components/dashboard/DataTable";
import { unstable_noStore } from "next/cache";

export const dynamic = "force-dynamic";

const INTERVAL_OPTIONS = {
  1: 10, // 10 segundos
  2: 60, // 1 minuto
  3: 300, // 5 minutos
};

async function fetchData(): Promise<MeasurementsResponse> {
  try {
    const response = await fetch("/api/esp-data/get-all", { cache: "no-store" });
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

const Table = () => {
  const [data, setData] = useState<MeasurementsResponse | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(3); // Valor inicial: 5 minutos

  useEffect(() => {
    const updateData = async () => {
      try {
        console.log("Haciendo el fetch");
        const newData = await fetchData();
        console.log("data: ", newData);
        setData(newData);
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
    <PageContainer title="Proyecto Freezer" description="Datos">
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
          <Typography variant="h1">Tabla de Datos</Typography>
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
        <Grid container spacing={3}>
          <Grid item xs={12} lg={12}>
            {data && <DataTable lastValues={data} />}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Table;
