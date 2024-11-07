import {
  Stack,
  Typography,
  Avatar,
  Fab,
  Box,
  Divider,
  Badge,
  Popover,
} from "@mui/material";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconTemperature,
  IconCloud,
  IconArrowsMinimize,
  IconArrowRight,
  IconDoor,
} from "@tabler/icons-react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import { useState } from "react";

interface AvgTemperatureProps {
  lastValues: MeasurementsResponse;
  doorsDataResponse: DoorsDataResponse | null;
  espid: string;
}

const SUBTITLE_VARIANT = "h5";

const getMeasurementInfo = (
  measurements: number[]
): [number, number, JSX.Element] => {
  //const measurementsArray = measurements.map((row) => row.temperature);
  const avg: number =
    measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const variation: number = parseFloat(
    (measurements[0] - measurements[1]).toFixed(2)
  );
  let icon;
  if (variation < 0) {
    icon = <IconArrowDownRight width={20} color="red" />;
  }
  if (variation > 0) {
    icon = <IconArrowUpRight width={20} color="green" />;
  } else {
    icon = <IconArrowRight width={20} color="grey" />;
  }

  return [avg, variation, icon];
};

const AvgTemperature: React.FC<AvgTemperatureProps> = ({
  lastValues,
  doorsDataResponse,
  espid,
}) => {
  // chart color
  const errorlight = "#fdede8";

  let espValues = lastValues.measurements.filter(
    (row) => row.espid.toString() === espid
  );

  console.log("Data for esp ", espid, " is: ", espValues);

  let [tempAvg, tempVariation, tempIcon] = getMeasurementInfo(
    espValues.map((row) => row.temperature)
  );
  let [pressAvg, pressVariation, pressIcon] = getMeasurementInfo(
    espValues.map((row) => row.pressure)
  );
  let [humidityAvg, humidityVariation, humiditIcon] = getMeasurementInfo(
    espValues.map((row) => row.humidity)
  );

  const title = "Promedios ESP-" + espid;
  const popupText = "Heladera " + espid + " abierta hace mas de 5 minutos";

  const [anchorEl, setAnchorEl] = useState<SVGSVGElement | null>(null);

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    setAnchorEl(event.currentTarget); // Asigna el elemento SVG como anchorEl
  };

  const handleClose = () => {
    setAnchorEl(null); // Cierra el Popover
  };

  const open = Boolean(anchorEl);
  // const open = true;
  const id = open ? "simple-popover" : undefined;

  const showDoorIcon = (doorsDataResponse == null || doorsDataResponse.doors_data.length) == 0 ? false : doorsDataResponse?.doors_data.filter((doorData) => doorData.espid == Number(espid)); 

  return (
    <DashboardCard>
      <>
        <Box marginBottom={4}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            marginBottom={3}
          >
            <Typography variant="h4" marginBottom={4}>
              {title}
            </Typography>
            {showDoorIcon && (
            <Badge
              badgeContent={
                <span style={{ fontSize: "1.0rem", color: "white" }}>!</span>
              }
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#DC143C",
                  color: "white",
                },
              }}
            >
              <IconDoor
              width={20}
              color="black"
              aria-describedby={id}
              onClick={handleClick} // Utiliza el tipo de evento correcto
              />
            
            </Badge>
            )}
            
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Typography sx={{ p: 2 }}>{popupText}</Typography>
            </Popover>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            marginBottom={3}
          >
            <Typography
              variant={SUBTITLE_VARIANT}
              fontWeight="700"
              mt="-20px"
              marginRight={10}
            >
              Temperatura
            </Typography>
            <Fab color="secondary" size="medium" sx={{ color: "#ffffff" }}>
              <IconTemperature width={20} color="black" />{" "}
            </Fab>
          </Stack>

          <Typography variant={SUBTITLE_VARIANT} fontWeight="700" mt="-20px">
            {tempAvg.toFixed(2)}°C
          </Typography>
          <Stack direction="row" spacing={1} my={1} alignItems="center">
            <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
              {tempIcon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {tempVariation.toFixed(2)}°C
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Respecto a ultima medicion
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Box marginBottom={4} marginTop={5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            marginBottom={3}
          >
            <Typography
              variant={SUBTITLE_VARIANT}
              fontWeight="700"
              mt="-20px"
              marginRight={10}
            >
              Presión
            </Typography>
            <Fab color="secondary" size="medium" sx={{ color: "#ffffff" }}>
              <IconArrowsMinimize width={20} color="black" />
            </Fab>
          </Stack>
          <Typography variant={SUBTITLE_VARIANT} fontWeight="700" mt="-20px">
            {pressAvg.toFixed(2)} hPa
          </Typography>
          <Stack direction="row" spacing={1} my={1} alignItems="center">
            <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
              {pressIcon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {pressVariation.toFixed(2)} hPa
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Respecto a ultima medicion
            </Typography>
          </Stack>
        </Box>
        <Divider />
        <Box marginTop={5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            marginBottom={3}
          >
            <Typography
              variant={SUBTITLE_VARIANT}
              fontWeight="700"
              mt="-20px"
              marginRight={10}
            >
              Humedad
            </Typography>
            <Fab color="secondary" size="medium" sx={{ color: "#ffffff" }}>
              <IconCloud width={20} color="black" />{" "}
            </Fab>
          </Stack>
          <Typography variant={SUBTITLE_VARIANT} fontWeight="700" mt="-20px">
            {humidityAvg.toFixed(2)} %
          </Typography>
          <Stack direction="row" spacing={1} my={1} alignItems="center">
            <Avatar sx={{ bgcolor: errorlight, width: 27, height: 27 }}>
              {humiditIcon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {humidityVariation.toFixed(2)} %
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Respecto a ultima medicion
            </Typography>
          </Stack>
        </Box>
      </>
    </DashboardCard>
  );
};

export default AvgTemperature;
