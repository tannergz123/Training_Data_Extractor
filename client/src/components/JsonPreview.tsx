import { useState } from 'react';
import { Button, Card, CardBody, Flex, Text, VStack } from 'arc';
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
        <Card>
            <CardBody>
                <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Flex alignItems="center" gap={2} flexWrap="wrap">
                        <Text fontWeight="bold">{title}</Text>
                        <Text color="secondary" variant="caption">
                            ({data.length} {data.length === 1 ? 'entry' : 'entries'})
                        </Text>
                        {note && (
                            <Text color="secondary" variant="caption">{note}</Text>
                        )}
                    </Flex>
                    <Flex gap={2}>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? 'Collapse' : 'Preview'}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadJson(data, filename)}
                        >
                            Download
                        </Button>
                    </Flex>
                </Flex>
                {expanded && (
                    <VStack mt={3} p={3} bg="surface.secondary" borderRadius="md" align="stretch" maxH="400px" overflow="auto">
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', font: 'var(--arc-fontSizes-xs) var(--arc-fonts-mono, monospace)' }}>
                            {preview}
                        </pre>
                    </VStack>
                )}
            </CardBody>
        </Card>
    );
}
