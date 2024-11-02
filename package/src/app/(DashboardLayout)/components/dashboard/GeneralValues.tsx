import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const AMOUNT_OF_DAYS = 8;

// Define los tipos de los props que el componente espera recibir
interface GeneralValuesProps {
    lastValues: ApiResponse;
}

const GeneralValues: React.FC<GeneralValuesProps> = ({ lastValues }) => {
    const [metric, setMetric] = React.useState(1); // 1: Temperatura, 2: Humedad, 3: Presión

    const handleDashboardChange = (event: any) => {
        setMetric(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

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
            type: 'datetime',  // Asegura que el eje x interprete los valores de tiempo
            axisBorder: {
                show: false,
            },
        },
    };

    const data = {
        temperature: [
            { name: 'ESP 0', data: lastValues.measurements
                .filter((row) => row.espid === 0)
                .map((row) => ({ x: new Date(row.time), y: row.temperature })) },
            { name: 'ESP 1', data: lastValues.measurements
                .filter((row) => row.espid === 1)
                .map((row) => ({ x: new Date(row.time), y: row.temperature })) },
            { name: 'ESP 2', data: lastValues.measurements
                .filter((row) => row.espid === 2)
                .map((row) => ({ x: new Date(row.time), y: row.temperature })) },
        ],
        humidity: [
            { name: 'ESP 0', data: lastValues.measurements
                .filter((row) => row.espid === 0)
                .map((row) => ({ x: new Date(row.time), y: row.humidity })) },
            { name: 'ESP 1', data: lastValues.measurements
                .filter((row) => row.espid === 1)
                .map((row) => ({ x: new Date(row.time), y: row.humidity })) },
            { name: 'ESP 2', data: lastValues.measurements
                .filter((row) => row.espid === 2)
                .map((row) => ({ x: new Date(row.time), y: row.humidity })) },
        ],
        pressure: [
            { name: 'ESP 0', data: lastValues.measurements
                .filter((row) => row.espid === 0)
                .map((row) => ({ x: new Date(row.time), y: row.pressure })) },
            { name: 'ESP 1', data: lastValues.measurements
                .filter((row) => row.espid === 1)
                .map((row) => ({ x: new Date(row.time), y: row.pressure })) },
            { name: 'ESP 2', data: lastValues.measurements
                .filter((row) => row.espid === 2)
                .map((row) => ({ x: new Date(row.time), y: row.pressure })) },
        ],
    };
    
    // Selección de serie según la métrica
    const seriescolumnchart = React.useMemo(() => {
        if (metric === 1) return data.temperature;
        if (metric === 2) return data.humidity;
        return data.pressure;
    }, [metric, lastValues]);


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
