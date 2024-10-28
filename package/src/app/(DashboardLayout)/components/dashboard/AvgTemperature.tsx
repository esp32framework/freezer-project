
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconArrowUpRight ,IconTemperatureCelsius } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface AvgTemperatureProps {
  lastValues: ApiResponse;
}

const AvgTemperature : React.FC<AvgTemperatureProps> = ({ lastValues }) => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
      height: 60,
      sparkline: {
        enabled: true,
      },
      group: 'sparklines',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      colors: [secondarylight],
      type: 'solid',
      opacity: 0.05,
    },
    markers: {
      size: 0,
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
    },
  };

  const temperature = lastValues.measurements.map((row) => row.temperature);
  const average = (arr: any) => arr.reduce( ( p: number, c: number ) => p + c, 0 ) / arr.length;
  const seriescolumnchart: any = [
    {
      name: '',
      color: secondary,
      data: temperature,
    },
  ];

  return (
    <DashboardCard
      title="Promedio de temperatura"
      action={
        <Fab color="secondary" size="medium" sx={{color: '#ffffff'}}>
          <IconTemperatureCelsius width={24} />
        </Fab>
      }
      footer={
        <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60} width={"100%"} />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          {average(temperature)}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
          {temperature[temperature.length - 2] < temperature[temperature.length - 1] ? (
                <IconArrowUpRight width={20} color="green" />
            ) : (
                <IconArrowDownRight width={20} color="red" />
            )}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {temperature[temperature.length - 1]}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Ultima medicion
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default AvgTemperature;
