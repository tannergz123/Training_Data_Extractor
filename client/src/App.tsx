import { GlobalThemeProvider, Box, Text } from 'arc';

export function App() {
    return (
        <GlobalThemeProvider theme="light">
            {/* @ts-expect-error arc Box type union too complex */}
            <Box p={4}>
                <Box mb={3} display="flex" alignItems="center" gap={2}>
                    <img
                        src="./assets/mark43-logo.svg"
                        alt="Mark43"
                        height={32}
                    />
                </Box>
                <Text as="h1" variant="headingLg">
                    Training Data Extractor
                </Text>
                <Text color="secondary">Extract RMS report data into Blacksmith-compatible JSON files for training tenant population</Text>
            </Box>
        </GlobalThemeProvider>
    );
}
