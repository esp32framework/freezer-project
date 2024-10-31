import {
    Typography, Box, Button, TextField,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';
import { useState } from 'react';

interface DataTableProps {
    lastValues: ApiResponse;
}

const DataTable: React.FC<DataTableProps> = ({ lastValues }) => {
    // Estados de filtros
    const [espidFilter, setEspidFilter] = useState<string>("");
    const [temperatureFilter, setTemperatureFilter] = useState<number | "">("");
    const [pressureFilter, setPressureFilter] = useState<number | "">("");
    const [humidityFilter, setHumidityFilter] = useState<number | "">("");

    // Función para exportar datos a CSV
    const exportToCSV = () => {
        const headers = ["ESP-ID", "Time", "Temperature", "Pressure", "Humidity"];
        const rows = filteredData.map((measurement) => [
            measurement.espid,
            `${measurement.time.getHours()}:${measurement.time.getMinutes()}:${measurement.time.getSeconds()}`,
            measurement.temperature,
            measurement.pressure,
            measurement.humidity
        ]);

        const csvContent = [
            headers.join(","), 
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "table_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtrar datos
    const filteredData = lastValues.measurements.filter((measurement) => {
        const espidMatch = measurement.espid.toString().includes(espidFilter);
        const temperatureMatch = temperatureFilter === "" || measurement.temperature >= temperatureFilter;
        const pressureMatch = pressureFilter === "" || measurement.pressure >= pressureFilter;
        const humidityMatch = humidityFilter === "" || measurement.humidity >= humidityFilter;

        return espidMatch && temperatureMatch && pressureMatch && humidityMatch;
    });

    return (
        <DashboardCard title="Valores">
            <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={exportToCSV}
                    startIcon={<DownloadIcon />}
                >
                    Descargar CSV
                </Button>
            </Box>
            {/* Filtros */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                    label="Filtrar por ESP-ID"
                    variant="outlined"
                    size="small"
                    value={espidFilter}
                    onChange={(e) => setEspidFilter(e.target.value)}
                />
                <TextField
                    label="Temperatura mínima"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={temperatureFilter}
                    onChange={(e) => setTemperatureFilter(e.target.value ? parseFloat(e.target.value) : "")}
                />
                <TextField
                    label="Presión mínima"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={pressureFilter}
                    onChange={(e) => setPressureFilter(e.target.value ? parseFloat(e.target.value) : "")}
                />
                <TextField
                    label="Humedad mínima"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={humidityFilter}
                    onChange={(e) => setHumidityFilter(e.target.value ? parseFloat(e.target.value) : "")}
                />
            </Box>
            {/* Tabla */}
            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' }, mt: 2 }}>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: "nowrap",
                        mt: 2
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ borderBottom: "5px solid", borderColor: "divider" }}>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    ESP-ID
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Time
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Temperature
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Pressure
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Humidity
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((measurement) => (
                            <TableRow key={measurement.time.getTime()} sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                                        {measurement.espid}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                                        {measurement.time.getHours()}:{measurement.time.getMinutes()}:{measurement.time.getSeconds()}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {measurement.temperature}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {measurement.pressure}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {measurement.humidity}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            </>
        </DashboardCard>
    );
};

export default DataTable;
