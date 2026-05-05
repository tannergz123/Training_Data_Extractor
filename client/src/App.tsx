import { GlobalThemeProvider, Box, Flex, Text } from 'arc';
import { ExtractionForm } from './components/ExtractionForm';

export function App() {
    return (
        <GlobalThemeProvider theme="light">
            <Box minH="100vh" bg="surface.background">
                <Flex bg="surface.foreground" p={4} alignItems="center" gap={2}>
                    <img
                        src="./assets/mark43-logo.svg"
                        alt="Mark43"
                        height={32}
                    />
                    <Text fontWeight="bold">Training Data Extractor</Text>
                </Flex>
                <Box p={4} maxWidth="800px">
                    <Box mb={4}>
                        <Text color="secondary">
                            Extract RMS report data into Blacksmith-compatible JSON files for training tenant population
                        </Text>
                    </Box>
                    <ExtractionForm />
                </Box>
            </Box>
        </GlobalThemeProvider>
    );
}
