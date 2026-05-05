import { GlobalThemeProvider, Text } from 'arc';
import Header from './components/layout/Header';
import { ExtractionForm } from './components/ExtractionForm';

export function App() {
    return (
        <GlobalThemeProvider theme="light">
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--arc-colors-surface-page)' }}>
                <Header />
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
                    <Text variant="caption" color="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                        Extract RMS report data into Blacksmith-compatible JSON files for training tenant population
                    </Text>
                    <ExtractionForm />
                </div>
            </div>
        </GlobalThemeProvider>
    );
}
