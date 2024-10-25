import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });


const SalesOverview = () => {

    // select
    const [month, setMonth] = React.useState('1');

    const handleChange = (event: any) => {
        setMonth(event.target.value);
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
        // plotOptions: {
        //     bar: {
        //         horizontal: false,
        //         barHeight: '60%',
        //         columnWidth: '42%',
        //         borderRadius: [6],
        //         borderRadiusApplication: 'end',
        //         borderRadiusWhenStacked: 'all',
        //     },
        // },

        // stroke: {
        //     show: true,
        //     width: 5,
        //     lineCap: "butt",
        //     colors: ["transparent"],
        //   },
        // dataLabels: {
        //     enabled: false,
        // },
        // legend: {
        //     show: false,
        // },
        // grid: {
        //     borderColor: 'rgba(0,0,0,0.1)',
        //     strokeDashArray: 3,
        //     xaxis: {
        //         lines: {
        //             show: false,
        //         },
        //     },
        // },
        // yaxis: {
        //     tickAmount: 4,
        // },
        xaxis: {
            categories: ['16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08'],
            axisBorder: {
                show: false,
            },
        },
        // tooltip: {
        //     theme: 'dark',
        //     fillSeriesColor: false,
        // },
    };
    const seriescolumnchart: any = [ // aca llamar al back para conseguir los datos
        {
            name: 'ESP 1',
            data: [-0.7,0.1,0.0,-1.5,-2.3,0.4,0.5,0.6],
        },
        {
            name: 'ESP 2',
            data: [-0.2,0.4,0.4,-0.4,0.5,-0.3,2.5,1.6],
        },
    ];

    return (
        <DashboardCard title="Valores Generales" action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={month}
                size="small"
                onChange={handleChange}
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

export default SalesOverview;
