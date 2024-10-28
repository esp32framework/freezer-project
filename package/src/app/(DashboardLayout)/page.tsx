"use client";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
// components
import GeneralValues from "@/app/(DashboardLayout)/components/dashboard/GeneralValues";
import YearlyBreakup from "@/app/(DashboardLayout)/components/dashboard/YearlyBreakup";
import DataTable from "@/app/(DashboardLayout)/components/dashboard/DataTable";
import AvgTemperature from "@/app/(DashboardLayout)/components/dashboard/AvgMeasurements";

function fetchData(): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    fetch("/api/test") // TOD: CHANGE API ENDPOINT
      .then((response) => {
        if (response.ok) {
          console.log("LA RESPONSE ES:. ", response);
          return response.json(); // Ajusta el tipo de respuesta
        }
        throw new Error("Error fetching data");
      })
      .then((data) => {
        console.log("LA data ES:. ", data);
        // Mapeo de rows a Measurement
        const measurements: Measurement[] = data.measurements.rows.map(
          (row: any) => ({
            time: new Date(row.time), // Convierte la cadena de tiempo a un objeto Date
            temperature: parseFloat(row.temperature), // Convierte a número
            humidity: parseFloat(row.humidity), // Convierte a número
            pressure: parseFloat(row.pressure), // Convierte a número
            espid: parseInt(row.espid), // Convierte a número entero
          })
        );

        // Resuelve la promesa con el ApiResponse
        resolve({ measurements });
      })
      .catch((error) => reject(error));
  });
}

const Dashboard = () => {
  return fetchData()
    .then((data) => {
      console.log("Esta es la data data: ", data.measurements);
      return (
        <PageContainer title="Proyecto Freezer" description="this is Dashboard">
          <Box>
            <div className="flex">
              <div>
                <h1 className="text-3x2 font-bold">Panel general</h1>
              </div>
            </div>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={12}>
                <GeneralValues lastValues={data} />
              </Grid>
              <Grid item xs={4}>
                <AvgTemperature lastValues={data} espid="1"/>
              </Grid>
              <Grid item xs={4}>
                <AvgTemperature lastValues={data} espid="2"/>
              </Grid>
              <Grid item xs={4}>
                <AvgTemperature lastValues={data} espid="3"/>
              </Grid>
            </Grid>
          </Box>
        </PageContainer>
      );
    })
    .catch((error) => {
      console.error("Error:", error); // Imprime el error en caso de fallo
    });
};

export default Dashboard;
