
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconArrowUpRight ,IconTemperatureCelsius } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

interface GeneralValuesProps {
  lastValues: ApiResponse;
}

const PromedioTemperatura: React.FC<GeneralValuesProps> = ({lastValues}) => {
  // chart color
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = '#fdede8';

  const temp = lastValues.measurements.map((row) => row.temperature);
  const promedio = temp.reduce((a, b) => a + b, 0) / temp.length;
  const variacion: number = parseFloat((temp[temp.length - 1] - temp[temp.length - 2]).toFixed(2));
  let icon;
  if (variacion < 0) {
    icon = <IconArrowDownRight width={20} color="red" />;
  } else {
    icon = <IconArrowUpRight width={20} color="green" />;
  }
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
  const seriescolumnchart: any = [
    {
      name: '',
      color: secondary,
      data: temp,
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
          {promedio}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
            {icon}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {variacion}°C
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Ultima medicion 
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default PromedioTemperatura;
