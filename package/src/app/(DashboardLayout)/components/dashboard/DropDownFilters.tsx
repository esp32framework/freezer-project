import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, TextField } from "@mui/material";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

type DropDownFiltersProps = {
  espidFilter: string;
  setEspidFilter: (s: string) => void;
  minTemp: number | "";
  setMinTemp: (n: number | "") => void;
  maxTemp: number | ""; 
  setMaxTemp: (n: number | "") => void;
  minPress: number | "";
  setMinPress: (n: number | "") => void;
  maxPress: number | ""; 
  setMaxPress: (n: number | "") => void;
  minHum: number | "";
  setMinHum: (n: number | "") => void;
  maxHum: number | ""; 
  setMaxHum: (n: number | "") => void;
};

export default function DropDownFilters({
  espidFilter,
  setEspidFilter,
  minTemp,
  setMinTemp,
  maxTemp, 
  setMaxTemp,
  minPress,
  setMinPress,
  maxPress, 
  setMaxPress,
  minHum,
  setMinHum,
  maxHum, 
  setMaxHum,
}: DropDownFiltersProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };



  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Filtros
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableAutoFocusItem 
      >
        <MenuItem onClick={(e) => e.stopPropagation()}>
          {" "}
          {/* Evita que el menú se cierre al hacer clic */}
          <TextField
            label="Filtrar por ESP-ID"
            variant="outlined"
            size="small"
            autoFocus
            value={espidFilter}
            onChange={(e) => setEspidFilter(e.target.value)}
          />
        </MenuItem>
        <MenuItem>
          <IntegerRangeField
            fromValue={minTemp}
            toValue={maxTemp}
            setFromValue={setMinTemp}
            setToValue={setMaxTemp}
            title="Temperatura"
          />
        </MenuItem>
        <MenuItem>
          <IntegerRangeField
            fromValue={minPress}
            toValue={maxPress}
            setFromValue={setMinPress}
            setToValue={setMaxPress}
            title="Presión"
          />
        </MenuItem>
        <MenuItem>
          <IntegerRangeField
            fromValue={minHum}
            toValue={maxHum}
            setFromValue={setMinHum}
            setToValue={setMaxHum}
            title="Humedad"
          />
        </MenuItem>
      </StyledMenu>
    </div>
  );
}

type IntegerRangeFieldProps = {
  fromValue: number | "";
  toValue: number | "";
  setFromValue: (value: number | "") => void;
  setToValue: (value: number | "") => void;
  title: string;
}

function IntegerRangeField({
  fromValue,
  toValue,
  setFromValue,
  setToValue,
  title,
}: IntegerRangeFieldProps) {
  return (
    <Box display="flex" gap={2}>
      <TextField
        label={`${title} Mínima`}
        type="number"
        variant="outlined"
        size="small"
        value={fromValue}
        onChange={(e) => setFromValue(e.target.value === "" ? "" : Number(e.target.value))}
      />
      <TextField
        label={`${title} Máxima`}
        type="number"
        variant="outlined"
        size="small"
        value={toValue}
        onChange={(e) => setToValue(e.target.value === "" ? "" : Number(e.target.value))}
      />
    </Box>
  );
}


