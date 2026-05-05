const START_ID = 10001;

export function createIdGenerator(startId: number = START_ID) {
    let current = startId;
    return () => String(current++);
}
