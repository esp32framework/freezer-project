import {
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardCard from "@/app/(DashboardLayout)//components/shared/DashboardCard";
import { useState } from "react";
import DropDownFilters from "./DropDownFilters";

export const dynamic = "force-dynamic";

interface DataTableProps {
  lastValues: MeasurementsResponse;
}

const DataTable: React.FC<DataTableProps> = ({ lastValues }) => {
  // Estados de filtros
  const [espidFilter, setEspidFilter] = useState<string>("");
  const [minTemp, setMinTemp] = useState<number | "">("");
  const [maxTemp, setMaxTemp] = useState<number | "">("");
  const [minPress, setMinPress] = useState<number | "">("");
  const [maxPress, setMaxPress] = useState<number | "">("");
  const [minHum, setMinHum] = useState<number | "">("");
  const [maxHum, setMaxHum] = useState<number | "">("");

  // Función para exportar datos a CSV
  const exportToCSV = () => {
    const headers = ["ESP-ID", "Time", "Temperature", "Pressure", "Humidity"];
    const rows = filteredData.map((measurement) => [
      measurement.espid,
      `${measurement.time.getHours()}:${measurement.time.getMinutes()}:${measurement.time.getSeconds()}`,
      measurement.temperature,
      measurement.pressure,
      measurement.humidity,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
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
    const espidMatch = (espidFilter === "") || (measurement.espid.toString().includes(espidFilter));
    
    const temperatureMatch =
      ((minTemp === "") || (measurement.temperature >= Number(minTemp))) &&
      ((maxTemp === "") || measurement.temperature <= Number(maxTemp));
    
    const pressureMatch =
      ((minPress === "") || measurement.pressure >= Number(minPress)) &&
      ((maxPress === "") || measurement.pressure <= Number(maxPress));
    
    const humidityMatch =
      (minHum === "" || measurement.humidity >= Number(minHum)) &&
      (maxHum === "" || measurement.humidity <= Number(maxHum));
  
    return espidMatch && temperatureMatch && pressureMatch && humidityMatch;
  });

  console.log("Filtered: ", filteredData);

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
          <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}>
            <Typography variant="h4">Valores</Typography>
            <DropDownFilters espidFilter={espidFilter} setEspidFilter={setEspidFilter} 
            minTemp={minTemp} maxTemp={maxTemp} setMinTemp={setMinTemp} setMaxTemp={setMaxTemp} 
            minHum={minHum} maxHum={maxHum} setMinHum={setMinHum} setMaxHum={setMaxHum}
            minPress={minPress} maxPress={maxPress} setMinPress={setMinPress} setMaxPress={setMaxPress} />
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={exportToCSV}
              startIcon={<DownloadIcon />}
            >
              Descargar CSV
            </Button>
          </Box>
        </Box>
        {/* Tabla */}
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
                    Temperature (°C)
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Pressure (hPa)
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Humidity (%)
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((measurement, index) => (
                <TableRow
                key={index}
                sx={{ borderBottom: "2px solid", borderColor: "divider" }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                      {measurement.espid} 
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: "500" }}>
                      {measurement.time
                        .toLocaleString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                        .replace(",", "-")}
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
