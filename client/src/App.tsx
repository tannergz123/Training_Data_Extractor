import { GlobalThemeProvider, VStack, Text } from 'arc';
import Header from './components/layout/Header';
import { ExtractionForm } from './components/ExtractionForm';

export function App() {
    return (
        <GlobalThemeProvider theme="light">
            <VStack minH="100vh" bg="surface.background" align="stretch" gap={0}>
                <Header />
                <VStack maxW="900px" mx="auto" px={4} py={6} align="stretch" gap={4} w="100%">
                    <Text variant="caption" color="secondary">
                        Extract RMS report data into Blacksmith-compatible JSON files for training tenant population
                    </Text>
                    <ExtractionForm />
                </VStack>
            </VStack>
        </GlobalThemeProvider>
    );
}
