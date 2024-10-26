import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';

const generateData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) { // Genera 10 filas
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // Resta 5 minutos por fila
      data.push({
        temperature: (Math.random() * 10 + 20).toFixed(1), // Temperatura entre 20 y 30
        pressure: (Math.random() * 10 + 1000).toFixed(1), // Presión entre 1000 y 1010
        humidity: (Math.random() * 20 + 40).toFixed(1), // Humedad entre 40 y 60
        time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`,
      });
    }
    
    return data;
};

const DataTable = () => {
    return (
        <DashboardCard title="Valores">
            <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
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
                        {generateData().map((product) => (
                            <TableRow key={product.time} sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {product.time}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {product.temperature}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {product.pressure}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {product.humidity}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </DashboardCard>
    );
};

export default DataTable;
