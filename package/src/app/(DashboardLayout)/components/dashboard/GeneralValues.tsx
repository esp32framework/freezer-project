import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const AMOUNT_OF_DAYS = 8;

const GeneralValues = () => {
    const [metric, setMetric] = React.useState(1); // 1: Temperatura, 2: Humedad, 3: Presión

    const handleDashboardChange = (event: any) => {
        setMetric(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // chart
    const optionscolumnchart: any = {
        chart: {
            type: 'area',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, secondary],
        xaxis: {

            categories: ['16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08'],
            axisBorder: {
                show: false,
            },
        },
    };

    const data = {
        temperature: [
            { name: 'ESP 1', data: [22.3, 23.1, 21.9, 20.8, 22.0, 23.5, 24.1, 22.9] },
            { name: 'ESP 2', data: [21.8, 22.0, 22.5, 22.3, 23.0, 23.3, 22.8, 23.1] },
        ],
        humidity: [
            { name: 'ESP 1', data: [65, 60, 62, 58, 64, 66, 63, 61] },
            { name: 'ESP 2', data: [60, 63, 64, 62, 65, 67, 61, 64] },
        ],
        pressure: [
            { name: 'ESP 1', data: [1012, 1013, 1011, 1010, 1012, 1014, 1015, 1013] },
            { name: 'ESP 2', data: [1011, 1012, 1013, 1011, 1010, 1013, 1014, 1012] },
        ],
    };
    
    // Selección de serie según la métrica
    const seriescolumnchart = React.useMemo(() => {
        if (metric === 1) return data.temperature;
        if (metric === 2) return data.humidity;
        return data.pressure;
    }, [data.humidity, data.pressure, data.temperature, metric]);


    return (
        <DashboardCard title="Valores Generales" action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={metric}
                size="small"
                onChange={handleDashboardChange}
            >
                <MenuItem value={1}>Temperatura</MenuItem>
                <MenuItem value={2}>Humedad</MenuItem>
                <MenuItem value={3}>Presion</MenuItem>
            </Select>
        }>
            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="area"
                height={370} width={"100%"}
            />
        </DashboardCard>
    );
};

export default GeneralValues;
