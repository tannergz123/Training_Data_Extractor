import { useState } from 'react';
import { Button, Card, CardBody, Flex, FormControl, Input, Text, VStack } from 'arc';

interface LoginFormProps {
    onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                onLogin();
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Login failed');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Flex justify="center" align="center" style={{ minHeight: '60vh' }}>
            <Card style={{ width: '100%', maxWidth: '400px' }}>
                <CardBody>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            <Text variant="headingMd">Sign In</Text>

                            {error && (
                                <Text color="negative" variant="bodyMd">{error}</Text>
                            )}

                            <FormControl label="Username">
                                <Input
                                    value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                    autoFocus
                                />
                            </FormControl>

                            <FormControl label="Password">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                            </FormControl>

                            <Button
                                type="submit"
                                variant="solid"
                                isDisabled={!username || !password || loading}
                                isLoading={loading}
                                style={{ width: '100%' }}
                            >
                                Sign In
                            </Button>
                        </VStack>
                    </form>
                </CardBody>
            </Card>
        </Flex>
    );
}
