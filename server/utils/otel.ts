import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | null = null;

export function startOtel(serviceName = 'bubbles-cafe') {
  try {
    if (sdk) return sdk;
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
    sdk = new NodeSDK({
      resource: new Resource({ 'service.name': serviceName }),
      traceExporter: new OTLPTraceExporter({}),
      instrumentations: [getNodeAutoInstrumentations()],
    });
    sdk.start();
  } catch {}
  return sdk;
}

export async function stopOtel() {
  try { await sdk?.shutdown(); } catch {}
  sdk = null;
}

