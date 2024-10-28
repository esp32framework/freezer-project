'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
import GeneralValues from '@/app/(DashboardLayout)/components/dashboard/GeneralValues';
import YearlyBreakup from '@/app/(DashboardLayout)/components/dashboard/YearlyBreakup';
import DataTable from '@/app/(DashboardLayout)/components/dashboard/DataTable';
import AvgTemperature from '@/app/(DashboardLayout)/components/dashboard/AvgTemperature';


// function fetchData(): Promise<ApiResponse> {
//   return new Promise((resolve, reject) => {
//     fetch('/api/esp-data') // Cambiado a la ruta relativa
//       .then(response => {
//         if (response.ok) {
//           return response.json() as Promise<ApiResponse>;
//         }
//         throw new Error('Error fetching data');
//       })
//       .then(data => resolve(data)) // Resuelve la promesa con los datos obtenidos
//       .catch(error => reject(error)); // Rechaza la promesa en caso de error
//   });
// }

function fetchData(): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    fetch('/api/esp-data')
      .then(response => {
        if (response.ok) {
          console.log("LA RESPONSE ES:. ", response);
          return response.json(); // Ajusta el tipo de respuesta
        }
        throw new Error('Error fetching data');
      })
      .then(data => {
        console.log("LA data ES:. ", data);
        // Mapeo de rows a Measurement
        const measurements: Measurement[] = data.measurements.rows.map((row: any) => ({
          time: new Date(row.time), // Convierte la cadena de tiempo a un objeto Date
          temperature: parseFloat(row.temperature), // Convierte a número
          humidity: parseFloat(row.humidity),       // Convierte a número
          pressure: parseFloat(row.pressure),       // Convierte a número
          espid: parseInt(row.espid),               // Convierte a número entero
        }));
        
        // Resuelve la promesa con el ApiResponse
        resolve({ measurements });
      })
      .catch(error => reject(error));
  });
}

const Dashboard = () => {

  return fetchData().then(data => {
    console.log("Esta es la data data: ", data.measurements);
    data.measurements.toReversed();
    return (
      <PageContainer title="Proyecto Freezer" description="this is Dashboard">
        <Box>
          <div className="flex"> 
            <div >
              <h1 className="text-3x2 font-bold">
                Panel general        
              </h1>
              <p className="text-sm px-3 py-10 font-bold">
                esto es de prueba
              </p>
            </div>
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <GeneralValues lastValues={data}/>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <YearlyBreakup />
                </Grid>
                <Grid item xs={12}>
                  <AvgTemperature lastValues={data}/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} lg={8}>
              <DataTable lastValues={data}/>
            </Grid>
            {/* <Grid item xs={12}>
              <Blog />
            </Grid> */}
          </Grid>
        </Box>
      </PageContainer>
    )
  })
  .catch(error => {
    console.error('Error:', error); // Imprime el error en caso de fallo
  });
}

export default Dashboard;
