import React from 'react'
import { Box, TextField, Button } from '@material-ui/core';

const EmployeeDesignationSearcher = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#e0f7f9',
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          sx={{ flex: 1 }}
        />
        <TextField
          label="User ID"
          variant="outlined"
          fullWidth
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => console.log('Filters reset')}
        >
          Reset Filters
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log('Search executed')}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}

export default EmployeeDesignationSearcher