'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertTitle, Button, Stack } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>WebGL Error</AlertTitle>
          <Stack spacing={1}>
            <div>Unable to initialize the 3D visualization.</div>
            <Button variant="outlined" onClick={() => this.setState({ hasError: false })}>
              Retry
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}
