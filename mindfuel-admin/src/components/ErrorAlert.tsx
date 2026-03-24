import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorAlertProps {
  error: string | Error;
  onRetry?: () => void;
}

export default function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Box p={2}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" startIcon={<Refresh />} onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>Error</AlertTitle>
        {errorMessage}
      </Alert>
    </Box>
  );
}
