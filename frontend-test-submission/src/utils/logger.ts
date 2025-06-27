interface LogPayload {
  stack: string;
  level: string;
  pkg: string; // Changed from 'package' to 'pkg' not able to compile
  message: string;
}

export async function Log(stack: string, level: string, pkg: string, message: string): Promise<void> {
  const payload: LogPayload = { stack, level, pkg, message }; // Updated 'package' to 'pkg'
  try {
    const response = await fetch('http://20.244.56.144/evaluation-service/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to log');
    const data = await response.json();
  } catch (err: any) {
    Log('backend', 'error', 'handler', `received ${typeof message}, expected string`);
  }
}