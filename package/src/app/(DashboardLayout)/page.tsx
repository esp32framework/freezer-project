'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
import GeneralValues from '@/app/(DashboardLayout)/components/dashboard/GeneralValues';
import YearlyBreakup from '@/app/(DashboardLayout)/components/dashboard/YearlyBreakup';
import RecentTransactions from '@/app/(DashboardLayout)/components/dashboard/RecentTransactions';
import DataTable from '@/app/(DashboardLayout)/components/dashboard/DataTable';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import PromedioTemperatura from '@/app/(DashboardLayout)/components/dashboard/PromedioTemperatura';

const Dashboard = () => {
  return (
    <PageContainer title="Proyecto Freezer" description="this is Dashboard">
      <Box>
        <div className="flex"> 
          <div >
            <h1 className="text-3x2 font-bold">
              Panel general        
            </h1>
            <p className="text-sm px-3 py-10">
              esto es de prueba
            </p>
          </div>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <GeneralValues />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <YearlyBreakup />
              </Grid>
              <Grid item xs={12}>
                <PromedioTemperatura />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} lg={8}>
            <DataTable />
          </Grid>
          {/* <Grid item xs={12}>
            <Blog />
          </Grid> */}
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
