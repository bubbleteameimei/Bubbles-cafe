// Lazy require to avoid type dependences during tsc when not installed
let sdk: any = null;
export function startOtel(serviceName = 'bubbles-cafe') {
  try {
    if (sdk) return sdk;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
    const { Resource } = require('@opentelemetry/resources');
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
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

