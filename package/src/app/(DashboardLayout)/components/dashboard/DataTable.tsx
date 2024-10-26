import {
    Typography, Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';

interface DataTableProps {
    lastValues: ApiResponse;
}

const DataTable: React.FC<DataTableProps> = ({ lastValues }) => {
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
                        {lastValues.measurements.map((measurement) => (
                            <TableRow key={measurement.time.getUTCDate()} sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
                                <TableCell sx={{ textAlign: "center" }}>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
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
        </DashboardCard>
    );
};

export default DataTable;
