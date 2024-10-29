"use client";
import { useState, useEffect } from "react";
import { Grid, Box } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import GeneralValues from "@/app/(DashboardLayout)/components/dashboard/GeneralValues";
import AvgTemperature from "@/app/(DashboardLayout)/components/dashboard/AvgMeasurements";

export const dynamic = 'force-dynamic'

const INTERVAL_SECONDS = 60 * 5;

async function fetchData(): Promise<ApiResponse> {
  try {
    const response = await fetch("/api/test", { cache: 'no-store' }); 
    if (!response.ok) throw new Error("Error fetching data");
    const data = await response.json();

    const measurements: Measurement[] = data.measurements.rows.map((row: any) => ({
      time: new Date(row.time),
      temperature: parseFloat(row.temperature),
      humidity: parseFloat(row.humidity),
      pressure: parseFloat(row.pressure),
      espid: parseInt(row.espid),
    }));

    return { measurements };
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

const Dashboard = () => {
  const [data, setData] = useState<ApiResponse | null>(null);

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

    // Interval of 1 minute
    const intervalId = setInterval(updateData, INTERVAL_SECONDS * 1000);

    // Clean interval
    return () => clearInterval(intervalId);
  }, []);

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
            {data && <GeneralValues lastValues={data} />}
          </Grid>
          <Grid item xs={4}>
            {data && <AvgTemperature lastValues={data} espid="1" />}
          </Grid>
          <Grid item xs={4}>
            {data && <AvgTemperature lastValues={data} espid="2" />}
          </Grid>
          <Grid item xs={4}>
            {data && <AvgTemperature lastValues={data} espid="3" />}
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
