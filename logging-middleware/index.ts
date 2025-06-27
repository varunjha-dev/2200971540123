interface LogPayload {
  stack: string;
  level: string;
  package: string;  
  message: string;
}

async function Log(stack: string, level: string, package: string, message: string): Promise<void> {
  const payload: LogPayload = { stack, level, package, message };
  try {
    const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to log');
    const data = await response.json();
    console.log('Log created:', data);
  } catch (err: any) {
    console.error('Logging error:', err.message);
    Log('backend', 'error', 'handler', `received ${typeof message}, expected string`);
  }
}

export default Log;