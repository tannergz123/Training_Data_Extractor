import { useState } from 'react';
import { Button, Card, CardBody, Flex, Text } from 'arc';
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
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--arc-colors-surface-secondary)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        maxHeight: '400px',
                    }}>
                        <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'var(--arc-fonts-mono, monospace)', whiteSpace: 'pre-wrap' }}>
                            {preview}
                        </pre>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
