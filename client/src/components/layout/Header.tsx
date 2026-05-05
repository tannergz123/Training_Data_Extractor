import { Flex, Text, ThemeProvider } from 'arc';
import { dark } from '@arc/core/dist/theme/token';

export default function Header() {
    return (
        <ThemeProvider theme={dark}>
            <header>
                <Flex alignItems="center" gap={4} px={6} py={3} bg="surface.foreground">
                    <img src="./assets/mark43-logo-dark-mode.svg" alt="Mark43 Logo" style={{ height: '40px' }} />
                    <div style={{ flex: 1 }}>
                        <Text variant="headingMd" color="text.primary">
                            Training Data Extractor
                        </Text>
                    </div>
                    <Text variant="caption" color="text.secondary">v0.1.0</Text>
                </Flex>
            </header>
        </ThemeProvider>
    );
}
