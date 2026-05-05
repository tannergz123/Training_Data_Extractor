import { Flex, Text, ThemeProvider } from 'arc';
import { dark } from '@arc/core/dist/theme/token';

export default function Header() {
    return (
        <ThemeProvider theme={dark}>
            <header>
                <Flex alignItems="center" gap={4} px={6} py={3} bg="surface.foreground">
                    <img src="./assets/mark43-logo-dark-mode.svg" alt="Mark43 Logo" height={40} />
                    <Flex flex={1} alignItems="center" gap={2}>
                        <Text variant="headingMd" color="text.primary">
                            Training Data Extractor
                        </Text>
                    </Flex>
                    <Text variant="caption" color="text.secondary">v0.1.0</Text>
                </Flex>
            </header>
        </ThemeProvider>
    );
}
