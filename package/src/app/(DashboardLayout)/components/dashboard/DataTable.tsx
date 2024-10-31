import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";

interface DataTableProps {
  lastValues: ApiResponse;
}

const DataTable: React.FC<DataTableProps> = ({ lastValues }) => {
  // Función para exportar datos a CSV
  const exportToCSV = () => {
    const headers = ["ESP-ID", "Time", "Temperature", "Pressure", "Humidity"];
    const rows = lastValues.measurements.map((measurement) => [
      measurement.espid,
      `${measurement.time.getHours()}:${measurement.time.getMinutes()}:${measurement.time.getSeconds()}`,
      measurement.temperature,
      measurement.pressure,
      measurement.humidity,
    ]);

    // Generar CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Crear archivo para descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "table_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardCard>
      <>
        <Box
          sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            >
            <Typography variant="h4" color="black">
                Valores
            </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={exportToCSV}
            startIcon={<DownloadIcon />}
          >
            Descargar CSV
          </Button>
        </Box>
        <Box 
          sx={{ overflow: "auto", width: { xs: "280px", sm: "auto" }, mt: 2 }}
        >
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: "nowrap",
              mt: 2,
            }}
          >
            <TableHead>
              <TableRow
                sx={{ borderBottom: "5px solid", borderColor: "divider" }}
              >
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
              {lastValues.measurements.map((measurement) => (
                <TableRow
                  key={measurement.time.getUTCDate()}
                  sx={{ borderBottom: "2px solid", borderColor: "divider" }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                      {measurement.espid}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                      {measurement.time.getHours()}:
                      {measurement.time.getMinutes()}:
                      {measurement.time.getSeconds()}
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
