/** Minimal agent abstraction shared by the planning pipeline. */
export interface AgentContext {
  log: (message: string) => void;
}

export interface Agent<Input, Output> {
  readonly name: string;
  run(input: Input, ctx: AgentContext): Promise<Output>;
}

export const consoleContext: AgentContext = {
  log: (message: string) => {
    console.log(`  ${message}`);
  },
};
