import { useState } from 'react';
import { Box, Button, Flex, Text } from 'arc';
import { downloadJson } from '../utils/download';

type JsonPreviewPropsT = {
    title: string;
    filename: string;
    data: unknown[];
    note?: string;
};

export function JsonPreview({ title, filename, data, note }: JsonPreviewPropsT) {
    const [expanded, setExpanded] = useState(false);
    const preview = JSON.stringify(data, null, 2);

    return (
        // @ts-expect-error arc Box type union too complex for border + borderColor combo
        <Box border="1px solid" borderColor="border.default" borderRadius="md" mb={3}>
            <Flex
                p={3}
                alignItems="center"
                justifyContent="space-between"
                bg="surface.secondary"
                borderBottom="1px solid"
                borderColor="border.default"
                flexWrap="wrap"
                gap={2}
            >
                <Flex alignItems="center" gap={2} flexWrap="wrap">
                    <Text fontWeight="bold">{title}</Text>
                    <Text color="secondary">
                        ({data.length} {data.length === 1 ? 'entry' : 'entries'})
                    </Text>
                    {note && (
                        <Text color="secondary" fontSize="sm">
                            {note}
                        </Text>
                    )}
                </Flex>
                <Flex gap={2}>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Collapse' : 'Preview'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => downloadJson(data, filename)}
                    >
                        Download {filename}
                    </Button>
                </Flex>
            </Flex>
            {expanded && (
                <Box p={3} overflow="auto" maxHeight="400px">
                    <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {preview}
                    </pre>
                </Box>
            )}
        </Box>
    );
}
